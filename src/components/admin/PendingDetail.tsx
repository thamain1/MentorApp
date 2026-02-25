import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, CheckCircle, XCircle } from 'lucide-react';
import { Card, Avatar, Badge, Button } from '../ui';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { formatRelativeTime } from '../../lib/utils';

interface PendingRow {
  id: string;
  mentor_id: string;
  mentee_id: string;
  requested_at: string;
  mentee_message: string | null;
  mentor_first_name: string;
  mentor_last_name: string;
  mentor_avatar_url: string | null;
  mentee_first_name: string;
  mentee_last_name: string;
  mentee_avatar_url: string | null;
}

interface Props {
  onBack: () => void;
  onChanged: () => void;
}

export function PendingDetail({ onBack, onChanged }: Props) {
  const { profile } = useAuth();
  const [pending, setPending] = useState<PendingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: matchRows, error: matchErr } = await supabase
        .from('matches')
        .select('id, mentor_id, mentee_id, requested_at, mentee_message')
        .eq('status', 'pending')
        .order('requested_at', { ascending: true });

      if (matchErr) throw matchErr;
      const rows = matchRows ?? [];

      if (rows.length === 0) {
        setPending([]);
        return;
      }

      const profileIds = [...new Set(rows.flatMap((m) => [m.mentor_id, m.mentee_id]))];
      const { data: profileRows, error: profileErr } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .in('id', profileIds);

      if (profileErr) throw profileErr;

      const profileMap = new Map(
        (profileRows ?? []).map((p) => [p.id, p])
      );
      const fallback = (id: string) => ({
        id,
        first_name: 'Unknown',
        last_name: '',
        avatar_url: null,
      });

      setPending(
        rows.map((m) => {
          const mentor = profileMap.get(m.mentor_id) ?? fallback(m.mentor_id);
          const mentee = profileMap.get(m.mentee_id) ?? fallback(m.mentee_id);
          return {
            id: m.id,
            mentor_id: m.mentor_id,
            mentee_id: m.mentee_id,
            requested_at: m.requested_at,
            mentee_message: m.mentee_message,
            mentor_first_name: mentor.first_name,
            mentor_last_name: mentor.last_name,
            mentor_avatar_url: mentor.avatar_url,
            mentee_first_name: mentee.first_name,
            mentee_last_name: mentee.last_name,
            mentee_avatar_url: mentee.avatar_url,
          };
        })
      );
    } catch (err) {
      setError('Failed to load pending requests.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  const handleApprove = async (matchId: string) => {
    if (!profile) return;
    setActing(matchId);
    try {
      const { error: approveErr } = await supabase
        .from('matches')
        .update({
          status: 'active',
          approved_at: new Date().toISOString(),
          approved_by: profile.id,
        })
        .eq('id', matchId);
      if (approveErr) throw approveErr;

      await fetchPending();
      onChanged();
    } catch (err) {
      console.error('Approve error:', err);
    } finally {
      setActing(null);
    }
  };

  const handleDecline = async (matchId: string) => {
    setActing(matchId);
    try {
      const { error: declineErr } = await supabase
        .from('matches')
        .update({ status: 'cancelled' })
        .eq('id', matchId);
      if (declineErr) throw declineErr;

      await fetchPending();
      onChanged();
    } catch (err) {
      console.error('Decline error:', err);
    } finally {
      setActing(null);
    }
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
        <h3 className="font-semibold text-iron-900">Pending Approvals</h3>
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
          <button onClick={fetchPending} className="text-sm text-brand-500 hover:underline">
            Retry
          </button>
        </div>
      )}

      {!loading && !error && pending.length === 0 && (
        <div className="text-center py-6">
          <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
          <p className="text-iron-600 font-medium">All caught up!</p>
          <p className="text-sm text-iron-500">No pending match requests</p>
        </div>
      )}

      {!loading && !error && pending.length > 0 && (
        <div className="space-y-3">
          {pending.map((match) => {
            const mentorName = `${match.mentor_first_name} ${match.mentor_last_name}`;
            const menteeName = `${match.mentee_first_name} ${match.mentee_last_name}`;
            const isActing = acting === match.id;

            return (
              <div key={match.id} className="p-3 bg-iron-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="warning">Pending Review</Badge>
                  <span className="text-xs text-iron-500">
                    {formatRelativeTime(match.requested_at)}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-2">
                  <div className="flex -space-x-2">
                    <Avatar name={menteeName} src={match.mentee_avatar_url} size="sm" className="ring-2 ring-white" />
                    <Avatar name={mentorName} src={match.mentor_avatar_url} size="sm" className="ring-2 ring-white" />
                  </div>
                  <div>
                    <p className="font-medium text-iron-900 text-sm">{menteeName}</p>
                    <p className="text-xs text-iron-500">wants to match with {mentorName}</p>
                  </div>
                </div>

                {match.mentee_message && (
                  <div className="p-2 bg-white rounded-lg mb-2 border border-iron-100">
                    <p className="text-xs text-iron-600">"{match.mentee_message}"</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDecline(match.id)}
                    disabled={isActing}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleApprove(match.id)}
                    disabled={isActing}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
