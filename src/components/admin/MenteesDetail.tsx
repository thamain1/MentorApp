import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Card, Avatar, Badge } from '../ui';
import { supabase, supabaseAdmin } from '../../lib/supabase';

interface MenteeRow {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  is_blocked: boolean;
  created_at: string;
}

interface Props {
  onBack: () => void;
  onChanged: () => void;
}

export function MenteesDetail({ onBack, onChanged }: Props) {
  const [mentees, setMentees] = useState<MenteeRow[]>([]);
  const [matchStatus, setMatchStatus] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const fetchMentees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from('profiles')
        .select('id, user_id, first_name, last_name, avatar_url, is_blocked, created_at')
        .eq('role', 'mentee')
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;
      const rows = (data ?? []) as MenteeRow[];
      setMentees(rows);

      if (rows.length > 0) {
        const ids = rows.map((r) => r.id);
        const { data: matchData } = await supabase
          .from('matches')
          .select('mentee_id, status')
          .in('mentee_id', ids);

        // Build map: menteeId → highest-priority status
        const priority: Record<string, number> = { active: 3, pending: 2, completed: 1, cancelled: 0 };
        const statusMap: Record<string, string> = {};
        (matchData ?? []).forEach((m) => {
          const existing = statusMap[m.mentee_id];
          if (!existing || (priority[m.status] ?? 0) > (priority[existing] ?? 0)) {
            statusMap[m.mentee_id] = m.status;
          }
        });
        setMatchStatus(statusMap);
      }
    } catch (err) {
      setError('Failed to load mentees.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMentees(); }, [fetchMentees]);

  const handleToggleBlock = async (mentee: MenteeRow) => {
    setActing(mentee.id);
    try {
      const newBlocked = !mentee.is_blocked;
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ is_blocked: newBlocked })
        .eq('id', mentee.id);
      if (updateErr) throw updateErr;

      await supabaseAdmin.auth.admin.updateUserById(mentee.user_id, {
        ban_duration: newBlocked ? '876000h' : 'none',
      });

      await fetchMentees();
      onChanged();
    } catch (err) {
      console.error('Block toggle error:', err);
    } finally {
      setActing(null);
    }
  };

  const matchLabel = (id: string) => {
    const s = matchStatus[id];
    if (s === 'active') return 'Matched';
    if (s === 'pending') return 'Pending';
    return 'No match';
  };

  return (
    <Card className="mt-4">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={onBack}
          className="p-1 rounded-lg hover:bg-iron-100 transition-colors"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5 text-iron-600" />
        </button>
        <h3 className="font-semibold text-iron-900">Mentees</h3>
      </div>

      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-iron-100 rounded-xl h-14 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-4">
          <p className="text-iron-600 mb-2">{error}</p>
          <button onClick={fetchMentees} className="text-sm text-brand-500 hover:underline">
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-2">
          {mentees.length === 0 && (
            <p className="text-sm text-iron-500 text-center py-4">No mentees found.</p>
          )}
          {mentees.map((mentee) => (
            <div key={mentee.id} className="flex items-center gap-3 p-3 bg-iron-50 rounded-xl">
              <Avatar
                name={`${mentee.first_name} ${mentee.last_name}`}
                src={mentee.avatar_url}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-iron-900 text-sm truncate">
                  {mentee.first_name} {mentee.last_name}
                </p>
                <p className="text-xs text-iron-500">
                  {matchLabel(mentee.id)} · Joined {new Date(mentee.created_at).toLocaleDateString()}
                </p>
              </div>
              <Badge variant={mentee.is_blocked ? 'danger' : 'success'}>
                {mentee.is_blocked ? 'Blocked' : 'Active'}
              </Badge>
              <button
                onClick={() => handleToggleBlock(mentee)}
                disabled={acting === mentee.id}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                  mentee.is_blocked
                    ? 'text-brand-600 border-brand-200 hover:bg-brand-50'
                    : 'text-red-600 border-red-200 hover:bg-red-50'
                }`}
              >
                {acting === mentee.id ? '…' : mentee.is_blocked ? 'Unblock' : 'Block'}
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
