import { useState } from 'react';
import { ArrowLeft, Shield, Heart, Users, AlertTriangle, Check } from 'lucide-react';
import { Button } from '../ui';
import { cn } from '../../lib/utils';

interface GuidelinesProps {
  role: 'mentor' | 'mentee';
  onAccept: () => void;
  onBack: () => void;
}

const guidelines = [
  {
    icon: Shield,
    title: 'Safety First',
    description: 'Never share personal contact info, addresses, or financial details. All communication should happen through the app.',
  },
  {
    icon: Heart,
    title: 'Respect & Dignity',
    description: 'Treat everyone with respect. No bullying, harassment, discrimination, or inappropriate language.',
  },
  {
    icon: Users,
    title: 'Healthy Boundaries',
    description: 'Maintain appropriate mentor-mentee boundaries. Report any concerns immediately.',
  },
  {
    icon: AlertTriangle,
    title: 'Speak Up',
    description: "If something doesn't feel right, tell a trusted adult or use the report button. We're here to help.",
  },
];

export function Guidelines({ role, onAccept, onBack }: GuidelinesProps) {
  const [accepted, setAccepted] = useState(false);

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
      <div className="mt-8 mb-6">
        <h1 className="text-2xl font-bold text-iron-900 mb-2">
          Community Guidelines
        </h1>
        <p className="text-iron-500">
          We're building a safe, supportive community. Please review and accept our guidelines.
        </p>
      </div>

      {/* Guidelines */}
      <div className="space-y-4 mb-8">
        {guidelines.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex gap-4 p-4 bg-iron-50 rounded-xl">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
              <Icon className="w-5 h-5 text-brand-500" />
            </div>
            <div>
              <h3 className="font-semibold text-iron-900 mb-1">{title}</h3>
              <p className="text-sm text-iron-600">{description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Additional note for minors */}
      {role === 'mentee' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Note for young men:</strong> If anyone makes you feel uncomfortable or asks you to do
            something that doesn't feel right, please tell a parent, guardian, or trusted adult right away.
            You can also use the report button in the app.
          </p>
        </div>
      )}

      {/* Checkbox */}
      <label className="flex items-start gap-3 cursor-pointer mb-8">
        <button
          onClick={() => setAccepted(!accepted)}
          className={cn(
            'w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors',
            accepted
              ? 'bg-brand-500 border-brand-500'
              : 'border-iron-300 hover:border-iron-400'
          )}
        >
          {accepted && <Check className="w-4 h-4 text-white" />}
        </button>
        <span className="text-sm text-iron-700">
          I have read and agree to follow the community guidelines. I understand that violation
          of these guidelines may result in removal from the platform.
        </span>
      </label>

      {/* Continue button */}
      <div className="mt-auto">
        <Button
          onClick={onAccept}
          size="lg"
          className="w-full"
          disabled={!accepted}
        >
          Accept & Continue
        </Button>
      </div>
    </div>
  );
}
