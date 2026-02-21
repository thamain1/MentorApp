import { ArrowLeft, Bell, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showNotifications?: boolean;
  showMenu?: boolean;
  onMenuClick?: () => void;
  className?: string;
  transparent?: boolean;
}

export function Header({
  title,
  showBack = false,
  showNotifications = false,
  showMenu = false,
  onMenuClick,
  className,
  transparent = false,
}: HeaderProps) {
  const navigate = useNavigate();

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
        {title && <h1 className="text-lg font-semibold text-iron-900">{title}</h1>}
      </div>

      <div className="flex items-center gap-2">
        {showNotifications && (
          <button
            onClick={() => navigate('/notifications')}
            className="p-2 rounded-xl hover:bg-iron-100 transition-colors relative"
          >
            <Bell className="w-5 h-5 text-iron-700" />
            {/* Notification dot */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-flame-500 rounded-full" />
          </button>
        )}
        {showMenu && (
          <button
            onClick={onMenuClick}
            className="p-2 rounded-xl hover:bg-iron-100 transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-iron-700" />
          </button>
        )}
      </div>
    </header>
  );
}
