import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, MapPin, Bookmark, Calendar, ChevronRight } from 'lucide-react';
import { AppShell, Header } from '../layout';
import { Card, Badge, Input } from '../ui';
import { mockGroups, type Group } from '../../data/mockData';
import { formatDate } from '../../lib/utils';

type GroupFilter = 'all' | 'joined' | 'interest' | 'location' | 'program';

export function GroupDirectory() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<GroupFilter>('all');

  const filteredGroups = mockGroups.filter((group) => {
    const matchesSearch =
      searchQuery === '' ||
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filter === 'all' ||
      (filter === 'joined' && group.isJoined) ||
      (filter !== 'joined' && group.type === filter);

    return matchesSearch && matchesFilter;
  });

  const joinedCount = mockGroups.filter((g) => g.isJoined).length;

  return (
    <AppShell>
      <Header title="Groups" showNotifications />

      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-iron-400" />
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {[
            { value: 'all', label: 'All' },
            { value: 'joined', label: `Joined (${joinedCount})` },
            { value: 'interest', label: 'Interest' },
            { value: 'location', label: 'Location' },
            { value: 'program', label: 'Program' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value as GroupFilter)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === tab.value
                  ? 'bg-brand-500 text-white'
                  : 'bg-iron-100 text-iron-600 hover:bg-iron-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Groups List */}
        <div className="space-y-3">
          {filteredGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onClick={() => navigate(`/groups/${group.id}`)}
            />
          ))}
        </div>

        {filteredGroups.length === 0 && (
          <Card className="p-6 text-center">
            <Users className="w-10 h-10 text-iron-300 mx-auto mb-2" />
            <p className="text-iron-600 font-medium mb-1">No groups found</p>
            <p className="text-sm text-iron-500">
              Try adjusting your search or filters
            </p>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

interface GroupCardProps {
  group: Group;
  onClick: () => void;
}

function GroupCard({ group, onClick }: GroupCardProps) {
  const getTypeIcon = () => {
    switch (group.type) {
      case 'interest':
        return <Bookmark className="w-4 h-4" />;
      case 'location':
        return <MapPin className="w-4 h-4" />;
      case 'program':
        return <Users className="w-4 h-4" />;
    }
  };

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-iron-100 rounded-xl p-4 hover:border-brand-200 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          group.type === 'interest' ? 'bg-blue-100 text-blue-600' :
          group.type === 'location' ? 'bg-green-100 text-green-600' :
          'bg-brand-100 text-brand-600'
        }`}>
          {getTypeIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-iron-900 truncate">{group.name}</h3>
            {group.isJoined && (
              <Badge variant="success" className="text-xs">Joined</Badge>
            )}
          </div>

          <p className="text-sm text-iron-600 line-clamp-2 mb-2">{group.description}</p>

          <div className="flex items-center gap-3 text-xs text-iron-500">
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{group.memberCount} members</span>
            </div>
            {group.nextEvent && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(group.nextEvent.date)}</span>
              </div>
            )}
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-iron-400 flex-shrink-0" />
      </div>
    </button>
  );
}
