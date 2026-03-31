"""Step 1 — Fetch OWID energy data.

Downloads the Our World in Data energy CSV (no API key required) and extracts
oil/energy indicators for the target year, keyed by ISO-3 country code.

Source: https://github.com/owid/energy-data
"""

from __future__ import annotations

import csv
import io
import logging
from typing import Any

import httpx

logger = logging.getLogger(__name__)

OWID_CSV_URL = (
    "https://raw.githubusercontent.com/owid/energy-data/master/owid-energy-data.csv"
)

# OWID column → PetroSim indicator name
OWID_TO_INDICATOR: dict[str, str] = {
    "oil_production": "structural_production",
    "oil_consumption": "total_consumption",
    "oil_share_energy": "oil_share_energy",
    "oil_energy_per_capita": "oil_energy_per_capita",
    "oil_cons_change_pct": "oil_cons_change_pct",
    "primary_energy_consumption": "primary_energy_consumption",
    "energy_per_capita": "energy_per_capita",
    "population": "population",
    "electricity_generation": "electricity_generation",
    "oil_electricity": "oil_electricity",
    "oil_share_elec": "oil_share_elec",
    "fossil_share_elec": "fossil_share_elec",
    "gas_electricity": "gas_electricity",
    "coal_electricity": "coal_electricity",
    "renewables_share_elec": "renewables_share_elec",
    "nuclear_share_elec": "nuclear_share_elec",
    "greenhouse_gas_emissions": "greenhouse_gas_emissions",
    "carbon_intensity_elec": "carbon_intensity_elec",
}

# Units for each indicator
INDICATOR_UNITS: dict[str, str] = {
    "structural_production": "TWh",
    "total_consumption": "TWh",
    "oil_share_energy": "%",
    "oil_energy_per_capita": "kWh/person",
    "oil_cons_change_pct": "%",
    "primary_energy_consumption": "TWh",
    "energy_per_capita": "kWh/person",
    "population": "persons",
    "electricity_generation": "TWh",
    "oil_electricity": "TWh",
    "oil_share_elec": "%",
    "fossil_share_elec": "%",
    "gas_electricity": "TWh",
    "coal_electricity": "TWh",
    "renewables_share_elec": "%",
    "nuclear_share_elec": "%",
    "greenhouse_gas_emissions": "MtCO2e",
    "carbon_intensity_elec": "gCO2/kWh",
}

SOURCE_NAME = "Our World in Data — Energy Dataset"
SOURCE_URL = "https://github.com/owid/energy-data"


def fetch_owid_data(year: int = 2023, timeout: float = 45.0) -> dict[str, Any]:
    """Download the OWID energy CSV and extract indicators for *year*.

    Returns a dict:
        {
          "ISO3": {
              "indicator_name": {
                  "value": float,
                  "unit": str,
                  "source_name": str,
                  "source_url": str,
                  "reference_year": int,
              },
              ...
          },
          ...
        }
    """
    logger.info("Fetching OWID energy CSV (year=%d)…", year)

    with httpx.Client(timeout=timeout, follow_redirects=True) as client:
        resp = client.get(OWID_CSV_URL)
        resp.raise_for_status()
        content = resp.text

    reader = csv.DictReader(io.StringIO(content))
    result: dict[str, dict[str, Any]] = {}

    for row in reader:
        iso_code = row.get("iso_code", "").strip().upper()
        row_year_raw = row.get("year", "").strip()

        # Skip world / regional aggregates (non-standard ISO-3 codes)
        if not iso_code or len(iso_code) != 3 or "OWID" in iso_code:
            continue
        # Filter to target year
        if row_year_raw != str(year):
            continue

        country_indicators: dict[str, Any] = {}
        for owid_col, indicator in OWID_TO_INDICATOR.items():
            raw = row.get(owid_col, "").strip()
            if not raw:
                continue
            try:
                val = float(raw)
            except ValueError:
                continue
            if val <= 0:
                continue
            country_indicators[indicator] = {
                "value": round(val, 4),
                "unit": INDICATOR_UNITS.get(indicator, ""),
                "source_name": SOURCE_NAME,
                "source_url": SOURCE_URL,
                "reference_year": year,
            }

        if country_indicators:
            result[iso_code] = country_indicators

    logger.info("OWID: %d countries with data for year %d", len(result), year)
    return result


def get_unit(indicator: str) -> str:
    return INDICATOR_UNITS.get(indicator, "")
