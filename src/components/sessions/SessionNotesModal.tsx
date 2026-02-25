import { useState } from 'react';
import { X, FileText } from 'lucide-react';
import { Button, Textarea } from '../ui';
import type { UserRole } from '../../types/database.types';

interface SessionNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (notes: string) => void;
  existingNotes?: string | null;
  participantName: string;
  sessionDate: string;
  userRole: UserRole;
}

export function SessionNotesModal({
  isOpen,
  onClose,
  onSave,
  existingNotes,
  participantName,
  sessionDate,
  userRole,
}: SessionNotesModalProps) {
  const [notes, setNotes] = useState(existingNotes || '');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(notes);
    onClose();
  };

  const promptQuestions = userRole === 'mentor'
    ? [
        'What topics were covered in this session?',
        'What progress did your mentee make?',
        'What goals or action items were set?',
        'Any concerns or areas needing follow-up?',
      ]
    : [
        'What did you learn in this session?',
        'What was most helpful or valuable?',
        'What action items or goals did you set?',
        'What would you like to discuss next time?',
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="w-full max-w-md bg-white rounded-t-2xl animate-slide-up max-h-[85vh] flex flex-col mb-16">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-iron-100">
          <div>
            <h2 className="text-lg font-semibold text-iron-900">Session Notes</h2>
            <p className="text-sm text-iron-500">
              {participantName} • {sessionDate}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-iron-100"
          >
            <X className="w-5 h-5 text-iron-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 pt-4">
          {/* Prompt Questions */}
          <div className="mb-4 p-3 bg-iron-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-iron-500" />
              <p className="text-sm font-medium text-iron-700">Consider reflecting on:</p>
            </div>
            <ul className="text-sm text-iron-600 space-y-1 pl-6">
              {promptQuestions.map((question, index) => (
                <li key={index} className="list-disc">{question}</li>
              ))}
            </ul>
          </div>

          <Textarea
            label={userRole === 'mentor' ? 'Mentor Notes' : 'Your Notes'}
            placeholder="Write your notes here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
          />

          <p className="text-xs text-iron-400 mt-2">
            {userRole === 'mentor'
              ? 'These notes are visible to program administrators and help track mentee progress.'
              : 'These notes help you remember what you learned and track your growth.'}
          </p>
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
            onClick={handleSave}
          >
            {existingNotes ? 'Update Notes' : 'Save Notes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
