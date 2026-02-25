# Iron Sharpens Iron (MentorProgram) - Project Context for Claude

## Repository & Local Path
- **GitHub**: https://github.com/thamain1/MentorApp.git
- **Local Path**: `C:\dev\MentorProgram\iron-sharpens-iron`
- **Branch**: `master`
- **Run**: `cd C:\dev\MentorProgram\iron-sharpens-iron && npm run dev`

## Overview
Iron Sharpens Iron is a mobile-first web application for a non-profit mentorship program connecting young men (ages 12-19) with adult mentors (ages 19+). The platform facilitates structured mentorship relationships, community building, and a train-the-trainer pipeline.

## Mission
"As iron sharpens iron, so one person sharpens another." - Proverbs 27:17

Building meaningful mentorship relationships that help young men develop character, skills, and purpose.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Hosting**: Cloudflare Pages
- **Calendar**: Google Calendar API (planned)

## Project Structure
```
iron-sharpens-iron/
├── src/
│   ├── components/
│   │   ├── ui/              # Button, Input, Card, Avatar, Badge, Textarea
│   │   ├── layout/          # AppShell, BottomNav, Header
│   │   ├── onboarding/      # Welcome, RoleSelect, AgeVerification, ProfileSetup, Guidelines
│   │   ├── home/            # Dashboard
│   │   ├── matching/        # FindMentor, MentorProfile, MatchRequests
│   │   ├── sessions/        # SessionsList, SessionDetail, SessionNotesModal
│   │   ├── messages/        # MessagesList, Chat
│   │   ├── community/       # CommunityFeed
│   │   ├── groups/          # GroupDirectory, GroupDetail
│   │   ├── training/        # TrainingHub, TrackDetail, ModuleDetail, Toolkit
│   │   ├── goals/           # GoalsList, AddGoalModal
│   │   ├── notifications/   # NotificationsList
│   │   ├── profile/         # ProfilePage
│   │   ├── admin/           # AdminDashboard
│   │   └── safety/          # [TODO] Report, guidelines
│   ├── pages/               # Route-level components
│   ├── data/                # Mock data (mockData.ts)
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Supabase client, utilities
│   ├── services/            # Business logic
│   └── types/               # TypeScript types, database types
├── docs/
│   └── WIREFRAMES.md        # UI/UX wireframes documentation
├── supabase/
│   └── migrations/          # SQL migrations
└── public/                  # Static assets
```

## User Roles
- **Mentee**: Young men ages 12-19 seeking guidance
- **Mentor**: Adults 19+ who guide mentees
- **Admin**: Program managers who oversee matches and safety

## Primary User Journeys
1. **Mentee → Mentor → Community**: Young men get matched, build relationships, join community, eventually become mentors
2. **Mentor → Training → Facilitation**: Mentors get trained, certified, and can lead group sessions

## Key Features (MVP)

### Onboarding (Implemented)
- Welcome screen with value proposition
- Role selection (Mentor/Mentee)
- Age verification with role-appropriate requirements
- Profile setup (name, bio, interests, goals)
- Community guidelines acceptance

### Home Dashboard (Implemented)
- Daily check-in prompt
- Match card with quick actions
- Upcoming session display
- Goals progress tracking
- Quick navigation tiles

### Matching (Implemented - UI with mock data)
- Browse available mentors with search and specialty filters (`/mentors`)
- View detailed mentor profiles with stats and specialties (`/mentors/:mentorId`)
- Request to match with message modal
- View pending and past match requests (`/match-requests`)

### Sessions (Implemented - UI with mock data)
- Sessions list with mentor/mentee role toggle (`/sessions`)
- Session detail with scheduling, notes, cancel/complete actions (`/sessions/:matchId`)
- Session notes modal with guided prompts
- "Needs attention" section for sessions requiring notes

### Messaging (Implemented - UI with mock data)
- Conversations list with unread indicators (`/messages`)
- Chat interface with message bubbles (`/messages/:matchId`)
- Date dividers and relative timestamps
- Safety report option in menu

### Community (Implemented - UI with mock data)
- Community feed with posts, likes, sharing (`/community`)
- Group directory with filters by type (`/groups`)
- Group detail with join/leave, events, activity (`/groups/:groupId`)

### Training (Implemented - UI with mock data)
- Training hub with overall progress (`/training`)
- Track detail with module list (`/training/:trackId`)
- Module detail with content sections, takeaways, reflection (`/training/:trackId/:moduleId`)
- Facilitation toolkit with searchable resources (`/toolkit`)

### Goals (Implemented - UI with mock data)
- Goals list with progress tracking (`/goals`)
- Add goal modal with title, description, target date
- Mark goals complete, edit, delete

### Notifications (Implemented - UI with mock data)
- Notification center with type-based icons (`/notifications`)
- Read/unread states
- Mark all read functionality

### Profile (Implemented - UI with mock data)
- User profile with avatar, bio, interests (`/profile`)
- Stats card (matches, sessions, streak, badges)
- Settings menu (edit profile, notifications, help, sign out)

### Admin (Implemented - UI with mock data)
- Admin dashboard with stats overview (`/admin`)
- Pending match approval workflow
- Safety flagged items review

## Safety Considerations (Critical)
Because users include minors (ages 12-19):
1. All mentors require admin approval before matching
2. Community guidelines must be accepted
3. Report button accessible from every screen
4. All communication happens in-app (no external contact info exchange)
5. Session logging for accountability
6. Admin can review flagged conversations

## Database Schema (Planned)

### Core Tables
- `users` - Auth users with role
- `profiles` - User profile details, interests, goals
- `matches` - Mentor-mentee pairings
- `sessions` - Scheduled/completed sessions
- `check_ins` - Daily mood/reflection check-ins
- `goals` - User goals with progress
- `training_tracks` - Training curriculum
- `training_modules` - Individual lessons
- `user_training_progress` - Completion tracking
- `groups` - Community groups
- `posts` - Community feed posts
- `messages` - In-app messaging
- `notifications` - Push/in-app notifications

## Brand Colors
- **Iron** (grays): Primary neutral palette (`iron-50` through `iron-950`)
- **Brand** (electric indigo): Primary accent
- **Teal**: Vibrant secondary color
- **Coral**: Energy/accent color
- **Typography**: Inter font system

## Development Commands
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
```

## Supabase Project
- **Project Name**: Mentor Program
- **Project ID**: `mfluryezsdzwnexucgau`
- **URL**: https://mfluryezsdzwnexucgau.supabase.co
- **Credentials file**: `C:\dev\MentorProgram\Mentor_Supabase_Info.txt`

## Environment Variables
```
VITE_SUPABASE_URL=https://mfluryezsdzwnexucgau.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key from Mentor_Supabase_Info.txt>
```

## Applying Migrations
```bash
cd C:\dev\MentorProgram\iron-sharpens-iron
npx supabase link --project-ref mfluryezsdzwnexucgau
npx supabase db push
```

## Current Status
- [x] Project scaffolding
- [x] Tailwind CSS setup
- [x] UI component library (Button, Input, Card, Avatar, Badge, Textarea)
- [x] Layout components (AppShell, BottomNav, Header)
- [x] Onboarding flow (5 screens)
- [x] Home dashboard with mock data
- [x] Routing setup
- [x] Messages list and chat interface
- [x] Sessions list and detail (mentor/mentee views)
- [x] Session notes with guided prompts
- [x] Goals tracking with add/edit/complete
- [x] Training hub, tracks, and modules
- [x] Facilitation toolkit
- [x] Community feed with posts/likes
- [x] Group directory and detail
- [x] Find mentor and mentor profiles
- [x] Match request flow
- [x] Notifications center
- [x] Profile page with stats
- [x] Admin dashboard (stats, match approval, safety)
- [x] Mock data for all features
- [x] Wireframes documentation
- [ ] Supabase project creation
- [ ] Database migrations
- [ ] Auth implementation
- [ ] Connect UI to Supabase backend
- [ ] Google Calendar integration

## All Routes
| Route | Component | Description |
|-------|-----------|-------------|
| `/` | OnboardingPage | Welcome and onboarding flow |
| `/home` | HomePage | Dashboard with quick actions |
| `/messages` | MessagesPage | Conversation list |
| `/messages/:matchId` | ChatPage | Chat with match |
| `/sessions` | SessionsListPage | All sessions overview |
| `/sessions/:matchId` | SessionsPage | Session detail for match |
| `/goals` | GoalsPage | Goal tracking |
| `/training` | TrainingPage | Training hub |
| `/training/:trackId` | TrackDetailPage | Training track modules |
| `/training/:trackId/:moduleId` | ModuleDetailPage | Module content |
| `/toolkit` | ToolkitPage | Facilitation resources |
| `/community` | CommunityPage | Community feed |
| `/groups` | GroupsPage | Group directory |
| `/groups/:groupId` | GroupDetailPage | Group detail |
| `/mentors` | FindMentorPage | Browse mentors |
| `/mentors/:mentorId` | MentorProfilePage | Mentor profile |
| `/match-requests` | MatchRequestsPage | View match requests |
| `/profile` | ProfilePage | User profile |
| `/notifications` | NotificationsPage | Notification center |
| `/admin` | AdminPage | Admin dashboard |

## Next Steps
1. Create Supabase project
2. Run database migrations
3. Implement auth flow (sign up, sign in)
4. Connect onboarding to Supabase
5. Replace mock data with Supabase queries
6. Implement Google Calendar integration for sessions
7. Add real-time messaging with Supabase Realtime
8. Implement push notifications
