import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  Calendar,
  MessageCircle,
  Bell,
  BellOff,
  UserPlus,
  UserMinus,
  ChevronRight,
} from 'lucide-react';
import { AppShell, Header } from '../layout';
import { Card, Badge, Button, Avatar } from '../ui';
import { mockGroups, mockPosts, type Group } from '../../data/mockData';
import { formatDate } from '../../lib/utils';

export function GroupDetail() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | undefined>(
    mockGroups.find((g) => g.id === groupId)
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  if (!group) {
    return (
      <AppShell>
        <Header title="Group" showBack />
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
          <p className="text-iron-500">Group not found</p>
          <button
            onClick={() => navigate('/groups')}
            className="mt-4 text-brand-600 font-medium"
          >
            Back to groups
          </button>
        </div>
      </AppShell>
    );
  }

  // Get some sample posts for this group (in real app, filter by group_id)
  const groupPosts = mockPosts.slice(0, 3);

  const handleToggleJoin = () => {
    setGroup({ ...group, isJoined: !group.isJoined });
  };

  const getTypeLabel = () => {
    switch (group.type) {
      case 'interest':
        return 'Interest Group';
      case 'location':
        return 'Local Chapter';
      case 'program':
        return 'Program Group';
    }
  };

  return (
    <AppShell>
      <Header title={group.name} showBack />

      <div className="p-4 space-y-4">
        {/* Group Header */}
        <Card className="p-6 text-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
            group.type === 'interest' ? 'bg-blue-100 text-blue-600' :
            group.type === 'location' ? 'bg-green-100 text-green-600' :
            'bg-brand-100 text-brand-600'
          }`}>
            <Users className="w-8 h-8" />
          </div>

          <h1 className="text-xl font-bold text-iron-900 mb-1">{group.name}</h1>
          <Badge variant="default" className="mb-3">{getTypeLabel()}</Badge>

          <p className="text-iron-600 text-sm mb-4">{group.description}</p>

          <div className="flex items-center justify-center gap-4 text-sm text-iron-500">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{group.memberCount} members</span>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant={group.isJoined ? 'outline' : 'primary'}
            className="flex-1"
            onClick={handleToggleJoin}
          >
            {group.isJoined ? (
              <>
                <UserMinus className="w-4 h-4 mr-2" />
                Leave Group
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Join Group
              </>
            )}
          </Button>
          {group.isJoined && (
            <Button
              variant="outline"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            >
              {notificationsEnabled ? (
                <Bell className="w-4 h-4" />
              ) : (
                <BellOff className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>

        {/* Upcoming Event */}
        {group.nextEvent && (
          <Card className="border-l-4 border-l-brand-500">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-brand-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-iron-900">{group.nextEvent.title}</p>
                <p className="text-sm text-iron-500">{formatDate(group.nextEvent.date)}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-iron-400" />
            </div>
          </Card>
        )}

        {/* Recent Activity */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-iron-900">Recent Activity</h3>
            <button className="text-sm text-brand-500 font-medium">View All</button>
          </div>

          <div className="space-y-3">
            {groupPosts.map((post) => (
              <Card key={post.id} className="p-3">
                <div className="flex items-start gap-3">
                  <Avatar
                    name={`${post.author.first_name} ${post.author.last_name}`}
                    src={post.author.avatar_url}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-iron-900">
                      {post.author.first_name} {post.author.last_name}
                    </p>
                    <p className="text-sm text-iron-600 line-clamp-2">{post.content}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Discussion Link */}
        {group.isJoined && (
          <Card className="hover:border-brand-200 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-iron-900">Group Discussion</p>
                <p className="text-sm text-iron-500">Chat with other members</p>
              </div>
              <ChevronRight className="w-5 h-5 text-iron-400" />
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
