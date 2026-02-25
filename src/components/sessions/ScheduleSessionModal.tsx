import { useState, useEffect } from 'react';
import { X, Video, Phone, MessageSquare, Search, UserPlus } from 'lucide-react';
import { Button, Input, Textarea, Avatar } from '../ui';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../lib/utils';
import type { Profile, MeetingType, RecurrenceType, SessionType } from '../../types/database.types';

type ParticipantProfile = Pick<Profile, 'id' | 'first_name' | 'last_name' | 'avatar_url'>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onScheduled: (sessionId: string) => void;
  defaultMatchId?: string;
  defaultParticipant?: ParticipantProfile;
}

const DURATION_OPTIONS = [
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hr' },
  { value: 90, label: '1.5 hr' },
  { value: 120, label: '2 hr' },
];

export function ScheduleSessionModal({
  isOpen,
  onClose,
  onScheduled,
  defaultMatchId,
  defaultParticipant,
}: Props) {
  const { profile } = useAuth();

  const [sessionType, setSessionType] = useState<SessionType>('1on1');
  const [title, setTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [durationMins, setDurationMins] = useState(60);
  const [meetingType, setMeetingType] = useState<MeetingType>('video');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [description, setDescription] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [participantSearch, setParticipantSearch] = useState('');
  const [searchResults, setSearchResults] = useState<ParticipantProfile[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<ParticipantProfile[]>(() =>
    defaultParticipant ? [defaultParticipant] : []
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Debounced participant search
  useEffect(() => {
    if (participantSearch.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const selectedIds = selectedParticipants.map(p => p.id);
      const { data } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .or(`first_name.ilike.%${participantSearch}%,last_name.ilike.%${participantSearch}%`)
        .neq('id', profile?.id ?? '')
        .limit(5);
      const results = (data ?? []) as ParticipantProfile[];
      setSearchResults(results.filter(r => !selectedIds.includes(r.id)));
    }, 300);
    return () => clearTimeout(timer);
  }, [participantSearch, profile, selectedParticipants]);

  const addParticipant = (p: ParticipantProfile) => {
    setSelectedParticipants(prev => [...prev, p]);
    setSearchResults(prev => prev.filter(r => r.id !== p.id));
    setParticipantSearch('');
  };

  const removeParticipant = (id: string) => {
    if (defaultParticipant && id === defaultParticipant.id) return; // can't remove pre-set 1:1 partner
    setSelectedParticipants(prev => prev.filter(p => p.id !== id));
  };

  const handleSave = async () => {
    if (!profile) return;
    setError('');

    if (!selectedDate || !selectedTime) {
      setError('Date and time are required.');
      return;
    }
    if (sessionType === 'group' && !title.trim()) {
      setError('Title is required for group sessions.');
      return;
    }

    setSaving(true);
    try {
      const scheduledAt = new Date(`${selectedDate}T${selectedTime}`).toISOString();
      const sessionTitle =
        sessionType === 'group'
          ? title.trim()
          : defaultParticipant
          ? `1:1 with ${defaultParticipant.first_name}`
          : title.trim() || null;

      const { data: insertedSession, error: insertError } = await supabase
        .from('sessions')
        .insert({
          match_id: sessionType === '1on1' && defaultMatchId ? defaultMatchId : null,
          scheduled_at: scheduledAt,
          status: 'scheduled',
          session_type: sessionType,
          meeting_type: meetingType,
          meeting_url: meetingUrl.trim() || null,
          title: sessionTitle,
          description: description.trim() || null,
          organizer_id: profile.id,
          duration_mins: durationMins,
          recurrence,
          recurrence_end_date:
            recurrence !== 'none' && recurrenceEndDate ? recurrenceEndDate : null,
        })
        .select('id')
        .single();
      const newSession = insertedSession as { id: string } | null;

      if (insertError || !newSession) {
        setError('Failed to create session. Please try again.');
        setSaving(false);
        return;
      }

      // Insert session_participants
      type ParticipantInsert = { session_id: string; profile_id: string; invited_by: string };
      const participantsToInsert: ParticipantInsert[] = [
        { session_id: newSession.id, profile_id: profile.id, invited_by: profile.id },
        ...selectedParticipants
          .filter(p => p.id !== profile.id)
          .map(p => ({
            session_id: newSession.id,
            profile_id: p.id,
            invited_by: profile.id,
          })),
      ];

      if (participantsToInsert.length > 1) {
        await supabase.from('session_participants').insert(participantsToInsert);
      }

      // Notifications (best-effort — may be silently blocked by RLS for non-admin)
      const targetProfileIds = participantsToInsert
        .filter(p => p.profile_id !== profile.id)
        .map(p => p.profile_id);

      if (targetProfileIds.length > 0) {
        const { data: targetProfilesRaw } = await supabase
          .from('profiles')
          .select('id, user_id')
          .in('id', targetProfileIds);

        const targetProfiles = (targetProfilesRaw ?? []) as Array<{ id: string; user_id: string }>;
        if (targetProfiles.length > 0) {
          const formattedDate = formatDate(scheduledAt);
          await supabase.from('notifications').insert(
            targetProfiles.map(tp => ({
              user_id: tp.user_id,
              type: 'session',
              title: 'New session scheduled',
              body: `A session has been scheduled for ${formattedDate}`,
              action_url: `/sessions/view/${newSession.id}`,
            }))
          );
        }
      }

      onScheduled(newSession.id);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const showMeetingUrl = meetingType === 'video' || meetingType === 'voice';
  const showRecurrenceEnd = recurrence !== 'none';
  const showParticipantSearch = sessionType === 'group' || !defaultMatchId;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="w-full max-w-md bg-white rounded-t-2xl animate-slide-up max-h-[90vh] flex flex-col mb-16">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-iron-100">
          <button
            onClick={onClose}
            className="text-sm font-medium text-iron-500 hover:text-iron-700"
          >
            Cancel
          </button>
          <h2 className="text-base font-semibold text-iron-900">Schedule Session</h2>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Session Type — only shown when no defaultMatchId */}
          {!defaultMatchId && (
            <div>
              <p className="text-sm font-medium text-iron-700 mb-2">Session Type</p>
              <div className="flex gap-2">
                {(['1on1', 'group'] as SessionType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => setSessionType(type)}
                    className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium border transition-colors ${
                      sessionType === type
                        ? 'bg-brand-500 text-white border-brand-500'
                        : 'bg-white text-iron-600 border-iron-200 hover:bg-iron-50'
                    }`}
                  >
                    {type === '1on1' ? '1-on-1' : 'Group'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Title */}
          <Input
            label={sessionType === 'group' ? 'Title *' : 'Title (optional)'}
            placeholder={
              sessionType === 'group'
                ? 'e.g., Monthly Group Check-in'
                : defaultParticipant
                ? `1:1 with ${defaultParticipant.first_name}`
                : 'Session title'
            }
            value={title}
            onChange={e => setTitle(e.target.value)}
          />

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date *"
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />
            <Input
              label="Time *"
              type="time"
              value={selectedTime}
              onChange={e => setSelectedTime(e.target.value)}
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-iron-700 mb-2">Duration</label>
            <select
              value={durationMins}
              onChange={e => setDurationMins(Number(e.target.value))}
              className="w-full px-3 py-2 border border-iron-200 rounded-xl text-sm text-iron-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {DURATION_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Meeting Format */}
          <div>
            <p className="text-sm font-medium text-iron-700 mb-2">Meeting Format</p>
            <div className="flex gap-2">
              {(
                [
                  { type: 'video' as MeetingType, label: 'Video', icon: <Video className="w-4 h-4" /> },
                  { type: 'voice' as MeetingType, label: 'Voice', icon: <Phone className="w-4 h-4" /> },
                  { type: 'chat' as MeetingType, label: 'Chat', icon: <MessageSquare className="w-4 h-4" /> },
                ] as const
              ).map(({ type, label, icon }) => (
                <button
                  key={type}
                  onClick={() => setMeetingType(type)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-sm font-medium border transition-colors ${
                    meetingType === type
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'bg-white text-iron-600 border-iron-200 hover:bg-iron-50'
                  }`}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Meeting URL */}
          {showMeetingUrl && (
            <Input
              label="Meeting Link"
              type="url"
              placeholder="Google Meet, Zoom, Teams link…"
              value={meetingUrl}
              onChange={e => setMeetingUrl(e.target.value)}
            />
          )}

          {/* Description */}
          <Textarea
            label="Description (optional)"
            placeholder="What will you cover in this session?"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
          />

          {/* Recurrence */}
          <div>
            <label className="block text-sm font-medium text-iron-700 mb-2">Recurrence</label>
            <select
              value={recurrence}
              onChange={e => setRecurrence(e.target.value as RecurrenceType)}
              className="w-full px-3 py-2 border border-iron-200 rounded-xl text-sm text-iron-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="none">None (one-time)</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {/* Recurrence End Date */}
          {showRecurrenceEnd && (
            <Input
              label="Recurrence Ends"
              type="date"
              value={recurrenceEndDate}
              onChange={e => setRecurrenceEndDate(e.target.value)}
            />
          )}

          {/* Invite Participants */}
          {showParticipantSearch && (
            <div>
              <p className="text-sm font-medium text-iron-700 mb-2">
                {sessionType === 'group' ? 'Invite Participants' : 'Invite Participant'}
              </p>

              {/* Selected participants chips */}
              {selectedParticipants.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedParticipants.map(p => (
                    <div
                      key={p.id}
                      className="flex items-center gap-1.5 px-2 py-1 bg-brand-50 border border-brand-200 rounded-full text-sm"
                    >
                      <Avatar src={p.avatar_url} name={`${p.first_name} ${p.last_name}`} size="xs" />
                      <span className="text-brand-700 font-medium">{p.first_name} {p.last_name}</span>
                      {!(defaultParticipant && p.id === defaultParticipant.id) && (
                        <button
                          onClick={() => removeParticipant(p.id)}
                          className="text-brand-400 hover:text-brand-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-iron-400" />
                <input
                  type="text"
                  placeholder="Search by name…"
                  value={participantSearch}
                  onChange={e => setParticipantSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-iron-200 rounded-xl text-sm text-iron-900 placeholder-iron-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Search results */}
              {searchResults.length > 0 && (
                <div className="mt-1 border border-iron-100 rounded-xl overflow-hidden shadow-sm">
                  {searchResults.map(p => {
                    const name = `${p.first_name} ${p.last_name}`;
                    return (
                      <button
                        key={p.id}
                        onClick={() => addParticipant(p)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-iron-50 transition-colors text-left"
                      >
                        <Avatar src={p.avatar_url} name={name} size="sm" />
                        <span className="text-sm font-medium text-iron-900">{name}</span>
                        <UserPlus className="w-4 h-4 text-brand-500 ml-auto" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
