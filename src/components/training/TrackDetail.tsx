import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, Lock, Play, ChevronLeft } from 'lucide-react';
import { AppShell } from '../layout';
import { Card, Badge, Button } from '../ui';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface TrainingTrack {
  id: string;
  title: string;
  description: string;
  display_order: number;
  badge_image_url: string | null;
  created_at: string;
}

interface TrainingModule {
  id: string;
  track_id: string;
  title: string;
  content: string;
  display_order: number;
  duration_mins: number;
  created_at: string;
}

export function TrackDetail() {
  const { trackId } = useParams<{ trackId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [track, setTrack] = useState<TrainingTrack | null>(null);
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [completedModuleIds, setCompletedModuleIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!user || !trackId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch the track
        const { data: trackData, error: trackError } = await supabase
          .from('training_tracks')
          .select('*')
          .eq('id', trackId)
          .maybeSingle();

        if (trackError) throw trackError;
        if (!trackData) {
          setNotFound(true);
          return;
        }
        setTrack(trackData as TrainingTrack);

        // Fetch modules for this track
        const { data: modulesData, error: modulesError } = await supabase
          .from('training_modules')
          .select('*')
          .eq('track_id', trackId)
          .order('display_order');

        if (modulesError) throw modulesError;
        setModules((modulesData ?? []) as TrainingModule[]);

        // Fetch user progress
        const { data: progressData, error: progressError } = await supabase
          .from('user_training_progress')
          .select('module_id')
          .eq('user_id', user.id);

        if (progressError) throw progressError;
        setCompletedModuleIds(new Set((progressData ?? []).map((p) => p.module_id)));
      } catch (err) {
        console.error('Error fetching track data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, trackId]);

  if (loading) {
    return (
      <AppShell showNav={false}>
        <header className="sticky top-0 z-40 bg-white border-b border-iron-100 safe-top">
          <div className="px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => navigate('/training')}
              className="p-2 -ml-2 rounded-xl hover:bg-iron-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-iron-700" />
            </button>
            <div className="flex-1">
              <div className="h-4 bg-iron-100 rounded animate-pulse w-1/2" />
            </div>
          </div>
        </header>
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-iron-100 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-iron-100 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-iron-100 rounded animate-pulse w-1/4" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </AppShell>
    );
  }

  if (notFound || !track) {
    return (
      <AppShell showNav={false}>
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-screen">
          <p className="text-iron-500">Training track not found</p>
          <button
            onClick={() => navigate('/training')}
            className="mt-4 text-brand-600 font-medium"
          >
            Back to Training
          </button>
        </div>
      </AppShell>
    );
  }

  const completedCount = modules.filter((m) => completedModuleIds.has(m.id)).length;
  const trackProgress = modules.length > 0
    ? Math.round((completedCount / modules.length) * 100)
    : 0;

  // Determine the index of the next module to complete (first not completed in order)
  const nextModuleIndex = modules.findIndex((m) => !completedModuleIds.has(m.id));

  return (
    <AppShell showNav={false}>
      {/* Custom Header with progress */}
      <header className="sticky top-0 z-40 bg-white border-b border-iron-100 safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/training')}
            className="p-2 -ml-2 rounded-xl hover:bg-iron-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-iron-700" />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold text-iron-900">{track.title}</h1>
            <p className="text-xs text-iron-500">
              {completedCount} of {modules.length} modules complete
            </p>
          </div>
          <Badge variant={trackProgress === 100 ? 'success' : 'default'}>
            {trackProgress}%
          </Badge>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-iron-100">
          <div
            className={`h-full transition-all ${
              trackProgress === 100 ? 'bg-green-500' : 'bg-brand-500'
            }`}
            style={{ width: `${trackProgress}%` }}
          />
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Track Description */}
        <p className="text-iron-600">{track.description}</p>

        {/* Modules List */}
        <section>
          <h3 className="text-sm font-medium text-iron-500 uppercase tracking-wide mb-3">
            Modules
          </h3>

          <div className="space-y-2">
            {modules.map((module, index) => {
              const isCompleted = completedModuleIds.has(module.id);
              const isNext = index === nextModuleIndex;
              const isLocked = !isCompleted && !isNext;

              return (
                <Card
                  key={module.id}
                  className={`p-4 ${isLocked ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    {/* Status indicator */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isCompleted
                        ? 'bg-green-100'
                        : isNext
                        ? 'bg-brand-100'
                        : 'bg-iron-100'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : isLocked ? (
                        <Lock className="w-5 h-5 text-iron-400" />
                      ) : (
                        <Play className="w-5 h-5 text-brand-600" />
                      )}
                    </div>

                    {/* Module info */}
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium ${
                        isLocked ? 'text-iron-400' : 'text-iron-900'
                      }`}>
                        {module.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1 text-xs text-iron-500">
                          <Clock className="w-3 h-3" />
                          <span>{module.duration_mins} min</span>
                        </div>
                        {isCompleted && (
                          <span className="text-xs text-green-600 font-medium">Completed</span>
                        )}
                        {isNext && (
                          <span className="text-xs text-brand-600 font-medium">Up next</span>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    {isNext && (
                      <Button size="sm" onClick={() => navigate(`/training/${trackId}/${module.id}`)}>Start</Button>
                    )}
                    {isCompleted && (
                      <button
                        className="text-sm text-iron-500 hover:text-iron-700"
                        onClick={() => navigate(`/training/${trackId}/${module.id}`)}
                      >
                        Review
                      </button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Continue Button */}
        {trackProgress < 100 && nextModuleIndex !== -1 && (
          <div className="pb-4">
            <Button
              className="w-full"
              onClick={() => {
                const nextModule = modules[nextModuleIndex];
                if (nextModule) {
                  navigate(`/training/${trackId}/${nextModule.id}`);
                }
              }}
            >
              <Play className="w-4 h-4 mr-2" />
              Continue Training
            </Button>
          </div>
        )}

        {/* Completion Message */}
        {trackProgress === 100 && (
          <Card className="p-6 text-center bg-green-50 border-green-200">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-green-900 mb-1">
              Track Complete!
            </h3>
            <p className="text-green-700 text-sm">
              Congratulations! You've completed all modules in this track.
            </p>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
