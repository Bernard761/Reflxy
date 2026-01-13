import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";

type RecentAnalysesProps = {
  userId: string;
  isPremium: boolean;
};

export default async function RecentAnalyses({
  userId,
  isPremium,
}: RecentAnalysesProps) {
  const analyses = await prisma.analysis.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: isPremium ? 25 : 10,
  });

  if (!analyses.length) {
    return null;
  }

  return (
    <section className="surface-card mt-12 p-6 motion-safe:animate-fade-up [animation-delay:160ms]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="section-kicker">Saved history</div>
          <h2 className="mt-2 font-display text-2xl font-semibold">
            Recent analyses
          </h2>
          <p className="text-sm text-muted-foreground">
            {isPremium ? "Unlimited history enabled." : "Showing last 10 analyses."}
          </p>
        </div>
        <Badge variant="outline" className="bg-white/70">
          {isPremium ? "Premium" : "Free"}
        </Badge>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {analyses.map((analysis) => {
          const scenarioLabel = analysis.scenario
            ? analysis.scenario.toLowerCase()
            : "general";
          const cleanedText = analysis.text.replace(/\s+/g, " ").trim();
          const snapshot =
            cleanedText.length > 140
              ? `${cleanedText.slice(0, 140)}...`
              : cleanedText;

          return (
            <div
              key={analysis.id}
              className="surface-glass min-w-0 p-4 text-sm transition hover:-translate-y-0.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>{analysis.createdAt.toLocaleDateString()}</span>
                <Badge variant="secondary">{scenarioLabel}</Badge>
              </div>
              <p className="mt-3 text-foreground break-words">
                {analysis.summary}
              </p>
              <p className="mt-2 text-xs text-muted-foreground break-words">
                {snapshot}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-full border border-border/60 bg-white/70 px-3 py-1">
                  Clarity {analysis.clarity}
                </span>
                <span className="rounded-full border border-border/60 bg-white/70 px-3 py-1">
                  Warmth {analysis.warmth}
                </span>
                <span className="rounded-full border border-border/60 bg-white/70 px-3 py-1">
                  Risk {analysis.risk}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
