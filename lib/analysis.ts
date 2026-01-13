export type Scenario = "boss" | "partner" | "client" | null;

export type AnalysisResult = {
  clarity: number;
  warmth: number;
  risk: number;
  summary: string;
  suggestions: string[];
};

const clampScore = (value: number) => {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(value)));
};

const buildSummary = (clarity: number, warmth: number, risk: number) => {
  const clarityTone =
    clarity > 75 ? "solid clarity" : clarity > 55 ? "mixed clarity" : "low clarity";
  const warmthTone =
    warmth > 65 ? "warm tone" : warmth > 45 ? "neutral tone" : "cool tone";
  const riskTone =
    risk > 60 ? "may linger" : risk > 40 ? "could surface" : "seems contained";

  return `This message reads with ${clarityTone} and a ${warmthTone}, while emotional risk ${riskTone}.`;
};

const softenSuggestion = (suggestion: string) => {
  const trimmed = suggestion.trim();
  if (!trimmed) {
    return "";
  }

  const lower = trimmed.toLowerCase();
  const allowedStarts = [
    "consider",
    "you could",
    "you might",
    "it may help",
    "it could help",
    "one option",
  ];

  if (allowedStarts.some((prefix) => lower.startsWith(prefix))) {
    return trimmed;
  }

  return `Consider: ${trimmed}`;
};

export function applyScenarioWeights(
  result: AnalysisResult,
  scenario: Scenario
): AnalysisResult {
  if (!scenario) {
    return sanitizeResult(result);
  }

  const weights =
    scenario === "boss"
      ? { clarity: 1.2, warmth: 0.8, risk: 1.2 }
      : scenario === "partner"
      ? { clarity: 0.9, warmth: 1.2, risk: 1.0 }
      : { clarity: 1.1, warmth: 1.0, risk: 1.1 };

  return sanitizeResult({
    ...result,
    clarity: clampScore(result.clarity * weights.clarity),
    warmth: clampScore(result.warmth * weights.warmth),
    risk: clampScore(result.risk * weights.risk),
  });
}

export function sanitizeResult(result: AnalysisResult): AnalysisResult {
  const clarity = clampScore(result.clarity);
  const warmth = clampScore(result.warmth);
  const risk = clampScore(result.risk);
  const fallbackSummary = buildSummary(clarity, warmth, risk);
  const summaryText = result.summary ? result.summary.trim() : "";
  const summary = (summaryText || fallbackSummary).slice(0, 280);
  const suggestions = (result.suggestions ?? [])
    .filter((item) => typeof item === "string")
    .map((item) => softenSuggestion(item))
    .filter(Boolean)
    .slice(0, 3);

  const fallbackSuggestions = [
    "Consider: add a short clarifying line that preserves your voice.",
    "Consider: highlight the most important ask in one sentence.",
    "Consider: add a gentle acknowledgment if the tone feels cool.",
  ];

  while (suggestions.length < 3) {
    suggestions.push(fallbackSuggestions[suggestions.length]);
  }

  return { clarity, warmth, risk, summary, suggestions };
}

export function heuristicAnalysis(text: string): AnalysisResult {
  const normalized = text.toLowerCase();
  const wordCount = normalized.split(/\s+/).filter(Boolean).length;
  const sentenceCount = normalized.split(/[.!?]/).filter(Boolean).length || 1;

  const warmthSignals = [
    "thanks",
    "thank you",
    "appreciate",
    "grateful",
    "please",
    "sorry",
    "excited",
    "hope",
  ];
  const riskSignals = [
    "urgent",
    "asap",
    "immediately",
    "frustrated",
    "disappointed",
    "angry",
    "upset",
    "never",
    "always",
  ];

  const warmthHits = warmthSignals.filter((signal) =>
    normalized.includes(signal)
  ).length;
  const riskHits = riskSignals.filter((signal) =>
    normalized.includes(signal)
  ).length;

  const hasAllCaps = /[A-Z]{3,}/.test(text);
  const exclamations = (text.match(/!/g) || []).length;

  let clarity = 82;
  clarity -= Math.min(30, Math.floor(wordCount / 18) * 3);
  clarity -= Math.min(20, sentenceCount > 4 ? (sentenceCount - 4) * 3 : 0);
  clarity += normalized.includes("?") ? 2 : 0;

  let warmth = 45 + warmthHits * 6 + Math.min(10, exclamations * 2);
  warmth -= riskHits * 3;
  warmth = Math.min(warmth, 92);

  let risk = 20 + riskHits * 8 + (hasAllCaps ? 12 : 0);
  risk += exclamations > 2 ? 6 : 0;
  risk += normalized.includes("!") && normalized.includes("?") ? 4 : 0;

  const summary = buildSummary(clarity, warmth, risk);

  const suggestions: string[] = [];
  if (clarity < 60) {
    suggestions.push(
      "Consider: reduce extra clauses so the core request is easier to spot."
    );
  }
  if (warmth < 55) {
    suggestions.push(
      "Consider: add a brief acknowledgment or appreciation to soften the tone."
    );
  }
  if (risk > 55) {
    suggestions.push(
      "Consider: swap absolute phrases for specifics to lower emotional risk."
    );
  }

  while (suggestions.length < 3) {
    suggestions.push(
      "Consider: add a single sentence that confirms your intent."
    );
  }

  return sanitizeResult({
    clarity,
    warmth,
    risk,
    summary,
    suggestions,
  });
}
