import crypto from "crypto";

const resolveSecret = () => {
  const explicit = process.env.EMAIL_UNSUBSCRIBE_SECRET?.trim();
  if (explicit) {
    return explicit;
  }
  return process.env.NEXTAUTH_SECRET?.trim() ?? "";
};

const buildPayload = (leadId: string, email: string) => `${leadId}:${email}`;

export const createUnsubscribeToken = (leadId: string, email: string) => {
  const secret = resolveSecret();
  if (!secret) {
    return null;
  }
  return crypto
    .createHmac("sha256", secret)
    .update(buildPayload(leadId, email))
    .digest("hex");
};

export const verifyUnsubscribeToken = (
  leadId: string,
  email: string,
  token: string
) => {
  const expected = createUnsubscribeToken(leadId, email);
  if (!expected || !token) {
    return false;
  }
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
  } catch {
    return false;
  }
};
