"""Step 3 — Cross-reference OWID + EIA data and compute confidence badges.

Confidence scoring logic:
  Very High — Both OWID and EIA have the value AND agree within 10 %
  High      — Only one source has the value, OR both agree within 25 %
  Medium    — Value found but source is known to be less precise
  Low       — No external source found for this indicator this year
  Hypothesis— Simulation parameters (not updated here)
"""

from __future__ import annotations

import logging
from datetime import date
from typing import Any

logger = logging.getLogger(__name__)

# Tolerance thresholds for cross-source agreement
VERY_HIGH_TOL = 0.10   # ±10 %
HIGH_TOL = 0.25        # ±25 %

# Indicators whose authoritative source is EIA (Mb/d direct, not TWh-converted)
EIA_PRIMARY_INDICATORS = {"structural_production", "total_consumption", "refining_capacity"}

# All indicators and which section they belong to
OIL_CORE = {
    "structural_production", "total_consumption", "refining_capacity",
    "strategic_reserves", "oil_share_energy", "oil_energy_per_capita",
    "oil_cons_change_pct",
}


def _relative_diff(a: float, b: float) -> float:
    """Relative absolute difference between two positive values."""
    avg = (abs(a) + abs(b)) / 2
    if avg == 0:
        return 0.0
    return abs(a - b) / avg


def _score_two_sources(owid_val: float, eia_val: float) -> str:
    diff = _relative_diff(owid_val, eia_val)
    if diff <= VERY_HIGH_TOL:
        return "Very High"
    if diff <= HIGH_TOL:
        return "High"
    return "Medium"


def validate_and_score(
    owid_data: dict[str, Any],
    eia_data: dict[str, Any],
    year: int = 2023,
) -> list[dict[str, Any]]:
    """Merge OWID and EIA results into a validated baseline list.

    Returns a list of dicts ready to UPSERT into ``annual_baselines``:
        [
          {
              "country_code": "US",        # ISO-2
              "indicator": "total_consumption",
              "value": 20.00,
              "unit": "Mb/d",
              "reference_year": 2023,
              "source_name": "EIA / OWID",
              "source_url": "...",
              "confidence_score": "Very High",
              "verification_method": "cross_source",
              "verified_date": "2026-03-31",
          },
          ...
        ]
    """
    from app.utils.conversions import iso3_to_iso2, TWH_TO_MBPD

    today = date.today().isoformat()
    records: list[dict[str, Any]] = []

    # Union of all ISO-3 codes from both sources
    all_iso3 = set(owid_data.keys()) | set(eia_data.keys())

    for iso3 in sorted(all_iso3):
        iso2 = iso3_to_iso2(iso3)
        if len(iso2) != 2:
            continue  # not in our mapping — skip

        owid_country = owid_data.get(iso3, {})
        eia_country = eia_data.get(iso3, {})

        # Gather all indicator names from both sources
        all_indicators = set(owid_country.keys()) | set(eia_country.keys())

        for indicator in all_indicators:
            owid_entry: dict[str, Any] | None = owid_country.get(indicator)
            eia_entry: dict[str, Any] | None = eia_country.get(indicator)

            # ── Determine best value + confidence ──────────────────────────
            if indicator in EIA_PRIMARY_INDICATORS:
                # EIA gives Mb/d directly — prefer it; OWID gives TWh
                if eia_entry and owid_entry:
                    # Cross-validate: convert OWID TWh → Mb/d for comparison
                    owid_mbpd = owid_entry["value"] * TWH_TO_MBPD
                    eia_mbpd = eia_entry["value"]
                    confidence = _score_two_sources(owid_mbpd, eia_mbpd)
                    value = eia_mbpd
                    unit = "Mb/d"
                    source_name = f"{eia_entry['source_name']} / {owid_entry['source_name']}"
                    source_url = eia_entry["source_url"]
                    method = "cross_source_eia_owid"
                elif eia_entry:
                    confidence = "High"
                    value = eia_entry["value"]
                    unit = eia_entry["unit"]
                    source_name = eia_entry["source_name"]
                    source_url = eia_entry["source_url"]
                    method = "eia_only"
                else:
                    # Only OWID — store TWh value (display only, not used for simulation)
                    assert owid_entry is not None
                    confidence = "High"
                    value = owid_entry["value"]
                    unit = owid_entry["unit"]
                    source_name = owid_entry["source_name"]
                    source_url = owid_entry["source_url"]
                    method = "owid_only"
            else:
                # All other indicators come only from OWID
                if owid_entry:
                    confidence = "High"
                    value = owid_entry["value"]
                    unit = owid_entry["unit"]
                    source_name = owid_entry["source_name"]
                    source_url = owid_entry["source_url"]
                    method = "owid_only"
                else:
                    # EIA-only for a non-EIA-primary indicator — keep but flag
                    assert eia_entry is not None
                    confidence = "Medium"
                    value = eia_entry["value"]
                    unit = eia_entry["unit"]
                    source_name = eia_entry["source_name"]
                    source_url = eia_entry["source_url"]
                    method = "eia_only"

            records.append({
                "country_code": iso2,
                "indicator": indicator,
                "value": round(value, 4),
                "unit": unit,
                "reference_year": year,
                "source_name": source_name,
                "source_url": source_url,
                "confidence_score": confidence,
                "verification_method": method,
                "verified_date": today,
            })

    logger.info(
        "validate_score: %d records across %d countries",
        len(records),
        len({r["country_code"] for r in records}),
    )
    return records
