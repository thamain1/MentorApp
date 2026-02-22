import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  MapPin,
  Clock,
  Users,
  Briefcase,
  Heart,
  MessageCircle,
  CheckCircle,
} from 'lucide-react';
import { AppShell, Header } from '../layout';
import { Card, Avatar, Badge, Button, Textarea } from '../ui';
import { mockAvailableMentors, mockMatchRequests } from '../../data/mockData';
import { SPECIALTY_COLORS } from '../../types';

export function MentorProfile() {
  const { mentorId } = useParams<{ mentorId: string }>();
  const navigate = useNavigate();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestSent, setRequestSent] = useState(false);

  const mentor = mockAvailableMentors.find((m) => m.id === mentorId);

  // Check if already requested
  const existingRequest = mockMatchRequests.find(
    (r) => r.mentorId === mentorId && r.status === 'pending'
  );

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

  const handleSendRequest = () => {
    // In real app, this would create a match request in Supabase
    console.log('Sending match request:', { mentorId, message: requestMessage });
    setShowRequestModal(false);
    setRequestSent(true);
  };

  return (
    <AppShell>
      <Header title="Mentor Profile" showBack />

      <div className="p-4 space-y-4">
        {/* Profile Header */}
        <Card className="p-6 text-center">
          <div className="inline-block rounded-full ring-4 ring-blue-400 p-0.5 mb-4">
            <Avatar name={mentorName} src={mentor.avatar_url} size="xl" className="border-2 border-white" />
          </div>

          <h1 className="text-xl font-bold text-iron-900 mb-1">{mentorName}</h1>

          {mentor.rating && (
            <div className="flex items-center justify-center gap-1 text-amber-500 mb-2">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-medium">{mentor.rating}</span>
              <span className="text-iron-400 text-sm">rating</span>
            </div>
          )}

          <div className="flex items-center justify-center gap-4 text-sm text-iron-500 mb-4">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{mentor.location}</span>
            </div>
          </div>

          <p className="text-iron-600 text-sm">{mentor.bio}</p>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 text-center">
            <Briefcase className="w-5 h-5 text-brand-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-iron-900">{mentor.yearsExperience}</p>
            <p className="text-xs text-iron-500">Years Exp.</p>
          </Card>
          <Card className="p-3 text-center">
            <Users className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-iron-900">{mentor.matchCount}</p>
            <p className="text-xs text-iron-500">Mentees</p>
          </Card>
          <Card className="p-3 text-center">
            <Clock className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <p className="text-sm font-bold text-iron-900">{mentor.availability}</p>
            <p className="text-xs text-iron-500">Available</p>
          </Card>
        </div>

        {/* Specialties */}
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

        {/* Interests */}
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

        {/* Focus Areas */}
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

        {/* Request Match Button */}
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

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="w-full max-w-md bg-white rounded-t-2xl animate-slide-up max-h-[85vh] flex flex-col mb-16">
            {/* Header */}
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

            {/* Scrollable Content */}
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

            {/* Fixed Footer with Buttons */}
            <div className="flex gap-3 p-6 pt-4 border-t border-iron-100 bg-white">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowRequestModal(false)}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSendRequest}>
                Send Request
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
