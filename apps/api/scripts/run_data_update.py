"""CLI runner for the data update pipeline.

Runs all 5 pipeline steps sequentially in the current process.
Used by:
  - Local development
  - GitHub Actions "direct mode" (no Step Functions needed)

Usage:
    cd apps/api
    python -m scripts.run_data_update [options]

Examples:
    # Dry run against dev DB, year 2023
    python -m scripts.run_data_update --env dev --dry-run

    # Apply to dev DB with EIA data
    EIA_API_KEY=your_key python -m scripts.run_data_update --env dev

    # Full update: baselines + simulation values, apply to prod
    EIA_API_KEY=your_key python -m scripts.run_data_update --env prod \\
        --update-sim --no-dry-run

    # Export report markdown to file
    python -m scripts.run_data_update --env dev --dry-run --report-file /tmp/report.md
"""

from __future__ import annotations

import argparse
import logging
import os
import sys
from pathlib import Path
from typing import Any

# Allow running from apps/api/
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("run_data_update")


def _get_db_url(environment: str) -> str:
    from app.config import settings

    if environment == "prod":
        url = os.environ.get("SYNC_DATABASE_URL") or settings.SYNC_DATABASE_URL
    else:
        url = os.environ.get("DEV_SYNC_DATABASE_URL") or getattr(settings, "DEV_SYNC_DATABASE_URL", "")

    if not url:
        raise SystemExit(
            f"ERROR: No database URL for environment '{environment}'.\n"
            f"Set SYNC_DATABASE_URL (prod) or DEV_SYNC_DATABASE_URL (dev)."
        )
    return url


def run_pipeline(
    year: int,
    environment: str,
    dry_run: bool,
    update_simulation_values: bool,
    report_file: str | None,
) -> dict[str, Any]:
    from scripts.data_pipeline.fetch_owid import fetch_owid_data
    from scripts.data_pipeline.fetch_eia import fetch_eia_data
    from scripts.data_pipeline.validate_score import validate_and_score
    from scripts.data_pipeline.update_db import run_update
    from scripts.data_pipeline.generate_report import generate_report

    logger.info("=" * 60)
    logger.info("PetroSim Data Update Pipeline")
    logger.info("  year=%d  env=%s  dry_run=%s  update_sim=%s",
                year, environment, dry_run, update_simulation_values)
    logger.info("=" * 60)

    # Step 1 — OWID (always)
    logger.info("[1/5] Fetching OWID energy data…")
    owid_data = fetch_owid_data(year=year)

    # Step 2 — EIA (optional, needs API key)
    logger.info("[2/5] Fetching EIA international data…")
    eia_data = fetch_eia_data(year=year)

    # Step 3 — Validate & score
    logger.info("[3/5] Validating and computing confidence scores…")
    validated = validate_and_score(owid_data=owid_data, eia_data=eia_data, year=year)

    # Step 4 — Update DB
    logger.info("[4/5] Updating database (dry_run=%s)…", dry_run)
    db_url = _get_db_url(environment)
    summary = run_update(
        sync_db_url=db_url,
        validated=validated,
        update_simulation_values=update_simulation_values,
        dry_run=dry_run,
    )

    # Step 5 — Report
    logger.info("[5/5] Generating report…")
    report = generate_report(
        validated=validated,
        update_summary=summary,
        year=year,
        environment=environment,
        dry_run=dry_run,
    )

    # Print markdown to stdout (GitHub Actions captures this for Job Summary)
    print(report["markdown"])

    # Optionally save to file
    if report_file:
        Path(report_file).write_text(report["markdown"], encoding="utf-8")
        logger.info("Report saved to %s", report_file)

    import json
    logger.info("JSON summary: %s", json.dumps(report["json_summary"], indent=2))

    return report


def main() -> None:
    parser = argparse.ArgumentParser(
        description="PetroSim — mise à jour automatique des données pays"
    )
    parser.add_argument(
        "--year",
        type=int,
        default=2023,
        help="Reference year for data (default: 2023)",
    )
    parser.add_argument(
        "--env",
        choices=["dev", "prod"],
        default="dev",
        help="Target environment (default: dev)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        default=True,
        help="Do not write to DB (default: True)",
    )
    parser.add_argument(
        "--no-dry-run",
        dest="dry_run",
        action="store_false",
        help="Actually write to DB",
    )
    parser.add_argument(
        "--update-sim",
        action="store_true",
        default=False,
        help="Also update countries simulation table (production_mbpd, etc.)",
    )
    parser.add_argument(
        "--report-file",
        default=None,
        help="Write markdown report to this file path",
    )
    args = parser.parse_args()

    run_pipeline(
        year=args.year,
        environment=args.env,
        dry_run=args.dry_run,
        update_simulation_values=args.update_sim,
        report_file=args.report_file,
    )


if __name__ == "__main__":
    main()
