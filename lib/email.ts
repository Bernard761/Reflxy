import nodemailer from "nodemailer";

import { resolveEmailServer } from "@/lib/email-config";

type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  headers?: Record<string, string>;
};

let cachedTransporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const server = resolveEmailServer();
  if (!server) {
    throw new Error("EMAIL_SERVER is not configured.");
  }

  cachedTransporter = nodemailer.createTransport(server);
  return cachedTransporter;
};

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
  headers,
}: EmailPayload) => {
  const rawFrom = process.env.EMAIL_FROM?.trim();
  const from =
    rawFrom && rawFrom.length > 0
      ? rawFrom
      : "Reflxy <no-reply@reflxy.com>";
  const transporter = getTransporter();

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
    ...(headers ? { headers } : {}),
  });
};
