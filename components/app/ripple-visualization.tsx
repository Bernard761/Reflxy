import * as React from "react";

import { cn } from "@/lib/utils";

type RippleVisualizationProps = {
  clarity: number;
  warmth: number;
  risk: number;
  className?: string;
  variant?: "detailed" | "compact";
};

type Timepoint = {
  label: string;
  clarity: number;
  warmth: number;
  risk: number;
};

const ringPalette: Record<
  string,
  { start: string; end: string; dot: string }
> = {
  Now: {
    start: "#1b8a6a",
    end: "#45caa0",
    dot: "#1b8a6a",
  },
  "24 hours": {
    start: "#f2b84b",
    end: "#f6d487",
    dot: "#f2b84b",
  },
  "1 week": {
    start: "#d94a3a",
    end: "#f28b82",
    dot: "#d94a3a",
  },
};

const getRingPalette = (label: string) =>
  ringPalette[label] ?? ringPalette.Now;

const slugify = (label: string) => label.replace(/\s+/g, "-").toLowerCase();

const computeTopLabelPosition = (
  radius: number,
  strokeWidth: number,
  size: number,
  center: number,
  offset: number
) => {
  const labelPadding = 18;
  const labelY = clamp(
    center - radius - strokeWidth / 2 - offset,
    labelPadding,
    size - labelPadding
  );
  return { labelX: center, labelY };
};

const applyRingSpacing = <T extends { label: string; radius: number; strokeWidth: number }>(
  rings: T[],
  minRadius: number,
  maxRadius: number,
  isCompact: boolean,
  size: number,
  center: number
) => {
  const minSpacing = isCompact ? 10 : 12;
  const sorted = rings
    .map((ring) => ({ ...ring }))
    .sort((a, b) => a.radius - b.radius);

  for (let index = 1; index < sorted.length; index += 1) {
    const previous = sorted[index - 1];
    const current = sorted[index];
    if (current.radius - previous.radius < minSpacing) {
      current.radius = previous.radius + minSpacing;
    }
  }

  const overflow = sorted[sorted.length - 1].radius - maxRadius;
  if (overflow > 0) {
    for (const ring of sorted) {
      ring.radius = clamp(ring.radius - overflow, minRadius, maxRadius);
    }
  }

  const adjusted = new Map(sorted.map((ring) => [ring.label, ring]));
  const labelOffset = isCompact ? 8 : 10;
  const minLabelSpacing = isCompact ? 18 : 20;

  const positioned = rings.map((ring) => {
    const nextRing = adjusted.get(ring.label) ?? ring;
    const { labelX, labelY } = computeTopLabelPosition(
      nextRing.radius,
      nextRing.strokeWidth,
      size,
      center,
      labelOffset
    );
    return { ...nextRing, labelX, labelY };
  });

  const sortedLabels = [...positioned].sort((a, b) => a.labelY - b.labelY);
  for (let index = 1; index < sortedLabels.length; index += 1) {
    const prev = sortedLabels[index - 1];
    const current = sortedLabels[index];
    if (current.labelY - prev.labelY < minLabelSpacing) {
      current.labelY = clamp(
        prev.labelY + minLabelSpacing,
        18,
        size - 18
      );
    }
  }

  const relabeled = new Map(sortedLabels.map((ring) => [ring.label, ring]));
  return positioned.map((ring) => relabeled.get(ring.label) ?? ring);
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const describeScore = (label: "clarity" | "warmth" | "risk", value: number) => {
  if (label === "clarity") {
    return value > 75 ? "Crisp" : value > 55 ? "Mixed" : "Hazy";
  }
  if (label === "warmth") {
    return value > 70 ? "Supportive" : value > 45 ? "Neutral" : "Cool";
  }
  return value > 60 ? "Elevated" : value > 40 ? "Watch" : "Low";
};

const buildTimepoints = (clarity: number, warmth: number, risk: number) => {
  const adjust = (value: number, delta: number) => clamp(value + delta, 0, 100);
  const clarityDrift = (100 - clarity) / 100;
  const warmthDrift = (100 - warmth) / 100;
  const riskAmplify = risk / 100;
  const round = (value: number) => Math.round(value);

  return [
    {
      label: "Now",
      clarity,
      warmth,
      risk,
    },
    {
      label: "24 hours",
      clarity: adjust(
        clarity,
        -round(6 + clarityDrift * 10 + riskAmplify * 4)
      ),
      warmth: adjust(
        warmth,
        -round(4 + warmthDrift * 8 + riskAmplify * 3)
      ),
      risk: adjust(risk, round(6 + clarityDrift * 8 + warmthDrift * 6)),
    },
    {
      label: "1 week",
      clarity: adjust(
        clarity,
        -round(12 + clarityDrift * 16 + riskAmplify * 6)
      ),
      warmth: adjust(
        warmth,
        -round(8 + warmthDrift * 14 + riskAmplify * 5)
      ),
      risk: adjust(risk, round(12 + clarityDrift * 14 + warmthDrift * 12)),
    },
  ];
};

export default function RippleVisualization({
  clarity,
  warmth,
  risk,
  className,
  variant = "detailed",
}: RippleVisualizationProps) {
  const isCompact = variant === "compact";
  const id = React.useId().replace(/:/g, "");
  const size = isCompact ? 340 : 320;
  const center = size / 2;
  const clarityScore = clamp(clarity, 0, 100);
  const warmthScore = clamp(warmth, 0, 100);
  const riskScore = clamp(risk, 0, 100);
  const timepoints = buildTimepoints(clarityScore, warmthScore, riskScore);

  const minRadius = size * 0.26;
  const maxRadius = size * 0.49;
  const ringData = timepoints.map((point) => {
    const palette = getRingPalette(point.label);
    const gradientId = `ripple-stroke-${id}-${slugify(point.label)}`;
    const radiusScale = isCompact ? 0.7 : 0.65;
    const radius = Math.min(
      minRadius + (100 - point.clarity) * radiusScale,
      maxRadius
    );
    const strokeWidth = 4 + (point.warmth / 100) * 14;
    const minOpacity = 0.28;
    const maxOpacity = 0.9;
    const ringOpacity = clamp(
      maxOpacity - (point.risk / 100) * (maxOpacity - minOpacity),
      minOpacity,
      maxOpacity
    );
    return {
      label: point.label,
      radius,
      strokeWidth,
      ringOpacity,
      gradientId,
      palette,
    };
  });
  const spacedRings = applyRingSpacing(
    ringData,
    minRadius,
    maxRadius,
    isCompact,
    size,
    center
  );

  const glowId = `ripple-glow-${id}`;
  const fillId = `ripple-fill-${id}`;
  const strokeRings = [...spacedRings].sort((a, b) => b.radius - a.radius);

  const scoreItems = [
    {
      key: "clarity" as const,
      label: "Clarity",
      value: clarityScore,
      tone: describeScore("clarity", clarityScore),
      bar: "bg-primary/80",
    },
    {
      key: "warmth" as const,
      label: "Warmth",
      value: warmthScore,
      tone: describeScore("warmth", warmthScore),
      bar: "bg-amber-400/80",
    },
    {
      key: "risk" as const,
      label: "Risk",
      value: riskScore,
      tone: describeScore("risk", riskScore),
      bar: "bg-rose-400/70",
    },
  ];

  const timepointCards = timepoints.map((point) => {
    const palette = getRingPalette(point.label);
    return {
      label: point.label,
      dot: palette.dot,
      values: [
        { label: "Clarity", value: point.clarity },
        { label: "Warmth", value: point.warmth },
        { label: "Risk", value: point.risk },
      ],
      className:
        point.label === "Now"
          ? "bg-[linear-gradient(140deg,rgba(218,245,232,0.75),rgba(255,255,255,0.95))]"
          : point.label === "24 hours"
          ? "bg-[linear-gradient(140deg,rgba(255,237,205,0.8),rgba(255,255,255,0.95))]"
          : "bg-[linear-gradient(140deg,rgba(254,224,214,0.7),rgba(255,255,255,0.95))]",
    };
  });

  return (
    <div
      className={cn(
        "grid items-start gap-6",
        isCompact
          ? "lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]"
          : "lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]",
        className
      )}
    >
      <div className="relative flex items-center justify-center rounded-[28px] border border-border/70 bg-white/70 p-3 sm:p-4 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.35)]">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className={cn(
            "h-auto w-full max-w-[260px] sm:max-w-[300px]",
            isCompact && "max-w-[280px] sm:max-w-[320px]"
          )}
          role="img"
          aria-label="Ripple visualization of emotional impact over time"
        >
          <defs>
            <radialGradient id={fillId} cx="50%" cy="50%" r="65%">
              <stop
                offset="0%"
                stopColor="hsl(var(--primary))"
                stopOpacity="0.12"
              />
              <stop
                offset="100%"
                stopColor="hsl(var(--primary))"
                stopOpacity="0"
              />
            </radialGradient>
            {spacedRings.map((ring) => (
              <linearGradient
                key={ring.gradientId}
                id={ring.gradientId}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor={ring.palette.start} />
                <stop offset="100%" stopColor={ring.palette.end} />
              </linearGradient>
            ))}
            <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle
            cx={center}
            cy={center}
            r={ringData[2].radius + 24}
            fill={`url(#${fillId})`}
          />
          {strokeRings.map((ring) => (
            <g key={`stroke-${ring.label}`}>
              <circle
                cx={center}
                cy={center}
                r={ring.radius}
                fill="none"
                stroke={`url(#${ring.gradientId})`}
                strokeOpacity={ring.ringOpacity * 0.35}
                strokeWidth={ring.strokeWidth + 4}
                filter={`url(#${glowId})`}
              />
              <circle
                cx={center}
                cy={center}
                r={ring.radius}
                fill="none"
                stroke={`url(#${ring.gradientId})`}
                strokeOpacity={ring.ringOpacity}
                strokeWidth={ring.strokeWidth}
                strokeLinecap="round"
              />
            </g>
          ))}
          {spacedRings.map((ring) => {
            const labelFontSize = isCompact ? 12 : 13;
            const labelHeight = isCompact ? 20 : 22;
            const labelPaddingX = isCompact ? 10 : 12;
            const labelWidth = Math.max(
              64,
              ring.label.length * (isCompact ? 6.5 : 7.5) +
                labelPaddingX * 2
            );
            const labelX = ring.labelX - labelWidth / 2;
            const labelY = ring.labelY - labelHeight / 2;

            return (
              <g key={`label-${ring.label}`}>
                <rect
                  x={labelX}
                  y={labelY}
                  width={labelWidth}
                  height={labelHeight}
                  rx={labelHeight / 2}
                  fill="hsl(var(--background) / 0.85)"
                  stroke={ring.palette.dot}
                  strokeOpacity="0.55"
                  strokeWidth="1"
                />
                <text
                  x={ring.labelX}
                  y={ring.labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="hsl(var(--foreground))"
                  fontSize={labelFontSize}
                  fontWeight="600"
                  opacity="0.9"
                  letterSpacing="0.08em"
                >
                  {ring.label.toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="space-y-4 min-w-0">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {timepoints.map((point) => {
              const palette = getRingPalette(point.label);
              return (
                <span
                  key={point.label}
                  className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/80 px-3 py-1"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: palette.dot }}
                  />
                  {point.label}
                </span>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            Rings reflect projected shifts over time.
          </p>
        </div>
        {variant === "detailed" && (
          <>
            <div className="space-y-3">
              {scoreItems.map((score) => (
                <div
                  key={score.label}
                  className="rounded-2xl border border-border/70 bg-white/70 px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        {score.label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {score.tone}
                      </div>
                    </div>
                    <div className="font-display text-2xl text-foreground">
                      {score.value}
                    </div>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-muted/70">
                    <div
                      className={cn("h-2 rounded-full", score.bar)}
                      style={{ width: `${score.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
              {timepointCards.map((card) => (
                <div
                  key={card.label}
                  className={cn(
                    "min-w-0 rounded-2xl border border-border/60 p-3 shadow-[0_16px_35px_-28px_rgba(15,23,42,0.2)]",
                    card.className
                  )}
                >
                  <div className="section-kicker flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: card.dot }}
                    />
                    <span>{card.label}</span>
                  </div>
                  <div className="mt-3 space-y-2 text-sm text-foreground">
                    {card.values.map((item) => (
                      <div
                        key={`${card.label}-${item.label}`}
                        className="grid grid-cols-[1fr_auto] items-center gap-2"
                      >
                        <span className="min-w-0 text-xs text-muted-foreground">
                          {item.label}
                        </span>
                        <span className="font-medium tabular-nums">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/40 p-3 text-xs text-muted-foreground">
              <div className="section-kicker">Ripple logic</div>
              <p className="mt-2">
                Rings expand with lower clarity, thicken with warmth, and fade with risk
                to keep the visualization calm and reflective.
              </p>
            </div>
          </>
        )}
        {variant === "compact" && (
          <div className="rounded-2xl border border-border/70 bg-muted/40 p-3 text-xs text-muted-foreground">
            <div className="section-kicker">Time horizons</div>
            <p className="mt-2">
              The same message is projected across Now, 24 hours, and 1 week to
              visualize how clarity, warmth, and risk may shift.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
