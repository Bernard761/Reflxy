"use client";

import * as React from "react";

import RippleVisualization from "@/components/app/ripple-visualization";
import UpgradeModal from "@/components/app/upgrade-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Scenario = "none" | "boss" | "partner" | "client";

type AnalysisResult = {
  clarity: number;
  warmth: number;
  risk: number;
  summary: string;
  suggestions: string[];
};

type AnalyzeClientProps = {
  isPremium?: boolean;
  remaining?: number | null;
  dailyLimit?: number;
  hasUser?: boolean;
};

const scenarioOptions: Array<{
  value: Scenario;
  label: string;
  description: string;
}> = [
  {
    value: "none",
    label: "General",
    description: "Neutral weighting for everyday messages.",
  },
  {
    value: "boss",
    label: "Boss",
    description: "Prioritize clarity and reduce risk.",
  },
  {
    value: "partner",
    label: "Partner",
    description: "Elevate warmth without losing truth.",
  },
  {
    value: "client",
    label: "Client",
    description: "Balance clarity and reassurance.",
  },
];

export default function AnalyzeClient({
  isPremium = false,
  remaining = null,
  dailyLimit = 5,
  hasUser = false,
}: AnalyzeClientProps) {
  const [text, setText] = React.useState("");
  const [scenario, setScenario] = React.useState<Scenario>("none");
  const [result, setResult] = React.useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = React.useState(false);
  const [patternInsight, setPatternInsight] = React.useState<string | null>(null);
  const [upgradeReason, setUpgradeReason] = React.useState<string | undefined>(
    undefined
  );
  const statusLabel = isLoading
    ? "Analyzing"
    : result
    ? "Live result"
    : "Awaiting analysis";
  const usageCopy = isPremium
    ? "Unlimited analyses with premium."
    : remaining !== null
    ? `${remaining} of ${dailyLimit} analyses left today.`
    : `Free plan includes ${dailyLimit} analyses per day.`;
  const usagePercent =
    !isPremium && remaining !== null
      ? Math.max(0, Math.min(100, (remaining / dailyLimit) * 100))
      : null;

  const handleAnalyze = async () => {
    if (!text.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          scenario: scenario === "none" ? null : scenario,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        if (response.status === 402) {
          setUpgradeReason(
            payload.error ?? "Premium unlocks more analyses and scenario mode."
          );
          setShowUpgrade(true);
          return;
        }
        throw new Error(payload.error ?? "Unable to analyze the message yet.");
      }

      const data = (await response.json()) as AnalysisResult;
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (!result) {
      setPatternInsight(null);
      return;
    }
    if (!hasUser) {
      return;
    }
    if (typeof window === "undefined") {
      return;
    }
    const sessionKey = "reflxy_pattern_shown";
    if (window.sessionStorage.getItem(sessionKey)) {
      setPatternInsight(null);
      return;
    }
    let isActive = true;

    const loadInsight = async () => {
      try {
        const response = await fetch("/api/insights/pattern", {
          method: "POST",
        });
        if (!response.ok) {
          return;
        }
        const payload = (await response.json()) as {
          insight?: string | null;
        };
        if (!isActive) {
          return;
        }
        if (payload.insight) {
          setPatternInsight(payload.insight);
          window.sessionStorage.setItem(sessionKey, "true");
        }
      } catch {
        // Ignore insight fetch errors silently.
      }
    };

    loadInsight();
    return () => {
      isActive = false;
    };
  }, [result, hasUser]);

  const impactTimeline = React.useMemo(() => {
    if (!result) {
      return [];
    }

    const clarityTone =
      result.clarity > 75
        ? "lands clearly"
        : result.clarity > 55
        ? "lands with mixed clarity"
        : "may feel unclear";
    const warmthTone =
      result.warmth > 65
        ? "feels supportive"
        : result.warmth > 45
        ? "feels neutral"
        : "feels cool";
    const riskTone =
      result.risk > 60
        ? "tension could linger"
        : result.risk > 40
        ? "some risk may linger"
        : "risk should stay low";

    return [
      {
        label: "Now",
        text: `The message ${clarityTone} and ${warmthTone} on first read.`,
      },
      {
        label: "24 hours",
        text: `Over a day, ${riskTone} if the recipient replays the wording.`,
      },
      {
        label: "1 week",
        text: `In a week, the impact is likely to ${
          result.risk > 60 ? "resurface" : "fade"
        } unless followed up.`,
      },
    ];
  }, [result]);

  const impactHighlights = React.useMemo(() => {
    if (!result) {
      return [];
    }

    const clarityNote =
      result.clarity > 75
        ? "Clear and focused on first read."
        : result.clarity > 55
        ? "Readable but may need a sharper anchor."
        : "The core point may be hard to spot.";
    const warmthNote =
      result.warmth > 70
        ? "Feels supportive and considerate."
        : result.warmth > 45
        ? "Neutral tone with low emotional lift."
        : "Tone may read cool or distant.";
    const riskNote =
      result.risk > 60
        ? "Potential tension could linger."
        : result.risk > 40
        ? "Some risk may surface later."
        : "Risk appears contained.";

    return [
      {
        label: "Immediate read",
        value: clarityNote,
        className:
          "bg-[linear-gradient(140deg,rgba(207,239,247,0.7),rgba(255,255,255,0.9))]",
      },
      {
        label: "Emotional temperature",
        value: warmthNote,
        className:
          "bg-[linear-gradient(140deg,rgba(255,237,205,0.8),rgba(255,255,255,0.9))]",
      },
      {
        label: "After-effect",
        value: riskNote,
        className:
          "bg-[linear-gradient(140deg,rgba(254,224,214,0.7),rgba(255,255,255,0.9))]",
      },
    ];
  }, [result]);

  const timelinePreview = [
    {
      label: "Now",
      text: "Immediate emotional temperature and first-read clarity.",
    },
    {
      label: "24 hours",
      text: "How the message lingers after a day of reflection.",
    },
    {
      label: "1 week",
      text: "What is most likely to stick and shape memory.",
    },
  ];

  const handleExport = async () => {
    if (!result) {
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      const response = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          summary: result.summary,
          clarity: result.clarity,
          warmth: result.warmth,
          risk: result.risk,
        }),
      });

      if (response.status === 402) {
        setUpgradeReason("PDF export is a premium feature.");
        setShowUpgrade(true);
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to export PDF.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "reflxy-analysis.pdf";
      anchor.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
      <UpgradeModal
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
        reason={upgradeReason}
      />

      <div className="space-y-6">
        <div className="surface-aurora p-[1px] motion-safe:animate-fade-up">
          <Card className="relative border-0 bg-white/90">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-primary/15 blur-3xl"
            />
            <CardHeader className="relative space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.35em] text-muted-foreground">
                <Badge variant="outline" className="bg-white/70">
                  Message draft
                </Badge>
                <span>Workspace</span>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl">
                  Compose with calm awareness
                </CardTitle>
                <CardDescription>
                  Reflxy reflects the emotional echo of your words. It never
                  rewrites your message.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Textarea
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="Paste your message here. Keep the original tone and wording."
                  className="min-h-[220px] border-border/70 bg-white/70 shadow-[0_14px_35px_-24px_rgba(15,23,42,0.25)]"
                />
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>{text.length} characters</span>
                  <span>Private by default. Stored only when you are signed in.</span>
                </div>
              </div>

              <div className="surface-glass p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      Scenario mode
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Tailor the analysis for different relationship dynamics.
                    </p>
                  </div>
                  {!isPremium && (
                    <Badge variant="outline" className="border-dashed bg-white/70">
                      Premium
                    </Badge>
                  )}
                </div>
                <div className="mt-4 grid gap-2 rounded-2xl border border-border/70 bg-white/70 p-2 sm:grid-cols-2 lg:grid-cols-4">
                  {scenarioOptions.map((option) => {
                    const isLocked = option.value !== "none" && !isPremium;
                    const isActive = scenario === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          if (isLocked) {
                            setUpgradeReason(
                              "Scenario mode tailors scores to context. Upgrade to unlock it."
                            );
                            setShowUpgrade(true);
                            return;
                          }
                          setScenario(option.value);
                        }}
                        className={cn(
                          "rounded-2xl border border-transparent px-3 py-3 text-left text-sm transition",
                          isActive
                            ? "border-primary/40 bg-primary/10"
                            : "bg-transparent hover:bg-muted/40",
                          isLocked && "cursor-not-allowed opacity-60"
                        )}
                      >
                        <div className="font-medium text-foreground">
                          {option.label}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {option.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid items-center gap-4 md:grid-cols-[auto_1fr]">
                <Button
                  onClick={handleAnalyze}
                  disabled={isLoading || !text.trim()}
                  size="lg"
                >
                  {isLoading ? "Analyzing..." : "Analyze"}
                </Button>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>{usageCopy}</span>
                    {!isPremium && remaining !== null && (
                      <span>
                        {remaining}/{dailyLimit}
                      </span>
                    )}
                  </div>
                  {!isPremium && usagePercent !== null && (
                    <div className="h-2 w-full rounded-full bg-muted/60">
                      <div
                        className="h-2 rounded-full bg-primary/80 transition-all"
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="surface-muted border-destructive/20 p-4 text-destructive">
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="surface-muted p-4 text-sm text-muted-foreground">
            <div className="section-kicker">Reflection cue</div>
            <p className="mt-2 text-foreground">
              Ask: &quot;What will they feel after reading this twice?&quot;
            </p>
          </div>
          <div className="surface-muted p-4 text-sm text-muted-foreground">
            <div className="section-kicker">Confidence check</div>
            <p className="mt-2 text-foreground">
              Reflxy shows impact, but the decision is always yours.
            </p>
          </div>
        </div>
      </div>

      <div className="surface-aurora p-[1px] motion-safe:animate-fade-up [animation-delay:120ms]">
        <Card className="relative border-0 bg-white/95">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 right-10 h-56 w-56 rounded-full bg-primary/10 blur-3xl"
          />
          <CardHeader className="relative space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Emotional impact</CardTitle>
                <CardDescription>
                  Projected shifts for the same message across three time horizons.
                </CardDescription>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {["Now", "24 hours", "1 week"].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-border/60 bg-white/70 px-3 py-1"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <Badge
                variant="outline"
                className={cn("bg-white/70", isLoading && "animate-pulse")}
              >
                {statusLabel}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {result ? (
              <div className="space-y-6 motion-safe:animate-fade-up">
                <RippleVisualization
                  clarity={result.clarity}
                  warmth={result.warmth}
                  risk={result.risk}
                />
                <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
                  {impactHighlights.map((item) => (
                    <div
                      key={item.label}
                      className={cn(
                        "min-w-0 rounded-2xl border border-border/60 p-4 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.2)]",
                        item.className
                      )}
                    >
                      <div className="section-kicker">{item.label}</div>
                      <p className="mt-2 text-sm text-foreground break-words">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
                {patternInsight && (
                  <div className="rounded-2xl border border-border/60 bg-muted/40 px-4 py-4 text-sm text-muted-foreground">
                    <div className="section-kicker">Your Pattern</div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Based on how your messages tend to land over time.
                    </p>
                    <p className="mt-3 text-sm text-foreground/80 break-words">
                      {patternInsight}
                    </p>
                  </div>
                )}
                <div className="surface-glass p-4">
                  <div className="section-kicker">Echo summary</div>
                  <p className="mt-2 text-sm text-foreground break-words">
                    {result.summary}
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="section-kicker">Impact timeline</div>
                    {!isPremium && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setUpgradeReason(
                            "Unlock the impact timeline with premium."
                          );
                          setShowUpgrade(true);
                        }}
                      >
                        Upgrade
                      </Button>
                    )}
                  </div>
                  {isPremium ? (
                    <div className="grid gap-3 text-sm text-muted-foreground">
                      {impactTimeline.map((item) => (
                        <div
                          key={item.label}
                          className="surface-muted px-4 py-3"
                        >
                          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
                            {item.label}
                          </div>
                          <p className="break-words">{item.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                      The premium impact timeline explains how emotion evolves
                      across time. Upgrade to unlock it.
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="section-kicker">Optional rewrite suggestions</div>
                  <ul className="space-y-2 text-sm text-foreground">
                    {result.suggestions.map((suggestion, index) => (
                      <li
                        key={`${suggestion}-${index}`}
                        className="surface-glass px-3 py-2 break-words motion-safe:animate-fade-up"
                        style={{ animationDelay: `${index * 80}ms` }}
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={handleExport}
                    disabled={isExporting}
                  >
                    {isExporting ? "Exporting..." : "Export as PDF"}
                  </Button>
                  {!isPremium && (
                    <span className="text-xs text-muted-foreground">
                      Premium required for export.
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid gap-5 text-sm text-muted-foreground">
                <RippleVisualization clarity={72} warmth={64} risk={28} />
                <div className="surface-glass p-4">
                  <div className="section-kicker">Preview</div>
                  <p className="mt-2 text-foreground">
                    Run an analysis to reveal the echo summary, scores, and
                    optional rewrites. This preview shows how the visualization
                    adapts once data is available.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="section-kicker">Impact timeline</div>
                    {!isPremium && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setUpgradeReason(
                            "Unlock the impact timeline with premium."
                          );
                          setShowUpgrade(true);
                        }}
                      >
                        Upgrade
                      </Button>
                    )}
                  </div>
                  {isPremium ? (
                    <div className="grid gap-3 text-sm text-muted-foreground">
                      {timelinePreview.map((item) => (
                        <div
                          key={item.label}
                          className="surface-muted px-4 py-3"
                        >
                          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
                            {item.label}
                          </div>
                          <p className="break-words">{item.text}</p>
                        </div>
                      ))}
                      <p className="text-xs text-muted-foreground">
                        Run an analysis to populate the full timeline.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                      The premium impact timeline explains how emotion evolves
                      across time. Upgrade to unlock it.
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
