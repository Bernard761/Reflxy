import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import OpenAI from "openai";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  computePatternStats,
  getPatternCandidates,
  pickPatternCandidate,
  type AnalysisSample,
  type PatternCandidate,
} from "@/lib/pattern-insight";

const openai =
  process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 0
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

const MIN_ANALYSES = 5;
const TARGET_ANALYSES = 10;
const MAX_ANALYSES = 20;

const minStrength = 0.35;

const shouldRegenerate = ({
  candidate,
  newAnalyses,
  existing,
}: {
  candidate: PatternCandidate;
  newAnalyses: number;
  existing: {
    analysisCount: number;
    fingerprint: string;
    lastAnalysisAt: Date | null;
    strength: number | null;
    patternType: string | null;
  };
}) => {
  if (newAnalyses >= 3) {
    return true;
  }
  const strengthDelta = Math.abs(
    (existing.strength ?? 0) - candidate.strength
  );
  if (candidate.fingerprint !== existing.fingerprint && strengthDelta >= 0.12) {
    return true;
  }
  if (existing.patternType && existing.patternType !== candidate.type) {
    return candidate.strength >= (existing.strength ?? 0) + 0.1;
  }
  return false;
};

const buildOpenAIInsight = async ({
  candidate,
  stats,
}: {
  candidate: PatternCandidate;
  stats: ReturnType<typeof computePatternStats>;
}) => {
  if (!openai) {
    return candidate.insight;
  }

  const payload = {
    candidate,
    stats: {
      count: stats.count,
      avgClarity: Number(stats.avgClarity.toFixed(1)),
      avgWarmth: Number(stats.avgWarmth.toFixed(1)),
      avgRisk: Number(stats.avgRisk.toFixed(1)),
      avgWords: Number(stats.avgWords.toFixed(1)),
      stdClarity: Number(stats.stdClarity.toFixed(1)),
      stdWarmth: Number(stats.stdWarmth.toFixed(1)),
      stdRisk: Number(stats.stdRisk.toFixed(1)),
      corrWordsClarity: Number(stats.corrWordsClarity.toFixed(2)),
      corrWordsWarmth: Number(stats.corrWordsWarmth.toFixed(2)),
      riskNowAvg: Number(stats.riskNowAvg.toFixed(1)),
      riskWeekAvg: Number(stats.riskWeekAvg.toFixed(1)),
      scenarioAverages: stats.scenarioAverages,
    },
  };

  const system = [
    "You generate a single reflective insight for Reflxy.",
    "Do NOT give advice, coaching, or instructions.",
    "Do NOT judge the user or score them as good or bad.",
    "Do NOT reference raw message text.",
    "Use one of these openers exactly: 'Your messages tend to', 'Over time, your communication shows', 'A recurring pattern in your messages is'.",
    "Max 2 sentences. Calm, observational, and non-judgmental.",
    "Return ONLY JSON: {\"insight\":\"...\"}",
  ].join(" ");

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: `Use the candidate as the primary observation and rephrase it with the required opener. Data:\n${JSON.stringify(
            payload
          )}`,
        },
      ],
    });
    const content = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content) as { insight?: string };
    if (parsed.insight && parsed.insight.length <= 220) {
      return parsed.insight;
    }
  } catch (error) {
    console.warn("OpenAI insight generation failed, using template.", error);
  }

  return candidate.insight;
};

export async function POST() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ insight: null });
  }

  const totalCount = await prisma.analysis.count({
    where: { userId },
  });

  if (totalCount < MIN_ANALYSES) {
    return NextResponse.json({ insight: null });
  }

  const take = Math.min(
    MAX_ANALYSES,
    Math.max(TARGET_ANALYSES, totalCount)
  );

  const analyses = await prisma.analysis.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      clarity: true,
      warmth: true,
      risk: true,
      text: true,
      scenario: true,
      createdAt: true,
    },
  });

  const samples = analyses.map((analysis) => ({
    clarity: analysis.clarity,
    warmth: analysis.warmth,
    risk: analysis.risk,
    text: analysis.text,
    scenario: analysis.scenario,
    createdAt: analysis.createdAt,
  })) satisfies AnalysisSample[];

  const stats = computePatternStats(samples);
  const candidates = getPatternCandidates(samples, stats).filter(
    (candidate) => candidate.strength >= minStrength
  );
  const existing = await prisma.patternInsight.findUnique({
    where: { userId },
  });
  const latestAnalysisAt = analyses[0]?.createdAt ?? new Date();
  const newAnalyses =
    existing?.lastAnalysisAt
      ? await prisma.analysis.count({
          where: {
            userId,
            createdAt: { gt: existing.lastAnalysisAt },
          },
        })
      : totalCount;

  const lastType =
    existing?.patternType === "temporal" ||
    existing?.patternType === "length" ||
    existing?.patternType === "scenario" ||
    existing?.patternType === "consistency"
      ? existing.patternType
      : undefined;

  const candidate = pickPatternCandidate(candidates, lastType);

  if (!candidate) {
    return NextResponse.json({ insight: null });
  }

  if (existing && !shouldRegenerate({ candidate, newAnalyses, existing })) {
    return NextResponse.json({ insight: existing.insight });
  }

  const insight = await buildOpenAIInsight({ candidate, stats });

  await prisma.patternInsight.upsert({
    where: { userId },
    update: {
      insight,
      fingerprint: candidate.fingerprint,
      analysisCount: totalCount,
      lastAnalysisAt: latestAnalysisAt,
      patternType: candidate.type,
      strength: candidate.strength,
    },
    create: {
      userId,
      insight,
      fingerprint: candidate.fingerprint,
      analysisCount: totalCount,
      lastAnalysisAt: latestAnalysisAt,
      patternType: candidate.type,
      strength: candidate.strength,
    },
  });

  return NextResponse.json({ insight });
}
