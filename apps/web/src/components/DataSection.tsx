import { useState } from "react";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { useI18n } from "../i18n/useI18n";
import type { BaselineRecord } from "../types";
import type { TranslationKey } from "../i18n/translations";

function formatValue(value: number, unit: string): string {
  if (unit === "habitants" || unit === "inhabitants") {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    return value.toLocaleString();
  }
  if (unit === "%") return `${value.toFixed(1)}%`;
  if (Math.abs(value) >= 10000) return value.toLocaleString("en", { maximumFractionDigits: 0 });
  if (Math.abs(value) >= 100) return value.toFixed(1);
  if (Math.abs(value) >= 1) return value.toFixed(2);
  return value.toFixed(3);
}

interface DataSectionProps {
  titleKey: TranslationKey;
  icon: string;
  records: BaselineRecord[];
}

export function DataSection({ titleKey, icon, records }: DataSectionProps) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState<number | null>(null);

  if (records.length === 0) return null;

  return (
    <div className="border-b border-petro-700/50">
      <div className="px-4 py-2 flex items-center gap-1.5">
        <span className="text-xs">{icon}</span>
        <h4 className="text-xs font-semibold text-petro-300 uppercase tracking-wider">
          {t(titleKey)}
        </h4>
        <span className="text-[10px] text-petro-600 ml-auto">{records.length}</span>
      </div>
      <div className="px-4 pb-3 space-y-1">
        {records.map((r) => {
          const indicatorKey = `indicator.${r.indicator}` as TranslationKey;
          const label = t(indicatorKey) !== indicatorKey ? t(indicatorKey) : r.indicator.replace(/_/g, " ");
          const isExpanded = expanded === r.id;

          return (
            <div key={r.id}>
              <button
                onClick={() => setExpanded(isExpanded ? null : r.id)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded bg-petro-900/40 hover:bg-petro-800/40 transition-colors text-left group"
              >
                <span className="text-[11px] text-petro-300 flex-1 truncate">{label}</span>
                <span className="text-xs font-mono text-petro-100 font-medium shrink-0">
                  {formatValue(r.value, r.unit)}
                </span>
                <span className="text-[9px] text-petro-500 w-16 text-right shrink-0">{r.unit}</span>
                <ConfidenceBadge
                  score={r.confidence_score}
                  sourceName={r.source_name}
                  verifiedDate={r.verified_date}
                />
              </button>

              {isExpanded && (
                <div className="mx-2 mt-1 mb-2 p-2 rounded bg-petro-900/60 border border-petro-700/30 space-y-1">
                  {r.definition && (
                    <p className="text-[10px] text-petro-400 leading-relaxed">{r.definition}</p>
                  )}
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[9px] text-petro-500">
                    <span>{t("data.year")}: {r.reference_year}</span>
                    {r.verification_method && (
                      <span>{r.verification_method}</span>
                    )}
                    {r.verified_date && (
                      <span>{t("data.verified")}: {r.verified_date.slice(0, 10)}</span>
                    )}
                  </div>
                  <div className="text-[9px] text-petro-500 truncate">
                    {t("data.source")}: {r.source_name}
                  </div>
                  {r.source_url && (
                    <a
                      href={r.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] text-blue-400 hover:text-blue-300 underline truncate block"
                    >
                      {r.source_url.length > 60 ? r.source_url.slice(0, 60) + "…" : r.source_url}
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
