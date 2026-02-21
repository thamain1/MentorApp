import { useState } from 'react';
import { Target, Plus, Calendar, CheckCircle, ChevronDown, ChevronUp, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { AppShell, Header } from '../layout';
import { Card } from '../ui';
import { formatDate } from '../../lib/utils';
import { mockGoals } from '../../data/mockData';
import { AddGoalModal } from './AddGoalModal';

export function GoalsList() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const activeGoals = mockGoals.filter(g => g.status === 'active');
  const completedGoals = mockGoals.filter(g => g.status === 'completed');

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-flame-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-iron-300';
  };

  return (
    <AppShell>
      <Header title="My Goals" showNotifications />

      <div className="p-4 space-y-6">
        {/* Active Goals */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-iron-500 uppercase tracking-wide">
              Active Goals ({activeGoals.length})
            </h3>
          </div>

          {activeGoals.length === 0 ? (
            <Card className="p-6 text-center">
              <Target className="w-10 h-10 text-iron-300 mx-auto mb-2" />
              <p className="text-iron-600 font-medium mb-1">No active goals</p>
              <p className="text-sm text-iron-500">
                Set a goal to start tracking your progress
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {activeGoals.map((goal) => (
                <Card key={goal.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-iron-900">{goal.title}</h4>
                      {goal.description && (
                        <p className="text-sm text-iron-500 mt-1">{goal.description}</p>
                      )}
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === goal.id ? null : goal.id)}
                        className="p-1 rounded-lg hover:bg-iron-100"
                      >
                        <MoreVertical className="w-4 h-4 text-iron-400" />
                      </button>
                      {openMenuId === goal.id && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-iron-100 py-1 z-50">
                            <button
                              onClick={() => setOpenMenuId(null)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-iron-700 hover:bg-iron-50"
                            >
                              <Edit2 className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => setOpenMenuId(null)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-green-600 hover:bg-iron-50"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Complete
                            </button>
                            <button
                              onClick={() => setOpenMenuId(null)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-iron-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-iron-500">Progress</span>
                      <span className="font-medium text-iron-700">{goal.progress}%</span>
                    </div>
                    <div className="h-2 bg-iron-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getProgressColor(goal.progress)}`}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Target date */}
                  {goal.target_date && (
                    <div className="flex items-center gap-1 text-sm text-iron-500">
                      <Calendar className="w-4 h-4" />
                      <span>Target: {formatDate(goal.target_date)}</span>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <section>
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center justify-between w-full mb-3"
            >
              <h3 className="text-sm font-medium text-iron-500 uppercase tracking-wide">
                Completed ({completedGoals.length})
              </h3>
              {showCompleted ? (
                <ChevronUp className="w-4 h-4 text-iron-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-iron-400" />
              )}
            </button>

            {showCompleted && (
              <div className="space-y-3">
                {completedGoals.map((goal) => (
                  <Card key={goal.id} className="p-4 bg-iron-50">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-iron-700 line-through">
                          {goal.title}
                        </h4>
                        {goal.completed_at && (
                          <p className="text-xs text-iron-500 mt-1">
                            Completed {formatDate(goal.completed_at)}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-flame-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-flame-600 transition-colors z-30"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Add Goal Modal */}
      <AddGoalModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(goal) => {
          // In real app, this would add to Supabase
          console.log('Adding goal:', goal);
        }}
      />
    </AppShell>
  );
}
