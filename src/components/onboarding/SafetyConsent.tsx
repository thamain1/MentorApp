import { useState } from 'react';
import { ArrowLeft, Shield, Eye, MessageSquare, UserCheck, Check, AlertTriangle } from 'lucide-react';
import { Button } from '../ui';
import { cn } from '../../lib/utils';

interface SafetyConsentProps {
  age: number;
  role: 'mentor' | 'mentee';
  onAccept: () => void;
  onBack: () => void;
}

const safetyPoints = [
  {
    icon: Shield,
    title: 'Safe & Monitored Platform',
    description: 'All activity is monitored by program administrators. Your safety is our top priority.',
  },
  {
    icon: Eye,
    title: 'Admin Oversight',
    description: 'Every mentor is reviewed and approved by admins before any match is made. Sessions are logged for accountability.',
  },
  {
    icon: MessageSquare,
    title: 'In-App Communication Only',
    description: 'Never share personal contact details, home address, or financial information. All messaging stays in the app.',
  },
  {
    icon: UserCheck,
    title: 'Report Anything Uncomfortable',
    description: 'A report button is available on every screen. If anything ever feels wrong, use it — no questions asked.',
  },
];

export function SafetyConsent({ age, role, onAccept, onBack }: SafetyConsentProps) {
  const isMinor = age < 18;
  const [checkedSafety, setCheckedSafety] = useState(false);
  const [checkedParent, setCheckedParent] = useState(false);

  const canContinue = checkedSafety && (!isMinor || checkedParent);

  return (
    <div className="min-h-screen flex flex-col p-6 bg-white">
      <button
        onClick={onBack}
        className="p-2 -ml-2 rounded-xl hover:bg-iron-100 transition-colors w-fit"
      >
        <ArrowLeft className="w-5 h-5 text-iron-700" />
      </button>

      <div className="mt-8 mb-6">
        <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center mb-4">
          <Shield className="w-6 h-6 text-brand-600" />
        </div>
        <h1 className="text-2xl font-bold text-iron-900 mb-2">
          Safety &amp; Consent
        </h1>
        <p className="text-iron-500">
          {isMinor
            ? 'Before we continue, please review these safety commitments and confirm parental consent.'
            : 'Please review and acknowledge our safety commitments.'}
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {safetyPoints.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex gap-3 p-4 bg-iron-50 rounded-xl">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
              <Icon className="w-4 h-4 text-brand-500" />
            </div>
            <div>
              <h3 className="font-semibold text-iron-900 text-sm mb-0.5">{title}</h3>
              <p className="text-xs text-iron-600 leading-relaxed">{description}</p>
            </div>
          </div>
        ))}
      </div>

      {isMinor && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 mb-1">Parental Consent Required</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              Because you are under 18, a parent or guardian must be aware of and consent to your
              participation in Iron Sharpens Iron. By continuing, you confirm that a parent or
              guardian has reviewed this program and given their permission.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4 mb-8">
        <label className="flex items-start gap-3 cursor-pointer">
          <button
            onClick={() => setCheckedSafety(!checkedSafety)}
            className={cn(
              'w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors',
              checkedSafety ? 'bg-brand-500 border-brand-500' : 'border-iron-300 hover:border-iron-400'
            )}
          >
            {checkedSafety && <Check className="w-4 h-4 text-white" />}
          </button>
          <span className="text-sm text-iron-700">
            I have read and understand the safety guidelines. I agree to keep all communication
            within the app and to report any concerns immediately.
            {role === 'mentor' && ' I understand my responsibility to maintain appropriate boundaries with mentees.'}
          </span>
        </label>

        {isMinor && (
          <label className="flex items-start gap-3 cursor-pointer">
            <button
              onClick={() => setCheckedParent(!checkedParent)}
              className={cn(
                'w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors',
                checkedParent ? 'bg-brand-500 border-brand-500' : 'border-iron-300 hover:border-iron-400'
              )}
            >
              {checkedParent && <Check className="w-4 h-4 text-white" />}
            </button>
            <span className="text-sm text-iron-700">
              A parent or guardian is aware of my participation and has given their consent for
              me to use the Iron Sharpens Iron platform.
            </span>
          </label>
        )}
      </div>

      <div className="mt-auto">
        <Button
          onClick={onAccept}
          size="lg"
          className="w-full"
          disabled={!canContinue}
        >
          I Understand &amp; Agree
        </Button>
      </div>
    </div>
  );
}
