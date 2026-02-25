import { useState } from 'react';
import { X, Star } from 'lucide-react';
import { Button } from '../ui';
import { supabase } from '../../lib/supabase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
  matchId: string;
  mentorId: string;
  menteeId: string;
  mentorName: string;
}

function StarRating({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium text-iron-700">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className="focus:outline-none"
            aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
          >
            <Star
              className={`w-7 h-7 transition-colors ${
                n <= value ? 'text-amber-400 fill-amber-400' : 'text-iron-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

const getMonthLabel = () => {
  return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export function MentorSurveyPrompt({
  isOpen,
  onClose,
  onSubmitted,
  matchId,
  mentorId,
  menteeId,
  mentorName,
}: Props) {
  const [overall, setOverall] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [helpfulness, setHelpfulness] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const canSubmit = overall >= 1 && communication >= 1 && helpfulness >= 1;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const survey_month = new Date().toISOString().slice(0, 7);
      const { error: insertError } = await supabase.from('mentor_surveys').insert({
        match_id: matchId,
        mentee_id: menteeId,
        mentor_id: mentorId,
        survey_month,
        overall_rating: overall,
        communication_rating: communication,
        helpfulness_rating: helpfulness,
        feedback_text: feedbackText.trim() || null,
      });
      if (insertError) throw insertError;
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl w-full max-w-lg p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-bold text-iron-900">
            Rate Your Mentor — {getMonthLabel()}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-iron-400 hover:text-iron-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-iron-500 mb-4">
          How is {mentorName} doing this month?
        </p>

        <div className="divide-y divide-iron-100 mb-4">
          <StarRating label="Overall Experience" value={overall} onChange={setOverall} />
          <StarRating label="Communication" value={communication} onChange={setCommunication} />
          <StarRating label="Helpfulness" value={helpfulness} onChange={setHelpfulness} />
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-iron-700 block mb-1">
            Any feedback for your mentor? <span className="font-normal text-iron-400">(optional)</span>
          </label>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Share anything you'd like..."
            rows={3}
            className="w-full px-3 py-2 bg-iron-50 rounded-xl border border-iron-200 focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm resize-none"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 mb-3">{error}</p>
        )}

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={submitting}>
            Not Now
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </div>
      </div>
    </div>
  );
}
