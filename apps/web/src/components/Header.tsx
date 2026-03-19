import { useAppStore } from "../store/appStore";
import { useI18n } from "../i18n/useI18n";
import type { ViewMode } from "../types";

export function Header() {
  const viewMode = useAppStore((s) => s.viewMode);
  const setViewMode = useAppStore((s) => s.setViewMode);
  const isSimulating = useAppStore((s) => s.isSimulating);
  const { t, lang, setLang } = useI18n();

  return (
    <header className="h-12 bg-petro-900 border-b border-petro-700/50 flex items-center justify-between px-4 shrink-0 z-20">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-petro-400 animate-pulse" />
          <span className="font-bold text-petro-100 tracking-tight">PetroSim</span>
        </div>
        <span className="text-xs text-petro-500 hidden sm:inline">{t("app.subtitle")}</span>
      </div>

      <div className="flex items-center gap-4">
        {isSimulating && (
          <div className="flex items-center gap-2 text-petro-300 text-xs">
            <div className="w-3 h-3 border-2 border-petro-400 border-t-transparent rounded-full animate-spin" />
            {t("scenarios.running")}
          </div>
        )}

        <div className="flex rounded-md border border-petro-700/50 overflow-hidden">
          {(["simple", "expert"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                viewMode === mode
                  ? "bg-petro-600 text-white"
                  : "bg-petro-800 text-petro-400 hover:text-petro-200"
              }`}
            >
              {t(mode === "simple" ? "mode.simple" : "mode.expert")}
            </button>
          ))}
        </div>

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
