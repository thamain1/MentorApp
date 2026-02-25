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
  BarChart2,
} from 'lucide-react';
import { AppShell, Header } from '../layout';
import { Card, Avatar, Badge, Button } from '../ui';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { formatRelativeTime } from '../../lib/utils';
import type { Database } from '../../types/database.types';
import { MentorsDetail } from './MentorsDetail';
import { MenteesDetail } from './MenteesDetail';
import { ActiveMatchesDetail } from './ActiveMatchesDetail';
import { PendingDetail } from './PendingDetail';

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

type AdminTab = 'overview' | 'matches' | 'safety' | 'reports';
type DetailView = 'mentors' | 'mentees' | 'active-matches' | 'pending' | null;

// ---- Report data types ----
interface SurveyRow {
  mentor_id: string;
  overall_rating: number;
  communication_rating: number;
  helpfulness_rating: number;
  created_at: string;
}

interface SessionReportRow {
  id: string;
  duration_mins: number;
  session_type: string;
  meeting_type: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  match_id: string | null;
}

interface MatchReportRow {
  id: string;
  status: string;
  created_at: string;
  approved_at: string | null;
  ended_at: string | null;
  mentor_id: string;
}

interface GoalReportRow { id: string; status: string; }
interface TrainingRow { id: string; completed_at: string; }
interface CheckInRow { id: string; created_at: string; }
interface PostRow { id: string; created_at: string; }

interface MentorStatRow {
  mentor_id: string;
  name: string;
  avgOverall: number;
  avgComm: number;
  avgHelp: number;
  reviewCount: number;
}

interface ReportData {
  sessions: SessionReportRow[];
  surveys: SurveyRow[];
  matches: MatchReportRow[];
  goals: GoalReportRow[];
  training: TrainingRow[];
  checkIns: CheckInRow[];
  posts: PostRow[];
  mentorProfiles: Pick<ProfileRow, 'id' | 'first_name' | 'last_name'>[];
}

const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
const thisMonth = () => new Date().toISOString().slice(0, 7);

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
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState<string | null>(null);
  const [reportsLoaded, setReportsLoaded] = useState(false);
  const [detailView, setDetailView] = useState<DetailView>(null);

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

  const fetchReports = useCallback(async () => {
    setReportsLoading(true);
    setReportsError(null);
    try {
      const [sessionsRes, surveysRes, matchesRes, goalsRes, trainingRes, checkInsRes, postsRes] =
        await Promise.all([
          supabase.from('sessions').select('id, duration_mins, session_type, meeting_type, status, created_at, completed_at, match_id'),
          supabase.from('mentor_surveys').select('mentor_id, overall_rating, communication_rating, helpfulness_rating, created_at'),
          supabase.from('matches').select('id, status, created_at, approved_at, ended_at, mentor_id'),
          supabase.from('goals').select('id, status'),
          supabase.from('user_training_progress').select('id, completed_at'),
          supabase.from('check_ins').select('id, created_at'),
          supabase.from('posts').select('id, created_at'),
        ]);

      const mentorIds = [...new Set((surveysRes.data ?? []).map((s) => s.mentor_id))];
      let mentorProfiles: Pick<ProfileRow, 'id' | 'first_name' | 'last_name'>[] = [];
      if (mentorIds.length) {
        const { data: mpData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', mentorIds);
        mentorProfiles = (mpData ?? []) as Pick<ProfileRow, 'id' | 'first_name' | 'last_name'>[];
      }

      setReportData({
        sessions: (sessionsRes.data ?? []) as SessionReportRow[],
        surveys: (surveysRes.data ?? []) as SurveyRow[],
        matches: (matchesRes.data ?? []) as MatchReportRow[],
        goals: (goalsRes.data ?? []) as GoalReportRow[],
        training: (trainingRes.data ?? []) as TrainingRow[],
        checkIns: (checkInsRes.data ?? []) as CheckInRow[],
        posts: (postsRes.data ?? []) as PostRow[],
        mentorProfiles,
      });
      setReportsLoaded(true);
    } catch (err) {
      setReportsError('Failed to load report data. Please try again.');
      console.error('Error fetching reports:', err);
    } finally {
      setReportsLoading(false);
    }
  }, []);

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    setDetailView(null);
    if (tab === 'reports' && !reportsLoaded) {
      fetchReports();
    }
  };

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
            { value: 'reports', label: 'Reports', icon: BarChart2 },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value as AdminTab)}
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
              <Card className="p-4 cursor-pointer hover:border-brand-200 active:scale-95 transition-all" onClick={() => setDetailView('mentors')}>
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
              <Card className="p-4 cursor-pointer hover:border-brand-200 active:scale-95 transition-all" onClick={() => setDetailView('mentees')}>
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
              <Card className="p-4 cursor-pointer hover:border-brand-200 active:scale-95 transition-all" onClick={() => setDetailView('active-matches')}>
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
              <Card className="p-4 cursor-pointer hover:border-brand-200 active:scale-95 transition-all" onClick={() => setDetailView('pending')}>
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

            {/* Detail panels */}
            {detailView === 'mentors' && (
              <MentorsDetail onBack={() => setDetailView(null)} onChanged={fetchData} />
            )}
            {detailView === 'mentees' && (
              <MenteesDetail onBack={() => setDetailView(null)} onChanged={fetchData} />
            )}
            {detailView === 'active-matches' && (
              <ActiveMatchesDetail onBack={() => setDetailView(null)} onChanged={fetchData} />
            )}
            {detailView === 'pending' && (
              <PendingDetail onBack={() => setDetailView(null)} onChanged={fetchData} />
            )}

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

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <ReportsTab
            loading={reportsLoading}
            error={reportsError}
            data={reportData}
            onRetry={() => { setReportsLoaded(false); fetchReports(); }}
          />
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

// ---- Reports Tab ----
interface ReportsTabProps {
  loading: boolean;
  error: string | null;
  data: ReportData | null;
  onRetry: () => void;
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-iron-50 last:border-0">
      <span className="text-sm text-iron-600">{label}</span>
      <span className="font-semibold text-iron-900">{value}</span>
    </div>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="h-2 bg-iron-100 rounded-full overflow-hidden mt-1">
      <div
        className="h-2 bg-brand-500 rounded-full"
        style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
      />
    </div>
  );
}

function ReportsTab({ loading, error, data, onRetry }: ReportsTabProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-iron-100 rounded-xl h-28 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-iron-600 mb-2">{error}</p>
        <button onClick={onRetry} className="text-sm text-brand-500 hover:underline">
          Retry
        </button>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="p-6 text-center">
        <p className="text-iron-500 text-sm">Select the Reports tab to load analytics.</p>
      </Card>
    );
  }

  const cm = thisMonth();

  // ---- Section 1: Session Analytics ----
  const allSessions = data.sessions;
  const completed = allSessions.filter((s) => s.status === 'completed');
  const cancelled = allSessions.filter((s) => s.status === 'cancelled');
  const completedThisMonth = completed.filter((s) =>
    (s.completed_at ?? s.created_at).startsWith(cm)
  );
  const avgDuration = completed.length
    ? Math.round(avg(completed.map((s) => s.duration_mins)))
    : 0;
  const oneOnOne = allSessions.filter((s) => s.session_type === '1on1').length;
  const group = allSessions.filter((s) => s.session_type === 'group').length;
  const total = allSessions.length || 1;
  const video = allSessions.filter((s) => s.meeting_type === 'video').length;
  const voice = allSessions.filter((s) => s.meeting_type === 'voice').length;
  const chat = allSessions.filter((s) => s.meeting_type === 'chat').length;

  // ---- Section 2: Mentor Performance ----
  const surveysByMentor = new Map<string, SurveyRow[]>();
  data.surveys.forEach((s) => {
    const list = surveysByMentor.get(s.mentor_id) ?? [];
    list.push(s);
    surveysByMentor.set(s.mentor_id, list);
  });

  const mentorStats: MentorStatRow[] = data.mentorProfiles.map((p) => {
    const reviews = surveysByMentor.get(p.id) ?? [];
    return {
      mentor_id: p.id,
      name: `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim(),
      avgOverall: avg(reviews.map((r) => r.overall_rating)),
      avgComm: avg(reviews.map((r) => r.communication_rating)),
      avgHelp: avg(reviews.map((r) => r.helpfulness_rating)),
      reviewCount: reviews.length,
    };
  });
  const platformAvg = data.surveys.length
    ? avg(data.surveys.map((s) => s.overall_rating)).toFixed(1)
    : '—';

  const mentorsWithNoSurveys = data.mentorProfiles.filter(
    (p) => !(surveysByMentor.get(p.id)?.length)
  );

  // ---- Section 3: Match Health ----
  const activeMatches = data.matches.filter((m) => m.status === 'active');
  const pendingM = data.matches.filter((m) => m.status === 'pending').length;
  const completedM = data.matches.filter((m) => m.status === 'completed').length;
  const cancelledM = data.matches.filter((m) => m.status === 'cancelled').length;

  const now = Date.now();
  const activeAges = activeMatches
    .filter((m) => m.approved_at)
    .map((m) => (now - new Date(m.approved_at!).getTime()) / (1000 * 60 * 60 * 24));
  const avgMatchAge = activeAges.length ? Math.round(avg(activeAges)) : 0;

  // At-risk: active matches with 0 completed sessions
  const matchesWithSessionIds = new Set(
    data.sessions
      .filter((s): s is SessionReportRow & { match_id: string } =>
        s.status === 'completed' && s.match_id !== null
      )
      .map((s) => s.match_id)
  );
  const atRisk = activeMatches.filter((m) => !matchesWithSessionIds.has(m.id)).length;

  // ---- Section 4: Mentee Progress & Engagement ----
  const activeGoals = data.goals.filter((g) => g.status === 'active').length;
  const completedGoals = data.goals.filter((g) => g.status === 'completed').length;
  const totalGoals = activeGoals + completedGoals;
  const goalRate = totalGoals ? Math.round((completedGoals / totalGoals) * 100) : 0;

  const trainingThisMonth = data.training.filter((t) => t.completed_at.startsWith(cm)).length;
  const checkInsThisMonth = data.checkIns.filter((c) => c.created_at.startsWith(cm)).length;
  const postsThisMonth = data.posts.filter((p) => p.created_at.startsWith(cm)).length;

  return (
    <div className="space-y-4">
      {/* Section 1: Session Analytics */}
      <Card>
        <h3 className="font-semibold text-iron-900 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-brand-600" />
          Session Analytics
        </h3>
        <StatRow label="Total Sessions" value={allSessions.length} />
        <StatRow label="Completed" value={completed.length} />
        <StatRow label="Cancelled" value={cancelled.length} />
        <StatRow label="Completed This Month" value={completedThisMonth.length} />
        <StatRow label="Avg Duration (min)" value={avgDuration || '—'} />

        <div className="mt-3 space-y-2">
          <p className="text-xs font-medium text-iron-500 uppercase tracking-wide">Type</p>
          <div>
            <div className="flex justify-between text-sm text-iron-600 mb-0.5">
              <span>1:1 ({oneOnOne})</span>
              <span>{total > 1 ? Math.round((oneOnOne / total) * 100) : 0}%</span>
            </div>
            <ProgressBar pct={(oneOnOne / total) * 100} />
          </div>
          <div>
            <div className="flex justify-between text-sm text-iron-600 mb-0.5">
              <span>Group ({group})</span>
              <span>{total > 1 ? Math.round((group / total) * 100) : 0}%</span>
            </div>
            <ProgressBar pct={(group / total) * 100} />
          </div>
        </div>

        <div className="mt-3 flex gap-4 text-sm text-iron-600">
          <span>Video {video}</span>
          <span>Voice {voice}</span>
          <span>Chat {chat}</span>
        </div>
      </Card>

      {/* Section 2: Mentor Performance */}
      <Card>
        <h3 className="font-semibold text-iron-900 mb-1 flex items-center gap-2">
          <Users className="w-4 h-4 text-teal-600" />
          Mentor Performance
        </h3>
        <p className="text-xs text-iron-500 mb-3">Platform avg: ★ {platformAvg}</p>

        {mentorStats.length === 0 ? (
          <p className="text-sm text-iron-500 italic">No survey responses yet.</p>
        ) : (
          <div className="space-y-2">
            {mentorStats.filter((m) => m.reviewCount > 0).map((m) => (
              <div key={m.mentor_id} className="p-3 bg-iron-50 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-iron-900 text-sm">{m.name}</span>
                  <span className="text-xs text-iron-500">{m.reviewCount} review{m.reviewCount !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex gap-3 text-xs text-iron-600">
                  <span>Overall {m.avgOverall.toFixed(1)}★</span>
                  <span>Comm {m.avgComm.toFixed(1)}★</span>
                  <span>Help {m.avgHelp.toFixed(1)}★</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {mentorsWithNoSurveys.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-medium text-iron-500 mb-1">No responses yet:</p>
            {mentorsWithNoSurveys.map((p) => (
              <p key={p.id} className="text-sm text-iron-400 italic">
                {`${p.first_name ?? ''} ${p.last_name ?? ''}`.trim()}
              </p>
            ))}
          </div>
        )}
      </Card>

      {/* Section 3: Match Health */}
      <Card>
        <h3 className="font-semibold text-iron-900 mb-3 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-green-600" />
          Match Health
        </h3>
        <StatRow label="Active" value={activeMatches.length} />
        <StatRow label="Pending" value={pendingM} />
        <StatRow label="Completed" value={completedM} />
        <StatRow label="Cancelled" value={cancelledM} />
        <StatRow label="Avg Active Match Age (days)" value={avgMatchAge || '—'} />
        <StatRow label="At-Risk (0 sessions)" value={atRisk} />
      </Card>

      {/* Section 4: Mentee Progress & Engagement */}
      <Card>
        <h3 className="font-semibold text-iron-900 mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-coral-600" />
          Mentee Progress & Engagement
        </h3>

        <p className="text-xs font-medium text-iron-500 uppercase tracking-wide mb-2">Goals</p>
        <StatRow label="Active Goals" value={activeGoals} />
        <StatRow label="Completed Goals" value={completedGoals} />
        <div className="flex justify-between text-sm text-iron-600 mt-1 mb-0.5">
          <span>Completion Rate</span>
          <span>{goalRate}%</span>
        </div>
        <ProgressBar pct={goalRate} />

        <p className="text-xs font-medium text-iron-500 uppercase tracking-wide mt-4 mb-2">Activity</p>
        <StatRow label="Training Completions (this month)" value={trainingThisMonth} />
        <StatRow label="Training Completions (all time)" value={data.training.length} />
        <StatRow label="Check-ins (this month)" value={checkInsThisMonth} />
        <StatRow label="Check-ins (all time)" value={data.checkIns.length} />
        <StatRow label="Posts (this month)" value={postsThisMonth} />
        <StatRow label="Posts (all time)" value={data.posts.length} />
      </Card>
    </div>
  );
}
