import { useState, useEffect, useCallback } from 'react';
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
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  action_url: string | null;
  read_at: string | null;
  created_at: string;
}

const notificationIcons: Record<string, typeof Bell> = {
  message: MessageSquare,
  session: Calendar,
  goal: Target,
  community: Heart,
  system: Bell,
};

const notificationColors: Record<string, string> = {
  message: 'bg-teal-100 text-teal-600',
  session: 'bg-green-100 text-green-600',
  goal: 'bg-brand-100 text-brand-600',
  community: 'bg-coral-100 text-coral-600',
  system: 'bg-iron-100 text-iron-600',
};

export function NotificationsList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error && data) {
      setNotifications(data as Notification[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.read_at).length;

  const handleMarkAllRead = async () => {
    if (!user) return;
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: now })
      .eq('user_id', user.id)
      .is('read_at', null);
    if (!error) {
      setNotifications(notifications.map(n => ({
        ...n,
        read_at: n.read_at || now,
      })));
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read_at) {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: now })
        .eq('id', notification.id);
      if (!error) {
        setNotifications(notifications.map(n =>
          n.id === notification.id
            ? { ...n, read_at: now }
            : n
        ));
      }
    }

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
              className="flex items-center gap-1.5 text-sm text-brand-500 font-medium"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-full p-4 rounded-xl border border-iron-100 bg-white animate-pulse">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-iron-200 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-iron-200 rounded w-3/4" />
                    <div className="h-3 bg-iron-100 rounded w-full" />
                    <div className="h-3 bg-iron-100 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
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
                      ? 'bg-brand-50/50 border-brand-100'
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
                          <span className="w-2 h-2 bg-coral-500 rounded-full flex-shrink-0 mt-2" />
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
