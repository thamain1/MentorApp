import { useState } from 'react';
import {
  Users,
  UserCheck,
  Calendar,
  AlertTriangle,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  Shield,
} from 'lucide-react';
import { AppShell, Header } from '../layout';
import { Card, Avatar, Badge, Button } from '../ui';
import {
  mockAdminStats,
  mockPendingMatches,
  mockFlaggedItems,
  type PendingMatch,
  type FlaggedItem,
} from '../../data/mockData';
import { formatRelativeTime } from '../../lib/utils';

type AdminTab = 'overview' | 'matches' | 'safety';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [pendingMatches, setPendingMatches] = useState(mockPendingMatches);

  const handleApproveMatch = (matchId: string) => {
    setPendingMatches(pendingMatches.filter((m) => m.id !== matchId));
    // In real app, update match status in Supabase
  };

  const handleDeclineMatch = (matchId: string) => {
    setPendingMatches(pendingMatches.filter((m) => m.id !== matchId));
    // In real app, update match status in Supabase
  };

  return (
    <AppShell>
      <Header title="Admin Dashboard" showBack />

      <div className="p-4 space-y-4">
        {/* Admin Badge */}
        <Card className="bg-gradient-to-br from-iron-800 to-iron-900 border-none text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-semibold">Admin Panel</h2>
              <p className="text-sm text-white/70">Manage matches, users, and safety</p>
            </div>
          </div>
        </Card>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {[
            { value: 'overview', label: 'Overview', icon: BarChart3 },
            { value: 'matches', label: 'Matches', icon: UserCheck, badge: pendingMatches.length },
            { value: 'safety', label: 'Safety', icon: AlertTriangle, badge: mockFlaggedItems.length },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as AdminTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.value
                  ? 'bg-flame-500 text-white'
                  : 'bg-iron-100 text-iron-600 hover:bg-iron-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.badge && tab.badge > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === tab.value
                    ? 'bg-white/20'
                    : 'bg-flame-500 text-white'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-iron-900">{mockAdminStats.totalMentors}</p>
                    <p className="text-xs text-iron-500">Mentors</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-iron-900">{mockAdminStats.totalMentees}</p>
                    <p className="text-xs text-iron-500">Mentees</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-flame-100 rounded-xl flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-flame-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-iron-900">{mockAdminStats.activeMatches}</p>
                    <p className="text-xs text-iron-500">Active Matches</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-iron-900">{mockAdminStats.pendingMatches}</p>
                    <p className="text-xs text-iron-500">Pending</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Session Stats */}
            <Card>
              <h3 className="font-semibold text-iron-900 mb-3">This Month</h3>
              <div className="flex items-center justify-between py-2 border-b border-iron-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-iron-400" />
                  <span className="text-sm text-iron-600">Total Sessions</span>
                </div>
                <span className="font-semibold text-iron-900">{mockAdminStats.sessionsThisMonth}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-iron-400" />
                  <span className="text-sm text-iron-600">Avg per Match</span>
                </div>
                <span className="font-semibold text-iron-900">{mockAdminStats.averageSessionsPerMatch}</span>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="hover:border-flame-200 transition-colors cursor-pointer" onClick={() => setActiveTab('matches')}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-iron-900">Pending Match Requests</p>
                  <p className="text-sm text-iron-500">{pendingMatches.length} awaiting review</p>
                </div>
                <ChevronRight className="w-5 h-5 text-iron-400" />
              </div>
            </Card>
          </div>
        )}

        {/* Matches Tab */}
        {activeTab === 'matches' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-iron-500 uppercase tracking-wide">
              Pending Approval ({pendingMatches.length})
            </h3>

            {pendingMatches.length === 0 ? (
              <Card className="p-6 text-center">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                <p className="text-iron-600 font-medium">All caught up!</p>
                <p className="text-sm text-iron-500">No pending match requests</p>
              </Card>
            ) : (
              pendingMatches.map((match) => (
                <PendingMatchCard
                  key={match.id}
                  match={match}
                  onApprove={() => handleApproveMatch(match.id)}
                  onDecline={() => handleDeclineMatch(match.id)}
                />
              ))
            )}
          </div>
        )}

        {/* Safety Tab */}
        {activeTab === 'safety' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-iron-500 uppercase tracking-wide">
              Flagged Items ({mockFlaggedItems.length})
            </h3>

            {mockFlaggedItems.length === 0 ? (
              <Card className="p-6 text-center">
                <Shield className="w-10 h-10 text-green-500 mx-auto mb-2" />
                <p className="text-iron-600 font-medium">All clear!</p>
                <p className="text-sm text-iron-500">No safety concerns to review</p>
              </Card>
            ) : (
              mockFlaggedItems.map((item) => (
                <FlaggedItemCard key={item.id} item={item} />
              ))
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}

interface PendingMatchCardProps {
  match: PendingMatch;
  onApprove: () => void;
  onDecline: () => void;
}

function PendingMatchCard({ match, onApprove, onDecline }: PendingMatchCardProps) {
  const mentorName = `${match.mentor.first_name} ${match.mentor.last_name}`;
  const menteeName = `${match.mentee.first_name} ${match.mentee.last_name}`;

  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="warning">Pending Review</Badge>
          <span className="text-xs text-iron-500">{formatRelativeTime(match.requestedAt)}</span>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex -space-x-2">
            <Avatar name={menteeName} src={match.mentee.avatar_url} size="md" className="ring-2 ring-white" />
            <Avatar name={mentorName} src={match.mentor.avatar_url} size="md" className="ring-2 ring-white" />
          </div>
          <div>
            <p className="font-medium text-iron-900">{menteeName}</p>
            <p className="text-sm text-iron-500">wants to match with {mentorName}</p>
          </div>
        </div>

        {match.menteeMessage && (
          <div className="p-3 bg-iron-50 rounded-lg mb-3">
            <p className="text-sm text-iron-600">"{match.menteeMessage}"</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onDecline}>
            <XCircle className="w-4 h-4 mr-1" />
            Decline
          </Button>
          <Button size="sm" className="flex-1" onClick={onApprove}>
            <CheckCircle className="w-4 h-4 mr-1" />
            Approve
          </Button>
        </div>
      </div>
    </Card>
  );
}

interface FlaggedItemCardProps {
  item: FlaggedItem;
}

function FlaggedItemCard({ item }: FlaggedItemCardProps) {
  const getSeverityBadge = () => {
    switch (item.severity) {
      case 'low':
        return <Badge variant="default">Low</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium</Badge>;
      case 'high':
        return <Badge variant="danger">High</Badge>;
    }
  };

  return (
    <Card className={`border-l-4 ${
      item.severity === 'high' ? 'border-l-red-500' :
      item.severity === 'medium' ? 'border-l-amber-500' :
      'border-l-iron-300'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          item.severity === 'high' ? 'bg-red-100' :
          item.severity === 'medium' ? 'bg-amber-100' :
          'bg-iron-100'
        }`}>
          <AlertTriangle className={`w-5 h-5 ${
            item.severity === 'high' ? 'text-red-600' :
            item.severity === 'medium' ? 'text-amber-600' :
            'text-iron-600'
          }`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {getSeverityBadge()}
            <Badge variant="default" className="capitalize">{item.type}</Badge>
          </div>
          <p className="text-sm text-iron-900 mb-1">{item.description}</p>
          <p className="text-xs text-iron-500">
            Reported {formatRelativeTime(item.reportedAt)}
          </p>
        </div>
        <Button variant="outline" size="sm">Review</Button>
      </div>
    </Card>
  );
}
