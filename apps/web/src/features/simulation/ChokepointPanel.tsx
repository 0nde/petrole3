import { useAppStore } from "../../store/appStore";
import { useChokepoints } from "../../api/hooks";
import { useI18n } from "../../i18n/useI18n";
import { chokepointProfiles } from "../../data/chokepointProfiles";
import type { Lang } from "../../i18n/translations";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 border-b border-petro-700/50">
      <h4 className="text-xs font-semibold text-petro-300 uppercase tracking-wider mb-2">{title}</h4>
      {children}
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-petro-900/40 rounded px-2.5 py-2">
      <div className="text-[10px] text-petro-500 mb-0.5">{label}</div>
      <div className="text-petro-200 font-medium text-xs">{value}</div>
    </div>
  );
}

export function ChokepointPanel() {
  const { lang, countryName } = useI18n();
  const selectedId = useAppStore((s) => s.selectedChokepointId);
  const setSelectedChokepointId = useAppStore((s) => s.setSelectedChokepointId);
  const setSelectedCountryCode = useAppStore((s) => s.setSelectedCountryCode);
  const { data: chokepoints } = useChokepoints();

  if (!selectedId) {
    return (
      <div className="p-6 text-petro-400 text-sm leading-relaxed">
        {lang === "fr"
          ? "Cliquez sur un point de passage (losange rouge) sur la carte pour voir sa fiche détaillée."
          : "Click on a chokepoint (red diamond) on the map to see its detailed profile."}
      </div>
    );
  }

  const cp = chokepoints?.find((c) => c.id === selectedId);
  const profile = chokepointProfiles[selectedId];
  const l = lang as Lang;

  if (!cp) {
    return (
      <div className="p-6 text-petro-400 text-sm">
        {lang === "fr" ? "Point de passage introuvable." : "Chokepoint not found."}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-petro-700/50">
        <div>
          <h3 className="font-bold text-lg text-petro-100">{cp.name}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-900/30 text-red-400 border border-red-700/30">
              {lang === "fr" ? "Point de passage stratégique" : "Strategic chokepoint"}
            </span>
            <span className="text-[10px] text-petro-500 font-mono">
              {cp.throughput_mbpd} {lang === "fr" ? "Mb/j" : "Mb/d"}
            </span>
          </div>
        </div>
        <button
          onClick={() => setSelectedChokepointId(null)}
          className="text-petro-500 hover:text-petro-200 transition-colors text-sm"
        >
          ✕
        </button>
      </div>

      {/* Quick stats */}
      <div className="p-4 border-b border-petro-700/50">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <InfoPill
            label={lang === "fr" ? "Débit pétrolier" : "Oil throughput"}
            value={`${cp.throughput_mbpd} ${lang === "fr" ? "Mb/j" : "Mb/d"}`}
          />
          <InfoPill
            label={lang === "fr" ? "Part mondiale" : "World share"}
            value={`~${((cp.throughput_mbpd / 100) * 100).toFixed(1)}%`}
          />
        </div>
      </div>

      {profile ? (
        <>
          {/* Location */}
          <Section title={lang === "fr" ? "Localisation" : "Location"}>
            <p className="text-xs text-petro-300 leading-relaxed">{profile.location[l]}</p>
          </Section>

          {/* Dimensions */}
          <Section title={lang === "fr" ? "Dimensions" : "Dimensions"}>
            <p className="text-xs text-petro-300 leading-relaxed">{profile.dimensions[l]}</p>
          </Section>

          {/* Throughput detail */}
          <Section title={lang === "fr" ? "Trafic pétrolier" : "Oil traffic"}>
            <p className="text-xs text-petro-300 leading-relaxed">{profile.throughput[l]}</p>
          </Section>

          {/* History */}
          <Section title={lang === "fr" ? "Histoire" : "History"}>
            <p className="text-xs text-petro-300 leading-relaxed">{profile.history[l]}</p>
          </Section>

          {/* Strategic importance */}
          <Section title={lang === "fr" ? "Importance stratégique" : "Strategic importance"}>
            <p className="text-xs text-petro-300 leading-relaxed">{profile.strategic[l]}</p>
          </Section>

          {/* Real-world impact */}
          <Section title={lang === "fr" ? "Impact réel en cas de blocage" : "Real-world impact if blocked"}>
            <div className="bg-red-950/30 border border-red-800/30 rounded-lg p-3 mb-2">
              <p className="text-xs text-red-200 leading-relaxed">{profile.realWorldImpact[l]}</p>
            </div>
          </Section>

          {/* Key countries */}
          <Section title={lang === "fr" ? "Pays clés concernés" : "Key countries affected"}>
            <div className="flex flex-wrap gap-1.5">
              {profile.keyCountries.map((code) => (
                <button
                  key={code}
                  onClick={() => setSelectedCountryCode(code)}
                  className="text-xs px-2 py-1 rounded bg-petro-800/60 text-petro-200 hover:bg-petro-700/60 hover:text-white transition-colors border border-petro-700/30"
                >
                  {countryName(code)}
                </button>
              ))}
            </div>
          </Section>

          {/* Fun fact */}
          <Section title={lang === "fr" ? "Le saviez-vous ?" : "Did you know?"}>
            <div className="bg-blue-950/30 border border-blue-800/30 rounded-lg p-3">
              <p className="text-xs text-blue-200 leading-relaxed italic">{profile.funFact[l]}</p>
            </div>
          </Section>
        </>
      ) : (
        <div className="p-4 text-xs text-petro-500">
          {lang === "fr"
            ? "Fiche détaillée non disponible pour ce point de passage."
            : "Detailed profile not available for this chokepoint."}
        </div>
      )}
    </div>
  );
}
