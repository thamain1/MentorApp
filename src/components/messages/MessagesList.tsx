import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Megaphone, PenSquare } from 'lucide-react';
import { AppShell } from '../layout';
import { Header } from '../layout';
import { Avatar } from '../ui';
import { formatRelativeTime } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { NewConversationModal } from './NewConversationModal';

interface ParticipantProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
}

interface ConversationItem {
  id: string;
  type: 'match' | 'direct' | 'announcement';
  matchId?: string;
  conversationId?: string;
  title: string;
  participant?: ParticipantProfile;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export function MessagesList() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewConvo, setShowNewConvo] = useState(false);

  const fetchConversations = useCallback(async () => {
    if (!user || !profile) return;
    setLoading(true);

    const results: ConversationItem[] = [];

    // 1. Fetch the Announcements conversation
    const { data: announcementConvs } = await supabase
      .from('conversations')
      .select('id, type, title')
      .eq('type', 'announcement');

    for (const conv of announcementConvs ?? []) {
      const { data: lastMsgs } = await supabase
        .from('messages')
        .select('content, created_at, sender_id, read_at')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1);

      const lastMsg = lastMsgs?.[0];
      let unreadCount = 0;
      if (lastMsg) {
        const { count } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .neq('sender_id', user.id)
          .is('read_at', null);
        unreadCount = count ?? 0;
      }

      results.push({
        id: conv.id,
        type: 'announcement',
        conversationId: conv.id,
        title: conv.title ?? 'Announcements',
        lastMessage: lastMsg?.content ?? '',
        lastMessageAt: lastMsg?.created_at ?? '',
        unreadCount,
      });
    }

    // 2. Fetch match-based conversations
    const { data: matches } = await supabase
      .from('matches')
      .select('id, mentor_id, mentee_id, status')
      .or(`mentor_id.eq.${profile.id},mentee_id.eq.${profile.id}`)
      .eq('status', 'active');

    if (matches && matches.length > 0) {
      const matchIds = matches.map(m => m.id);
      const otherProfileIds = matches.map(m =>
        m.mentor_id === profile.id ? m.mentee_id : m.mentor_id
      );

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, user_id, first_name, last_name, avatar_url')
        .in('id', otherProfileIds);

      const profileMap = new Map<string, ParticipantProfile>();
      (profiles ?? []).forEach(p => profileMap.set(p.id, p as ParticipantProfile));

      const { data: allMessages } = await supabase
        .from('messages')
        .select('id, match_id, sender_id, content, read_at, created_at')
        .in('match_id', matchIds)
        .order('created_at', { ascending: false });

      const lastMessageMap = new Map<string, { content: string; created_at: string }>();
      const unreadCountMap = new Map<string, number>();

      (allMessages ?? []).forEach(msg => {
        if (msg.match_id && !lastMessageMap.has(msg.match_id)) {
          lastMessageMap.set(msg.match_id, { content: msg.content, created_at: msg.created_at });
        }
        if (msg.match_id && msg.sender_id !== user.id && !msg.read_at) {
          unreadCountMap.set(msg.match_id, (unreadCountMap.get(msg.match_id) ?? 0) + 1);
        }
      });

      for (const match of matches) {
        const otherProfileId = match.mentor_id === profile.id ? match.mentee_id : match.mentor_id;
        const participant = profileMap.get(otherProfileId);
        if (!participant) continue;
        const lastMsg = lastMessageMap.get(match.id);
        results.push({
          id: match.id,
          type: 'match',
          matchId: match.id,
          title: `${participant.first_name} ${participant.last_name}`,
          participant,
          lastMessage: lastMsg?.content ?? '',
          lastMessageAt: lastMsg?.created_at ?? '',
          unreadCount: unreadCountMap.get(match.id) ?? 0,
        });
      }
    }

    // 3. Fetch direct conversations (non-match)
    const { data: participantRows } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('profile_id', profile.id);

    if (participantRows && participantRows.length > 0) {
      const convIds = participantRows.map(r => r.conversation_id);

      const { data: directConvs } = await supabase
        .from('conversations')
        .select('id, type, title')
        .in('id', convIds)
        .eq('type', 'direct');

      for (const conv of directConvs ?? []) {
        // Fetch the other participant
        const { data: otherParticipants } = await supabase
          .from('conversation_participants')
          .select('profile_id')
          .eq('conversation_id', conv.id)
          .neq('profile_id', profile.id);

        const otherProfileId = otherParticipants?.[0]?.profile_id;
        let participant: ParticipantProfile | undefined;
        if (otherProfileId) {
          const { data: p } = await supabase
            .from('profiles')
            .select('id, user_id, first_name, last_name, avatar_url')
            .eq('id', otherProfileId)
            .maybeSingle();
          if (p) participant = p as ParticipantProfile;
        }

        const { data: lastMsgs } = await supabase
          .from('messages')
          .select('content, created_at, sender_id, read_at')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1);

        const lastMsg = lastMsgs?.[0];
        const { count: unread } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .neq('sender_id', user.id)
          .is('read_at', null);

        results.push({
          id: conv.id,
          type: 'direct',
          conversationId: conv.id,
          title: participant ? `${participant.first_name} ${participant.last_name}` : 'Direct Message',
          participant,
          lastMessage: lastMsg?.content ?? '',
          lastMessageAt: lastMsg?.created_at ?? '',
          unreadCount: unread ?? 0,
        });
      }
    }

    // Sort: announcements first, then by lastMessageAt desc
    const announcements = results.filter(c => c.type === 'announcement');
    const others = results
      .filter(c => c.type !== 'announcement')
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

    setConversations([...announcements, ...others]);
    setLoading(false);
  }, [user, profile]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleConversationCreated = (conversationId: string) => {
    setShowNewConvo(false);
    navigate(`/messages/conversation/${conversationId}`);
  };

  const navigateToConversation = (item: ConversationItem) => {
    if (item.type === 'match' && item.matchId) {
      navigate(`/messages/${item.matchId}`);
    } else if (item.conversationId) {
      navigate(`/messages/conversation/${item.conversationId}`);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <Header title="Messages" showNotifications />
        <div className="p-4 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-iron-100 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-iron-200 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-iron-200 rounded w-1/3" />
                <div className="h-3 bg-iron-100 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="sticky top-0 z-40 bg-white border-b border-iron-100 safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-iron-900">Messages</h1>
          <button
            onClick={() => setShowNewConvo(true)}
            className="p-2 rounded-xl hover:bg-iron-100 transition-colors"
            aria-label="New message"
          >
            <PenSquare className="w-5 h-5 text-iron-700" />
          </button>
        </div>
      </div>

      <div className="p-4">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
            <div className="w-16 h-16 bg-iron-100 rounded-2xl flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-iron-400" />
            </div>
            <h2 className="text-lg font-semibold text-iron-900 mb-2">No messages yet</h2>
            <p className="text-iron-500 max-w-xs">
              Tap the compose button to start a conversation.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => {
              const isAnnouncement = conversation.type === 'announcement';

              return (
                <button
                  key={conversation.id}
                  onClick={() => navigateToConversation(conversation)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border hover:bg-iron-50 transition-colors text-left ${
                    isAnnouncement
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-white border-iron-100'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    {isAnnouncement ? (
                      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                        <Megaphone className="w-6 h-6 text-amber-600" />
                      </div>
                    ) : (
                      <Avatar
                        src={conversation.participant?.avatar_url ?? null}
                        name={conversation.title}
                        size="lg"
                      />
                    )}
                    {conversation.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-semibold ${conversation.unreadCount > 0 ? 'text-iron-900' : 'text-iron-700'}`}>
                        {conversation.title}
                      </h3>
                      {conversation.lastMessageAt && (
                        <span className="text-xs text-iron-400">
                          {formatRelativeTime(conversation.lastMessageAt)}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'text-iron-700 font-medium' : 'text-iron-500'}`}>
                      {conversation.lastMessage || (isAnnouncement ? 'Program announcements' : 'No messages yet')}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <NewConversationModal
        isOpen={showNewConvo}
        onClose={() => setShowNewConvo(false)}
        onCreated={handleConversationCreated}
        isAdmin={profile?.role === 'admin'}
      />
    </AppShell>
  );
}
