import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Welcome,
  RoleSelect,
  AgeVerification,
  ProfileSetup,
  Guidelines,
  type ProfileData,
} from '../components/onboarding';

type OnboardingStep = 'welcome' | 'role' | 'age' | 'profile' | 'guidelines';

export function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [role, setRole] = useState<'mentor' | 'mentee' | null>(null);
  const [age, setAge] = useState<number | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  const handleRoleSelect = (selectedRole: 'mentor' | 'mentee') => {
    setRole(selectedRole);
    setStep('age');
  };

  const handleAgeVerify = (verifiedAge: number) => {
    setAge(verifiedAge);
    setStep('profile');
  };

  const handleProfileComplete = (profileData: ProfileData) => {
    setProfile(profileData);
    setStep('guidelines');
  };

  const handleGuidelinesAccept = () => {
    // TODO: Save user data to Supabase
    console.log('Onboarding complete:', { role, age, profile });

    // Navigate to home
    navigate('/home');
  };

  return (
    <>
      {step === 'welcome' && (
        <Welcome onContinue={() => setStep('role')} />
      )}

      {step === 'role' && (
        <RoleSelect
          onSelect={handleRoleSelect}
          onBack={() => setStep('welcome')}
        />
      )}

      {step === 'age' && role && (
        <AgeVerification
          role={role}
          onContinue={handleAgeVerify}
          onBack={() => setStep('role')}
        />
      )}

      {step === 'profile' && role && (
        <ProfileSetup
          role={role}
          onContinue={handleProfileComplete}
          onBack={() => setStep('age')}
        />
      )}

      {step === 'guidelines' && role && (
        <Guidelines
          role={role}
          onAccept={handleGuidelinesAccept}
          onBack={() => setStep('profile')}
        />
      )}
    </>
  );
}
