# Prompt: Implement Complete Profile Flows for All Personas

## Overview
The Iron Sharpens Iron mentorship app has three personas: **Mentee**, **Mentor**, and **Admin**. Currently, only the Mentee persona has a complete profile experience within the community. The Mentor and Admin personas need the same profile functionality so all users have a consistent experience.

## Current State
- **Tech Stack**: React 18 + TypeScript + Vite + Tailwind CSS
- **Role Switching**: A `UserContext` (`src/context/UserContext.tsx`) manages the current user role and provides test users for each persona
- **Test Users**:
  - Admin: Sarah Mitchell
  - Mentor: David Williams
  - Mentee: Marcus Johnson
- **Dev Tool**: A `RoleSwitcher` component (`src/components/dev/RoleSwitcher.tsx`) allows switching between personas for testing

## What Needs to Be Done

### 1. Profile Page (`src/components/profile/ProfilePage.tsx`)
- Currently shows mentee-focused content
- Needs to adapt based on logged-in role:
  - **Mentee**: Show their mentor connections, goals progress, session history
  - **Mentor**: Show their mentee connections, mentoring stats, training progress, mentees helped
  - **Admin**: Show admin stats, program overview, quick actions for approvals

### 2. Community Feed (`src/components/community/CommunityFeed.tsx`)
- All personas should be able to post, like, and interact
- Profile links in posts should work for all user types
- Clicking any user's avatar/name should show their profile

### 3. Navigation & Headers
- Profile avatar in header should reflect current persona's image
- Bottom nav profile icon should work consistently for all roles

### 4. Mock Data (`src/data/mockData.ts`)
- Ensure mock profiles exist for Mentor and Admin personas
- Add profile images for all personas (images available in `public/images/mentors/` and `public/images/mentees/`)

## Implementation Guidelines

### 1. Use the UserContext to get the current user:
```tsx
import { useUser } from '../context/UserContext';
const { currentUser, role } = useUser();
```

### 2. Conditional rendering based on role:
```tsx
{role === 'mentee' && <MenteeProfileContent />}
{role === 'mentor' && <MentorProfileContent />}
{role === 'admin' && <AdminProfileContent />}
```

### 3. Maintain UI consistency:
- Use the same colored rings around profile images (blue-400, teal-400, pink-400)
- Keep the same card layouts and spacing
- Use the existing color scheme (blue accents, iron grays)

### 4. Profile sections by role:

| Section | Mentee | Mentor | Admin |
|---------|--------|--------|-------|
| Avatar with ring | Yes | Yes | Yes |
| Name & bio | Yes | Yes | Yes |
| Interests | Yes | Yes | Yes |
| Goals | Yes | No | No |
| Mentor connections | Yes | No | No |
| Mentee connections | No | Yes | No |
| Session count | Yes | Yes | No |
| Badges earned | Yes | Yes | No |
| Years experience | No | Yes | No |
| Specialties | No | Yes | No |
| Training certifications | No | Yes | No |
| Users managed | No | No | Yes |
| Pending approvals | No | No | Yes |
| Flagged items | No | No | Yes |
| Program stats | No | No | Yes |

## Files to Modify
- `src/components/profile/ProfilePage.tsx` - Main profile component
- `src/components/home/Dashboard.tsx` - Ensure hero section adapts to role
- `src/components/community/CommunityFeed.tsx` - Profile links for all users
- `src/components/layout/Header.tsx` - Profile avatar for current user
- `src/data/mockData.ts` - Add/update mock data for all personas

## Testing
Use the floating RoleSwitcher button (bottom-right corner) to switch between Admin, Mentor, and Mentee personas and verify:
1. Profile page shows role-appropriate content
2. Community feed shows correct user info
3. Navigation reflects current persona
4. All profile images display correctly

## Color Scheme Reference
| Element | Color |
|---------|-------|
| Primary accent | `blue-500`, `blue-400` |
| Profile rings | `teal-400`, `pink-400`, `blue-400` |
| Dark background | `iron-900` |
| Light background | `iron-50` |
| Headings | `iron-900` |
| Body text | `iron-600` |
| Muted text | `iron-400` |

## Routes Reference
| Route | Component | Description |
|-------|-----------|-------------|
| `/profile` | ProfilePage | User's own profile |
| `/community` | CommunityPage | Community feed |
| `/home` | HomePage | Dashboard |
| `/admin` | AdminPage | Admin dashboard (admin only) |
