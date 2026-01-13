import type { Metadata } from "next";

import MarketingLayout from "@/components/marketing/marketing-layout";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Terms",
  description: "Reflxy terms of service.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <MarketingLayout>
      <div className="container py-16">
        <div className="space-y-4">
          <Badge variant="outline" className="w-fit bg-white/70">
            Terms
          </Badge>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Terms of service
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            By using Reflxy, you agree to the terms below.
          </p>
        </div>

        <div className="surface-card mt-10 p-8">
          <article className="prose prose-sm max-w-none break-words prose-neutral sm:prose prose-headings:font-display">
            <h2>Use of service</h2>
            <p>
              Reflxy provides emotional impact analysis for written messages. It
              is a decision-support tool and does not replace professional
              judgment.
            </p>
            <h2>Accounts and billing</h2>
            <p>
              Premium subscriptions renew automatically and can be canceled any
              time through the billing portal.
            </p>
            <h2>Acceptable use</h2>
            <p>
              Do not use Reflxy to generate or distribute harmful or deceptive
              content. You are responsible for the messages you send.
            </p>
            <h2>Service availability</h2>
            <p>
              We strive for reliable uptime but do not guarantee uninterrupted
              access.
            </p>
            <h2>Contact</h2>
            <p>For questions about these terms, contact us at support@reflxy.app.</p>
          </article>
        </div>
      </div>
    </MarketingLayout>
  );
}
