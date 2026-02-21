import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Video,
  Plus,
  CheckCircle,
  X,
  MessageSquare,
  Edit2,
  XCircle,
  AlertCircle,
  User,
  Users,
} from 'lucide-react';
import { AppShell, Header } from '../layout';
import { Avatar, Button, Card, Input, Textarea, Badge } from '../ui';
import { formatDate, formatTime } from '../../lib/utils';
import {
  mockMentorSessions,
  mockMenteeSessions,
  mockMentees,
  mockMentorProfile,
  type UserRole,
  type SessionWithParticipant,
} from '../../data/mockData';
import { SessionNotesModal } from './SessionNotesModal';

export function SessionDetail() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Get viewAs from navigation state or default to mentee
  const initialViewAs = (location.state as { viewAs?: UserRole })?.viewAs || 'mentee';
  const [viewAs, setViewAs] = useState<UserRole>(initialViewAs);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionWithParticipant | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState<string | null>(null);

  // Schedule form state
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');

  // Get sessions based on role and matchId
  const allSessions = viewAs === 'mentor' ? mockMentorSessions : mockMenteeSessions;
  const sessions = allSessions.filter((s) => s.matchId === matchId);

  // Get participant info
  const participant = viewAs === 'mentor'
    ? mockMentees.find((m) => sessions[0]?.participant.id === m.id)
    : mockMentorProfile;

  if (!participant || sessions.length === 0) {
    return (
      <AppShell>
        <Header title="Sessions" showBack />
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
          <p className="text-iron-500">No sessions found</p>
          <button
            onClick={() => navigate('/sessions')}
            className="mt-4 text-flame-600 font-medium"
          >
            Back to sessions
          </button>
        </div>
      </AppShell>
    );
  }

  const participantName = `${participant.first_name} ${participant.last_name}`;
  const roleLabel = viewAs === 'mentor' ? 'Mentee' : 'Mentor';

  const upcomingSessions = sessions.filter((s) => s.status === 'scheduled');
  const pastSessions = sessions
    .filter((s) => s.status === 'completed')
    .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());

  const handleOpenNotes = (session: SessionWithParticipant) => {
    setSelectedSession(session);
    setShowNotesModal(true);
  };

  const handleSaveNotes = (notes: string) => {
    // In real app, save to Supabase
    console.log('Saving notes:', notes, 'for session:', selectedSession?.id);
  };

  const handleCancelSession = (sessionId: string) => {
    // In real app, update status in Supabase
    console.log('Cancelling session:', sessionId);
    setShowCancelConfirm(null);
  };

  const handleCompleteSession = (sessionId: string) => {
    // In real app, update status and open notes modal
    console.log('Completing session:', sessionId);
    setShowCompleteConfirm(null);
    // Open notes modal for completed session
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setSelectedSession(session);
      setShowNotesModal(true);
    }
  };

  const hasMyNotes = (session: SessionWithParticipant) => {
    return viewAs === 'mentor' ? !!session.mentor_notes : !!session.mentee_notes;
  };

  const getMyNotes = (session: SessionWithParticipant) => {
    return viewAs === 'mentor' ? session.mentor_notes : session.mentee_notes;
  };

  const getTheirNotes = (session: SessionWithParticipant) => {
    return viewAs === 'mentor' ? session.mentee_notes : session.mentor_notes;
  };

  return (
    <AppShell>
      <Header title="Sessions" showBack />

      <div className="p-4 space-y-6">
        {/* Role Toggle - Demo only */}
        <Card className="p-3">
          <p className="text-xs text-iron-500 mb-2">View as:</p>
          <div className="flex gap-2">
            <button
              onClick={() => setViewAs('mentee')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                viewAs === 'mentee'
                  ? 'bg-flame-500 text-white'
                  : 'bg-iron-100 text-iron-600 hover:bg-iron-200'
              }`}
            >
              <User className="w-4 h-4" />
              Mentee
            </button>
            <button
              onClick={() => setViewAs('mentor')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                viewAs === 'mentor'
                  ? 'bg-flame-500 text-white'
                  : 'bg-iron-100 text-iron-600 hover:bg-iron-200'
              }`}
            >
              <Users className="w-4 h-4" />
              Mentor
            </button>
          </div>
        </Card>

        {/* Participant Info Card */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Avatar src={participant.avatar_url} name={participantName} size="lg" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-iron-900">{participantName}</h2>
                <Badge variant="default">{roleLabel}</Badge>
              </div>
              <p className="text-sm text-iron-500">
                {sessions.length} session{sessions.length !== 1 ? 's' : ''} total
              </p>
            </div>
            <button
              onClick={() => navigate(`/messages/${matchId}`)}
              className="p-2 rounded-xl bg-iron-100 hover:bg-iron-200 transition-colors"
            >
              <MessageSquare className="w-5 h-5 text-iron-600" />
            </button>
          </div>
        </Card>

        {/* Upcoming Sessions */}
        {upcomingSessions.length > 0 ? (
          <section>
            <h3 className="text-sm font-medium text-iron-500 uppercase tracking-wide mb-3">
              Upcoming
            </h3>
            {upcomingSessions.map((session) => (
              <Card key={session.id} className="p-4 border-l-4 border-l-flame-500 mb-3">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-iron-900">
                      {formatDate(session.scheduled_at)}
                    </p>
                    <p className="text-sm text-iron-500">{formatTime(session.scheduled_at)}</p>
                  </div>
                  <Badge variant="flame">Scheduled</Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-iron-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Video className="w-4 h-4" />
                    <span>Video call</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>1 hour</span>
                  </div>
                </div>

                {/* Session Actions */}
                <div className="flex gap-2">
                  {viewAs === 'mentor' && (
                    <Button
                      size="sm"
                      onClick={() => setShowCompleteConfirm(session.id)}
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Mark Complete
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowCancelConfirm(session.id)}
                    className={viewAs === 'mentor' ? '' : 'flex-1'}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>

                {/* Cancel Confirmation */}
                {showCancelConfirm === session.id && (
                  <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-800 mb-2">
                      Are you sure you want to cancel this session?
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowCancelConfirm(null)}
                        className="flex-1"
                      >
                        Keep Session
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleCancelSession(session.id)}
                        className="flex-1"
                      >
                        Yes, Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Complete Confirmation */}
                {showCompleteConfirm === session.id && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800 mb-2">
                      Mark this session as completed? You'll be prompted to add notes.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowCompleteConfirm(null)}
                        className="flex-1"
                      >
                        Not Yet
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleCompleteSession(session.id)}
                        className="flex-1"
                      >
                        Yes, Complete
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </section>
        ) : (
          <section>
            <Card className="p-4 text-center">
              <Calendar className="w-10 h-10 text-iron-300 mx-auto mb-2" />
              <p className="text-iron-600 font-medium mb-1">No upcoming sessions</p>
              <p className="text-sm text-iron-500 mb-4">
                Schedule a session with {participant.first_name}
              </p>
              <Button onClick={() => setShowScheduleModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Schedule Session
              </Button>
            </Card>
          </section>
        )}

        {/* Schedule Button (when there are upcoming sessions) */}
        {upcomingSessions.length > 0 && (
          <Button variant="outline" className="w-full" onClick={() => setShowScheduleModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Schedule Another Session
          </Button>
        )}

        {/* Past Sessions */}
        {pastSessions.length > 0 && (
          <section>
            <h3 className="text-sm font-medium text-iron-500 uppercase tracking-wide mb-3">
              Past Sessions
            </h3>
            <div className="space-y-3">
              {pastSessions.map((session) => (
                <Card key={session.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium text-iron-900">
                          {formatDate(session.scheduled_at)}
                        </p>
                        <p className="text-xs text-iron-500">{formatTime(session.scheduled_at)}</p>
                      </div>
                    </div>
                    {!hasMyNotes(session) && (
                      <Badge variant="warning" className="flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Add Notes
                      </Badge>
                    )}
                  </div>

                  {/* Notes Section */}
                  <div className="mt-3 space-y-3">
                    {/* My Notes */}
                    <div className="p-3 bg-iron-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium text-iron-500">
                          {viewAs === 'mentor' ? 'Your Notes' : 'My Notes'}
                        </p>
                        <button
                          onClick={() => handleOpenNotes(session)}
                          className="text-xs text-flame-600 font-medium flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          {hasMyNotes(session) ? 'Edit' : 'Add'}
                        </button>
                      </div>
                      {hasMyNotes(session) ? (
                        <p className="text-sm text-iron-700">{getMyNotes(session)}</p>
                      ) : (
                        <p className="text-sm text-iron-400 italic">No notes added yet</p>
                      )}
                    </div>

                    {/* Their Notes (if available) */}
                    {getTheirNotes(session) && (
                      <div className="p-3 bg-flame-50 rounded-lg">
                        <p className="text-xs font-medium text-flame-700 mb-1">
                          {viewAs === 'mentor' ? `${participant.first_name}'s Notes` : "Mentor's Notes"}
                        </p>
                        <p className="text-sm text-iron-700">{getTheirNotes(session)}</p>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="w-full max-w-md bg-white rounded-t-2xl p-6 safe-bottom animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-iron-900">Schedule Session</h2>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-2 rounded-xl hover:bg-iron-100"
              >
                <X className="w-5 h-5 text-iron-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-iron-50 rounded-xl">
                <Avatar src={participant.avatar_url} name={participantName} size="md" />
                <div>
                  <p className="font-medium text-iron-900">{participantName}</p>
                  <p className="text-sm text-iron-500">{roleLabel}</p>
                </div>
              </div>

              <Input
                label="Date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <Input
                label="Time"
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              />
              <Textarea
                label="Notes (optional)"
                placeholder="What would you like to discuss?"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                rows={3}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowScheduleModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    // In real app, this would create session in Supabase
                    setShowScheduleModal(false);
                    setSelectedDate('');
                    setSelectedTime('');
                    setSessionNotes('');
                  }}
                >
                  Schedule
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {selectedSession && (
        <SessionNotesModal
          isOpen={showNotesModal}
          onClose={() => {
            setShowNotesModal(false);
            setSelectedSession(null);
          }}
          onSave={handleSaveNotes}
          existingNotes={getMyNotes(selectedSession)}
          participantName={participantName}
          sessionDate={formatDate(selectedSession.scheduled_at)}
          userRole={viewAs}
        />
      )}
    </AppShell>
  );
}
