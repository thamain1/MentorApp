# Iron Sharpens Iron - UI Wireframes & Screen Guide

> Reference document for UI/UX team. All screens are implemented with functional mock data.

---

## Navigation Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    BOTTOM NAVIGATION                        │
├─────────────┬─────────────┬─────────────┬─────────────┬─────┤
│    Home     │  Community  │  Messages   │  Training   │Profile│
│     🏠      │     👥      │     💬      │     📚      │  👤  │
└─────────────┴─────────────┴─────────────┴─────────────┴─────┘
```

**Additional Routes (not in bottom nav):**
- `/sessions` - Sessions list
- `/sessions/:matchId` - Session detail with specific match
- `/goals` - Goals tracking
- `/notifications` - Notification center
- `/training/:trackId` - Training track detail

---

## 1. Home / Dashboard (`/home`)

```
┌─────────────────────────────────────┐
│ [Logo]              [🔔 Notifications]│
├─────────────────────────────────────┤
│                                     │
│  Hey, Marcus! 👋                    │
│  Let's make today count.            │
│                                     │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ ✨ DAILY CHECK-IN (orange bg)   │ │
│ │                                 │ │
│ │ What's one thing you're         │ │
│ │ grateful for today?             │ │
│ │                                 │ │
│ │ [Check In Button]               │ │
│ └─────────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ YOUR MENTOR          [Active ●] │ │
│ │                                 │ │
│ │ (Avatar) David Williams         │ │
│ │          Matched 3 weeks ago    │ │
│ │                                 │ │
│ │ [Message]      [Schedule]       │ │
│ └─────────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 🕐 NEXT SESSION              >  │ │
│ │    Wednesday, Feb 24, 3:00 PM   │ │
│ └─────────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ YOUR GOALS           [View All] │ │
│ │                                 │ │
│ │ Improve public speaking    60%  │ │
│ │ [████████████░░░░░░░░]          │ │
│ │                                 │ │
│ │ Read 2 books this month    50%  │ │
│ │ [██████████░░░░░░░░░░]          │ │
│ │                                 │ │
│ │ [+ Add New Goal]                │ │
│ └─────────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│  QUICK ACTIONS (2x2 grid)           │
│ ┌───────────┐ ┌───────────┐         │
│ │ 📅        │ │ 📈        │         │
│ │ Sessions  │ │ Training  │         │
│ │ View all  │ │ Continue  │         │
│ └───────────┘ └───────────┘         │
│ ┌───────────┐ ┌───────────┐         │
│ │ 💬        │ │ 🎯        │         │
│ │ Community │ │ Goals     │         │
│ │ Join conv │ │ Track     │         │
│ └───────────┘ └───────────┘         │
│                                     │
└─────────────────────────────────────┘
```

**Key Interactions:**
- Daily check-in card dismisses after completion
- Mentor card links to messages and sessions
- Next session card links to session detail
- Quick action tiles navigate to respective pages

---

## 2. Messages List (`/messages`)

```
┌─────────────────────────────────────┐
│ ← Messages              [🔔]        │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ (Avatar) ●2  David Williams     │ │
│ │              Great job on your  │ │
│ │              presentation! Le.. │ │
│ │                         30m ago │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ (Avatar)     James Thompson     │ │
│ │              See you at the     │ │
│ │              group session o... │ │
│ │                          3h ago │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ (Avatar)     Coach Mike         │ │
│ │              Welcome to the     │ │
│ │              program! Feel f... │ │
│ │                          2d ago │ │
│ └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

**Empty State:**
```
┌─────────────────────────────────────┐
│         [💬 icon in circle]         │
│                                     │
│        No messages yet              │
│                                     │
│   Once you're matched with a        │
│   mentor or mentee, your            │
│   conversations will appear here.   │
└─────────────────────────────────────┘
```

**Key Elements:**
- Unread count badge on avatar
- Bold text for unread conversations
- Relative timestamps
- Truncated message preview

---

## 3. Chat Screen (`/messages/:matchId`)

```
┌─────────────────────────────────────┐
│ ← (Avatar) David Williams    [⋮]   │
│            Active now               │
├─────────────────────────────────────┤
│                                     │
│          ┌── Today ──┐              │
│                                     │
│ ┌─────────────────┐                 │
│ │ Hey Marcus! How │                 │
│ │ are you doing?  │                 │
│ │          10:30a │                 │
│ └─────────────────┘                 │
│                                     │
│                 ┌─────────────────┐ │
│                 │ I'm doing good!│  │
│                 │ Been working on│  │
│                 │ that project.  │  │
│                 │          10:35a│  │
│                 └─────────────────┘ │
│                   (orange bubble)   │
│                                     │
│ ┌─────────────────┐                 │
│ │ That's great!   │                 │
│ │ How's the       │                 │
│ │ coding part?    │                 │
│ │          10:40a │                 │
│ └─────────────────┘                 │
│                                     │
├─────────────────────────────────────┤
│ ┌─────────────────────────┐ [Send] │
│ │ Type a message...       │   ➤   │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Menu (⋮) Options:**
```
┌─────────────────┐
│ 🚩 Report concern│
└─────────────────┘
```

**Key Elements:**
- Date dividers (Today, Yesterday, Date)
- Sent messages: Orange bubble, right-aligned
- Received messages: White bubble, left-aligned
- Timestamps on each message
- Safety report option in menu

---

## 4. Sessions List (`/sessions`)

```
┌─────────────────────────────────────┐
│ ← Sessions              [🔔]        │
├─────────────────────────────────────┤
│                                     │
│ View as:                            │
│ ┌─────────────┬─────────────┐       │
│ │ 👤 Mentee   │ 👥 Mentor   │       │
│ │  (active)   │             │       │
│ └─────────────┴─────────────┘       │
│                                     │
├─────────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐            │
│ │  1  │ │  1  │ │  3  │            │
│ │Up-  │ │Need │ │Comp-│            │
│ │coming│ │Notes│ │leted│            │
│ └─────┘ └─────┘ └─────┘            │
│                                     │
├─────────────────────────────────────┤
│ ⚠️ NEEDS YOUR NOTES                 │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ (Avatar) David Williams [Mentor]│ │
│ │          Add your notes      ⚠️>│ │
│ └─────────────────────────────────┘ │
│           (amber background)        │
│                                     │
├─────────────────────────────────────┤
│ UPCOMING SESSIONS (1)               │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ (Avatar) David Williams [Mentor]│ │
│ │          Tomorrow 3:00 PM    📹>│ │
│ └─────────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│ PAST SESSIONS                       │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ (Avatar) David Williams [Mentor]│ │
│ │          1 week ago          ✓ >│ │
│ └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

**Mentor View Shows:**
- All mentees' sessions
- Multiple participant cards
- "Mark Complete" capability

---

## 5. Session Detail (`/sessions/:matchId`)

```
┌─────────────────────────────────────┐
│ ← Sessions                          │
├─────────────────────────────────────┤
│                                     │
│ View as:                            │
│ ┌─────────────┬─────────────┐       │
│ │ 👤 Mentee   │ 👥 Mentor   │       │
│ └─────────────┴─────────────┘       │
│                                     │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ (Avatar) David Williams [Mentor]│ │
│ │          4 sessions total    [💬]│ │
│ └─────────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│ UPCOMING                            │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ▌Feb 24, 2025        [Scheduled]│ │
│ │ ▌3:00 PM                        │ │
│ │                                 │ │
│ │ 📹 Video call    🕐 1 hour      │ │
│ │                                 │ │
│ │ [✓ Mark Complete] [✗ Cancel]   │ │
│ │      (mentor only)              │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [+ Schedule Another Session]        │
│                                     │
├─────────────────────────────────────┤
│ PAST SESSIONS                       │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ✓ Feb 14, 2025                  │ │
│ │   2:00 PM                       │ │
│ │                                 │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ My Notes            [Edit] │ │ │
│ │ │ We talked about career     │ │ │
│ │ │ goals and David shared...  │ │ │
│ │ └─────────────────────────────┘ │ │
│ │                                 │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ Mentor's Notes (orange bg) │ │ │
│ │ │ Marcus is making great     │ │ │
│ │ │ progress. Discussed SMART..│ │ │
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

**Schedule Modal:**
```
┌─────────────────────────────────────┐
│ Schedule Session              [✕]   │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ (Avatar) David Williams         │ │
│ │          Mentor                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Date                                │
│ ┌─────────────────────────────────┐ │
│ │ [Date Picker]                   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Time                                │
│ ┌─────────────────────────────────┐ │
│ │ [Time Picker]                   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Notes (optional)                    │
│ ┌─────────────────────────────────┐ │
│ │ What would you like to discuss? │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Cancel]          [Schedule]        │
│                                     │
└─────────────────────────────────────┘
```

**Session Notes Modal:**
```
┌─────────────────────────────────────┐
│ Session Notes                 [✕]   │
│ David Williams • Feb 14, 2025       │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📝 Consider reflecting on:      │ │
│ │                                 │ │
│ │ • What did you learn?           │ │
│ │ • What was most helpful?        │ │
│ │ • What action items were set?   │ │
│ │ • What to discuss next time?    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Your Notes                          │
│ ┌─────────────────────────────────┐ │
│ │ Write your notes here...        │ │
│ │                                 │ │
│ │                                 │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ (small text: These notes help you   │
│  remember what you learned...)      │
│                                     │
│ [Cancel]          [Save Notes]      │
│                                     │
└─────────────────────────────────────┘
```

---

## 6. Goals (`/goals`)

```
┌─────────────────────────────────────┐
│ ← My Goals              [🔔]        │
├─────────────────────────────────────┤
│                                     │
│ ACTIVE GOALS (3)                    │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Improve GPA to 3.5         [⋮] │ │
│ │ Focus on math and science...    │ │
│ │                                 │ │
│ │ Progress                   65%  │ │
│ │ [████████████████░░░░░░░░]      │ │
│ │                                 │ │
│ │ 📅 Target: May 15, 2025         │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Learn Python basics        [⋮] │ │
│ │ Complete online course...       │ │
│ │                                 │ │
│ │ Progress                   40%  │ │
│ │ [██████████░░░░░░░░░░░░░░]      │ │
│ │                                 │ │
│ │ 📅 Target: Apr 20, 2025         │ │
│ └─────────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│ ▼ COMPLETED (2)                     │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ✓ Complete first coding project │ │
│ │   Completed Feb 9, 2025         │ │
│ └─────────────────────────────────┘ │
│         (strikethrough, gray bg)    │
│                                     │
│                              [+]    │
│                        (FAB button) │
└─────────────────────────────────────┘
```

**Goal Menu (⋮):**
```
┌─────────────────┐
│ ✏️ Edit          │
│ ✓ Complete      │
│ 🗑️ Delete        │
└─────────────────┘
```

**Add Goal Modal:**
```
┌─────────────────────────────────────┐
│ Add New Goal                  [✕]   │
├─────────────────────────────────────┤
│                                     │
│ Goal Title                          │
│ ┌─────────────────────────────────┐ │
│ │ What do you want to achieve?    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Description (optional)              │
│ ┌─────────────────────────────────┐ │
│ │ Add more details...             │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Target Date (optional)              │
│ ┌─────────────────────────────────┐ │
│ │ [Date Picker]                   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Cancel]          [Add Goal]        │
│                                     │
└─────────────────────────────────────┘
```

---

## 7. Training Hub (`/training`)

```
┌─────────────────────────────────────┐
│ ← Training              [🔔]        │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │        OVERALL PROGRESS         │ │
│ │           (orange gradient)     │ │
│ │                                 │ │
│ │   [🏆]              67%         │ │
│ │                                 │ │
│ │ ✓ 6/9 modules    🏆 1 badge    │ │
│ └─────────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│ TRAINING TRACKS                     │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [📚] Mentor Foundations      >  │ │
│ │                                 │ │
│ │ Essential skills and knowledge  │ │
│ │ for effective mentoring...      │ │
│ │                                 │ │
│ │ [████████░░░░░░░░] 40%          │ │
│ │ 2/5 modules    🕐 110 min       │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [✓] Safety Protocols [Complete]>│ │
│ │     (green icon)                │ │
│ │                                 │ │
│ │ Required training on safety,    │ │
│ │ boundaries, and reporting...    │ │
│ │                                 │ │
│ │ [████████████████] 100%         │ │
│ │ 4/4 modules    🕐 80 min        │ │
│ └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

---

## 8. Training Track Detail (`/training/:trackId`)

```
┌─────────────────────────────────────┐
│ ← Mentor Foundations         [40%] │
│   2 of 5 modules complete           │
│ [████████░░░░░░░░░░░░░░░░░░░░░░░]   │
├─────────────────────────────────────┤
│                                     │
│ Essential skills and knowledge      │
│ for effective mentoring. Complete   │
│ this track to become certified.     │
│                                     │
├─────────────────────────────────────┤
│ MODULES                             │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [✓] Introduction to Mentoring   │ │
│ │     🕐 15 min         Completed │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [✓] Building Trust              │ │
│ │     🕐 20 min         Completed │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [▶] Active Listening Skills     │ │
│ │     🕐 25 min    Up next [Start]│ │
│ └─────────────────────────────────┘ │
│          (orange icon)              │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [🔒] Setting Goals Together     │ │
│ │     🕐 20 min                   │ │
│ └─────────────────────────────────┘ │
│          (locked, grayed out)       │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [🔒] Navigating Challenges      │ │
│ │     🕐 30 min                   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [▶ Continue Training]               │
│                                     │
└─────────────────────────────────────┘
```

**Completed Track State:**
```
┌─────────────────────────────────────┐
│         ✓ Track Complete!           │
│           (green card)              │
│                                     │
│   Congratulations! You've           │
│   completed all modules in          │
│   this track.                       │
└─────────────────────────────────────┘
```

---

## 9. Community Feed (`/community`)

```
┌─────────────────────────────────────┐
│ ← Community             [🔔]        │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ (Avatar) Share a win or         │ │
│ │          encouragement...       │ │
│ │                                 │ │
│ │                      [Post ➤]   │ │
│ └─────────────────────────────────┘ │
│                                     │
│        🔄 Pull to refresh           │
│                                     │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ (Avatar) Jordan Davis           │ │
│ │          2 hours ago            │ │
│ │                                 │ │
│ │ Just got accepted to my top     │ │
│ │ choice college! None of this    │ │
│ │ would have been possible        │ │
│ │ without my mentor... 🎓         │ │
│ │                                 │ │
│ │ ❤️ 24                           │ │
│ │ (filled heart = liked)          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ (Avatar) David Williams         │ │
│ │          5 hours ago            │ │
│ │                                 │ │
│ │ Reminder: Group session this    │ │
│ │ Saturday at 10 AM. We'll be     │ │
│ │ discussing goal-setting...      │ │
│ │                                 │ │
│ │ ♡ 8                             │ │
│ │ (outline heart = not liked)     │ │
│ └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

---

## 10. Profile (`/profile`)

```
┌─────────────────────────────────────┐
│ ← Profile               [🔔]        │
├─────────────────────────────────────┤
│                                     │
│           (Large Avatar)            │
│              [📷]                   │
│                                     │
│         Marcus Johnson              │
│           [Mentee]                  │
│         Chicago, IL                 │
│                                     │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ ABOUT                           │ │
│ │                                 │ │
│ │ High school junior interested   │ │
│ │ in technology and music.        │ │
│ │ Looking forward to learning...  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ INTERESTS                       │ │
│ │                                 │ │
│ │ [Technology] [Music] [Gaming]   │ │
│ │ [Sports]                        │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ FOCUS AREAS (orange tags)       │ │
│ │                                 │ │
│ │ [Academic Success]              │ │
│ │ [Career Development]            │ │
│ │ [Leadership Skills]             │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ YOUR STATS                      │ │
│ │                                 │ │
│ │ [🎯 1]    [📅 3]    [🔥 12]    [🏆 1]│
│ │ Matches Sessions Streak Badges  │ │
│ └─────────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ ✏️ Edit Profile              >  │ │
│ ├─────────────────────────────────┤ │
│ │ 🔔 Notifications             >  │ │
│ ├─────────────────────────────────┤ │
│ │ ❓ Help & Support            >  │ │
│ ├─────────────────────────────────┤ │
│ │ 🚪 Sign Out                  >  │ │
│ │    (red text)                   │ │
│ └─────────────────────────────────┘ │
│                                     │
│       Iron Sharpens Iron v1.0.0     │
│                                     │
└─────────────────────────────────────┘
```

---

## 11. Notifications (`/notifications`)

```
┌─────────────────────────────────────┐
│ ← Notifications                     │
├─────────────────────────────────────┤
│                   [✓✓ Mark all read]│
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [💬] New message from David   ● │ │
│ │      Great job on your pres...  │ │
│ │      30 minutes ago             │ │
│ └─────────────────────────────────┘ │
│      (light orange bg = unread)     │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [📅] Upcoming session reminder● │ │
│ │      You have a session with... │ │
│ │      2 hours ago                │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [🎯] Goal milestone reached!    │ │
│ │      You're 65% of the way...   │ │
│ │      5 hours ago                │ │
│ └─────────────────────────────────┘ │
│      (white bg = read)              │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [❤️] Jordan Davis liked your... │ │
│ │      Your post received a...    │ │
│ │      1 day ago                  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [🔔] Complete your training     │ │
│ │      You have 3 modules left... │ │
│ │      2 days ago                 │ │
│ └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

**Notification Types & Icons:**
| Type | Icon | Color |
|------|------|-------|
| message | 💬 | Blue |
| session | 📅 | Green |
| goal | 🎯 | Orange |
| community | ❤️ | Pink |
| system | 🔔 | Gray |

---

## User Flows

### Flow 1: Mentee Session Journey
```
Dashboard → Sessions Card → Session Detail → Schedule Modal
                ↓
         Sessions List → Session Detail → Add Notes Modal
```

### Flow 2: Mentor Session Management
```
Sessions List (Mentor View) → See all mentees
        ↓
Session Detail → Mark Complete → Add Notes Modal
        ↓
Session Detail → Cancel Session → Confirmation
```

### Flow 3: Goal Tracking
```
Dashboard → Goals Card → Goals List → Add Goal Modal
                              ↓
                    Goal Card → Menu → Complete/Edit/Delete
```

### Flow 4: Training Progression
```
Dashboard → Training Tile → Training Hub → Track Card
                                              ↓
                           Track Detail → Module → Start/Review
```

---

## Color Palette Reference

| Token | Usage | Hex (approx) |
|-------|-------|--------------|
| `flame-500` | Primary action, sent messages | `#F97316` |
| `flame-100` | Badges, highlights | `#FFEDD5` |
| `iron-900` | Primary text | `#1C1917` |
| `iron-500` | Secondary text, labels | `#78716C` |
| `iron-100` | Borders, dividers | `#F5F5F4` |
| `green-500` | Success, completed | `#22C55E` |
| `amber-500` | Warning, needs attention | `#F59E0B` |
| `red-500` | Danger, delete | `#EF4444` |

---

## Component Library

| Component | Variants |
|-----------|----------|
| Button | primary, secondary, outline, ghost, danger |
| Badge | default, flame, success, warning, danger |
| Card | standard (with optional CardHeader, CardContent, etc.) |
| Avatar | sm, md, lg, xl (with fallback initials) |
| Input | standard, with label, with error |
| Textarea | standard, with label |

---

## Responsive Considerations

- **Max width**: `max-w-md` (448px) centered container
- **Safe areas**: `safe-top`, `safe-bottom` for mobile notches
- **Bottom nav height**: `pb-20` (80px) spacing
- **Touch targets**: Minimum 44x44px for buttons
- **Modal behavior**: Slides up from bottom on mobile

---

*Last updated: February 2025*
*Built with React + TypeScript + Tailwind CSS*
