import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, ChevronRight, Inbox } from 'lucide-react';
import { AppShell, Header } from '../layout';
import { Card, Avatar, Button } from '../ui';
import { mockMatchRequests, type MatchRequest } from '../../data/mockData';
import { formatRelativeTime } from '../../lib/utils';

export function MatchRequests() {
  const navigate = useNavigate();
  const requests = mockMatchRequests;

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const respondedRequests = requests.filter((r) => r.status !== 'pending');

  return (
    <AppShell>
      <Header title="Match Requests" showBack />

      <div className="p-4 space-y-6">
        {/* Pending Requests */}
        <section>
          <h3 className="text-sm font-medium text-iron-500 uppercase tracking-wide mb-3">
            Pending Requests ({pendingRequests.length})
          </h3>

          {pendingRequests.length === 0 ? (
            <Card className="p-6 text-center">
              <Inbox className="w-10 h-10 text-iron-300 mx-auto mb-2" />
              <p className="text-iron-600 font-medium mb-1">No pending requests</p>
              <p className="text-sm text-iron-500 mb-4">
                Find a mentor to send your first request
              </p>
              <Button variant="outline" onClick={() => navigate('/mentors')}>
                Browse Mentors
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onClick={() => navigate(`/mentors/${request.mentorId}`)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Past Requests */}
        {respondedRequests.length > 0 && (
          <section>
            <h3 className="text-sm font-medium text-iron-500 uppercase tracking-wide mb-3">
              Past Requests
            </h3>
            <div className="space-y-3">
              {respondedRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onClick={() => navigate(`/mentors/${request.mentorId}`)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}

interface RequestCardProps {
  request: MatchRequest;
  onClick: () => void;
}

function RequestCard({ request, onClick }: RequestCardProps) {
  const mentorName = `${request.mentor.first_name} ${request.mentor.last_name}`;

  const getStatusIcon = () => {
    switch (request.status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'declined':
        return <XCircle className="w-5 h-5 text-iron-400" />;
    }
  };

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-iron-100 rounded-xl p-4 hover:border-flame-200 transition-colors"
    >
      <div className="flex items-center gap-3">
        <Avatar name={mentorName} src={request.mentor.avatar_url} size="md" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="font-semibold text-iron-900 truncate">{mentorName}</h4>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {getStatusIcon()}
            <span className="text-iron-500 capitalize">{request.status}</span>
            <span className="text-iron-300">•</span>
            <span className="text-iron-400">{formatRelativeTime(request.createdAt)}</span>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-iron-400" />
      </div>

      {request.message && (
        <p className="mt-2 text-sm text-iron-600 line-clamp-2 pl-12">
          "{request.message}"
        </p>
      )}
    </button>
  );
}
