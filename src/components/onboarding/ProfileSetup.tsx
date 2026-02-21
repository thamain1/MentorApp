import { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { Button, Input, Textarea } from '../ui';
import { cn } from '../../lib/utils';
import { INTEREST_OPTIONS, GOAL_CATEGORIES } from '../../types';

interface ProfileSetupProps {
  role: 'mentor' | 'mentee';
  onContinue: (profile: ProfileData) => void;
  onBack: () => void;
}

export interface ProfileData {
  firstName: string;
  lastName: string;
  bio: string;
  interests: string[];
  goals: string[];
}

export function ProfileSetup({ role, onContinue, onBack }: ProfileSetupProps) {
  const [step, setStep] = useState<'name' | 'bio' | 'interests' | 'goals'>('name');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : prev.length < 5
        ? [...prev, interest]
        : prev
    );
  };

  const toggleGoal = (goal: string) => {
    setGoals((prev) =>
      prev.includes(goal)
        ? prev.filter((g) => g !== goal)
        : prev.length < 3
        ? [...prev, goal]
        : prev
    );
  };

  const handleNext = () => {
    if (step === 'name') setStep('bio');
    else if (step === 'bio') setStep('interests');
    else if (step === 'interests') setStep('goals');
    else {
      onContinue({ firstName, lastName, bio, interests, goals });
    }
  };

  const handleBack = () => {
    if (step === 'name') onBack();
    else if (step === 'bio') setStep('name');
    else if (step === 'interests') setStep('bio');
    else setStep('interests');
  };

  const canContinue = () => {
    if (step === 'name') return firstName.trim().length > 0;
    if (step === 'bio') return true; // Bio is optional
    if (step === 'interests') return interests.length >= 1;
    if (step === 'goals') return goals.length >= 1;
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col p-6 bg-white">
      {/* Back button */}
      <button
        onClick={handleBack}
        className="p-2 -ml-2 rounded-xl hover:bg-iron-100 transition-colors w-fit"
      >
        <ArrowLeft className="w-5 h-5 text-iron-700" />
      </button>

      {/* Progress indicator */}
      <div className="flex gap-2 mt-4 mb-8">
        {['name', 'bio', 'interests', 'goals'].map((s, i) => (
          <div
            key={s}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              ['name', 'bio', 'interests', 'goals'].indexOf(step) >= i
                ? 'bg-flame-500'
                : 'bg-iron-200'
            )}
          />
        ))}
      </div>

      {/* Name step */}
      {step === 'name' && (
        <>
          <h1 className="text-2xl font-bold text-iron-900 mb-2">
            What's your name?
          </h1>
          <p className="text-iron-500 mb-8">
            Let's get to know you a little better.
          </p>
          <div className="space-y-4">
            <Input
              label="First name"
              placeholder="Your first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoFocus
            />
            <Input
              label="Last name (optional)"
              placeholder="Your last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </>
      )}

      {/* Bio step */}
      {step === 'bio' && (
        <>
          <h1 className="text-2xl font-bold text-iron-900 mb-2">
            Tell us about yourself
          </h1>
          <p className="text-iron-500 mb-8">
            {role === 'mentee'
              ? 'Help mentors understand who you are and what drives you.'
              : 'Share what you bring to the table as a mentor.'}
          </p>
          <Textarea
            placeholder={
              role === 'mentee'
                ? "What are you passionate about? What challenges are you facing? What do you hope to achieve?"
                : "What's your background? Why do you want to mentor? What wisdom can you share?"
            }
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={6}
          />
          <p className="text-iron-400 text-sm mt-2">Optional, but helps with matching</p>
        </>
      )}

      {/* Interests step */}
      {step === 'interests' && (
        <>
          <h1 className="text-2xl font-bold text-iron-900 mb-2">
            What are your interests?
          </h1>
          <p className="text-iron-500 mb-6">
            Select up to 5 interests to help us find great matches.
          </p>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((interest) => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={cn(
                  'px-4 py-2 rounded-full border-2 text-sm font-medium transition-all',
                  interests.includes(interest)
                    ? 'border-flame-500 bg-flame-50 text-flame-700'
                    : 'border-iron-200 text-iron-600 hover:border-iron-300'
                )}
              >
                {interests.includes(interest) && <Check className="w-4 h-4 inline mr-1" />}
                {interest}
              </button>
            ))}
          </div>
          <p className="text-iron-400 text-sm mt-4">
            {interests.length}/5 selected
          </p>
        </>
      )}

      {/* Goals step */}
      {step === 'goals' && (
        <>
          <h1 className="text-2xl font-bold text-iron-900 mb-2">
            {role === 'mentee' ? 'What do you want to work on?' : 'What can you help with?'}
          </h1>
          <p className="text-iron-500 mb-6">
            Select up to 3 focus areas.
          </p>
          <div className="flex flex-wrap gap-2">
            {GOAL_CATEGORIES.map((goal) => (
              <button
                key={goal}
                onClick={() => toggleGoal(goal)}
                className={cn(
                  'px-4 py-2 rounded-full border-2 text-sm font-medium transition-all',
                  goals.includes(goal)
                    ? 'border-flame-500 bg-flame-50 text-flame-700'
                    : 'border-iron-200 text-iron-600 hover:border-iron-300'
                )}
              >
                {goals.includes(goal) && <Check className="w-4 h-4 inline mr-1" />}
                {goal}
              </button>
            ))}
          </div>
          <p className="text-iron-400 text-sm mt-4">
            {goals.length}/3 selected
          </p>
        </>
      )}

      {/* Continue button */}
      <div className="mt-auto pt-8">
        <Button
          onClick={handleNext}
          size="lg"
          className="w-full"
          disabled={!canContinue()}
        >
          {step === 'goals' ? 'Complete Profile' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}
