import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle,
  Circle,
  BookOpen,
  Video,
  HelpCircle,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { AppShell, Header } from '../layout';
import { Card, Button, Badge } from '../ui';
import { mockModuleContent, mockTrainingTracks } from '../../data/mockData';

export function ModuleDetail() {
  const { trackId, moduleId } = useParams<{ trackId: string; moduleId: string }>();
  const navigate = useNavigate();
  const [isCompleted, setIsCompleted] = useState(false);

  const module = moduleId ? mockModuleContent[moduleId] : null;
  const track = mockTrainingTracks.find((t) => t.id === trackId);

  if (!module || !track) {
    return (
      <AppShell>
        <Header title="Module" showBack />
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
          <p className="text-iron-500">Module not found</p>
          <button
            onClick={() => navigate('/training')}
            className="mt-4 text-flame-600 font-medium"
          >
            Back to training
          </button>
        </div>
      </AppShell>
    );
  }

  // Find current module index and get prev/next
  const moduleIndex = track.modules.findIndex((m) => m.id === moduleId);
  const prevModule = moduleIndex > 0 ? track.modules[moduleIndex - 1] : null;
  const nextModule = moduleIndex < track.modules.length - 1 ? track.modules[moduleIndex + 1] : null;

  const completed = module.isCompleted || isCompleted;

  const getTypeIcon = () => {
    switch (module.type) {
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'reading':
        return <BookOpen className="w-5 h-5" />;
      case 'interactive':
        return <Lightbulb className="w-5 h-5" />;
      case 'quiz':
        return <HelpCircle className="w-5 h-5" />;
    }
  };

  const getTypeLabel = () => {
    switch (module.type) {
      case 'video':
        return 'Video Lesson';
      case 'reading':
        return 'Reading';
      case 'interactive':
        return 'Interactive';
      case 'quiz':
        return 'Quiz';
    }
  };

  const handleMarkComplete = () => {
    setIsCompleted(true);
    // In real app, update progress in Supabase
  };

  return (
    <AppShell>
      <Header title={track.title} showBack />

      <div className="p-4 space-y-4 pb-32">
        {/* Module Header */}
        <Card className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              module.type === 'video' ? 'bg-red-100 text-red-600' :
              module.type === 'reading' ? 'bg-blue-100 text-blue-600' :
              module.type === 'interactive' ? 'bg-amber-100 text-amber-600' :
              'bg-purple-100 text-purple-600'
            }`}>
              {getTypeIcon()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="default">{getTypeLabel()}</Badge>
                {completed && (
                  <Badge variant="success">Completed</Badge>
                )}
              </div>
              <h1 className="text-xl font-bold text-iron-900">{module.title}</h1>
              <p className="text-sm text-iron-500">{module.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-iron-500">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{module.duration} min</span>
            </div>
            <div className="flex items-center gap-1">
              {completed ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
              <span>Module {moduleIndex + 1} of {track.modules.length}</span>
            </div>
          </div>
        </Card>

        {/* Module Content */}
        <div className="space-y-4">
          {module.content.sections.map((section, index) => (
            <Card key={index}>
              <h3 className="font-semibold text-iron-900 mb-2">{section.title}</h3>
              <p className="text-iron-600 text-sm leading-relaxed whitespace-pre-line">
                {section.body}
              </p>
            </Card>
          ))}
        </div>

        {/* Key Takeaways */}
        <Card className="bg-flame-50 border-flame-200">
          <h3 className="font-semibold text-flame-800 mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Key Takeaways
          </h3>
          <ul className="space-y-2">
            {module.content.keyTakeaways.map((takeaway, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-flame-700">
                <CheckCircle className="w-4 h-4 text-flame-500 flex-shrink-0 mt-0.5" />
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Reflection */}
        {module.content.reflection && (
          <Card className="bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Reflection</h3>
            <p className="text-sm text-blue-700">{module.content.reflection}</p>
          </Card>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-iron-100 p-4 safe-bottom">
        <div className="max-w-md mx-auto">
          {!completed ? (
            <Button className="w-full" size="lg" onClick={handleMarkComplete}>
              <CheckCircle className="w-5 h-5 mr-2" />
              Mark as Complete
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
