import { useMemo } from 'react';
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

// Image mapping for interests and goals - using verified Unsplash URLs
const interestImages: Record<string, string> = {
  // Sports & Fitness
  'basketball': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&q=80',
  'football': 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=400&q=80',
  'fitness': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80',
  'sports': 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&q=80',
  'running': 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&q=80',
  'health': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80',

  // Education & Career
  'education': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80',
  'college': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&q=80',
  'career': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&q=80',
  'coding': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=80',
  'technology': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80',
  'reading': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80',
  'academic': 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400&q=80',

  // Business & Finance
  'entrepreneur': 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&q=80',
  'business': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80',
  'finance': 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&q=80',
  'leadership': 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=400&q=80',

  // Creative & Arts
  'music': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
  'art': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&q=80',
  'photography': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&q=80',
  'gaming': 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&q=80',

  // Life Skills & Personal Development
  'communication': 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80',
  'confidence': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80',
  'life skills': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&q=80',
  'personal growth': 'https://images.unsplash.com/photo-1493836512294-502baa1986e2?w=400&q=80',
  'development': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80',

  // Faith & Community
  'faith': 'https://images.unsplash.com/photo-1445633883498-7f9922d37a3f?w=400&q=80',
  'community': 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&q=80',
  'volunteering': 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&q=80',

  // Trades & Construction
  'construction': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80',
  'trades': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&q=80',
  'automotive': 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400&q=80',

  // Default/Mentorship
  'mentorship': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80',
  'growth': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80',
};

// Fallback images if no match found
const fallbackImages = [
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&q=80',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80',
  'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&q=80',
  'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=400&q=80',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&q=80',
];

export function ProfilePage() {
  const navigate = useNavigate();
  const fullName = `${mockCurrentUser.first_name} ${mockCurrentUser.last_name}`;

  // Get 6 relevant images based on interests and goals
  const collageImages = useMemo(() => {
    const allKeywords = [
      ...mockCurrentUser.interests,
      ...mockCurrentUser.goals,
    ].map(k => k.toLowerCase());

    const matchedImages: string[] = [];

    // Try to find matching images for each keyword
    for (const keyword of allKeywords) {
      if (matchedImages.length >= 6) break;

      // Check for exact match
      if (interestImages[keyword] && !matchedImages.includes(interestImages[keyword])) {
        matchedImages.push(interestImages[keyword]);
        continue;
      }

      // Check for partial match
      for (const [key, url] of Object.entries(interestImages)) {
        if (matchedImages.length >= 6) break;
        if ((keyword.includes(key) || key.includes(keyword)) && !matchedImages.includes(url)) {
          matchedImages.push(url);
          break;
        }
      }
    }

    // Fill remaining slots with fallback images
    let fallbackIndex = 0;
    while (matchedImages.length < 6 && fallbackIndex < fallbackImages.length) {
      if (!matchedImages.includes(fallbackImages[fallbackIndex])) {
        matchedImages.push(fallbackImages[fallbackIndex]);
      }
      fallbackIndex++;
    }

    return matchedImages.slice(0, 6);
  }, []);

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

      {/* Profile Header with Collage */}
      <div className="relative">
        {/* Image Collage Background */}
        <div className="h-48 overflow-hidden">
          <div className="grid grid-cols-3 grid-rows-2 h-full">
            {collageImages.map((image, index) => (
              <div
                key={index}
                className="relative overflow-hidden"
              >
                <img
                  src={image}
                  alt=""
                  className="w-full h-full object-cover"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
              </div>
            ))}
          </div>
          {/* Bottom fade gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
        </div>

        {/* Profile Avatar - overlapping the collage */}
        <div className="flex flex-col items-center -mt-16 relative z-10">
          <div className="relative mb-3">
            <div className="p-1 bg-white rounded-full shadow-lg">
              <Avatar
                src={mockCurrentUser.avatar_url}
                name={fullName}
                size="xl"
              />
            </div>
            <button className="absolute bottom-1 right-1 w-8 h-8 bg-flame-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-xl font-bold text-iron-900">{fullName}</h2>
          <Badge variant="flame" className="mt-2">Mentee</Badge>

          {mockCurrentUser.location && (
            <p className="text-sm text-iron-500 mt-2">{mockCurrentUser.location}</p>
          )}
        </div>
      </div>

      <div className="p-4 space-y-6 -mt-2">

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
