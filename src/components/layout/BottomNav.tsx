import { Link, useLocation } from 'react-router-dom';
import { Home, Users, MessageCircle, BookOpen, User } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/community', icon: Users, label: 'Community' },
  { path: '/messages', icon: MessageCircle, label: 'Messages' },
  { path: '/training', icon: BookOpen, label: 'Training' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-iron-100 safe-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around py-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname.startsWith(path);
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors',
                isActive ? 'text-flame-500' : 'text-iron-400 hover:text-iron-600'
              )}
            >
              <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
