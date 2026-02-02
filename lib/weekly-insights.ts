import type { BlogPost } from "@/lib/blog";
import type { Template } from "@/lib/templates";
import { siteConfig } from "@/lib/seo";
import { templates } from "@/lib/templates";

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export const getWeekStartUtc = (date: Date) => {
  const day = date.getUTCDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  monday.setUTCDate(monday.getUTCDate() + diff);
  return monday;
};

const hashSeed = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
};

const pickTemplateForWeek = (weekStart: Date): Template => {
  const seed = hashSeed(weekStart.toISOString());
  const index = seed % templates.length;
  return templates[index];
};

type WeeklyInsightsOptions = {
  posts: BlogPost[];
  weekStart: Date;
  unsubscribeUrl: string;
};

export const buildWeeklyInsightsEmail = ({
  posts,
  weekStart,
  unsubscribeUrl,
}: WeeklyInsightsOptions) => {
  const headline = "Your weekly Reflxy reset";
  const intro =
    "A quick practice to make your next message land with clarity and care.";
  const appUrl = `${siteConfig.url}/app`;
  const template = pickTemplateForWeek(weekStart);
  const templateUrl = `${siteConfig.url}/templates/${template.slug}`;
  const featurePost = posts[0];

  const checklist = [
    "Intent: What do I want the reader to feel or do?",
    "Warmth: Did I add one human signal (thanks, context, appreciation)?",
    "Next step: Is the ask and timing unmistakable?",
  ];

  const textLines = [
    headline,
    "",
    intro,
    "",
    `Scenario of the week: ${template.title}`,
    template.scenarioDescription,
    "",
    "Sample draft:",
    template.exampleMessage,
    "",
    "Why it can be misread:",
    template.misunderstandingRisk,
    "",
    "60-second tone check:",
    ...checklist.map((item) => `- ${item}`),
    "",
    `Analyze this scenario: ${templateUrl}`,
    `Try it in Reflxy: ${appUrl}`,
  ];

  if (featurePost) {
    textLines.push(
      "",
      `From the journal: ${featurePost.title} (${formatDate(
        featurePost.date
      )})`,
      `${featurePost.description} ${siteConfig.url}/blog/${featurePost.slug}`
    );
  }

  textLines.push("", `Unsubscribe: ${unsubscribeUrl}`);

  const checklistHtml = checklist
    .map((item) => `<li style="margin-bottom:6px;">${item}</li>`)
    .join("");

  const journalHtml = featurePost
    ? `
        <div style="padding:22px 26px;border-top:1px solid #f1e7d8;">
          <div style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#7b8794;margin-bottom:8px;">
            From the journal
          </div>
          <a href="${siteConfig.url}/blog/${featurePost.slug}" style="color:#0f2f3a;text-decoration:none;font-weight:600;font-size:16px;">
            ${featurePost.title}
          </a>
          <p style="margin:8px 0 0;color:#52606d;font-size:13px;line-height:1.5;">
            ${featurePost.description}
          </p>
        </div>
      `
    : "";

  const html = `
    <div style="font-family:Arial,sans-serif;background:#f6f1ea;padding:28px;color:#0f2f3a;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:24px;border:1px solid #eadfcd;box-shadow:0 24px 50px -35px rgba(15,23,42,0.2);overflow:hidden;">
        <div style="padding:28px;background:linear-gradient(135deg,#d7efe8,#f6e8db);">
          <div style="text-transform:uppercase;letter-spacing:0.3em;font-size:11px;color:#5f6b72;">
            ${siteConfig.name}
          </div>
          <h1 style="margin:10px 0 8px;font-size:22px;">${headline}</h1>
          <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.5;">${intro}</p>
          <a href="${appUrl}" style="display:inline-block;margin-top:14px;background:#0f5568;color:#ffffff;padding:10px 16px;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px;">
            Open Reflxy
          </a>
        </div>
        <div style="padding:22px 26px;">
          <div style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#7b8794;margin-bottom:8px;">
            Scenario of the week
          </div>
          <h2 style="margin:0 0 6px;font-size:18px;">${template.title}</h2>
          <p style="margin:0;color:#52606d;font-size:13px;line-height:1.5;">
            ${template.scenarioDescription}
          </p>
          <div style="margin-top:14px;border:1px solid #eadfcd;border-radius:16px;padding:14px;background:#ffffff;">
            <div style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#8b98a5;">
              Sample draft
            </div>
            <p style="margin:8px 0 0;color:#223036;font-size:13px;line-height:1.5;">
              ${template.exampleMessage}
            </p>
          </div>
          <div style="margin-top:12px;border:1px solid #f3e0cf;border-radius:16px;padding:14px;background:#fff7f0;">
            <div style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#9a6c4b;">
              Why it can be misread
            </div>
            <p style="margin:8px 0 0;color:#5c4030;font-size:13px;line-height:1.5;">
              ${template.misunderstandingRisk}
            </p>
          </div>
          <a href="${templateUrl}" style="display:inline-block;margin-top:14px;color:#0f5568;text-decoration:none;font-weight:600;font-size:13px;">
            Analyze this scenario →
          </a>
        </div>
        <div style="padding:22px 26px;border-top:1px solid #f1e7d8;background:#fcfaf7;">
          <div style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#7b8794;margin-bottom:8px;">
            60-second tone check
          </div>
          <ul style="margin:0;padding-left:18px;color:#4b5563;font-size:13px;line-height:1.6;">
            ${checklistHtml}
          </ul>
        </div>
        ${journalHtml}
        <div style="padding:18px 26px;border-top:1px solid #f1e7d8;background:#faf7f2;font-size:12px;color:#6b7280;">
          You are receiving this because you asked for calm communication insights. 
          <a href="${unsubscribeUrl}" style="color:#6b7280;text-decoration:underline;">Unsubscribe</a>
        </div>
      </div>
    </div>
  `;

  return {
    subject: "Your weekly Reflxy reset",
    text: textLines.join("\n"),
    html,
  };
};
