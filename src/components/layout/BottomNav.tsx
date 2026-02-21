import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Plus, Users, User } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/community', icon: Users, label: 'Community' },
  { path: null, icon: Plus, label: 'Create', isCreate: true },
  { path: '/mentors', icon: Search, label: 'Mentors' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleCreateClick = () => {
    // Navigate to community with compose modal open
    navigate('/community', { state: { openCompose: true } });
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-iron-100 safe-bottom z-50">
      <div className="max-w-md mx-auto flex items-center justify-around py-2">
        {navItems.map(({ path, icon: Icon, label, isCreate }) => {
          if (isCreate) {
            return (
              <button
                key="create"
                onClick={handleCreateClick}
                className="flex flex-col items-center gap-0.5 px-3 py-1"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-coral-500 rounded-full flex items-center justify-center shadow-lg shadow-brand-500/30 -mt-5">
                  <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-medium text-iron-500">{label}</span>
              </button>
            );
          }

          const isActive = location.pathname.startsWith(path!);
          return (
            <Link
              key={path}
              to={path!}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 transition-colors',
                isActive ? 'text-brand-500' : 'text-iron-400 hover:text-iron-600'
              )}
            >
              <Icon
                className="w-6 h-6"
                strokeWidth={isActive ? 2.5 : 1.5}
                fill={isActive ? 'currentColor' : 'none'}
              />
              <span className={cn(
                "text-[10px] font-medium",
                isActive && "font-semibold"
              )}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
