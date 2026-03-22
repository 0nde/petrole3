"""Import petrole-datas backbone (SQLite) into PetroSim PostgreSQL.

This script:
1. Reads all data from petrole_backbone.db (SQLite)
2. Inserts into the new enriched tables (annual_baselines, trade_flows_detailed,
   verification_logs, simulation_parameters_data)
3. Updates the countries table with converted Mb/d values from TWh baselines

Usage:
    cd apps/api
    python -m scripts.seed_backbone --sqlite-path "../../petrole_backbone.db"
"""

from __future__ import annotations

import argparse
import sqlite3
from pathlib import Path

from sqlalchemy import create_engine, text

from app.config import settings
from app.utils.conversions import twh_to_mbpd, kbd_to_mbpd, iso2_to_iso3


BACKBONE_DEFAULT = Path(__file__).resolve().parent.parent.parent.parent.parent / "petrole-datas" / "petrole_backbone.db"


def get_sqlite_rows(conn: sqlite3.Connection, table: str) -> list[dict]:
    """Read all rows from a SQLite table as list of dicts."""
    conn.row_factory = sqlite3.Row
    cursor = conn.execute(f"SELECT * FROM {table}")  # noqa: S608
    return [dict(row) for row in cursor.fetchall()]


def seed_backbone(pg_url: str, sqlite_path: str) -> None:
    sqlite_conn = sqlite3.connect(sqlite_path)
    pg_engine = create_engine(pg_url, echo=False)

    with pg_engine.connect() as pg:
        # ── 1. Clear enriched tables ──
        print("Clearing enriched tables...")
        for table in [
            "verification_logs",
            "simulation_parameters_data",
            "trade_flows_detailed",
            "annual_baselines",
        ]:
            pg.execute(text(f"DELETE FROM {table}"))

        # ── 2. Import annual_baselines (1,638 rows) ──
        print("Importing annual_baselines...")
        baselines = get_sqlite_rows(sqlite_conn, "annualbaseline")
        count = 0
        for r in baselines:
            pg.execute(
                text("""
                    INSERT INTO annual_baselines (
                        id, country_code, indicator, value, unit, reference_year,
                        source_name, source_url, definition, confidence_score,
                        verification_method, verified_date, raw_source_snippet
                    ) VALUES (
                        :id, :country_code, :indicator, :value, :unit, :reference_year,
                        :source_name, :source_url, :definition, :confidence_score,
                        :verification_method, :verified_date, :raw_source_snippet
                    )
                """),
                {
                    "id": r["id"],
                    "country_code": r["country_code"],
                    "indicator": r["indicator"],
                    "value": r["value"],
                    "unit": r["unit"],
                    "reference_year": r["reference_year"],
                    "source_name": r["source_name"],
                    "source_url": r.get("source_url"),
                    "definition": r.get("definition"),
                    "confidence_score": r.get("confidence_score", "Low"),
                    "verification_method": r.get("verification_method"),
                    "verified_date": r.get("verified_date"),
                    "raw_source_snippet": r.get("raw_source_snippet"),
                },
            )
            count += 1
        print(f"  → {count} annual baselines imported")

        # ── 3. Import trade_flows_detailed (265 rows) ──
        print("Importing trade_flows_detailed...")
        trades = get_sqlite_rows(sqlite_conn, "tradeflow")
        count = 0
        for r in trades:
            pg.execute(
                text("""
                    INSERT INTO trade_flows_detailed (
                        id, country_code, flow_type, partner_country, quantity, unit,
                        percentage, reference_year, reference_month, source_name,
                        source_url, confidence_score, verification_method, verified_date
                    ) VALUES (
                        :id, :country_code, :flow_type, :partner_country, :quantity, :unit,
                        :percentage, :reference_year, :reference_month, :source_name,
                        :source_url, :confidence_score, :verification_method, :verified_date
                    )
                """),
                {
                    "id": r["id"],
                    "country_code": r["country_code"],
                    "flow_type": r.get("flow_type", "import"),
                    "partner_country": r["partner_country"],
                    "quantity": r["quantity"],
                    "unit": r.get("unit", "kt"),
                    "percentage": r["percentage"],
                    "reference_year": r["reference_year"],
                    "reference_month": r.get("reference_month"),
                    "source_name": r["source_name"],
                    "source_url": r.get("source_url"),
                    "confidence_score": r.get("confidence_score", "High"),
                    "verification_method": r.get("verification_method"),
                    "verified_date": r.get("verified_date"),
                },
            )
            count += 1
        print(f"  → {count} trade flows imported")

        # ── 4. Import verification_logs (1,638 rows) ──
        print("Importing verification_logs...")
        logs = get_sqlite_rows(sqlite_conn, "verificationlog")
        count = 0
        for r in logs:
            pg.execute(
                text("""
                    INSERT INTO verification_logs (
                        id, table_name, record_id, country_code, indicator,
                        claimed_value, source_url, verification_date, method,
                        found_value, match, tolerance_pct, raw_snippet, result, notes
                    ) VALUES (
                        :id, :table_name, :record_id, :country_code, :indicator,
                        :claimed_value, :source_url, :verification_date, :method,
                        :found_value, :match, :tolerance_pct, :raw_snippet, :result, :notes
                    )
                """),
                {
                    "id": r["id"],
                    "table_name": r["table_name"],
                    "record_id": r["record_id"],
                    "country_code": r["country_code"],
                    "indicator": r["indicator"],
                    "claimed_value": r["claimed_value"],
                    "source_url": r["source_url"],
                    "verification_date": r["verification_date"],
                    "method": r["method"],
                    "found_value": r.get("found_value"),
                    "match": bool(r.get("match", False)),
                    "tolerance_pct": r.get("tolerance_pct", 5.0),
                    "raw_snippet": r.get("raw_snippet"),
                    "result": r["result"],
                    "notes": r.get("notes"),
                },
            )
            count += 1
        print(f"  → {count} verification logs imported")

        # ── 5. Import simulation_parameters_data (82 rows) ──
        print("Importing simulation_parameters_data...")
        params = get_sqlite_rows(sqlite_conn, "simulationparameter")
        count = 0
        for r in params:
            pg.execute(
                text("""
                    INSERT INTO simulation_parameters_data (
                        id, country_code, parameter_name, value, unit,
                        source_name, source_url, is_hypothesis, justification
                    ) VALUES (
                        :id, :country_code, :parameter_name, :value, :unit,
                        :source_name, :source_url, :is_hypothesis, :justification
                    )
                """),
                {
                    "id": r["id"],
                    "country_code": r["country_code"],
                    "parameter_name": r["parameter_name"],
                    "value": r["value"],
                    "unit": r["unit"],
                    "source_name": r["source_name"],
                    "source_url": r.get("source_url"),
                    "is_hypothesis": bool(r.get("is_hypothesis", True)),
                    "justification": r.get("justification", ""),
                },
            )
            count += 1
        print(f"  → {count} simulation parameters imported")

        # ── 6. Update countries table with verified backbone values ──
        print("Updating countries with backbone values...")
        _update_countries_from_baselines(pg, baselines)

        pg.commit()
        print("\nBackbone seed completed successfully.")

    sqlite_conn.close()


def _update_countries_from_baselines(pg, baselines: list[dict]) -> None:
    """Update the countries table production/consumption/refining/reserves
    from the backbone's machine-verified TWh/kb/d values.

    Only updates if the baseline has confidence >= High.
    """
    # Build lookup: {iso2: {indicator: row}}
    by_country: dict[str, dict[str, dict]] = {}
    for r in baselines:
        cc = r["country_code"]
        if cc not in by_country:
            by_country[cc] = {}
        by_country[cc][r["indicator"]] = r

    updated = 0
    for iso2, indicators in by_country.items():
        iso3 = iso2_to_iso3(iso2)

        # Check if this country exists in countries table
        exists = pg.execute(
            text("SELECT code FROM countries WHERE code = :code"),
            {"code": iso3},
        ).fetchone()
        if not exists:
            continue

        updates = {}

        # Production (TWh → Mb/d)
        prod = indicators.get("structural_production")
        if prod and prod.get("confidence_score") in ("Very High", "High"):
            updates["production_mbpd"] = twh_to_mbpd(prod["value"])

        # Consumption (TWh → Mb/d)
        cons = indicators.get("total_consumption")
        if cons and cons.get("confidence_score") in ("Very High", "High"):
            updates["consumption_mbpd"] = twh_to_mbpd(cons["value"])

        # Refining capacity (kb/d → Mb/d)
        ref = indicators.get("refining_capacity")
        if ref and ref.get("confidence_score") in ("Very High", "High"):
            updates["refining_capacity_mbpd"] = kbd_to_mbpd(ref["value"])

        # Strategic reserves (Mbbl → Mb, same unit)
        res = indicators.get("strategic_reserves")
        if res and res.get("confidence_score") in ("Very High", "High"):
            updates["strategic_reserves_mb"] = res["value"]

        if updates:
            set_clause = ", ".join(f"{k} = :{k}" for k in updates)
            pg.execute(
                text(f"UPDATE countries SET {set_clause} WHERE code = :code"),
                {**updates, "code": iso3},
            )
            updated += 1

    print(f"  → {updated} countries updated with backbone values")


def main():
    parser = argparse.ArgumentParser(description="Import petrole-datas backbone into PetroSim")
    parser.add_argument(
        "--sqlite-path",
        default=str(BACKBONE_DEFAULT),
        help="Path to petrole_backbone.db",
    )
    args = parser.parse_args()

    sync_url = settings.SYNC_DATABASE_URL
    print(f"SQLite source: {args.sqlite_path}")
    print(f"PostgreSQL target: {sync_url[:50]}...")
    print()

    seed_backbone(sync_url, args.sqlite_path)


if __name__ == "__main__":
    main()
