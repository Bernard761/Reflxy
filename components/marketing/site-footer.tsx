"use client";

import Link from "next/link";
import * as React from "react";

import Logo from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SiteFooter() {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "sending" | "success">(
    "idle"
  );
  const [error, setError] = React.useState<string | null>(null);

  const submitLead = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("sending");
    setError(null);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer" }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Unable to save email.");
      }

      setStatus("success");
      setEmail("");
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <footer className="border-t border-border/60 bg-background/90">
      <div className="container grid gap-12 py-14 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          <div className="surface-sunrise p-6">
            <div className="section-kicker">Stay in the loop</div>
            <h2 className="mt-3 font-display text-2xl font-semibold">
              Calm communication insights, once a week.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Thoughtful updates, reflection prompts, and product drops. No spam.
            </p>
            <form
              onSubmit={submitLead}
              className="mt-4 flex flex-col gap-3 sm:flex-row"
            >
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <Button type="submit" variant="outline" disabled={status === "sending"}>
                {status === "sending" ? "Joining..." : "Join the list"}
              </Button>
            </form>
            {status === "success" && (
              <p className="mt-3 text-xs text-muted-foreground">
                Thanks for joining. We will keep it thoughtful.
              </p>
            )}
            {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
          </div>
          <div className="surface-glass p-5">
            <div className="section-kicker">Quick actions</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/app">
                <Button size="sm">Try it free</Button>
              </Link>
              <Link href="/pricing">
                <Button size="sm" variant="outline">
                  Pricing
                </Button>
              </Link>
              <Link href="/templates">
                <Button size="sm" variant="ghost">
                  Templates
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="surface-card p-6">
          <div className="grid gap-6 text-sm sm:grid-cols-2">
            <div>
              <div className="section-kicker">Product</div>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link
                    href="/pricing"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/templates"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Templates
                  </Link>
                </li>
                <li>
                  <Link
                    href="/app"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Try it free
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <div className="section-kicker">Company</div>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link
                    href="/privacy"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Terms
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="container flex flex-wrap items-center justify-between gap-2 py-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Logo withWordmark={false} size={18} />
            <span>© {new Date().getFullYear()} Reflxy. All rights reserved.</span>
          </div>
          <span>Reflective decision support for written communication.</span>
        </div>
      </div>
    </footer>
  );
}
