import { useState } from "react";
import { useAppStore } from "../../store/appStore";
import { useI18n } from "../../i18n/useI18n";
import type { SimulationStep } from "../../types";

const RULE_COLORS: Record<string, string> = {
  INIT: "bg-petro-700/40 text-petro-300 border-petro-600/30",
  A: "bg-red-900/40 text-red-300 border-red-700/30",
  B: "bg-orange-900/40 text-orange-300 border-orange-700/30",
  C: "bg-yellow-900/40 text-yellow-300 border-yellow-700/30",
  D: "bg-emerald-900/40 text-emerald-300 border-emerald-700/30",
  E: "bg-cyan-900/40 text-cyan-300 border-cyan-700/30",
  F: "bg-blue-900/40 text-blue-300 border-blue-700/30",
  G: "bg-indigo-900/40 text-indigo-300 border-indigo-700/30",
  H: "bg-purple-900/40 text-purple-300 border-purple-700/30",
  I: "bg-pink-900/40 text-pink-300 border-pink-700/30",
  DEMAND: "bg-amber-900/40 text-amber-300 border-amber-700/30",
  DONE: "bg-petro-700/40 text-petro-300 border-petro-600/30",
};

const RULE_ICONS: Record<string, string> = {
  INIT: "🔧",
  A: "⚓",
  B: "🚫",
  C: "⛏️",
  D: "🏠",
  E: "🏭",
  F: "🛢️",
  G: "📊",
  H: "⚠️",
  I: "💰",
  DEMAND: "📈",
  DONE: "✅",
};

/** Generate a literary, pedagogical explanation for a journal step. */
function narrativeForStep(step: SimulationStep, lang: string, countryName: (code: string) => string): string {
  const { rule_id, description, affected_entities, detail } = step;
  const countries = (affected_entities?.countries as string[] | undefined) ?? [];
  const countryList = countries.slice(0, 5).map(countryName).join(", ");
  const moreCount = countries.length > 5 ? countries.length - 5 : 0;

  if (rule_id === "INIT") {
    const c = detail?.countries as number ?? 0;
    const f = detail?.flows as number ?? 0;
    const cp = detail?.chokepoints as number ?? 0;
    return lang === "fr"
      ? `Le moteur de simulation est initialisé avec ${c} pays, ${f} flux commerciaux pétroliers et ${cp} points de passage stratégiques. L'ensemble des données de référence est chargé et prêt pour l'analyse.`
      : `The simulation engine is initialized with ${c} countries, ${f} oil trade flows, and ${cp} strategic chokepoints. All reference data is loaded and ready for analysis.`;
  }

  if (rule_id === "A") {
    return lang === "fr"
      ? `${description} Les flux maritime transitant par ce point de passage sont interrompus, affectant directement les pays qui en dépendent pour leurs importations ou exportations de pétrole.`
      : `${description} Maritime flows transiting through this chokepoint are disrupted, directly affecting countries that depend on it for their oil imports or exports.`;
  }

  if (rule_id === "B") {
    return lang === "fr"
      ? `${description} L'embargo coupe les exportations de pétrole du pays ciblé vers les marchés internationaux, forçant les pays importateurs à trouver des sources alternatives.`
      : `${description} The embargo cuts off oil exports from the targeted country to international markets, forcing importing countries to find alternative sources.`;
  }

  if (rule_id === "C") {
    const affected = countryList || (lang === "fr" ? "pays producteur" : "producing country");
    return lang === "fr"
      ? `La production pétrolière est ajustée pour ${affected}. Ce changement modifie la quantité de pétrole disponible à l'exportation et pour la consommation domestique.`
      : `Oil production is adjusted for ${affected}. This change modifies the amount of oil available for export and domestic consumption.`;
  }

  if (rule_id === "D") {
    return lang === "fr"
      ? `Chaque pays producteur réserve en priorité une part de sa production pour sa propre consommation domestique avant d'exporter le surplus. ${countries.length > 0 ? `${countryList}${moreCount > 0 ? ` et ${moreCount} autres` : ""} sont concernés.` : ""}`
      : `Each producing country prioritizes a share of its production for domestic consumption before exporting the surplus. ${countries.length > 0 ? `${countryList}${moreCount > 0 ? ` and ${moreCount} more` : ""} are affected.` : ""}`;
  }

  if (rule_id === "E") {
    return lang === "fr"
      ? `Les perturbations se propagent à travers les hubs de raffinage. Les pays qui dépendent de pétrole brut importé pour leur raffinage voient leur capacité de transformation réduite, créant un effet domino sur leurs exportations de produits raffinés.${countries.length > 0 ? ` Hubs affectés : ${countryList}.` : ""}`
      : `Disruptions cascade through refining hubs. Countries that depend on imported crude for refining see their processing capacity reduced, creating a domino effect on their refined product exports.${countries.length > 0 ? ` Affected hubs: ${countryList}.` : ""}`;
  }

  if (rule_id === "F") {
    return lang === "fr"
      ? `Face aux pénuries, les pays disposant de réserves stratégiques de pétrole les mobilisent pour compenser partiellement le déficit d'approvisionnement.${countries.length > 0 ? ` ${countryList}${moreCount > 0 ? ` et ${moreCount} autres` : ""} libèrent leurs réserves.` : ""}`
      : `Facing shortages, countries with strategic petroleum reserves mobilize them to partially offset the supply deficit.${countries.length > 0 ? ` ${countryList}${moreCount > 0 ? ` and ${moreCount} more` : ""} release their reserves.` : ""}`;
  }

  if (rule_id === "G") {
    return lang === "fr"
      ? `Le ratio de couverture de la demande est calculé pour chaque pays : il compare l'offre disponible (production domestique + importations + réserves libérées) à la consommation nationale. Un ratio inférieur à 100% signifie une pénurie.`
      : `The demand coverage ratio is calculated for each country: it compares available supply (domestic production + imports + released reserves) to national consumption. A ratio below 100% means a shortage.`;
  }

  if (rule_id === "H") {
    return lang === "fr"
      ? `Chaque pays reçoit un score de stress basé sur sa couverture de demande. Les seuils sont : stable (couverture ≥ 90%), tension (70-90%), critique (50-70%), urgence (< 50%).${countries.length > 0 ? ` ${countryList}${moreCount > 0 ? ` et ${moreCount} autres` : ""} voient leur statut évalué.` : ""}`
      : `Each country receives a stress score based on its demand coverage. Thresholds are: stable (coverage ≥ 90%), tension (70-90%), critical (50-70%), emergency (< 50%).${countries.length > 0 ? ` ${countryList}${moreCount > 0 ? ` and ${moreCount} more` : ""} have their status assessed.` : ""}`;
  }

  if (rule_id === "I") {
    const pricePct = detail?.estimated_price_impact_pct as number | undefined;
    const priceStr = pricePct != null ? `+${pricePct.toFixed(1)}%` : "";
    return lang === "fr"
      ? `L'impact global sur les prix du pétrole est estimé via un modèle d'élasticité. La perte totale d'offre sur le marché mondial entraîne une hausse estimée des prix de ${priceStr}. Ce calcul prend en compte le volume de pétrole perdu par rapport à l'offre mondiale totale.`
      : `The global oil price impact is estimated via an elasticity model. The total loss of supply on the world market leads to an estimated price increase of ${priceStr}. This calculation accounts for the volume of oil lost relative to total global supply.`;
  }

  if (rule_id === "DEMAND") {
    return lang === "fr"
      ? `Un choc de demande est appliqué. ${description}`
      : `A demand shock is applied. ${description}`;
  }

  if (rule_id === "DONE") {
    const ms = detail?.duration_ms as number | undefined;
    return lang === "fr"
      ? `La simulation est terminée${ms != null ? ` en ${ms} ms` : ""}. Tous les indicateurs ont été calculés : scores de stress par pays, couverture de la demande, impact sur les prix et bilan des flux perturbés.`
      : `The simulation is complete${ms != null ? ` in ${ms}ms` : ""}. All indicators have been computed: per-country stress scores, demand coverage, price impact, and disrupted flow summary.`;
  }

  return description;
}

export function JournalPanel() {
  const { t, lang } = useI18n();
  const journalSteps = useAppStore((s) => s.journalSteps);
  const currentRun = useAppStore((s) => s.currentRun);

  if (!currentRun) {
    return (
      <div className="p-6 text-petro-400 text-sm leading-relaxed">
        {t("journal.no_sim")}
      </div>
    );
  }

  if (journalSteps.length === 0) {
    return (
      <div className="p-6 text-petro-400 text-sm">
        {lang === "fr" ? "Aucune entrée de journal enregistrée." : "No journal entries recorded."}
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="panel-header mb-2">
        {t("journal.title")} ({journalSteps.length} {lang === "fr" ? "étapes" : "steps"})
      </div>
      <div className="space-y-2">
        {journalSteps.map((step) => (
          <JournalEntry key={step.step_number} step={step} />
        ))}
      </div>
    </div>
  );
}

function JournalEntry({ step }: { step: SimulationStep }) {
  const { lang, ruleName, countryName } = useI18n();
  const viewMode = useAppStore((s) => s.viewMode);
  const [showDetail, setShowDetail] = useState(false);

  const ruleColor = RULE_COLORS[step.rule_id] ?? "bg-petro-800 text-petro-300 border-petro-700/30";
  const icon = RULE_ICONS[step.rule_id] ?? "📋";
  const narrative = narrativeForStep(step, lang, countryName);
  const affectedCountries = (step.affected_entities?.countries as string[] | undefined) ?? [];

  return (
    <div className="rounded-lg bg-petro-900/40 border border-petro-800/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-petro-800/30">
        <span className="text-sm">{icon}</span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${ruleColor}`}>
          {ruleName(step.rule_id)}
        </span>
        <span className="text-[10px] text-petro-600 ml-auto font-mono">
          {lang === "fr" ? "étape" : "step"} {step.step_number}
        </span>
      </div>

      {/* Narrative body */}
      <div className="px-3 py-2.5">
        <p className="text-xs text-petro-200 leading-relaxed">
          {narrative}
        </p>

        {/* Affected countries as badges (simple mode) */}
        {affectedCountries.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-2">
            {affectedCountries.slice(0, 8).map((code) => (
              <span key={code} className="text-[10px] px-1.5 py-0.5 rounded bg-petro-800/60 text-petro-400">
                {countryName(code)}
              </span>
            ))}
            {affectedCountries.length > 8 && (
              <span className="text-[10px] text-petro-600">
                +{affectedCountries.length - 8} {lang === "fr" ? "autres" : "more"}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Expert detail toggle */}
      {viewMode === "expert" && step.detail && Object.keys(step.detail).length > 0 && (
        <div className="border-t border-petro-800/30">
          <button
            onClick={() => setShowDetail(!showDetail)}
            className="w-full text-left px-3 py-1.5 text-[10px] text-petro-500 hover:text-petro-300 transition-colors"
          >
            {showDetail
              ? (lang === "fr" ? "▾ Masquer les détails techniques" : "▾ Hide technical detail")
              : (lang === "fr" ? "▸ Voir les détails techniques" : "▸ Show technical detail")}
          </button>
          {showDetail && (
            <pre className="px-3 pb-2 text-[10px] text-petro-500 font-mono bg-petro-950/30 overflow-x-auto max-h-32">
              {JSON.stringify(step.detail, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
