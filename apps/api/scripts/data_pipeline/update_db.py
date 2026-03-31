"""Step 4 — UPSERT validated data into PostgreSQL.

Updates:
  - annual_baselines (always): all indicators from OWID + EIA
  - countries table (optional, flag update_simulation_values=True):
      production_mbpd, consumption_mbpd, refining_capacity_mbpd
      → only when EIA data is available (direct Mb/d, confidence >= High)

NOTE: strategic_reserves_mb and reserve_release_rate_mbpd are NOT updated
automatically because EIA/OWID coverage is inconsistent across countries.
Those values remain as curated in data/seed/countries.json.
"""

from __future__ import annotations

import logging
from typing import Any

logger = logging.getLogger(__name__)

# Indicators mapped to countries table columns (EIA-primary only, direct Mb/d)
INDICATOR_TO_COUNTRY_COL: dict[str, str] = {
    "structural_production": "production_mbpd",
    "total_consumption": "consumption_mbpd",
    "refining_capacity": "refining_capacity_mbpd",
}

# Minimum confidence level required to update the simulation (countries) table
REQUIRED_CONFIDENCE_FOR_SIM = {"Very High", "High"}


def update_annual_baselines(
    conn: Any,
    records: list[dict[str, Any]],
    dry_run: bool = False,
) -> dict[str, int]:
    """UPSERT records into annual_baselines.

    Uses DELETE + INSERT strategy (simpler than ON CONFLICT for SQLAlchemy sync).
    Returns counts: {inserted, skipped}.
    """
    from sqlalchemy import text

    if not records:
        return {"inserted": 0, "skipped": 0}

    # Group by (country_code, indicator) for efficient upsert
    by_key: dict[tuple[str, str], dict[str, Any]] = {}
    for r in records:
        key = (r["country_code"], r["indicator"])
        by_key[key] = r

    inserted = 0
    skipped = 0

    for (country_code, indicator), r in by_key.items():
        if dry_run:
            skipped += 1
            continue

        # Delete existing row (if any) for this country+indicator+year
        conn.execute(
            text(
                "DELETE FROM annual_baselines "
                "WHERE country_code = :cc AND indicator = :ind AND reference_year = :yr"
            ),
            {"cc": country_code, "ind": indicator, "yr": r["reference_year"]},
        )

        conn.execute(
            text("""
                INSERT INTO annual_baselines (
                    country_code, indicator, value, unit, reference_year,
                    source_name, source_url, confidence_score,
                    verification_method, verified_date
                ) VALUES (
                    :country_code, :indicator, :value, :unit, :reference_year,
                    :source_name, :source_url, :confidence_score,
                    :verification_method, :verified_date
                )
            """),
            r,
        )
        inserted += 1

    return {"inserted": inserted, "skipped": skipped}


def update_countries_table(
    conn: Any,
    records: list[dict[str, Any]],
    dry_run: bool = False,
) -> dict[str, Any]:
    """Update countries table with EIA-sourced Mb/d values.

    Only updates rows where:
    - indicator maps to a countries column
    - confidence_score is High or Very High
    - verification_method contains 'eia' (EIA data, direct Mb/d)

    Returns a summary dict.
    """
    from sqlalchemy import text
    from app.utils.conversions import iso2_to_iso3

    changes: list[dict[str, Any]] = []

    # Build {iso3: {col: new_val}} map
    updates_by_iso3: dict[str, dict[str, float]] = {}
    for r in records:
        col = INDICATOR_TO_COUNTRY_COL.get(r["indicator"])
        if not col:
            continue
        if r.get("confidence_score") not in REQUIRED_CONFIDENCE_FOR_SIM:
            continue
        if "eia" not in (r.get("verification_method") or "").lower():
            continue
        iso3 = iso2_to_iso3(r["country_code"])
        if iso3 not in updates_by_iso3:
            updates_by_iso3[iso3] = {}
        updates_by_iso3[iso3][col] = r["value"]

    if not updates_by_iso3:
        return {"countries_updated": 0, "changes": []}

    for iso3, cols in sorted(updates_by_iso3.items()):
        # Fetch current value to compute delta
        row = conn.execute(
            text("SELECT code, production_mbpd, consumption_mbpd, refining_capacity_mbpd "
                 "FROM countries WHERE code = :code"),
            {"code": iso3},
        ).fetchone()
        if not row:
            continue

        col_deltas: list[dict[str, Any]] = []
        for col, new_val in cols.items():
            old_val = getattr(row, col, None)
            if old_val is None:
                continue
            pct = abs(new_val - old_val) / max(old_val, 0.001) * 100
            col_deltas.append({"col": col, "old": old_val, "new": new_val, "pct_change": round(pct, 1)})

        if not col_deltas:
            continue

        changes.append({"iso3": iso3, "updates": col_deltas})

        if not dry_run:
            set_clause = ", ".join(f"{c['col']} = :{c['col']}" for c in col_deltas)
            params: dict[str, Any] = {"code": iso3}
            params.update({c["col"]: c["new"] for c in col_deltas})
            conn.execute(
                text(f"UPDATE countries SET {set_clause} WHERE code = :code"),
                params,
            )

    return {"countries_updated": len(changes), "changes": changes}


def run_update(
    sync_db_url: str,
    validated: list[dict[str, Any]],
    update_simulation_values: bool = False,
    dry_run: bool = False,
) -> dict[str, Any]:
    """Main entry point for the DB update step.

    Args:
        sync_db_url: PostgreSQL sync URL (postgresql://...).
        validated:   Output of validate_score.validate_and_score().
        update_simulation_values: Also update the countries simulation table.
        dry_run:     Log what would happen but do NOT write to DB.

    Returns:
        Summary dict consumed by generate_report.
    """
    # In dry_run mode we never touch the database
    if dry_run:
        logger.info("update_db: DRY RUN — skipping DB connection (%d records)", len(validated))
        return {
            "dry_run": True,
            "baselines_inserted": 0,
            "baselines_skipped": len(validated),
            "countries_updated": 0,
            "country_changes": [],
            "total_records": len(validated),
            "unique_countries": len({r["country_code"] for r in validated}),
        }

    from sqlalchemy import create_engine
    from sqlalchemy.orm import Session

    engine = create_engine(sync_db_url, echo=False)

    with Session(engine) as session:
        conn = session.connection()

        baseline_result = update_annual_baselines(conn, validated, dry_run=False)

        countries_result: dict[str, Any] = {"countries_updated": 0, "changes": []}
        if update_simulation_values:
            countries_result = update_countries_table(conn, validated, dry_run=False)

        session.commit()

    summary: dict[str, Any] = {
        "dry_run": dry_run,
        "baselines_inserted": baseline_result["inserted"],
        "baselines_skipped": baseline_result["skipped"],
        "countries_updated": countries_result["countries_updated"],
        "country_changes": countries_result["changes"],
        "total_records": len(validated),
        "unique_countries": len({r["country_code"] for r in validated}),
    }

    logger.info(
        "update_db: baselines=%d, countries=%d (dry_run=%s)",
        baseline_result["inserted"],
        countries_result["countries_updated"],
        dry_run,
    )
    return summary
