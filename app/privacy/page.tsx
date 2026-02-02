import type { Metadata } from "next";

import MarketingLayout from "@/components/marketing/marketing-layout";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Reflxy privacy policy and data handling practices.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Reflxy privacy policy",
    description: "Reflxy privacy policy and data handling practices.",
    url: `${siteConfig.url}/privacy`,
    images: [siteConfig.ogImage],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reflxy privacy policy",
    description: "Reflxy privacy policy and data handling practices.",
    images: [siteConfig.ogImage],
  },
};

export default function PrivacyPage() {
  return (
    <MarketingLayout>
      <div className="container py-16">
        <div className="space-y-4">
          <Badge variant="outline" className="w-fit bg-white/70">
            Privacy
          </Badge>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Privacy policy
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            Reflxy is built for calm, secure reflection. Here is how we handle
            your data.
          </p>
        </div>

        <div className="surface-card mt-10 p-8">
          <article className="prose prose-sm max-w-none break-words prose-neutral sm:prose prose-headings:font-display">
            <h2>Information we collect</h2>
            <p>
              We collect account information (email, name) when you sign in and
              store analysis results when you save them. We also collect optional
              email signups from our footer form.
            </p>
            <h2>How we use your information</h2>
            <p>
              We use your data to provide the Reflxy service, maintain your
              analysis history, and send occasional product updates if you opt in.
            </p>
            <h2>Data retention</h2>
            <p>
              Free users retain the last 10 saved analyses. Premium users retain
              unlimited history until they delete it.
            </p>
            <h2>Third-party services</h2>
            <p>
              Reflxy uses OpenAI for analysis and Stripe for billing. These
              providers process data according to their own policies.
            </p>
            <h2>Contact</h2>
            <p>For privacy questions, contact us at privacy@reflxy.app.</p>
          </article>
        </div>
      </div>
    </MarketingLayout>
  );
}
