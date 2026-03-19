import { useState } from "react";
import { useI18n } from "../../i18n/useI18n";
import { sectorImpacts, SEVERITY_LABELS, SEVERITY_BG } from "../../data/crisisTimeline";
import type { SectorImpact } from "../../data/crisisTimeline";
import type { Lang } from "../../i18n/translations";

const PHASES = ["0-3d", "4-14d", "2-6w", "2-6m", "6m+"] as const;
const PHASE_LABELS: Record<string, { en: string; fr: string }> = {
  "0-3d": { en: "0–3 days", fr: "0–3 jours" },
  "4-14d": { en: "4–14 days", fr: "4–14 jours" },
  "2-6w": { en: "2–6 weeks", fr: "2–6 sem." },
  "2-6m": { en: "2–6 months", fr: "2–6 mois" },
  "6m+": { en: "6+ months", fr: "6+ mois" },
};

function SeverityDot({ severity }: { severity: number }) {
  const colors = ["bg-green-400", "bg-yellow-400", "bg-orange-400", "bg-red-400"];
  return (
    <div className={`w-3 h-3 rounded-full ${colors[severity]} shrink-0`} />
  );
}

function SectorRow({ sector, expanded, onToggle, lang }: {
  sector: SectorImpact;
  expanded: boolean;
  onToggle: () => void;
  lang: Lang;
}) {
  return (
    <div className="border border-petro-700/30 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full text-left px-3 py-2.5 flex items-center gap-2 hover:bg-petro-800/30 transition-colors"
      >
        <span className="text-base">{sector.icon}</span>
        <span className="text-xs font-medium text-petro-100 flex-1">{sector.name[lang]}</span>

        {/* Mini severity bar for all phases */}
        <div className="flex gap-0.5">
          {PHASES.map((phase) => {
            const tp = sector.timeline.find((t) => t.phase === phase);
            const sev = tp?.severity ?? 0;
            const colors = ["bg-green-500/40", "bg-yellow-500/60", "bg-orange-500/70", "bg-red-500/80"];
            return <div key={phase} className={`w-3 h-3 rounded-sm ${colors[sev]}`} />;
          })}
        </div>

        <span className="text-[10px] text-petro-500 ml-1">{expanded ? "▾" : "▸"}</span>
      </button>

      {expanded && (
        <div className="border-t border-petro-700/30">
          {/* Oil dependency explanation */}
          <div className="px-3 py-2 bg-petro-900/50">
            <div className="text-[10px] text-petro-500 uppercase tracking-wider mb-1">
              {lang === "fr" ? "Dépendance au pétrole" : "Oil dependency"}
            </div>
            <p className="text-[11px] text-petro-300 leading-relaxed">{sector.oilDependency[lang]}</p>
          </div>

          {/* Timeline phases */}
          <div className="divide-y divide-petro-800/30">
            {sector.timeline.map((tp) => (
              <div key={tp.phase} className={`px-3 py-2 ${SEVERITY_BG[tp.severity]}`}>
                <div className="flex items-center gap-2 mb-1">
                  <SeverityDot severity={tp.severity} />
                  <span className="text-[10px] font-bold text-petro-200">{tp.phaseLabel[lang]}</span>
                  <span className={`text-[10px] font-medium ${SEVERITY_LABELS[tp.severity]!.color}`}>
                    {SEVERITY_LABELS[tp.severity]![lang]}
                  </span>
                </div>
                <p className="text-[11px] text-petro-300 leading-relaxed ml-5">{tp.impact[lang]}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function CrisisTimelinePanel() {
  const { lang } = useI18n();
  const [expandedSector, setExpandedSector] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"sectors" | "timeline">("sectors");

  const l = lang as Lang;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-petro-700/50">
        <h3 className="text-sm font-semibold text-petro-100 mb-1">
          {l === "fr" ? "Impact sur l'économie réelle" : "Real Economy Impact"}
        </h3>
        <p className="text-[10px] text-petro-400 leading-relaxed mb-2">
          {l === "fr"
            ? "Le pétrole ne sert pas qu'à faire rouler les voitures. Il est la matière première de la quasi-totalité de l'économie moderne : médicaments, nourriture, vêtements, plastiques, construction, électronique. Voici comment une crise pétrolière se propage à chaque secteur, du premier jour aux conséquences à long terme."
            : "Oil isn't just for cars. It is the raw material for nearly the entire modern economy: medicine, food, clothing, plastics, construction, electronics. Here's how an oil crisis cascades through every sector, from day one to long-term consequences."}
        </p>

        {/* View toggle */}
        <div className="flex rounded-md border border-petro-700/50 overflow-hidden">
          <button
            onClick={() => setViewMode("sectors")}
            className={`flex-1 px-2 py-1 text-[10px] font-medium transition-colors ${
              viewMode === "sectors" ? "bg-petro-600 text-white" : "bg-petro-800 text-petro-400"
            }`}
          >
            {l === "fr" ? "Par secteur" : "By sector"}
          </button>
          <button
            onClick={() => setViewMode("timeline")}
            className={`flex-1 px-2 py-1 text-[10px] font-medium transition-colors ${
              viewMode === "timeline" ? "bg-petro-600 text-white" : "bg-petro-800 text-petro-400"
            }`}
          >
            {l === "fr" ? "Chronologie" : "Timeline"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {viewMode === "sectors" ? (
          <div className="space-y-1.5">
            {sectorImpacts.map((sector) => (
              <SectorRow
                key={sector.id}
                sector={sector}
                expanded={expandedSector === sector.id}
                onToggle={() => setExpandedSector(expandedSector === sector.id ? null : sector.id)}
                lang={l}
              />
            ))}
          </div>
        ) : (
          /* Timeline view: show all sectors per phase */
          <div className="space-y-3">
            {PHASES.map((phase) => {
              const phaseLabel = PHASE_LABELS[phase]![l];
              const sectorsInPhase = sectorImpacts
                .map((s) => ({ sector: s, tp: s.timeline.find((t) => t.phase === phase) }))
                .filter((x) => x.tp && x.tp.severity > 0)
                .sort((a, b) => (b.tp?.severity ?? 0) - (a.tp?.severity ?? 0));

              if (sectorsInPhase.length === 0) return null;

              return (
                <div key={phase}>
                  <div className="text-xs font-bold text-petro-200 mb-1.5 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-petro-700/50">{phaseLabel}</span>
                    <span className="text-[10px] text-petro-500 font-normal">
                      {sectorsInPhase.length} {l === "fr" ? "secteurs touchés" : "sectors affected"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {sectorsInPhase.map(({ sector, tp }) => (
                      <div key={sector.id} className={`px-2.5 py-2 rounded ${SEVERITY_BG[tp!.severity]} border border-petro-700/20`}>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm">{sector.icon}</span>
                          <span className="text-[11px] font-medium text-petro-100">{sector.name[l]}</span>
                          <SeverityDot severity={tp!.severity} />
                          <span className={`text-[10px] ${SEVERITY_LABELS[tp!.severity]!.color}`}>
                            {SEVERITY_LABELS[tp!.severity]![l]}
                          </span>
                        </div>
                        <p className="text-[10px] text-petro-400 leading-relaxed ml-6">{tp!.impact[l]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="p-2 border-t border-petro-700/50 flex items-center justify-between text-[10px] text-petro-500">
        <span>{l === "fr" ? "Sévérité :" : "Severity:"}</span>
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-1">
              <SeverityDot severity={s} />
              <span className={SEVERITY_LABELS[s]!.color}>{SEVERITY_LABELS[s]![l]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
