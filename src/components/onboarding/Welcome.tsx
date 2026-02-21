import { Flame } from 'lucide-react';
import { Button } from '../ui';

interface WelcomeProps {
  onContinue: () => void;
}

export function Welcome({ onContinue }: WelcomeProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-iron-900 to-iron-950">
      {/* Logo */}
      <div className="mb-8">
        <div className="w-24 h-24 bg-flame-500 rounded-3xl flex items-center justify-center shadow-xl shadow-flame-500/30">
          <Flame className="w-14 h-14 text-white" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-4xl font-black text-white text-center mb-4">
        Iron Sharpens Iron
      </h1>

      {/* Tagline */}
      <p className="text-xl text-iron-300 text-center mb-2">
        Men building men.
      </p>
      <p className="text-iron-400 text-center max-w-xs mb-12">
        Connect with mentors, grow together, and become the man you're called to be.
      </p>

      {/* Scripture reference */}
      <blockquote className="text-iron-400 text-sm italic text-center max-w-xs mb-12">
        "As iron sharpens iron, so one person sharpens another."
        <cite className="block text-iron-500 mt-1 not-italic">— Proverbs 27:17</cite>
      </blockquote>

      {/* CTA */}
      <Button onClick={onContinue} size="lg" className="w-full max-w-xs">
        Get Started
      </Button>

      <p className="text-iron-500 text-sm mt-6">
        Already have an account?{' '}
        <button className="text-flame-400 font-medium hover:underline">
          Sign In
        </button>
      </p>
    </div>
  );
}
