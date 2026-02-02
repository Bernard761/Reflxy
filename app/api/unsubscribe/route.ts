import { NextResponse } from "next/server";

import { verifyUnsubscribeToken } from "@/lib/email-unsubscribe";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/seo";

export const runtime = "nodejs";

const buildHtml = (title: string, body: string) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin:0;font-family:Arial,sans-serif;background:#f6f1ea;color:#0f2f3a;">
    <div style="max-width:560px;margin:48px auto;background:#ffffff;border-radius:20px;border:1px solid #eadfcd;box-shadow:0 24px 50px -35px rgba(15,23,42,0.2);overflow:hidden;">
      <div style="padding:24px;background:linear-gradient(135deg,#d7efe8,#f6e8db);">
        <div style="text-transform:uppercase;letter-spacing:0.3em;font-size:11px;color:#5f6b72;">
          ${siteConfig.name}
        </div>
        <h1 style="margin:10px 0 0;font-size:22px;">${title}</h1>
      </div>
      <div style="padding:24px;">
        <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#4b5563;">
          ${body}
        </p>
        <a href="${siteConfig.url}" style="display:inline-block;background:#0f5568;color:#ffffff;padding:10px 16px;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px;">
          Back to Reflxy
        </a>
      </div>
    </div>
  </body>
</html>`;

const parseParams = async (request: Request) => {
  const url = new URL(request.url);
  let id = url.searchParams.get("id")?.trim() ?? "";
  let token = url.searchParams.get("token")?.trim() ?? "";

  if ((!id || !token) && request.method === "POST") {
    try {
      const body = await request.text();
      const params = new URLSearchParams(body);
      id = id || params.get("id")?.trim() || "";
      token = token || params.get("token")?.trim() || "";
    } catch {
      return { id, token };
    }
  }

  return { id, token };
};

const unsubscribeLead = async (id: string, token: string) => {
  if (!id || !token) {
    return { ok: false, status: 400, message: "Missing unsubscribe details." };
  }

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) {
    return { ok: false, status: 404, message: "We could not find that address." };
  }

  if (!verifyUnsubscribeToken(lead.id, lead.email, token)) {
    return { ok: false, status: 401, message: "Invalid unsubscribe link." };
  }

  if (!lead.unsubscribedAt) {
    await prisma.lead.update({
      where: { id: lead.id },
      data: { unsubscribedAt: new Date() },
    });
  }

  return {
    ok: true,
    status: 200,
    message: `You're unsubscribed from weekly updates for ${lead.email}.`,
  };
};

export async function GET(request: Request) {
  const { id, token } = await parseParams(request);
  const result = await unsubscribeLead(id, token);
  const title = result.ok ? "You're unsubscribed" : "We couldn't unsubscribe you";
  const body = result.message;

  return new NextResponse(buildHtml(title, body), {
    status: result.status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: Request) {
  const { id, token } = await parseParams(request);
  const result = await unsubscribeLead(id, token);

  return NextResponse.json(
    { ok: result.ok, message: result.message },
    { status: result.status }
  );
}
