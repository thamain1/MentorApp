import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Calendar,
  Target,
  Heart,
  Bell,
  CheckCheck,
} from 'lucide-react';
import { AppShell, Header } from '../layout';
import { Card } from '../ui';
import { formatRelativeTime } from '../../lib/utils';
import { mockNotifications } from '../../data/mockData';

const notificationIcons: Record<string, typeof Bell> = {
  message: MessageSquare,
  session: Calendar,
  goal: Target,
  community: Heart,
  system: Bell,
};

const notificationColors: Record<string, string> = {
  message: 'bg-blue-100 text-blue-600',
  session: 'bg-green-100 text-green-600',
  goal: 'bg-violet-100 text-violet-600',
  community: 'bg-pink-100 text-pink-600',
  system: 'bg-iron-100 text-iron-600',
};

export function NotificationsList() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter(n => !n.read_at).length;

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({
      ...n,
      read_at: n.read_at || new Date().toISOString(),
    })));
  };

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    // Mark as read
    setNotifications(notifications.map(n =>
      n.id === notification.id
        ? { ...n, read_at: n.read_at || new Date().toISOString() }
        : n
    ));

    // Navigate if action URL exists
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  return (
    <AppShell>
      <Header title="Notifications" showBack />

      <div className="p-4">
        {/* Mark all read button */}
        {unreadCount > 0 && (
          <div className="flex justify-end mb-4">
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 text-sm text-violet-600 font-medium"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          </div>
        )}

        {/* Notifications list */}
        {notifications.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-iron-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-iron-400" />
            </div>
            <h2 className="text-lg font-semibold text-iron-900 mb-2">
              No notifications
            </h2>
            <p className="text-iron-500 max-w-xs mx-auto">
              You're all caught up! Check back later for updates.
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => {
              const Icon = notificationIcons[notification.type] || Bell;
              const colorClass = notificationColors[notification.type] || notificationColors.system;
              const isUnread = !notification.read_at;

              return (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left p-4 rounded-xl border transition-colors ${
                    isUnread
                      ? 'bg-violet-50/50 border-violet-100'
                      : 'bg-white border-iron-100 hover:bg-iron-50'
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`font-medium ${isUnread ? 'text-iron-900' : 'text-iron-700'}`}>
                          {notification.title}
                        </h4>
                        {isUnread && (
                          <span className="w-2 h-2 bg-violet-500 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                      {notification.body && (
                        <p className="text-sm text-iron-500 mt-0.5 line-clamp-2">
                          {notification.body}
                        </p>
                      )}
                      <p className="text-xs text-iron-400 mt-1">
                        {formatRelativeTime(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
