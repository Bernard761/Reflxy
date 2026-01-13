import Link from "next/link";
import { Crown, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type UpgradeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: string;
};

export default function UpgradeModal({
  open,
  onOpenChange,
  reason,
}: UpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden bg-white/95">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_40%_at_90%_0%,rgba(15,85,104,0.2),transparent_60%)]"
        />
        <DialogHeader>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            <Crown className="h-4 w-4 text-primary" />
            Premium
          </div>
          <DialogTitle className="text-2xl">
            Unlock premium analysis
          </DialogTitle>
          <DialogDescription>
            {reason ??
              "Upgrade to access scenario mode, unlimited history, and deeper impact timelines."}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant="accent">Scenario mode</Badge>
          <Badge variant="accent">Unlimited history</Badge>
          <Badge variant="accent">PDF export</Badge>
        </div>
        <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
          {[
            "Scenario mode for boss, partner, and client contexts",
            "Unlimited analyses, exports, and saved history",
            "Advanced impact timeline with longer-term reflections",
          ].map((item) => (
            <div
              key={item}
              className="surface-muted flex items-start gap-3 px-4 py-3"
            >
              <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
              <span>{item}</span>
            </div>
          ))}
        </div>
        <DialogFooter className="mt-6">
          <Link href="/pricing">
            <Button size="lg">Try premium</Button>
          </Link>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Maybe later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
