// Mock data for UI development
// This data will be replaced with Supabase queries once the backend is connected

import type {
  Profile,
  Message,
  Session,
  Goal,
  TrainingTrack,
  TrainingModule,
  Post,
  Notification,
  UserRole as UserRoleType,
} from '../types';

// Re-export UserRole from types
export type { UserRole } from '../types';

// =====================
// TEST USER PROFILES
// =====================

export interface TestUser extends Profile {
  role: UserRoleType;
}

export const testUsers: Record<UserRoleType, TestUser> = {
  admin: {
    id: 'test-admin-id',
    user_id: 'test-admin-auth-id',
    first_name: 'Dan',
    last_name: 'Mitchell',
    age: 35,
    bio: 'Program Director overseeing mentorship matches and community safety. Dedicated to building meaningful connections.',
    interests: ['Leadership', 'Community', 'Education', 'Faith & Spirituality'],
    goals: ['Program Growth', 'Community Safety', 'Mentor Development'],
    location: 'Chicago, IL',
    avatar_url: null,
    guidelines_accepted_at: '2023-01-01T10:00:00Z',
    created_at: '2023-01-01T10:00:00Z',
    updated_at: '2024-02-01T15:30:00Z',
    role: 'admin',
  },
  mentor: {
    id: 'test-mentor-id',
    user_id: 'test-mentor-auth-id',
    first_name: 'David',
    last_name: 'Williams',
    age: 32,
    bio: 'Software engineer with 10 years of experience. Passionate about helping young men discover their potential in tech and life.',
    interests: ['Technology', 'Fitness', 'Entrepreneurship', 'Faith & Spirituality'],
    goals: ['Leadership Skills', 'Career Development'],
    location: 'Chicago, IL',
    avatar_url: null,
    guidelines_accepted_at: '2023-06-01T10:00:00Z',
    created_at: '2023-06-01T10:00:00Z',
    updated_at: '2024-01-20T12:00:00Z',
    role: 'mentor',
  },
  mentee: {
    id: 'test-mentee-id',
    user_id: 'test-mentee-auth-id',
    first_name: 'Marcus',
    last_name: 'Johnson',
    age: 16,
    bio: 'High school junior interested in technology and music. Looking forward to learning from my mentor!',
    interests: ['Technology', 'Music', 'Gaming', 'Sports'],
    goals: ['Academic Success', 'Career Development', 'Leadership Skills'],
    location: 'Chicago, IL',
    avatar_url: null,
    guidelines_accepted_at: '2024-01-15T10:00:00Z',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-02-01T15:30:00Z',
    role: 'mentee',
  },
};

// Extended types for UI
export interface Conversation {
  id: string;
  matchId: string;
  participant: Profile;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface MessageWithSender extends Message {
  isOwn: boolean;
}

export interface SessionWithMatch extends Session {
  matchName: string;
  matchAvatar?: string;
}

export interface GoalWithProgress extends Goal {
  progress: number; // 0-100
}

export interface TrainingTrackWithModules extends TrainingTrack {
  modules: TrainingModule[];
  completedModules: number;
  totalDuration: number;
}

export interface PostWithAuthor extends Post {
  author: Pick<Profile, 'id' | 'first_name' | 'last_name' | 'avatar_url'>;
  likes: number;
  hasLiked: boolean;
}

// Current user profile (mock logged-in user)
export const mockCurrentUser: Profile = {
  id: 'current-user-id',
  user_id: 'current-user-auth-id',
  first_name: 'Marcus',
  last_name: 'Johnson',
  age: 16,
  bio: 'High school junior interested in technology and music. Looking forward to learning from my mentor!',
  interests: ['Technology', 'Music', 'Gaming', 'Sports'],
  goals: ['Academic Success', 'Career Development', 'Leadership Skills'],
  location: 'Chicago, IL',
  avatar_url: null,
  guidelines_accepted_at: '2024-01-15T10:00:00Z',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-02-01T15:30:00Z',
};

// Mock mentor profile
export const mockMentorProfile: Profile = {
  id: 'mentor-1-id',
  user_id: 'mentor-1-auth-id',
  first_name: 'David',
  last_name: 'Williams',
  age: 32,
  bio: 'Software engineer with 10 years of experience. Passionate about helping young men discover their potential in tech and life.',
  interests: ['Technology', 'Fitness', 'Entrepreneurship', 'Faith & Spirituality'],
  goals: ['Leadership Skills', 'Career Development'],
  location: 'Chicago, IL',
  avatar_url: '/images/mentors/gettyimages-1146909737-612x612.jpg',
  guidelines_accepted_at: '2023-06-01T10:00:00Z',
  created_at: '2023-06-01T10:00:00Z',
  updated_at: '2024-01-20T12:00:00Z',
};

// Additional profiles for community posts
const mockProfiles: Profile[] = [
  mockMentorProfile,
  {
    id: 'mentor-2-id',
    user_id: 'mentor-2-auth-id',
    first_name: 'James',
    last_name: 'Thompson',
    age: 28,
    bio: 'Youth pastor and basketball coach. Love seeing young men grow in character.',
    interests: ['Sports', 'Faith & Spirituality', 'Music'],
    goals: ['Personal Growth', 'Communication'],
    location: 'Chicago, IL',
    avatar_url: null,
    guidelines_accepted_at: '2023-08-15T10:00:00Z',
    created_at: '2023-08-15T10:00:00Z',
    updated_at: '2024-01-10T09:00:00Z',
  },
  {
    id: 'mentee-2-id',
    user_id: 'mentee-2-auth-id',
    first_name: 'Tyler',
    last_name: 'Brown',
    age: 15,
    bio: 'Freshman working on my communication skills.',
    interests: ['Gaming', 'Art & Design', 'Technology'],
    goals: ['Confidence Building', 'Academic Success'],
    location: 'Chicago, IL',
    avatar_url: null,
    guidelines_accepted_at: '2024-01-20T10:00:00Z',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-25T11:00:00Z',
  },
  {
    id: 'mentee-3-id',
    user_id: 'mentee-3-auth-id',
    first_name: 'Jordan',
    last_name: 'Davis',
    age: 17,
    bio: 'Senior preparing for college. Grateful for my mentor!',
    interests: ['Reading', 'Writing', 'Entrepreneurship'],
    goals: ['Career Development', 'Financial Literacy'],
    location: 'Chicago, IL',
    avatar_url: null,
    guidelines_accepted_at: '2023-11-01T10:00:00Z',
    created_at: '2023-11-01T10:00:00Z',
    updated_at: '2024-02-01T14:00:00Z',
  },
];

// Mock conversations for messages list
export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    matchId: 'match-1',
    participant: mockMentorProfile,
    lastMessage: 'Great job on your presentation! Let me know how the feedback session goes.',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    unreadCount: 2,
  },
  {
    id: 'conv-2',
    matchId: 'match-2',
    participant: mockProfiles[1], // James Thompson
    lastMessage: 'See you at the group session on Saturday!',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    unreadCount: 0,
  },
  {
    id: 'conv-3',
    matchId: 'match-3',
    participant: {
      ...mockProfiles[2], // Tyler Brown
      first_name: 'Coach',
      last_name: 'Mike',
      age: 45,
      bio: 'Program coordinator and group facilitator.',
    },
    lastMessage: 'Welcome to the program! Feel free to reach out if you have any questions.',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    unreadCount: 0,
  },
];

// Mock messages for chat
export const mockMessages: Record<string, MessageWithSender[]> = {
  'match-1': [
    {
      id: 'msg-1',
      match_id: 'match-1',
      sender_id: 'mentor-1-auth-id',
      content: 'Hey Marcus! How are you doing this week?',
      read_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      isOwn: false,
    },
    {
      id: 'msg-2',
      match_id: 'match-1',
      sender_id: 'current-user-auth-id',
      content: "I'm doing good! Been working on that school project we talked about.",
      read_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 5).toISOString(),
      isOwn: true,
    },
    {
      id: 'msg-3',
      match_id: 'match-1',
      sender_id: 'mentor-1-auth-id',
      content: "That's great to hear! How's the coding part coming along?",
      read_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 10).toISOString(),
      isOwn: false,
    },
    {
      id: 'msg-4',
      match_id: 'match-1',
      sender_id: 'current-user-auth-id',
      content: "It's challenging but I'm learning a lot. The debugging part is tricky!",
      read_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 15).toISOString(),
      isOwn: true,
    },
    {
      id: 'msg-5',
      match_id: 'match-1',
      sender_id: 'mentor-1-auth-id',
      content: 'Debugging is where the real learning happens! Want to walk through some techniques in our next session?',
      read_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      isOwn: false,
    },
    {
      id: 'msg-6',
      match_id: 'match-1',
      sender_id: 'current-user-auth-id',
      content: 'Yes please! That would be really helpful.',
      read_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 60 * 3).toISOString(),
      isOwn: true,
    },
    {
      id: 'msg-7',
      match_id: 'match-1',
      sender_id: 'mentor-1-auth-id',
      content: "Perfect! I'll prepare some examples. Also, don't forget about your presentation tomorrow!",
      read_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 60 * 5).toISOString(),
      isOwn: false,
    },
    {
      id: 'msg-8',
      match_id: 'match-1',
      sender_id: 'current-user-auth-id',
      content: "Thanks for the reminder! I've been practicing.",
      read_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      isOwn: true,
    },
    {
      id: 'msg-9',
      match_id: 'match-1',
      sender_id: 'current-user-auth-id',
      content: 'The presentation went really well! Got positive feedback from my teacher.',
      read_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      isOwn: true,
    },
    {
      id: 'msg-10',
      match_id: 'match-1',
      sender_id: 'mentor-1-auth-id',
      content: "That's awesome news! I'm proud of you! 🎉",
      read_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      isOwn: false,
    },
    {
      id: 'msg-11',
      match_id: 'match-1',
      sender_id: 'mentor-1-auth-id',
      content: 'Great job on your presentation! Let me know how the feedback session goes.',
      read_at: null,
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      isOwn: false,
    },
  ],
};

// Mock sessions
export const mockSessions: SessionWithMatch[] = [
  {
    id: 'session-upcoming-1',
    match_id: 'match-1',
    scheduled_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days from now
    google_event_id: null,
    status: 'scheduled',
    completed_at: null,
    mentee_notes: null,
    mentor_notes: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    matchName: 'David Williams',
    matchAvatar: undefined,
  },
  {
    id: 'session-past-1',
    match_id: 'match-1',
    scheduled_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 1 week ago
    google_event_id: null,
    status: 'completed',
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7 + 1000 * 60 * 60).toISOString(),
    mentee_notes: 'We talked about my career goals and David shared his journey into tech. Very inspiring!',
    mentor_notes: 'Marcus is making great progress. Discussed setting SMART goals.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    matchName: 'David Williams',
    matchAvatar: undefined,
  },
  {
    id: 'session-past-2',
    match_id: 'match-1',
    scheduled_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(), // 2 weeks ago
    google_event_id: null,
    status: 'completed',
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14 + 1000 * 60 * 60).toISOString(),
    mentee_notes: 'Learned about time management techniques. Going to try the Pomodoro method!',
    mentor_notes: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 17).toISOString(),
    matchName: 'David Williams',
    matchAvatar: undefined,
  },
  {
    id: 'session-past-3',
    match_id: 'match-1',
    scheduled_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21).toISOString(), // 3 weeks ago
    google_event_id: null,
    status: 'completed',
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21 + 1000 * 60 * 60).toISOString(),
    mentee_notes: 'First official session! We set expectations and talked about what I want to achieve.',
    mentor_notes: 'Great first session with Marcus. He has clear goals and is eager to learn.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(),
    matchName: 'David Williams',
    matchAvatar: undefined,
  },
];

// Mock goals
export const mockGoals: GoalWithProgress[] = [
  {
    id: 'goal-1',
    user_id: 'current-user-auth-id',
    match_id: 'match-1',
    title: 'Improve GPA to 3.5',
    description: 'Focus on math and science courses to bring up my overall GPA.',
    target_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString(), // 90 days
    status: 'active',
    completed_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    progress: 65,
  },
  {
    id: 'goal-2',
    user_id: 'current-user-auth-id',
    match_id: 'match-1',
    title: 'Learn Python basics',
    description: 'Complete an online Python course and build a small project.',
    target_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString(), // 60 days
    status: 'active',
    completed_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    progress: 40,
  },
  {
    id: 'goal-3',
    user_id: 'current-user-auth-id',
    match_id: null,
    title: 'Read one book per month',
    description: 'Develop a consistent reading habit with diverse topics.',
    target_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(), // 1 year
    status: 'active',
    completed_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    progress: 25,
  },
  {
    id: 'goal-4',
    user_id: 'current-user-auth-id',
    match_id: 'match-1',
    title: 'Complete first coding project',
    description: 'Build a simple web app to showcase at school.',
    target_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    status: 'completed',
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    progress: 100,
  },
  {
    id: 'goal-5',
    user_id: 'current-user-auth-id',
    match_id: null,
    title: 'Join school debate club',
    description: 'Improve public speaking skills by participating in debates.',
    target_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    status: 'completed',
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
    progress: 100,
  },
];

// Mock training modules
const mentorFoundationsModules: TrainingModule[] = [
  {
    id: 'module-1-1',
    track_id: 'track-1',
    title: 'Introduction to Mentoring',
    content: 'Understanding the mentor-mentee relationship and your role.',
    order: 1,
    duration_mins: 15,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'module-1-2',
    track_id: 'track-1',
    title: 'Building Trust',
    content: 'Techniques for establishing rapport and building a trusting relationship.',
    order: 2,
    duration_mins: 20,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'module-1-3',
    track_id: 'track-1',
    title: 'Active Listening Skills',
    content: 'How to truly hear and understand your mentee.',
    order: 3,
    duration_mins: 25,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'module-1-4',
    track_id: 'track-1',
    title: 'Setting Goals Together',
    content: 'Collaborative goal-setting techniques for mentorship success.',
    order: 4,
    duration_mins: 20,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'module-1-5',
    track_id: 'track-1',
    title: 'Navigating Challenges',
    content: 'How to handle difficult conversations and situations.',
    order: 5,
    duration_mins: 30,
    created_at: '2024-01-01T00:00:00Z',
  },
];

const safetyProtocolsModules: TrainingModule[] = [
  {
    id: 'module-2-1',
    track_id: 'track-2',
    title: 'Understanding Boundaries',
    content: 'Establishing and maintaining appropriate boundaries.',
    order: 1,
    duration_mins: 20,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'module-2-2',
    track_id: 'track-2',
    title: 'Recognizing Warning Signs',
    content: 'Identifying when a mentee may need additional support.',
    order: 2,
    duration_mins: 25,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'module-2-3',
    track_id: 'track-2',
    title: 'Reporting Procedures',
    content: 'When and how to escalate concerns appropriately.',
    order: 3,
    duration_mins: 15,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'module-2-4',
    track_id: 'track-2',
    title: 'Digital Safety',
    content: 'Best practices for online communication.',
    order: 4,
    duration_mins: 20,
    created_at: '2024-01-01T00:00:00Z',
  },
];

// Mock training tracks
export const mockTrainingTracks: TrainingTrackWithModules[] = [
  {
    id: 'track-1',
    title: 'Mentor Foundations',
    description: 'Essential skills and knowledge for effective mentoring. Complete this track to become a certified mentor.',
    order: 1,
    badge_image_url: null,
    created_at: '2024-01-01T00:00:00Z',
    modules: mentorFoundationsModules,
    completedModules: 2,
    totalDuration: mentorFoundationsModules.reduce((sum, m) => sum + m.duration_mins, 0),
  },
  {
    id: 'track-2',
    title: 'Safety Protocols',
    description: 'Required training on safety, boundaries, and reporting. All mentors must complete this track.',
    order: 2,
    badge_image_url: null,
    created_at: '2024-01-01T00:00:00Z',
    modules: safetyProtocolsModules,
    completedModules: 4,
    totalDuration: safetyProtocolsModules.reduce((sum, m) => sum + m.duration_mins, 0),
  },
];

// Mock community posts
export const mockPosts: PostWithAuthor[] = [
  {
    id: 'post-1',
    group_id: null,
    user_id: mockProfiles[3].user_id, // Jordan Davis
    content: 'Just got accepted to my top choice college! None of this would have been possible without my mentor helping me with my applications. Grateful for this program! 🎓',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    author: {
      id: mockProfiles[3].id,
      first_name: mockProfiles[3].first_name,
      last_name: mockProfiles[3].last_name,
      avatar_url: mockProfiles[3].avatar_url,
    },
    likes: 24,
    hasLiked: true,
  },
  {
    id: 'post-2',
    group_id: null,
    user_id: mockMentorProfile.user_id,
    content: 'Reminder: Group session this Saturday at 10 AM. We\'ll be discussing goal-setting strategies. Looking forward to seeing everyone there!',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    author: {
      id: mockMentorProfile.id,
      first_name: mockMentorProfile.first_name,
      last_name: mockMentorProfile.last_name,
      avatar_url: mockMentorProfile.avatar_url,
    },
    likes: 8,
    hasLiked: false,
  },
  {
    id: 'post-3',
    group_id: null,
    user_id: mockProfiles[1].user_id, // James Thompson
    content: 'Proud of all the young men who participated in our community service project last weekend. You all showed great leadership and teamwork!',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    author: {
      id: mockProfiles[1].id,
      first_name: mockProfiles[1].first_name,
      last_name: mockProfiles[1].last_name,
      avatar_url: mockProfiles[1].avatar_url,
    },
    likes: 31,
    hasLiked: true,
  },
  {
    id: 'post-4',
    group_id: null,
    user_id: mockProfiles[2].user_id, // Tyler Brown
    content: 'Finally completed my first digital art piece! Thanks to everyone who encouraged me to keep practicing. Progress takes time but it\'s worth it.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(), // 30 hours ago
    author: {
      id: mockProfiles[2].id,
      first_name: mockProfiles[2].first_name,
      last_name: mockProfiles[2].last_name,
      avatar_url: mockProfiles[2].avatar_url,
    },
    likes: 15,
    hasLiked: false,
  },
  {
    id: 'post-5',
    group_id: null,
    user_id: mockCurrentUser.user_id,
    content: 'Had a great session with my mentor today. We worked through some tough debugging problems and I learned so much!',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    author: {
      id: mockCurrentUser.id,
      first_name: mockCurrentUser.first_name,
      last_name: mockCurrentUser.last_name,
      avatar_url: mockCurrentUser.avatar_url,
    },
    likes: 12,
    hasLiked: false,
  },
  {
    id: 'post-6',
    group_id: null,
    user_id: mockMentorProfile.user_id,
    content: 'Quote of the day: "Iron sharpens iron, and one man sharpens another." Keep pushing each other to grow!',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    author: {
      id: mockMentorProfile.id,
      first_name: mockMentorProfile.first_name,
      last_name: mockMentorProfile.last_name,
      avatar_url: mockMentorProfile.avatar_url,
    },
    likes: 45,
    hasLiked: true,
  },
];

// Mock notifications
export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    user_id: 'current-user-auth-id',
    type: 'message',
    title: 'New message from David',
    body: 'Great job on your presentation! Let me know how...',
    action_url: '/messages/match-1',
    read_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
  },
  {
    id: 'notif-2',
    user_id: 'current-user-auth-id',
    type: 'session',
    title: 'Upcoming session reminder',
    body: 'You have a session with David Williams in 3 days',
    action_url: '/sessions/match-1',
    read_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: 'notif-3',
    user_id: 'current-user-auth-id',
    type: 'goal',
    title: 'Goal milestone reached!',
    body: 'You\'re 65% of the way to your GPA goal!',
    action_url: '/goals',
    read_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
  },
  {
    id: 'notif-4',
    user_id: 'current-user-auth-id',
    type: 'community',
    title: 'Jordan Davis liked your post',
    body: 'Your post received a new like',
    action_url: '/community',
    read_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: 'notif-5',
    user_id: 'current-user-auth-id',
    type: 'system',
    title: 'Complete your training',
    body: 'You have 3 modules left in Safety Protocols',
    action_url: '/training/track-2',
    read_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
  },
  {
    id: 'notif-6',
    user_id: 'current-user-auth-id',
    type: 'message',
    title: 'New message from James',
    body: 'See you at the group session on Saturday!',
    action_url: '/messages/match-2',
    read_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
  },
  {
    id: 'notif-7',
    user_id: 'current-user-auth-id',
    type: 'system',
    title: 'Welcome to Iron Sharpens Iron!',
    body: 'Your account has been verified. Start exploring!',
    action_url: '/home',
    read_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 1 week ago
  },
];

// User stats for profile page
export const mockUserStats = {
  matchesCount: 1,
  sessionsCompleted: 3,
  streakDays: 12,
  goalsCompleted: 2,
  badgesEarned: 1,
};

// Extended session type with participant info for list views
export interface SessionWithParticipant extends Session {
  participant: Pick<Profile, 'id' | 'first_name' | 'last_name' | 'avatar_url'>;
  matchId: string;
  userRole: UserRoleType;
}

// Mock mentees for mentor view
export const mockMentees: Profile[] = [
  mockCurrentUser, // Marcus Johnson
  {
    id: 'mentee-2-id',
    user_id: 'mentee-2-auth-id',
    first_name: 'Tyler',
    last_name: 'Brown',
    age: 15,
    bio: 'Freshman working on my communication skills.',
    interests: ['Gaming', 'Art & Design', 'Technology'],
    goals: ['Confidence Building', 'Academic Success'],
    location: 'Chicago, IL',
    avatar_url: null,
    guidelines_accepted_at: '2024-01-20T10:00:00Z',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-25T11:00:00Z',
  },
  {
    id: 'mentee-3-id',
    user_id: 'mentee-3-auth-id',
    first_name: 'Jordan',
    last_name: 'Davis',
    age: 17,
    bio: 'Senior preparing for college. Grateful for my mentor!',
    interests: ['Reading', 'Writing', 'Entrepreneurship'],
    goals: ['Career Development', 'Financial Literacy'],
    location: 'Chicago, IL',
    avatar_url: null,
    guidelines_accepted_at: '2023-11-01T10:00:00Z',
    created_at: '2023-11-01T10:00:00Z',
    updated_at: '2024-02-01T14:00:00Z',
  },
];

// Sessions from mentor's perspective (seeing all their mentees)
export const mockMentorSessions: SessionWithParticipant[] = [
  // Marcus sessions
  {
    id: 'session-upcoming-1',
    match_id: 'match-1',
    scheduled_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    google_event_id: null,
    status: 'scheduled',
    completed_at: null,
    mentee_notes: null,
    mentor_notes: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    participant: {
      id: mockMentees[0].id,
      first_name: mockMentees[0].first_name,
      last_name: mockMentees[0].last_name,
      avatar_url: mockMentees[0].avatar_url,
    },
    matchId: 'match-1',
    userRole: 'mentor',
  },
  {
    id: 'session-past-1',
    match_id: 'match-1',
    scheduled_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    google_event_id: null,
    status: 'completed',
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7 + 1000 * 60 * 60).toISOString(),
    mentee_notes: 'We talked about my career goals and David shared his journey into tech. Very inspiring!',
    mentor_notes: 'Marcus is making great progress. Discussed setting SMART goals. He showed strong interest in software development.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    participant: {
      id: mockMentees[0].id,
      first_name: mockMentees[0].first_name,
      last_name: mockMentees[0].last_name,
      avatar_url: mockMentees[0].avatar_url,
    },
    matchId: 'match-1',
    userRole: 'mentor',
  },
  // Tyler sessions
  {
    id: 'session-upcoming-tyler',
    match_id: 'match-tyler',
    scheduled_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1).toISOString(), // Tomorrow
    google_event_id: null,
    status: 'scheduled',
    completed_at: null,
    mentee_notes: null,
    mentor_notes: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    participant: {
      id: mockMentees[1].id,
      first_name: mockMentees[1].first_name,
      last_name: mockMentees[1].last_name,
      avatar_url: mockMentees[1].avatar_url,
    },
    matchId: 'match-tyler',
    userRole: 'mentor',
  },
  {
    id: 'session-past-tyler-1',
    match_id: 'match-tyler',
    scheduled_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    google_event_id: null,
    status: 'completed',
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5 + 1000 * 60 * 60).toISOString(),
    mentee_notes: 'Learned how to manage my time better with school and hobbies.',
    mentor_notes: 'Tyler is opening up more. We focused on confidence-building exercises.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    participant: {
      id: mockMentees[1].id,
      first_name: mockMentees[1].first_name,
      last_name: mockMentees[1].last_name,
      avatar_url: mockMentees[1].avatar_url,
    },
    matchId: 'match-tyler',
    userRole: 'mentor',
  },
  // Jordan sessions - needs notes added
  {
    id: 'session-needs-notes-jordan',
    match_id: 'match-jordan',
    scheduled_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    google_event_id: null,
    status: 'completed',
    completed_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    mentee_notes: 'Great session! We reviewed my college essays.',
    mentor_notes: null, // Mentor hasn't added notes yet
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    participant: {
      id: mockMentees[2].id,
      first_name: mockMentees[2].first_name,
      last_name: mockMentees[2].last_name,
      avatar_url: mockMentees[2].avatar_url,
    },
    matchId: 'match-jordan',
    userRole: 'mentor',
  },
  {
    id: 'session-upcoming-jordan',
    match_id: 'match-jordan',
    scheduled_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
    google_event_id: null,
    status: 'scheduled',
    completed_at: null,
    mentee_notes: null,
    mentor_notes: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    participant: {
      id: mockMentees[2].id,
      first_name: mockMentees[2].first_name,
      last_name: mockMentees[2].last_name,
      avatar_url: mockMentees[2].avatar_url,
    },
    matchId: 'match-jordan',
    userRole: 'mentor',
  },
];

// Sessions from mentee's perspective (seeing sessions with their mentor)
export const mockMenteeSessions: SessionWithParticipant[] = [
  {
    id: 'session-upcoming-1',
    match_id: 'match-1',
    scheduled_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    google_event_id: null,
    status: 'scheduled',
    completed_at: null,
    mentee_notes: null,
    mentor_notes: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    participant: {
      id: mockMentorProfile.id,
      first_name: mockMentorProfile.first_name,
      last_name: mockMentorProfile.last_name,
      avatar_url: mockMentorProfile.avatar_url,
    },
    matchId: 'match-1',
    userRole: 'mentee',
  },
  {
    id: 'session-past-1',
    match_id: 'match-1',
    scheduled_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    google_event_id: null,
    status: 'completed',
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7 + 1000 * 60 * 60).toISOString(),
    mentee_notes: 'We talked about my career goals and David shared his journey into tech. Very inspiring!',
    mentor_notes: 'Marcus is making great progress. Discussed setting SMART goals.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    participant: {
      id: mockMentorProfile.id,
      first_name: mockMentorProfile.first_name,
      last_name: mockMentorProfile.last_name,
      avatar_url: mockMentorProfile.avatar_url,
    },
    matchId: 'match-1',
    userRole: 'mentee',
  },
  {
    id: 'session-past-2',
    match_id: 'match-1',
    scheduled_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    google_event_id: null,
    status: 'completed',
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14 + 1000 * 60 * 60).toISOString(),
    mentee_notes: 'Learned about time management techniques. Going to try the Pomodoro method!',
    mentor_notes: 'Introduced productivity techniques. Marcus was very engaged.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 17).toISOString(),
    participant: {
      id: mockMentorProfile.id,
      first_name: mockMentorProfile.first_name,
      last_name: mockMentorProfile.last_name,
      avatar_url: mockMentorProfile.avatar_url,
    },
    matchId: 'match-1',
    userRole: 'mentee',
  },
  {
    id: 'session-past-3',
    match_id: 'match-1',
    scheduled_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21).toISOString(),
    google_event_id: null,
    status: 'completed',
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21 + 1000 * 60 * 60).toISOString(),
    mentee_notes: 'First official session! We set expectations and talked about what I want to achieve.',
    mentor_notes: 'Great first session with Marcus. He has clear goals and is eager to learn.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(),
    participant: {
      id: mockMentorProfile.id,
      first_name: mockMentorProfile.first_name,
      last_name: mockMentorProfile.last_name,
      avatar_url: mockMentorProfile.avatar_url,
    },
    matchId: 'match-1',
    userRole: 'mentee',
  },
  // Session needing notes from mentee
  {
    id: 'session-needs-mentee-notes',
    match_id: 'match-1',
    scheduled_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    google_event_id: null,
    status: 'completed',
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    mentee_notes: null, // Mentee hasn't added notes yet
    mentor_notes: 'Discussed debugging techniques. Marcus is picking up concepts quickly.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    participant: {
      id: mockMentorProfile.id,
      first_name: mockMentorProfile.first_name,
      last_name: mockMentorProfile.last_name,
      avatar_url: mockMentorProfile.avatar_url,
    },
    matchId: 'match-1',
    userRole: 'mentee',
  },
];

// =====================
// MENTOR BROWSE DATA
// =====================

export interface MentorProfile extends Profile {
  yearsExperience: number;
  specialties: string[];
  availability: string;
  matchCount: number;
  rating?: number;
}

export const mockAvailableMentors: MentorProfile[] = [
  {
    ...mockMentorProfile,
    yearsExperience: 10,
    specialties: ['Career Development', 'Technology', 'Leadership'],
    availability: 'Weekday evenings',
    matchCount: 5,
    rating: 4.9,
  },
  {
    id: 'mentor-2-id',
    user_id: 'mentor-2-auth-id',
    first_name: 'James',
    last_name: 'Thompson',
    age: 28,
    bio: 'Youth pastor and basketball coach. Love seeing young men grow in character and confidence. My approach focuses on building authentic relationships.',
    interests: ['Sports', 'Faith & Spirituality', 'Music', 'Volunteering'],
    goals: ['Personal Growth', 'Communication'],
    location: 'Chicago, IL',
    avatar_url: '/images/mentors/gettyimages-1455343282-612x612.jpg',
    guidelines_accepted_at: '2023-08-15T10:00:00Z',
    created_at: '2023-08-15T10:00:00Z',
    updated_at: '2024-01-10T09:00:00Z',
    yearsExperience: 5,
    specialties: ['Confidence Building', 'Sports', 'Faith'],
    availability: 'Weekends',
    matchCount: 8,
    rating: 4.8,
  },
  {
    id: 'mentor-3-id',
    user_id: 'mentor-3-auth-id',
    first_name: 'Michael',
    last_name: 'Chen',
    age: 35,
    bio: 'Financial advisor and former college athlete. Passionate about teaching young men financial literacy and discipline.',
    interests: ['Fitness', 'Financial Literacy', 'Sports', 'Reading'],
    goals: ['Financial Literacy', 'Health & Wellness'],
    location: 'Chicago, IL',
    avatar_url: '/images/mentors/gettyimages-1463782257-612x612.jpg',
    guidelines_accepted_at: '2023-05-01T10:00:00Z',
    created_at: '2023-05-01T10:00:00Z',
    updated_at: '2024-02-01T09:00:00Z',
    yearsExperience: 8,
    specialties: ['Financial Literacy', 'Academic Success', 'Fitness'],
    availability: 'Flexible',
    matchCount: 12,
    rating: 4.7,
  },
  {
    id: 'mentor-4-id',
    user_id: 'mentor-4-auth-id',
    first_name: 'Robert',
    last_name: 'Martinez',
    age: 42,
    bio: 'Small business owner and community leader. Here to help young men develop entrepreneurial mindsets and leadership skills.',
    interests: ['Entrepreneurship', 'Leadership', 'Cooking', 'Travel'],
    goals: ['Leadership Skills', 'Career Development'],
    location: 'Chicago, IL',
    avatar_url: '/images/mentors/gettyimages-1916997109-612x612.jpg',
    guidelines_accepted_at: '2023-03-01T10:00:00Z',
    created_at: '2023-03-01T10:00:00Z',
    updated_at: '2024-01-15T09:00:00Z',
    yearsExperience: 15,
    specialties: ['Entrepreneurship', 'Leadership', 'Communication'],
    availability: 'Weekday mornings',
    matchCount: 20,
    rating: 5.0,
  },
  {
    id: 'mentor-5-id',
    user_id: 'mentor-5-auth-id',
    first_name: 'Anthony',
    last_name: 'Davis',
    age: 38,
    bio: 'Corporate executive and life coach. Dedicated to helping young men navigate their career paths and personal development.',
    interests: ['Business', 'Public Speaking', 'Mentoring', 'Golf'],
    goals: ['Leadership Skills', 'Communication'],
    location: 'Chicago, IL',
    avatar_url: '/images/mentors/gettyimages-2203419531-612x612.jpg',
    guidelines_accepted_at: '2023-04-01T10:00:00Z',
    created_at: '2023-04-01T10:00:00Z',
    updated_at: '2024-01-20T09:00:00Z',
    yearsExperience: 12,
    specialties: ['Leadership', 'Career Development', 'Public Speaking'],
    availability: 'Weekday afternoons',
    matchCount: 15,
    rating: 4.9,
  },
  {
    id: 'mentor-6-id',
    user_id: 'mentor-6-auth-id',
    first_name: 'Marcus',
    last_name: 'Johnson',
    age: 30,
    bio: 'Professional counselor and youth advocate. Specializing in helping young men build emotional intelligence and resilience.',
    interests: ['Psychology', 'Community Service', 'Music', 'Fitness'],
    goals: ['Personal Growth', 'Mental Health'],
    location: 'Chicago, IL',
    avatar_url: '/images/mentors/gettyimages-2206642276-612x612.jpg',
    guidelines_accepted_at: '2023-07-01T10:00:00Z',
    created_at: '2023-07-01T10:00:00Z',
    updated_at: '2024-02-01T09:00:00Z',
    yearsExperience: 6,
    specialties: ['Emotional Intelligence', 'Life Skills', 'Communication'],
    availability: 'Flexible',
    matchCount: 10,
    rating: 4.8,
  },
];

// =====================
// MATCH REQUEST DATA
// =====================

export type MatchRequestStatus = 'pending' | 'accepted' | 'declined';

export interface MatchRequest {
  id: string;
  mentorId: string;
  menteeId: string;
  mentor: MentorProfile;
  status: MatchRequestStatus;
  message: string;
  createdAt: string;
  respondedAt?: string;
}

export const mockMatchRequests: MatchRequest[] = [
  {
    id: 'request-1',
    mentorId: 'mentor-2-id',
    menteeId: 'current-user-id',
    mentor: mockAvailableMentors[1],
    status: 'pending',
    message: 'Hi James! I saw that you coach basketball and work with youth. I\'m interested in building my confidence and would love to connect.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
];

// =====================
// GROUPS DATA
// =====================

export interface Group {
  id: string;
  name: string;
  description: string;
  type: 'interest' | 'location' | 'program';
  memberCount: number;
  imageUrl?: string;
  isJoined: boolean;
  nextEvent?: {
    title: string;
    date: string;
  };
}

export const mockGroups: Group[] = [
  {
    id: 'group-1',
    name: 'Chicago Tech Mentors',
    description: 'Connect with mentors and mentees interested in technology careers. Share resources, opportunities, and support.',
    type: 'interest',
    memberCount: 45,
    isJoined: true,
    nextEvent: {
      title: 'Coding Workshop',
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    },
  },
  {
    id: 'group-2',
    name: 'North Side Chapter',
    description: 'Local chapter for mentors and mentees on Chicago\'s North Side. Monthly meetups and community events.',
    type: 'location',
    memberCount: 32,
    isJoined: true,
  },
  {
    id: 'group-3',
    name: 'College Prep',
    description: 'For mentees preparing for college applications, SATs, and the transition to higher education.',
    type: 'program',
    memberCount: 28,
    isJoined: false,
    nextEvent: {
      title: 'Essay Writing Workshop',
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    },
  },
  {
    id: 'group-4',
    name: 'Sports & Fitness',
    description: 'Athletes and fitness enthusiasts. Organize pickup games, workouts, and discuss sports as a path to discipline.',
    type: 'interest',
    memberCount: 56,
    isJoined: false,
  },
  {
    id: 'group-5',
    name: 'Future Entrepreneurs',
    description: 'Business-minded mentees and mentors sharing ideas, resources, and experiences in entrepreneurship.',
    type: 'interest',
    memberCount: 23,
    isJoined: false,
  },
];

// =====================
// MODULE CONTENT DATA
// =====================

export interface ModuleContent {
  id: string;
  trackId: string;
  title: string;
  description: string;
  duration: number;
  type: 'video' | 'reading' | 'interactive' | 'quiz';
  content: {
    sections: {
      title: string;
      body: string;
    }[];
    keyTakeaways: string[];
    reflection?: string;
  };
  isCompleted: boolean;
}

export const mockModuleContent: Record<string, ModuleContent> = {
  'module-1-1': {
    id: 'module-1-1',
    trackId: 'track-1',
    title: 'Introduction to Mentoring',
    description: 'Understanding the mentor-mentee relationship and your role.',
    duration: 15,
    type: 'reading',
    content: {
      sections: [
        {
          title: 'What is Mentoring?',
          body: 'Mentoring is a developmental relationship where an experienced person (mentor) guides and supports a less experienced person (mentee) in their personal and professional growth. Unlike teaching or coaching, mentoring focuses on holistic development and building a lasting relationship.',
        },
        {
          title: 'The Role of a Mentor',
          body: 'As a mentor, you serve as a guide, role model, and trusted advisor. Your job is not to solve all problems, but to help your mentee develop the skills and confidence to navigate challenges themselves. You bring your experience, wisdom, and genuine care to the relationship.',
        },
        {
          title: 'Building the Foundation',
          body: 'Successful mentoring relationships are built on trust, respect, and open communication. Take time to understand your mentee\'s goals, challenges, and background. Be patient—trust takes time to develop.',
        },
      ],
      keyTakeaways: [
        'Mentoring is about guidance, not solving problems',
        'Trust is the foundation of the relationship',
        'Focus on holistic development, not just skills',
        'Be patient and consistent',
      ],
      reflection: 'Think about mentors in your own life. What made them effective? How did they make you feel supported?',
    },
    isCompleted: true,
  },
  'module-1-2': {
    id: 'module-1-2',
    trackId: 'track-1',
    title: 'Building Trust',
    description: 'Techniques for establishing rapport and building a trusting relationship.',
    duration: 20,
    type: 'reading',
    content: {
      sections: [
        {
          title: 'Why Trust Matters',
          body: 'Trust is the currency of mentoring. Without it, your mentee won\'t feel safe sharing challenges, asking for help, or being vulnerable about their struggles. Building trust requires intentional effort and consistency.',
        },
        {
          title: 'Showing Up Consistently',
          body: 'One of the simplest ways to build trust is being reliable. Show up on time, follow through on commitments, and be present during your sessions. Your mentee needs to know they can count on you.',
        },
        {
          title: 'Active Listening',
          body: 'Listen more than you speak. When your mentee talks, give them your full attention. Put away distractions, make eye contact, and reflect back what you hear to show you understand.',
        },
        {
          title: 'Confidentiality',
          body: 'What\'s shared in mentoring stays in mentoring (unless there\'s a safety concern). Make this clear to your mentee so they feel safe opening up.',
        },
      ],
      keyTakeaways: [
        'Trust is earned through consistency and reliability',
        'Listen actively and without judgment',
        'Maintain confidentiality',
        'Be authentic—don\'t pretend to have all the answers',
      ],
      reflection: 'What actions can you take in your first few sessions to demonstrate that you\'re trustworthy?',
    },
    isCompleted: true,
  },
  'module-1-3': {
    id: 'module-1-3',
    trackId: 'track-1',
    title: 'Active Listening Skills',
    description: 'How to truly hear and understand your mentee.',
    duration: 25,
    type: 'interactive',
    content: {
      sections: [
        {
          title: 'Beyond Hearing',
          body: 'Active listening is more than just hearing words. It involves paying attention to tone, body language, and what\'s left unsaid. It means being fully present and engaged.',
        },
        {
          title: 'The HEAR Method',
          body: 'H - Halt: Stop what you\'re doing and give full attention.\nE - Engage: Make eye contact and show you\'re listening.\nA - Anticipate: Stay curious about what they\'ll say next.\nR - Replay: Summarize what you heard to confirm understanding.',
        },
        {
          title: 'Asking Good Questions',
          body: 'Open-ended questions encourage deeper sharing. Instead of "Did school go well?" try "What was the best part of your week?" or "What\'s been on your mind lately?"',
        },
      ],
      keyTakeaways: [
        'Active listening requires full presence',
        'Use the HEAR method as a framework',
        'Ask open-ended questions',
        'Reflect back what you hear',
      ],
      reflection: 'Practice the HEAR method in your next conversation. What did you notice differently?',
    },
    isCompleted: false,
  },
};

// =====================
// FACILITATION TOOLKIT
// =====================

export interface ToolkitResource {
  id: string;
  title: string;
  description: string;
  type: 'guide' | 'template' | 'activity' | 'video';
  category: string;
  downloadUrl?: string;
  content?: string;
}

export const mockToolkitResources: ToolkitResource[] = [
  {
    id: 'toolkit-1',
    title: 'Icebreaker Activities',
    description: 'Collection of icebreaker games and questions to start group sessions.',
    type: 'activity',
    category: 'Group Sessions',
    content: '1. Two Truths and a Lie\n2. Would You Rather (appropriate version)\n3. Share your highs and lows of the week\n4. If you could have any superpower...',
  },
  {
    id: 'toolkit-2',
    title: 'Session Planning Template',
    description: 'Template for planning effective one-on-one mentoring sessions.',
    type: 'template',
    category: 'Session Planning',
    content: 'Session Plan Template:\n\n1. Check-in (5 min): How are they doing?\n2. Review (10 min): Follow up on last session\n3. Main Topic (30 min): Today\'s focus\n4. Action Items (10 min): What will they work on?\n5. Close (5 min): Encourage and confirm next meeting',
  },
  {
    id: 'toolkit-3',
    title: 'Goal Setting Workshop Guide',
    description: 'Step-by-step guide for running a goal-setting workshop with mentees.',
    type: 'guide',
    category: 'Workshops',
  },
  {
    id: 'toolkit-4',
    title: 'Difficult Conversations Guide',
    description: 'How to navigate challenging topics with sensitivity and care.',
    type: 'guide',
    category: 'Communication',
  },
  {
    id: 'toolkit-5',
    title: 'Progress Report Template',
    description: 'Template for documenting mentee progress and growth areas.',
    type: 'template',
    category: 'Documentation',
  },
];

// =====================
// ADMIN DATA
// =====================

export interface AdminStats {
  totalMentors: number;
  totalMentees: number;
  activeMatches: number;
  pendingMatches: number;
  sessionsThisMonth: number;
  averageSessionsPerMatch: number;
}

export const mockAdminStats: AdminStats = {
  totalMentors: 24,
  totalMentees: 48,
  activeMatches: 35,
  pendingMatches: 8,
  sessionsThisMonth: 142,
  averageSessionsPerMatch: 3.2,
};

export interface PendingMatch {
  id: string;
  mentor: Pick<Profile, 'id' | 'first_name' | 'last_name' | 'avatar_url'>;
  mentee: Pick<Profile, 'id' | 'first_name' | 'last_name' | 'avatar_url' | 'age'>;
  requestedAt: string;
  menteeMessage?: string;
}

export const mockPendingMatches: PendingMatch[] = [
  {
    id: 'pending-1',
    mentor: {
      id: 'mentor-2-id',
      first_name: 'James',
      last_name: 'Thompson',
      avatar_url: null,
    },
    mentee: {
      id: 'mentee-new-1',
      first_name: 'Kevin',
      last_name: 'Wilson',
      avatar_url: null,
      age: 14,
    },
    requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    menteeMessage: 'I want to get better at basketball and school.',
  },
  {
    id: 'pending-2',
    mentor: {
      id: 'mentor-3-id',
      first_name: 'Michael',
      last_name: 'Chen',
      avatar_url: null,
    },
    mentee: {
      id: 'mentee-new-2',
      first_name: 'Andre',
      last_name: 'Jackson',
      avatar_url: null,
      age: 16,
    },
    requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    menteeMessage: 'Looking for help with college planning and finances.',
  },
  {
    id: 'pending-3',
    mentor: {
      id: 'mentor-1-id',
      first_name: 'David',
      last_name: 'Williams',
      avatar_url: null,
    },
    mentee: {
      id: 'mentee-new-3',
      first_name: 'Isaiah',
      last_name: 'Brown',
      avatar_url: null,
      age: 15,
    },
    requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

export interface FlaggedItem {
  id: string;
  type: 'message' | 'session' | 'report';
  description: string;
  reportedBy: string;
  reportedAt: string;
  severity: 'low' | 'medium' | 'high';
}

export const mockFlaggedItems: FlaggedItem[] = [
  {
    id: 'flag-1',
    type: 'report',
    description: 'Mentee reported feeling uncomfortable during last session',
    reportedBy: 'System',
    reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    severity: 'medium',
  },
];
