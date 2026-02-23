import { useState, useEffect, useCallback } from 'react';
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
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { formatRelativeTime } from '../../lib/utils';
import type { Database } from '../../types/database.types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

interface AdminStats {
  totalMentors: number;
  totalMentees: number;
  activeMatches: number;
  pendingMatches: number;
}

interface PendingMatchRow {
  id: string;
  mentor_id: string;
  mentee_id: string;
  requested_at: string;
  mentee_message: string | null;
  mentor: Pick<ProfileRow, 'id' | 'first_name' | 'last_name' | 'avatar_url'>;
  mentee: Pick<ProfileRow, 'id' | 'first_name' | 'last_name' | 'avatar_url'>;
}

type AdminTab = 'overview' | 'matches' | 'safety';

export function AdminDashboard() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<AdminStats>({
    totalMentors: 0,
    totalMentees: 0,
    activeMatches: 0,
    pendingMatches: 0,
  });
  const [pendingMatches, setPendingMatches] = useState<PendingMatchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setStatsError(null);

    try {
      // Run all count queries in parallel
      const [
        { count: mentorCount },
        { count: menteeCount },
        { count: activeCount },
        { count: pendingCount },
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'mentor'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'mentee'),
        supabase.from('matches').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('matches').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      setStats({
        totalMentors: mentorCount ?? 0,
        totalMentees: menteeCount ?? 0,
        activeMatches: activeCount ?? 0,
        pendingMatches: pendingCount ?? 0,
      });

      // Fetch pending matches with mentor and mentee profile info
      const { data: pendingRows, error: pendingError } = await supabase
        .from('matches')
        .select('id, mentor_id, mentee_id, requested_at, mentee_message')
        .eq('status', 'pending')
        .order('requested_at', { ascending: true });

      if (pendingError) throw pendingError;

      if (!pendingRows || pendingRows.length === 0) {
        setPendingMatches([]);
        return;
      }

      // Collect all profile IDs referenced in pending matches
      const profileIdSet = new Set<string>();
      pendingRows.forEach((m) => {
        profileIdSet.add(m.mentor_id);
        profileIdSet.add(m.mentee_id);
      });

      const { data: profileRows, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .in('id', Array.from(profileIdSet));

      if (profileError) throw profileError;

      const profileMap = new Map(
        (profileRows ?? []).map((p) => [
          p.id,
          p as Pick<ProfileRow, 'id' | 'first_name' | 'last_name' | 'avatar_url'>,
        ])
      );

      const fallbackProfile = (id: string): Pick<ProfileRow, 'id' | 'first_name' | 'last_name' | 'avatar_url'> => ({
        id,
        first_name: 'Unknown',
        last_name: '',
        avatar_url: null,
      });

      const enriched: PendingMatchRow[] = pendingRows.map((m) => ({
        id: m.id,
        mentor_id: m.mentor_id,
        mentee_id: m.mentee_id,
        requested_at: m.requested_at,
        mentee_message: m.mentee_message,
        mentor: profileMap.get(m.mentor_id) ?? fallbackProfile(m.mentor_id),
        mentee: profileMap.get(m.mentee_id) ?? fallbackProfile(m.mentee_id),
      }));

      setPendingMatches(enriched);
    } catch (err) {
      setStatsError('Failed to load admin data. Please try again.');
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApproveMatch = async (matchId: string) => {
    if (!profile) return;

    const { error } = await supabase
      .from('matches')
      .update({
        status: 'active',
        approved_at: new Date().toISOString(),
        approved_by: profile.id,
      })
      .eq('id', matchId);

    if (error) {
      console.error('Error approving match:', error);
      return;
    }

    setPendingMatches((prev) => prev.filter((m) => m.id !== matchId));
    setStats((prev) => ({
      ...prev,
      pendingMatches: Math.max(0, prev.pendingMatches - 1),
      activeMatches: prev.activeMatches + 1,
    }));
  };

  const handleDeclineMatch = async (matchId: string) => {
    const { error } = await supabase
      .from('matches')
      .update({ status: 'cancelled' })
      .eq('id', matchId);

    if (error) {
      console.error('Error declining match:', error);
      return;
    }

    setPendingMatches((prev) => prev.filter((m) => m.id !== matchId));
    setStats((prev) => ({
      ...prev,
      pendingMatches: Math.max(0, prev.pendingMatches - 1),
    }));
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
            { value: 'safety', label: 'Safety', icon: AlertTriangle, badge: 0 },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as AdminTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.value
                  ? 'bg-brand-500 text-white'
                  : 'bg-iron-100 text-iron-600 hover:bg-iron-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.badge != null && tab.badge > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === tab.value
                    ? 'bg-white/20'
                    : 'bg-brand-500 text-white'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-iron-100 rounded-xl h-20 animate-pulse" />
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && statsError && (
          <Card className="p-6 text-center">
            <p className="text-iron-600 font-medium mb-1">{statsError}</p>
            <button
              onClick={fetchData}
              className="text-sm text-blue-500 hover:underline mt-2"
            >
              Retry
            </button>
          </Card>
        )}

        {/* Overview Tab */}
        {!loading && !statsError && activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-iron-900">{stats.totalMentors}</p>
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
                    <p className="text-2xl font-bold text-iron-900">{stats.totalMentees}</p>
                    <p className="text-xs text-iron-500">Mentees</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-iron-900">{stats.activeMatches}</p>
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
                    <p className="text-2xl font-bold text-iron-900">{stats.pendingMatches}</p>
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
                <span className="font-semibold text-iron-900">—</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-iron-400" />
                  <span className="text-sm text-iron-600">Avg per Match</span>
                </div>
                <span className="font-semibold text-iron-900">—</span>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card
              className="hover:border-brand-200 transition-colors cursor-pointer"
              onClick={() => setActiveTab('matches')}
            >
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
        {!loading && !statsError && activeTab === 'matches' && (
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
        {!loading && !statsError && activeTab === 'safety' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-iron-500 uppercase tracking-wide">
              Flagged Items (0)
            </h3>

            <Card className="p-6 text-center">
              <Shield className="w-10 h-10 text-green-500 mx-auto mb-2" />
              <p className="text-iron-600 font-medium">All clear!</p>
              <p className="text-sm text-iron-500">No safety concerns to review</p>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}

interface PendingMatchCardProps {
  match: PendingMatchRow;
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
          <span className="text-xs text-iron-500">{formatRelativeTime(match.requested_at)}</span>
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

        {match.mentee_message && (
          <div className="p-3 bg-iron-50 rounded-lg mb-3">
            <p className="text-sm text-iron-600">"{match.mentee_message}"</p>
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
