import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Card } from '../ui';
import { supabase } from '../../lib/supabase';

interface MatchRow {
  id: string;
  mentor_id: string;
  mentee_id: string;
  approved_at: string | null;
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
}

interface EnrichedMatch extends MatchRow {
  mentor: Profile;
  mentee: Profile;
}

interface Props {
  onBack: () => void;
  onChanged: () => void;
}

export function ActiveMatchesDetail({ onBack, onChanged }: Props) {
  const [matches, setMatches] = useState<EnrichedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [ending, setEnding] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: matchRows, error: matchErr } = await supabase
        .from('matches')
        .select('id, mentor_id, mentee_id, approved_at')
        .eq('status', 'active')
        .order('approved_at', { ascending: false });

      if (matchErr) throw matchErr;

      const rows = matchRows ?? [];
      if (rows.length === 0) {
        setMatches([]);
        return;
      }

      const profileIds = [...new Set(rows.flatMap((m) => [m.mentor_id, m.mentee_id]))];
      const { data: profileRows, error: profileErr } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', profileIds);

      if (profileErr) throw profileErr;

      const profileMap = new Map(
        (profileRows ?? []).map((p) => [p.id, p as Profile])
      );
      const fallback = (id: string): Profile => ({ id, first_name: 'Unknown', last_name: '' });

      setMatches(
        rows.map((m) => ({
          ...m,
          mentor: profileMap.get(m.mentor_id) ?? fallback(m.mentor_id),
          mentee: profileMap.get(m.mentee_id) ?? fallback(m.mentee_id),
        }))
      );
    } catch (err) {
      setError('Failed to load active matches.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  const handleEndMatch = async (matchId: string) => {
    setEnding(matchId);
    try {
      const { error: endErr } = await supabase
        .from('matches')
        .update({ status: 'completed', ended_at: new Date().toISOString() })
        .eq('id', matchId);
      if (endErr) throw endErr;

      await fetchMatches();
      onChanged();
    } catch (err) {
      console.error('End match error:', err);
    } finally {
      setEnding(null);
      setConfirming(null);
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
        <h3 className="font-semibold text-iron-900">Active Matches</h3>
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
          <button onClick={fetchMatches} className="text-sm text-brand-500 hover:underline">
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-2">
          {matches.length === 0 && (
            <p className="text-sm text-iron-500 text-center py-4">No active matches.</p>
          )}
          {matches.map((match) => (
            <div key={match.id} className="p-3 bg-iron-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-iron-900 text-sm">
                    {match.mentee.first_name} {match.mentee.last_name}
                    <span className="text-iron-400 font-normal"> → </span>
                    {match.mentor.first_name} {match.mentor.last_name}
                  </p>
                  {match.approved_at && (
                    <p className="text-xs text-iron-500">
                      Active since {new Date(match.approved_at).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {confirming === match.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-iron-600">End match?</span>
                    <button
                      onClick={() => handleEndMatch(match.id)}
                      disabled={ending === match.id}
                      className="text-xs font-medium px-2 py-1 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      {ending === match.id ? '…' : 'Yes'}
                    </button>
                    <button
                      onClick={() => setConfirming(null)}
                      className="text-xs font-medium px-2 py-1 rounded-lg bg-iron-100 text-iron-600 hover:bg-iron-200 transition-colors"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirming(match.id)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    End Match
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
