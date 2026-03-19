import { useScenarios, useRunSimulation, useRunCombinedSimulation } from "../../api/hooks";
import { useAppStore } from "../../store/appStore";
import { useI18n } from "../../i18n/useI18n";
import type { Scenario } from "../../types";

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
            <>
              <h3 className="font-semibold text-petro-100 text-sm mb-1">
                {scenarioDisplayName(selectedScenarios[0]!, lang)}
              </h3>
              {scenarioDisplayDesc(selectedScenarios[0]!, lang) && (
                <p className="text-xs text-petro-400 mb-2 leading-relaxed">
                  {scenarioDisplayDesc(selectedScenarios[0]!, lang)}
                </p>
              )}
            </>
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
