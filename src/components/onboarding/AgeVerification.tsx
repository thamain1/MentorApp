import { useState } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button, Input } from '../ui';

interface AgeVerificationProps {
  role: 'mentor' | 'mentee';
  onContinue: (age: number) => void;
  onBack: () => void;
}

export function AgeVerification({ role, onContinue, onBack }: AgeVerificationProps) {
  const [age, setAge] = useState('');
  const [error, setError] = useState('');

  const minAge = role === 'mentor' ? 19 : 12;
  const maxAge = role === 'mentor' ? 99 : 19;

  const handleContinue = () => {
    const ageNum = parseInt(age, 10);

    if (isNaN(ageNum)) {
      setError('Please enter a valid age');
      return;
    }

    if (role === 'mentee' && (ageNum < 12 || ageNum > 19)) {
      setError('Mentees must be between 12 and 19 years old');
      return;
    }

    if (role === 'mentor' && ageNum < 19) {
      setError('Mentors must be 19 years or older');
      return;
    }

    setError('');
    onContinue(ageNum);
  };

  return (
    <div className="min-h-screen flex flex-col p-6 bg-white">
      {/* Back button */}
      <button
        onClick={onBack}
        className="p-2 -ml-2 rounded-xl hover:bg-iron-100 transition-colors w-fit"
      >
        <ArrowLeft className="w-5 h-5 text-iron-700" />
      </button>

      {/* Header */}
      <div className="mt-8 mb-8">
        <h1 className="text-2xl font-bold text-iron-900 mb-2">
          How old are you?
        </h1>
        <p className="text-iron-500">
          {role === 'mentee'
            ? 'We match mentees with mentors who understand their stage of life.'
            : 'This helps us connect you with mentees you can best support.'}
        </p>
      </div>

      {/* Age input */}
      <div className="mb-6">
        <Input
          type="number"
          inputMode="numeric"
          placeholder="Enter your age"
          value={age}
          onChange={(e) => {
            setAge(e.target.value);
            setError('');
          }}
          error={error}
          min={minAge}
          max={maxAge}
          className="text-center text-2xl font-bold"
        />
      </div>

      {/* Age requirement notice */}
      <div className="bg-iron-50 rounded-xl p-4 flex gap-3 mb-8">
        <AlertCircle className="w-5 h-5 text-iron-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-iron-600">
          {role === 'mentee' ? (
            <>
              <strong>Mentee requirements:</strong> Must be between 12-19 years old.
              If you're under 18, a parent or guardian may need to provide consent.
            </>
          ) : (
            <>
              <strong>Mentor requirements:</strong> Must be 19 years or older.
              All mentors complete a background check and training before being matched.
            </>
          )}
        </div>
      </div>

      {/* Continue button */}
      <div className="mt-auto">
        <Button
          onClick={handleContinue}
          size="lg"
          className="w-full"
          disabled={!age}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
