import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Star, Clock, Users } from 'lucide-react';
import { AppShell, Header } from '../layout';
import { Card, Avatar, Input } from '../ui';
import { mockAvailableMentors, type MentorProfile } from '../../data/mockData';

// Specialty colors mapping - using our color scheme
const specialtyColors: Record<string, { bg: string; text: string }> = {
  'Leadership': { bg: 'bg-blue-100', text: 'text-blue-600' },
  'Career': { bg: 'bg-teal-100', text: 'text-teal-600' },
  'Faith & Spirituality': { bg: 'bg-purple-100', text: 'text-purple-600' },
  'Education': { bg: 'bg-amber-100', text: 'text-amber-600' },
  'Life Skills': { bg: 'bg-green-100', text: 'text-green-600' },
  'Entrepreneurship': { bg: 'bg-rose-100', text: 'text-rose-600' },
  'Technology': { bg: 'bg-cyan-100', text: 'text-cyan-600' },
  'Fitness': { bg: 'bg-orange-100', text: 'text-orange-600' },
  'default': { bg: 'bg-iron-100', text: 'text-iron-600' },
};

const getSpecialtyColor = (specialty: string) => {
  return specialtyColors[specialty] || specialtyColors['default'];
};

export function FindMentor() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);

  // Get unique specialties from all mentors
  const allSpecialties = Array.from(
    new Set(mockAvailableMentors.flatMap((m) => m.specialties))
  ).sort();

  // Filter mentors based on search and specialty
  const filteredMentors = mockAvailableMentors.filter((mentor) => {
    const matchesSearch =
      searchQuery === '' ||
      `${mentor.first_name} ${mentor.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (mentor.bio && mentor.bio.toLowerCase().includes(searchQuery.toLowerCase())) ||
      mentor.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSpecialty =
      selectedSpecialty === null || mentor.specialties.includes(selectedSpecialty);

    return matchesSearch && matchesSpecialty;
  });

  const handleMentorClick = (mentor: MentorProfile) => {
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

        {/* Results Count */}
        <p className="text-sm text-iron-500">
          {filteredMentors.length} mentor{filteredMentors.length !== 1 ? 's' : ''} available
        </p>

        {/* Mentor Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filteredMentors.map((mentor) => (
            <MentorCard
              key={mentor.id}
              mentor={mentor}
              onClick={() => handleMentorClick(mentor)}
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
      </div>
    </AppShell>
  );
}

interface MentorCardProps {
  mentor: MentorProfile;
  onClick: () => void;
}

function MentorCard({ mentor, onClick }: MentorCardProps) {
  const mentorName = `${mentor.first_name} ${mentor.last_name}`;
  const primarySpecialty = mentor.specialties[0];
  const colors = getSpecialtyColor(primarySpecialty);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-iron-100 rounded-2xl p-4 hover:border-blue-200 hover:shadow-md transition-all"
    >
      {/* Profile Image */}
      <div className="flex justify-center mb-3">
        <div className="relative">
          <Avatar
            name={mentorName}
            src={mentor.avatar_url}
            size="xl"
            className="w-20 h-20 border-4 border-white shadow-lg"
          />
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
      <div className="flex justify-center mb-3">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
          {primarySpecialty}
        </span>
      </div>

      {/* Stats */}
      <div className="space-y-1.5">
        {/* Rating */}
        {mentor.rating && (
          <div className="flex items-center justify-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
            <span className="text-xs text-iron-600">
              {mentor.rating} rating
            </span>
          </div>
        )}

        {/* Availability */}
        <div className="flex items-center justify-center gap-1 text-xs text-iron-500">
          <Clock className="w-3 h-3" />
          <span>{mentor.availability}</span>
        </div>

        {/* Matches */}
        <div className="flex items-center justify-center gap-1 text-xs text-iron-500">
          <Users className="w-3 h-3" />
          <span>{mentor.matchCount} matches</span>
        </div>
      </div>
    </button>
  );
}
