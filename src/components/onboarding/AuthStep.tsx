import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Flame } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button, Input } from '../ui';

interface AuthStepProps {
  onSuccess: (userId: string, isNewUser: boolean) => void;
  onBack: () => void;
  initialMode?: 'signup' | 'signin';
}

type Mode = 'signup' | 'signin';

export function AuthStep({ onSuccess, onBack, initialMode = 'signup' }: AuthStepProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    if (!email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (mode === 'signup' && password !== confirmPassword) return 'Passwords do not match';
    return '';
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    if (mode === 'signup') {
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }
      if (data.user) {
        onSuccess(data.user.id, true);
      }
    } else {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }
      if (data.user) {
        onSuccess(data.user.id, false);
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col p-6 bg-white">
      <button
        onClick={onBack}
        className="p-2 -ml-2 rounded-xl hover:bg-iron-100 transition-colors w-fit"
      >
        <ArrowLeft className="w-5 h-5 text-iron-700" />
      </button>

      <div className="flex justify-center mt-8 mb-6">
        <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/25">
          <Flame className="w-8 h-8 text-white" />
        </div>
      </div>

      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-iron-900 mb-2">
          {mode === 'signup' ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="text-iron-500">
          {mode === 'signup'
            ? 'Enter your email and create a password.'
            : 'Sign in to continue your journey.'}
        </p>
      </div>

      <div className="space-y-4">
        <Input
          label="Email address"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(''); }}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-iron-400 hover:text-iron-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {mode === 'signup' && (
          <div className="relative">
            <Input
              label="Confirm password"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-9 text-iron-400 hover:text-iron-600"
            >
              {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}
      </div>

      <div className="mt-8">
        <Button
          onClick={handleSubmit}
          size="lg"
          className="w-full"
          disabled={loading || !email || !password || (mode === 'signup' && !confirmPassword)}
        >
          {loading ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
        </Button>
      </div>

      <p className="text-center text-iron-500 text-sm mt-6">
        {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(''); }}
          className="text-brand-600 font-medium hover:underline"
        >
          {mode === 'signup' ? 'Sign In' : 'Sign Up'}
        </button>
      </p>

      {mode === 'signup' && (
        <p className="text-center text-iron-400 text-xs mt-4 px-4">
          By creating an account you agree to our Terms of Service and Privacy Policy.
        </p>
      )}
    </div>
  );
}
