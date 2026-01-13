import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border border-border/70 px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-secondary/80 text-secondary-foreground",
        secondary: "bg-secondary/60 text-secondary-foreground",
        outline: "bg-white/70 text-foreground",
        accent: "bg-accent/80 text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
