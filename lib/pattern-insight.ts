type ScenarioKey = "boss" | "partner" | "client";

export type AnalysisSample = {
  clarity: number;
  warmth: number;
  risk: number;
  text: string;
  scenario: string | null;
  createdAt: Date;
};

export type PatternStats = {
  count: number;
  avgClarity: number;
  avgWarmth: number;
  avgRisk: number;
  avgWords: number;
  stdClarity: number;
  stdWarmth: number;
  stdRisk: number;
  stdWords: number;
  corrWordsClarity: number;
  corrWordsWarmth: number;
  riskNowAvg: number;
  riskWeekAvg: number;
  riskDelta: number;
  scenarioAverages: Record<
    ScenarioKey,
    { count: number; clarity: number; warmth: number; risk: number }
  >;
};

export type PatternCandidate = {
  type: "temporal" | "length" | "scenario" | "consistency";
  insight: string;
  strength: number;
  fingerprint: string;
  metadata: Record<string, number | string>;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const mean = (values: number[]) =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

const stdDev = (values: number[]) => {
  if (!values.length) return 0;
  const avg = mean(values);
  const variance =
    values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / values.length;
  return Math.sqrt(variance);
};

const pearsonCorrelation = (xs: number[], ys: number[]) => {
  if (xs.length !== ys.length || xs.length < 3) return 0;
  const meanX = mean(xs);
  const meanY = mean(ys);
  let numerator = 0;
  let denomX = 0;
  let denomY = 0;
  for (let i = 0; i < xs.length; i += 1) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    numerator += dx * dy;
    denomX += dx ** 2;
    denomY += dy ** 2;
  }
  const denominator = Math.sqrt(denomX * denomY);
  return denominator === 0 ? 0 : numerator / denominator;
};

const roundToNearest = (value: number, step: number) =>
  Math.round(value / step) * step;

const percentile = (values: number[], p: number) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = clamp(Math.floor(p * (sorted.length - 1)), 0, sorted.length - 1);
  return sorted[index];
};

const countWords = (text: string) =>
  text.trim().length ? text.trim().split(/\s+/).length : 0;

const computeRiskWeek = (clarity: number, warmth: number, risk: number) => {
  const adjust = (value: number, delta: number) => clamp(value + delta, 0, 100);
  const clarityDrift = (100 - clarity) / 100;
  const warmthDrift = (100 - warmth) / 100;
  const riskAmplify = risk / 100;
  const delta = Math.round(12 + clarityDrift * 14 + warmthDrift * 12 + riskAmplify * 6);
  return adjust(risk, delta);
};

const scenarioLabel = (scenario: ScenarioKey) =>
  scenario === "boss" ? "bosses" : scenario === "partner" ? "partners" : "clients";

const openerFor = (seed: number) => {
  const openers = [
    "Your messages tend to",
    "Over time, your communication shows",
    "A recurring pattern in your messages is",
  ];
  return openers[seed % openers.length];
};

export const computePatternStats = (analyses: AnalysisSample[]): PatternStats => {
  const clarityScores = analyses.map((item) => item.clarity);
  const warmthScores = analyses.map((item) => item.warmth);
  const riskScores = analyses.map((item) => item.risk);
  const wordCounts = analyses.map((item) => countWords(item.text));
  const riskWeekScores = analyses.map((item) =>
    computeRiskWeek(item.clarity, item.warmth, item.risk)
  );

  const scenarioAverages: PatternStats["scenarioAverages"] = {
    boss: { count: 0, clarity: 0, warmth: 0, risk: 0 },
    partner: { count: 0, clarity: 0, warmth: 0, risk: 0 },
    client: { count: 0, clarity: 0, warmth: 0, risk: 0 },
  };

  for (const item of analyses) {
    const scenario = item.scenario?.toLowerCase() as ScenarioKey | undefined;
    if (!scenario || !(scenario in scenarioAverages)) continue;
    const entry = scenarioAverages[scenario];
    entry.count += 1;
    entry.clarity += item.clarity;
    entry.warmth += item.warmth;
    entry.risk += item.risk;
  }

  (Object.keys(scenarioAverages) as ScenarioKey[]).forEach((key) => {
    const entry = scenarioAverages[key];
    if (entry.count > 0) {
      entry.clarity = entry.clarity / entry.count;
      entry.warmth = entry.warmth / entry.count;
      entry.risk = entry.risk / entry.count;
    }
  });

  const riskNowAvg = mean(riskScores);
  const riskWeekAvg = mean(riskWeekScores);

  return {
    count: analyses.length,
    avgClarity: mean(clarityScores),
    avgWarmth: mean(warmthScores),
    avgRisk: mean(riskScores),
    avgWords: mean(wordCounts),
    stdClarity: stdDev(clarityScores),
    stdWarmth: stdDev(warmthScores),
    stdRisk: stdDev(riskScores),
    stdWords: stdDev(wordCounts),
    corrWordsClarity: pearsonCorrelation(wordCounts, clarityScores),
    corrWordsWarmth: pearsonCorrelation(wordCounts, warmthScores),
    riskNowAvg,
    riskWeekAvg,
    riskDelta: riskWeekAvg - riskNowAvg,
    scenarioAverages,
  };
};

export const getPatternCandidates = (
  analyses: AnalysisSample[],
  stats: PatternStats
): PatternCandidate[] => {
  const candidates: PatternCandidate[] = [];

  const temporalDiff = stats.riskDelta;
  if (Math.abs(temporalDiff) >= 8) {
    const delayed = temporalDiff > 0;
    const insight = `${openerFor(0)} ${
      delayed
        ? "more risk after the first read than in the moment"
        : "tension that shows up immediately rather than later"
    }.`;
    candidates.push({
      type: "temporal",
      insight,
      strength: clamp(Math.abs(temporalDiff) / 25, 0, 1),
      fingerprint: `temporal:${delayed ? "delayed" : "immediate"}:${roundToNearest(
        Math.abs(temporalDiff),
        2
      )}`,
      metadata: { temporalDiff: Number(temporalDiff.toFixed(2)) },
    });
  }

  const lengthVarianceOk = stats.stdWords >= 8;
  const lengthCorrThreshold = 0.35;
  if (lengthVarianceOk) {
    const corrWarmth = stats.corrWordsWarmth;
    const corrClarity = stats.corrWordsClarity;
    const best = Math.abs(corrWarmth) >= Math.abs(corrClarity)
      ? { metric: "warmth", corr: corrWarmth }
      : { metric: "clarity", corr: corrClarity };

    if (Math.abs(best.corr) >= lengthCorrThreshold) {
      const upper = roundToNearest(percentile(analyses.map((item) => countWords(item.text)), 0.75), 10);
      const lower = roundToNearest(percentile(analyses.map((item) => countWords(item.text)), 0.3), 10);
      const threshold = best.corr < 0 ? upper : lower;
      const insight = `${openerFor(1)} ${
        best.corr < 0
          ? `${best.metric} softens when messages exceed ~${threshold} words`
          : `more ambiguity in shorter messages under ~${threshold} words`
      }.`;
      candidates.push({
        type: "length",
        insight,
        strength: clamp(Math.abs(best.corr), 0, 1),
        fingerprint: `length:${best.metric}:${best.corr < 0 ? "longer" : "shorter"}:${threshold}`,
        metadata: {
          corr: Number(best.corr.toFixed(2)),
          threshold,
        },
      });
    }
  }

  const scenarios = Object.entries(stats.scenarioAverages).filter(
    ([, value]) => value.count >= 2
  ) as Array<[ScenarioKey, PatternStats["scenarioAverages"][ScenarioKey]]>;
  if (scenarios.length >= 2) {
    let bestScenario: PatternCandidate | null = null;
    for (let i = 0; i < scenarios.length; i += 1) {
      for (let j = i + 1; j < scenarios.length; j += 1) {
        const [aKey, aValue] = scenarios[i];
        const [bKey, bValue] = scenarios[j];
        const diffs = [
          { metric: "clarity", diff: aValue.clarity - bValue.clarity },
          { metric: "warmth", diff: aValue.warmth - bValue.warmth },
          { metric: "risk", diff: aValue.risk - bValue.risk },
        ];
        diffs.forEach((item) => {
          const diffAbs = Math.abs(item.diff);
          if (diffAbs < 10) return;
          const higher = item.diff > 0 ? aKey : bKey;
          const lower = item.diff > 0 ? bKey : aKey;
          const metricLabel =
            item.metric === "clarity"
              ? "clearer"
              : item.metric === "warmth"
              ? "warmer"
              : "more emotionally weighted";
          const insight = `${openerFor(2)} ${metricLabel} messages with ${scenarioLabel(
            higher
          )} than with ${scenarioLabel(lower)}.`;
          const candidate: PatternCandidate = {
            type: "scenario",
            insight,
            strength: clamp(diffAbs / 25, 0, 1),
            fingerprint: `scenario:${item.metric}:${higher}:${lower}:${roundToNearest(
              diffAbs,
              5
            )}`,
            metadata: {
              diff: Number(item.diff.toFixed(2)),
              metric: item.metric,
              higher,
              lower,
            },
          };
          if (!bestScenario || candidate.strength > bestScenario.strength) {
            bestScenario = candidate;
          }
        });
      }
    }
    if (bestScenario) {
      candidates.push(bestScenario);
    }
  }

  const avgStd = mean([stats.stdClarity, stats.stdWarmth, stats.stdRisk]);
  if (avgStd <= 7 || avgStd >= 15) {
    const isConsistent = avgStd <= 7;
    const insight = isConsistent
      ? `${openerFor(0)} a steady signature across clarity, warmth, and risk.`
      : `${openerFor(2)} noticeable shifts in clarity, warmth, and risk between messages.`;
    const strength = isConsistent
      ? clamp((7 - avgStd) / 7, 0, 1)
      : clamp((avgStd - 15) / 15, 0, 1);
    candidates.push({
      type: "consistency",
      insight,
      strength,
      fingerprint: `consistency:${isConsistent ? "steady" : "variable"}`,
      metadata: { avgStd: Number(avgStd.toFixed(2)) },
    });
  }

  return candidates;
};

export const pickPatternCandidate = (
  candidates: PatternCandidate[],
  lastType?: PatternCandidate["type"]
) => {
  if (!candidates.length) return null;
  const sorted = [...candidates].sort((a, b) => b.strength - a.strength);
  const top = sorted[0];
  if (lastType && top.type === lastType) {
    const alt = sorted.find(
      (candidate) =>
        candidate.type !== lastType && candidate.strength >= top.strength * 0.9
    );
    if (alt) {
      return alt;
    }
  }
  return top;
};
