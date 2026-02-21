import { AppShell } from '../components/layout';
import { Dashboard } from '../components/home';

export function HomePage() {
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}
