import { useAppStore } from "../../store/appStore";
import { useI18n } from "../../i18n/useI18n";
import type { CountryImpact, StressStatus } from "../../types";

const STRESS_BG: Record<StressStatus, string> = {
  stable: "bg-green-500/20 text-green-400 border-green-500/30",
  tension: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  critical: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  emergency: "bg-red-500/20 text-red-400 border-red-500/30",
};

const STRESS_BAR: Record<StressStatus, string> = {
  stable: "bg-green-500",
  tension: "bg-yellow-500",
  critical: "bg-orange-500",
  emergency: "bg-red-500",
};

export function ResultsPanel() {
  const { t, stressLabel, lang } = useI18n();
  const currentRun = useAppStore((s) => s.currentRun);
  const countryImpacts = useAppStore((s) => s.countryImpacts);
  const flowImpacts = useAppStore((s) => s.flowImpacts);
  const setSelectedCountryCode = useAppStore((s) => s.setSelectedCountryCode);
  const viewMode = useAppStore((s) => s.viewMode);

  if (!currentRun) {
    return (
      <div className="p-6 text-petro-400 text-sm leading-relaxed">
        {t("results.no_sim")}
      </div>
    );
  }

  const sorted = [...countryImpacts].sort((a, b) => b.stress_score - a.stress_score);
  const emergencyCount = sorted.filter((c) => c.stress_status === "emergency").length;
  const criticalCount = sorted.filter((c) => c.stress_status === "critical").length;
  const tensionCount = sorted.filter((c) => c.stress_status === "tension").length;
  const stableCount = sorted.filter((c) => c.stress_status === "stable").length;

  const topFlows = [...flowImpacts]
    .filter((f) => f.loss_pct > 0)
    .sort((a, b) => b.loss_pct - a.loss_pct)
    .slice(0, 15);

  const summaryText = lang === "fr"
    ? `Cette simulation révèle un stress mondial de ${currentRun.global_stress_score?.toFixed(1) ?? "?"} / 100. ` +
      `La perte totale d'approvisionnement atteint ${currentRun.global_supply_loss_pct?.toFixed(1)}% ` +
      `et l'impact estimé sur les prix du brut est de +${currentRun.estimated_price_impact_pct?.toFixed(1)}%. ` +
      `Sur ${sorted.length} pays analysés, ${emergencyCount} sont en urgence, ` +
      `${criticalCount} en situation critique, ${tensionCount} en tension et ${stableCount} restent stables.`
    : `This simulation reveals a global stress of ${currentRun.global_stress_score?.toFixed(1) ?? "?"} / 100. ` +
      `Total supply loss reaches ${currentRun.global_supply_loss_pct?.toFixed(1)}% ` +
      `and estimated crude price impact is +${currentRun.estimated_price_impact_pct?.toFixed(1)}%. ` +
      `Of ${sorted.length} countries analyzed, ${emergencyCount} are in emergency, ` +
      `${criticalCount} critical, ${tensionCount} in tension, and ${stableCount} remain stable.`;

  return (
    <div className="flex flex-col">
      {/* Narrative summary */}
      <div className="p-4 border-b border-petro-700/50">
        <h3 className="text-sm font-semibold text-petro-100 mb-2">{t("results.title")}</h3>
        <p className="text-xs text-petro-300 leading-relaxed">{summaryText}</p>

        {/* Visual stress bar */}
        <div className="flex h-3 rounded-full overflow-hidden mt-3 gap-0.5">
          {emergencyCount > 0 && (
            <div className="bg-red-500 transition-all" style={{ flex: emergencyCount }} title={`${emergencyCount} ${stressLabel("emergency")}`} />
          )}
          {criticalCount > 0 && (
            <div className="bg-orange-500 transition-all" style={{ flex: criticalCount }} title={`${criticalCount} ${stressLabel("critical")}`} />
          )}
          {tensionCount > 0 && (
            <div className="bg-yellow-500 transition-all" style={{ flex: tensionCount }} title={`${tensionCount} ${stressLabel("tension")}`} />
          )}
          {stableCount > 0 && (
            <div className="bg-green-500 transition-all" style={{ flex: stableCount }} title={`${stableCount} ${stressLabel("stable")}`} />
          )}
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-petro-500">
          <span>{emergencyCount} {stressLabel("emergency")}</span>
          <span>{criticalCount} {stressLabel("critical")}</span>
          <span>{tensionCount} {stressLabel("tension")}</span>
          <span>{stableCount} {stressLabel("stable")}</span>
        </div>
      </div>

      {/* Country impacts */}
      <div className="panel-header">{t("results.countries_affected")} ({sorted.length})</div>
      <div className="divide-y divide-petro-800/50">
        {sorted.map((ci) => (
          <CountryRow
            key={ci.country_code}
            impact={ci}
            showDetail={viewMode === "expert"}
            onClick={() => setSelectedCountryCode(ci.country_code)}
          />
        ))}
      </div>

      {/* Flow impacts */}
      {topFlows.length > 0 && (
        <>
          <div className="panel-header mt-2">{t("results.flow_disruptions")}</div>
          <div className="p-2 space-y-1">
            {topFlows.map((fi) => (
              <FlowRow key={fi.flow_id} fi={fi} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CountryRow({
  impact,
  showDetail,
  onClick,
}: {
  impact: CountryImpact;
  showDetail: boolean;
  onClick: () => void;
}) {
  const { countryName, stressLabel, t } = useI18n();
  const ci = impact;
  const coveragePct = Math.min(ci.demand_coverage_ratio * 100, 100);

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 hover:bg-petro-800/30 transition-colors group"
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-petro-100 group-hover:text-white transition-colors">
            {countryName(ci.country_code)}
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${STRESS_BG[ci.stress_status]}`}>
            {stressLabel(ci.stress_status)}
          </span>
        </div>
        <span className="font-mono text-xs text-petro-300">
          {ci.stress_score.toFixed(0)}/100
        </span>
      </div>

      {/* Coverage bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-petro-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${STRESS_BAR[ci.stress_status]}`}
            style={{ width: `${coveragePct}%` }}
          />
        </div>
        <span className="text-[10px] text-petro-400 w-12 text-right">
          {t("results.coverage")} {coveragePct.toFixed(0)}%
        </span>
      </div>

      {showDetail && (
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-petro-500">
          <div>{t("results.production")}: {ci.production_before.toFixed(2)} → {ci.production_after.toFixed(2)} {t("country.mbpd")}</div>
          <div>{t("results.imports")}: {ci.imports_before.toFixed(2)} → {ci.imports_after.toFixed(2)} {t("country.mbpd")}</div>
          <div>{t("results.exports")}: {ci.exports_before.toFixed(2)} → {ci.exports_after.toFixed(2)} {t("country.mbpd")}</div>
          <div>{t("results.reserves_used")}: {ci.reserve_mobilized_mbpd.toFixed(2)} {t("country.mbpd")}</div>
        </div>
      )}
    </button>
  );
}

function FlowRow({ fi }: { fi: { flow_id: string; volume_before: number; volume_after: number; loss_pct: number; loss_reasons: string[] } }) {
  const { countryName, t } = useI18n();
  const parts = fi.flow_id.split("-");
  const from = parts[0] || fi.flow_id;
  const to = parts[1] || "";

  return (
    <div className="px-3 py-2 rounded bg-petro-900/30 text-xs">
      <div className="flex items-center justify-between">
        <span className="text-petro-200">
          {countryName(from)} → {to ? countryName(to) : "?"}
        </span>
        <span
          className={`font-semibold ${
            fi.loss_pct > 80
              ? "text-red-400"
              : fi.loss_pct > 40
              ? "text-orange-400"
              : "text-yellow-400"
          }`}
        >
          −{fi.loss_pct.toFixed(0)}%
        </span>
      </div>
      <div className="text-[10px] text-petro-500 mt-0.5">
        {fi.volume_before.toFixed(2)} → {fi.volume_after.toFixed(2)} {t("country.mbpd")}
        {fi.loss_reasons.length > 0 && (
          <span className="ml-2 text-petro-600">({fi.loss_reasons[0]})</span>
        )}
      </div>
    </div>
  );
}
