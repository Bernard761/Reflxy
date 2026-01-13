"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { Mail } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AuthClientProps = {
  emailEnabled: boolean;
  errorMessage?: string | null;
};

export default function AuthClient({ emailEnabled, errorMessage }: AuthClientProps) {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<
    "idle" | "loading" | "sent" | "error"
  >("idle");
  const [localError, setLocalError] = React.useState<string | null>(null);

  const handleEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!emailEnabled) {
      return;
    }

    setStatus("loading");
    setLocalError(null);

    const response = await signIn("email", {
      email,
      callbackUrl: "/app",
      redirect: false,
    });

    if (response?.error) {
      setStatus("error");
      setLocalError("We could not send the link. Please try again.");
      return;
    }

    setStatus("sent");
    setEmail("");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
        <Badge variant="outline" className="bg-white/70">
          Secure sign-in
        </Badge>
        <span>No passwords stored</span>
      </div>

      <form onSubmit={handleEmail} className="space-y-3">
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="pl-11"
            disabled={!emailEnabled || status === "loading"}
            required={emailEnabled}
          />
        </div>
        <Button
          type="submit"
          variant="outline"
          className={cn("w-full", !emailEnabled && "cursor-not-allowed")}
          disabled={!emailEnabled || status === "loading"}
        >
          {status === "loading" ? "Sending link..." : "Send magic link"}
        </Button>
      </form>

      {!emailEnabled && (
        <p className="text-xs text-muted-foreground">
          Email sign-in is available once SMTP is configured.
        </p>
      )}

      {status === "sent" && (
        <p className="text-xs text-muted-foreground">
          Check your inbox for a secure sign-in link.
        </p>
      )}

      {(errorMessage || localError) && (
        <p className="text-xs text-destructive">{errorMessage ?? localError}</p>
      )}
    </div>
  );
}
