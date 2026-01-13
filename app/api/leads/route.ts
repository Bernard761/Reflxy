import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const rateLimitMax = Number(process.env.RATE_LIMIT_LEADS_MAX ?? 20);
    const rateLimitWindow = Number(
      process.env.RATE_LIMIT_LEADS_WINDOW_MS ?? 60 * 60 * 1000
    );
    const rate = await checkRateLimit({
      key: `leads:ip:${getClientIp(request)}`,
      limit: Number.isFinite(rateLimitMax) ? rateLimitMax : 20,
      windowMs: Number.isFinite(rateLimitWindow)
        ? rateLimitWindow
        : 60 * 60 * 1000,
    });

    if (!rate.allowed) {
      const retryAfter = Math.max(
        1,
        Math.ceil((rate.reset - Date.now()) / 1000)
      );
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": retryAfter.toString() },
        }
      );
    }

    const body = (await request.json()) as { email?: string; source?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email." },
        { status: 400 }
      );
    }

    await prisma.lead.upsert({
      where: { email },
      update: { source: body.source ?? "footer" },
      create: { email, source: body.source ?? "footer" },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to save email." },
      { status: 500 }
    );
  }
}
