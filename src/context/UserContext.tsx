import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { UserRole } from '../types';
import { testUsers, type TestUser } from '../data/mockData';

const STORAGE_KEY = 'isi-test-role';

interface UserContextType {
  currentUser: TestUser;
  role: UserRole;
  switchRole: (role: UserRole) => void;
}

const UserContext = createContext<UserContextType | null>(null);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [role, setRole] = useState<UserRole>(() => {
    // Load from localStorage on init
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && (stored === 'admin' || stored === 'mentor' || stored === 'mentee')) {
        return stored as UserRole;
      }
    }
    return 'mentee';
  });

  const currentUser = testUsers[role];

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    localStorage.setItem(STORAGE_KEY, newRole);
  };

  // Sync to localStorage when role changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, role);
  }, [role]);

  return (
    <UserContext.Provider value={{ currentUser, role, switchRole }}>
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
