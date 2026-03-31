"""Step 5 — Generate a Markdown report for GitHub Job Summary / S3.

The report covers:
  - Confidence badge distribution (Very High / High / Medium / Low)
  - Countries with significant value changes (> 10 %)
  - Counts of inserted / skipped baselines
  - Optional: countries table updates
"""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from typing import Any

logger = logging.getLogger(__name__)

# Change threshold considered "significant" (% absolute relative change)
SIGNIFICANT_CHANGE_PCT = 10.0


def _confidence_emoji(score: str) -> str:
    return {
        "Very High": "🟢",
        "High": "🟡",
        "Medium": "🟠",
        "Low": "🔴",
        "Hypothesis": "🔵",
    }.get(score, "⚪")


def generate_report(
    validated: list[dict[str, Any]],
    update_summary: dict[str, Any],
    year: int,
    environment: str,
    dry_run: bool,
) -> dict[str, Any]:
    """Build a Markdown report and return it along with structured data.

    Returns:
        {
          "markdown": "...",
          "json_summary": {...},
        }
    """
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    mode_label = "🔍 DRY RUN" if dry_run else "✅ APPLIED"
    env_label = environment.upper()

    # ── Confidence distribution ───────────────────────────────────────────────
    confidence_counts: dict[str, int] = {}
    for r in validated:
        cs = r.get("confidence_score", "Low")
        confidence_counts[cs] = confidence_counts.get(cs, 0) + 1

    total_records = len(validated)
    unique_countries = len({r["country_code"] for r in validated})

    # ── Significant changes in country simulation table ───────────────────────
    significant_changes = [
        c for c in update_summary.get("country_changes", [])
        for u in c["updates"]
        if u["pct_change"] >= SIGNIFICANT_CHANGE_PCT
    ]

    # ── Markdown build ────────────────────────────────────────────────────────
    lines: list[str] = []
    lines.append(f"# 🛢️ PetroSim — Mise à jour des données pays ({year})")
    lines.append("")
    lines.append(f"| Champ | Valeur |")
    lines.append(f"|---|---|")
    lines.append(f"| **Statut** | {mode_label} |")
    lines.append(f"| **Environnement** | `{env_label}` |")
    lines.append(f"| **Année de données** | {year} |")
    lines.append(f"| **Exécuté le** | {now} |")
    lines.append(f"| **Pays couverts** | {unique_countries} |")
    lines.append(f"| **Indicateurs traités** | {total_records} |")
    lines.append("")

    # Confidence breakdown
    lines.append("## 📊 Répartition des badges de confiance")
    lines.append("")
    lines.append("| Badge | Score | Indicateurs |")
    lines.append("|---|---|---|")
    for score in ["Very High", "High", "Medium", "Low", "Hypothesis"]:
        count = confidence_counts.get(score, 0)
        pct = round(count / total_records * 100, 1) if total_records else 0
        lines.append(f"| {_confidence_emoji(score)} | **{score}** | {count} ({pct} %) |")
    lines.append("")

    # Baseline update counts
    lines.append("## 🗄️ Mises à jour base de données")
    lines.append("")
    lines.append(f"- **annual_baselines** insérés : `{update_summary.get('baselines_inserted', 0)}`")
    lines.append(f"- **annual_baselines** ignorés (dry run) : `{update_summary.get('baselines_skipped', 0)}`")
    lines.append(f"- **countries** mis à jour : `{update_summary.get('countries_updated', 0)}`")
    lines.append("")

    # Significant country changes
    if significant_changes:
        lines.append(f"## ⚠️ Changements significatifs (> {SIGNIFICANT_CHANGE_PCT} %)")
        lines.append("")
        lines.append("| Pays (ISO-3) | Colonne | Avant | Après | Δ % |")
        lines.append("|---|---|---|---|---|")
        for c in significant_changes:
            iso3 = c["iso3"]
            for u in c["updates"]:
                if u["pct_change"] >= SIGNIFICANT_CHANGE_PCT:
                    lines.append(
                        f"| `{iso3}` | `{u['col']}` | {u['old']:.3f} | {u['new']:.3f} | **{u['pct_change']} %** |"
                    )
        lines.append("")
        lines.append("> ⚠️ Vérifiez ces changements avant de valider la mise à jour.")
        lines.append("")

    # Data sources
    lines.append("## 📚 Sources de données")
    lines.append("")
    lines.append("| Source | Indicateurs | Lien |")
    lines.append("|---|---|---|")
    lines.append("| Our World in Data (OWID) | Énergie, électricité, climat | https://github.com/owid/energy-data |")
    lines.append("| EIA International | Production, consommation (Mb/j) | https://www.eia.gov/opendata/ |")
    lines.append("")

    if dry_run:
        lines.append("---")
        lines.append("**Mode DRY RUN** — Aucune donnée n'a été écrite en base.")
        lines.append("Relancer avec `dry_run: false` pour appliquer les changements.")

    markdown = "\n".join(lines)

    json_summary: dict[str, Any] = {
        "year": year,
        "environment": environment,
        "dry_run": dry_run,
        "generated_at": now,
        "total_records": total_records,
        "unique_countries": unique_countries,
        "confidence_distribution": confidence_counts,
        "baselines_inserted": update_summary.get("baselines_inserted", 0),
        "baselines_skipped": update_summary.get("baselines_skipped", 0),
        "countries_updated": update_summary.get("countries_updated", 0),
        "significant_changes_count": len(significant_changes),
    }

    logger.info(
        "Report generated: %d records, %d countries, %d significant changes",
        total_records,
        unique_countries,
        len(significant_changes),
    )

    return {"markdown": markdown, "json_summary": json_summary}
