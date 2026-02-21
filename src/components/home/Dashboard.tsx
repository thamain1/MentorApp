import { useState, useMemo } from 'react';
import {
  Calendar, MessageCircle, Target, TrendingUp,
  ChevronRight, Sparkles, Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '../layout';
import { Card, Avatar, Badge, Button } from '../ui';
import { mockCurrentUser } from '../../data/mockData';

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

// Mock data for demonstration
const mockUser = {
  firstName: mockCurrentUser.first_name,
  role: 'mentee' as const,
};

const mockMatch = {
  id: 'match-1',
  mentorName: 'David Williams',
  mentorAvatar: null,
  nextSession: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
  matchedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 3 weeks ago
};

const mockGoals = [
  { id: '1', title: 'Improve public speaking', progress: 60 },
  { id: '2', title: 'Read 2 books this month', progress: 50 },
];

const dailyPrompt = "What's one thing you're grateful for today?";

export function Dashboard() {
  const [checkedIn, setCheckedIn] = useState(false);

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

  return (
    <div className="min-h-screen bg-iron-50">
      {/* Collage Header */}
      <div className="relative">
        <div className="h-40 overflow-hidden">
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
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
              </div>
            ))}
          </div>
          {/* Bottom fade to background */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-iron-50 to-transparent" />
        </div>

        {/* Header overlay */}
        <div className="absolute top-0 left-0 right-0">
          <Header
            showNotifications
            className="bg-transparent border-none text-white"
          />
        </div>
      </div>

      <div className="px-4 pb-6 pt-4">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-iron-900">
            Hey, {mockUser.firstName}! 👋
          </h1>
          <p className="text-iron-500">Let's make today count.</p>
        </div>

        {/* Daily Check-in */}
        {!checkedIn && (
          <Card className="mb-4 bg-gradient-to-br from-flame-500 to-flame-600 border-none text-white">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Daily Check-in</h3>
                <p className="text-sm text-white/80 mb-3">{dailyPrompt}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white text-flame-600 hover:bg-white/90"
                  onClick={() => setCheckedIn(true)}
                >
                  Check In
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Match Card */}
        {mockMatch && (
          <Card className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-iron-900">Your Mentor</h3>
              <Badge variant="success">Active</Badge>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <Avatar name={mockMatch.mentorName} size="lg" />
              <div>
                <h4 className="font-medium text-iron-900">{mockMatch.mentorName}</h4>
                <p className="text-sm text-iron-500">Matched 2 weeks ago</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to={`/messages/${mockMatch.id}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>
              </Link>
              <Link to={`/sessions/${mockMatch.id}`} className="flex-1">
                <Button className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Upcoming Session */}
        {mockMatch?.nextSession && (
          <Link to={`/sessions/${mockMatch.id}`}>
            <Card className="mb-4 hover:border-flame-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-flame-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-flame-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-iron-900">Next Session</h4>
                  <p className="text-sm text-iron-500">
                    {mockMatch.nextSession.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-iron-400" />
              </div>
            </Card>
          </Link>
        )}

        {/* Goals Progress */}
        <Card className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-iron-900">Your Goals</h3>
            <Link to="/goals" className="text-sm text-flame-500 font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {mockGoals.map((goal) => (
              <div key={goal.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-iron-700">{goal.title}</span>
                  <span className="text-xs text-iron-500">{goal.progress}%</span>
                </div>
                <div className="h-2 bg-iron-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-flame-500 rounded-full transition-all"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <Link to="/goals">
            <Button variant="ghost" size="sm" className="w-full mt-4">
              <Target className="w-4 h-4 mr-2" />
              Add New Goal
            </Button>
          </Link>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/sessions">
            <Card className="hover:border-flame-200 transition-colors">
              <div className="w-10 h-10 bg-flame-100 rounded-xl flex items-center justify-center mb-3">
                <Calendar className="w-5 h-5 text-flame-600" />
              </div>
              <h4 className="font-medium text-iron-900 text-sm">Sessions</h4>
              <p className="text-xs text-iron-500">View all sessions</p>
            </Card>
          </Link>
          <Link to="/training">
            <Card className="hover:border-flame-200 transition-colors">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-medium text-iron-900 text-sm">Training</h4>
              <p className="text-xs text-iron-500">Continue learning</p>
            </Card>
          </Link>
          <Link to="/community">
            <Card className="hover:border-flame-200 transition-colors">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                <MessageCircle className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="font-medium text-iron-900 text-sm">Community</h4>
              <p className="text-xs text-iron-500">Join the conversation</p>
            </Card>
          </Link>
          <Link to="/goals">
            <Card className="hover:border-flame-200 transition-colors">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="font-medium text-iron-900 text-sm">Goals</h4>
              <p className="text-xs text-iron-500">Track your progress</p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
