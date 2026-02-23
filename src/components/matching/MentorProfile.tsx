import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Users,
  Heart,
  MessageCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { AppShell, Header } from '../layout';
import { Card, Avatar, Badge, Button, Textarea } from '../ui';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { SPECIALTY_COLORS } from '../../types';
import type { Profile, Database } from '../../types';
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export function MentorProfile() {
  const { mentorId } = useParams<{ mentorId: string }>();
  const navigate = useNavigate();
  const { user, profile: currentProfile } = useAuth();
  const [mentor, setMentor] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [existingRequest, setExistingRequest] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestSent, setRequestSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchMentor = useCallback(async () => {
    if (!mentorId || !currentProfile) return;
    setLoading(true);

    const [{ data: mentorData }, { data: matchData }] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('id', mentorId)
        .eq('role', 'mentor')
        .maybeSingle(),
      supabase
        .from('matches')
        .select('id, status')
        .eq('mentor_id', mentorId)
        .eq('mentee_id', currentProfile.id)
        .in('status', ['pending', 'active']),
    ]);

    setMentor((mentorData as ProfileRow) ?? null);
    setExistingRequest((matchData ?? []).length > 0);
    setLoading(false);
  }, [mentorId, currentProfile]);

  useEffect(() => { fetchMentor(); }, [fetchMentor]);

  const handleSendRequest = async () => {
    if (!user || !currentProfile || !mentorId) return;
    setSubmitting(true);
    await supabase.from('matches').insert({
      mentor_id: mentorId,
      mentee_id: currentProfile.id,
      status: 'pending',
      mentee_message: requestMessage || null,
    });
    setSubmitting(false);
    setShowRequestModal(false);
    setRequestSent(true);
  };

  if (loading) {
    return (
      <AppShell>
        <Header title="Mentor Profile" showBack />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      </AppShell>
    );
  }

  if (!mentor) {
    return (
      <AppShell>
        <Header title="Mentor Profile" showBack />
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
          <p className="text-iron-500">Mentor not found</p>
          <button
            onClick={() => navigate('/mentors')}
            className="mt-4 text-brand-600 font-medium"
          >
            Back to mentors
          </button>
        </div>
      </AppShell>
    );
  }

  const mentorName = `${mentor.first_name} ${mentor.last_name}`;

  return (
    <AppShell>
      <Header title="Mentor Profile" showBack />

      <div className="p-4 space-y-4">
        <Card className="p-6 text-center">
          <div className="inline-block rounded-full ring-4 ring-blue-400 p-0.5 mb-4">
            <Avatar name={mentorName} src={mentor.avatar_url} size="xl" className="border-2 border-white" />
          </div>

          <h1 className="text-xl font-bold text-iron-900 mb-1">{mentorName}</h1>

          {mentor.location && (
            <div className="flex items-center justify-center gap-1 text-sm text-iron-500 mb-4">
              <MapPin className="w-4 h-4" />
              <span>{mentor.location}</span>
            </div>
          )}

          {mentor.bio && (
            <p className="text-iron-600 text-sm">{mentor.bio}</p>
          )}
        </Card>

        <Card className="p-3 text-center">
          <Users className="w-5 h-5 text-blue-500 mx-auto mb-1" />
          <p className="text-xs text-iron-500">Mentor</p>
        </Card>

        {mentor.specialties.length > 0 && (
          <Card>
            <h3 className="font-semibold text-iron-900 mb-3">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {mentor.specialties.map((specialty) => {
                const colors = SPECIALTY_COLORS[specialty] || SPECIALTY_COLORS['default'];
                return (
                  <span
                    key={specialty}
                    className={`px-3 py-1.5 text-sm font-medium rounded-full ${colors.bg} ${colors.text}`}
                  >
                    {specialty}
                  </span>
                );
              })}
            </div>
          </Card>
        )}

        {mentor.interests.length > 0 && (
          <Card>
            <h3 className="font-semibold text-iron-900 mb-3">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {mentor.interests.map((interest) => (
                <div
                  key={interest}
                  className="flex items-center gap-1 px-3 py-1.5 bg-iron-100 rounded-full text-sm text-iron-700"
                >
                  <Heart className="w-3.5 h-3.5 text-iron-400" />
                  {interest}
                </div>
              ))}
            </div>
          </Card>
        )}

        {mentor.goals.length > 0 && (
          <Card>
            <h3 className="font-semibold text-iron-900 mb-3">Focus Areas</h3>
            <div className="flex flex-wrap gap-2">
              {mentor.goals.map((goal) => (
                <Badge key={goal} variant="default" className="text-sm">
                  {goal}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        <div className="pt-4 pb-safe">
          {requestSent || existingRequest ? (
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-800">Request Sent!</p>
                  <p className="text-sm text-green-600">
                    Waiting for {mentor.first_name} to respond
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <Button className="w-full" size="lg" onClick={() => setShowRequestModal(true)}>
              <MessageCircle className="w-5 h-5 mr-2" />
              Request to Match
            </Button>
          )}
        </div>
      </div>

      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="w-full max-w-md bg-white rounded-t-2xl animate-slide-up max-h-[85vh] flex flex-col mb-16">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-iron-100">
              <h2 className="text-lg font-semibold text-iron-900">Request Match</h2>
              <button
                onClick={() => setShowRequestModal(false)}
                className="p-2 rounded-xl hover:bg-iron-100"
              >
                <span className="sr-only">Close</span>
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 pt-4">
              <div className="flex items-center gap-3 p-3 bg-iron-50 rounded-xl mb-4">
                <Avatar name={mentorName} src={mentor.avatar_url} size="md" />
                <div>
                  <p className="font-medium text-iron-900">{mentorName}</p>
                  <p className="text-sm text-iron-500">Mentor</p>
                </div>
              </div>

              <Textarea
                label="Introduce yourself (optional)"
                placeholder="Tell the mentor a bit about yourself and why you'd like to connect..."
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                rows={4}
              />

              <p className="text-xs text-iron-500 mt-2">
                Your request will be reviewed by the mentor and program admin before being approved.
              </p>
            </div>

            <div className="flex gap-3 p-6 pt-4 border-t border-iron-100 bg-white">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowRequestModal(false)}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSendRequest} disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Request'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
