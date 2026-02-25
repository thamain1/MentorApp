import { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  Star,
  Video,
  Mic,
  MessageSquare,
  Users,
  BarChart2,
  Calendar,
} from 'lucide-react';
import { Card, Avatar, Badge } from '../ui';
import { supabase, supabaseAdmin } from '../../lib/supabase';
import type { MentorSurvey } from '../../types/database.types';

interface MentorRow {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  bio: string | null;
  specialties: string[];
  location: string | null;
  is_blocked: boolean;
  created_at: string;
}

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

interface Props {
  mentor: MentorRow;
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

function FilledStars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-iron-200'}`}
        />
      ))}
    </span>
  );
}

const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
const thisMonth = () => new Date().toISOString().slice(0, 7);
const monthsAgo = (n: number) => {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d.toISOString().slice(0, 7);
};
const monthLabel = (isoMonth: string) => {
  const [year, month] = isoMonth.split('-');
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
};
const matchDurationMonths = (approvedAt: string | null) => {
  if (!approvedAt) return 0;
  return Math.floor((Date.now() - new Date(approvedAt).getTime()) / (1000 * 60 * 60 * 24 * 30));
};

export function MentorAdminDetail({ mentor, onBack, onChanged }: Props) {
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [surveys, setSurveys] = useState<MentorSurvey[]>([]);
  const [mentees, setMentees] = useState<MenteeProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blocking, setBlocking] = useState(false);
  const [currentMentor, setCurrentMentor] = useState<MentorRow>(mentor);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: matchData, error: matchErr } = await supabase
        .from('matches')
        .select('id, mentee_id, status, approved_at')
        .eq('mentor_id', mentor.id);
      if (matchErr) throw matchErr;

      const matchRows = (matchData ?? []) as MatchRow[];
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
          .eq('mentor_id', mentor.id)
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
      setError(err instanceof Error ? err.message : 'Failed to load mentor stats.');
    } finally {
      setLoading(false);
    }
  }, [mentor.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleToggleBlock = async () => {
    setBlocking(true);
    try {
      const newBlocked = !currentMentor.is_blocked;
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ is_blocked: newBlocked })
        .eq('id', currentMentor.id);
      if (updateErr) throw updateErr;

      await supabaseAdmin.auth.admin.updateUserById(currentMentor.user_id, {
        ban_duration: newBlocked ? '876000h' : 'none',
      });

      setCurrentMentor((prev) => ({ ...prev, is_blocked: newBlocked }));
      onChanged();
    } catch (err) {
      console.error('Block toggle error:', err);
    } finally {
      setBlocking(false);
    }
  };

  // ---- Derived stats ----
  const completed = sessions.filter((s) => s.status === 'completed');
  const cm = thisMonth();
  const completedThisMonth = completed.filter((s) => (s.completed_at ?? s.created_at).startsWith(cm));
  const avgDuration = completed.length ? Math.round(avg(completed.map((s) => s.duration_mins))) : 0;
  const activeMatches = matches.filter((m) => m.status === 'active');
  const avgPerMentee = activeMatches.length ? (completed.length / activeMatches.length).toFixed(1) : '—';
  const endedMatches = matches.filter((m) => m.status === 'completed' || m.status === 'cancelled');

  const overallAvg = avg(surveys.map((s) => s.overall_rating));
  const commAvg = avg(surveys.map((s) => s.communication_rating));
  const helpAvg = avg(surveys.map((s) => s.helpfulness_rating));

  const videoCount = sessions.filter((s) => s.meeting_type === 'video').length;
  const voiceCount = sessions.filter((s) => s.meeting_type === 'voice').length;
  const chatCount = sessions.filter((s) => s.meeting_type === 'chat').length;

  const past6 = Array.from({ length: 6 }, (_, i) => monthsAgo(5 - i));
  const sessionsByMonth = past6.map((m) => ({
    month: m,
    count: completed.filter((s) => (s.completed_at ?? s.created_at).startsWith(m)).length,
  }));

  const menteeMap = new Map(mentees.map((m) => [m.id, m]));
  const recentSurveys = surveys.slice(0, 5);
  const mentorName = `${currentMentor.first_name} ${currentMentor.last_name}`;

  return (
    <Card className="mt-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={onBack}
          className="p-1 rounded-lg hover:bg-iron-100 transition-colors"
          aria-label="Back to mentor list"
        >
          <ChevronLeft className="w-5 h-5 text-iron-600" />
        </button>
        <h3 className="font-semibold text-iron-900">Mentor Profile</h3>
      </div>

      {/* Mentor identity card */}
      <div className="p-4 bg-iron-50 rounded-xl mb-4">
        <div className="flex items-start gap-3">
          <Avatar name={mentorName} src={currentMentor.avatar_url} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-iron-900">{mentorName}</p>
              <Badge variant={currentMentor.is_blocked ? 'danger' : 'success'}>
                {currentMentor.is_blocked ? 'Blocked' : 'Active'}
              </Badge>
            </div>
            {currentMentor.location && (
              <p className="text-xs text-iron-500 mt-0.5">{currentMentor.location}</p>
            )}
            <p className="text-xs text-iron-400">
              Joined {new Date(currentMentor.created_at).toLocaleDateString()}
            </p>
            {currentMentor.bio && (
              <p className="text-sm text-iron-600 mt-2 line-clamp-3">{currentMentor.bio}</p>
            )}
            {currentMentor.specialties.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {currentMentor.specialties.map((s) => (
                  <span
                    key={s}
                    className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full"
                  >
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
            currentMentor.is_blocked
              ? 'text-brand-600 border-brand-200 hover:bg-brand-50'
              : 'text-red-600 border-red-200 hover:bg-red-50'
          }`}
        >
          {blocking ? '…' : currentMentor.is_blocked ? 'Unblock Account' : 'Block Account'}
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
          <button onClick={fetchData} className="text-sm text-brand-500 hover:underline">
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {/* Section 1: Session Overview */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 className="w-5 h-5 text-brand-600" />
              <h4 className="font-semibold text-iron-900">Session Overview</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MiniStatCard label="Sessions Completed" value={completed.length} />
              <MiniStatCard label="This Month" value={completedThisMonth.length} />
              <MiniStatCard label="Avg Duration (min)" value={avgDuration || '—'} />
              <MiniStatCard label="Avg per Mentee" value={avgPerMentee} />
            </div>
          </Card>

          {/* Section 2: Mentee Feedback */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-amber-500" />
              <h4 className="font-semibold text-iron-900">Mentee Feedback</h4>
            </div>

            {surveys.length === 0 ? (
              <p className="text-sm text-iron-500 italic">No feedback submitted yet.</p>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <FilledStars rating={overallAvg} />
                  <span className="font-semibold text-iron-900">{overallAvg.toFixed(1)}</span>
                  <span className="text-sm text-iron-500">
                    ({surveys.length} {surveys.length === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
                <div className="flex gap-4 text-sm text-iron-600 mb-4">
                  <span>Communication <strong>{commAvg.toFixed(1)}</strong></span>
                  <span>Helpfulness <strong>{helpAvg.toFixed(1)}</strong></span>
                </div>
                <div className="space-y-2">
                  {recentSurveys.map((s) => (
                    <div key={s.id} className="p-3 bg-iron-50 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-iron-500">
                          {monthLabel(s.survey_month)}
                        </span>
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
              <h4 className="font-semibold text-iron-900">Match Summary</h4>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-3">
              {[
                { label: 'Active', value: activeMatches.length },
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

            {activeMatches.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-iron-500 uppercase tracking-wide">Active Mentees</p>
                {activeMatches.map((m) => {
                  const mentee = menteeMap.get(m.mentee_id);
                  const months = matchDurationMonths(m.approved_at);
                  const name = mentee
                    ? `${mentee.first_name ?? ''} ${mentee.last_name ?? ''}`.trim()
                    : 'Unknown';
                  return (
                    <div key={m.id} className="flex items-center gap-3 p-2 bg-iron-50 rounded-xl">
                      <Avatar src={mentee?.avatar_url ?? undefined} name={name} size="sm" />
                      <div className="flex-1">
                        <p className="font-medium text-iron-900 text-sm">{name}</p>
                        <p className="text-xs text-iron-500">
                          {months} {months === 1 ? 'month' : 'months'} together
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {endedMatches.length > 0 && (
              <p className="text-sm text-iron-500 mt-2">
                {endedMatches.length} completed / ended {endedMatches.length === 1 ? 'match' : 'matches'}
              </p>
            )}
          </Card>

          {/* Section 4: Session Breakdown */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-iron-600" />
              <h4 className="font-semibold text-iron-900">Session Breakdown</h4>
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

            <p className="text-xs font-medium text-iron-500 uppercase tracking-wide mb-2">Past 6 Months</p>
            <div className="space-y-1">
              {sessionsByMonth.map(({ month, count }) => (
                <div key={month} className="flex items-center justify-between text-sm text-iron-600">
                  <span>{monthLabel(month)}</span>
                  <span className="font-medium">{count} {count === 1 ? 'session' : 'sessions'}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
}
