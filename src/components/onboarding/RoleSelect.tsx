import { Users, GraduationCap, ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';

interface RoleSelectProps {
  onSelect: (role: 'mentor' | 'mentee') => void;
  onBack: () => void;
}

export function RoleSelect({ onSelect, onBack }: RoleSelectProps) {
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
      <div className="mt-8 mb-12">
        <h1 className="text-2xl font-bold text-iron-900 mb-2">
          How do you want to start?
        </h1>
        <p className="text-iron-500">
          Choose your path. You can always grow into new roles later.
        </p>
      </div>

      {/* Role cards */}
      <div className="space-y-4 flex-1">
        <RoleCard
          icon={GraduationCap}
          title="I'm looking for a mentor"
          description="Get matched with an experienced mentor who can guide you on your journey."
          ageRange="Ages 12-19"
          onClick={() => onSelect('mentee')}
        />
        <RoleCard
          icon={Users}
          title="I want to be a mentor"
          description="Share your experience and help shape the next generation of young men."
          ageRange="Ages 19+"
          onClick={() => onSelect('mentor')}
        />
      </div>

      {/* Footer note */}
      <p className="text-center text-iron-400 text-sm mt-8">
        Mentees can become mentors as they grow. It's part of the journey.
      </p>
    </div>
  );
}

interface RoleCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  ageRange: string;
  onClick: () => void;
}

function RoleCard({ icon: Icon, title, description, ageRange, onClick }: RoleCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-6 rounded-2xl border-2 border-iron-200 text-left',
        'hover:border-brand-500 hover:bg-brand-50 transition-all',
        'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2'
      )}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon className="w-6 h-6 text-brand-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-iron-900 mb-1">{title}</h3>
          <p className="text-sm text-iron-500 mb-2">{description}</p>
          <span className="inline-block text-xs font-medium text-brand-600 bg-brand-100 px-2 py-0.5 rounded-full">
            {ageRange}
          </span>
        </div>
      </div>
    </button>
  );
}
