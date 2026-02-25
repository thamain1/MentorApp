import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, Avatar, Badge } from '../ui';
import { supabase, supabaseAdmin } from '../../lib/supabase';
import { MentorAdminDetail } from './MentorAdminDetail';

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

interface Props {
  onBack: () => void;
  onChanged: () => void;
}

export function MentorsDetail({ onBack, onChanged }: Props) {
  const [mentors, setMentors] = useState<MentorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);
  const [selectedMentor, setSelectedMentor] = useState<MentorRow | null>(null);

  const fetchMentors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from('profiles')
        .select('id, user_id, first_name, last_name, avatar_url, bio, specialties, location, is_blocked, created_at')
        .eq('role', 'mentor')
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;
      setMentors((data ?? []) as MentorRow[]);
    } catch (err) {
      setError('Failed to load mentors.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMentors(); }, [fetchMentors]);

  const handleToggleBlock = async (e: React.MouseEvent, mentor: MentorRow) => {
    e.stopPropagation();
    setActing(mentor.id);
    try {
      const newBlocked = !mentor.is_blocked;
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ is_blocked: newBlocked })
        .eq('id', mentor.id);
      if (updateErr) throw updateErr;

      await supabaseAdmin.auth.admin.updateUserById(mentor.user_id, {
        ban_duration: newBlocked ? '876000h' : 'none',
      });

      await fetchMentors();
      onChanged();
    } catch (err) {
      console.error('Block toggle error:', err);
    } finally {
      setActing(null);
    }
  };

  const handleDetailBack = useCallback(async () => {
    setSelectedMentor(null);
    await fetchMentors();
  }, [fetchMentors]);

  // ---- Drill-down view ----
  if (selectedMentor) {
    return (
      <MentorAdminDetail
        mentor={selectedMentor}
        onBack={handleDetailBack}
        onChanged={() => { fetchMentors(); onChanged(); }}
      />
    );
  }

  // ---- List view ----
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
        <h3 className="font-semibold text-iron-900">Mentors</h3>
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
          <button onClick={fetchMentors} className="text-sm text-brand-500 hover:underline">
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-2">
          {mentors.length === 0 && (
            <p className="text-sm text-iron-500 text-center py-4">No mentors found.</p>
          )}
          {mentors.map((mentor) => (
            <button
              key={mentor.id}
              onClick={() => setSelectedMentor(mentor)}
              className="w-full flex items-center gap-3 p-3 bg-iron-50 rounded-xl hover:bg-iron-100 transition-colors text-left"
            >
              <Avatar
                name={`${mentor.first_name} ${mentor.last_name}`}
                src={mentor.avatar_url}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-iron-900 text-sm truncate">
                  {mentor.first_name} {mentor.last_name}
                </p>
                <p className="text-xs text-iron-500">
                  Joined {new Date(mentor.created_at).toLocaleDateString()}
                </p>
              </div>
              <Badge variant={mentor.is_blocked ? 'danger' : 'success'}>
                {mentor.is_blocked ? 'Blocked' : 'Active'}
              </Badge>
              <button
                onClick={(e) => handleToggleBlock(e, mentor)}
                disabled={acting === mentor.id}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                  mentor.is_blocked
                    ? 'text-brand-600 border-brand-200 hover:bg-brand-50'
                    : 'text-red-600 border-red-200 hover:bg-red-50'
                }`}
              >
                {acting === mentor.id ? '…' : mentor.is_blocked ? 'Unblock' : 'Block'}
              </button>
              <ChevronRight className="w-4 h-4 text-iron-400 shrink-0" />
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}
