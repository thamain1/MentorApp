import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, ChevronRight, Inbox } from 'lucide-react';
import { AppShell, Header } from '../layout';
import { Card, Avatar, Button } from '../ui';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { formatRelativeTime } from '../../lib/utils';
import type { Database } from '../../types/database.types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type MatchStatus = Database['public']['Tables']['matches']['Row']['status'];

interface MatchWithOtherProfile {
  id: string;
  mentor_id: string;
  mentee_id: string;
  status: MatchStatus;
  requested_at: string;
  mentee_message: string | null;
  // The "other" person in this match relative to the current user
  otherProfile: Pick<ProfileRow, 'id' | 'first_name' | 'last_name' | 'avatar_url'>;
  // For mentee view: this is the mentor's profile id for navigation
  mentorProfileId: string;
}

export function MatchRequests() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [matches, setMatches] = useState<MatchWithOtherProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    if (!profile) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch matches where the current user is either mentor or mentee
      const { data: matchRows, error: matchError } = await supabase
        .from('matches')
        .select('id, mentor_id, mentee_id, status, requested_at, mentee_message')
        .or(`mentor_id.eq.${profile.id},mentee_id.eq.${profile.id}`)
        .order('requested_at', { ascending: false });

      if (matchError) throw matchError;
      if (!matchRows || matchRows.length === 0) {
        setMatches([]);
        return;
      }

      // Collect all profile IDs for the "other" person in each match
      const otherProfileIds = matchRows.map((m) =>
        m.mentor_id === profile.id ? m.mentee_id : m.mentor_id
      );

      const { data: profileRows, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .in('id', otherProfileIds);

      if (profileError) throw profileError;

      const profileMap = new Map(
        (profileRows ?? []).map((p) => [p.id, p as Pick<ProfileRow, 'id' | 'first_name' | 'last_name' | 'avatar_url'>])
      );

      const enriched: MatchWithOtherProfile[] = matchRows.map((m) => {
        const otherId = m.mentor_id === profile.id ? m.mentee_id : m.mentor_id;
        const otherProfile = profileMap.get(otherId) ?? {
          id: otherId,
          first_name: 'Unknown',
          last_name: '',
          avatar_url: null,
        };
        return {
          id: m.id,
          mentor_id: m.mentor_id,
          mentee_id: m.mentee_id,
          status: m.status,
          requested_at: m.requested_at,
          mentee_message: m.mentee_message,
          otherProfile,
          mentorProfileId: m.mentor_id,
        };
      });

      setMatches(enriched);
    } catch (err) {
      setError('Failed to load match requests. Please try again.');
      console.error('Error fetching match requests:', err);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const pendingRequests = matches.filter((r) => r.status === 'pending');
  const respondedRequests = matches.filter((r) => r.status !== 'pending');

  return (
    <AppShell>
      <Header title="Match Requests" showBack />

      <div className="p-4 space-y-6">
        {/* Loading state */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-iron-100 rounded-xl h-20 animate-pulse" />
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <Card className="p-6 text-center">
            <p className="text-iron-600 font-medium mb-1">{error}</p>
            <button
              onClick={fetchMatches}
              className="text-sm text-blue-500 hover:underline mt-2"
            >
              Retry
            </button>
          </Card>
        )}

        {/* Pending Requests */}
        {!loading && !error && (
          <>
            <section>
              <h3 className="text-sm font-medium text-iron-500 uppercase tracking-wide mb-3">
                Pending Requests ({pendingRequests.length})
              </h3>

              {pendingRequests.length === 0 ? (
                <Card className="p-6 text-center">
                  <Inbox className="w-10 h-10 text-iron-300 mx-auto mb-2" />
                  <p className="text-iron-600 font-medium mb-1">No pending requests</p>
                  <p className="text-sm text-iron-500 mb-4">
                    Find a mentor to send your first request
                  </p>
                  <Button variant="outline" onClick={() => navigate('/mentors')}>
                    Browse Mentors
                  </Button>
                </Card>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((request) => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      onClick={() => navigate(`/mentors/${request.mentorProfileId}`)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Past Requests */}
            {respondedRequests.length > 0 && (
              <section>
                <h3 className="text-sm font-medium text-iron-500 uppercase tracking-wide mb-3">
                  Past Requests
                </h3>
                <div className="space-y-3">
                  {respondedRequests.map((request) => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      onClick={() => navigate(`/mentors/${request.mentorProfileId}`)}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}

interface RequestCardProps {
  request: MatchWithOtherProfile;
  onClick: () => void;
}

function RequestCard({ request, onClick }: RequestCardProps) {
  const otherName = `${request.otherProfile.first_name} ${request.otherProfile.last_name}`;

  const getStatusIcon = () => {
    switch (request.status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-iron-400" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-iron-400" />;
      default:
        return <Clock className="w-5 h-5 text-iron-400" />;
    }
  };

  const getStatusLabel = () => {
    switch (request.status) {
      case 'active':
        return 'Accepted';
      case 'cancelled':
        return 'Declined';
      default:
        return request.status.charAt(0).toUpperCase() + request.status.slice(1);
    }
  };

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-iron-100 rounded-xl p-4 hover:border-brand-200 transition-colors"
    >
      <div className="flex items-center gap-3">
        <Avatar name={otherName} src={request.otherProfile.avatar_url} size="md" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="font-semibold text-iron-900 truncate">{otherName}</h4>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {getStatusIcon()}
            <span className="text-iron-500">{getStatusLabel()}</span>
            <span className="text-iron-300">•</span>
            <span className="text-iron-400">{formatRelativeTime(request.requested_at)}</span>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-iron-400" />
      </div>

      {request.mentee_message && (
        <p className="mt-2 text-sm text-iron-600 line-clamp-2 pl-12">
          "{request.mentee_message}"
        </p>
      )}
    </button>
  );
}
