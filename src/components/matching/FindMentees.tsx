import { useState } from 'react';
import { Search, Filter, Target, MapPin } from 'lucide-react';
import { AppShell, Header } from '../layout';
import { Card, Avatar, Input } from '../ui';
import { mockMentees } from '../../data/mockData';
import type { Profile } from '../../types';

const INTEREST_COLORS: Record<string, { bg: string; text: string }> = {
  'Technology': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'Music': { bg: 'bg-pink-100', text: 'text-pink-700' },
  'Gaming': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'Sports': { bg: 'bg-green-100', text: 'text-green-700' },
  'Art & Design': { bg: 'bg-orange-100', text: 'text-orange-700' },
  'Reading': { bg: 'bg-teal-100', text: 'text-teal-700' },
  'Writing': { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  'Entrepreneurship': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  'default': { bg: 'bg-iron-100', text: 'text-iron-600' },
};

const allInterests = Array.from(
  new Set(mockMentees.flatMap((m) => m.interests))
).sort();

export function FindMentees() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null);

  const filtered = mockMentees.filter((mentee) => {
    const matchesSearch =
      searchQuery === '' ||
      `${mentee.first_name} ${mentee.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (mentee.bio && mentee.bio.toLowerCase().includes(searchQuery.toLowerCase())) ||
      mentee.interests.some((i) => i.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesInterest =
      selectedInterest === null || mentee.interests.includes(selectedInterest);

    return matchesSearch && matchesInterest;
  });

  return (
    <AppShell>
      <Header title="My Mentees" showBack />

      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-iron-400" />
          <Input
            placeholder="Search by name, interest..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          <button
            onClick={() => setSelectedInterest(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedInterest === null
                ? 'bg-brand-500 text-white'
                : 'bg-iron-100 text-iron-600 hover:bg-iron-200'
            }`}
          >
            All
          </button>
          {allInterests.map((interest) => (
            <button
              key={interest}
              onClick={() => setSelectedInterest(interest)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedInterest === interest
                  ? 'bg-brand-500 text-white'
                  : 'bg-iron-100 text-iron-600 hover:bg-iron-200'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>

        <p className="text-sm text-iron-500">
          {filtered.length} mentee{filtered.length !== 1 ? 's' : ''}
        </p>

        <div className="space-y-3">
          {filtered.map((mentee) => (
            <MenteeCard key={mentee.id} mentee={mentee} />
          ))}
        </div>

        {filtered.length === 0 && (
          <Card className="p-6 text-center">
            <Filter className="w-10 h-10 text-iron-300 mx-auto mb-2" />
            <p className="text-iron-600 font-medium mb-1">No mentees found</p>
            <p className="text-sm text-iron-500">Try adjusting your search or filters</p>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

interface MenteeCardProps {
  mentee: Profile;
}

function MenteeCard({ mentee }: MenteeCardProps) {
  const menteeName = `${mentee.first_name} ${mentee.last_name}`;
  return (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <Avatar
            name={menteeName}
            src={mentee.avatar_url}
            size="lg"
            className="w-16 h-16 border-2 border-iron-100"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-iron-900 truncate">{menteeName}</h3>
            {mentee.age && (
              <span className="text-xs text-iron-400 flex-shrink-0">Age {mentee.age}</span>
            )}
          </div>

          {mentee.location && (
            <div className="flex items-center gap-1 mb-2">
              <MapPin className="w-3 h-3 text-iron-400" />
              <span className="text-xs text-iron-500">{mentee.location}</span>
            </div>
          )}

          {mentee.bio && (
            <p className="text-sm text-iron-600 line-clamp-2 mb-3">{mentee.bio}</p>
          )}

          <div className="flex flex-wrap gap-1.5 mb-3">
            {mentee.interests.slice(0, 3).map((interest) => {
              const c = INTEREST_COLORS[interest] || INTEREST_COLORS['default'];
              return (
                <span
                  key={interest}
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}
                >
                  {interest}
                </span>
              );
            })}
          </div>

          {mentee.goals && mentee.goals.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-iron-400 flex-shrink-0" />
              <div className="flex flex-wrap gap-1">
                {mentee.goals.slice(0, 2).map((goal) => (
                  <span key={goal} className="text-xs text-iron-500">{goal}{mentee.goals.indexOf(goal) < Math.min(mentee.goals.length, 2) - 1 ? ',' : ''}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
