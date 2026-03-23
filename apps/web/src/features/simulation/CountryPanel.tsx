import { useMemo, useState } from "react";
import { useAppStore } from "../../store/appStore";
import { useCountries, useFlows, useCountryBaselines, useCountryTrade } from "../../api/hooks";
import { useI18n } from "../../i18n/useI18n";
import { stressConsequences } from "../../data/stressConsequences";
import { getTradeProfile } from "../../data/countryTradeProfiles";
import { DataSection } from "../../components/DataSection";
import { ConfidenceBadge } from "../../components/ConfidenceBadge";
import type { StressStatus, BaselineRecord } from "../../types";
import type { Lang } from "../../i18n/translations";

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

const ISO3_TO_ISO2: Record<string, string> = {
  USA: "US", FRA: "FR", CHN: "CN", RUS: "RU", SAU: "SA", DEU: "DE", JPN: "JP",
  IND: "IN", GBR: "GB", BRA: "BR", KOR: "KR", ITA: "IT", ESP: "ES", NLD: "NL",
  CAN: "CA", MEX: "MX", NOR: "NO", AUS: "AU", NGA: "NG", DZA: "DZ", LBY: "LY",
  AGO: "AO", ARE: "AE", KWT: "KW", QAT: "QA", IRQ: "IQ", IRN: "IR", OMN: "OM",
  BHR: "BH", ISR: "IL", TUR: "TR", POL: "PL", CZE: "CZ", IRL: "IE", AUT: "AT",
  DNK: "DK", HUN: "HU", SWE: "SE", FIN: "FI", PRT: "PT", GRC: "GR", SVK: "SK",
  NZL: "NZ", BEL: "BE", CHE: "CH", ROU: "RO", BGR: "BG", HRV: "HR", SVN: "SI",
  LTU: "LT", EST: "EE", LVA: "LV", IDN: "ID", THA: "TH", MYS: "MY", SGP: "SG",
  PHL: "PH", VNM: "VN", TWN: "TW", PAK: "PK", BGD: "BD", MMR: "MM", EGY: "EG",
  ZAF: "ZA", COL: "CO", VEN: "VE", ECU: "EC", PER: "PE", CHL: "CL", TTO: "TT",
  CUB: "CU", BOL: "BO", ARG: "AR", KAZ: "KZ", AZE: "AZ", TKM: "TM", UZB: "UZ",
  BLR: "BY", GHA: "GH", CIV: "CI", CMR: "CM", TUN: "TN", GAB: "GA", COG: "CG",
  GNQ: "GQ", TCD: "TD", SSD: "SS", SDN: "SD", YEM: "YE", LBN: "LB", GUY: "GY",
  JOR: "JO", SYR: "SY", MOZ: "MZ",
};

const PARTNER_TO_ISO3: Record<string, string> = {
  "Russia": "RUS", "Saudi Arabia": "SAU", "United States": "USA", "China": "CHN",
  "India": "IND", "Japan": "JPN", "South Korea": "KOR", "Germany": "DEU",
  "France": "FRA", "Italy": "ITA", "Spain": "ESP", "Netherlands": "NLD",
  "United Kingdom": "GBR", "Canada": "CAN", "Brazil": "BRA", "Norway": "NOR",
  "Nigeria": "NGA", "Angola": "AGO", "Algeria": "DZA", "Libya": "LBY",
  "Kazakhstan": "KAZ", "Iraq": "IRQ", "Iran": "IRN", "Kuwait": "KWT",
  "United Arab Emirates": "ARE", "Qatar": "QAT", "Oman": "OMN", "Mexico": "MEX",
  "Colombia": "COL", "Venezuela": "VEN", "Ecuador": "ECU", "Azerbaijan": "AZE",
  "Egypt": "EGY", "Turkey": "TUR", "Indonesia": "IDN", "Malaysia": "MYS",
  "Singapore": "SGP", "Thailand": "THA", "Vietnam": "VNM", "Philippines": "PHL",
  "Australia": "AUS", "Poland": "POL", "Belgium": "BEL", "Sweden": "SWE",
  "Taiwan": "TWN", "Pakistan": "PAK", "South Africa": "ZAF", "Bahrain": "BHR",
  "Gabon": "GAB", "Republic of the Congo": "COG", "Guyana": "GUY", "Argentina": "ARG",
  "Trinidad and Tobago": "TTO", "Peru": "PER", "Chile": "CHL", "Finland": "FIN",
  "Czech Republic": "CZE", "Hungary": "HUN", "Romania": "ROU", "Portugal": "PRT",
  "Greece": "GRC", "Austria": "AUT", "New Zealand": "NZL", "Bangladesh": "BGD",
};

function fmtVal(v: number, unit: string): string {
  if (unit === "%" || unit === "pct") return `${v.toFixed(1)}%`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (v >= 1000) return v.toLocaleString("en", { maximumFractionDigits: 0 });
  if (v >= 10) return v.toFixed(1);
  return v.toFixed(2);
}

function getBaselineValue(baselines: BaselineRecord[] | undefined, indicator: string): BaselineRecord | undefined {
  return baselines?.find((b) => b.indicator === indicator);
}

export function CountryPanel() {
  const { t, lang, countryName, regionName, stressLabel } = useI18n();
  const selectedCode = useAppStore((s) => s.selectedCountryCode);
  const countryImpacts = useAppStore((s) => s.countryImpacts);
  const setSelectedCountryCode = useAppStore((s) => s.setSelectedCountryCode);
  const { data: countries } = useCountries();
  const { data: flows } = useFlows();
  const [showMoreData, setShowMoreData] = useState(false);

  const iso2Code = useMemo(() => {
    if (!selectedCode) return null;
    return ISO3_TO_ISO2[selectedCode] ?? null;
  }, [selectedCode]);

  const { data: baselines } = useCountryBaselines(iso2Code);
  const { data: comtradeTrade } = useCountryTrade(iso2Code);

  // Compute suppliers and clients from simulation flows
  const { suppliers, clients } = useMemo(() => {
    if (!flows || !selectedCode) return { suppliers: [], clients: [] };
    const supMap = new Map<string, number>();
    const cliMap = new Map<string, number>();
    for (const f of flows) {
      if (f.importer_code === selectedCode) supMap.set(f.exporter_code, (supMap.get(f.exporter_code) ?? 0) + f.volume_mbpd);
      if (f.exporter_code === selectedCode) cliMap.set(f.importer_code, (cliMap.get(f.importer_code) ?? 0) + f.volume_mbpd);
    }
    return {
      suppliers: [...supMap.entries()].map(([code, vol]) => ({ code, volume: vol })).sort((a, b) => b.volume - a.volume),
      clients: [...cliMap.entries()].map(([code, vol]) => ({ code, volume: vol })).sort((a, b) => b.volume - a.volume),
    };
  }, [flows, selectedCode]);

  if (!selectedCode) {
    return <div className="p-6 text-petro-400 text-sm leading-relaxed">{t("country.no_selection")}</div>;
  }

  const country = countries?.find((c) => c.code === selectedCode);
  const impact = countryImpacts.find((ci) => ci.country_code === selectedCode);
  const l = lang as Lang;

  // Use backbone values when available, fallback to country table
  const allBaselines = baselines?.all;
  const prod = getBaselineValue(allBaselines, "structural_production");
  const cons = getBaselineValue(allBaselines, "total_consumption");
  const ref = getBaselineValue(allBaselines, "refining_capacity");
  const res = getBaselineValue(allBaselines, "strategic_reserves");
  const oilShare = getBaselineValue(allBaselines, "oil_share_energy");

  const prodMbpd = country?.production_mbpd ?? 0;
  const consMbpd = country?.consumption_mbpd ?? 0;
  const balance = prodMbpd - consMbpd;
  const balanceType = balance > 0.05 ? "exporter" : balance < -0.05 ? "importer" : "self";
  const dataYear = prod?.reference_year ?? cons?.reference_year ?? 2023;

  // Build narrative from backbone data when available
  const profileNarrative = country
    ? lang === "fr"
      ? `${countryName(country.code)} (${regionName(country.region_id)}) produit ${prodMbpd.toFixed(2)} Mb/j et consomme ${consMbpd.toFixed(2)} Mb/j` +
        (prod ? ` (${prod.value.toFixed(0)} TWh, ${dataYear}).` : `.`) + " " +
        (balanceType === "exporter" ? `Exportateur net (+${balance.toFixed(2)} Mb/j).` : balanceType === "importer" ? `Importateur net (déficit ${Math.abs(balance).toFixed(2)} Mb/j).` : `Autosuffisant.`) +
        (country.strategic_reserves_mb > 0 ? ` Réserves stratégiques : ${country.strategic_reserves_mb.toFixed(0)} Mb (~${Math.round(country.strategic_reserves_mb / consMbpd)} jours).` : "") +
        (oilShare ? ` Le pétrole représente ${oilShare.value.toFixed(1)}% de l'énergie primaire.` : "")
      : `${countryName(country.code)} (${regionName(country.region_id)}) produces ${prodMbpd.toFixed(2)} Mb/d and consumes ${consMbpd.toFixed(2)} Mb/d` +
        (prod ? ` (${prod.value.toFixed(0)} TWh, ${dataYear}).` : `.`) + " " +
        (balanceType === "exporter" ? `Net exporter (+${balance.toFixed(2)} Mb/d).` : balanceType === "importer" ? `Net importer (deficit ${Math.abs(balance).toFixed(2)} Mb/d).` : `Self-sufficient.`) +
        (country.strategic_reserves_mb > 0 ? ` Strategic reserves: ${country.strategic_reserves_mb.toFixed(0)} Mb (~${Math.round(country.strategic_reserves_mb / consMbpd)} days).` : "") +
        (oilShare ? ` Oil represents ${oilShare.value.toFixed(1)}% of primary energy.` : "")
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
        <button onClick={() => setSelectedCountryCode(null)} className="text-petro-500 hover:text-petro-200 transition-colors text-sm">✕</button>
      </div>

      {/* Profile narrative */}
      {country && (
        <div className="p-4 border-b border-petro-700/50">
          <h4 className="text-xs font-semibold text-petro-300 uppercase tracking-wider mb-2">{t("country.profile")}</h4>
          <p className="text-xs text-petro-300 leading-relaxed">{profileNarrative}</p>
        </div>
      )}

      {/* Key petroleum figures — always visible */}
      {country && (
        <div className="p-4 border-b border-petro-700/50">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <InfoCell label={t("country.production")} value={`${prodMbpd.toFixed(2)} ${t("country.mbpd")}`} badge={prod} />
            <InfoCell label={t("country.consumption")} value={`${consMbpd.toFixed(2)} ${t("country.mbpd")}`} badge={cons} />
            <InfoCell label={t("country.refining")} value={ref ? `${fmtVal(ref.value, ref.unit)} ${ref.unit}` : `${country.refining_capacity_mbpd.toFixed(2)} ${t("country.mbpd")}`} badge={ref} />
            <InfoCell label={t("country.reserves")} value={`${country.strategic_reserves_mb.toFixed(0)} ${t("country.mb")}`} badge={res} />
            <InfoCell label={t("country.refining_hub")} value={country.is_refining_hub ? t("country.yes") : t("country.no")} />
            <InfoCell label={t("country.reserve_rate")} value={`${country.reserve_release_rate_mbpd.toFixed(2)} ${t("country.mbpd")}`} />
          </div>
        </div>
      )}

      {/* Suppliers — Comtrade with click + tooltips, OR simulation flows fallback */}
      {comtradeTrade && comtradeTrade.length > 0 ? (
        <div className="border-b border-petro-700/50">
          <div className="px-4 py-2 flex items-center gap-1.5">
            <h4 className="text-xs font-semibold text-petro-300 uppercase tracking-wider">
              {t("country.top_suppliers")}
            </h4>
            <span className="text-[10px] text-petro-600 ml-auto">
              {comtradeTrade[0]?.source_name} ({comtradeTrade[0]?.reference_year})
            </span>
          </div>
          <div className="px-4 pb-3 space-y-1.5">
            {comtradeTrade.slice(0, 10).map((tf) => {
              const iso3 = PARTNER_TO_ISO3[tf.partner_country];
              const tp = iso3 ? getTradeProfile(iso3) : null;
              return (
                <div key={tf.id} className="group/tip relative">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => iso3 && setSelectedCountryCode(iso3)}
                      className={`text-[11px] flex-1 text-left truncate ${iso3 ? "text-petro-200 hover:text-white underline decoration-dotted decoration-petro-600 underline-offset-2 cursor-pointer" : "text-petro-300"}`}
                    >
                      {tf.partner_country}
                    </button>
                    <span className="text-xs font-bold text-blue-400 w-12 text-right">{tf.percentage.toFixed(1)}%</span>
                    <div className="w-16 h-1.5 bg-petro-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(tf.percentage, 100)}%` }} />
                    </div>
                    <span className="text-[9px] text-petro-500 w-14 text-right font-mono">{tf.quantity.toFixed(0)} {tf.unit}</span>
                  </div>
                  {tp && (
                    <div className="hidden group-hover/tip:block absolute left-0 right-0 top-full z-20 mt-1 p-2.5 rounded-lg bg-petro-900 border border-petro-600/50 shadow-xl text-[10px] leading-relaxed">
                      <div className="font-bold text-petro-200 mb-1">{tp.role[l]}</div>
                      <p className="text-petro-400 mb-1">{(tp.whyExporter || tp.whyImporter)?.[l]}</p>
                      <p className="text-blue-300 italic">{tp.keyFact[l]}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : suppliers.length > 0 ? (() => {
        const totalImports = suppliers.reduce((sum, x) => sum + x.volume, 0);
        const shown = suppliers.slice(0, 8);
        return (
          <div className="p-4 border-b border-petro-700/50">
            <h4 className="text-xs font-semibold text-petro-300 uppercase tracking-wider mb-2">
              {t("country.top_suppliers")}
              <span className="ml-2 text-[10px] font-normal text-petro-500">({totalImports.toFixed(2)} {t("country.mbpd")})</span>
            </h4>
            <div className="space-y-1.5">
              {shown.map((s) => {
                const pct = totalImports > 0 ? (s.volume / totalImports) * 100 : 0;
                const tp = getTradeProfile(s.code);
                return (
                  <div key={s.code} className="group/tip relative">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSelectedCountryCode(s.code)} className="text-xs text-petro-200 hover:text-white transition-colors w-24 text-left truncate underline decoration-dotted decoration-petro-600 underline-offset-2">
                        {countryName(s.code)}
                      </button>
                      <span className="text-xs font-bold text-blue-400 w-10 text-right">{pct.toFixed(0)}%</span>
                      <div className="flex-1 h-1.5 bg-petro-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] text-petro-500 w-14 text-right font-mono">{s.volume.toFixed(2)}</span>
                    </div>
                    {tp && (
                      <div className="hidden group-hover/tip:block absolute left-0 right-0 top-full z-20 mt-1 p-2.5 rounded-lg bg-petro-900 border border-petro-600/50 shadow-xl text-[10px] leading-relaxed">
                        <div className="font-bold text-petro-200 mb-1">{tp.role[l]}</div>
                        <p className="text-petro-400 mb-1">{(tp.whyExporter || tp.whyImporter)?.[l]}</p>
                        <p className="text-blue-300 italic">{tp.keyFact[l]}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })() : null}

      {/* Top clients — simulation flows with click + tooltips */}
      {clients.length > 0 && (() => {
        const totalExports = clients.reduce((sum, x) => sum + x.volume, 0);
        const shown = clients.slice(0, 8);
        return (
          <div className="p-4 border-b border-petro-700/50">
            <h4 className="text-xs font-semibold text-petro-300 uppercase tracking-wider mb-2">
              {t("country.top_clients")}
              <span className="ml-2 text-[10px] font-normal text-petro-500">({totalExports.toFixed(2)} {t("country.mbpd")})</span>
            </h4>
            <div className="space-y-1.5">
              {shown.map((c) => {
                const pct = totalExports > 0 ? (c.volume / totalExports) * 100 : 0;
                const tp = getTradeProfile(c.code);
                return (
                  <div key={c.code} className="group/tip relative">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSelectedCountryCode(c.code)} className="text-xs text-petro-200 hover:text-white transition-colors w-24 text-left truncate underline decoration-dotted decoration-petro-600 underline-offset-2">
                        {countryName(c.code)}
                      </button>
                      <span className="text-xs font-bold text-emerald-400 w-10 text-right">{pct.toFixed(0)}%</span>
                      <div className="flex-1 h-1.5 bg-petro-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] text-petro-500 w-14 text-right font-mono">{c.volume.toFixed(2)}</span>
                    </div>
                    {tp && (
                      <div className="hidden group-hover/tip:block absolute left-0 right-0 top-full z-20 mt-1 p-2.5 rounded-lg bg-petro-900 border border-petro-600/50 shadow-xl text-[10px] leading-relaxed">
                        <div className="font-bold text-petro-200 mb-1">{tp.role[l]}</div>
                        <p className="text-petro-400 mb-1">{(tp.whyImporter || tp.whyExporter)?.[l]}</p>
                        <p className="text-emerald-300 italic">{tp.keyFact[l]}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* More data — energy, electricity, climate (collapsed by default) */}
      {baselines && (baselines.energy_structure.length > 0 || baselines.electricity_mix.length > 0 || baselines.climate.length > 0) && (
        <div className="border-b border-petro-700/50">
          <button
            onClick={() => setShowMoreData(!showMoreData)}
            className="w-full px-4 py-2 flex items-center gap-1.5 text-left hover:bg-petro-800/20 transition-colors"
          >
            <span className={`text-[10px] transition-transform ${showMoreData ? "rotate-90" : ""}`}>&#9654;</span>
            <span className="text-[10px] font-semibold text-petro-400 uppercase tracking-wider">
              {lang === "fr" ? "Données énergie & climat" : "Energy & climate data"}
            </span>
            <span className="text-[9px] text-petro-600 ml-auto">
              {baselines.energy_structure.length + baselines.electricity_mix.length + baselines.climate.length}
            </span>
          </button>
          {showMoreData && (
            <>
              <DataSection titleKey="data.energy_structure" icon="⚡" records={baselines.energy_structure} />
              <DataSection titleKey="data.electricity_mix" icon="🔌" records={baselines.electricity_mix} />
              <DataSection titleKey="data.climate" icon="🌍" records={baselines.climate} />
            </>
          )}
        </div>
      )}

      {/* Simulation impact */}
      {impact ? (
        <div className="p-4">
          <h4 className="text-xs font-semibold text-petro-300 uppercase tracking-wider mb-2">
            {t("country.impact_title")}
          </h4>

          <div className={`rounded-lg border p-3 mb-3 ${STATUS_BG[impact.stress_status]}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className={`font-bold text-sm ${STATUS_TEXT[impact.stress_status]}`}>
                {stressLabel(impact.stress_status)}
              </span>
              <span className="text-lg font-bold text-petro-100">
                {impact.stress_score.toFixed(0)}<span className="text-xs text-petro-500">/100</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-petro-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${STATUS_BAR[impact.stress_status]}`} style={{ width: `${Math.min(impact.demand_coverage_ratio * 100, 100)}%` }} />
              </div>
              <span className="text-[10px] text-petro-400 w-14 text-right">{(impact.demand_coverage_ratio * 100).toFixed(1)}%</span>
            </div>
          </div>

          {(() => {
            const sc = stressConsequences[impact.stress_status];
            if (!sc) return null;
            return (
              <div className="mb-3 space-y-2">
                <p className="text-xs text-petro-300 leading-relaxed">{sc.summary[l]}</p>
                <div className="space-y-1">
                  {sc.consequences[l].slice(0, 4).map((c, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-petro-400">
                      <span className="mt-0.5 shrink-0">•</span><span>{c}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-petro-800/60 text-petro-400">
                    {lang === "fr" ? "Impact prix" : "Price impact"}: {sc.oilPriceRange[l]}
                  </span>
                </div>
                <div className="bg-petro-900/50 rounded p-2 border border-petro-700/30">
                  <div className="text-[10px] text-petro-500 mb-0.5">{lang === "fr" ? "Précédent historique" : "Historical precedent"}</div>
                  <p className="text-[11px] text-petro-400 leading-relaxed italic">{sc.historicalExample[l]}</p>
                </div>
              </div>
            );
          })()}

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
        <div className="p-4 text-xs text-petro-500 leading-relaxed">{t("country.no_impact")}</div>
      )}
    </div>
  );
}

function InfoCell({ label, value, badge }: { label: string; value: string; badge?: BaselineRecord }) {
  return (
    <div className="bg-petro-900/40 rounded px-2.5 py-2">
      <div className="flex items-center justify-between">
        <div className="text-[10px] text-petro-500 mb-0.5">{label}</div>
        {badge && <ConfidenceBadge score={badge.confidence_score} />}
      </div>
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
