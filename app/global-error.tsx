"use client";

import * as React from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
        <div className="max-w-md space-y-4 rounded-3xl border border-border/60 bg-white/80 p-6 text-sm shadow-[0_18px_45px_-35px_rgba(15,23,42,0.35)]">
          <h1 className="font-display text-2xl font-semibold">
            Something went wrong.
          </h1>
          <p className="text-muted-foreground">
            Try reloading or return to the workspace. If the issue continues,
            contact support.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Try again
            </button>
            <a
              href="/"
              className="rounded-full border border-border/70 px-4 py-2 text-sm font-medium text-foreground"
            >
              Back home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
