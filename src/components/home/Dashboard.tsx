import { useState } from 'react';
import {
  Calendar, MessageCircle, Target, TrendingUp,
  ChevronRight, Sparkles, Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '../layout';
import { Card, Avatar, Badge, Button } from '../ui';

// Mock data for demonstration
const mockUser = {
  firstName: 'Marcus',
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

  return (
    <div className="min-h-screen bg-iron-50">
      <Header
        showNotifications
        className="bg-iron-50 border-none"
      />

      <div className="px-4 pb-6">
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
