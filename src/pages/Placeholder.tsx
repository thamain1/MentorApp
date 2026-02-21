import { AppShell, Header } from '../components/layout';
import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <AppShell>
      <Header title={title} showBack />
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
        <div className="w-16 h-16 bg-iron-100 rounded-2xl flex items-center justify-center mb-4">
          <Construction className="w-8 h-8 text-iron-400" />
        </div>
        <h2 className="text-lg font-semibold text-iron-900 mb-2">Coming Soon</h2>
        <p className="text-iron-500 max-w-xs">
          We're building something great here. Check back soon!
        </p>
      </div>
    </AppShell>
  );
}
