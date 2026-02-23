import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle,
  Circle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { AppShell, Header } from '../layout';
import { Card, Button, Badge } from '../ui';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface TrainingModule {
  id: string;
  track_id: string;
  title: string;
  content: string;
  display_order: number;
  duration_mins: number;
  created_at: string;
}

interface TrainingTrack {
  id: string;
  title: string;
}

export function ModuleDetail() {
  const { trackId, moduleId } = useParams<{ trackId: string; moduleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [module, setModule] = useState<TrainingModule | null>(null);
  const [track, setTrack] = useState<TrainingTrack | null>(null);
  const [allModules, setAllModules] = useState<TrainingModule[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!user || !moduleId || !trackId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch the module
        const { data: moduleData, error: moduleError } = await supabase
          .from('training_modules')
          .select('*')
          .eq('id', moduleId)
          .maybeSingle();

        if (moduleError) throw moduleError;
        if (!moduleData) {
          setNotFound(true);
          return;
        }
        setModule(moduleData as TrainingModule);

        // Fetch the track (id, title only)
        const { data: trackData, error: trackError } = await supabase
          .from('training_tracks')
          .select('id, title')
          .eq('id', trackId)
          .maybeSingle();

        if (trackError) throw trackError;
        if (!trackData) {
          setNotFound(true);
          return;
        }
        setTrack(trackData as TrainingTrack);

        // Fetch all modules in this track for prev/next navigation
        const { data: allModulesData, error: allModulesError } = await supabase
          .from('training_modules')
          .select('*')
          .eq('track_id', trackId)
          .order('display_order');

        if (allModulesError) throw allModulesError;
        setAllModules((allModulesData ?? []) as TrainingModule[]);

        // Check if user has already completed this module
        const { data: progressData, error: progressError } = await supabase
          .from('user_training_progress')
          .select('id')
          .eq('user_id', user.id)
          .eq('module_id', moduleId)
          .maybeSingle();

        if (progressError) throw progressError;
        setIsCompleted(!!progressData);
      } catch (err) {
        console.error('Error fetching module data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, moduleId, trackId]);

  const handleMarkComplete = async () => {
    if (!user || !moduleId || isCompleted || markingComplete) return;
    setMarkingComplete(true);
    try {
      const { error } = await supabase
        .from('user_training_progress')
        .insert({ user_id: user.id, module_id: moduleId });
      if (error) throw error;
      setIsCompleted(true);
    } catch (err) {
      console.error('Error marking module complete:', err);
    } finally {
      setMarkingComplete(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <Header title="Module" showBack />
        <div className="p-4 space-y-4">
          <Card className="p-6">
            <div className="space-y-3">
              <div className="h-6 bg-iron-100 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-iron-100 rounded animate-pulse w-full" />
              <div className="h-4 bg-iron-100 rounded animate-pulse w-2/3" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-3 bg-iron-100 rounded animate-pulse" />
              ))}
            </div>
          </Card>
        </div>
      </AppShell>
    );
  }

  if (notFound || !module || !track) {
    return (
      <AppShell>
        <Header title="Module" showBack />
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
          <p className="text-iron-500">Module not found</p>
          <button
            onClick={() => navigate('/training')}
            className="mt-4 text-brand-600 font-medium"
          >
            Back to training
          </button>
        </div>
      </AppShell>
    );
  }

  // Find current module index and get prev/next
  const moduleIndex = allModules.findIndex((m) => m.id === moduleId);
  const prevModule = moduleIndex > 0 ? allModules[moduleIndex - 1] : null;
  const nextModule = moduleIndex < allModules.length - 1 ? allModules[moduleIndex + 1] : null;

  return (
    <AppShell>
      <Header title={track.title} showBack />

      <div className="p-4 space-y-4 pb-32">
        {/* Module Header */}
        <Card className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-100 text-blue-600">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="default">Reading</Badge>
                {isCompleted && (
                  <Badge variant="success">Completed</Badge>
                )}
              </div>
              <h1 className="text-xl font-bold text-iron-900">{module.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-iron-500">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{module.duration_mins} min</span>
            </div>
            <div className="flex items-center gap-1">
              {isCompleted ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
              <span>Module {moduleIndex + 1} of {allModules.length}</span>
            </div>
          </div>
        </Card>

        {/* Module Content */}
        <Card className="p-4">
          <p className="text-iron-600 text-sm leading-relaxed whitespace-pre-line">
            {module.content}
          </p>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-iron-100 p-4 safe-bottom">
        <div className="max-w-md mx-auto">
          {!isCompleted ? (
            <Button
              className="w-full"
              size="lg"
              onClick={handleMarkComplete}
              disabled={markingComplete}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              {markingComplete ? 'Saving...' : 'Mark as Complete'}
            </Button>
          ) : (
            <div className="flex gap-3">
              {prevModule && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate(`/training/${trackId}/${prevModule.id}`)}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
              )}
              {nextModule ? (
                <Button
                  className="flex-1"
                  onClick={() => navigate(`/training/${trackId}/${nextModule.id}`)}
                >
                  Next Module
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  className="flex-1"
                  onClick={() => navigate(`/training/${trackId}`)}
                >
                  Back to Track
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
