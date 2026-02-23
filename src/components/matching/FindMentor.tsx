import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Users } from 'lucide-react';
import { AppShell, Header } from '../layout';
import { Card, Avatar, Input } from '../ui';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { MENTOR_SPECIALTIES, SPECIALTY_COLORS } from '../../types';
import type { Database } from '../../types/database.types';

type MentorRow = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'id' | 'user_id' | 'first_name' | 'last_name' | 'bio' | 'specialties' | 'location' | 'avatar_url'
>;

const getSpecialtyColor = (specialty: string) => {
  return SPECIALTY_COLORS[specialty] || SPECIALTY_COLORS['default'];
};

export function FindMentor() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [mentors, setMentors] = useState<MentorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const allSpecialties = [...MENTOR_SPECIALTIES];

  const fetchMentors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, user_id, first_name, last_name, bio, specialties, location, avatar_url')
        .eq('role', 'mentor');

      if (fetchError) throw fetchError;
      setMentors((data as MentorRow[]) ?? []);
    } catch (err) {
      setError('Failed to load mentors. Please try again.');
      console.error('Error fetching mentors:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  // Filter mentors based on search and specialty
  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch =
      searchQuery === '' ||
      `${mentor.first_name} ${mentor.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (mentor.bio && mentor.bio.toLowerCase().includes(searchQuery.toLowerCase())) ||
      mentor.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSpecialty =
      selectedSpecialty === null || mentor.specialties.includes(selectedSpecialty);

    // Exclude the current user's own profile
    const isNotSelf = !profile || mentor.id !== profile.id;

    return matchesSearch && matchesSpecialty && isNotSelf;
  });

  const handleMentorClick = (mentor: MentorRow) => {
    navigate(`/mentors/${mentor.id}`);
  };

  return (
    <AppShell>
      <Header title="Find a Mentor" showBack />

      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-iron-400" />
          <Input
            placeholder="Search by name, specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        {/* Specialty Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          <button
            onClick={() => setSelectedSpecialty(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedSpecialty === null
                ? 'bg-blue-500 text-white'
                : 'bg-iron-100 text-iron-600 hover:bg-iron-200'
            }`}
          >
            All
          </button>
          {allSpecialties.map((specialty) => (
            <button
              key={specialty}
              onClick={() => setSelectedSpecialty(specialty)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedSpecialty === specialty
                  ? 'bg-blue-500 text-white'
                  : 'bg-iron-100 text-iron-600 hover:bg-iron-200'
              }`}
            >
              {specialty}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-iron-100 rounded-2xl h-48 animate-pulse" />
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <Card className="p-6 text-center">
            <p className="text-iron-600 font-medium mb-1">{error}</p>
            <button
              onClick={fetchMentors}
              className="text-sm text-blue-500 hover:underline mt-2"
            >
              Retry
            </button>
          </Card>
        )}

        {/* Results */}
        {!loading && !error && (
          <>
            {/* Results Count */}
            <p className="text-sm text-iron-500">
              {filteredMentors.length} mentor{filteredMentors.length !== 1 ? 's' : ''} available
            </p>

            {/* Mentor Grid */}
            <div className="grid grid-cols-2 gap-3">
              {filteredMentors.map((mentor, index) => (
                <MentorCard
                  key={mentor.id}
                  mentor={mentor}
                  onClick={() => handleMentorClick(mentor)}
                  ringColorIndex={index}
                />
              ))}
            </div>

            {filteredMentors.length === 0 && (
              <Card className="p-6 text-center">
                <Filter className="w-10 h-10 text-iron-300 mx-auto mb-2" />
                <p className="text-iron-600 font-medium mb-1">No mentors found</p>
                <p className="text-sm text-iron-500">
                  Try adjusting your search or filters
                </p>
              </Card>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}

// Ring colors to cycle through - matching the home page style
const ringColors = [
  'ring-teal-400',
  'ring-pink-400',
  'ring-blue-400',
  'ring-amber-400',
  'ring-purple-400',
  'ring-green-400',
];

interface MentorCardProps {
  mentor: MentorRow;
  onClick: () => void;
  ringColorIndex: number;
}

function MentorCard({ mentor, onClick, ringColorIndex }: MentorCardProps) {
  const mentorName = `${mentor.first_name} ${mentor.last_name}`;
  const primarySpecialty = mentor.specialties[0];
  const colors = getSpecialtyColor(primarySpecialty);
  const ringColor = ringColors[ringColorIndex % ringColors.length];

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-iron-100 rounded-2xl p-4 hover:border-blue-200 hover:shadow-md transition-all"
    >
      {/* Profile Image with colored ring */}
      <div className="flex justify-center mb-3">
        <div className="relative">
          <div className={`rounded-full ring-4 ${ringColor} p-0.5`}>
            <Avatar
              name={mentorName}
              src={mentor.avatar_url}
              size="xl"
              className="w-20 h-20 border-2 border-white shadow-lg"
            />
          </div>
          {/* Verified badge */}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Name */}
      <h3 className="font-semibold text-iron-900 text-center mb-1 truncate">
        {mentorName}
      </h3>

      {/* Primary Specialty Badge */}
      {primarySpecialty && (
        <div className="flex justify-center mb-3">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
            {primarySpecialty}
          </span>
        </div>
      )}

      {/* Location / session count */}
      <div className="space-y-1.5">
        {mentor.location && (
          <div className="flex items-center justify-center gap-1 text-xs text-iron-500">
            <span>{mentor.location}</span>
          </div>
        )}
        <div className="flex items-center justify-center gap-1 text-xs text-iron-500">
          <Users className="w-3 h-3" />
          <span>0 sessions</span>
        </div>
      </div>
    </button>
  );
}
