// Re-export database types
export * from './database.types';

// Import types for use in this file
import type { User, Profile, Match, Session } from './database.types';

// App-specific types
export interface OnboardingState {
  step: 'welcome' | 'role' | 'age' | 'profile' | 'guidelines' | 'complete';
  role?: 'mentor' | 'mentee';
  age?: number;
  profile?: {
    firstName: string;
    lastName: string;
    bio: string;
    interests: string[];
    goals: string[];
  };
  guidelinesAccepted?: boolean;
}

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

export interface MatchWithProfiles extends Match {
  mentor_profile: Profile;
  mentee_profile: Profile;
}

export interface SessionWithMatch extends Session {
  match: MatchWithProfiles;
}

// Interest options for profile setup
export const INTEREST_OPTIONS = [
  'Sports',
  'Music',
  'Gaming',
  'Art & Design',
  'Technology',
  'Reading',
  'Fitness',
  'Cooking',
  'Travel',
  'Photography',
  'Writing',
  'Movies & TV',
  'Volunteering',
  'Entrepreneurship',
  'Science',
  'Faith & Spirituality',
] as const;

// Goal categories
export const GOAL_CATEGORIES = [
  'Academic Success',
  'Career Development',
  'Personal Growth',
  'Leadership Skills',
  'Communication',
  'Confidence Building',
  'Time Management',
  'Financial Literacy',
  'Health & Wellness',
  'Relationships',
] as const;
