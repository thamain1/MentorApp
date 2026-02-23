import { createContext, useContext, useState, type ReactNode } from 'react';
import type { UserRole } from '../types';
import { supabase } from '../lib/supabase';

const PERSONA_CREDENTIALS: Record<UserRole, { email: string; password: string; name: string; description: string }> = {
  admin: {
    email: 'dan@ironsharpensirontest.dev',
    password: 'IronTest2026!',
    name: 'Dan Mitchell',
    description: 'Program Director',
  },
  mentor: {
    email: 'david@ironsharpensirontest.dev',
    password: 'IronTest2026!',
    name: 'David Williams',
    description: 'Software Engineer',
  },
  mentee: {
    email: 'marcus@ironsharpensirontest.dev',
    password: 'IronTest2026!',
    name: 'Marcus Johnson',
    description: 'High School Junior',
  },
};

interface UserContextType {
  role: UserRole;
  switching: boolean;
  switchRole: (role: UserRole) => Promise<void>;
  personaCredentials: typeof PERSONA_CREDENTIALS;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('mentee');
  const [switching, setSwitching] = useState(false);

  const switchRole = async (newRole: UserRole) => {
    if (switching) return;
    setSwitching(true);
    try {
      const creds = PERSONA_CREDENTIALS[newRole];
      await supabase.auth.signInWithPassword({
        email: creds.email,
        password: creds.password,
      });
      setRole(newRole);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <UserContext.Provider value={{ role, switching, switchRole, personaCredentials: PERSONA_CREDENTIALS }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
