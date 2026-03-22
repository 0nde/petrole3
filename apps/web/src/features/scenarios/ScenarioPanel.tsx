import { useState } from "react";
import { useScenarios, useRunSimulation, useRunCombinedSimulation } from "../../api/hooks";
import { useAppStore } from "../../store/appStore";
import { useI18n } from "../../i18n/useI18n";
import { getScenarioIntel } from "../../data/scenarioIntelligence";
import type { Scenario } from "../../types";
import type { Lang } from "../../i18n/translations";

function scenarioDisplayName(s: Scenario, lang: string): string {
  return lang === "fr" && s.name_fr ? s.name_fr : s.name;
}

function scenarioDisplayDesc(s: Scenario, lang: string): string | null {
  return lang === "fr" && s.description_fr ? s.description_fr : s.description;
}

export function ScenarioPanel() {
  const { t, lang, actionLabel } = useI18n();
  const { data: scenarios, isLoading } = useScenarios();
  const runSim = useRunSimulation();
  const runCombined = useRunCombinedSimulation();
  const selectedScenarios = useAppStore((s) => s.selectedScenarios);
  const toggleScenario = useAppStore((s) => s.toggleScenario);
  const isSimulating = useAppStore((s) => s.isSimulating);

  if (isLoading) {
    return (
      <div className="p-4 text-petro-400 text-sm">{t("scenarios.loading")}</div>
    );
  }

  const presets = scenarios?.filter((s) => s.is_preset) ?? [];
  const custom = scenarios?.filter((s) => !s.is_preset) ?? [];
  const selectedIds = new Set(selectedScenarios.map((s) => s.id));
  const totalActions = selectedScenarios.reduce((sum, s) => sum + s.actions.length, 0);

  function handleRun() {
    if (selectedScenarios.length === 0) return;
    if (selectedScenarios.length === 1) {
      runSim.mutate(selectedScenarios[0]!.id);
    } else {
      runCombined.mutate(selectedScenarios.map((s) => s.id));
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Help text */}
      <div className="px-3 py-2 text-[10px] text-petro-500 border-b border-petro-800/50">
        {lang === "fr"
          ? "Cliquez pour sélectionner un ou plusieurs scénarios, puis lancez la simulation."
          : "Click to select one or more scenarios, then run the simulation."}
        {selectedScenarios.length > 1 && (
          <span className="ml-1 text-blue-400 font-medium">
            {lang === "fr"
              ? `${selectedScenarios.length} scénarios combinés`
              : `${selectedScenarios.length} scenarios combined`}
          </span>
        )}
      </div>

      {/* Scenario list */}
      <div className="flex-1 overflow-y-auto">
        {presets.length > 0 && (
          <div>
            <div className="panel-header">{t("scenarios.preset")}</div>
            <div className="p-2 space-y-1">
              {presets.map((s) => (
                <ScenarioCard
                  key={s.id}
                  scenario={s}
                  isSelected={selectedIds.has(s.id)}
                  onSelect={() => toggleScenario(s)}
                />
              ))}
            </div>
          </div>
        )}

        {custom.length > 0 && (
          <div>
            <div className="panel-header">{t("scenarios.custom")}</div>
            <div className="p-2 space-y-1">
              {custom.map((s) => (
                <ScenarioCard
                  key={s.id}
                  scenario={s}
                  isSelected={selectedIds.has(s.id)}
                  onSelect={() => toggleScenario(s)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected scenario(s) detail + run button */}
      {selectedScenarios.length > 0 && (
        <div className="border-t border-petro-700/50 p-4 shrink-0">
          {selectedScenarios.length === 1 ? (
            <SingleScenarioDetail scenario={selectedScenarios[0]!} lang={lang} />
          ) : (
            <>
              <h3 className="font-semibold text-blue-300 text-sm mb-1">
                {lang === "fr" ? "Simulation combinée" : "Combined Simulation"}
              </h3>
              <div className="space-y-0.5 mb-2">
                {selectedScenarios.map((s) => (
                  <div key={s.id} className="text-[11px] text-petro-300">
                    • {scenarioDisplayName(s, lang)}
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="text-xs text-petro-500 mb-3 flex flex-wrap gap-1">
            <span>{totalActions} action{totalActions !== 1 ? "s" : ""}:</span>
            {selectedScenarios.flatMap((s) => s.actions).map((a, i) => (
              <span key={i} className="badge bg-petro-800 text-petro-300">
                {actionLabel(a.action_type)}
              </span>
            ))}
          </div>
          <button
            onClick={handleRun}
            disabled={isSimulating}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSimulating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t("scenarios.running")}
              </span>
            ) : (
              selectedScenarios.length > 1
                ? (lang === "fr" ? `Lancer la combinaison (${selectedScenarios.length} scénarios)` : `Run combined (${selectedScenarios.length} scenarios)`)
                : t("scenarios.run")
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function ScenarioCard({
  scenario,
  isSelected,
  onSelect,
}: {
  scenario: Scenario;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { t, lang, actionLabel } = useI18n();
  const actionTypes = [...new Set(scenario.actions.map((a) => a.action_type))];

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-md transition-all ${
        isSelected
          ? "bg-petro-700/50 border border-petro-500/50 ring-1 ring-petro-400/30"
          : "bg-petro-900/30 border border-transparent hover:bg-petro-800/50 hover:border-petro-700/30"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="font-medium text-sm text-petro-100">
          {lang === "fr" && scenario.name_fr ? scenario.name_fr : scenario.name}
        </div>
        {scenario.is_preset && (
          <span className="badge bg-petro-700 text-petro-300 text-[10px] ml-2 shrink-0">
            {t("scenarios.preset_badge")}
          </span>
        )}
      </div>
      <div className="flex gap-1 mt-1.5 flex-wrap">
        {actionTypes.map((type) => (
          <span
            key={type}
            className="text-[10px] px-1.5 py-0.5 rounded bg-petro-800/80 text-petro-400"
          >
            {actionLabel(type)}
          </span>
        ))}
        <span className="text-[10px] text-petro-500">
          {scenario.actions.length} action{scenario.actions.length !== 1 ? "s" : ""}
        </span>
      </div>
    </button>
  );
}

function SingleScenarioDetail({ scenario, lang }: { scenario: Scenario; lang: string }) {
  const [showIntel, setShowIntel] = useState(false);
  const l = lang as Lang;
  const intel = getScenarioIntel(scenario);
  const desc = scenarioDisplayDesc(scenario, lang);

  return (
    <>
      <h3 className="font-semibold text-petro-100 text-sm mb-1">
        {scenarioDisplayName(scenario, lang)}
      </h3>
      {desc && (
        <p className="text-xs text-petro-400 mb-2 leading-relaxed">{desc}</p>
      )}

      {intel && (
        <>
          <button
            onClick={() => setShowIntel(!showIntel)}
            className="text-[10px] text-blue-400 hover:text-blue-300 mb-2 flex items-center gap-1"
          >
            <span className={`transition-transform ${showIntel ? "rotate-90" : ""}`}>&#9654;</span>
            {lang === "fr" ? "Intelligence détaillée" : "Detailed intelligence"}
          </button>

          {showIntel && (
            <div className="space-y-2.5 mb-3 max-h-[40vh] overflow-y-auto pr-1">
              <IntelBlock
                icon="🚢"
                title={lang === "fr" ? "Volume en transit" : "Transit volume"}
                content={intel.transitVolume[l]}
              />

              <IntelBlock
                icon="📤"
                title={lang === "fr" ? "Exportateurs impactés" : "Affected exporters"}
              >
                {intel.affectedExporters[l].map((e, i) => (
                  <div key={i} className="text-[10px] text-orange-300/80">• {e}</div>
                ))}
              </IntelBlock>

              <IntelBlock
                icon="📥"
                title={lang === "fr" ? "Importateurs impactés" : "Affected importers"}
              >
                {intel.affectedImporters[l].map((e, i) => (
                  <div key={i} className="text-[10px] text-red-300/80">• {e}</div>
                ))}
              </IntelBlock>

              <IntelBlock
                icon="🔗"
                title={lang === "fr" ? "Flux clés" : "Key flows"}
              >
                {intel.keyFlows[l].map((f, i) => (
                  <div key={i} className="text-[10px] text-petro-300 font-mono">• {f}</div>
                ))}
              </IntelBlock>

              <IntelBlock
                icon="🌐"
                title={lang === "fr" ? "Contexte géopolitique" : "Geopolitical context"}
                content={intel.geopoliticalContext[l]}
              />

              <IntelBlock
                icon="⚠️"
                title={lang === "fr" ? "Pourquoi c'est critique" : "Why it matters"}
                content={intel.whyItMatters[l]}
              />
            </div>
          )}
        </>
      )}
    </>
  );
}

function IntelBlock({
  icon,
  title,
  content,
  children,
}: {
  icon: string;
  title: string;
  content?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded bg-petro-900/50 border border-petro-700/30 p-2">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-[10px]">{icon}</span>
        <span className="text-[10px] font-semibold text-petro-300 uppercase tracking-wider">{title}</span>
      </div>
      {content && <p className="text-[10px] text-petro-400 leading-relaxed">{content}</p>}
      {children}
    </div>
  );
}
