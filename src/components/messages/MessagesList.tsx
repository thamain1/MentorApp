import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { AppShell } from '../layout';
import { Header } from '../layout';
import { Avatar } from '../ui';
import { formatRelativeTime } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface ParticipantProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
}

interface Conversation {
  id: string;
  matchId: string;
  participant: ParticipantProfile;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export function MessagesList() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!user || !profile) return;
    setLoading(true);

    // 1. Get all active matches for this profile
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('id, mentor_id, mentee_id, status')
      .or(`mentor_id.eq.${profile.id},mentee_id.eq.${profile.id}`)
      .eq('status', 'active');

    if (matchesError || !matches || matches.length === 0) {
      setLoading(false);
      return;
    }

    const matchIds = matches.map(m => m.id);

    // 2. Determine the other person's profile id for each match
    const otherProfileIds = matches.map(m =>
      m.mentor_id === profile.id ? m.mentee_id : m.mentor_id
    );

    // 3. Fetch other participants' profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, user_id, first_name, last_name, avatar_url')
      .in('id', otherProfileIds);

    const profileMap = new Map<string, ParticipantProfile>();
    (profiles ?? []).forEach(p => profileMap.set(p.id, p as ParticipantProfile));

    // 4. Fetch last message per match
    const { data: allMessages } = await supabase
      .from('messages')
      .select('id, match_id, sender_id, content, read_at, created_at')
      .in('match_id', matchIds)
      .order('created_at', { ascending: false });

    const lastMessageMap = new Map<string, { content: string; created_at: string }>();
    const unreadCountMap = new Map<string, number>();

    (allMessages ?? []).forEach(msg => {
      if (!lastMessageMap.has(msg.match_id)) {
        lastMessageMap.set(msg.match_id, { content: msg.content, created_at: msg.created_at });
      }
      if (msg.sender_id !== user.id && !msg.read_at) {
        unreadCountMap.set(msg.match_id, (unreadCountMap.get(msg.match_id) ?? 0) + 1);
      }
    });

    // 5. Build conversations list
    const convos: Conversation[] = matches
      .map(match => {
        const otherProfileId = match.mentor_id === profile.id ? match.mentee_id : match.mentor_id;
        const participant = profileMap.get(otherProfileId);
        if (!participant) return null;
        const lastMsg = lastMessageMap.get(match.id);
        return {
          id: match.id,
          matchId: match.id,
          participant,
          lastMessage: lastMsg?.content ?? '',
          lastMessageAt: lastMsg?.created_at ?? '',
          unreadCount: unreadCountMap.get(match.id) ?? 0,
        };
      })
      .filter((c): c is Conversation => c !== null)
      .sort((a, b) =>
        new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );

    setConversations(convos);
    setLoading(false);
  }, [user, profile]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

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

  if (conversations.length === 0) {
    return (
      <AppShell>
        <Header title="Messages" showNotifications />
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
          <div className="w-16 h-16 bg-iron-100 rounded-2xl flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-iron-400" />
          </div>
          <h2 className="text-lg font-semibold text-iron-900 mb-2">No messages yet</h2>
          <p className="text-iron-500 max-w-xs">
            Once you're matched with a mentor or mentee, your conversations will appear here.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Header title="Messages" showNotifications />
      <div className="p-4">
        <div className="space-y-2">
          {conversations.map((conversation) => {
            const participantName = `${conversation.participant.first_name} ${conversation.participant.last_name}`;

            return (
              <button
                key={conversation.id}
                onClick={() => navigate(`/messages/${conversation.matchId}`)}
                className="w-full flex items-center gap-3 p-3 bg-white rounded-xl border border-iron-100 hover:bg-iron-50 transition-colors text-left"
              >
                <div className="relative">
                  <Avatar
                    src={conversation.participant.avatar_url}
                    name={participantName}
                    size="lg"
                  />
                  {conversation.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-semibold text-iron-900 ${conversation.unreadCount > 0 ? 'text-iron-900' : 'text-iron-700'}`}>
                      {participantName}
                    </h3>
                    {conversation.lastMessageAt && (
                      <span className="text-xs text-iron-400">
                        {formatRelativeTime(conversation.lastMessageAt)}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'text-iron-700 font-medium' : 'text-iron-500'}`}>
                    {conversation.lastMessage}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
