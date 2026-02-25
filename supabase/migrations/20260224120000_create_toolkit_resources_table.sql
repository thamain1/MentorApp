-- Create toolkit_resources table and seed with mentor resources

CREATE TABLE IF NOT EXISTS toolkit_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('guide', 'template', 'activity', 'video')),
  category TEXT NOT NULL,
  content TEXT,
  download_url TEXT,
  target_role TEXT NOT NULL DEFAULT 'mentor' CHECK (target_role IN ('mentor', 'mentee', 'all')),
  display_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE toolkit_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read toolkit resources"
  ON toolkit_resources FOR SELECT
  USING (auth.role() = 'authenticated');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_toolkit_resources_type ON toolkit_resources(type);
CREATE INDEX IF NOT EXISTS idx_toolkit_resources_category ON toolkit_resources(category);
CREATE INDEX IF NOT EXISTS idx_toolkit_resources_target_role ON toolkit_resources(target_role);

-- =====================
-- SEED: SESSION PLANNING
-- =====================

INSERT INTO toolkit_resources (title, description, type, category, content, target_role, display_order)
VALUES
(
  'Session Planning Template',
  'A structured template for planning effective one-on-one mentoring sessions.',
  'template',
  'Session Planning',
  $content$
SESSION PLAN TEMPLATE
Date: ___________  Mentee: ___________  Session #: ___

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHECK-IN (5-10 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
How are they doing? (school, home, mood)
Opening question: ___________________________
Notes: _____________________________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FOLLOW-UP FROM LAST SESSION (5-10 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Action item they committed to:
Did they follow through?  YES / NO / PARTIAL
Notes: _____________________________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MAIN TOPIC (20-30 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Today's focus: _____________________________
Key questions to ask:
1. ________________________________________
2. ________________________________________
3. ________________________________________
What came up: ______________________________
Insight or breakthrough: ___________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACTION ITEMS (5-10 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
What will they commit to before next session?
Action: ____________________________________
By when: ___________________________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLOSE (5 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Encouragement given: _______________________
Next session date/time: ____________________
Anything to follow up with program staff: __
$content$,
  'mentor',
  1
),
(
  'First Session Guide',
  'How to make the most of your very first session with a new mentee.',
  'guide',
  'Session Planning',
  $content$
YOUR FIRST SESSION — MAKING IT COUNT

The first session sets the tone for everything that follows. Your goal is simple: make him feel safe, seen, and glad he showed up.

BEFORE THE SESSION
- Review his profile if available (interests, goals, age)
- Choose a comfortable, public location
- Arrive 5 minutes early
- Put your phone on silent

THE FLOW

OPENING (5 min)
Start casual. "I'm glad we're finally doing this." Small talk about something you both have in common or a neutral topic.

LEARN ABOUT HIM (20-30 min)
Let him do most of the talking. Use these questions:
- "Tell me about yourself — what do you do outside of school?"
- "What's something you're really good at?"
- "What's something you want to get better at?"
- "What made you want to be part of this program?"

SHARE A LITTLE ABOUT YOURSELF (10 min)
Not a life story — just enough to make you human. Where you grew up, what you do, maybe one challenge you navigated at his age.

SET EXPECTATIONS TOGETHER (10 min)
- "How often do you want to meet?"
- "Is there anything you hope I won't do as your mentor?"
- "Is there anything you're hoping this will be?"
- Explain confidentiality and its limits (safety exceptions)

CLOSE (5 min)
- Confirm next meeting date and time
- End on a positive note: "I'm looking forward to this."
- Walk to his ride or say a proper goodbye

WHAT NOT TO DO IN SESSION 1:
- Lecture or give life advice
- Ask about family problems or trauma
- Make commitments you cannot keep
- Look at your phone

AFTER THE SESSION:
Send a brief message through the app: "Great meeting you today. See you [date]."
$content$,
  'mentor',
  2
),
(
  'Progress Notes Template',
  'Template for documenting mentee progress and growth after each session.',
  'template',
  'Session Planning',
  $content$
SESSION PROGRESS NOTES
(For your personal records — keep confidential)

Date: ___________  Session #: ___  Duration: ___ min

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MENTEE WELLBEING CHECK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall mood/energy today (1-10): ___
School situation: STABLE / SOME CONCERN / NEEDS ATTENTION
Home situation: STABLE / SOME CONCERN / NEEDS ATTENTION
Peer situation: STABLE / SOME CONCERN / NEEDS ATTENTION
Anything flagged for program staff?  YES / NO
If yes, what: ______________________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT WE DISCUSSED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Main topic(s): _____________________________
Key insight or moment from this session:
___________________________________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GROWTH OBSERVED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
What signs of growth or progress did I notice?
___________________________________________
What is he still working through?
___________________________________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACTION ITEMS & GOALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
He committed to: ___________________________
Goal update: ON TRACK / NEEDS ADJUSTMENT / COMPLETED
New goal discussed: ________________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MENTOR REFLECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
How did I show up today? ___________________
What would I do differently? _______________
What do I want to bring to next session? ___
$content$,
  'mentor',
  3
);

-- =====================
-- SEED: GROUP SESSIONS
-- =====================

INSERT INTO toolkit_resources (title, description, type, category, content, target_role, display_order)
VALUES
(
  'Icebreaker Activity Collection',
  '15 icebreaker games and questions to start group sessions and build community.',
  'activity',
  'Group Sessions',
  $content$
ICEBREAKER ACTIVITIES FOR MENTOR GROUPS

Use these to warm up sessions, build trust, and get young men talking. Choose based on group size and energy level.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LOW ENERGY / QUIET STARTERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. HIGHS & LOWS
Each person shares the high point and low point of their week. No judgment, no advice — just listening.

2. ONE WORD CHECK-IN
"Describe how you're feeling right now in one word." Go around the room. Simple and surprisingly revealing.

3. IF YOU COULD...
"If you could have dinner with anyone alive or dead, who would it be and why?"
"If you could instantly master one skill, what would it be?"
"If you could change one thing about your school, what would it be?"

4. COMMON GROUND
"Stand up if you've ever..." (missed the bus, eaten cereal for dinner, stayed up past 2am...)
Low risk, builds camaraderie quickly.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MEDIUM ENERGY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5. TWO TRUTHS AND A LIE
Each person states two true things and one false thing about themselves. Group guesses the lie.

6. WOULD YOU RATHER (clean version)
"Would you rather be the fastest person alive or the smartest?"
"Would you rather always be 10 minutes late or always be 2 hours early?"
"Would you rather give up your phone for a month or give up music for a year?"

7. THE MAP
Draw a large map outline on paper. Each person marks where they are from / where they want to go. Opens up family background and future dreams naturally.

8. DESERT ISLAND
"You're stranded on an island for one year. You can bring 3 items, one skill, and one person. What are they?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HIGHER ENGAGEMENT / TRUST REQUIRED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

9. THE CHAIR TEST
"Who is someone in your life who, if they saw a video of everything you did this week, would be proud of you? Who might be disappointed?"

10. MY HERO
"Name someone — real or fictional — who represents the man you want to become. Why?"

11. THE NEWSPAPER HEADLINE
"If a newspaper wrote a headline about your life 20 years from now, what do you want it to say?"

12. APPRECIATION CIRCLE
Go around the room. Each person names one genuine strength they have noticed in the person to their left.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHYSICAL / ACTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

13. SPECTRUM LINE
Call out a topic. Participants line up from one wall (strongly agree) to the other (strongly disagree). Great for exploring values and sparking discussion.

14. ROCK PAPER SCISSORS TOURNAMENT
Losers become the winner's cheering section. Last player standing has the whole room behind them. High energy, quick.

15. SILENT LINE-UP
Without talking, line up in order of (birthday, height, how far you live from here). Forces non-verbal communication and usually generates a lot of laughter.
$content$,
  'mentor',
  1
),
(
  'Group Discussion Facilitation Guide',
  'How to lead meaningful group discussions that go beyond surface level.',
  'guide',
  'Group Sessions',
  $content$
FACILITATING GREAT GROUP DISCUSSIONS

A great group discussion does not happen by accident. It is shaped by how you set it up, the questions you use, and how you manage the dynamics in the room.

BEFORE THE DISCUSSION

SET THE CONTAINER:
Establish ground rules at the start. Write them on a whiteboard or say them out loud:
- What's said here, stays here
- No put-downs or clowning on each other
- You have the right to pass
- Listen when others speak — phones down

KNOW YOUR GOAL:
Are you building community? Processing an experience? Teaching a concept? Sharing stories? Know what you are trying to accomplish so you can keep the conversation on track.

PREPARE 3 LEVELS OF QUESTIONS:
Opening questions (easy, low risk — everyone can answer)
→ "What is your favorite way to spend a Saturday?"

Deepening questions (more personal or reflective)
→ "What is something you are still figuring out?"

Challenge questions (for when trust is established)
→ "What is something you want to change about yourself but keep putting off?"

DURING THE DISCUSSION

START WITH YOURSELF:
Model the level of vulnerability you are inviting. If you want deep answers, share something real about yourself first.

HANDLE SILENCE:
Silence after a question means people are thinking. Let it breathe for 5 seconds before rephrasing. Do not rush to fill it.

REDIRECT WITHOUT SHAMING:
If someone goes off topic or disrupts: "Good point — let's hold that for a minute. I want to hear what [name] was saying."
If someone dominates: "Thanks for sharing. Let's hear from someone who hasn't spoken yet."

DRAW OUT THE QUIET ONES:
"[Name], I'd love to hear your take on this if you're comfortable."
Never force participation, but always create the opening.

CONNECT THE DOTS:
When someone says something meaningful, connect it to others: "That connects to what Marcus said earlier about..."

HANDLE CONFLICT:
If two people disagree, use it: "There's a real difference here. Both of you, tell me more about why you see it that way."
Never let one person shame another — step in immediately.

CLOSING THE DISCUSSION:
- Go around the room for a one-sentence takeaway
- Name what you observed: "I saw real honesty in this room today."
- Connect to action: "What is one thing from this conversation you want to carry with you this week?"
$content$,
  'mentor',
  2
);

-- =====================
-- SEED: COMMUNICATION
-- =====================

INSERT INTO toolkit_resources (title, description, type, category, content, target_role, display_order)
VALUES
(
  'Difficult Conversations Guide',
  'A practical framework for navigating challenging topics with your mentee with care and confidence.',
  'guide',
  'Communication',
  $content$
DIFFICULT CONVERSATIONS GUIDE

Some of the most important conversations you will have with your mentee will also be the hardest to start. This guide gives you a framework for having them well.

THE CORE PRINCIPLE:
You can say almost anything if you say it with genuine care and without an agenda to be right. The goal is not to win — it is to help him see something clearly and choose better.

THE SBI-R FRAMEWORK:
SITUATION — Describe the specific context
BEHAVIOR — Describe the observable action (not the character)
IMPACT — Share the effect
REQUEST — Name what you are asking for

Example:
"In our last two sessions (Situation), you've checked out when I've asked about school (Behavior). I'm concerned that something might be going on that we haven't addressed (Impact). I'm asking you to be real with me about what's actually happening (Request)."

OPENING LINES THAT WORK:
"There's something I've been wanting to bring up. Can I share it with you?"
"I'm going to say something because I care about you — not to criticize you."
"I noticed something and I'd rather say it than pretend I didn't."

WHEN HE GETS DEFENSIVE:
Lower your energy. Slow your pace.
"I hear you. I'm not attacking you."
"You don't have to agree — I just wanted to say it because I'm in your corner."

WHEN TO NAME AN EMOTION:
"I sense some frustration right now — is that fair?"
"It seems like this topic is heavy. We don't have to resolve it today."

WHEN YOU DO NOT KNOW WHAT TO SAY:
"I'm not sure what the right words are. But I'm sitting here with you and I'm not going anywhere."

TOPICS THAT OFTEN NEED DIRECT CONVERSATION:
- Consistent no-show or disengagement
- A choice he is making that has serious consequences
- Something he shared that you are concerned about
- Conflict between the two of you
- Changes in his behavior or mood

AFTER THE CONVERSATION:
Follow up in your next session. "Last time we talked about something heavy — how are you sitting with that?"
Do not pretend the conversation did not happen.
$content$,
  'mentor',
  1
),
(
  'Giving Feedback Script Templates',
  'Ready-to-use language for delivering honest, constructive feedback that lands well.',
  'template',
  'Communication',
  $content$
FEEDBACK SCRIPT TEMPLATES

Use these as starting points — adapt to your own voice and your relationship.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NAMING A PATTERN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"I've noticed something over our last few sessions and I want to share it — not to call you out, but because I think it matters."

"I see a pattern that I think might be keeping you stuck. Can I share what I'm observing?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AFFIRMING BEFORE CHALLENGING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"You've shown real growth in [area]. The thing I want to push you on is [specific behavior]."

"I see someone with serious potential in front of me. What I'm going to challenge is the story you're telling yourself about [topic]."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHEN HE MADE A BAD CHOICE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"I'm not going to lecture you — you already know what happened. What I want to talk about is what it tells you about yourself and what comes next."

"I'm not here to judge what happened. I am here to help you figure out how to handle what comes next with your integrity intact."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHEN HE NEEDS TO BE CHALLENGED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"I'm going to push back on that a little. Can I share a different perspective?"

"What you're saying makes sense from one angle. Let me offer another angle and you tell me what you think."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AFTER THE FEEDBACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"How does that land for you? I want to know what your honest reaction is."

"You don't have to respond right now. Think about it and we can come back to it."

"I love you enough to tell you the truth. That's not going to change."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHEN HE PUSHES BACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"You might be right. Tell me more about how you see it."

"I hear you. I'm not trying to be right — I'm trying to understand."

"Alright, I hear the pushback. I'm going to let that sit with both of us."
$content$,
  'mentor',
  2
);

-- =====================
-- SEED: WORKSHOPS
-- =====================

INSERT INTO toolkit_resources (title, description, type, category, content, target_role, display_order)
VALUES
(
  'Goal Setting Workshop Guide',
  'A complete facilitator guide for running a 60-minute goal-setting workshop with mentees.',
  'guide',
  'Workshops',
  $content$
GOAL SETTING WORKSHOP — FACILITATOR GUIDE
Recommended group size: 5-15   Time: 60 minutes   Materials: Paper, pens, whiteboard

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OPENING (10 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Icebreaker: "Name one thing you want to accomplish before this school year ends."
Go around the room — no judgment, just listening.

Framing statement:
"Today we're going to get specific about what you actually want — not what someone else wants for you. By the end, you'll walk out with a real goal and a real plan."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 1: THE VISION (15 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Exercise: "The Letter"
Have each participant write a letter from their future self — five years from now — describing their life. Where do they live? What do they do? Who are they with? Who have they become?

Give them 8-10 minutes to write in silence.

Debrief questions:
- "Who wants to share something from their letter?"
- "What surprised you about what you wrote?"
- "What has to be true in the next year for that future to be possible?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 2: SMART GOALS (15 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write on the whiteboard: S-M-A-R-T
Walk through each letter with a real example.

Vague goal: "Get better grades"
SMART version: "Raise my math grade from a D to a C by the end of the semester by studying for 30 minutes every Tuesday and Thursday."

Have each participant write ONE SMART goal based on their letter.
Pairs: share your goal with one other person. Give each other one piece of honest feedback.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 3: THE FIRST STEP (10 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"A goal without a first step is a wish."

Each person writes:
1. Their SMART goal
2. The ONE thing they will do in the next 7 days to move toward it
3. Who will they tell? (accountability partner)

Go around the room — each person shares their first step out loud.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLOSING (10 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Collect goal cards — keep them for a follow-up session.
Appreciation circle: each person names one person in the room and says one genuine thing they noticed about them today.

Close with: "The goal is not the point. Who you become pursuing the goal is the point."
$content$,
  'mentor',
  1
),
(
  'Identity & Values Workshop',
  'A 45-minute workshop to help young men articulate who they are and what they stand for.',
  'activity',
  'Workshops',
  $content$
IDENTITY & VALUES WORKSHOP
Recommended: 5-15 participants   Time: 45 minutes   Materials: Paper, pens

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OPENING (5 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Opening question: "If I asked 10 people who know you well to describe you in 3 words, what would they say? What do you WISH they would say?"

Framing: "Today we are going to get specific about who you are and what you value — not who someone else wants you to be."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACTIVITY 1: YOUR VALUES (15 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Provide a list of 30 values on paper (examples below). Each person circles 10, then narrows to 5, then to their TOP 3.

Sample values: Loyalty, Honesty, Courage, Family, Faith, Ambition, Freedom, Respect, Humor, Justice, Creativity, Discipline, Compassion, Growth, Excellence, Service, Adventure, Integrity, Success, Peace

Debrief:
- "Share your top 3 and tell us why each one matters to you."
- "Have you ever had to choose between two of your values? What happened?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACTIVITY 2: THE PRESSURE TEST (15 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Present 3-4 scenarios (adapt to your group):

Scenario A: Your boys are pressuring you to jump someone. Your value is loyalty to your friends but also justice. What do you do?

Scenario B: You find out a close friend is cheating on his girlfriend who is also your friend. Your values include loyalty AND honesty. What do you do?

Scenario C: You get offered a job paying double your current one, but it requires you to compromise your integrity. Your values include success AND integrity. What do you do?

Discuss: What does it actually look like to live by your values when it costs you something?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLOSING (10 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Each person writes their personal "values statement" — 2-3 sentences describing who they are and what they stand for.

Volunteers share.

Close: "Character is not what you say you believe — it's what you do when it costs you something. Today you took a step toward knowing what you stand for."
$content$,
  'mentor',
  2
);

-- =====================
-- SEED: RESOURCES
-- =====================

INSERT INTO toolkit_resources (title, description, type, category, content, target_role, display_order)
VALUES
(
  'Recommended Books for Mentors',
  'A curated reading list to deepen your skills and perspective as a mentor.',
  'guide',
  'Resources',
  $content$
RECOMMENDED READING FOR MENTORS

These books will sharpen your skills, expand your perspective, and feed your own growth as a man and a mentor.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ON MENTORING & YOUTH DEVELOPMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"Raising a Modern-Day Knight" — Robert Lewis
A framework for intentionally guiding boys into manhood through rites of passage and clear standards of character.

"The Mentor Leader" — Tony Dungy
Former NFL coach Tony Dungy on what it means to lead and develop people through genuine investment, not just authority.

"Scarcity Brain" — Michael Easter
Understanding the psychology of scarcity and impulsive behavior — essential for understanding many of the environments your mentees grow up in.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ON COMMUNICATION & COACHING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"Crucial Conversations" — Patterson, Grenny, McMillan
How to talk about what matters most when the stakes are high and emotions run strong. Essential for mentors.

"The Coaching Habit" — Michael Bungay Stanier
Seven simple coaching questions that make you dramatically more effective. Fast read, high impact.

"Never Split the Difference" — Chris Voss
FBI hostage negotiator teaches active listening and empathy-based communication. Highly applicable to mentoring hard conversations.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ON UNDERSTANDING YOUNG MEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"Boys Adrift" — Leonard Sax
A research-based look at why so many young men are struggling and what environments and relationships can reverse that trajectory.

"The Myth of the Strong Black Man" — Derrick Aldridge
Examines the cultural narratives around Black masculinity and how they shape identity development.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ON PERSONAL GROWTH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"Man's Search for Meaning" — Viktor Frankl
A foundational text on purpose, suffering, and what it means to live well. Worth reading before you try to guide anyone else.

"Atomic Habits" — James Clear
The science of building good habits and breaking bad ones. Directly applicable to the habits and goal conversations you will have with your mentee.

"The Body Keeps the Score" — Bessel van der Kolk
Understanding trauma and how it lives in the body. Important context for mentors working with youth who have experienced adversity.
$content$,
  'mentor',
  1
),
(
  'Crisis Resources Reference Card',
  'Key phone numbers and resources to have ready when your mentee needs immediate help.',
  'guide',
  'Resources',
  $content$
CRISIS RESOURCES — KEEP THIS ACCESSIBLE

If your mentee is in immediate danger, call 911.
For all other concerns, contact your program coordinator first.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MENTAL HEALTH & SUICIDE PREVENTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
988 Suicide & Crisis Lifeline
Call or text: 988 (24/7)
Chat: 988lifeline.org
For: anyone in emotional distress or suicidal crisis

Crisis Text Line
Text HOME to 741741 (24/7)
For: teens and young adults who prefer texting

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ABUSE & SAFETY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Childhelp National Child Abuse Hotline
1-800-422-4453 (24/7)
For: reporting or getting help with child abuse situations

Domestic Violence Hotline
1-800-799-7233 | Text START to 88788
For: mentees experiencing domestic violence at home

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUBSTANCE USE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SAMHSA National Helpline
1-800-662-4357 (24/7, free, confidential)
For: referral to local treatment facilities and support groups

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HOUSING & BASIC NEEDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
211
Call or text: 211
For: local food banks, shelters, utilities assistance, and social services

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR PROGRAM CONTACTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Program Coordinator: _____________________
Phone: ___________________________________
Email: ___________________________________
Emergency contact: _______________________

Note: When in doubt, call your program coordinator. That is what they are there for.
$content$,
  'mentor',
  2
);
