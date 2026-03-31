"""AWS Lambda handler — dispatches to the right pipeline step.

Invoked by AWS Step Functions with a payload like:
    {"step": "fetch_owid",    "year": 2023}
    {"step": "fetch_eia",     "year": 2023}
    {"step": "validate_score","owid_data": {...}, "eia_data": {...}, "year": 2023}
    {"step": "update_db",     "validated": [...], "environment": "dev", "dry_run": true}
    {"step": "generate_report","validated": [...], "update_summary": {...}, ...}

The function is also callable directly (see run_data_update.py for the CLI).
"""

from __future__ import annotations

import json
import logging
import os
from typing import Any

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def _get_db_url(environment: str) -> str:
    """Pick the correct Neon.tech sync URL based on environment."""
    if environment == "prod":
        url = os.environ.get("PROD_SYNC_DATABASE_URL", "")
    else:
        url = os.environ.get("DEV_SYNC_DATABASE_URL", "")

    if not url:
        raise ValueError(
            f"No database URL found for environment '{environment}'. "
            f"Set DEV_SYNC_DATABASE_URL or PROD_SYNC_DATABASE_URL."
        )
    return url


def _upload_report_to_s3(report: dict[str, Any], environment: str) -> str | None:
    """Upload the JSON report to S3 and return the S3 key (optional)."""
    bucket = os.environ.get("DATA_PIPELINE_BUCKET", "")
    if not bucket:
        return None

    try:
        import boto3
        from datetime import datetime, timezone

        s3 = boto3.client("s3")
        ts = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
        key = f"reports/{environment}/{ts}-data-update.json"
        s3.put_object(
            Bucket=bucket,
            Key=key,
            Body=json.dumps(report["json_summary"], indent=2).encode(),
            ContentType="application/json",
        )
        logger.info("Report uploaded to s3://%s/%s", bucket, key)
        return key
    except Exception as exc:
        logger.warning("Could not upload report to S3: %s", exc)
        return None


def main(event: dict[str, Any], context: Any = None) -> dict[str, Any]:
    """Lambda entrypoint — also callable from CLI."""
    step = event.get("step")

    if step == "fetch_owid":
        from .fetch_owid import fetch_owid_data
        year = int(event.get("year", 2023))
        owid_data = fetch_owid_data(year=year)
        return {"owid_data": owid_data, "year": year}

    elif step == "fetch_eia":
        from .fetch_eia import fetch_eia_data
        year = int(event.get("year", 2023))
        api_key = event.get("eia_api_key") or os.environ.get("EIA_API_KEY", "")
        eia_data = fetch_eia_data(year=year, api_key=api_key)
        return {"eia_data": eia_data, "year": year}

    elif step == "validate_score":
        from .validate_score import validate_and_score
        owid_data = event.get("owid_data", {})
        eia_data = event.get("eia_data", {})
        year = int(event.get("year", 2023))
        validated = validate_and_score(owid_data=owid_data, eia_data=eia_data, year=year)
        return {"validated": validated, "year": year}

    elif step == "update_db":
        from .update_db import run_update
        validated = event.get("validated", [])
        environment = event.get("environment", "dev")
        dry_run = bool(event.get("dry_run", True))
        update_sim = bool(event.get("update_simulation_values", False))
        db_url = event.get("db_url") or _get_db_url(environment)
        summary = run_update(
            sync_db_url=db_url,
            validated=validated,
            update_simulation_values=update_sim,
            dry_run=dry_run,
        )
        return {"update_summary": summary, "environment": environment, "dry_run": dry_run}

    elif step == "generate_report":
        from .generate_report import generate_report
        validated = event.get("validated", [])
        update_summary = event.get("update_summary", {})
        year = int(event.get("year", 2023))
        environment = event.get("environment", "dev")
        dry_run = bool(event.get("dry_run", True))
        report = generate_report(
            validated=validated,
            update_summary=update_summary,
            year=year,
            environment=environment,
            dry_run=dry_run,
        )
        report["s3_key"] = _upload_report_to_s3(report, environment)
        return report

    else:
        raise ValueError(f"Unknown pipeline step: '{step}'. "
                         f"Valid: fetch_owid, fetch_eia, validate_score, update_db, generate_report")


# ── AWS Lambda entrypoint ──────────────────────────────────────────────────────
def lambda_handler(event: dict[str, Any], context: Any) -> dict[str, Any]:
    return main(event, context)
