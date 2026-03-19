import { useAppStore } from "../store/appStore";
import { useI18n } from "../i18n/useI18n";

const STATUS_COLORS: Record<string, string> = {
  stable: "text-stress-stable",
  tension: "text-stress-tension",
  critical: "text-stress-critical",
  emergency: "text-stress-emergency",
};

export function GlobalStats() {
  const { t, stressLabel } = useI18n();
  const run = useAppStore((s) => s.currentRun);
  if (!run?.summary) return null;

  const summary = run.summary;

  return (
    <div className="panel flex items-center gap-6 px-5 py-3">
      <StatBlock
        value={`${run.global_supply_loss_pct?.toFixed(1) ?? 0}%`}
        label={t("stats.supply_loss")}
        color={
          (run.global_supply_loss_pct ?? 0) > 20
            ? "text-stress-emergency"
            : (run.global_supply_loss_pct ?? 0) > 10
            ? "text-stress-critical"
            : "text-petro-200"
        }
      />
      <Divider />
      <StatBlock
        value={`+${run.estimated_price_impact_pct?.toFixed(0) ?? 0}%`}
        label={t("stats.price_impact")}
        color="text-stress-tension"
      />
      <Divider />
      <StatBlock
        value={`${run.global_stress_score?.toFixed(0) ?? 0}`}
        label={t("stats.global_stress")}
        color={
          (run.global_stress_score ?? 0) > 50
            ? "text-stress-emergency"
            : (run.global_stress_score ?? 0) > 25
            ? "text-stress-critical"
            : "text-petro-200"
        }
      />
      <Divider />
      <div className="flex gap-3 text-xs">
        <span className={STATUS_COLORS.stable}>{summary.countries_stable} {stressLabel("stable")}</span>
        <span className={STATUS_COLORS.tension}>{summary.countries_tension} {stressLabel("tension")}</span>
        <span className={STATUS_COLORS.critical}>{summary.countries_critical} {stressLabel("critical")}</span>
        <span className={STATUS_COLORS.emergency}>{summary.countries_emergency} {stressLabel("emergency")}</span>
      </div>
      <Divider />
      <div className="text-xs text-petro-400">
        {t("stats.duration")} {run.duration_ms}ms
      </div>
    </div>
  );
}

function StatBlock({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="text-center">
      <div className={`stat-value text-lg ${color}`}>{value}</div>
      <div className="stat-label text-[10px]">{label}</div>
    </div>
  );
}

function Divider() {
  return <div className="w-px h-8 bg-petro-700/50" />;
}
