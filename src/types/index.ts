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
    specialties: string[];
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

// Interest group structure for grouped display
export interface InterestGroup {
  label: string;
  interests: string[];
}

// Interests organized by category group
export const INTEREST_GROUPS: InterestGroup[] = [
  {
    label: 'Sports & Fitness',
    interests: ['Sports', 'Fitness', 'Martial Arts', 'Outdoor Adventures', 'Golf'],
  },
  {
    label: 'Arts & Creativity',
    interests: ['Music', 'Art & Design', 'Photography', 'Writing', 'Podcasting & Media'],
  },
  {
    label: 'Tech & Learning',
    interests: ['Technology', 'Coding & Software', 'Science', 'Reading', 'Gaming'],
  },
  {
    label: 'Lifestyle',
    interests: ['Cooking', 'Travel', 'Movies & TV', 'Fashion & Style', 'Cars & Mechanics'],
  },
  {
    label: 'Faith & Community',
    interests: ['Faith & Spirituality', 'Volunteering', 'Community Service', 'Social Justice', 'Mentorship'],
  },
  {
    label: 'Business & Finance',
    interests: ['Entrepreneurship', 'Investing', 'Real Estate', 'Business', 'Public Speaking'],
  },
];

// Flat list of all interests (derived from groups)
export const INTEREST_OPTIONS = INTEREST_GROUPS.flatMap((g) => g.interests);

// Focus area group structure
export interface FocusAreaGroup {
  label: string;
  areas: string[];
}

// Focus areas organized by category group
export const FOCUS_AREA_GROUPS: FocusAreaGroup[] = [
  {
    label: 'Education & Career',
    areas: ['Academic Success', 'Career Development', 'College Readiness', 'Networking'],
  },
  {
    label: 'Personal Development',
    areas: ['Personal Growth', 'Confidence Building', 'Emotional Intelligence', 'Time Management'],
  },
  {
    label: 'Leadership & Communication',
    areas: ['Leadership Skills', 'Communication', 'Public Speaking', 'Conflict Resolution'],
  },
  {
    label: 'Finance & Life Skills',
    areas: ['Financial Literacy', 'Life Skills', 'Entrepreneurship', 'Real Estate & Investing'],
  },
  {
    label: 'Health & Relationships',
    areas: ['Health & Wellness', 'Relationships', 'Fatherhood & Family', 'Spiritual Growth'],
  },
  {
    label: 'Community',
    areas: ['Community Impact', 'Mentorship', 'Social Awareness'],
  },
];

// Flat list of all focus areas (derived from groups)
export const GOAL_CATEGORIES = FOCUS_AREA_GROUPS.flatMap((g) => g.areas);

// Mentor specialties - what a mentor can offer (maps closely to focus areas but is mentor-specific)
export const MENTOR_SPECIALTIES = [
  'Academic Tutoring',
  'Career Coaching',
  'College Prep',
  'Communication Skills',
  'Community Leadership',
  'Confidence Building',
  'Conflict Resolution',
  'Emotional Intelligence',
  'Entrepreneurship',
  'Faith & Discipleship',
  'Financial Literacy',
  'Fitness & Health',
  'Leadership Development',
  'Life Skills',
  'Mental Health Awareness',
  'Networking & Mentorship',
  'Personal Branding',
  'Public Speaking',
  'Relationship Coaching',
  'Sports Mentorship',
  'Tech & Coding',
  'Trades & Vocational',
  'Workforce Readiness',
] as const;

// Color map for specialties used in the UI
export const SPECIALTY_COLORS: Record<string, { bg: string; text: string }> = {
  'Academic Tutoring': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'Career Coaching': { bg: 'bg-teal-100', text: 'text-teal-700' },
  'College Prep': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'Communication Skills': { bg: 'bg-sky-100', text: 'text-sky-700' },
  'Community Leadership': { bg: 'bg-green-100', text: 'text-green-700' },
  'Confidence Building': { bg: 'bg-rose-100', text: 'text-rose-700' },
  'Conflict Resolution': { bg: 'bg-orange-100', text: 'text-orange-700' },
  'Emotional Intelligence': { bg: 'bg-pink-100', text: 'text-pink-700' },
  'Entrepreneurship': { bg: 'bg-rose-100', text: 'text-rose-700' },
  'Faith & Discipleship': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  'Financial Literacy': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'Fitness & Health': { bg: 'bg-orange-100', text: 'text-orange-700' },
  'Leadership Development': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'Life Skills': { bg: 'bg-green-100', text: 'text-green-700' },
  'Mental Health Awareness': { bg: 'bg-pink-100', text: 'text-pink-700' },
  'Networking & Mentorship': { bg: 'bg-teal-100', text: 'text-teal-700' },
  'Personal Branding': { bg: 'bg-rose-100', text: 'text-rose-700' },
  'Public Speaking': { bg: 'bg-sky-100', text: 'text-sky-700' },
  'Relationship Coaching': { bg: 'bg-pink-100', text: 'text-pink-700' },
  'Sports Mentorship': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'Tech & Coding': { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  'Trades & Vocational': { bg: 'bg-stone-100', text: 'text-stone-700' },
  'Workforce Readiness': { bg: 'bg-teal-100', text: 'text-teal-700' },
  'default': { bg: 'bg-iron-100', text: 'text-iron-600' },
};
