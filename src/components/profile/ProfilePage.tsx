import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EditProfileModal } from './EditProfileModal';
import {
  Camera,
  Edit2,
  Bell,
  HelpCircle,
  LogOut,
  Trash2,
  ChevronRight,
  Target,
  Calendar,
  Flame,
  Award,
  AlertTriangle,
} from 'lucide-react';
import { AppShell, Header } from '../layout';
import { Avatar, Card, Badge } from '../ui';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { mockUserStats } from '../../data/mockData';
import { SPECIALTY_COLORS } from '../../types';

const getConnectionsForRole = (role: string) => {
  if (role === 'mentee') {
    return [
      { id: 'mentor-1', name: 'David Williams', type: 'mentor' },
      { id: 'friend-1', name: 'Tyler Brown', type: 'friend' },
      { id: 'friend-2', name: 'Jordan Davis', type: 'friend' },
      { id: 'mentor-2', name: 'James Thompson', type: 'mentor' },
      { id: 'friend-3', name: 'Kevin Wilson', type: 'friend' },
    ];
  } else if (role === 'mentor') {
    return [
      { id: 'mentee-1', name: 'Marcus Johnson', type: 'mentee' },
      { id: 'mentee-2', name: 'Tyler Brown', type: 'mentee' },
      { id: 'mentee-3', name: 'Jordan Davis', type: 'mentee' },
      { id: 'fellow-1', name: 'James Thompson', type: 'fellow' },
      { id: 'fellow-2', name: 'Michael Chen', type: 'fellow' },
    ];
  } else {
    return [
      { id: 'mentor-1', name: 'David Williams', type: 'mentor' },
      { id: 'mentor-2', name: 'James Thompson', type: 'mentor' },
      { id: 'mentee-1', name: 'Marcus Johnson', type: 'mentee' },
      { id: 'mentee-2', name: 'Tyler Brown', type: 'mentee' },
      { id: 'mentor-3', name: 'Michael Chen', type: 'mentor' },
    ];
  }
};

const bubblePositions = [
  { top: '8%', left: '12%', size: 'md' },
  { top: '5%', right: '15%', size: 'sm' },
  { top: '35%', left: '5%', size: 'sm' },
  { top: '30%', right: '8%', size: 'md' },
  { top: '65%', left: '15%', size: 'sm' },
];

function getObjectPosition(x: number, y: number) {
  return `${50 + x}% ${50 + y}%`;
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { profile, user, refreshProfile, signOut } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const displayImage = profile?.avatar_url ?? undefined;
  const displayPosition = getObjectPosition(
    profile?.avatar_position_x ?? 0,
    profile?.avatar_position_y ?? 0,
  );

  const role = profile?.role ?? 'mentee';
  const fullName = profile ? `${profile.first_name} ${profile.last_name}`.trim() : '';
  const connections = getConnectionsForRole(role);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      await refreshProfile();
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const { error } = await supabase.rpc('delete_account');
      if (error) throw error;
      await signOut();
      navigate('/');
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account. Please try again.');
      setDeleting(false);
    }
  };

  const settingsItems = [
    {
      icon: Edit2,
      label: 'Edit Profile',
      onClick: () => setShowEditModal(true),
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
      onClick: handleSignOut,
      danger: true,
    },
    {
      icon: Trash2,
      label: 'Delete Account',
      onClick: () => { setDeleteConfirmText(''); setDeleteError(null); setShowDeleteModal(true); },
      danger: true,
    },
  ];

  return (
    <AppShell>
      <Header title="Profile" showNotifications className="bg-iron-900 border-iron-800 text-white" />

      <div className="relative bg-iron-900 pt-4 pb-8">
        {connections.slice(0, 5).map((connection, index) => {
          const pos = bubblePositions[index];
          const sizeClasses = pos.size === 'md' ? 'w-14 h-14' : 'w-11 h-11';
          const borderColor = connection.type === 'mentor'
            ? 'border-teal-400'
            : connection.type === 'mentee'
            ? 'border-brand-400'
            : 'border-iron-400';

          return (
            <div
              key={connection.id}
              className={`absolute ${sizeClasses} rounded-full border-2 ${borderColor} overflow-hidden shadow-lg`}
              style={{ top: pos.top, left: pos.left, right: pos.right }}
            >
              <Avatar
                name={connection.name}
                size={pos.size === 'md' ? 'lg' : 'md'}
                className="w-full h-full"
              />
            </div>
          );
        })}

        <div className="flex flex-col items-center relative z-10 pt-8">
          <div className="relative mb-4">
            <div className="absolute -inset-2 bg-gradient-to-br from-brand-400 to-flame-500 rounded-full opacity-30 blur-md" />
            <div className="relative p-1 bg-gradient-to-br from-brand-400 to-flame-500 rounded-full">
              <div className="p-1 bg-iron-900 rounded-full">
                <Avatar
                  src={displayImage}
                  name={fullName}
                  size="xl"
                  className="w-24 h-24"
                  style={{ objectPosition: displayPosition }}
                />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-1 right-1 w-8 h-8 bg-brand-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-iron-900 disabled:opacity-60"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-xl font-bold text-white mb-2">{fullName}</h2>
          <Badge
            variant={role === 'admin' ? 'default' : 'flame'}
            className={role === 'admin' ? 'bg-blue-500 text-white' : ''}
          >
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </Badge>

          {profile?.location && (
            <p className="text-sm text-iron-400 mt-2">{profile.location}</p>
          )}

          <p className="text-iron-300 text-sm mt-4 text-center max-w-xs px-4">
            Connect with mentors and friends in your journey.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-6 bg-iron-50 rounded-t-3xl" />
      </div>

      <div className="p-4 space-y-6 bg-iron-50">
        {profile?.bio && (
          <Card className="p-4">
            <h3 className="text-sm font-medium text-iron-500 mb-2">About</h3>
            <p className="text-iron-700">{profile.bio}</p>
          </Card>
        )}

        {role === 'mentor' && profile?.specialties && profile.specialties.length > 0 && (
          <Card className="p-4">
            <h3 className="text-sm font-medium text-iron-500 mb-3">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {profile.specialties.map((specialty) => {
                const colors = SPECIALTY_COLORS[specialty] || SPECIALTY_COLORS['default'];
                return (
                  <span
                    key={specialty}
                    className={`px-3 py-1 text-sm font-medium rounded-full ${colors.bg} ${colors.text}`}
                  >
                    {specialty}
                  </span>
                );
              })}
            </div>
          </Card>
        )}

        {profile?.interests && profile.interests.length > 0 && (
          <Card className="p-4">
            <h3 className="text-sm font-medium text-iron-500 mb-3">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
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

        {profile?.goals && profile.goals.length > 0 && (
          <Card className="p-4">
            <h3 className="text-sm font-medium text-iron-500 mb-3">Focus Areas</h3>
            <div className="flex flex-wrap gap-2">
              {profile.goals.map((goal) => (
                <span
                  key={goal}
                  className="px-3 py-1 bg-brand-100 text-brand-700 text-sm rounded-full"
                >
                  {goal}
                </span>
              ))}
            </div>
          </Card>
        )}

        <Card className="p-4">
          <h3 className="text-sm font-medium text-iron-500 mb-4">Your Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-brand-600" />
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
              <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
                <Award className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-iron-900">{mockUserStats.badgesEarned}</p>
                <p className="text-xs text-iron-500">Badges</p>
              </div>
            </div>
          </div>
        </Card>

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

        <p className="text-center text-xs text-iron-400 pb-4">
          Iron Sharpens Iron v1.0.0
        </p>
      </div>
      {showEditModal && (
        <EditProfileModal onClose={() => setShowEditModal(false)} />
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => !deleting && setShowDeleteModal(false)}
          />
          <div className="relative bg-white rounded-t-2xl w-full max-w-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="font-bold text-iron-900 text-lg">Delete Account</h2>
                <p className="text-sm text-iron-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-iron-700 text-sm mb-4">
              Deleting your account will permanently remove your profile, matches, sessions, goals, and all associated data.
            </p>

            <p className="text-sm font-medium text-iron-700 mb-2">
              Type <span className="font-bold text-red-600">DELETE</span> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-4 py-3 bg-iron-50 rounded-xl border border-iron-200 focus:ring-2 focus:ring-red-500 focus:outline-none text-sm mb-4"
              disabled={deleting}
            />

            {deleteError && (
              <p className="text-sm text-red-600 mb-4">{deleteError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 py-3 px-4 bg-iron-100 text-iron-700 rounded-xl font-medium hover:bg-iron-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || deleting}
                className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
