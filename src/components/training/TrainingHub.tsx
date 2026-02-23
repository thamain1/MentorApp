import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Award, Clock, ChevronRight, CheckCircle } from 'lucide-react';
import { AppShell, Header } from '../layout';
import { Card, Badge } from '../ui';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types';
type TrackRow = Database['public']['Tables']['training_tracks']['Row'];
type ModuleRow = Database['public']['Tables']['training_modules']['Row'];

interface TrainingTrack {
  id: string;
  title: string;
  description: string | null;
  display_order: number;
  badge_image_url: string | null;
  created_at: string;
}

interface TrackWithProgress extends TrainingTrack {
  totalModules: number;
  completedModules: number;
  totalDuration: number;
}

export function TrainingHub() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [tracks, setTracks] = useState<TrackWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const userRole = profile?.role ?? 'mentee';

        // Fetch tracks visible to this user's role
        const { data: tracksData, error: tracksError } = await supabase
          .from('training_tracks')
          .select('*')
          .in('target_role', [userRole, 'all'])
          .order('display_order');

        if (tracksError) throw tracksError;
        if (!tracksData) return;

        // Fetch all modules (id, track_id, display_order, duration_mins)
        const { data: modulesData, error: modulesError } = await supabase
          .from('training_modules')
          .select('id, track_id, display_order, duration_mins')
          .order('display_order');

        if (modulesError) throw modulesError;

        // Fetch user progress
        const { data: progressData, error: progressError } = await supabase
          .from('user_training_progress')
          .select('module_id')
          .eq('user_id', user.id);

        if (progressError) throw progressError;

        const completedModuleIds = new Set((progressData ?? []).map((p) => p.module_id));
        const typedTracks = (tracksData ?? []) as TrackRow[];
        const typedModules = (modulesData ?? []) as Pick<ModuleRow, 'id' | 'track_id' | 'display_order' | 'duration_mins'>[];

        // Build tracks with progress info
        const tracksWithProgress: TrackWithProgress[] = typedTracks.map((track) => {
          const trackModules = typedModules.filter((m) => m.track_id === track.id);
          const completedCount = trackModules.filter((m) => completedModuleIds.has(m.id)).length;
          const totalDuration = trackModules.reduce((sum, m) => sum + (m.duration_mins ?? 0), 0);

          return {
            ...track,
            totalModules: trackModules.length,
            completedModules: completedCount,
            totalDuration,
          };
        });

        setTracks(tracksWithProgress);
      } catch (err) {
        console.error('Error fetching training data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, profile]);

  // Calculate overall progress
  const totalModules = tracks.reduce((sum, track) => sum + track.totalModules, 0);
  const completedModules = tracks.reduce((sum, track) => sum + track.completedModules, 0);
  const overallProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
  const badgesEarned = tracks.filter((track) => track.completedModules === track.totalModules && track.totalModules > 0).length;

  return (
    <AppShell>
      <Header title="Training" showNotifications />

      <div className="p-4 space-y-6">
        {/* Overall Progress Card */}
        <Card className="p-4 bg-gradient-to-br from-brand-500 to-brand-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-brand-100 text-sm">Overall Progress</p>
              <p className="text-3xl font-bold">{overallProgress}%</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Award className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              <span>{completedModules}/{totalModules} modules</span>
            </div>
            <div className="flex items-center gap-1">
              <Award className="w-4 h-4" />
              <span>{badgesEarned} badge{badgesEarned !== 1 ? 's' : ''} earned</span>
            </div>
          </div>
        </Card>

        {/* Training Tracks */}
        <section>
          <h3 className="text-sm font-medium text-iron-500 uppercase tracking-wide mb-3">
            Training Tracks
          </h3>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-iron-100 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-iron-100 rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-iron-100 rounded animate-pulse w-full" />
                      <div className="h-2 bg-iron-100 rounded-full animate-pulse" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {tracks.map((track) => {
                const trackProgress = track.totalModules > 0
                  ? Math.round((track.completedModules / track.totalModules) * 100)
                  : 0;
                const isComplete = track.totalModules > 0 && trackProgress === 100;

                return (
                  <button
                    key={track.id}
                    onClick={() => navigate(`/training/${track.id}`)}
                    className="w-full text-left"
                  >
                    <Card className="p-4 hover:bg-iron-50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          isComplete ? 'bg-green-100' : 'bg-brand-100'
                        }`}>
                          {isComplete ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : (
                            <BookOpen className="w-6 h-6 text-brand-600" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-iron-900">{track.title}</h4>
                            {isComplete && (
                              <Badge variant="success">Complete</Badge>
                            )}
                          </div>
                          <p className="text-sm text-iron-500 line-clamp-2 mb-3">
                            {track.description}
                          </p>

                          {/* Progress bar */}
                          <div className="mb-2">
                            <div className="h-2 bg-iron-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  isComplete ? 'bg-green-500' : 'bg-brand-500'
                                }`}
                                style={{ width: `${trackProgress}%` }}
                              />
                            </div>
                          </div>

                          {/* Meta info */}
                          <div className="flex items-center gap-4 text-xs text-iron-500">
                            <span>{track.completedModules}/{track.totalModules} modules</span>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{track.totalDuration} min</span>
                            </div>
                          </div>
                        </div>

                        <ChevronRight className="w-5 h-5 text-iron-400 flex-shrink-0" />
                      </div>
                    </Card>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
