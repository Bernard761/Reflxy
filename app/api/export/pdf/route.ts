import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import { authOptions } from "@/lib/auth";
import { getSubscriptionState, isPremiumActive } from "@/lib/subscription";

export const runtime = "nodejs";

const wrapLines = (text: string, maxChars: number) => {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";

  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars) {
      if (line) {
        lines.push(line);
      }
      line = word;
    } else {
      line = next;
    }
  });

  if (line) {
    lines.push(line);
  }

  return lines;
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await getSubscriptionState(userId);
  if (!isPremiumActive(subscription)) {
    return NextResponse.json(
      { error: "PDF export is available on the premium plan." },
      { status: 402 }
    );
  }

  const body = (await request.json()) as {
    text?: string;
    summary?: string;
    clarity?: number;
    warmth?: number;
    risk?: number;
  };

  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let y = 780;
  const drawLine = (line: string, size = 12, isBold = false) => {
    page.drawText(line, {
      x: 60,
      y,
      size,
      font: isBold ? bold : font,
      color: rgb(0.1, 0.13, 0.2),
    });
    y -= size + 6;
  };

  drawLine("Reflxy Analysis", 18, true);
  drawLine(new Date().toLocaleDateString(), 10);
  y -= 8;

  drawLine("Scores", 12, true);
  drawLine(`Clarity: ${body.clarity ?? 0}`);
  drawLine(`Warmth: ${body.warmth ?? 0}`);
  drawLine(`Risk: ${body.risk ?? 0}`);
  y -= 8;

  drawLine("Echo Summary", 12, true);
  wrapLines(body.summary ?? "", 78).forEach((line) => drawLine(line));
  y -= 8;

  drawLine("Message", 12, true);
  wrapLines((body.text ?? "").slice(0, 800), 78).forEach((line) =>
    drawLine(line)
  );

  const pdfBytes = await doc.save();
  const pdfBuffer = new ArrayBuffer(pdfBytes.length);
  const pdfView = new Uint8Array(pdfBuffer);
  pdfView.set(pdfBytes);
  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=\"reflxy-analysis.pdf\"",
    },
  });
}
