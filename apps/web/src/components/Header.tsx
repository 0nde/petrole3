import { useAppStore } from "../store/appStore";
import { useI18n } from "../i18n/useI18n";

export function Header() {
  const viewMode = useAppStore((s) => s.viewMode);
  const setViewMode = useAppStore((s) => s.setViewMode);
  const isSimulating = useAppStore((s) => s.isSimulating);
  const clearResults = useAppStore((s) => s.clearResults);
  const setActivePanel = useAppStore((s) => s.setActivePanel);
  const setSelectedCountryCode = useAppStore((s) => s.setSelectedCountryCode);
  const clearSelectedScenarios = useAppStore((s) => s.clearSelectedScenarios);
  const currentRun = useAppStore((s) => s.currentRun);
  const { t, lang, setLang } = useI18n();

  function handleReset() {
    clearResults();
    clearSelectedScenarios();
    setSelectedCountryCode(null);
    setActivePanel("scenarios");
  }

  return (
    <header className="h-12 bg-petro-900 border-b border-petro-700/50 flex items-center justify-between px-4 shrink-0 z-20">
      <div className="flex items-center gap-3">
        <button onClick={handleReset} className="flex items-center gap-2 hover:opacity-80 transition-opacity" title={lang === "fr" ? "Réinitialiser la simulation" : "Reset simulation"}>
          <div className={`w-2 h-2 rounded-full ${currentRun ? "bg-orange-400" : "bg-petro-400"} animate-pulse`} />
          <span className="font-bold text-petro-100 tracking-tight">PetroSim</span>
        </button>
        <span className="text-xs text-petro-500 hidden sm:inline">{t("app.subtitle")}</span>
        {currentRun && (
          <button onClick={handleReset} className="text-[10px] px-2 py-0.5 rounded bg-orange-900/30 text-orange-400 border border-orange-700/30 hover:bg-orange-900/50 transition-colors">
            {lang === "fr" ? "✕ Réinitialiser" : "✕ Reset"}
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        {isSimulating && (
          <div className="flex items-center gap-2 text-petro-300 text-xs">
            <div className="w-3 h-3 border-2 border-petro-400 border-t-transparent rounded-full animate-spin" />
            {t("scenarios.running")}
          </div>
        )}

        <label className="flex items-center gap-1.5 cursor-pointer opacity-40 hover:opacity-70 transition-opacity" title={lang === "fr" ? "Afficher les détails techniques" : "Show technical details"}>
          <input
            type="checkbox"
            checked={viewMode === "expert"}
            onChange={(e) => setViewMode(e.target.checked ? "expert" : "simple")}
            className="w-3 h-3 rounded border-petro-600 bg-petro-800 text-petro-500 accent-petro-500"
          />
          <span className="text-[10px] text-petro-500">Expert</span>
        </label>

        <button
          onClick={() => setLang(lang === "fr" ? "en" : "fr")}
          className="px-2 py-1 text-xs font-bold rounded border border-petro-700/50 bg-petro-800 text-petro-300 hover:text-white hover:bg-petro-700 transition-colors"
          title={lang === "fr" ? "Switch to English" : "Passer en français"}
        >
          {lang === "fr" ? "EN" : "FR"}
        </button>
      </div>
    </header>
  );
}
