-- Add three new mentor training tracks with full module content
-- Tracks: Communication Skills, Working with Teen Boys, Career & Life Coaching

-- =====================
-- TRACK 3: COMMUNICATION SKILLS
-- =====================

INSERT INTO training_tracks (id, title, description, display_order, target_role, created_at)
VALUES (
  '11111111-0000-0000-0000-000000000003',
  'Communication Skills',
  'Master the art of meaningful conversation. Learn to ask great questions, give feedback that lands, and navigate hard topics with confidence.',
  3,
  'mentor',
  NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO training_modules (id, track_id, title, content, display_order, duration_mins, created_at)
VALUES
(
  '22222222-0000-0000-0000-000000000010',
  '11111111-0000-0000-0000-000000000003',
  'The Art of Asking Great Questions',
  $content$
THE ART OF ASKING GREAT QUESTIONS

The quality of your questions determines the quality of your conversations. Great questions open doors — to self-reflection, honest sharing, and real growth. Bad questions close them.

WHY QUESTIONS MATTER MORE THAN ADVICE:
When you give advice, your mentee either takes it or does not. When you ask a great question, he has to think — and the insight he reaches himself is far more powerful than any you could hand him. Your job is less about giving answers and more about asking the right questions.

THE SPECTRUM OF QUESTIONS:

CLOSED QUESTIONS (use sparingly)
- Can be answered with yes/no or one word
- "Did you go to school today?" "Are you okay?"
- Useful for quick check-ins but rarely create depth

OPEN-ENDED QUESTIONS (your primary tool)
- Require thought and explanation
- "What was going through your mind when that happened?"
- "How did you decide to handle it that way?"
- Start with: What, How, Tell me about, Walk me through, Help me understand

REFLECTIVE QUESTIONS (go deeper)
- Invite self-examination
- "What do you think that situation was trying to teach you?"
- "If you could go back, what would you do differently — and why?"
- "What does that say about what you value?"

FUTURE-FOCUSED QUESTIONS (build agency)
- Move from problem to possibility
- "What would need to be true for this to get better?"
- "What is one step you could take this week?"
- "Who do you want to be on the other side of this?"

THE FOLLOW-UP QUESTION:
The most underused tool in mentoring is the follow-up. After he answers, go one level deeper:
"Say more about that."
"What do you mean when you say...?"
"That's interesting — why do you think that is?"

QUESTIONS TO AVOID:
- "Why did you do that?" — often feels like an accusation
- Leading questions: "Wouldn't it have been better if you...?"
- Multiple questions at once — pick one and wait for the answer

THE PAUSE:
After you ask a question, be quiet. Count to five in your head if needed. Many mentors jump in too quickly and rescue their mentee from the discomfort of thinking. The silence is where the real work happens.

YOUR QUESTION TOOLKIT — KEEP THESE IN YOUR BACK POCKET:
- "What's been the best part of your week? The hardest?"
- "What are you most proud of lately?"
- "What's something you've been thinking about a lot?"
- "If I asked the people who know you best to describe you, what would they say?"
- "What do you want your life to look like in five years?"

REFLECTION QUESTIONS:
- What type of question do you most naturally ask — closed, open, or reflective?
- In your last session, what was the deepest question you asked? What was the response?
$content$,
  1, 20, NOW()
),
(
  '22222222-0000-0000-0000-000000000011',
  '11111111-0000-0000-0000-000000000003',
  'Reading Non-Verbal Cues',
  $content$
READING NON-VERBAL CUES

Research consistently shows that the majority of human communication is non-verbal. What your mentee does not say may tell you more than what he does. Learning to read the room makes you a far more responsive mentor.

WHAT NON-VERBAL COMMUNICATION INCLUDES:
- Facial expressions
- Body language and posture
- Eye contact (or lack of it)
- Tone, pace, and volume of voice
- Physical distance and movement
- Sighs, pauses, and fidgeting

COMMON SIGNALS AND WHAT THEY OFTEN MEAN:

CLOSED BODY LANGUAGE (protective, uncomfortable)
- Crossed arms or legs
- Slouching away from you
- Looking at the floor or phone
- Short, clipped answers even to open questions
What to do: Ease the pressure. Move to lighter topics or a side-by-side activity. Do not force the conversation.

ANXIOUS SIGNALS
- Fidgeting, leg bouncing, picking at fingernails
- Rapid speech or rambling
- Looking around the room
What to do: Slow the pace. Lower your own voice. "Take your time — there's no rush."

DISENGAGEMENT
- One-word answers while physically present
- Checking phone repeatedly
- Monotone responses
What to do: Name it gently. "You seem a little somewhere else today. Everything good?" Give him permission to not be in the mood.

EMOTIONAL SUPPRESSION (holding something back)
- Long pauses before answering
- Voice change or cracking
- Looking away when discussing a topic
- Over-casual dismissal of something clearly heavy ("It's fine. Whatever.")
What to do: Stay with it. "That pause tells me there might be more there. I've got time."

YOUR OWN NON-VERBAL COMMUNICATION:
Your mentee is reading you too.
- Leaning forward signals interest
- Nodding signals understanding
- Open posture (uncrossed, relaxed) signals safety
- Eye contact signals you are fully present
- Putting your phone face-down signals he is the priority

THE PRINCIPLE OF CONGRUENCE:
When a person's words and body language do not match, believe the body language. "I'm fine" said while staring at the floor is not fine.

NAMING WHAT YOU SEE:
When you notice a signal, you can reflect it without interrogating:
"I notice you've been pretty quiet today — no pressure, but I'm here if something's going on."
"You lit up when you talked about that. Tell me more."

CULTURAL AWARENESS:
Non-verbal norms vary by culture, family, and personality. What looks like disrespect in one context (avoiding eye contact) may be a sign of respect in another. Learn your mentee's baseline before drawing conclusions.

REFLECTION QUESTIONS:
- What is your mentee's baseline non-verbal style — naturally quiet and reserved, or expressive?
- Think of a recent session. Were there any moments where his body language told a different story than his words?
$content$,
  2, 15, NOW()
),
(
  '22222222-0000-0000-0000-000000000012',
  '11111111-0000-0000-0000-000000000003',
  'Giving Constructive Feedback',
  $content$
GIVING CONSTRUCTIVE FEEDBACK

One of the most valuable things you can do for a young man is tell him the truth — with love. Feedback done well builds confidence, shapes character, and strengthens the relationship. Feedback done poorly shuts him down and creates distance.

THE FOUNDATION: RELATIONSHIP BEFORE FEEDBACK
You cannot effectively challenge someone who does not trust you. The investment you have made in building trust is what gives you the right to speak into his life. Without that foundation, even gentle feedback lands as criticism.

THE GOAL OF FEEDBACK:
Feedback is not about making him feel bad or proving a point. It is about helping him see something clearly that he cannot see on his own — and giving him a path forward.

THE SBI MODEL (Situation-Behavior-Impact):
Effective feedback is specific and observable, not general and character-based.

SITUATION: Describe the specific context
"In our last session, when you were talking about the argument with your coach..."

BEHAVIOR: Describe the specific action (not the person)
"...you kept saying 'I don't care' and changed the subject every time I asked about it."

IMPACT: Share the effect — on you, on others, or on his goals
"I noticed that pattern and wondered if avoiding it might be keeping you stuck."

This is far more effective than: "You always shut down when things get hard."

THE FEEDBACK SANDWICH (use with care):
Positive → Constructive → Positive
This approach works for minor feedback but can feel formulaic. For significant feedback, go direct but warm — do not bury the truth in compliments.

TIMING AND SETTING MATTER:
- Never give significant feedback in the first 15 minutes of a session
- Do not give challenging feedback right before your time is up
- Make sure he is in a relatively calm, receptive state
- One piece of meaningful feedback per session is usually enough

FRAMING THAT WORKS:
"Can I share something I've been noticing? You can push back if I've got it wrong."
"I say this because I see potential in you that I don't think you see in yourself."
"This might be hard to hear, and I'm saying it because I'm in your corner."

AFTER THE FEEDBACK:
- Leave space for his response — do not rush to reassure or backtrack
- Ask: "How does that land for you?" or "What do you think about that?"
- If he gets defensive, do not argue. Plant the seed and let it grow.

AFFIRM THE PERSON, CHALLENGE THE BEHAVIOR:
Separate who he is from what he does. "You are someone with real leadership ability. What I am challenging is the pattern of backing away from that when it gets uncomfortable."

REFLECTION QUESTIONS:
- Is there something you have been wanting to say to your mentee but have held back? What is it, and what is stopping you?
- When someone gave you honest feedback that changed you, how did they deliver it?
$content$,
  3, 25, NOW()
),
(
  '22222222-0000-0000-0000-000000000013',
  '11111111-0000-0000-0000-000000000003',
  'Having Hard Conversations',
  $content$
HAVING HARD CONVERSATIONS

Avoiding difficult topics is the easy path — and the least helpful one. The willingness to have hard conversations, done with care and skill, is what distinguishes a mentor who changes lives from one who just shows up.

WHAT COUNTS AS A HARD CONVERSATION:
- Calling out a behavior or pattern that is holding him back
- Addressing a choice that could have serious consequences
- Responding when he shares something heavy or painful
- Delivering news or feedback he will not want to hear
- Bringing up something you have been avoiding

THE COST OF AVOIDANCE:
When mentors dodge hard topics, mentees notice. It signals that those topics are too big, too dangerous, or that you are not really safe. It also lets harmful patterns persist. The discomfort of having the conversation is almost always less than the cost of not having it.

PREPARATION:
Before a hard conversation, get clear on:
1. What specifically needs to be said
2. Why it matters to you (connect it to caring about him)
3. What response you hope for — and what responses you will accept
4. What you are not trying to do (shame, lecture, fix)

OPENING THE CONVERSATION:
Give him a soft on-ramp:
"There's something I've been wanting to talk to you about. I'm bringing it up because I care about you, not to put you on the spot."
"I noticed something and I'd rather say something than stay quiet and pretend I didn't."

STAY CURIOUS, NOT CONCLUSORY:
Share what you observed, then ask what is going on:
"I've noticed you've missed our last two sessions and your messages have been short. I'm not assuming I know what's happening — but I want to understand."
This invites rather than accuses.

WHEN HE GETS DEFENSIVE:
Defensiveness is a normal response to discomfort. Do not match it.
Lower your voice. Slow your pace.
"I hear you. I'm not attacking you."
"You don't have to agree with me right now. I just wanted to say it."
Let the silence breathe. Do not rush to smooth it over.

WHEN HE SHUTS DOWN COMPLETELY:
"That's okay. We don't have to resolve this today. But I'm not going to pretend I didn't notice, because you matter to me."
Give it time. Come back to it gently in the next session.

WHAT TO DO WHEN YOU DO NOT KNOW WHAT TO SAY:
You do not need to have the perfect words. Sometimes the most powerful thing is:
"I don't know exactly what to say right now. But I'm sitting here with you, and I'm not going anywhere."

AFTER THE CONVERSATION:
Check in with yourself — hard conversations take something out of you. Talk to your program coordinator if you processed something heavy. Take care of yourself so you can keep showing up.

REFLECTION QUESTIONS:
- Is there a hard conversation with your mentee that you have been postponing? What would it take to have it in your next session?
- Think of someone who had a hard conversation with you that you are now grateful for. What did they do that made it land?
$content$,
  4, 30, NOW()
)
ON CONFLICT (id) DO NOTHING;

-- =====================
-- TRACK 4: WORKING WITH TEEN BOYS
-- =====================

INSERT INTO training_tracks (id, title, description, display_order, target_role, created_at)
VALUES (
  '11111111-0000-0000-0000-000000000004',
  'Working with Teen Boys',
  'Understand the world of adolescent boys — how they think, what they need, and how to meet them where they are. Practical strategies for building real connection.',
  4,
  'mentor',
  NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO training_modules (id, track_id, title, content, display_order, duration_mins, created_at)
VALUES
(
  '22222222-0000-0000-0000-000000000014',
  '11111111-0000-0000-0000-000000000004',
  'Understanding Adolescent Development',
  $content$
UNDERSTANDING ADOLESCENT DEVELOPMENT

To mentor a teenage boy well, you need to understand what is actually happening inside him — developmentally, neurologically, and emotionally. This is not an excuse for poor behavior; it is a framework for interpreting it correctly and responding more effectively.

THE ADOLESCENT BRAIN:
The prefrontal cortex — the part of the brain responsible for planning, impulse control, long-term thinking, and weighing consequences — is not fully developed until the mid-20s. For a 14-year-old, it is actively under construction.

What this means practically:
- He will sometimes act before thinking
- He will sometimes choose short-term pleasure over long-term benefit
- He will sometimes struggle to connect today's choices to future outcomes
- He is not broken — he is developing

Your steady, long-term perspective is literally what his brain does not yet have. That is part of why you matter.

THE PRIMARY DEVELOPMENTAL TASKS OF ADOLESCENCE:
1. IDENTITY FORMATION — "Who am I?" He is trying on different versions of himself. This is normal. Support exploration without demanding he settle into one fixed identity prematurely.

2. AUTONOMY — "Can I stand on my own?" He is pulling away from adult authority — including yours at times. This is healthy. Your goal is to give him increasing responsibility and trust, not to tighten control.

3. PEER BELONGING — "Do I fit?" Peer acceptance is neurologically rewarding in adolescence in a way that goes beyond what adults experience. His peer group will have enormous influence. Get to know who he runs with.

4. COMPETENCE — "Am I good at anything?" He needs experiences of mastery and success. Help him identify and develop his strengths.

THE EMOTIONAL LANDSCAPE:
Teen boys often experience intense emotions but have fewer tools to process or express them. They have frequently been socialized to suppress emotions ("Man up," "Stop crying"). The result is often:
- Anger as the socially acceptable emotion (masking sadness, fear, or shame)
- Withdrawal when overwhelmed
- Deflection through humor when something hurts

Your role: Create the space for the full emotional range. Name emotions yourself. Normalize talking about what is hard.

THE INFLUENCE OF HOME ENVIRONMENT:
What happens at home shapes everything. A teen dealing with an absent father, domestic conflict, food insecurity, or an incarcerated family member is carrying that weight into every interaction — including your sessions. Ask, with care, about his home life. The picture will help you understand the boy.

WHAT TEEN BOYS NEED MOST FROM A MENTOR:
1. Consistency — show up, repeatedly, no matter what
2. Someone who sees potential in them they cannot yet see in themselves
3. A male model of healthy emotion, decision-making, and character
4. Genuine interest — in their actual life, not a version you hope they will become

REFLECTION QUESTIONS:
- Think about yourself at your mentee's age. What were you most desperate for that you did not get?
- How does understanding adolescent brain development change how you interpret your mentee's behavior?
$content$,
  1, 20, NOW()
),
(
  '22222222-0000-0000-0000-000000000015',
  '11111111-0000-0000-0000-000000000004',
  'Building Resilience and Confidence',
  $content$
BUILDING RESILIENCE AND CONFIDENCE

Resilience — the ability to recover from setbacks — and confidence — the belief that you are capable — are not traits a young man either has or does not have. They are skills that are built through experience, and you play a direct role in building them.

WHAT RESILIENCE IS NOT:
Resilience is not the absence of struggle or pain. It is not pretending things do not hurt. It is not "getting over it." True resilience is the capacity to go through hard things and come out the other side — intact, and often stronger.

HOW RESILIENCE IS BUILT:
1. Experiencing manageable difficulty — not catastrophic failure, but real challenge with support
2. Having someone who believes in them while they struggle
3. Developing a narrative: "I have gotten through hard things before. I can do it again."
4. Building a toolkit of coping strategies

YOUR ROLE IN RESILIENCE-BUILDING:
You cannot protect your mentee from difficulty — nor should you. What you can do is:
- Stay present through the hard times without trying to fix everything
- Remind him of times he has already overcome something hard
- Help him build his "I've been through worse" file
- Resist the urge to rescue — let him struggle productively

THE CONFIDENCE EQUATION:
Confidence is not built through praise alone. It is built through:
SMALL WINS + RECOGNITION + INCREASED CHALLENGE
When a mentee accomplishes something — even small — name it specifically. "You said you were going to talk to your teacher and you did it. That takes nerve." Then gently raise the bar.

THE DANGER OF EMPTY PRAISE:
"You're so smart" or "You're amazing" without connection to specific effort or action teaches a fixed mindset. It also does not hold up when he fails. Instead: "I saw how hard you worked on that. The result came from what you put in."

HELPING HIM REFRAME FAILURE:
When he fails or falls short:
1. Validate the disappointment first — do not rush past it
2. Ask what he learned, not what went wrong
3. Reframe: "This is data, not a verdict on who you are."
4. Remind him of the next attempt: "What would you do differently?"

THE INTERNAL NARRATIVE:
Pay attention to how your mentee talks about himself. "I'm just dumb." "I never get things right." "Nobody cares about me." These are stories he has been told or has told himself — and they are not fixed. Gently, consistently, over time, you can help him rewrite them.

Not by arguing — by showing him evidence to the contrary. "That's interesting you say that, because what I just watched you do was..."

PHYSICAL CONFIDENCE:
For many teen boys, the body is a site of confidence or shame. Ask about physical activities he enjoys. Sports, fitness, cooking, building things — embodied competence transfers to broader self-belief.

REFLECTION QUESTIONS:
- What experience in your own life most built your resilience? Was there a person who made a difference during it?
- What is the core negative story your mentee tells about himself? What evidence could you bring to challenge it?
$content$,
  2, 25, NOW()
),
(
  '22222222-0000-0000-0000-000000000016',
  '11111111-0000-0000-0000-000000000004',
  'Navigating Peer Pressure',
  $content$
NAVIGATING PEER PRESSURE

For a teenage boy, peer acceptance is not just socially important — it is neurologically powerful. Understanding this helps you support your mentee without dismissing the very real pull of his social world.

WHY PEER PRESSURE IS SO POWERFUL AT THIS AGE:
The adolescent brain is wired to prioritize social connection and belonging. Being excluded or rejected activates the same pain pathways as physical injury. This means that for your mentee, the risk of social rejection may genuinely feel more threatening than the risk of getting in trouble.

You cannot simply tell him to "just say no" and expect it to work. You have to help him build the capacity and the language to navigate it.

TYPES OF PEER PRESSURE:
1. DIRECT — Being explicitly asked or pushed to do something
2. INDIRECT — Pressure through social norms ("everyone does it")
3. INTERNALIZED — Self-pressure to conform even without being asked

THE REAL QUESTION IS IDENTITY:
When a young man is clear on who he is and what he stands for, peer pressure loses much of its grip. Your long-term investment in his identity and values is the most powerful anti-pressure tool you have.

HELPING HIM THINK THROUGH HIS SOCIAL WORLD:
Ask, without judgment:
- "Who do you spend the most time with?"
- "What is the vibe of your friend group like?"
- "Do you ever feel like you have to act different around certain people?"
- "Has anyone ever pressured you to do something you didn't want to do?"

ROLE-PLAYING RESPONSE STRATEGIES:
Practice with him how to respond in pressure situations. This removes the in-the-moment freeze.

Honest exit lines:
- "Nah, that's not my thing."
- "I'm good — I don't want the drama."
- "I've got something I need to handle." (no explanation required)

The goal is not to make him confrontational but to give him scripts that work for his personality.

THE FRIEND EVALUATION CONVERSATION:
Help him think critically about his relationships without shaming his friends:
- "Does being around them make you want to be better — or make it easier to be worse?"
- "Do they have your back, or just when it is convenient?"
- "Who are you when you are with them?"

WHEN HIS PEER GROUP IS GENUINELY RISKY:
Be honest with him, not accusatory. "I'm not going to pretend I'm not concerned about some of the situations you've described. I'm not telling you who to be friends with — but I am going to ask you to be careful."

Then stay close. Do not distance yourself because you disapprove of his circle. Your consistent presence is more influential than any friend group over time.

BUILDING HIS SOCIAL CONFIDENCE:
Some mentees cave to peer pressure because they do not feel secure enough to stand alone. Help him build friendships and community that support his growth — including through the program's groups and community.

REFLECTION QUESTIONS:
- At your mentee's age, what peer pressures were hardest for you to navigate?
- Is there a situation your mentee is currently facing where peer pressure is a factor?
$content$,
  3, 20, NOW()
),
(
  '22222222-0000-0000-0000-000000000017',
  '11111111-0000-0000-0000-000000000004',
  'Supporting Academic Success',
  $content$
SUPPORTING ACADEMIC SUCCESS

School is one of the primary arenas of your mentee's life, and academic performance has real consequences for his future opportunities. You do not need to be a tutor — you need to be a consistent, engaged presence who takes his education seriously alongside him.

YOUR ROLE IS MOTIVATIONAL, NOT INSTRUCTIONAL:
You are not his teacher. Your job is not to explain algebra. It is to:
- Hold the long-term vision when he cannot see it
- Connect the dots between school performance and his actual goals
- Help him develop the habits and mindset that make academic success possible
- Address the emotional and environmental barriers that get in the way

ASK ABOUT SCHOOL — EVERY SESSION:
Make it a regular check-in:
- "What's going on in school right now — what's good, what's hard?"
- "Any tests or projects coming up?"
- "Is there a class or teacher that's really frustrating you right now?"

This communicates that you take his education seriously, and that it is a normal part of your relationship.

CONNECTING SCHOOL TO HIS GOALS:
Abstract motivation ("education is important") does not move teenage boys. Concrete connection does.
- "You said you want to work in tech. What do you know about what that path actually requires?"
- "If you want to get into that program, what GPA do you need?"
- "What would it open up for you if your grades went up?"

Let him draw the connection. Your questions guide the thinking.

COMMON ACADEMIC BARRIERS (and how to address them):

LACK OF BELIEF — "I'm not smart enough."
Response: Challenge the fixed mindset. Remind him of evidence to the contrary. Connect effort to outcome.

DISTRACTION AND DISORGANIZATION
Response: Help him get concrete. Where does he do homework? Does he have what he needs? Can you review what is coming up this week together?

CONFLICT WITH A TEACHER
Response: Listen fully first. Then gently help him see the situation from multiple angles. Coach him on how to approach the teacher directly.

DIFFICULT HOME ENVIRONMENT
Response: Some mentees cannot study at home. Problem-solve alternatives — library, after-school programs, staying at school later. Take the practical barriers seriously.

WHEN HE IS STRUGGLING SERIOUSLY:
If grades are dropping significantly or he is on the verge of failing, involve program staff. There may be resources — tutoring, counseling, school intervention — that your coordinator can help access.

CELEBRATE ACADEMIC WINS:
Did he pass a test he was worried about? Turn in an assignment on time? Ask a teacher for help? Celebrate it specifically. Academic confidence is built one small win at a time.

REFLECTION QUESTIONS:
- What is your mentee's current academic situation — and what do you know about the reasons behind it?
- What is one concrete thing you could do in your next session to take his education more seriously together?
$content$,
  4, 20, NOW()
)
ON CONFLICT (id) DO NOTHING;

-- =====================
-- TRACK 5: CAREER & LIFE COACHING
-- =====================

INSERT INTO training_tracks (id, title, description, display_order, target_role, created_at)
VALUES (
  '11111111-0000-0000-0000-000000000005',
  'Career & Life Coaching',
  'Help your mentee build a vision for his future. Practical frameworks for career exploration, financial literacy, college planning, and the life skills every young man needs.',
  5,
  'mentor',
  NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO training_modules (id, track_id, title, content, display_order, duration_mins, created_at)
VALUES
(
  '22222222-0000-0000-0000-000000000018',
  '11111111-0000-0000-0000-000000000005',
  'Career Exploration Conversations',
  $content$
CAREER EXPLORATION CONVERSATIONS

One of the most powerful gifts you can give a young man is a vision for his future. Many mentees have never had an adult sit down and seriously explore what their life could look like — not just survival, but aspiration. That conversation starts with you.

YOUR ROLE:
You are not a career counselor. You are an explorer and connector. Your job is to help him discover what he is drawn to, expose him to possibilities he may not know exist, and connect him to the people and experiences that open doors.

START WITH STRENGTHS AND INTERESTS, NOT JOBS:
Before naming careers, get curious about who he is:
- "What are you naturally good at — what comes easy to you that seems hard for others?"
- "What could you spend hours doing without getting bored?"
- "When you've felt most alive or most yourself, what were you doing?"
- "What problems in the world bother you most? What would you like to fix?"

From these answers, you can begin to draw connections to possible paths.

EXPAND HIS HORIZON:
Many young men grow up with a narrow picture of what is possible — often limited to the careers they have seen represented in their immediate community. Your job is to expand the map.
- Share your own career path (including the unexpected twists)
- Introduce him to other professionals in your network
- Talk about industries and careers he may not have considered
- Ask program staff about job shadowing or exposure opportunities

THE DIFFERENCE BETWEEN A JOB AND A CAREER AND A CALLING:
Help him understand these distinctions over time:
- A job is what you do to make money
- A career is a long-term professional path you build
- A calling is work that connects to your deepest values and sense of purpose

Not everyone finds their calling at 16 — but planting the question early matters.

RESEARCHING TOGETHER:
You do not have to have all the answers. Research together:
- "Let's look at what a day in the life of a software engineer actually looks like."
- "What does it take to become a physical therapist? Let's find out."
- "What are trades that pay well that most people don't know about?"

INTERNSHIPS, SHADOWING, AND VOLUNTEERING:
Real exposure is irreplaceable. Help him get some:
- Connect him with someone in a field he is curious about for a conversation
- Encourage summer programs, volunteer work, or part-time jobs
- Celebrate any work experience he gets — even entry-level

SHORT-TERM WORK ETHIC CONVERSATIONS:
If he has a job now (part-time, seasonal), take it seriously with him. Talk about showing up on time, how to handle a difficult coworker, how to ask for a raise. These early work experiences shape his professional identity.

REFLECTION QUESTIONS:
- What career paths have you exposed your mentee to beyond what he already knew?
- What is one person in your network who could have a 20-minute conversation with your mentee about their work?
$content$,
  1, 25, NOW()
),
(
  '22222222-0000-0000-0000-000000000019',
  '11111111-0000-0000-0000-000000000005',
  'Financial Literacy Basics to Teach',
  $content$
FINANCIAL LITERACY BASICS TO TEACH

Financial ignorance is one of the most consistent predictors of hardship in early adulthood. Most young men leave high school without ever having a real conversation about money — how it works, how to build it, and how to avoid the traps that derail people. You can change that.

WHY THIS IS YOUR LANE:
You do not need to be a financial advisor. You need to be willing to have honest money conversations that most adults avoided with you. The concepts are accessible. The impact of teaching them early is enormous.

THE CORE CONCEPTS — COVER THESE OVER TIME:

1. HOW INCOME ACTUALLY WORKS
- Gross vs net pay (taxes come out before you see it)
- W-2 employees vs self-employed / 1099
- The value of negotiating your starting salary

2. BUDGETING: THE 50/30/20 RULE
- 50% needs (rent, food, transportation)
- 30% wants (entertainment, clothes, eating out)
- 20% savings and debt payoff
Help him build a simple budget — even on paper — for what he earns now.

3. BANKING BASICS
- Checking vs savings accounts
- How interest works (for savings and for debt)
- Credit unions vs big banks
- Direct deposit and building banking history

4. CREDIT
- What a credit score is and why it matters
- How to build credit responsibly (secured card, becoming an authorized user)
- The danger of credit card debt and minimum payments
- How bad credit follows you (housing, car loans, sometimes employment)

5. DEBT TRAPS
- Payday loans — explain the trap clearly
- High-interest auto financing
- Buy now, pay later schemes
The people selling these products are not on his side. He needs to know this.

6. SAVING AND INVESTING — THE BASICS
- Emergency fund: 3-6 months of expenses
- Compound interest: "money making money" — show him the math
- 401k and employer match (free money)
- Roth IRA basics for young earners
Even saving $50/month starting at 16 is worth teaching.

7. THE WEALTH GAP IS REAL — AND CLOSEABLE
Be honest with him about systemic barriers. Also be honest about what is within his control. Both are true. Financial literacy is one of the most powerful equalizers available to him.

MAKING IT REAL:
Use his actual life as the classroom. If he just got a job — do the math with him. If he wants something expensive — work through how long it would take to save for it. Real numbers are more powerful than abstract concepts.

RESOURCES:
- Recommend books: "The Automatic Millionaire" (Bach), "I Will Teach You To Be Rich" (Sethi)
- YouTube channels and podcasts on personal finance for young adults
- Free budgeting apps: YNAB, Mint, EveryDollar

REFLECTION QUESTIONS:
- What financial knowledge do you wish someone had given you at your mentee's age?
- Has money ever come up in your conversations with your mentee? What is his current relationship with money?
$content$,
  2, 20, NOW()
),
(
  '22222222-0000-0000-0000-000000000020',
  '11111111-0000-0000-0000-000000000005',
  'College and Trade School Guidance',
  $content$
COLLEGE AND TRADE SCHOOL GUIDANCE

The path after high school is one of the most consequential decisions a young man makes — and one that many make with very little real information. Your role is to help your mentee make an informed, intentional choice that fits who he is and where he wants to go.

FIRST: EXPAND THE OPTIONS
Too many conversations default to "are you going to college?" as if it is the only path. There are several legitimate paths, and the right one depends on the person.

THE MAIN PATHWAYS:
1. FOUR-YEAR COLLEGE/UNIVERSITY
Best for: careers requiring a degree, students who thrive in academic environments, those with clear professional goals that require it
Reality check: Average student loan debt is over $30,000. This investment needs to be intentional.

2. COMMUNITY COLLEGE (2-YEAR)
Best for: students who want to explore, need to save money, or plan to transfer to a 4-year school
Often overlooked and underrated. Lower cost, more flexible, real credentials.

3. TRADE / VOCATIONAL SCHOOL
Best for: students drawn to skilled trades — electrician, plumber, HVAC, welding, automotive, construction
Reality: Electricians and plumbers often out-earn college graduates with significant debt. These are respected, in-demand careers.

4. MILITARY
Best for: students seeking structure, discipline, career training, education benefits, and a path to service
Includes access to the GI Bill for education after service.

5. ENTREPRENEURSHIP / DIRECT ENTRY
Best for: motivated, self-directed individuals with a specific business idea or skill
Highest risk, highest potential ceiling. Requires strong mentorship and real skills.

IF HE IS GOING TO COLLEGE — PRACTICAL GUIDANCE:

CHOOSING A SCHOOL:
- Start with the question: what do you want to study?
- Research graduation rates and job placement for his intended major
- Consider cost: what scholarships are available? What would debt look like?
- Visit if possible — does he feel like he belongs there?

THE APPLICATION PROCESS:
- Common App vs school-specific apps
- Personal statement: help him find and tell his story
- Letters of recommendation: who can speak to his character and potential?
- Deadlines: early decision (binding), early action, regular decision

FINANCIAL AID:
- FAFSA: submit as early as possible (opens October 1)
- Scholarships: local, national, program-specific — apply for many
- Grants vs loans: grants do not need to be repaid
- Help him understand what he would actually owe

IF HE IS CHOOSING TRADES:
- Research programs in your area
- Apprenticeship programs are often paid while training
- Unions offer benefits and job security
- Licensing requirements by state
- Connect him with a professional in the trade if possible

THE CONVERSATION ABOUT DEBT:
Be honest. Borrowing $80,000 for a degree with poor job prospects is not automatically the right choice. Help him run the numbers. What would monthly payments look like? What salary would he need to make those payments manageable?

REFLECTION QUESTIONS:
- What does your mentee currently think about his path after high school?
- Are there assumptions he is making (or avoiding) that you could help him examine?
$content$,
  3, 25, NOW()
),
(
  '22222222-0000-0000-0000-000000000021',
  '11111111-0000-0000-0000-000000000005',
  'Life Skills for Young Men',
  $content$
LIFE SKILLS FOR YOUNG MEN

The practical skills of adult life — managing a home, cooking a meal, handling a conflict, going to the doctor — are not taught in school and are often not passed down at home. Many young men arrive at adulthood embarrassingly underprepared for the basics. You can fill some of those gaps.

WHY THIS MATTERS:
The absence of basic life skills is a source of real shame for young men. Not knowing how to do these things — or knowing you do not know — erodes confidence and creates dependence. Teaching these skills is an act of respect and liberation.

PRACTICAL LIFE SKILLS TO COVER — pick ones relevant to his stage:

HOUSEHOLD MANAGEMENT
- How to do laundry (sort, wash, dry, fold)
- Basic cleaning: dishes, bathroom, floors
- How to cook 5 simple, healthy meals
- Grocery shopping on a budget
- How to read a lease and understand tenant rights

FINANCIAL ADMIN
- How to file taxes (simple returns using free software)
- How to read a pay stub
- How to open a bank account
- How to build and track a budget

HEALTH AND MEDICAL
- How to find a doctor and schedule an appointment
- Understanding health insurance basics
- When to go to urgent care vs emergency room
- Basic first aid
- Mental health: normalizing therapy and knowing how to access it

COMMUNICATION AND PROFESSIONAL SKILLS
- How to write a professional email
- How to make a phone call (to a doctor, employer, landlord)
- How to shake hands, make eye contact, and introduce yourself
- How to write and format a resume
- How to prepare for and behave in a job interview

CONFLICT RESOLUTION
- How to disagree without destroying the relationship
- The difference between assertive and aggressive
- How to apologize well and mean it
- How to exit a situation before it escalates

TRANSPORTATION AND LOGISTICS
- How to use public transit
- Driver's license process
- Understanding basic car maintenance (oil, tires, fluids)
- How to get and compare insurance quotes

HOME REPAIR BASICS
- How to unclog a drain
- How to change a light bulb and reset a breaker
- Who to call when something breaks and how to not get taken advantage of

HOW TO INTRODUCE THESE SKILLS:
Do not lecture — involve him. Cook together. Walk him through doing his taxes. Role-play a job interview. Make it practical, not performative.

THE FRAMING:
"Part of my job as your mentor is to make sure you're ready for the real world. Let's talk about some of the stuff nobody teaches you."

REFLECTION QUESTIONS:
- Which life skills does your mentee clearly lack that could affect his independence and confidence?
- Is there a practical skill you could teach or practice together in your next session?
$content$,
  4, 20, NOW()
)
ON CONFLICT (id) DO NOTHING;
