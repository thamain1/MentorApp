import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Video, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { AppShell, Header } from '../layout';
import { Avatar, Card, Badge } from '../ui';
import { formatDate, formatTime, formatRelativeTime } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import type { Session, Profile, Database } from '../../types';
type SessionRow = Database['public']['Tables']['sessions']['Row'];

interface SessionWithParticipant extends Session {
  participant: Pick<Profile, 'id' | 'first_name' | 'last_name' | 'avatar_url'>;
  matchId: string;
}

export function SessionsList() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [sessions, setSessions] = useState<SessionWithParticipant[]>([]);
  const [loading, setLoading] = useState(true);

  const role = profile?.role ?? 'mentee';
  const viewAs: 'mentor' | 'mentee' = role === 'mentee' ? 'mentee' : 'mentor';

  const fetchSessions = useCallback(async () => {
    if (!user || !profile) return;

    const { data: matchData } = await supabase
      .from('matches')
      .select('id, mentor_id, mentee_id, status')
      .or(`mentor_id.eq.${profile.id},mentee_id.eq.${profile.id}`)
      .eq('status', 'active');

    if (!matchData || matchData.length === 0) {
      setSessions([]);
      setLoading(false);
      return;
    }

    const matchIds = matchData.map(m => m.id);
    const { data: sessionData } = await supabase
      .from('sessions')
      .select('*')
      .in('match_id', matchIds)
      .order('scheduled_at', { ascending: false });

    if (!sessionData) {
      setSessions([]);
      setLoading(false);
      return;
    }

    const participantProfileIds = matchData.map(m =>
      viewAs === 'mentor' ? m.mentee_id : m.mentor_id
    );
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, avatar_url')
      .in('id', participantProfileIds);

    const matchMap = new Map(matchData.map(m => [m.id, m]));
    const profileMap = new Map((profileData ?? []).map(p => [p.id, p]));

    const enriched: SessionWithParticipant[] = (sessionData as SessionRow[]).map(s => {
      const match = matchMap.get(s.match_id)!;
      const participantId = viewAs === 'mentor' ? match.mentee_id : match.mentor_id;
      const participant = profileMap.get(participantId) ?? {
        id: participantId,
        first_name: 'Unknown',
        last_name: '',
        avatar_url: null,
      };
      return { ...s, participant, matchId: s.match_id };
    });

    setSessions(enriched);
    setLoading(false);
  }, [user, profile, viewAs]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const now = new Date();
  const upcomingSessions = sessions
    .filter(s => s.status === 'scheduled' && new Date(s.scheduled_at) > now)
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  const needsAttention = sessions.filter(s => {
    if (s.status !== 'completed') return false;
    if (viewAs === 'mentor' && !s.mentor_notes) return true;
    if (viewAs === 'mentee' && !s.mentee_notes) return true;
    return false;
  });

  const pastSessions = sessions
    .filter(s => s.status === 'completed')
    .filter(s => {
      if (viewAs === 'mentor' && !s.mentor_notes) return false;
      if (viewAs === 'mentee' && !s.mentee_notes) return false;
      return true;
    })
    .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());

  const getNextSessionLabel = (date: string) => {
    const sessionDate = new Date(date);
    const diffHours = (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (diffHours < 24) return 'Today';
    if (diffHours < 48) return 'Tomorrow';
    return formatDate(date);
  };

  return (
    <AppShell>
      <Header title="Sessions" showNotifications />
      <div className="p-4 space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-brand-600">{upcomingSessions.length}</p>
            <p className="text-xs text-iron-500">Upcoming</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-600">{needsAttention.length}</p>
            <p className="text-xs text-iron-500">Need Notes</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-iron-600">{pastSessions.length}</p>
            <p className="text-xs text-iron-500">Completed</p>
          </Card>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-white rounded-xl border border-iron-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {needsAttention.length > 0 && (
              <section>
                <h3 className="text-sm font-medium text-iron-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  Needs Your Notes
                </h3>
                <div className="space-y-2">
                  {needsAttention.map(s => (
                    <SessionCard
                      key={s.id}
                      session={s}
                      viewAs={viewAs}
                      onClick={() => navigate(`/sessions/${s.matchId}`, { state: { sessionId: s.id, viewAs } })}
                      variant="attention"
                    />
                  ))}
                </div>
              </section>
            )}

            <section>
              <h3 className="text-sm font-medium text-iron-500 uppercase tracking-wide mb-3">
                Upcoming Sessions ({upcomingSessions.length})
              </h3>
              {upcomingSessions.length === 0 ? (
                <Card className="p-6 text-center">
                  <Calendar className="w-10 h-10 text-iron-300 mx-auto mb-2" />
                  <p className="text-iron-600 font-medium mb-1">No upcoming sessions</p>
                  <p className="text-sm text-iron-500">
                    {viewAs === 'mentor' ? 'Schedule sessions with your mentees' : 'Request a session with your mentor'}
                  </p>
                </Card>
              ) : (
                <div className="space-y-2">
                  {upcomingSessions.map(s => (
                    <SessionCard
                      key={s.id}
                      session={s}
                      viewAs={viewAs}
                      onClick={() => navigate(`/sessions/${s.matchId}`, { state: { sessionId: s.id, viewAs } })}
                      variant="upcoming"
                      dateLabel={getNextSessionLabel(s.scheduled_at)}
                    />
                  ))}
                </div>
              )}
            </section>

            {pastSessions.length > 0 && (
              <section>
                <h3 className="text-sm font-medium text-iron-500 uppercase tracking-wide mb-3">Past Sessions</h3>
                <div className="space-y-2">
                  {pastSessions.slice(0, 5).map(s => (
                    <SessionCard
                      key={s.id}
                      session={s}
                      viewAs={viewAs}
                      onClick={() => navigate(`/sessions/${s.matchId}`, { state: { sessionId: s.id, viewAs } })}
                      variant="past"
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}

interface SessionCardProps {
  session: SessionWithParticipant;
  viewAs: 'mentor' | 'mentee';
  onClick: () => void;
  variant: 'upcoming' | 'past' | 'attention';
  dateLabel?: string;
}

function SessionCard({ session, viewAs, onClick, variant, dateLabel }: SessionCardProps) {
  const participantName = `${session.participant.first_name} ${session.participant.last_name}`;
  const roleLabel = viewAs === 'mentor' ? 'Mentee' : 'Mentor';

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-colors ${
        variant === 'attention'
          ? 'bg-amber-50 border-amber-200 hover:bg-amber-100'
          : 'bg-white border-iron-100 hover:bg-iron-50'
      }`}
    >
      <div className="flex items-center gap-3">
        <Avatar src={session.participant.avatar_url} name={participantName} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="font-semibold text-iron-900 truncate">{participantName}</h4>
            <Badge variant="default" className="text-xs">{roleLabel}</Badge>
          </div>
          <div className="flex items-center gap-3 text-sm text-iron-500">
            {variant === 'upcoming' && dateLabel && (
              <>
                <span className="font-medium text-brand-600">{dateLabel}</span>
                <span>{formatTime(session.scheduled_at)}</span>
              </>
            )}
            {variant === 'past' && <span>{formatRelativeTime(session.scheduled_at)}</span>}
            {variant === 'attention' && <span className="text-amber-600 font-medium">Add your notes</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {variant === 'upcoming' && <Video className="w-4 h-4 text-iron-400" />}
          {variant === 'past' && <CheckCircle className="w-5 h-5 text-green-500" />}
          {variant === 'attention' && <AlertCircle className="w-5 h-5 text-amber-500" />}
          <ChevronRight className="w-5 h-5 text-iron-400" />
        </div>
      </div>
    </button>
  );
}
