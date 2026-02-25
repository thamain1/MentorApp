import { useState, useEffect, useCallback } from 'react';
import { X, Search, Megaphone, MessageSquare } from 'lucide-react';
import { Avatar } from '../ui';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface UserResult {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  role: string;
  avatar_url: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (conversationId: string) => void;
  isAdmin: boolean;
}

export function NewConversationModal({ isOpen, onClose, onCreated, isAdmin }: Props) {
  const { profile } = useAuth();
  const [tab, setTab] = useState<'direct' | 'announcement'>('direct');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);
  const [openingMessage, setOpeningMessage] = useState('');
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTab('direct');
      setSearchQuery('');
      setSearchResults([]);
      setSelectedUser(null);
      setOpeningMessage('');
    }
  }, [isOpen]);

  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim() || !profile) {
      setSearchResults([]);
      return;
    }
    setSearching(true);

    const { data } = await supabase
      .from('profiles')
      .select('id, user_id, first_name, last_name, role, avatar_url')
      .neq('id', profile.id)
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
      .limit(10);

    setSearchResults((data ?? []) as UserResult[]);
    setSearching(false);
  }, [profile]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchUsers]);

  const handleCreate = async () => {
    if (!profile) return;
    setSaving(true);

    if (tab === 'announcement') {
      // Navigate to the existing Announcements conversation
      const { data: annConvs } = await supabase
        .from('conversations')
        .select('id')
        .eq('type', 'announcement')
        .limit(1);

      const convId = annConvs?.[0]?.id;
      if (convId) {
        setSaving(false);
        onCreated(convId);
      } else {
        setSaving(false);
        onClose();
      }
      return;
    }

    // Direct message
    if (!selectedUser) {
      setSaving(false);
      return;
    }

    // 1. Create conversation
    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .insert({ type: 'direct', created_by: profile.id })
      .select('id')
      .single();

    if (convError || !conv) {
      setSaving(false);
      return;
    }

    // 2. Add both participants
    const { error: partError } = await supabase
      .from('conversation_participants')
      .insert([
        { conversation_id: conv.id, profile_id: profile.id, added_by: profile.id },
        { conversation_id: conv.id, profile_id: selectedUser.id, added_by: profile.id },
      ]);

    if (partError) {
      setSaving(false);
      return;
    }

    // 3. Send opening message if provided
    if (openingMessage.trim()) {
      const { data: authUser } = await supabase.auth.getUser();
      if (authUser.user) {
        await supabase.from('messages').insert({
          conversation_id: conv.id,
          sender_id: authUser.user.id,
          content: openingMessage.trim(),
        });
      }
    }

    setSaving(false);
    onCreated(conv.id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-t-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-iron-100">
          <button
            onClick={onClose}
            className="text-brand-500 font-medium text-sm"
          >
            Cancel
          </button>
          <h2 className="font-semibold text-iron-900">New Message</h2>
          <div className="w-16" />
        </div>

        {/* Admin tab toggle */}
        {isAdmin && (
          <div className="flex p-3 gap-2 border-b border-iron-100">
            <button
              onClick={() => setTab('direct')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-colors ${
                tab === 'direct'
                  ? 'bg-brand-500 text-white'
                  : 'bg-iron-100 text-iron-600 hover:bg-iron-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Direct Message
            </button>
            <button
              onClick={() => setTab('announcement')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-colors ${
                tab === 'announcement'
                  ? 'bg-amber-500 text-white'
                  : 'bg-iron-100 text-iron-600 hover:bg-iron-200'
              }`}
            >
              <Megaphone className="w-4 h-4" />
              Announcement
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {tab === 'announcement' ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <Megaphone className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="font-semibold text-iron-900 mb-1">Announcements Channel</h3>
              <p className="text-sm text-iron-500 max-w-xs">
                Post a message visible to all members in the Announcements channel.
              </p>
            </div>
          ) : (
            <>
              {/* User search */}
              {!selectedUser ? (
                <div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-iron-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name..."
                      className="w-full pl-9 pr-4 py-3 bg-iron-50 rounded-xl border-0 focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors text-sm"
                      autoFocus
                    />
                  </div>

                  {searching && (
                    <p className="text-sm text-iron-400 text-center mt-4">Searching...</p>
                  )}

                  {!searching && searchResults.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {searchResults.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => setSelectedUser(u)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-iron-50 transition-colors text-left"
                        >
                          <Avatar
                            src={u.avatar_url}
                            name={`${u.first_name} ${u.last_name}`}
                            size="md"
                          />
                          <div>
                            <p className="font-medium text-iron-900 text-sm">
                              {u.first_name} {u.last_name}
                            </p>
                            <p className="text-xs text-iron-400 capitalize">{u.role}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {!searching && searchQuery && searchResults.length === 0 && (
                    <p className="text-sm text-iron-400 text-center mt-4">No users found</p>
                  )}
                </div>
              ) : (
                <div>
                  {/* Selected user chip */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-iron-500">To:</span>
                    <div className="flex items-center gap-2 bg-brand-100 text-brand-700 rounded-full px-3 py-1.5">
                      <span className="text-sm font-medium">
                        {selectedUser.first_name} {selectedUser.last_name}
                      </span>
                      <button
                        onClick={() => setSelectedUser(null)}
                        className="text-brand-500 hover:text-brand-700"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Opening message */}
                  <textarea
                    value={openingMessage}
                    onChange={(e) => setOpeningMessage(e.target.value)}
                    placeholder="Write a message... (optional)"
                    className="w-full px-4 py-3 bg-iron-50 rounded-xl border-0 focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors text-sm resize-none"
                    rows={4}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Action button */}
        <div className="p-4 border-t border-iron-100">
          <button
            onClick={handleCreate}
            disabled={saving || (tab === 'direct' && !selectedUser)}
            className={`w-full py-3 rounded-xl font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              tab === 'announcement'
                ? 'bg-amber-500 hover:bg-amber-600'
                : 'bg-brand-500 hover:bg-brand-600'
            }`}
          >
            {saving
              ? 'Opening...'
              : tab === 'announcement'
              ? 'Go to Announcements'
              : 'Start Conversation'}
          </button>
        </div>
      </div>
    </div>
  );
}
