import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { AppShell } from '../layout';
import { Header } from '../layout';
import { Avatar } from '../ui';
import { formatRelativeTime } from '../../lib/utils';
import { mockConversations } from '../../data/mockData';

export function MessagesList() {
  const navigate = useNavigate();

  if (mockConversations.length === 0) {
    return (
      <AppShell>
        <Header title="Messages" showNotifications />
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
          <div className="w-16 h-16 bg-iron-100 rounded-2xl flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-iron-400" />
          </div>
          <h2 className="text-lg font-semibold text-iron-900 mb-2">No messages yet</h2>
          <p className="text-iron-500 max-w-xs">
            Once you're matched with a mentor or mentee, your conversations will appear here.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Header title="Messages" showNotifications />
      <div className="p-4">
        <div className="space-y-2">
          {mockConversations.map((conversation) => {
            const participantName = `${conversation.participant.first_name} ${conversation.participant.last_name}`;

            return (
              <button
                key={conversation.id}
                onClick={() => navigate(`/messages/${conversation.matchId}`)}
                className="w-full flex items-center gap-3 p-3 bg-white rounded-xl border border-iron-100 hover:bg-iron-50 transition-colors text-left"
              >
                <div className="relative">
                  <Avatar
                    src={conversation.participant.avatar_url}
                    name={participantName}
                    size="lg"
                  />
                  {conversation.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-flame-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-semibold text-iron-900 ${conversation.unreadCount > 0 ? 'text-iron-900' : 'text-iron-700'}`}>
                      {participantName}
                    </h3>
                    <span className="text-xs text-iron-400">
                      {formatRelativeTime(conversation.lastMessageAt)}
                    </span>
                  </div>
                  <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'text-iron-700 font-medium' : 'text-iron-500'}`}>
                    {conversation.lastMessage}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
