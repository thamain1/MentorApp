import { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { Button, Input, Textarea } from '../ui';
import { cn } from '../../lib/utils';
import {
  INTEREST_GROUPS,
  FOCUS_AREA_GROUPS,
  MENTOR_SPECIALTIES,
} from '../../types';

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
  specialties: string[];
}

type Step = 'name' | 'bio' | 'interests' | 'goals' | 'specialties';

const MENTEE_STEPS: Step[] = ['name', 'bio', 'interests', 'goals'];
const MENTOR_STEPS: Step[] = ['name', 'bio', 'interests', 'goals', 'specialties'];

const MAX_INTERESTS = 8;
const MAX_GOALS = 5;
const MAX_SPECIALTIES = 5;

export function ProfileSetup({ role, onContinue, onBack }: ProfileSetupProps) {
  const steps = role === 'mentor' ? MENTOR_STEPS : MENTEE_STEPS;
  const [step, setStep] = useState<Step>('name');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);

  const toggleItem = <T extends string>(
    _list: T[],
    setList: React.Dispatch<React.SetStateAction<T[]>>,
    item: T,
    max: number
  ) => {
    setList((prev) =>
      prev.includes(item)
        ? prev.filter((i) => i !== item)
        : prev.length < max
        ? [...prev, item]
        : prev
    );
  };

  const currentIndex = steps.indexOf(step);

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < steps.length) {
      setStep(steps[nextIndex]);
    } else {
      onContinue({ firstName, lastName, bio, interests, goals, specialties });
    }
  };

  const handleBack = () => {
    if (currentIndex === 0) {
      onBack();
    } else {
      setStep(steps[currentIndex - 1]);
    }
  };

  const canContinue = () => {
    if (step === 'name') return firstName.trim().length > 0;
    if (step === 'bio') return true;
    if (step === 'interests') return interests.length >= 1;
    if (step === 'goals') return goals.length >= 1;
    if (step === 'specialties') return specialties.length >= 1;
    return false;
  };

  const isLastStep = currentIndex === steps.length - 1;

  return (
    <div className="min-h-screen flex flex-col p-6 bg-white">
      <button
        onClick={handleBack}
        className="p-2 -ml-2 rounded-xl hover:bg-iron-100 transition-colors w-fit"
      >
        <ArrowLeft className="w-5 h-5 text-iron-700" />
      </button>

      <div className="flex gap-2 mt-4 mb-8">
        {steps.map((s, i) => (
          <div
            key={s}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              currentIndex >= i ? 'bg-brand-500' : 'bg-iron-200'
            )}
          />
        ))}
      </div>

      {step === 'name' && (
        <>
          <h1 className="text-2xl font-bold text-iron-900 mb-2">What's your name?</h1>
          <p className="text-iron-500 mb-8">Let's get to know you a little better.</p>
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

      {step === 'bio' && (
        <>
          <h1 className="text-2xl font-bold text-iron-900 mb-2">Tell us about yourself</h1>
          <p className="text-iron-500 mb-8">
            {role === 'mentee'
              ? 'Help mentors understand who you are and what drives you.'
              : 'Share what you bring to the table as a mentor.'}
          </p>
          <Textarea
            placeholder={
              role === 'mentee'
                ? 'What are you passionate about? What challenges are you facing? What do you hope to achieve?'
                : "What's your background? Why do you want to mentor? What wisdom can you share?"
            }
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={6}
          />
          <p className="text-iron-400 text-sm mt-2">Optional, but helps with matching</p>
        </>
      )}

      {step === 'interests' && (
        <>
          <h1 className="text-2xl font-bold text-iron-900 mb-2">What are your interests?</h1>
          <p className="text-iron-500 mb-1">
            Select up to {MAX_INTERESTS} things you enjoy.
          </p>
          <p className="text-iron-400 text-sm mb-6">
            {interests.length}/{MAX_INTERESTS} selected
          </p>
          <div className="space-y-6 overflow-y-auto flex-1">
            {INTEREST_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="text-xs font-semibold text-iron-400 uppercase tracking-wider mb-3">
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.interests.map((interest) => {
                    const selected = interests.includes(interest);
                    const atMax = interests.length >= MAX_INTERESTS && !selected;
                    return (
                      <button
                        key={interest}
                        onClick={() => toggleItem(interests, setInterests, interest, MAX_INTERESTS)}
                        disabled={atMax}
                        className={cn(
                          'px-4 py-2 rounded-full border-2 text-sm font-medium transition-all',
                          selected
                            ? 'border-brand-500 bg-brand-50 text-brand-700'
                            : atMax
                            ? 'border-iron-100 text-iron-300 cursor-not-allowed'
                            : 'border-iron-200 text-iron-600 hover:border-iron-300'
                        )}
                      >
                        {selected && <Check className="w-4 h-4 inline mr-1" />}
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {step === 'goals' && (
        <>
          <h1 className="text-2xl font-bold text-iron-900 mb-2">
            {role === 'mentee' ? 'What do you want to work on?' : 'What areas do you care about?'}
          </h1>
          <p className="text-iron-500 mb-1">
            {role === 'mentee'
              ? `Select up to ${MAX_GOALS} focus areas for your growth.`
              : `Select up to ${MAX_GOALS} areas you want to help mentees develop.`}
          </p>
          <p className="text-iron-400 text-sm mb-6">
            {goals.length}/{MAX_GOALS} selected
          </p>
          <div className="space-y-6 overflow-y-auto flex-1">
            {FOCUS_AREA_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="text-xs font-semibold text-iron-400 uppercase tracking-wider mb-3">
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.areas.map((area) => {
                    const selected = goals.includes(area);
                    const atMax = goals.length >= MAX_GOALS && !selected;
                    return (
                      <button
                        key={area}
                        onClick={() => toggleItem(goals, setGoals, area, MAX_GOALS)}
                        disabled={atMax}
                        className={cn(
                          'px-4 py-2 rounded-full border-2 text-sm font-medium transition-all',
                          selected
                            ? 'border-brand-500 bg-brand-50 text-brand-700'
                            : atMax
                            ? 'border-iron-100 text-iron-300 cursor-not-allowed'
                            : 'border-iron-200 text-iron-600 hover:border-iron-300'
                        )}
                      >
                        {selected && <Check className="w-4 h-4 inline mr-1" />}
                        {area}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {step === 'specialties' && (
        <>
          <h1 className="text-2xl font-bold text-iron-900 mb-2">What are your specialties?</h1>
          <p className="text-iron-500 mb-1">
            Select up to {MAX_SPECIALTIES} areas where you are equipped to guide and mentor others.
          </p>
          <p className="text-iron-400 text-sm mb-6">
            {specialties.length}/{MAX_SPECIALTIES} selected
          </p>
          <div className="flex flex-wrap gap-2 overflow-y-auto flex-1">
            {MENTOR_SPECIALTIES.map((specialty) => {
              const selected = specialties.includes(specialty);
              const atMax = specialties.length >= MAX_SPECIALTIES && !selected;
              return (
                <button
                  key={specialty}
                  onClick={() => toggleItem(specialties, setSpecialties, specialty, MAX_SPECIALTIES)}
                  disabled={atMax}
                  className={cn(
                    'px-4 py-2 rounded-full border-2 text-sm font-medium transition-all',
                    selected
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : atMax
                      ? 'border-iron-100 text-iron-300 cursor-not-allowed'
                      : 'border-iron-200 text-iron-600 hover:border-iron-300'
                  )}
                >
                  {selected && <Check className="w-4 h-4 inline mr-1" />}
                  {specialty}
                </button>
              );
            })}
          </div>
        </>
      )}

      <div className="mt-auto pt-8">
        <Button
          onClick={handleNext}
          size="lg"
          className="w-full"
          disabled={!canContinue()}
        >
          {isLastStep ? 'Complete Profile' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}
