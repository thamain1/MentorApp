import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Video, Mic, MessageSquare, Users, BarChart2 } from 'lucide-react';
import { AppShell, Header } from '../layout';
import { Card, Avatar } from '../ui';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import type { MentorSurvey } from '../../types/database.types';

interface MatchRow {
  id: string;
  mentee_id: string;
  status: string;
  approved_at: string | null;
}

interface SessionRow {
  id: string;
  duration_mins: number;
  status: string;
  session_type: string;
  meeting_type: string;
  completed_at: string | null;
  created_at: string;
}

interface MenteeProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-iron-50 rounded-xl p-3 text-center">
      <p className="text-2xl font-bold text-iron-900">{value}</p>
      <p className="text-xs text-iron-500 mt-0.5">{label}</p>
    </div>
  );
}

function FilledStars({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-iron-200'}`}
        />
      ))}
    </span>
  );
}

const monthLabel = (isoMonth: string) => {
  const [year, month] = isoMonth.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const avg = (arr: number[]): number => {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
};

const thisMonth = () => new Date().toISOString().slice(0, 7);

const monthsAgo = (n: number) => {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d.toISOString().slice(0, 7);
};

export function MentorReportsPage() {
  const navigate = useNavigate(); // used for role-based redirect
  const { profile } = useAuth();

  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [surveys, setSurveys] = useState<MentorSurvey[]>([]);
  const [mentees, setMentees] = useState<MenteeProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect non-mentors
  useEffect(() => {
    if (!profile) return;
    if (profile.role === 'admin') { navigate('/admin', { replace: true }); return; }
    if (profile.role !== 'mentor') { navigate('/home', { replace: true }); }
  }, [profile, navigate]);

  const fetchData = useCallback(async () => {
    if (!profile || profile.role !== 'mentor') return;
    setLoading(true);
    setError(null);
    try {
      const { data: matchData, error: matchErr } = await supabase
        .from('matches')
        .select('id, mentee_id, status, approved_at')
        .eq('mentor_id', profile.id);
      if (matchErr) throw matchErr;

      const matchRows = matchData ?? [];
      setMatches(matchRows);

      const matchIds = matchRows.map((m) => m.id);
      const menteeIds = matchRows.map((m) => m.mentee_id);

      const [sessionsRes, surveysRes, menteesRes] = await Promise.all([
        matchIds.length
          ? supabase
              .from('sessions')
              .select('id, duration_mins, status, session_type, meeting_type, completed_at, created_at')
              .in('match_id', matchIds)
          : Promise.resolve({ data: [], error: null }),
        supabase
          .from('mentor_surveys')
          .select('*')
          .eq('mentor_id', profile.id)
          .order('created_at', { ascending: false }),
        menteeIds.length
          ? supabase
              .from('profiles')
              .select('id, first_name, last_name, avatar_url')
              .in('id', menteeIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (sessionsRes.error) throw sessionsRes.error;
      if (surveysRes.error) throw surveysRes.error;
      if (menteesRes.error) throw menteesRes.error;

      setSessions((sessionsRes.data ?? []) as SessionRow[]);
      setSurveys((surveysRes.data ?? []) as MentorSurvey[]);
      setMentees((menteesRes.data ?? []) as MenteeProfile[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports.');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!profile || profile.role !== 'mentor') return null;

  const completed = sessions.filter((s) => s.status === 'completed');
  const cm = thisMonth();
  const completedThisMonth = completed.filter((s) => (s.completed_at ?? s.created_at).startsWith(cm));
  const avgDuration = completed.length ? Math.round(avg(completed.map((s) => s.duration_mins))) : 0;
  const activeMatches = matches.filter((m) => m.status === 'active');
  const avgPerMentee = activeMatches.length ? (completed.length / activeMatches.length).toFixed(1) : '—';

  // Ratings
  const overallAvg = avg(surveys.map((s) => s.overall_rating));
  const commAvg = avg(surveys.map((s) => s.communication_rating));
  const helpAvg = avg(surveys.map((s) => s.helpfulness_rating));

  // Meeting type breakdown
  const videoCount = sessions.filter((s) => s.meeting_type === 'video').length;
  const voiceCount = sessions.filter((s) => s.meeting_type === 'voice').length;
  const chatCount = sessions.filter((s) => s.meeting_type === 'chat').length;

  // Sessions per month (past 6 months)
  const past6 = Array.from({ length: 6 }, (_, i) => monthsAgo(5 - i));
  const sessionsByMonth = past6.map((m) => ({
    month: m,
    count: completed.filter((s) => (s.completed_at ?? s.created_at).startsWith(m)).length,
  }));

  // Match duration helpers
  const matchDurationMonths = (approvedAt: string | null) => {
    if (!approvedAt) return 0;
    const diff = Date.now() - new Date(approvedAt).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
  };

  const menteeMap = new Map(mentees.map((m) => [m.id, m]));
  const recentSurveys = surveys.slice(0, 5);
  const endedMatches = matches.filter((m) => m.status === 'completed' || m.status === 'cancelled');

  return (
    <AppShell>
      <Header
        title="My Reports"
        showBack
      />

      <div className="p-4 space-y-4">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-iron-100 rounded-xl h-24 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && error && (
          <Card className="p-6 text-center">
            <p className="text-iron-600 mb-2">{error}</p>
            <button onClick={fetchData} className="text-sm text-brand-500 hover:underline">
              Retry
            </button>
          </Card>
        )}

        {!loading && !error && (
          <>
            {/* Section 1: Session Overview */}
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <BarChart2 className="w-5 h-5 text-brand-600" />
                <h3 className="font-semibold text-iron-900">Session Overview</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Sessions Completed" value={completed.length} />
                <StatCard label="This Month" value={completedThisMonth.length} />
                <StatCard label="Avg Duration (min)" value={avgDuration || '—'} />
                <StatCard label="Avg per Mentee" value={avgPerMentee} />
              </div>
            </Card>

            {/* Section 2: Mentee Feedback */}
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-iron-900">Mentee Feedback</h3>
              </div>

              {surveys.length === 0 ? (
                <p className="text-sm text-iron-500 italic">
                  No feedback received yet — surveys appear monthly for your mentees.
                </p>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <FilledStars rating={overallAvg} />
                    <span className="font-semibold text-iron-900">{overallAvg.toFixed(1)}</span>
                    <span className="text-sm text-iron-500">({surveys.length} {surveys.length === 1 ? 'review' : 'reviews'})</span>
                  </div>

                  <div className="flex gap-4 text-sm text-iron-600 mb-4">
                    <span>Communication <strong>{commAvg.toFixed(1)}</strong></span>
                    <span>Helpfulness <strong>{helpAvg.toFixed(1)}</strong></span>
                    <span>Overall <strong>{overallAvg.toFixed(1)}</strong></span>
                  </div>

                  <div className="space-y-3">
                    {recentSurveys.map((s) => (
                      <div key={s.id} className="p-3 bg-iron-50 rounded-xl">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-iron-500">{monthLabel(s.survey_month)}</span>
                          <div className="flex gap-2 text-xs text-iron-500">
                            <span>Overall {s.overall_rating}★</span>
                            <span>Comm {s.communication_rating}★</span>
                            <span>Help {s.helpfulness_rating}★</span>
                          </div>
                        </div>
                        {s.feedback_text && (
                          <p className="text-sm text-iron-700">"{s.feedback_text}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>

            {/* Section 3: Match Summary */}
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-iron-900">Match Summary</h3>
              </div>

              {activeMatches.length > 0 ? (
                <div className="space-y-3 mb-3">
                  {activeMatches.map((m) => {
                    const mentee = menteeMap.get(m.mentee_id);
                    const months = matchDurationMonths(m.approved_at);
                    const name = mentee
                      ? `${mentee.first_name ?? ''} ${mentee.last_name ?? ''}`.trim()
                      : 'Unknown';
                    return (
                      <div key={m.id} className="flex items-center gap-3">
                        <Avatar
                          src={mentee?.avatar_url ?? undefined}
                          name={name}
                          size="md"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-iron-900">{name}</p>
                          <p className="text-xs text-iron-500">
                            {months} {months === 1 ? 'month' : 'months'} together
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-iron-500 mb-3">No active mentees.</p>
              )}

              {endedMatches.length > 0 && (
                <p className="text-sm text-iron-500">
                  {endedMatches.length} completed / ended {endedMatches.length === 1 ? 'match' : 'matches'}
                </p>
              )}
            </Card>

            {/* Section 4: Session Breakdown */}
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <Video className="w-5 h-5 text-iron-600" />
                <h3 className="font-semibold text-iron-900">Session Breakdown</h3>
              </div>

              <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-1.5 text-sm text-iron-600">
                  <Video className="w-4 h-4" /> Video {videoCount}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-iron-600">
                  <Mic className="w-4 h-4" /> Voice {voiceCount}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-iron-600">
                  <MessageSquare className="w-4 h-4" /> Chat {chatCount}
                </div>
              </div>

              <h4 className="text-xs font-medium text-iron-500 uppercase tracking-wide mb-2">Past 6 Months</h4>
              <div className="space-y-1">
                {sessionsByMonth.map(({ month, count }) => (
                  <div key={month} className="flex items-center justify-between text-sm text-iron-600">
                    <span>{monthLabel(month)}</span>
                    <span className="font-medium">{count} {count === 1 ? 'session' : 'sessions'}</span>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </AppShell>
  );
}
