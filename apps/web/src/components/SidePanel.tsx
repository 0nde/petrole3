import { useAppStore } from "../store/appStore";
import { useI18n } from "../i18n/useI18n";
import { ScenarioPanel } from "../features/scenarios/ScenarioPanel";
import { ResultsPanel } from "../features/simulation/ResultsPanel";
import { JournalPanel } from "../features/simulation/JournalPanel";
import { CountryPanel } from "../features/simulation/CountryPanel";
import type { ActivePanel } from "../types";
import type { TranslationKey } from "../i18n/translations";

const TABS: { id: ActivePanel; labelKey: TranslationKey }[] = [
  { id: "scenarios", labelKey: "tab.scenarios" },
  { id: "results", labelKey: "tab.results" },
  { id: "journal", labelKey: "tab.journal" },
  { id: "country", labelKey: "tab.country" },
];

export function SidePanel() {
  const activePanel = useAppStore((s) => s.activePanel);
  const setActivePanel = useAppStore((s) => s.setActivePanel);
  const currentRun = useAppStore((s) => s.currentRun);
  const { t } = useI18n();

  return (
    <div className="h-full flex flex-col bg-petro-950/95 backdrop-blur-md border-l border-petro-700/50">
      {/* Tab bar */}
      <div className="flex border-b border-petro-700/50 shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActivePanel(tab.id)}
            className={`flex-1 px-2 py-2.5 text-xs font-medium transition-colors ${
              activePanel === tab.id
                ? "text-petro-200 border-b-2 border-petro-400 bg-petro-900/50"
                : "text-petro-500 hover:text-petro-300"
            }`}
          >
            {t(tab.labelKey)}
            {tab.id === "results" && currentRun && (
              <span className="ml-1 w-1.5 h-1.5 rounded-full bg-petro-400 inline-block" />
            )}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto">
        {activePanel === "scenarios" && <ScenarioPanel />}
        {activePanel === "results" && <ResultsPanel />}
        {activePanel === "journal" && <JournalPanel />}
        {activePanel === "country" && <CountryPanel />}
      </div>
    </div>
  );
}
