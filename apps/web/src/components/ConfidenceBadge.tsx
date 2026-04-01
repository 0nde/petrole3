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

interface ConfidenceBadgeProps {
  score: ConfidenceScore;
  sourceName?: string | null;
  verifiedDate?: string | null;
}

export function ConfidenceBadge({ score, sourceName, verifiedDate }: ConfidenceBadgeProps) {
  const label = score === "Very High" ? "VH" : score === "Hypothesis" ? "H?" : score[0];
  const badgeClass = `inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-medium ${BADGE_STYLES[score]}`;
  const dot = <span className={`w-1.5 h-1.5 rounded-full ${BADGE_DOT[score]}`} />;

  if (!sourceName && !verifiedDate) {
    return (
      <span className={badgeClass} title={score}>
        {dot}
        {label}
      </span>
    );
  }

  return (
    <span className="relative group/badge inline-flex cursor-default">
      <span className={badgeClass}>
        {dot}
        {label}
      </span>
      <span
        role="tooltip"
        className="absolute bottom-full right-0 mb-1.5 w-max max-w-[210px] px-2.5 py-2 rounded bg-petro-900 border border-petro-700/60 shadow-xl text-[10px] leading-relaxed invisible group-hover/badge:visible opacity-0 group-hover/badge:opacity-100 transition-opacity duration-150 pointer-events-none z-50"
      >
        <span className="block font-semibold text-petro-100">{score}</span>
        {sourceName && (
          <span className="block text-petro-300 mt-0.5">{sourceName}</span>
        )}
        {verifiedDate && (
          <span className="block text-petro-500 mt-0.5">{verifiedDate.slice(0, 10)}</span>
        )}
      </span>
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
