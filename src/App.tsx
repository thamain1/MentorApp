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
  MentorProfilePage,
  MatchRequestsPage,
  GroupsPage,
  GroupDetailPage,
  AdminPage,
} from './pages';

function App() {
  // TODO: Check auth state and redirect accordingly
  const isAuthenticated = false;
  const hasCompletedOnboarding = false;

  return (
    <BrowserRouter>
      <Routes>
        {/* Onboarding */}
        <Route path="/" element={
          isAuthenticated && hasCompletedOnboarding
            ? <Navigate to="/home" replace />
            : <OnboardingPage />
        } />

        {/* Main App Routes */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/messages/:matchId" element={<ChatPage />} />
        <Route path="/training" element={<TrainingPage />} />
        <Route path="/training/:trackId" element={<TrackDetailPage />} />
        <Route path="/training/:trackId/:moduleId" element={<ModuleDetailPage />} />
        <Route path="/toolkit" element={<ToolkitPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/sessions" element={<SessionsListPage />} />
        <Route path="/sessions/:matchId" element={<SessionsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/mentors" element={<FindMentorPage />} />
        <Route path="/mentors/:mentorId" element={<MentorProfilePage />} />
        <Route path="/match-requests" element={<MatchRequestsPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/groups/:groupId" element={<GroupDetailPage />} />
        <Route path="/admin" element={<AdminPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
