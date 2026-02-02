const resolveSiteUrl = () => {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return explicit;
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }

  return "http://localhost:3011";
};

const normalizeUrl = (value: string) => {
  if (!value) {
    return "http://localhost:3011";
  }

  try {
    return new URL(value).toString().replace(/\/$/, "");
  } catch {
    try {
      return new URL(`https://${value}`).toString().replace(/\/$/, "");
    } catch {
      return "http://localhost:3011";
    }
  }
};

export const siteConfig = {
  name: "Reflxy",
  description:
    "Reflxy helps you understand the emotional impact of written messages before sending.",
  url: normalizeUrl(resolveSiteUrl()),
  ogImage: "/og.svg",
};
