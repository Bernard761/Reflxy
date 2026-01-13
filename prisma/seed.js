const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const demoAnalyses = [
  {
    text: "Can you send the updated timeline by 3pm today?",
    clarity: 84,
    warmth: 42,
    risk: 28,
    summary: "Direct and clear, but the tone feels brisk.",
    scenario: "BOSS",
  },
  {
    text: "Thanks for jumping on this. Could you share the draft by end of day?",
    clarity: 78,
    warmth: 64,
    risk: 22,
    summary: "Clear ask with a supportive tone.",
    scenario: "CLIENT",
  },
  {
    text: "I reviewed the notes and want to make sure we align on the scope before we move forward. I can take the lead on the first section if you can confirm the dependencies by tomorrow. Let me know if that timing is tight.",
    clarity: 70,
    warmth: 58,
    risk: 34,
    summary: "Collaborative but slightly dense.",
    scenario: "CLIENT",
  },
  {
    text: "Just checking on the progress here.",
    clarity: 52,
    warmth: 38,
    risk: 46,
    summary: "Ambiguous timing can feel pressuring.",
    scenario: "BOSS",
  },
  {
    text: "Appreciate the effort. The only change I need is to tighten the opening paragraph and confirm the timeline in the last section.",
    clarity: 76,
    warmth: 55,
    risk: 30,
    summary: "Specific feedback with a neutral tone.",
    scenario: "CLIENT",
  },
  {
    text: "I know this has been a heavy week. I want to make sure we are aligned and that you feel supported. If you are open to it, could we sync tomorrow afternoon to talk through the next steps and make sure the load feels balanced?",
    clarity: 66,
    warmth: 78,
    risk: 24,
    summary: "Warm and supportive, slightly long.",
    scenario: "PARTNER",
  },
  {
    text: "Please confirm the final version is ready for review.",
    clarity: 80,
    warmth: 40,
    risk: 32,
    summary: "Clear request with low warmth.",
    scenario: "BOSS",
  },
  {
    text: "Here is a fuller context so you have the same picture I do. We have two stakeholders asking for changes, the scope shifted last week, and the earlier version will not meet the new expectations. My suggestion is to trim the deliverable, align on what we can commit to now, and then follow up with the remaining asks once the team has capacity.",
    clarity: 62,
    warmth: 46,
    risk: 48,
    summary: "Helpful context but clarity softens as length increases.",
    scenario: "CLIENT",
  },
  {
    text: "I can take the next action if you confirm the priority order.",
    clarity: 74,
    warmth: 52,
    risk: 28,
    summary: "Clear and collaborative.",
    scenario: "CLIENT",
  },
  {
    text: "We need to resolve the handoff issue before tomorrow. Can you outline your plan by noon?",
    clarity: 82,
    warmth: 36,
    risk: 40,
    summary: "Urgent and clear but slightly tense.",
    scenario: "BOSS",
  },
  {
    text: "I want to be careful with how this lands. I care about the outcome and about how we work together, and I may have missed context. Could you help me understand how you are seeing it?",
    clarity: 68,
    warmth: 74,
    risk: 22,
    summary: "Warm and reflective, moderate clarity.",
    scenario: "PARTNER",
  },
  {
    text: "The current draft reads more cautious than I expected. If you agree, I can sharpen the opening and send it back today.",
    clarity: 77,
    warmth: 58,
    risk: 26,
    summary: "Clear and constructive.",
    scenario: "CLIENT",
  },
];

async function main() {
  await prisma.lead.upsert({
    where: { email: "hello@reflxy.app" },
    update: {},
    create: {
      email: "hello@reflxy.app",
      source: "seed",
    },
  });

  if (process.env.NODE_ENV === "production") {
    return;
  }

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@reflxy.app" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@reflxy.app",
    },
  });

  const existingAnalyses = await prisma.analysis.count({
    where: { userId: demoUser.id },
  });

  if (existingAnalyses === 0) {
    const now = Date.now();
    await prisma.analysis.createMany({
      data: demoAnalyses.map((analysis, index) => ({
        userId: demoUser.id,
        text: analysis.text,
        clarity: analysis.clarity,
        warmth: analysis.warmth,
        risk: analysis.risk,
        summary: analysis.summary,
        suggestions: "[]",
        scenario: analysis.scenario,
        createdAt: new Date(now - index * 6 * 60 * 60 * 1000),
      })),
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
