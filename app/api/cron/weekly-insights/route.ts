import { NextResponse } from "next/server";

import { getAllPosts } from "@/lib/blog";
import { createUnsubscribeToken } from "@/lib/email-unsubscribe";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { resolveEmailServer } from "@/lib/email-config";
import { siteConfig } from "@/lib/seo";
import { buildWeeklyInsightsEmail, getWeekStartUtc } from "@/lib/weekly-insights";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const authorize = (request: Request) => {
  const vercelCron = request.headers.get("x-vercel-cron");
  if (vercelCron) {
    return { ok: true };
  }

  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return { ok: false, status: 500, message: "CRON_SECRET is not configured." };
  }
  const auth = request.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${secret}`) {
    return { ok: false, status: 401, message: "Unauthorized." };
  }
  return { ok: true };
};

const run = async (request: Request) => {
  if (process.env.WEEKLY_INSIGHTS_ENABLED === "false") {
    return NextResponse.json({ sent: 0, skipped: "disabled" });
  }

  const auth = authorize(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  if (!resolveEmailServer() || !process.env.EMAIL_FROM?.trim()) {
    return NextResponse.json(
      { error: "Email is not configured." },
      { status: 500 }
    );
  }

  const now = new Date();
  const weekStart = getWeekStartUtc(now);
  const batchLimit = Math.max(
    1,
    Number(process.env.WEEKLY_INSIGHTS_BATCH ?? 200)
  );
  const url = new URL(request.url);
  const targetEmail = url.searchParams.get("email")?.trim();
  const hasTarget = Boolean(targetEmail);

  const leads = hasTarget
    ? await prisma.lead.findMany({
        where: { email: targetEmail, unsubscribedAt: null },
        take: 1,
      })
    : await prisma.lead.findMany({
        where: {
          unsubscribedAt: null,
          OR: [{ lastInsightAt: null }, { lastInsightAt: { lt: weekStart } }],
        },
        orderBy: { createdAt: "asc" },
        take: batchLimit,
      });

  if (!leads.length) {
    return NextResponse.json({ sent: 0, error: hasTarget ? "Email not found." : undefined });
  }

  const posts = getAllPosts().slice(0, 3);

  let sent = 0;
  let failed = 0;

  for (const lead of leads) {
    try {
      const token = createUnsubscribeToken(lead.id, lead.email);
      if (!token) {
        throw new Error("Unsubscribe token secret is missing.");
      }
      const unsubscribeUrl = `${siteConfig.url}/api/unsubscribe?id=${lead.id}&token=${token}`;
      const email = buildWeeklyInsightsEmail({
        posts,
        weekStart,
        unsubscribeUrl,
      });
      await sendEmail({
        to: lead.email,
        subject: email.subject,
        text: email.text,
        html: email.html,
        headers: {
          "List-Unsubscribe": `<${unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      });
      await prisma.lead.update({
        where: { id: lead.id },
        data: { lastInsightAt: now },
      });
      sent += 1;
    } catch (error) {
      failed += 1;
      console.error("Weekly insight send failed.", error);
    }
  }

  return NextResponse.json({ sent, failed });
};

export async function GET(request: Request) {
  return run(request);
}

export async function POST(request: Request) {
  return run(request);
}
