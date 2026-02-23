import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Button, Input, Textarea } from '../ui';
import { cn } from '../../lib/utils';
import {
  INTEREST_GROUPS,
  FOCUS_AREA_GROUPS,
  MENTOR_SPECIALTIES,
} from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface EditProfileModalProps {
  onClose: () => void;
}

const MAX_INTERESTS = 8;
const MAX_GOALS = 5;
const MAX_SPECIALTIES = 5;

type Tab = 'basics' | 'interests' | 'goals' | 'specialties';

export function EditProfileModal({ onClose }: EditProfileModalProps) {
  const { profile, user, refreshProfile } = useAuth();
  const role = profile?.role ?? 'mentee';

  const [tab, setTab] = useState<Tab>('basics');
  const [firstName, setFirstName] = useState(profile?.first_name ?? '');
  const [lastName, setLastName] = useState(profile?.last_name ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [location, setLocation] = useState(profile?.location ?? '');
  const [interests, setInterests] = useState<string[]>(profile?.interests ?? []);
  const [goals, setGoals] = useState<string[]>(profile?.goals ?? []);
  const [specialties, setSpecialties] = useState<string[]>(profile?.specialties ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tabs: Tab[] = role === 'mentor'
    ? ['basics', 'interests', 'goals', 'specialties']
    : ['basics', 'interests', 'goals'];

  const tabLabels: Record<Tab, string> = {
    basics: 'Basics',
    interests: 'Interests',
    goals: 'Focus Areas',
    specialties: 'Specialties',
  };

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

  const handleSave = async () => {
    if (!user || !firstName.trim()) return;
    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        bio: bio.trim() || null,
        location: location.trim() || null,
        interests,
        goals,
        specialties,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (updateError) {
      setError('Failed to save changes. Please try again.');
      setSaving(false);
      return;
    }

    await refreshProfile();
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <div className="flex items-center justify-between px-4 py-4 border-b border-iron-100">
        <button
          onClick={onClose}
          className="p-2 -ml-2 rounded-xl hover:bg-iron-100 transition-colors"
        >
          <X className="w-5 h-5 text-iron-700" />
        </button>
        <h2 className="text-base font-semibold text-iron-900">Edit Profile</h2>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving || !firstName.trim()}
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>

      <div className="flex border-b border-iron-100 px-4 gap-1">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-3 py-3 text-sm font-medium border-b-2 transition-colors',
              tab === t
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-iron-500 hover:text-iron-700'
            )}
          >
            {tabLabels[t]}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        {tab === 'basics' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
              />
              <Input
                label="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
              />
            </div>
            <Input
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State"
            />
            <div>
              <label className="block text-sm font-medium text-iron-700 mb-1.5">Bio</label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={
                  role === 'mentee'
                    ? 'What are you passionate about? What do you hope to achieve?'
                    : "What's your background? Why do you want to mentor?"
                }
                rows={5}
              />
            </div>
          </div>
        )}

        {tab === 'interests' && (
          <div>
            <p className="text-sm text-iron-500 mb-4">
              {interests.length}/{MAX_INTERESTS} selected
            </p>
            <div className="space-y-6">
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
                          {selected && <Check className="w-3.5 h-3.5 inline mr-1" />}
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'goals' && (
          <div>
            <p className="text-sm text-iron-500 mb-4">
              {goals.length}/{MAX_GOALS} selected
            </p>
            <div className="space-y-6">
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
                          {selected && <Check className="w-3.5 h-3.5 inline mr-1" />}
                          {area}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'specialties' && role === 'mentor' && (
          <div>
            <p className="text-sm text-iron-500 mb-4">
              {specialties.length}/{MAX_SPECIALTIES} selected
            </p>
            <div className="flex flex-wrap gap-2">
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
                    {selected && <Check className="w-3.5 h-3.5 inline mr-1" />}
                    {specialty}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
