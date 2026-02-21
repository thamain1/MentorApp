import { useState } from 'react';
import { X } from 'lucide-react';
import { Button, Input, Textarea } from '../ui';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (goal: { title: string; description: string; targetDate: string }) => void;
}

export function AddGoalModal({ isOpen, onClose, onAdd }: AddGoalModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd({ title, description, targetDate });
    setTitle('');
    setDescription('');
    setTargetDate('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="w-full max-w-md bg-white rounded-t-2xl p-6 safe-bottom animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-iron-900">Add New Goal</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-iron-100"
          >
            <X className="w-5 h-5 text-iron-500" />
          </button>
        </div>

        <div className="space-y-4">
          <Input
            label="Goal Title"
            placeholder="What do you want to achieve?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            label="Description (optional)"
            placeholder="Add more details about your goal..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
          <Input
            label="Target Date (optional)"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={!title.trim()}
            >
              Add Goal
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
