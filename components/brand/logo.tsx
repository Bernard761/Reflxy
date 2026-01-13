import Image from "next/image";

import { cn } from "@/lib/utils";

type LogoProps = {
  withWordmark?: boolean;
  size?: number;
  className?: string;
  textClassName?: string;
  priority?: boolean;
};

export default function Logo({
  withWordmark = true,
  size = 28,
  className,
  textClassName,
  priority = false,
}: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src="/logo-mark.svg"
        alt="Reflxy logo"
        width={size}
        height={size}
        priority={priority}
      />
      {withWordmark && (
        <span
          className={cn(
            "font-display text-lg font-semibold tracking-tight text-foreground",
            textClassName
          )}
        >
          Reflxy
        </span>
      )}
    </span>
  );
}
