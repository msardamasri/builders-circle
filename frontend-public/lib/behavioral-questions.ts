// Pool of behavioral / personality questions used for the optional intro video.
// When a user lands on the video page, 3 of these are randomly drawn.

export const BEHAVIORAL_QUESTIONS: { id: string; text: string; category: string }[] = [
  {
    id: "q01",
    category: "decision-making",
    text: "Walk us through a decision you had to make with incomplete information. How did you decide, and what would you do differently today?",
  },
  {
    id: "q02",
    category: "failure",
    text: "Tell us about a project, business, or initiative that did NOT work out. What did you learn, and how does it shape how you build now?",
  },
  {
    id: "q03",
    category: "conflict",
    text: "Describe a time you strongly disagreed with a peer or boss. How did you handle it, and what was the outcome?",
  },
  {
    id: "q04",
    category: "resilience",
    text: "Tell us about the hardest period in your career so far. What kept you going?",
  },
  {
    id: "q05",
    category: "motivation",
    text: "Why now? Why are you choosing to start a company at this point in your life specifically?",
  },
  {
    id: "q06",
    category: "self-awareness",
    text: "What is the trait of yours that has both helped you the most and hurt you the most? Give a concrete example of each.",
  },
  {
    id: "q07",
    category: "risk",
    text: "Describe the most personally risky decision you've ever taken. What was at stake, and how did it play out?",
  },
  {
    id: "q08",
    category: "co-founder-fit",
    text: "What would make a co-founder partnership a failure for you in 18 months? Be specific.",
  },
  {
    id: "q09",
    category: "ambition",
    text: "What is the most ambitious thing you've ever built or led — at any scale, professional or personal? Walk us through it.",
  },
  {
    id: "q10",
    category: "execution",
    text: "Tell us about a time you shipped something faster than people expected. What enabled that speed?",
  },
  {
    id: "q11",
    category: "leadership",
    text: "Describe a moment where you had to convince someone to believe in something they were skeptical about. How did you do it?",
  },
  {
    id: "q12",
    category: "self-reflection",
    text: "If we asked your last manager (or closest collaborator) what your single biggest blind spot is, what would they say?",
  },
  {
    id: "q13",
    category: "long-term",
    text: "Imagine you are five years into building this company. What does a great day look like for you? What does a hard day look like?",
  },
  {
    id: "q14",
    category: "values",
    text: "Tell us about a time you walked away from money, status, or a great opportunity for a reason that mattered to you.",
  },
  {
    id: "q15",
    category: "curiosity",
    text: "What is something you've changed your mind about in the last two years, and what evidence convinced you?",
  },
];

/** Returns 3 random questions, deterministic per seed (so each user sees the same 3 after refresh). */
export function pickThreeQuestions(seed: string): { id: string; text: string; category: string }[] {
  // Simple deterministic shuffle using the seed string
  const hash = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  };

  const sorted = [...BEHAVIORAL_QUESTIONS]
    .map((q, i) => ({ q, key: hash(seed + q.id + i) }))
    .sort((a, b) => a.key - b.key)
    .slice(0, 3)
    .map(x => x.q);

  return sorted;
}
