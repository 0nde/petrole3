import { useMemo } from "react";
import { useAppStore } from "../../store/appStore";
import { useCountries, useFlows } from "../../api/hooks";
import { useI18n } from "../../i18n/useI18n";
import type { StressStatus } from "../../types";

const STATUS_BG: Record<StressStatus, string> = {
  stable: "bg-green-500/10 border-green-500/30",
  tension: "bg-yellow-500/10 border-yellow-500/30",
  critical: "bg-orange-500/10 border-orange-500/30",
  emergency: "bg-red-500/10 border-red-500/30",
};

const STATUS_TEXT: Record<StressStatus, string> = {
  stable: "text-green-400",
  tension: "text-yellow-400",
  critical: "text-orange-400",
  emergency: "text-red-400",
};

const STATUS_BAR: Record<StressStatus, string> = {
  stable: "bg-green-500",
  tension: "bg-yellow-500",
  critical: "bg-orange-500",
  emergency: "bg-red-500",
};

export function CountryPanel() {
  const { t, lang, countryName, regionName, stressLabel } = useI18n();
  const selectedCode = useAppStore((s) => s.selectedCountryCode);
  const countryImpacts = useAppStore((s) => s.countryImpacts);
  const setSelectedCountryCode = useAppStore((s) => s.setSelectedCountryCode);
  const { data: countries } = useCountries();
  const { data: flows } = useFlows();

  // Compute suppliers and clients from reference flows
  const { suppliers, clients } = useMemo(() => {
    if (!flows || !selectedCode) return { suppliers: [], clients: [] };

    const supMap = new Map<string, number>();
    const cliMap = new Map<string, number>();

    for (const f of flows) {
      if (f.importer_code === selectedCode) {
        supMap.set(f.exporter_code, (supMap.get(f.exporter_code) ?? 0) + f.volume_mbpd);
      }
      if (f.exporter_code === selectedCode) {
        cliMap.set(f.importer_code, (cliMap.get(f.importer_code) ?? 0) + f.volume_mbpd);
      }
    }

    const suppliers = [...supMap.entries()]
      .map(([code, vol]) => ({ code, volume: vol }))
      .sort((a, b) => b.volume - a.volume);

    const clients = [...cliMap.entries()]
      .map(([code, vol]) => ({ code, volume: vol }))
      .sort((a, b) => b.volume - a.volume);

    return { suppliers, clients };
  }, [flows, selectedCode]);

  if (!selectedCode) {
    return (
      <div className="p-6 text-petro-400 text-sm leading-relaxed">
        {t("country.no_selection")}
      </div>
    );
  }

  const country = countries?.find((c) => c.code === selectedCode);
  const impact = countryImpacts.find((ci) => ci.country_code === selectedCode);

  // Supply balance narrative
  const balance = country
    ? country.production_mbpd - country.consumption_mbpd
    : 0;
  const balanceType = balance > 0.05 ? "exporter" : balance < -0.05 ? "importer" : "self";

  const profileNarrative = country
    ? lang === "fr"
      ? `${countryName(country.code)} est situé dans la région ${regionName(country.region_id)}. ` +
        `Le pays produit ${country.production_mbpd.toFixed(2)} Mb/j de pétrole et en consomme ${country.consumption_mbpd.toFixed(2)} Mb/j. ` +
        (balanceType === "exporter"
          ? `C'est un exportateur net avec un excédent de ${balance.toFixed(2)} Mb/j.`
          : balanceType === "importer"
          ? `C'est un importateur net avec un déficit de ${Math.abs(balance).toFixed(2)} Mb/j.`
          : `Sa production couvre à peu près sa consommation.`) +
        (country.strategic_reserves_mb > 0
          ? ` Il dispose de ${country.strategic_reserves_mb.toFixed(0)} Mb de réserves stratégiques` +
            (country.consumption_mbpd > 0
              ? `, soit environ ${Math.round(country.strategic_reserves_mb / country.consumption_mbpd)} ${t("country.days_autonomy")}.`
              : `.`)
          : ``)
      : `${countryName(country.code)} is located in the ${regionName(country.region_id)} region. ` +
        `The country produces ${country.production_mbpd.toFixed(2)} Mb/d of oil and consumes ${country.consumption_mbpd.toFixed(2)} Mb/d. ` +
        (balanceType === "exporter"
          ? `It is a net exporter with a surplus of ${balance.toFixed(2)} Mb/d.`
          : balanceType === "importer"
          ? `It is a net importer with a deficit of ${Math.abs(balance).toFixed(2)} Mb/d.`
          : `Its production roughly covers its consumption.`) +
        (country.strategic_reserves_mb > 0
          ? ` It holds ${country.strategic_reserves_mb.toFixed(0)} Mb in strategic reserves` +
            (country.consumption_mbpd > 0
              ? `, roughly ${Math.round(country.strategic_reserves_mb / country.consumption_mbpd)} ${t("country.days_autonomy")}.`
              : `.`)
          : ``)
    : "";

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-petro-700/50">
        <div>
          <h3 className="font-bold text-lg text-petro-100">
            {country ? countryName(country.code) : selectedCode}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-petro-500 font-mono">{selectedCode}</span>
            {country && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-petro-800/60 text-petro-400">
                {regionName(country.region_id)}
              </span>
            )}
            {balanceType === "exporter" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-900/30 text-green-400 border border-green-700/30">
                {t("country.net_exporter")}
              </span>
            )}
            {balanceType === "importer" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-900/30 text-orange-400 border border-orange-700/30">
                {t("country.net_importer")}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => setSelectedCountryCode(null)}
          className="text-petro-500 hover:text-petro-200 transition-colors text-sm"
        >
          ✕
        </button>
      </div>

      {/* Profile narrative */}
      {country && (
        <div className="p-4 border-b border-petro-700/50">
          <h4 className="text-xs font-semibold text-petro-300 uppercase tracking-wider mb-2">
            {t("country.profile")}
          </h4>
          <p className="text-xs text-petro-300 leading-relaxed">{profileNarrative}</p>
        </div>
      )}

      {/* Key figures */}
      {country && (
        <div className="p-4 border-b border-petro-700/50">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <InfoCell label={t("country.production")} value={`${country.production_mbpd.toFixed(2)} ${t("country.mbpd")}`} />
            <InfoCell label={t("country.consumption")} value={`${country.consumption_mbpd.toFixed(2)} ${t("country.mbpd")}`} />
            <InfoCell label={t("country.refining")} value={`${country.refining_capacity_mbpd.toFixed(2)} ${t("country.mbpd")}`} />
            <InfoCell label={t("country.reserves")} value={`${country.strategic_reserves_mb.toFixed(0)} ${t("country.mb")}`} />
            <InfoCell label={t("country.refining_hub")} value={country.is_refining_hub ? t("country.yes") : t("country.no")} />
            <InfoCell label={t("country.reserve_rate")} value={`${country.reserve_release_rate_mbpd.toFixed(2)} ${t("country.mbpd")}`} />
          </div>
        </div>
      )}

      {/* Top suppliers */}
      {suppliers.length > 0 && (
        <div className="p-4 border-b border-petro-700/50">
          <h4 className="text-xs font-semibold text-petro-300 uppercase tracking-wider mb-2">
            {t("country.top_suppliers")}
          </h4>
          <div className="space-y-1">
            {suppliers.slice(0, 8).map((s) => {
              const totalImports = suppliers.reduce((sum, x) => sum + x.volume, 0);
              const pct = totalImports > 0 ? (s.volume / totalImports) * 100 : 0;
              return (
                <div key={s.code} className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCountryCode(s.code)}
                    className="text-xs text-petro-200 hover:text-white transition-colors w-28 text-left truncate"
                  >
                    {countryName(s.code)}
                  </button>
                  <div className="flex-1 h-1.5 bg-petro-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] text-petro-400 w-16 text-right font-mono">
                    {s.volume.toFixed(2)} {t("country.mbpd")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {suppliers.length === 0 && country && country.consumption_mbpd > country.production_mbpd && (
        <div className="px-4 py-2 text-[10px] text-petro-500">{t("country.no_suppliers")}</div>
      )}

      {/* Top clients */}
      {clients.length > 0 && (
        <div className="p-4 border-b border-petro-700/50">
          <h4 className="text-xs font-semibold text-petro-300 uppercase tracking-wider mb-2">
            {t("country.top_clients")}
          </h4>
          <div className="space-y-1">
            {clients.slice(0, 8).map((c) => {
              const totalExports = clients.reduce((sum, x) => sum + x.volume, 0);
              const pct = totalExports > 0 ? (c.volume / totalExports) * 100 : 0;
              return (
                <div key={c.code} className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCountryCode(c.code)}
                    className="text-xs text-petro-200 hover:text-white transition-colors w-28 text-left truncate"
                  >
                    {countryName(c.code)}
                  </button>
                  <div className="flex-1 h-1.5 bg-petro-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] text-petro-400 w-16 text-right font-mono">
                    {c.volume.toFixed(2)} {t("country.mbpd")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {clients.length === 0 && country && country.production_mbpd > country.consumption_mbpd && (
        <div className="px-4 py-2 text-[10px] text-petro-500">{t("country.no_clients")}</div>
      )}

      {/* Simulation impact */}
      {impact ? (
        <div className="p-4">
          <h4 className="text-xs font-semibold text-petro-300 uppercase tracking-wider mb-2">
            {t("country.impact_title")}
          </h4>

          {/* Status card */}
          <div className={`rounded-lg border p-3 mb-3 ${STATUS_BG[impact.stress_status]}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className={`font-bold text-sm ${STATUS_TEXT[impact.stress_status]}`}>
                {stressLabel(impact.stress_status)}
              </span>
              <span className="text-lg font-bold text-petro-100">
                {impact.stress_score.toFixed(0)}<span className="text-xs text-petro-500">/100</span>
              </span>
            </div>
            {/* Coverage bar */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-petro-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${STATUS_BAR[impact.stress_status]}`}
                  style={{ width: `${Math.min(impact.demand_coverage_ratio * 100, 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-petro-400 w-14 text-right">
                {(impact.demand_coverage_ratio * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Supply balance */}
          <div className="panel-header mb-2">{t("country.balance")}</div>
          <div className="space-y-1 mb-3">
            <BalanceRow label={t("results.production")} before={impact.production_before} after={impact.production_after} unit={t("country.mbpd")} />
            <BalanceRow label={t("results.imports")} before={impact.imports_before} after={impact.imports_after} unit={t("country.mbpd")} />
            <BalanceRow label={t("results.exports")} before={impact.exports_before} after={impact.exports_after} unit={t("country.mbpd")} />
            {impact.reserve_mobilized_mbpd > 0 && (
              <div className="flex items-center justify-between text-xs px-2 py-1.5 bg-blue-900/20 rounded border border-blue-800/30">
                <span className="text-blue-300">{t("results.reserves_used")}</span>
                <span className="font-mono text-blue-200">+{impact.reserve_mobilized_mbpd.toFixed(2)} {t("country.mbpd")}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 text-xs text-petro-500 leading-relaxed">
          {t("country.no_impact")}
        </div>
      )}
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-petro-900/40 rounded px-2.5 py-2">
      <div className="text-[10px] text-petro-500 mb-0.5">{label}</div>
      <div className="text-petro-200 font-medium text-xs">{value}</div>
    </div>
  );
}

function BalanceRow({ label, before, after, unit }: { label: string; before: number; after: number; unit: string }) {
  const delta = after - before;
  const pct = before > 0 ? ((delta / before) * 100) : 0;
  return (
    <div className="flex items-center justify-between text-xs px-2 py-1.5 bg-petro-900/40 rounded">
      <span className="text-petro-300">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-petro-400">{before.toFixed(2)}</span>
        <span className="text-petro-600">→</span>
        <span className="font-mono text-petro-200">{after.toFixed(2)}</span>
        <span className="text-[10px] text-petro-500">{unit}</span>
        {Math.abs(pct) > 0.5 && (
          <span className={`text-[10px] font-medium ${pct < 0 ? "text-red-400" : "text-green-400"}`}>
            {pct > 0 ? "+" : ""}{pct.toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  );
}
