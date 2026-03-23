import { useAppStore } from "../store/appStore";
import { useI18n } from "../i18n/useI18n";

export function GlobalStats() {
  const { t, lang, stressLabel } = useI18n();
  const run = useAppStore((s) => s.currentRun);
  if (!run?.summary) return null;

  const summary = run.summary;
  const stress = run.global_stress_score ?? 0;
  const loss = run.global_supply_loss_pct ?? 0;
  const price = run.estimated_price_impact_pct ?? 0;
  const total = summary.countries_stable + summary.countries_tension + summary.countries_critical + summary.countries_emergency;

  const stressColor = stress > 50 ? "text-red-400" : stress > 25 ? "text-orange-400" : "text-green-400";
  const lossColor = loss > 20 ? "text-red-400" : loss > 10 ? "text-orange-400" : "text-petro-200";

  return (
    <div className="panel px-4 py-2.5 max-w-xl">
      {/* Row 1: Key metrics */}
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="group/tip relative text-center flex-1">
          <div className={`text-lg font-bold ${lossColor}`}>{loss.toFixed(1)}%</div>
          <div className="text-[9px] text-petro-500 uppercase">{t("stats.supply_loss")}</div>
          <div className="hidden group-hover/tip:block absolute left-1/2 -translate-x-1/2 top-full z-30 mt-1 w-52 p-2 rounded-lg bg-petro-900 border border-petro-600/50 shadow-xl text-[10px] text-petro-300 leading-relaxed">
            {lang === "fr"
              ? `${loss.toFixed(1)}% du pétrole mondial en transit n'arrive plus à destination. ${loss > 20 ? "C'est une crise majeure comparable à l'embargo de 1973." : loss > 10 ? "C'est une perturbation significative qui impacte les prix mondiaux." : "L'impact reste gérable pour la plupart des pays."}`
              : `${loss.toFixed(1)}% of world oil in transit can no longer reach its destination. ${loss > 20 ? "This is a major crisis comparable to the 1973 embargo." : loss > 10 ? "This is a significant disruption impacting world prices." : "The impact remains manageable for most countries."}`}
          </div>
        </div>

        <div className="w-px h-8 bg-petro-700/50" />

        <div className="group/tip relative text-center flex-1">
          <div className="text-lg font-bold text-yellow-400">+{price.toFixed(0)}%</div>
          <div className="text-[9px] text-petro-500 uppercase">{t("stats.price_impact")}</div>
          <div className="hidden group-hover/tip:block absolute left-1/2 -translate-x-1/2 top-full z-30 mt-1 w-52 p-2 rounded-lg bg-petro-900 border border-petro-600/50 shadow-xl text-[10px] text-petro-300 leading-relaxed">
            {lang === "fr"
              ? `Le prix du baril augmenterait d'environ +${price.toFixed(0)}%. ${price > 100 ? "À ce niveau, le baril dépasserait 200$, provoquant une récession mondiale." : price > 50 ? "Hausse comparable à la crise de 2008 (147$/baril)." : "Hausse significative mais pas sans précédent."}`
              : `Barrel price would rise by ~+${price.toFixed(0)}%. ${price > 100 ? "At this level, oil would exceed $200/barrel, triggering a global recession." : price > 50 ? "Increase comparable to the 2008 crisis ($147/barrel)." : "Significant but not unprecedented increase."}`}
          </div>
        </div>

        <div className="w-px h-8 bg-petro-700/50" />

        <div className="group/tip relative text-center flex-1">
          <div className={`text-lg font-bold ${stressColor}`}>{stress.toFixed(0)}<span className="text-xs text-petro-500">/100</span></div>
          <div className="text-[9px] text-petro-500 uppercase">{t("stats.global_stress")}</div>
          <div className="hidden group-hover/tip:block absolute right-0 top-full z-30 mt-1 w-52 p-2 rounded-lg bg-petro-900 border border-petro-600/50 shadow-xl text-[10px] text-petro-300 leading-relaxed">
            {lang === "fr"
              ? `Score moyen de stress des ${total} pays analysés. 0 = aucun impact, 100 = crise totale. ${stress > 50 ? "La majorité des pays sont en difficulté." : stress > 25 ? "Plusieurs pays sont en tension ou en crise." : "La plupart des pays restent stables."}`
              : `Average stress score across ${total} countries analyzed. 0 = no impact, 100 = total crisis. ${stress > 50 ? "Most countries are in difficulty." : stress > 25 ? "Several countries are in tension or crisis." : "Most countries remain stable."}`}
          </div>
        </div>
      </div>

      {/* Row 2: Status distribution as colored pills */}
      <div className="flex gap-1.5 justify-center">
        {summary.countries_emergency > 0 && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/20 text-red-400 border border-red-500/30">
            {summary.countries_emergency} {stressLabel("emergency")}
          </span>
        )}
        {summary.countries_critical > 0 && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30">
            {summary.countries_critical} {stressLabel("critical")}
          </span>
        )}
        {summary.countries_tension > 0 && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            {summary.countries_tension} {stressLabel("tension")}
          </span>
        )}
        {summary.countries_stable > 0 && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/20 text-green-400 border border-green-500/30">
            {summary.countries_stable} {stressLabel("stable")}
          </span>
        )}
      </div>
    </div>
  );
}
