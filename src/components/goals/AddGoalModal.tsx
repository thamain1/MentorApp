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
      <div className="w-full max-w-md bg-white rounded-t-2xl animate-slide-up max-h-[85vh] flex flex-col mb-16">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-iron-100">
          <h2 className="text-lg font-semibold text-iron-900">Add New Goal</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-iron-100"
          >
            <X className="w-5 h-5 text-iron-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 pt-4 space-y-4">
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
        </div>

        {/* Fixed Footer with Buttons */}
        <div className="flex gap-3 p-6 pt-4 border-t border-iron-100 bg-white">
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
  );
}
