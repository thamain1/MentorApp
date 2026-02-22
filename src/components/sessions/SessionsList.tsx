import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Video,
  ChevronRight,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { AppShell, Header } from '../layout';
import { Avatar, Card, Badge } from '../ui';
import { formatDate, formatTime, formatRelativeTime } from '../../lib/utils';
import { useUser } from '../../context';
import {
  mockMentorSessions,
  mockMenteeSessions,
  type SessionWithParticipant,
} from '../../data/mockData';
import type { UserRole } from '../../types';

export function SessionsList() {
  const navigate = useNavigate();
  const { role } = useUser();

  // Map role to session view - admin sees mentor view for now
  const viewAs: 'mentor' | 'mentee' = role === 'mentee' ? 'mentee' : 'mentor';
  const sessions = viewAs === 'mentor' ? mockMentorSessions : mockMenteeSessions;

  // Separate sessions into categories
  const now = new Date();
  const upcomingSessions = sessions
    .filter((s) => s.status === 'scheduled' && new Date(s.scheduled_at) > now)
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  const needsAttention = sessions.filter((s) => {
    if (s.status !== 'completed') return false;
    // Sessions needing notes from current user
    if (viewAs === 'mentor' && !s.mentor_notes) return true;
    if (viewAs === 'mentee' && !s.mentee_notes) return true;
    return false;
  });

  const pastSessions = sessions
    .filter((s) => s.status === 'completed')
    .filter((s) => {
      // Exclude sessions needing attention from past list
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

  const handleSessionClick = (session: SessionWithParticipant) => {
    navigate(`/sessions/${session.matchId}`, {
      state: { sessionId: session.id, viewAs },
    });
  };

  return (
    <AppShell>
      <Header title="Sessions" showNotifications />

      <div className="p-4 space-y-6">
        {/* Quick Stats */}
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

        {/* Needs Attention */}
        {needsAttention.length > 0 && (
          <section>
            <h3 className="text-sm font-medium text-iron-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Needs Your Notes
            </h3>
            <div className="space-y-2">
              {needsAttention.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  viewAs={viewAs}
                  onClick={() => handleSessionClick(session)}
                  variant="attention"
                />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Sessions */}
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
              {upcomingSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  viewAs={viewAs}
                  onClick={() => handleSessionClick(session)}
                  variant="upcoming"
                  dateLabel={getNextSessionLabel(session.scheduled_at)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Past Sessions */}
        {pastSessions.length > 0 && (
          <section>
            <h3 className="text-sm font-medium text-iron-500 uppercase tracking-wide mb-3">
              Past Sessions
            </h3>
            <div className="space-y-2">
              {pastSessions.slice(0, 5).map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  viewAs={viewAs}
                  onClick={() => handleSessionClick(session)}
                  variant="past"
                />
              ))}
            </div>
            {pastSessions.length > 5 && (
              <button className="w-full mt-3 py-2 text-sm text-brand-600 font-medium">
                View all past sessions ({pastSessions.length})
              </button>
            )}
          </section>
        )}
      </div>
    </AppShell>
  );
}

interface SessionCardProps {
  session: SessionWithParticipant;
  viewAs: UserRole;
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
        <Avatar
          src={session.participant.avatar_url}
          name={participantName}
          size="md"
        />

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
            {variant === 'past' && (
              <span>{formatRelativeTime(session.scheduled_at)}</span>
            )}
            {variant === 'attention' && (
              <span className="text-amber-600 font-medium">
                Add your notes
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {variant === 'upcoming' && (
            <div className="flex items-center gap-1 text-iron-400">
              <Video className="w-4 h-4" />
            </div>
          )}
          {variant === 'past' && (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}
          {variant === 'attention' && (
            <AlertCircle className="w-5 h-5 text-amber-500" />
          )}
          <ChevronRight className="w-5 h-5 text-iron-400" />
        </div>
      </div>
    </button>
  );
}
