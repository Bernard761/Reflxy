import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import AuthClient from "@/components/auth/auth-client";
import Logo from "@/components/brand/logo";
import MarketingLayout from "@/components/marketing/marketing-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";

type AuthPageProps = {
  searchParams: { error?: string };
};

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Reflxy to save your analysis history.",
  alternates: {
    canonical: "/auth",
  },
};

const errorCopy: Record<string, string> = {
  EmailSignin: "We could not send the sign-in email.",
  AccessDenied: "Access denied. Please use an approved account.",
  Verification: "That sign-in link has expired. Request a new one.",
  Default: "Sign-in failed. Please try again.",
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect("/app");
  }

  const emailEnabled =
    Boolean(process.env.EMAIL_SERVER) && Boolean(process.env.EMAIL_FROM);
  const errorMessage = searchParams.error
    ? errorCopy[searchParams.error] ?? errorCopy.Default
    : null;

  return (
    <MarketingLayout>
      <div className="container py-16">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <Logo textClassName="text-2xl" />
            <Badge variant="outline" className="w-fit bg-white/70">
              Welcome to Reflxy
            </Badge>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Sign in to save your message history and unlock deeper insight.
            </h1>
            <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
              Reflxy is reflective decision support. Your words stay yours, and
              you control what you send.
            </p>
            <div className="grid gap-4">
              {[
                {
                  title: "Save your analysis history",
                  description: "Keep a record of insights for future reference.",
                },
                {
                  title: "Unlock premium scenarios",
                  description: "Boss, partner, and client modes when you upgrade.",
                },
                {
                  title: "Export and share with care",
                  description: "Premium exports keep your analysis portable.",
                },
              ].map((item) => (
                <div key={item.title} className="surface-muted p-4">
                  <div className="text-sm font-medium text-foreground">
                    {item.title}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
            <Link href="/pricing">
              <Button variant="outline">See pricing</Button>
            </Link>
          </div>

          <div className="rounded-[36px] bg-gradient-to-br from-primary/15 via-transparent to-accent/35 p-[1px]">
            <Card className="border-0 bg-white/90 shadow-sm">
              <CardHeader>
                <CardTitle>Sign in</CardTitle>
              </CardHeader>
              <CardContent>
                <AuthClient emailEnabled={emailEnabled} errorMessage={errorMessage} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
