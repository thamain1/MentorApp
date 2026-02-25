import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Video,
  Phone,
  MessageSquare,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Plus,
  Users,
} from 'lucide-react';
import { AppShell, Header } from '../layout';
import { Avatar, Button, Card, Badge } from '../ui';
import { formatDate, formatTime, formatRelativeTime } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { ScheduleSessionModal } from './ScheduleSessionModal';
import type { Profile, Database } from '../../types';

type SessionRow = Database['public']['Tables']['sessions']['Row'];

interface SessionWithParticipant extends SessionRow {
  participant: Pick<Profile, 'id' | 'first_name' | 'last_name' | 'avatar_url'> | null;
  matchId: string | null;
}

export function SessionsList() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [sessions, setSessions] = useState<SessionWithParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const role = profile?.role ?? 'mentee';
  const viewAs: 'mentor' | 'mentee' = role === 'mentee' ? 'mentee' : 'mentor';
  const canSchedule = role === 'mentor' || role === 'admin';

  const fetchSessions = useCallback(async () => {
    if (!user || !profile) return;

    // 1. Fetch active matches for 1:1 sessions
    const { data: matchData } = await supabase
      .from('matches')
      .select('id, mentor_id, mentee_id, status')
      .or(`mentor_id.eq.${profile.id},mentee_id.eq.${profile.id}`)
      .eq('status', 'active');

    const matchIds = (matchData ?? []).map(m => m.id);

    // 2. Fetch sessions for those matches
    let matchSessions: SessionRow[] = [];
    if (matchIds.length > 0) {
      const { data: sessionData } = await supabase
        .from('sessions')
        .select('*')
        .in('match_id', matchIds)
        .order('scheduled_at', { ascending: false });
      matchSessions = (sessionData as SessionRow[]) ?? [];
    }

    // 3. Fetch group/additional sessions where user is a participant
    const { data: participantRows } = await supabase
      .from('session_participants')
      .select('session_id')
      .eq('profile_id', profile.id);

    const participantSessionIds = (participantRows ?? []).map(
      (r: { session_id: string }) => r.session_id
    );
    const matchSessionIdSet = new Set(matchSessions.map(s => s.id));
    const additionalIds = participantSessionIds.filter(id => !matchSessionIdSet.has(id));

    let groupSessions: SessionRow[] = [];
    if (additionalIds.length > 0) {
      const { data: groupData } = await supabase
        .from('sessions')
        .select('*')
        .in('id', additionalIds)
        .order('scheduled_at', { ascending: false });
      groupSessions = (groupData as SessionRow[]) ?? [];
    }

    // 4. Enrich match sessions with participant profiles
    const matchMap = new Map((matchData ?? []).map(m => [m.id, m]));
    const participantProfileIds = (matchData ?? []).map(m =>
      viewAs === 'mentor' ? m.mentee_id : m.mentor_id
    );

    let profileMap = new Map<
      string,
      Pick<Profile, 'id' | 'first_name' | 'last_name' | 'avatar_url'>
    >();
    if (participantProfileIds.length > 0) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .in('id', participantProfileIds);
      profileMap = new Map((profileData ?? []).map(p => [p.id, p]));
    }

    const enrichedMatch: SessionWithParticipant[] = [];
    for (const s of matchSessions) {
      if (!s.match_id) continue;
      const match = matchMap.get(s.match_id);
      if (!match) continue;
      const participantId = viewAs === 'mentor' ? match.mentee_id : match.mentor_id;
      const participant = profileMap.get(participantId) ?? null;
      enrichedMatch.push({ ...s, participant, matchId: s.match_id });
    }

    const enrichedGroup: SessionWithParticipant[] = groupSessions.map(s => ({
      ...s,
      participant: null,
      matchId: null,
    }));

    setSessions([...enrichedMatch, ...enrichedGroup]);
    setLoading(false);
  }, [user, profile, viewAs]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

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
        {/* Schedule button for mentors/admins */}
        {canSchedule && (
          <Button className="w-full" onClick={() => setShowScheduleModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Schedule Session
          </Button>
        )}

        {/* Stats */}
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
              <div
                key={i}
                className="h-16 bg-white rounded-xl border border-iron-100 animate-pulse"
              />
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
                      onClick={() => navigate(`/sessions/view/${s.id}`)}
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
                    {viewAs === 'mentor'
                      ? 'Schedule sessions with your mentees'
                      : 'Request a session with your mentor'}
                  </p>
                </Card>
              ) : (
                <div className="space-y-2">
                  {upcomingSessions.map(s => (
                    <SessionCard
                      key={s.id}
                      session={s}
                      viewAs={viewAs}
                      onClick={() => navigate(`/sessions/view/${s.id}`)}
                      variant="upcoming"
                      dateLabel={getNextSessionLabel(s.scheduled_at)}
                    />
                  ))}
                </div>
              )}
            </section>

            {pastSessions.length > 0 && (
              <section>
                <h3 className="text-sm font-medium text-iron-500 uppercase tracking-wide mb-3">
                  Past Sessions
                </h3>
                <div className="space-y-2">
                  {pastSessions.slice(0, 5).map(s => (
                    <SessionCard
                      key={s.id}
                      session={s}
                      viewAs={viewAs}
                      onClick={() => navigate(`/sessions/view/${s.id}`)}
                      variant="past"
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* Schedule Session Modal */}
      {showScheduleModal && (
        <ScheduleSessionModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          onScheduled={sessionId => {
            setShowScheduleModal(false);
            navigate(`/sessions/view/${sessionId}`);
          }}
        />
      )}
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
  const isGroup = session.session_type === 'group';
  const participantName = session.participant
    ? `${session.participant.first_name} ${session.participant.last_name}`
    : session.title ?? 'Group Session';
  const roleLabel = viewAs === 'mentor' ? 'Mentee' : 'Mentor';

  const MeetingIcon =
    session.meeting_type === 'voice'
      ? Phone
      : session.meeting_type === 'chat'
      ? MessageSquare
      : Video;

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
        {session.participant ? (
          <Avatar
            src={session.participant.avatar_url}
            name={participantName}
            size="md"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-brand-600" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <h4 className="font-semibold text-iron-900 truncate">{participantName}</h4>
            {isGroup ? (
              <Badge variant="default" className="text-xs shrink-0">
                Group
              </Badge>
            ) : (
              <Badge variant="default" className="text-xs shrink-0">
                {roleLabel}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-iron-500">
            {variant === 'upcoming' && dateLabel && (
              <>
                <span className="font-medium text-brand-600">{dateLabel}</span>
                <span>{formatTime(session.scheduled_at)}</span>
              </>
            )}
            {variant === 'past' && <span>{formatRelativeTime(session.scheduled_at)}</span>}
            {variant === 'attention' && (
              <span className="text-amber-600 font-medium">Add your notes</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {variant === 'upcoming' && <MeetingIcon className="w-4 h-4 text-iron-400" />}
          {variant === 'past' && <CheckCircle className="w-5 h-5 text-green-500" />}
          {variant === 'attention' && <AlertCircle className="w-5 h-5 text-amber-500" />}
          <ChevronRight className="w-5 h-5 text-iron-400" />
        </div>
      </div>
    </button>
  );
}
