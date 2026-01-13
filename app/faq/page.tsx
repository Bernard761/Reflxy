import type { Metadata } from "next";
import Link from "next/link";

import MarketingLayout from "@/components/marketing/marketing-layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to the most common questions about Reflxy.",
  alternates: {
    canonical: "/faq",
  },
};

const faqs = [
  {
    question: "Is Reflxy a writing assistant?",
    answer:
      "No. Reflxy does not rewrite your message. It analyzes emotional impact so you can decide what to send.",
  },
  {
    question: "How are the scores calculated?",
    answer:
      "Scores reflect clarity, warmth, and risk. Scenario mode adjusts weighting to reflect the relationship context.",
  },
  {
    question: "Do you store my messages?",
    answer:
      "Messages are saved only when you are signed in. Free users keep the last 10 analyses, premium users keep unlimited history.",
  },
  {
    question: "What is included in premium?",
    answer:
      "Premium includes unlimited analyses, scenario mode, unlimited history, PDF export, and an advanced impact timeline.",
  },
];

export default function FAQPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <MarketingLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="container py-16">
        <div className="space-y-4">
          <Badge variant="outline" className="w-fit bg-white/70">
            FAQ
          </Badge>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Questions, answered with clarity.
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            Everything you need to know before you analyze your first message.
          </p>
        </div>

        <div className="mt-10 surface-card p-6">
          <Accordion type="single" collapsible>
            {faqs.map((item) => (
              <AccordionItem key={item.question} value={item.question}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-12 surface-card p-6">
          <div className="section-kicker">Try it yourself</div>
          <h2 className="mt-3 font-display text-2xl font-semibold">
            Ready to try Reflxy?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Start with five free analyses and see the ripple for yourself.
          </p>
          <Link href="/app" className="mt-4 inline-flex">
            <Button size="lg">Try it free</Button>
          </Link>
        </div>
      </div>
    </MarketingLayout>
  );
}
