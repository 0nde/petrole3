import { useScenarios, useRunSimulation } from "../../api/hooks";
import { useAppStore } from "../../store/appStore";
import { useI18n } from "../../i18n/useI18n";
import type { Scenario } from "../../types";

export function ScenarioPanel() {
  const { t, actionLabel } = useI18n();
  const { data: scenarios, isLoading } = useScenarios();
  const runSim = useRunSimulation();
  const selectedScenario = useAppStore((s) => s.selectedScenario);
  const setSelectedScenario = useAppStore((s) => s.setSelectedScenario);
  const isSimulating = useAppStore((s) => s.isSimulating);

  if (isLoading) {
    return (
      <div className="p-4 text-petro-400 text-sm">{t("scenarios.loading")}</div>
    );
  }

  const presets = scenarios?.filter((s) => s.is_preset) ?? [];
  const custom = scenarios?.filter((s) => !s.is_preset) ?? [];

  function handleSelect(scenario: Scenario) {
    setSelectedScenario(scenario);
  }

  function handleRun() {
    if (!selectedScenario) return;
    runSim.mutate(selectedScenario.id);
  }

  return (
    <div className="flex flex-col h-full">
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
                  isSelected={selectedScenario?.id === s.id}
                  onSelect={() => handleSelect(s)}
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
                  isSelected={selectedScenario?.id === s.id}
                  onSelect={() => handleSelect(s)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected scenario detail + run button */}
      {selectedScenario && (
        <div className="border-t border-petro-700/50 p-4 shrink-0">
          <h3 className="font-semibold text-petro-100 text-sm mb-1">
            {selectedScenario.name}
          </h3>
          {selectedScenario.description && (
            <p className="text-xs text-petro-400 mb-3 leading-relaxed">
              {selectedScenario.description}
            </p>
          )}
          <div className="text-xs text-petro-500 mb-3">
            {selectedScenario.actions.length} action
            {selectedScenario.actions.length !== 1 ? "s" : ""}:
            {selectedScenario.actions.map((a, i) => (
              <span key={i} className="ml-1 badge bg-petro-800 text-petro-300">
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
              t("scenarios.run")
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
  const { t, actionLabel } = useI18n();
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
          {scenario.name}
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
