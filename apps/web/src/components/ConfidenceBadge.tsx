import type { ConfidenceScore } from "../types";

const BADGE_STYLES: Record<ConfidenceScore, string> = {
  "Very High": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "High": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Medium": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "Low": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "Hypothesis": "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const BADGE_DOT: Record<ConfidenceScore, string> = {
  "Very High": "bg-emerald-400",
  "High": "bg-blue-400",
  "Medium": "bg-yellow-400",
  "Low": "bg-orange-400",
  "Hypothesis": "bg-purple-400",
};

export function ConfidenceBadge({ score }: { score: ConfidenceScore }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-medium ${BADGE_STYLES[score]}`}
      title={score}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${BADGE_DOT[score]}`} />
      {score === "Very High" ? "VH" : score === "Hypothesis" ? "H?" : score[0]}
    </span>
  );
}

export function ConfidenceDot({ score }: { score: ConfidenceScore }) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${BADGE_DOT[score]}`}
      title={score}
    />
  );
}
