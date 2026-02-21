import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OnboardingPage, HomePage, PlaceholderPage } from './pages';

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
        <Route path="/community" element={<PlaceholderPage title="Community" />} />
        <Route path="/messages" element={<PlaceholderPage title="Messages" />} />
        <Route path="/messages/:matchId" element={<PlaceholderPage title="Chat" />} />
        <Route path="/training" element={<PlaceholderPage title="Training" />} />
        <Route path="/profile" element={<PlaceholderPage title="Profile" />} />
        <Route path="/goals" element={<PlaceholderPage title="Goals" />} />
        <Route path="/sessions/:matchId" element={<PlaceholderPage title="Sessions" />} />
        <Route path="/notifications" element={<PlaceholderPage title="Notifications" />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
