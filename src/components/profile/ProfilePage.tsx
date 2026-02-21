import { useNavigate } from 'react-router-dom';
import {
  Camera,
  Edit2,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Target,
  Calendar,
  Flame,
  Award,
} from 'lucide-react';
import { AppShell, Header } from '../layout';
import { Avatar, Card, Badge } from '../ui';
import { mockCurrentUser, mockUserStats } from '../../data/mockData';

export function ProfilePage() {
  const navigate = useNavigate();
  const fullName = `${mockCurrentUser.first_name} ${mockCurrentUser.last_name}`;

  const settingsItems = [
    {
      icon: Edit2,
      label: 'Edit Profile',
      onClick: () => {},
    },
    {
      icon: Bell,
      label: 'Notifications',
      onClick: () => navigate('/notifications'),
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      onClick: () => {},
    },
    {
      icon: LogOut,
      label: 'Sign Out',
      onClick: () => {},
      danger: true,
    },
  ];

  return (
    <AppShell>
      <Header title="Profile" showNotifications />

      <div className="p-4 space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <Avatar
              src={mockCurrentUser.avatar_url}
              name={fullName}
              size="xl"
            />
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-flame-500 text-white rounded-full flex items-center justify-center shadow-lg">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-xl font-bold text-iron-900">{fullName}</h2>
          <Badge variant="flame" className="mt-2">Mentee</Badge>

          {mockCurrentUser.location && (
            <p className="text-sm text-iron-500 mt-2">{mockCurrentUser.location}</p>
          )}
        </div>

        {/* Bio */}
        {mockCurrentUser.bio && (
          <Card className="p-4">
            <h3 className="text-sm font-medium text-iron-500 mb-2">About</h3>
            <p className="text-iron-700">{mockCurrentUser.bio}</p>
          </Card>
        )}

        {/* Interests */}
        {mockCurrentUser.interests.length > 0 && (
          <Card className="p-4">
            <h3 className="text-sm font-medium text-iron-500 mb-3">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {mockCurrentUser.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1 bg-iron-100 text-iron-700 text-sm rounded-full"
                >
                  {interest}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Goals Focus Areas */}
        {mockCurrentUser.goals.length > 0 && (
          <Card className="p-4">
            <h3 className="text-sm font-medium text-iron-500 mb-3">Focus Areas</h3>
            <div className="flex flex-wrap gap-2">
              {mockCurrentUser.goals.map((goal) => (
                <span
                  key={goal}
                  className="px-3 py-1 bg-flame-100 text-flame-700 text-sm rounded-full"
                >
                  {goal}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Stats Card */}
        <Card className="p-4">
          <h3 className="text-sm font-medium text-iron-500 mb-4">Your Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-flame-100 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-flame-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-iron-900">{mockUserStats.matchesCount}</p>
                <p className="text-xs text-iron-500">Matches</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-iron-900">{mockUserStats.sessionsCompleted}</p>
                <p className="text-xs text-iron-500">Sessions</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-iron-900">{mockUserStats.streakDays}</p>
                <p className="text-xs text-iron-500">Day streak</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-iron-900">{mockUserStats.badgesEarned}</p>
                <p className="text-xs text-iron-500">Badges</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Settings */}
        <Card className="divide-y divide-iron-100">
          {settingsItems.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="w-full flex items-center justify-between p-4 hover:bg-iron-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 ${item.danger ? 'text-red-500' : 'text-iron-500'}`} />
                <span className={`font-medium ${item.danger ? 'text-red-600' : 'text-iron-700'}`}>
                  {item.label}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-iron-400" />
            </button>
          ))}
        </Card>

        {/* App Version */}
        <p className="text-center text-xs text-iron-400 pb-4">
          Iron Sharpens Iron v1.0.0
        </p>
      </div>
    </AppShell>
  );
}
