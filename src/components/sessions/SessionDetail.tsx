import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Video,
  Phone,
  MessageSquare,
  CheckCircle,
  XCircle,
  Edit2,
  AlertCircle,
  ExternalLink,
  Users,
  RefreshCw,
} from 'lucide-react';
import { AppShell, Header } from '../layout';
import { Avatar, Button, Card, Badge } from '../ui';
import { formatDate, formatTime, buildGoogleCalendarUrl } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { SessionNotesModal } from './SessionNotesModal';
import type { UserRole } from '../../types/database.types';

interface ParticipantProfile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
}

interface SessionFull {
  id: string;
  match_id: string | null;
  scheduled_at: string;
  google_event_id: string | null;
  status: string;
  completed_at: string | null;
  mentee_notes: string | null;
  mentor_notes: string | null;
  created_at: string;
  session_type: string;
  meeting_type: string;
  meeting_url: string | null;
  title: string | null;
  description: string | null;
  organizer_id: string | null;
  duration_mins: number;
  recurrence: string;
  recurrence_end_date: string | null;
  session_participants: {
    id: string;
    profile_id: string;
    status: string;
    profile: ParticipantProfile | null;
  }[];
}

export function SessionDetail() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [session, setSession] = useState<SessionFull | null>(null);
  const [participants, setParticipants] = useState<ParticipantProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);

  const fetchSession = useCallback(async () => {
    if (!sessionId) return;

    const { data, error } = await supabase
      .from('sessions')
      .select(`
        *,
        session_participants(
          id, profile_id, status,
          profile:profile_id(id, first_name, last_name, avatar_url)
        )
      `)
      .eq('id', sessionId)
      .maybeSingle();

    if (error) console.error('[SessionDetail] fetch error:', error);

    if (!data) {
      setLoading(false);
      return;
    }

    const sessionData = data as SessionFull;
    setSession(sessionData);

    // Build participants list from session_participants
    let participantList: ParticipantProfile[] = (sessionData.session_participants ?? [])
      .map(sp => sp.profile)
      .filter((p): p is ParticipantProfile => p !== null)
      .filter(p => p.id !== profile?.id); // exclude self from display

    // For legacy 1:1 sessions with no session_participants, fall back to match
    if (participantList.length === 0 && sessionData.match_id) {
      const { data: matchData } = await supabase
        .from('matches')
        .select('mentor_id, mentee_id')
        .eq('id', sessionData.match_id)
        .maybeSingle();

      if (matchData && profile) {
        const otherId =
          profile.id === matchData.mentor_id ? matchData.mentee_id : matchData.mentor_id;
        const { data: otherProfile } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, avatar_url')
          .eq('id', otherId)
          .maybeSingle();
        if (otherProfile) participantList = [otherProfile as ParticipantProfile];
      }
    }

    setParticipants(participantList);
    setLoading(false);
  }, [sessionId, profile]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const isMentorOrAdmin = profile?.role === 'mentor' || profile?.role === 'admin';
  const userRole: UserRole = profile?.role ?? 'mentee';

  const now = new Date();
  const isUpcoming =
    session?.status === 'scheduled' && new Date(session.scheduled_at) > now;
  const isPast = session?.status === 'completed';

  const getMyNotes = () => {
    if (!session) return null;
    return userRole === 'mentor' ? session.mentor_notes : session.mentee_notes;
  };

  const getTheirNotes = () => {
    if (!session) return null;
    return userRole === 'mentor' ? session.mentee_notes : session.mentor_notes;
  };

  const handleCancelSession = async () => {
    if (!sessionId) return;
    await supabase.from('sessions').update({ status: 'cancelled' }).eq('id', sessionId);
    setShowCancelConfirm(false);
    await fetchSession();
  };

  const handleCompleteSession = async () => {
    if (!sessionId) return;
    await supabase
      .from('sessions')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', sessionId);
    setShowCompleteConfirm(false);
    await fetchSession();
    setShowNotesModal(true);
  };

  const handleSaveNotes = async (notes: string) => {
    if (!sessionId || !profile) return;
    const field = profile.role === 'mentor' ? 'mentor_notes' : 'mentee_notes';
    await supabase.from('sessions').update({ [field]: notes }).eq('id', sessionId);
    await fetchSession();
  };

  if (loading) {
    return (
      <AppShell>
        <Header title="Session" showBack />
        <div className="p-4 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-white rounded-xl border border-iron-100 animate-pulse" />
          ))}
        </div>
      </AppShell>
    );
  }

  if (!session) {
    return (
      <AppShell>
        <Header title="Session" showBack />
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
          <p className="text-iron-500">Session not found</p>
          <button
            onClick={() => navigate('/sessions')}
            className="mt-4 text-brand-600 font-medium"
          >
            Back to sessions
          </button>
        </div>
      </AppShell>
    );
  }

  const isGroup = session.session_type === 'group';
  const sessionTitle =
    session.title ??
    (participants.length > 0 ? `1:1 with ${participants[0].first_name}` : 'Session');

  const MeetingIcon =
    session.meeting_type === 'voice'
      ? Phone
      : session.meeting_type === 'chat'
      ? MessageSquare
      : Video;

  const meetingTypeLabel =
    session.meeting_type === 'voice'
      ? 'Voice Call'
      : session.meeting_type === 'chat'
      ? 'Chat'
      : 'Video Call';

  const durationLabel =
    session.duration_mins < 60
      ? `${session.duration_mins} min`
      : session.duration_mins === 60
      ? '1 hour'
      : `${session.duration_mins / 60} hours`;

  const recurrenceLabel =
    session.recurrence === 'weekly'
      ? 'Weekly'
      : session.recurrence === 'biweekly'
      ? 'Bi-weekly'
      : session.recurrence === 'monthly'
      ? 'Monthly'
      : null;

  const calendarUrl = buildGoogleCalendarUrl({
    title: sessionTitle,
    description: session.description ?? undefined,
    scheduledAt: session.scheduled_at,
    durationMins: session.duration_mins,
    meetingUrl: session.meeting_url ?? undefined,
  });

  const otherParticipant = !isGroup && participants.length > 0 ? participants[0] : null;

  return (
    <AppShell>
      <Header title="Session" showBack />

      <div className="p-4 space-y-6">
        {/* Session Info Card */}
        <Card
          className={`p-4 border-l-4 ${
            isUpcoming
              ? 'border-l-brand-500'
              : isPast
              ? 'border-l-green-500'
              : 'border-l-iron-300'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {isGroup && (
                  <Badge variant="default" className="flex items-center gap-1 shrink-0">
                    <Users className="w-3 h-3" />
                    Group
                  </Badge>
                )}
                <h2 className="font-semibold text-iron-900 truncate">{sessionTitle}</h2>
              </div>
              <p className="text-sm font-medium text-iron-700">
                {formatDate(session.scheduled_at)}
              </p>
              <p className="text-sm text-iron-500">{formatTime(session.scheduled_at)}</p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              {session.status === 'scheduled' && <Badge variant="flame">Scheduled</Badge>}
              {session.status === 'completed' && (
                <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">
                  Completed
                </Badge>
              )}
              {session.status === 'cancelled' && <Badge variant="default">Cancelled</Badge>}
              {recurrenceLabel && (
                <span className="flex items-center gap-1 text-xs text-iron-500">
                  <RefreshCw className="w-3 h-3" />
                  {recurrenceLabel}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-iron-600">
            <div className="flex items-center gap-1">
              <MeetingIcon className="w-4 h-4" />
              <span>{meetingTypeLabel}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{durationLabel}</span>
            </div>
          </div>

          {session.description && (
            <p className="mt-3 text-sm text-iron-600">{session.description}</p>
          )}
        </Card>

        {/* Participants */}
        {participants.length > 0 && (
          <section>
            <h3 className="text-sm font-medium text-iron-500 uppercase tracking-wide mb-3">
              {isGroup ? 'Participants' : 'With'}
            </h3>
            <div className="space-y-2">
              {participants.map(p => {
                const name = `${p.first_name} ${p.last_name}`;
                return (
                  <Card key={p.id} className="p-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={p.avatar_url} name={name} size="md" />
                      <div className="flex-1">
                        <p className="font-medium text-iron-900">{name}</p>
                      </div>
                      {!isGroup && session.match_id && (
                        <button
                          onClick={() => navigate(`/messages/${session.match_id}`)}
                          className="p-2 rounded-xl bg-iron-100 hover:bg-iron-200 transition-colors"
                          title="Send message"
                        >
                          <MessageSquare className="w-4 h-4 text-iron-600" />
                        </button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Upcoming Actions */}
        {isUpcoming && (
          <section className="space-y-2">
            {session.meeting_url && (
              <a
                href={session.meeting_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 transition-colors"
              >
                <MeetingIcon className="w-4 h-4" />
                Join Meeting
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            <a
              href={calendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 border border-iron-200 text-iron-700 rounded-xl font-medium hover:bg-iron-50 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Add to Google Calendar
              <ExternalLink className="w-4 h-4" />
            </a>

            {isMentorOrAdmin && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => setShowCompleteConfirm(true)}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Mark Complete
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCancelConfirm(true)}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              </div>
            )}
          </section>
        )}

        {/* Notes Section (completed sessions) */}
        {isPast && (
          <section>
            <h3 className="text-sm font-medium text-iron-500 uppercase tracking-wide mb-3">
              Notes
            </h3>
            <Card className="p-4 space-y-3">
              {/* My Notes */}
              <div className="p-3 bg-iron-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-iron-500">My Notes</p>
                  <button
                    onClick={() => setShowNotesModal(true)}
                    className="text-xs text-brand-600 font-medium flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    {getMyNotes() ? 'Edit' : 'Add'}
                  </button>
                </div>
                {getMyNotes() ? (
                  <p className="text-sm text-iron-700">{getMyNotes()}</p>
                ) : (
                  <p className="text-sm text-iron-400 italic">No notes added yet</p>
                )}
              </div>

              {/* Their Notes */}
              {getTheirNotes() && (
                <div className="p-3 bg-teal-50 rounded-lg">
                  <p className="text-xs font-medium text-teal-700 mb-1">
                    {userRole === 'mentor'
                      ? `${otherParticipant?.first_name ?? 'Their'}'s Notes`
                      : "Mentor's Notes"}
                  </p>
                  <p className="text-sm text-iron-700">{getTheirNotes()}</p>
                </div>
              )}

              {!getMyNotes() && (
                <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  <p className="text-xs text-amber-700">Add your notes for this session</p>
                </div>
              )}
            </Card>
          </section>
        )}
      </div>

      {/* Cancel Confirmation */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="w-full max-w-md bg-white rounded-t-2xl p-6 mb-16">
            <div className="p-4 bg-red-50 rounded-xl border border-red-200 mb-4">
              <p className="text-sm font-medium text-red-800">Cancel this session?</p>
              <p className="text-xs text-red-600 mt-1">This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCancelConfirm(false)}
              >
                Keep Session
              </Button>
              <Button variant="danger" className="flex-1" onClick={handleCancelSession}>
                Yes, Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Confirmation */}
      {showCompleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="w-full max-w-md bg-white rounded-t-2xl p-6 mb-16">
            <div className="p-4 bg-green-50 rounded-xl border border-green-200 mb-4">
              <p className="text-sm font-medium text-green-800">
                Mark session as completed?
              </p>
              <p className="text-xs text-green-600 mt-1">
                You'll be prompted to add session notes.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCompleteConfirm(false)}
              >
                Not Yet
              </Button>
              <Button className="flex-1" onClick={handleCompleteSession}>
                Yes, Complete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      <SessionNotesModal
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        onSave={handleSaveNotes}
        existingNotes={getMyNotes()}
        participantName={
          participants.map(p => p.first_name).join(', ') || 'Participant'
        }
        sessionDate={formatDate(session.scheduled_at)}
        userRole={userRole}
      />
    </AppShell>
  );
}
