# Iron Sharpens Iron - Project Context for Claude

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
│   │   ├── ui/              # Button, Input, Card, Avatar, Badge
│   │   ├── layout/          # AppShell, BottomNav, Header
│   │   ├── onboarding/      # Welcome, RoleSelect, AgeVerification, ProfileSetup, Guidelines
│   │   ├── home/            # Dashboard
│   │   ├── matching/        # [TODO] Find mentor, profiles, match requests
│   │   ├── sessions/        # [TODO] Session scheduling, detail, calendar
│   │   ├── messages/        # [TODO] Chat interface
│   │   ├── community/       # [TODO] Feed, groups
│   │   ├── training/        # [TODO] Hub, tracks, modules
│   │   ├── goals/           # [TODO] Goal tracking
│   │   ├── admin/           # [TODO] Dashboard, match management
│   │   └── safety/          # [TODO] Report, guidelines
│   ├── pages/               # Route-level components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Supabase client, utilities
│   ├── services/            # Business logic
│   └── types/               # TypeScript types, database types
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

### Matching (TODO)
- Browse available mentors (mentee view)
- View mentor/mentee profiles
- Request/accept matches (admin approval required)

### Sessions (TODO)
- Schedule sessions with Google Calendar sync
- Session logging and notes
- Session history

### Messaging (TODO)
- In-app chat between matched pairs
- Message history

### Community (TODO)
- Community feed for shared wins/encouragement
- Group directory

### Training (TODO)
- Training tracks for mentor development
- Module completion tracking
- Facilitation toolkit

### Admin (TODO)
- Match overview dashboard
- Pending match approval
- Safety reports review

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
- **Flame** (orange): Primary accent color (`flame-50` through `flame-950`)

## Development Commands
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
```

## Environment Variables
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Current Status
- [x] Project scaffolding
- [x] Tailwind CSS setup
- [x] UI component library (Button, Input, Card, Avatar, Badge)
- [x] Layout components (AppShell, BottomNav, Header)
- [x] Onboarding flow (5 screens)
- [x] Home dashboard with mock data
- [x] Routing setup
- [ ] Supabase project creation
- [ ] Database migrations
- [ ] Auth implementation
- [ ] Matching flow
- [ ] Session scheduling
- [ ] Messaging
- [ ] Community feed
- [ ] Training modules
- [ ] Admin dashboard

## Next Steps
1. Create Supabase project
2. Run database migrations
3. Implement auth flow (sign up, sign in)
4. Connect onboarding to Supabase
5. Build matching/browse mentors screen
6. Implement session scheduling with Google Calendar
