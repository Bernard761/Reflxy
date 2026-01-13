import Link from "next/link";

import Logo from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="container flex min-h-[64px] flex-wrap items-center justify-between gap-3 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <Logo priority textClassName="text-lg" />
          </Link>
          <span className="hidden rounded-full border border-border/70 bg-white/70 px-2 py-0.5 text-[10px] uppercase tracking-[0.3em] text-muted-foreground sm:inline-flex">
            Reflect
          </span>
        </div>
        <nav className="hidden items-center gap-1 rounded-full border border-border/70 bg-white/70 px-3 py-2 text-sm text-muted-foreground shadow-[0_12px_30px_-24px_rgba(15,23,42,0.2)] md:flex">
          <Link href="/templates" className="rounded-full px-3 py-1 hover:bg-muted/60">
            Templates
          </Link>
          <Link href="/blog" className="rounded-full px-3 py-1 hover:bg-muted/60">
            Blog
          </Link>
          <Link href="/pricing" className="rounded-full px-3 py-1 hover:bg-muted/60">
            Pricing
          </Link>
          <Link href="/faq" className="rounded-full px-3 py-1 hover:bg-muted/60">
            FAQ
          </Link>
        </nav>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/auth" className="text-sm text-muted-foreground">
            Sign in
          </Link>
          <Link href="/app">
            <Button variant="outline" size="sm">
              Try it free
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
