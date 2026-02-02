import type SMTPTransport from "nodemailer/lib/smtp-transport";

const sendgridHost = "smtp.sendgrid.net";

const looksLikeSendGridKey = (value: string) => value.startsWith("SG.");
const looksLikeBareSmtp = (value: string) =>
  value.includes("@") && value.includes(":") && !value.startsWith("smtp");

export const resolveEmailServer = () => {
  const raw = process.env.EMAIL_SERVER?.trim();
  if (!raw) {
    return null;
  }

  if (looksLikeBareSmtp(raw)) {
    return `smtp://${raw}`;
  }

  if (raw.startsWith("smtp://") || raw.startsWith("smtps://")) {
    return raw;
  }

  if (looksLikeSendGridKey(raw)) {
    return {
      host: sendgridHost,
      port: 587,
      secure: false,
      auth: {
        user: "apikey",
        pass: raw,
      },
    } satisfies SMTPTransport.Options;
  }

  return raw;
};
