import { ArrowLeft, Bell, Search, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Avatar } from '../ui';
import { mockCurrentUser } from '../../data/mockData';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showNotifications?: boolean;
  showMenu?: boolean;
  showSearch?: boolean;
  showProfile?: boolean;
  showLogo?: boolean;
  notificationCount?: number;
  onMenuClick?: () => void;
  className?: string;
  transparent?: boolean;
}

export function Header({
  title,
  showBack = false,
  showNotifications = false,
  showMenu = false,
  showSearch = false,
  showProfile = false,
  showLogo = false,
  notificationCount = 3,
  onMenuClick,
  className,
  transparent = false,
}: HeaderProps) {
  const navigate = useNavigate();
  const fullName = `${mockCurrentUser.first_name} ${mockCurrentUser.last_name}`;

  return (
    <header
      className={cn(
        'sticky top-0 z-40 px-4 py-3 flex items-center justify-between safe-top',
        transparent ? 'bg-transparent' : 'bg-white border-b border-iron-100',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-xl hover:bg-iron-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-iron-700" />
          </button>
        )}
        {showLogo && (
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-iron-900">IronSharpens</span>
          </div>
        )}
        {title && !showLogo && <h1 className="text-lg font-semibold text-iron-900">{title}</h1>}
      </div>

      <div className="flex items-center gap-1">
        {showSearch && (
          <button
            onClick={() => {}}
            className="p-2 rounded-xl hover:bg-iron-100 transition-colors"
          >
            <Search className="w-5 h-5 text-iron-600" />
          </button>
        )}
        {showNotifications && (
          <button
            onClick={() => navigate('/notifications')}
            className="p-2 rounded-xl hover:bg-iron-100 transition-colors relative"
          >
            <Bell className="w-5 h-5 text-iron-600" />
            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">{notificationCount > 9 ? '9+' : notificationCount}</span>
              </span>
            )}
          </button>
        )}
        {showMenu && (
          <button
            onClick={onMenuClick}
            className="p-2 rounded-xl hover:bg-iron-100 transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-iron-600" />
          </button>
        )}
        {showProfile && (
          <button
            onClick={() => navigate('/profile')}
            className="ml-1"
          >
            <Avatar
              src={mockCurrentUser.avatar_url}
              name={fullName}
              size="sm"
            />
          </button>
        )}
      </div>
    </header>
  );
}
