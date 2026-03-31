"""Step 2 — Fetch EIA International Energy Data (API v2).

Requires an EIA_API_KEY environment variable (free — register at
https://www.eia.gov/opendata/).

Fetches for each country in our dataset:
  - Crude oil production (TBPD → Mb/d)
  - Total petroleum consumption (TBPD → Mb/d)
  - Crude oil distillation capacity (TBPD → Mb/d)

EIA international API:
  https://api.eia.gov/v2/international/data/
"""

from __future__ import annotations

import logging
import os
import time
from typing import Any

import httpx

logger = logging.getLogger(__name__)

EIA_BASE_URL = "https://api.eia.gov/v2/international/data/"

# EIA product IDs used in the international energy dataset
EIA_QUERIES = [
    {
        "label": "production",
        "productId": "57",      # Crude oil + condensate
        "activityId": "1",      # Production
        "unit": "TBPD",
        "indicator": "structural_production",
        "unit_out": "Mb/d",
    },
    {
        "label": "consumption",
        "productId": "5",       # Total petroleum and other liquids
        "activityId": "2",      # Consumption
        "unit": "TBPD",
        "indicator": "total_consumption",
        "unit_out": "Mb/d",
    },
    {
        "label": "refining_capacity",
        "productId": "16",      # Crude oil distillation capacity
        "activityId": "9",      # Refinery capacity
        "unit": "TBPD",
        "indicator": "refining_capacity",
        "unit_out": "Mb/d",
    },
]

SOURCE_NAME = "U.S. Energy Information Administration (EIA) — International"
SOURCE_URL = "https://www.eia.gov/opendata/"


def _tbpd_to_mbpd(tbpd: float) -> float:
    """Convert thousand barrels/day to million barrels/day."""
    return round(tbpd / 1000.0, 4)


def _fetch_one_query(
    api_key: str,
    query: dict[str, str],
    year: int,
    timeout: float,
) -> dict[str, float]:
    """Fetch one EIA query; returns {countryRegionId (ISO-3-ish): value_mbpd}."""
    params: dict[str, Any] = {
        "api_key": api_key,
        "facets[productId][]": query["productId"],
        "facets[activityId][]": query["activityId"],
        "facets[unit][]": query["unit"],
        "frequency": "annual",
        "data[0]": "value",
        "sort[0][column]": "period",
        "sort[0][direction]": "desc",
        "offset": 0,
        "length": 300,
    }

    country_values: dict[str, float] = {}
    page = 0

    with httpx.Client(timeout=timeout) as client:
        while True:
            params["offset"] = page * 300
            resp = client.get(EIA_BASE_URL, params=params)
            resp.raise_for_status()
            payload = resp.json()

            rows = payload.get("response", {}).get("data", [])
            if not rows:
                break

            for row in rows:
                period = str(row.get("period", "")).strip()
                if period != str(year):
                    continue

                country_id = str(row.get("countryRegionId", "")).strip().upper()
                raw_val = row.get("value")
                if not country_id or raw_val is None:
                    continue
                try:
                    val = float(raw_val)
                except (ValueError, TypeError):
                    continue
                if val > 0:
                    country_values[country_id] = _tbpd_to_mbpd(val)

            # EIA paginates; stop when a full page wasn't returned
            if len(rows) < 300:
                break
            page += 1
            time.sleep(0.2)  # gentle rate-limiting

    return country_values


def fetch_eia_data(
    year: int = 2023,
    api_key: str | None = None,
    timeout: float = 30.0,
) -> dict[str, Any]:
    """Fetch EIA data for all countries.

    Returns a dict keyed by ISO-3 country code:
        {
          "USA": {
              "structural_production": {"value": 12.93, "unit": "Mb/d", ...},
              "total_consumption":    {"value": 20.00, "unit": "Mb/d", ...},
              "refining_capacity":    {"value": 18.10, "unit": "Mb/d", ...},
          },
          ...
        }
    If *api_key* is not provided, tries EIA_API_KEY env var.
    If the key is missing, returns an empty dict with a warning.
    """
    key = api_key or os.environ.get("EIA_API_KEY", "")
    if not key:
        logger.warning(
            "EIA_API_KEY not set — skipping EIA data fetch. "
            "Register at https://www.eia.gov/opendata/ to enable it."
        )
        return {}

    logger.info("Fetching EIA international data for year %d…", year)
    result: dict[str, dict[str, Any]] = {}

    for query in EIA_QUERIES:
        logger.info("  EIA query: %s", query["label"])
        try:
            values = _fetch_one_query(api_key=key, query=query, year=year, timeout=timeout)
        except Exception as exc:
            logger.error("EIA query '%s' failed: %s", query["label"], exc)
            continue

        for country_id, mbpd in values.items():
            if country_id not in result:
                result[country_id] = {}
            result[country_id][query["indicator"]] = {
                "value": mbpd,
                "unit": query["unit_out"],
                "source_name": SOURCE_NAME,
                "source_url": SOURCE_URL,
                "reference_year": year,
            }
        logger.info("    → %d countries", len(values))

    logger.info("EIA: %d countries with data for year %d", len(result), year)
    return result
