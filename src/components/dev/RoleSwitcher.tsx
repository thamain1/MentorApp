import { useState } from 'react';
import { UserCog, X, Shield, Users, User, Loader2 } from 'lucide-react';
import { useUser } from '../../context';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';
import { cn } from '../../lib/utils';

const roleConfig: Record<UserRole, { icon: typeof User; color: string; bgColor: string }> = {
  admin: { icon: Shield, color: 'text-teal-600', bgColor: 'bg-teal-100' },
  mentor: { icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  mentee: { icon: User, color: 'text-brand-600', bgColor: 'bg-brand-100' },
};

export function RoleSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { role, switching, switchRole, personaCredentials } = useUser();
  const { profile } = useAuth();

  const currentConfig = roleConfig[role];

  const handleRoleSelect = async (newRole: UserRole) => {
    if (newRole === role) {
      setIsOpen(false);
      return;
    }
    setIsOpen(false);
    await switchRole(newRole);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all',
          'border-2 border-white',
          switching ? 'bg-iron-200' : currentConfig.bgColor
        )}
        aria-label="Switch test persona"
        disabled={switching}
      >
        {switching
          ? <Loader2 className="w-6 h-6 text-iron-500 animate-spin" />
          : <UserCog className={cn('w-6 h-6', currentConfig.color)} />
        }
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="relative bg-white rounded-t-2xl w-full max-w-md p-6 pb-8 animate-in slide-in-from-bottom duration-300">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-iron-400 hover:text-iron-600"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6">
              <h2 className="text-lg font-bold text-iron-900">Switch Persona</h2>
              <p className="text-sm text-iron-500">
                Signed in as: <span className="font-medium">{profile ? `${profile.first_name} ${profile.last_name}` : '...'}</span>
              </p>
            </div>
            <div className="space-y-3">
              {(Object.keys(roleConfig) as UserRole[]).map((roleOption) => {
                const config = roleConfig[roleOption];
                const Icon = config.icon;
                const isSelected = role === roleOption;
                const creds = personaCredentials[roleOption];

                return (
                  <button
                    key={roleOption}
                    onClick={() => handleRoleSelect(roleOption)}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all',
                      isSelected
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-iron-100 hover:border-iron-200 bg-white'
                    )}
                  >
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', config.bgColor)}>
                      <Icon className={cn('w-6 h-6', config.color)} />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-iron-900">{creds.name}</h3>
                      <p className="text-sm text-iron-500">{creds.description} · {roleOption}</p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-6 text-xs text-iron-400 text-center">Development persona switcher</p>
          </div>
        </div>
      )}
    </>
  );
}
