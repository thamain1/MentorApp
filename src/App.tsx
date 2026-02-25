import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {
  OnboardingPage,
  HomePage,
  MessagesPage,
  ChatPage,
  SessionsPage,
  SessionsListPage,
  GoalsPage,
  TrainingPage,
  TrackDetailPage,
  ModuleDetailPage,
  ToolkitPage,
  CommunityPage,
  ProfilePage,
  NotificationsPage,
  FindMentorPage,
  FindMenteesPage,
  MentorProfilePage,
  MatchRequestsPage,
  GroupsPage,
  GroupDetailPage,
  AdminPage,
} from './pages';
import { UserProvider } from './context';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RoleSwitcher } from './components/dev';

function AppRoutes() {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-iron-950">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isAuthenticated = !!session;
  const hasProfile = !!profile;

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated && hasProfile
            ? <Navigate to="/home" replace />
            : <OnboardingPage />
        }
      />

      <Route path="/home" element={isAuthenticated && hasProfile ? <HomePage /> : <Navigate to="/" replace />} />
      <Route path="/community" element={isAuthenticated && hasProfile ? <CommunityPage /> : <Navigate to="/" replace />} />
      <Route path="/messages" element={isAuthenticated && hasProfile ? <MessagesPage /> : <Navigate to="/" replace />} />
      <Route path="/messages/:matchId" element={isAuthenticated && hasProfile ? <ChatPage /> : <Navigate to="/" replace />} />
      <Route path="/training" element={isAuthenticated && hasProfile ? <TrainingPage /> : <Navigate to="/" replace />} />
      <Route path="/training/:trackId" element={isAuthenticated && hasProfile ? <TrackDetailPage /> : <Navigate to="/" replace />} />
      <Route path="/training/:trackId/:moduleId" element={isAuthenticated && hasProfile ? <ModuleDetailPage /> : <Navigate to="/" replace />} />
      <Route path="/toolkit" element={isAuthenticated && hasProfile ? <ToolkitPage /> : <Navigate to="/" replace />} />
      <Route path="/profile" element={isAuthenticated && hasProfile ? <ProfilePage /> : <Navigate to="/" replace />} />
      <Route path="/goals" element={isAuthenticated && hasProfile ? <GoalsPage /> : <Navigate to="/" replace />} />
      <Route path="/sessions" element={isAuthenticated && hasProfile ? <SessionsListPage /> : <Navigate to="/" replace />} />
      <Route path="/sessions/view/:sessionId" element={isAuthenticated && hasProfile ? <SessionsPage /> : <Navigate to="/" replace />} />
      <Route path="/notifications" element={isAuthenticated && hasProfile ? <NotificationsPage /> : <Navigate to="/" replace />} />
      <Route path="/mentors" element={isAuthenticated && hasProfile ? <FindMentorPage /> : <Navigate to="/" replace />} />
      <Route path="/mentees" element={isAuthenticated && hasProfile ? <FindMenteesPage /> : <Navigate to="/" replace />} />
      <Route path="/mentors/:mentorId" element={isAuthenticated && hasProfile ? <MentorProfilePage /> : <Navigate to="/" replace />} />
      <Route path="/match-requests" element={isAuthenticated && hasProfile ? <MatchRequestsPage /> : <Navigate to="/" replace />} />
      <Route path="/groups" element={isAuthenticated && hasProfile ? <GroupsPage /> : <Navigate to="/" replace />} />
      <Route path="/groups/:groupId" element={isAuthenticated && hasProfile ? <GroupDetailPage /> : <Navigate to="/" replace />} />
      <Route path="/admin" element={isAuthenticated && hasProfile ? <AdminPage /> : <Navigate to="/" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <BrowserRouter>
          <AppRoutes />
          <RoleSwitcher />
        </BrowserRouter>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
