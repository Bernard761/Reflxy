import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import OpenAI from "openai";

import {
  AnalysisResult,
  Scenario,
  applyScenarioWeights,
  heuristicAnalysis,
  sanitizeResult,
} from "@/lib/analysis";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSubscriptionState, isPremiumActive } from "@/lib/subscription";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const openai =
  process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 0
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

const buildSystemPrompt = (scenario: Scenario) => {
  const base = [
    "You are Reflxy, a reflective decision-support tool that predicts emotional impact before a message is sent.",
    "You are not a writing assistant. Do not rewrite the message; only analyze its impact.",
    "Return ONLY strict JSON with keys: clarity, warmth, risk (0-100 numbers), summary (<= 280 chars), suggestions (array of 3 short strings).",
    "Keep summaries calm, observational, and non-prescriptive.",
    "Suggestions must be optional and non-prescriptive. Phrase them like 'Consider...' or 'You could...'.",
  ];

  if (!scenario) {
    return base.join(" ");
  }

  const scenarioLine =
    scenario === "boss"
      ? "Scenario mode: boss. Prioritize clarity and risk detection; be more conservative on warmth."
      : scenario === "partner"
      ? "Scenario mode: partner. Prioritize warmth and relationship after-effects while keeping clarity slightly lower."
      : "Scenario mode: client. Prioritize clarity and risk while maintaining professional warmth.";

  return `${base.join(" ")} ${scenarioLine}`;
};

const coerceResult = (payload: Partial<AnalysisResult>): AnalysisResult =>
  sanitizeResult({
    clarity: Number(payload.clarity ?? 0),
    warmth: Number(payload.warmth ?? 0),
    risk: Number(payload.risk ?? 0),
    summary: typeof payload.summary === "string" ? payload.summary : "",
    suggestions: Array.isArray(payload.suggestions)
      ? payload.suggestions.filter((item) => typeof item === "string")
      : [],
  });

const analyzeWithOpenAI = async (
  text: string,
  scenario: Scenario
): Promise<AnalysisResult> => {
  if (!openai) {
    return heuristicAnalysis(text);
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildSystemPrompt(scenario) },
        {
          role: "user",
          content: `Message:\n"""${text}"""`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content) as Partial<AnalysisResult>;
    return coerceResult(parsed);
  } catch (error) {
    console.warn("OpenAI analysis failed, using heuristic fallback.", error);
    return heuristicAnalysis(text);
  }
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ?? null;
    const subscription = userId ? await getSubscriptionState(userId) : null;
    const isPremium = isPremiumActive(subscription);

    const body = (await request.json()) as {
      text?: string;
      scenario?: string | null;
    };

    const text = body.text?.trim();
    if (!text || text.length < 4) {
      return NextResponse.json(
        { error: "Message is too short to analyze." },
        { status: 400 }
      );
    }

    const rateLimitMax = Number(process.env.RATE_LIMIT_ANALYZE_MAX ?? 60);
    const rateLimitWindow = Number(
      process.env.RATE_LIMIT_ANALYZE_WINDOW_MS ?? 10 * 60 * 1000
    );
    const rateKey = userId
      ? `analyze:user:${userId}`
      : `analyze:ip:${getClientIp(request)}`;
    const rate = await checkRateLimit({
      key: rateKey,
      limit: Number.isFinite(rateLimitMax) ? rateLimitMax : 60,
      windowMs: Number.isFinite(rateLimitWindow)
        ? rateLimitWindow
        : 10 * 60 * 1000,
    });

    if (!rate.allowed) {
      const retryAfter = Math.max(
        1,
        Math.ceil((rate.reset - Date.now()) / 1000)
      );
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        {
          status: 429,
          headers: { "Retry-After": retryAfter.toString() },
        }
      );
    }

    const scenario =
      body.scenario === "boss" ||
      body.scenario === "partner" ||
      body.scenario === "client"
        ? (body.scenario as Scenario)
        : null;

    if (scenario && !isPremium) {
      return NextResponse.json(
        { error: "Scenario mode is available on the premium plan." },
        { status: 402 }
      );
    }

    const dailyLimit = 5;
    const today = new Date();
    const usageDate = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    );

    let anonUsageCount = 0;
    if (!isPremium && !userId) {
      const cookieStore = cookies();
      const usageCookie = cookieStore.get("reflxy_usage")?.value;
      const dayKey = usageDate.toISOString().slice(0, 10);

      if (usageCookie) {
        try {
          const parsed = JSON.parse(usageCookie) as {
            day: string;
            count: number;
          };
          if (parsed.day === dayKey) {
            anonUsageCount = parsed.count;
          }
        } catch {
          anonUsageCount = 0;
        }
      }

      if (anonUsageCount >= dailyLimit) {
        return NextResponse.json(
          { error: "Daily analysis limit reached. Upgrade for more." },
          { status: 402 }
        );
      }
    }

    if (!isPremium && userId) {
      const existing = await prisma.dailyUsage.findUnique({
        where: {
          userId_date: {
            userId,
            date: usageDate,
          },
        },
      });

      if (existing && existing.count >= dailyLimit) {
        return NextResponse.json(
          { error: "Daily analysis limit reached. Upgrade for more." },
          { status: 402 }
        );
      }
    }

    const baseResult = openai
      ? await analyzeWithOpenAI(text, scenario)
      : heuristicAnalysis(text);

    const weighted = applyScenarioWeights(baseResult, scenario);

    if (userId) {
      await prisma.$transaction(async (tx) => {
        if (!isPremium) {
          await tx.dailyUsage.upsert({
            where: {
              userId_date: {
                userId,
                date: usageDate,
              },
            },
            create: {
              userId,
              date: usageDate,
              count: 1,
            },
            update: {
              count: { increment: 1 },
            },
          });
        }

        await tx.analysis.create({
          data: {
            userId,
            text,
            clarity: weighted.clarity,
            warmth: weighted.warmth,
            risk: weighted.risk,
            summary: weighted.summary,
            suggestions: JSON.stringify(weighted.suggestions),
            scenario: scenario ? scenario.toUpperCase() : null,
          },
        });

        if (!isPremium) {
          const excess = await tx.analysis.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            skip: 10,
            select: { id: true },
          });

          if (excess.length) {
            await tx.analysis.deleteMany({
              where: { id: { in: excess.map((item) => item.id) } },
            });
          }
        }
      });
    }

    const response = NextResponse.json(weighted);

    if (!isPremium && !userId) {
      const dayKey = usageDate.toISOString().slice(0, 10);
      response.cookies.set(
        "reflxy_usage",
        JSON.stringify({ day: dayKey, count: anonUsageCount + 1 }),
        {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 2,
        }
      );
    }

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to analyze the message." },
      { status: 500 }
    );
  }
}
