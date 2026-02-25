import { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  Users,
  Target,
  BookOpen,
  Heart,
  Calendar,
} from 'lucide-react';
import { Card, Avatar, Badge } from '../ui';
import { supabase, supabaseAdmin } from '../../lib/supabase';

interface MenteeRow {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  bio: string | null;
  age: number;
  interests: string[];
  goals: string[];
  location: string | null;
  is_blocked: boolean;
  created_at: string;
}

interface MatchRow {
  id: string;
  mentor_id: string;
  status: string;
  approved_at: string | null;
  requested_at: string;
}

interface MentorProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

interface SessionRow {
  id: string;
  duration_mins: number;
  status: string;
  completed_at: string | null;
  created_at: string;
}

interface GoalRow {
  id: string;
  title: string;
  status: string;
  target_date: string | null;
  completed_at: string | null;
}

interface CheckInRow {
  id: string;
  mood: number;
  created_at: string;
}

interface Props {
  mentee: MenteeRow;
  onBack: () => void;
  onChanged: () => void;
}

function MiniStatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-iron-50 rounded-xl p-3 text-center">
      <p className="text-2xl font-bold text-iron-900">{value}</p>
      <p className="text-xs text-iron-500 mt-0.5">{label}</p>
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

const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
const thisMonth = () => new Date().toISOString().slice(0, 7);
const matchDurationMonths = (approvedAt: string | null) => {
  if (!approvedAt) return 0;
  return Math.floor((Date.now() - new Date(approvedAt).getTime()) / (1000 * 60 * 60 * 24 * 30));
};
const moodLabel = (mood: number) => {
  if (mood >= 5) return 'Great';
  if (mood >= 4) return 'Good';
  if (mood >= 3) return 'Okay';
  if (mood >= 2) return 'Low';
  return 'Struggling';
};

export function MenteeAdminDetail({ mentee, onBack, onChanged }: Props) {
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [mentorProfiles, setMentorProfiles] = useState<Map<string, MentorProfile>>(new Map());
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [goals, setGoals] = useState<GoalRow[]>([]);
  const [checkIns, setCheckIns] = useState<CheckInRow[]>([]);
  const [trainingCount, setTrainingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blocking, setBlocking] = useState(false);
  const [currentMentee, setCurrentMentee] = useState<MenteeRow>(mentee);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: matchData, error: matchErr } = await supabase
        .from('matches')
        .select('id, mentor_id, status, approved_at, requested_at')
        .eq('mentee_id', mentee.id)
        .order('requested_at', { ascending: false });
      if (matchErr) throw matchErr;

      const matchRows = (matchData ?? []) as MatchRow[];
      setMatches(matchRows);

      const matchIds = matchRows.map((m) => m.id);
      const mentorIds = [...new Set(matchRows.map((m) => m.mentor_id))];

      const [sessionsRes, mentorRes, goalsRes, checkInsRes, trainingRes] = await Promise.all([
        matchIds.length
          ? supabase
              .from('sessions')
              .select('id, duration_mins, status, completed_at, created_at')
              .in('match_id', matchIds)
          : Promise.resolve({ data: [], error: null }),
        mentorIds.length
          ? supabase
              .from('profiles')
              .select('id, first_name, last_name, avatar_url')
              .in('id', mentorIds)
          : Promise.resolve({ data: [], error: null }),
        supabase
          .from('goals')
          .select('id, title, status, target_date, completed_at')
          .eq('user_id', mentee.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('check_ins')
          .select('id, mood, created_at')
          .eq('user_id', mentee.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('user_training_progress')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', mentee.id),
      ]);

      if (sessionsRes.error) throw sessionsRes.error;
      if (goalsRes.error) throw goalsRes.error;
      if (checkInsRes.error) throw checkInsRes.error;

      setSessions((sessionsRes.data ?? []) as SessionRow[]);
      setGoals((goalsRes.data ?? []) as GoalRow[]);
      setCheckIns((checkInsRes.data ?? []) as CheckInRow[]);
      setTrainingCount(trainingRes.count ?? 0);

      const mentorMap = new Map(
        ((mentorRes.data ?? []) as MentorProfile[]).map((p) => [p.id, p])
      );
      setMentorProfiles(mentorMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mentee stats.');
    } finally {
      setLoading(false);
    }
  }, [mentee.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleToggleBlock = async () => {
    setBlocking(true);
    try {
      const newBlocked = !currentMentee.is_blocked;
      const { error: updateErr } = await supabaseAdmin
        .from('profiles')
        .update({ is_blocked: newBlocked })
        .eq('id', currentMentee.id);
      if (updateErr) throw updateErr;

      await supabaseAdmin.auth.admin.updateUserById(currentMentee.user_id, {
        ban_duration: newBlocked ? '876000h' : 'none',
      });

      setCurrentMentee((prev) => ({ ...prev, is_blocked: newBlocked }));
      onChanged();
    } catch (err) {
      console.error('Block toggle error:', err);
    } finally {
      setBlocking(false);
    }
  };

  // ---- Derived stats ----
  const cm = thisMonth();
  const completed = sessions.filter((s) => s.status === 'completed');
  const completedThisMonth = completed.filter((s) => (s.completed_at ?? s.created_at).startsWith(cm));
  const avgDuration = completed.length ? Math.round(avg(completed.map((s) => s.duration_mins))) : 0;

  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');
  const goalRate = goals.length ? Math.round((completedGoals.length / goals.length) * 100) : 0;
  const upcomingGoals = activeGoals
    .filter((g) => g.target_date)
    .sort((a, b) => new Date(a.target_date!).getTime() - new Date(b.target_date!).getTime())
    .slice(0, 3);

  const checkInsThisMonth = checkIns.filter((c) => c.created_at.startsWith(cm)).length;
  const lastMood = checkIns[0]?.mood ?? null;

  const activeMatch = matches.find((m) => m.status === 'active');
  const activeMentor = activeMatch ? mentorProfiles.get(activeMatch.mentor_id) : null;
  const activeMentorName = activeMentor
    ? `${activeMentor.first_name ?? ''} ${activeMentor.last_name ?? ''}`.trim()
    : null;

  const menteeName = `${currentMentee.first_name} ${currentMentee.last_name}`;

  return (
    <Card className="mt-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={onBack}
          className="p-1 rounded-lg hover:bg-iron-100 transition-colors"
          aria-label="Back to mentee list"
        >
          <ChevronLeft className="w-5 h-5 text-iron-600" />
        </button>
        <h3 className="font-semibold text-iron-900">Mentee Profile</h3>
      </div>

      {/* Mentee identity card */}
      <div className="p-4 bg-iron-50 rounded-xl mb-4">
        <div className="flex items-start gap-3">
          <Avatar name={menteeName} src={currentMentee.avatar_url} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-iron-900">{menteeName}</p>
              <Badge variant={currentMentee.is_blocked ? 'danger' : 'success'}>
                {currentMentee.is_blocked ? 'Blocked' : 'Active'}
              </Badge>
            </div>
            <p className="text-xs text-iron-500 mt-0.5">
              Age {currentMentee.age}{currentMentee.location ? ` · ${currentMentee.location}` : ''}
            </p>
            <p className="text-xs text-iron-400">
              Joined {new Date(currentMentee.created_at).toLocaleDateString()}
            </p>
            {currentMentee.bio && (
              <p className="text-sm text-iron-600 mt-2 line-clamp-3">{currentMentee.bio}</p>
            )}
            {currentMentee.interests.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {currentMentee.interests.slice(0, 5).map((s) => (
                  <span key={s} className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={handleToggleBlock}
          disabled={blocking}
          className={`mt-3 w-full text-sm font-medium py-2 rounded-lg border transition-colors disabled:opacity-50 ${
            currentMentee.is_blocked
              ? 'text-brand-600 border-brand-200 hover:bg-brand-50'
              : 'text-red-600 border-red-200 hover:bg-red-50'
          }`}
        >
          {blocking ? '…' : currentMentee.is_blocked ? 'Unblock Account' : 'Block Account'}
        </button>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-iron-100 rounded-xl h-24 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-4">
          <p className="text-iron-600 mb-2">{error}</p>
          <button onClick={fetchData} className="text-sm text-brand-500 hover:underline">Retry</button>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">

          {/* Section 1: Match & Mentor */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-teal-600" />
              <h4 className="font-semibold text-iron-900">Match & Mentor</h4>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-3">
              {[
                { label: 'Active', value: matches.filter((m) => m.status === 'active').length },
                { label: 'Pending', value: matches.filter((m) => m.status === 'pending').length },
                { label: 'Done', value: matches.filter((m) => m.status === 'completed').length },
                { label: 'Total', value: matches.length },
              ].map(({ label, value }) => (
                <div key={label} className="bg-iron-50 rounded-xl p-2 text-center">
                  <p className="text-lg font-bold text-iron-900">{value}</p>
                  <p className="text-xs text-iron-500">{label}</p>
                </div>
              ))}
            </div>

            {activeMatch && activeMentor ? (
              <div className="flex items-center gap-3 p-3 bg-iron-50 rounded-xl">
                <Avatar
                  src={activeMentor.avatar_url ?? undefined}
                  name={activeMentorName ?? 'Mentor'}
                  size="md"
                />
                <div>
                  <p className="font-medium text-iron-900 text-sm">{activeMentorName}</p>
                  <p className="text-xs text-iron-500">
                    {matchDurationMonths(activeMatch.approved_at)}{' '}
                    {matchDurationMonths(activeMatch.approved_at) === 1 ? 'month' : 'months'} together
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-iron-500 italic">No active mentor.</p>
            )}
          </Card>

          {/* Section 2: Session Activity */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-brand-600" />
              <h4 className="font-semibold text-iron-900">Session Activity</h4>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <MiniStatCard label="Total Sessions" value={completed.length} />
              <MiniStatCard label="This Month" value={completedThisMonth.length} />
              <MiniStatCard label="Avg Duration (min)" value={avgDuration || '—'} />
            </div>
          </Card>

          {/* Section 3: Goals */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-coral-600" />
              <h4 className="font-semibold text-iron-900">Goals</h4>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <MiniStatCard label="Active" value={activeGoals.length} />
              <MiniStatCard label="Completed" value={completedGoals.length} />
              <MiniStatCard label="Rate" value={`${goalRate}%`} />
            </div>

            {goals.length > 0 && (
              <>
                <div className="flex justify-between text-sm text-iron-600 mb-1">
                  <span>Completion Rate</span>
                  <span>{goalRate}%</span>
                </div>
                <ProgressBar pct={goalRate} />
              </>
            )}

            {upcomingGoals.length > 0 && (
              <div className="mt-3 space-y-1">
                <p className="text-xs font-medium text-iron-500 uppercase tracking-wide mb-1">
                  Upcoming Targets
                </p>
                {upcomingGoals.map((g) => (
                  <div key={g.id} className="flex items-center justify-between text-sm">
                    <span className="text-iron-700 truncate flex-1 mr-2">{g.title}</span>
                    <span className="text-xs text-iron-400 shrink-0">
                      {new Date(g.target_date!).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {goals.length === 0 && (
              <p className="text-sm text-iron-500 italic">No goals set yet.</p>
            )}
          </Card>

          {/* Section 4: Check-ins & Training */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-red-400" />
              <h4 className="font-semibold text-iron-900">Check-ins & Training</h4>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <MiniStatCard label="Check-ins (month)" value={checkInsThisMonth} />
              <MiniStatCard label="Check-ins (total)" value={checkIns.length} />
            </div>

            {lastMood !== null && (
              <div className="flex items-center gap-2 mb-3 p-3 bg-iron-50 rounded-xl">
                <span className="text-sm text-iron-600">Last mood:</span>
                <span className="font-semibold text-iron-900">{lastMood}/5</span>
                <span className="text-sm text-iron-500">— {moodLabel(lastMood)}</span>
              </div>
            )}

            <div className="flex items-center gap-2 mt-1">
              <BookOpen className="w-4 h-4 text-brand-500" />
              <span className="text-sm text-iron-600">
                <strong>{trainingCount}</strong> training{' '}
                {trainingCount === 1 ? 'module' : 'modules'} completed
              </span>
            </div>
          </Card>

        </div>
      )}
    </Card>
  );
}
