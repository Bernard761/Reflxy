import Link from "next/link";
import { getServerSession } from "next-auth";

import Logo from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { getSubscriptionState, isPremiumActive } from "@/lib/subscription";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;
  const subscription = userId ? await getSubscriptionState(userId) : null;
  const isPremium = isPremiumActive(subscription);

  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_12%_0%,rgba(15,85,104,0.15),transparent_70%),radial-gradient(45%_45%_at_90%_10%,rgba(244,185,167,0.25),transparent_65%)]"
      />
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur">
        <div className="container flex min-h-[64px] flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3">
                <Logo withWordmark textClassName="text-lg" />
              </Link>
              <Badge variant="outline" className="bg-white/70 text-[10px] uppercase">
                {isPremium ? "Premium" : "Free"}
              </Badge>
            </div>
            <nav className="hidden items-center gap-1 rounded-full border border-border/70 bg-white/70 px-3 py-1 text-sm text-muted-foreground shadow-[0_12px_30px_-24px_rgba(15,23,42,0.2)] md:flex">
              <Link href="/app" className="rounded-full bg-muted/60 px-3 py-1 text-foreground">
                Workspace
              </Link>
              <Link href="/templates" className="rounded-full px-3 py-1 hover:bg-muted/60">
                Templates
              </Link>
              <Link href="/blog" className="rounded-full px-3 py-1 hover:bg-muted/60">
                Insights
              </Link>
            </nav>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {!isPremium && (
              <Link href="/pricing">
                <Button variant="outline" size="sm">
                  Upgrade
                </Button>
              </Link>
            )}
            {session?.user ? (
              <Link href="/api/auth/signout?callbackUrl=/auth">
                <Button variant="outline" size="sm">
                  Sign out
                </Button>
              </Link>
            ) : (
              <Link href="/auth">
                <Button variant="outline" size="sm">
                  Sign in
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="container py-10 lg:py-16">{children}</main>
    </div>
  );
}
