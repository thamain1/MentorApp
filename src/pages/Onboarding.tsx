import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Welcome,
  AuthStep,
  RoleSelect,
  AgeVerification,
  SafetyConsent,
  ProfileSetup,
  Guidelines,
  type ProfileData,
} from '../components/onboarding';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

type OnboardingStep = 'welcome' | 'auth' | 'role' | 'age' | 'safety' | 'profile' | 'guidelines';

export function OnboardingPage() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<'mentor' | 'mentee' | null>(null);
  const [age, setAge] = useState<number | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleAuthSuccess = (uid: string, isNewUser: boolean) => {
    setUserId(uid);
    if (isNewUser) {
      setStep('role');
    } else {
      navigate('/home', { replace: true });
    }
  };

  const handleRoleSelect = (selectedRole: 'mentor' | 'mentee') => {
    setRole(selectedRole);
    setStep('age');
  };

  const handleAgeVerify = (verifiedAge: number) => {
    setAge(verifiedAge);
    setStep('safety');
  };

  const handleSafetyAccept = () => {
    setStep('profile');
  };

  const handleProfileComplete = (profileData: ProfileData) => {
    setProfile(profileData);
    setStep('guidelines');
  };

  const handleGuidelinesAccept = async () => {
    if (!userId || !role || !age || !profile) return;

    setSaving(true);
    setSaveError('');

    const { error } = await supabase.from('profiles').insert({
      user_id: userId,
      role,
      first_name: profile.firstName,
      last_name: profile.lastName || '',
      age,
      bio: profile.bio || null,
      interests: profile.interests,
      goals: profile.goals,
      specialties: profile.specialties,
      guidelines_accepted_at: new Date().toISOString(),
    });

    if (error) {
      setSaveError('Something went wrong saving your profile. Please try again.');
      setSaving(false);
      return;
    }

    await refreshProfile();
    navigate('/home', { replace: true });
  };

  return (
    <>
      {step === 'welcome' && (
        <Welcome
          onContinue={() => { setAuthMode('signup'); setStep('auth'); }}
          onSignIn={() => { setAuthMode('signin'); setStep('auth'); }}
        />
      )}

      {step === 'auth' && (
        <AuthStep
          onSuccess={handleAuthSuccess}
          onBack={() => setStep('welcome')}
          initialMode={authMode}
        />
      )}

      {step === 'role' && (
        <RoleSelect
          onSelect={handleRoleSelect}
          onBack={() => setStep('auth')}
        />
      )}

      {step === 'age' && role && (
        <AgeVerification
          role={role}
          onContinue={handleAgeVerify}
          onBack={() => setStep('role')}
        />
      )}

      {step === 'safety' && role && age !== null && (
        <SafetyConsent
          age={age}
          role={role}
          onAccept={handleSafetyAccept}
          onBack={() => setStep('age')}
        />
      )}

      {step === 'profile' && role && (
        <ProfileSetup
          role={role}
          onContinue={handleProfileComplete}
          onBack={() => setStep('safety')}
        />
      )}

      {step === 'guidelines' && role && (
        <Guidelines
          role={role}
          onAccept={handleGuidelinesAccept}
          onBack={() => setStep('profile')}
          saving={saving}
          error={saveError}
        />
      )}
    </>
  );
}
