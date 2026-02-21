import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Star, MapPin, Clock, ChevronRight } from 'lucide-react';
import { AppShell, Header } from '../layout';
import { Card, Avatar, Badge, Input } from '../ui';
import { mockAvailableMentors, type MentorProfile } from '../../data/mockData';

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
                ? 'bg-brand-500 text-white'
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
                  ? 'bg-brand-500 text-white'
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

        {/* Mentor List */}
        <div className="space-y-3">
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

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-iron-100 rounded-xl p-4 hover:border-brand-200 transition-colors"
    >
      <div className="flex items-start gap-3">
        <Avatar name={mentorName} src={mentor.avatar_url} size="lg" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-iron-900 truncate">{mentorName}</h3>
            {mentor.rating && (
              <div className="flex items-center gap-0.5 text-amber-500">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="text-xs font-medium">{mentor.rating}</span>
              </div>
            )}
          </div>

          <p className="text-sm text-iron-600 line-clamp-2 mb-2">{mentor.bio}</p>

          <div className="flex flex-wrap gap-1 mb-2">
            {mentor.specialties.slice(0, 3).map((specialty) => (
              <Badge key={specialty} variant="default" className="text-xs">
                {specialty}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs text-iron-500">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{mentor.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{mentor.availability}</span>
            </div>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-iron-400 flex-shrink-0" />
      </div>
    </button>
  );
}
