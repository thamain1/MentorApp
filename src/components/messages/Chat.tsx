import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, MoreVertical, Flag, ArrowLeft, Megaphone } from 'lucide-react';
import { Avatar } from '../ui';
import { formatTime, formatDate } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface Message {
  id: string;
  match_id: string | null;
  conversation_id?: string | null;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
  isOwn: boolean;
}

interface ParticipantProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
}

interface ConversationData {
  id: string;
  type: string;
  title: string | null;
}

export function Chat() {
  const { matchId, conversationId } = useParams<{ matchId?: string; conversationId?: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [participant, setParticipant] = useState<ParticipantProfile | null>(null);
  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchChatData = useCallback(async () => {
    if (!user || !profile) return;
    setLoading(true);

    if (conversationId) {
      // Fetch the conversation
      const { data: conv } = await supabase
        .from('conversations')
        .select('id, type, title')
        .eq('id', conversationId)
        .maybeSingle();

      if (conv) {
        setConversation(conv as ConversationData);
      }

      // Fetch other participant (for direct conversations)
      if (conv?.type === 'direct') {
        const { data: otherParticipants } = await supabase
          .from('conversation_participants')
          .select('profile_id')
          .eq('conversation_id', conversationId)
          .neq('profile_id', profile.id);

        const otherProfileId = otherParticipants?.[0]?.profile_id;
        if (otherProfileId) {
          const { data: p } = await supabase
            .from('profiles')
            .select('id, user_id, first_name, last_name, avatar_url')
            .eq('id', otherProfileId)
            .maybeSingle();
          if (p) setParticipant(p as ParticipantProfile);
        }
      }

      // Fetch messages
      const { data: msgs } = await supabase
        .from('messages')
        .select('id, match_id, conversation_id, sender_id, content, read_at, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (msgs) {
        setMessages(msgs.map(m => ({ ...m, isOwn: m.sender_id === user.id })));
      }

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .is('read_at', null);
    } else if (matchId) {
      // Fetch the match to determine the other person
      const { data: match } = await supabase
        .from('matches')
        .select('id, mentor_id, mentee_id')
        .eq('id', matchId)
        .maybeSingle();

      if (match) {
        const otherProfileId = match.mentor_id === profile.id ? match.mentee_id : match.mentor_id;
        const { data: otherProfile } = await supabase
          .from('profiles')
          .select('id, user_id, first_name, last_name, avatar_url')
          .eq('id', otherProfileId)
          .maybeSingle();
        if (otherProfile) {
          setParticipant(otherProfile as ParticipantProfile);
        }
      }

      // Fetch messages for this match
      const { data: msgs } = await supabase
        .from('messages')
        .select('id, match_id, conversation_id, sender_id, content, read_at, created_at')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });

      if (msgs) {
        setMessages(msgs.map(m => ({ ...m, isOwn: m.sender_id === user.id })));
      }

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('match_id', matchId)
        .neq('sender_id', user.id)
        .is('read_at', null);
    }

    setLoading(false);
  }, [user, profile, matchId, conversationId]);

  useEffect(() => {
    fetchChatData();
  }, [fetchChatData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = [];
  let currentDate = '';

  messages.forEach((message) => {
    const messageDate = new Date(message.created_at).toDateString();
    if (messageDate !== currentDate) {
      currentDate = messageDate;
      groupedMessages.push({ date: message.created_at, messages: [message] });
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(message);
    }
  });

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return formatDate(dateStr);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;
    const content = newMessage.trim();
    setNewMessage('');

    if (conversationId) {
      const { data: inserted, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
        })
        .select('id, match_id, conversation_id, sender_id, content, read_at, created_at')
        .single();

      if (!error && inserted) {
        setMessages(prev => [...prev, { ...inserted, isOwn: true }]);
      }
    } else if (matchId) {
      const { data: inserted, error } = await supabase
        .from('messages')
        .insert({
          match_id: matchId,
          sender_id: user.id,
          content,
        })
        .select('id, match_id, conversation_id, sender_id, content, read_at, created_at')
        .single();

      if (!error && inserted) {
        setMessages(prev => [...prev, { ...inserted, isOwn: true }]);
      }
    }
  };

  const isAnnouncement = conversation?.type === 'announcement';
  const isReadOnly = isAnnouncement && profile?.role !== 'admin';

  const headerTitle = isAnnouncement
    ? (conversation?.title ?? 'Announcements')
    : participant
    ? `${participant.first_name} ${participant.last_name}`
    : '';

  if (loading) {
    return (
      <div className="app-container flex flex-col h-screen bg-iron-50">
        <header className="sticky top-0 z-40 px-4 py-3 flex items-center gap-3 bg-white border-b border-iron-100 safe-top">
          <button
            onClick={() => navigate('/messages')}
            className="p-2 -ml-2 rounded-xl hover:bg-iron-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-iron-700" />
          </button>
          <div className="w-9 h-9 rounded-full bg-iron-200 animate-pulse" />
          <div className="flex-1 space-y-1">
            <div className="h-4 bg-iron-200 rounded w-32 animate-pulse" />
            <div className="h-3 bg-iron-100 rounded w-16 animate-pulse" />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
              <div className="h-10 w-48 rounded-2xl bg-iron-200 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!participant && !conversation) {
    return (
      <div className="app-container flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <p className="text-iron-500">Conversation not found</p>
        <button
          onClick={() => navigate('/messages')}
          className="mt-4 text-brand-500 font-medium"
        >
          Back to messages
        </button>
      </div>
    );
  }

  return (
    <div className="app-container flex flex-col h-screen bg-iron-50">
      {/* Header */}
      <header className="sticky top-0 z-40 px-4 py-3 flex items-center justify-between bg-white border-b border-iron-100 safe-top">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/messages')}
            className="p-2 -ml-2 rounded-xl hover:bg-iron-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-iron-700" />
          </button>
          {isAnnouncement ? (
            <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-amber-600" />
            </div>
          ) : (
            <Avatar
              src={participant?.avatar_url ?? null}
              name={headerTitle}
              size="md"
            />
          )}
          <div>
            <h1 className="font-semibold text-iron-900">{headerTitle}</h1>
            {!isAnnouncement && <p className="text-xs text-iron-500">Active now</p>}
          </div>
        </div>

        {!isAnnouncement && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-xl hover:bg-iron-100 transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-iron-700" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-iron-100 py-1 z-50">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      // Navigate to report page
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-iron-700 hover:bg-iron-50"
                  >
                    <Flag className="w-4 h-4" />
                    Report concern
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {groupedMessages.map((group, groupIndex) => (
          <div key={groupIndex}>
            {/* Date divider */}
            <div className="flex items-center justify-center my-4">
              <span className="px-3 py-1 bg-iron-100 text-iron-500 text-xs font-medium rounded-full">
                {getDateLabel(group.date)}
              </span>
            </div>

            {/* Messages for this date */}
            {group.messages.map((message) => (
              <div
                key={message.id}
                className={`flex mb-3 ${message.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                    message.isOwn
                      ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-br-md'
                      : isAnnouncement
                      ? 'bg-amber-100 text-iron-900 border border-amber-200 rounded-bl-md'
                      : 'bg-white text-iron-900 border border-iron-100 rounded-bl-md'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.isOwn ? 'text-brand-200' : 'text-iron-400'
                    }`}
                  >
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 p-4 bg-white border-t border-iron-100 safe-bottom">
        {isReadOnly ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 px-4 py-3 bg-iron-100 rounded-xl text-iron-400 text-sm cursor-not-allowed select-none">
              Only admins can post announcements
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 bg-iron-50 rounded-xl border-0 focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim()}
              className="p-3 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
