"""API routes for enriched data: annual baselines, trade details, verification logs."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import (
    AnnualBaseline,
    TradeFlowDetailed,
    VerificationLog,
    SimulationParameterData,
)
from app.db.session import get_db

router = APIRouter(prefix="/data", tags=["data"])


# ---------------------------------------------------------------------------
# Annual Baselines
# ---------------------------------------------------------------------------

@router.get("/baselines")
async def list_baselines(
    country: str | None = Query(None),
    indicator: str | None = Query(None),
    confidence: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Return annual baselines, optionally filtered by country/indicator/confidence."""
    q = select(AnnualBaseline)
    if country:
        q = q.where(AnnualBaseline.country_code == country.upper())
    if indicator:
        q = q.where(AnnualBaseline.indicator == indicator)
    if confidence:
        q = q.where(AnnualBaseline.confidence_score == confidence)
    q = q.order_by(AnnualBaseline.country_code, AnnualBaseline.indicator)
    result = await db.execute(q)
    rows = result.scalars().all()
    return [
        {
            "id": r.id,
            "country_code": r.country_code,
            "indicator": r.indicator,
            "value": r.value,
            "unit": r.unit,
            "reference_year": r.reference_year,
            "source_name": r.source_name,
            "source_url": r.source_url,
            "definition": r.definition,
            "confidence_score": r.confidence_score,
            "verification_method": r.verification_method,
            "verified_date": r.verified_date,
        }
        for r in rows
    ]


@router.get("/baselines/{country_code}")
async def get_country_baselines(
    country_code: str,
    db: AsyncSession = Depends(get_db),
):
    """Return all baselines for a single country, grouped by section."""
    q = (
        select(AnnualBaseline)
        .where(AnnualBaseline.country_code == country_code.upper())
        .order_by(AnnualBaseline.indicator)
    )
    result = await db.execute(q)
    rows = result.scalars().all()

    # Group by thematic sections
    OIL_CORE = [
        "structural_production", "total_consumption", "refining_capacity",
        "strategic_reserves", "oil_share_energy", "oil_energy_per_capita",
        "oil_cons_change_pct",
    ]
    ENERGY_STRUCT = [
        "primary_energy_consumption", "energy_per_capita", "population",
        "electricity_generation",
    ]
    ELEC_MIX = [
        "oil_electricity", "oil_share_elec", "fossil_share_elec",
        "gas_electricity", "coal_electricity", "renewables_share_elec",
        "nuclear_share_elec",
    ]
    CLIMATE = ["greenhouse_gas_emissions", "carbon_intensity_elec"]

    by_indicator = {r.indicator: _serialize_baseline(r) for r in rows}

    return {
        "country_code": country_code.upper(),
        "oil_core": [by_indicator[k] for k in OIL_CORE if k in by_indicator],
        "energy_structure": [by_indicator[k] for k in ENERGY_STRUCT if k in by_indicator],
        "electricity_mix": [by_indicator[k] for k in ELEC_MIX if k in by_indicator],
        "climate": [by_indicator[k] for k in CLIMATE if k in by_indicator],
        "all": [_serialize_baseline(r) for r in rows],
    }


# ---------------------------------------------------------------------------
# Trade Flows Detailed (Comtrade)
# ---------------------------------------------------------------------------

@router.get("/trade/{country_code}")
async def get_country_trade(
    country_code: str,
    db: AsyncSession = Depends(get_db),
):
    """Return detailed Comtrade trade flows for a country."""
    q = (
        select(TradeFlowDetailed)
        .where(TradeFlowDetailed.country_code == country_code.upper())
        .order_by(TradeFlowDetailed.percentage.desc())
    )
    result = await db.execute(q)
    rows = result.scalars().all()
    return [
        {
            "id": r.id,
            "country_code": r.country_code,
            "flow_type": r.flow_type,
            "partner_country": r.partner_country,
            "quantity": r.quantity,
            "unit": r.unit,
            "percentage": r.percentage,
            "reference_year": r.reference_year,
            "source_name": r.source_name,
            "source_url": r.source_url,
            "confidence_score": r.confidence_score,
            "verification_method": r.verification_method,
        }
        for r in rows
    ]


# ---------------------------------------------------------------------------
# Verification Logs
# ---------------------------------------------------------------------------

@router.get("/verification")
async def list_verification_logs(
    country: str | None = Query(None),
    result_filter: str | None = Query(None, alias="result"),
    limit: int = Query(100, ge=1, le=2000),
    db: AsyncSession = Depends(get_db),
):
    """Return verification audit logs."""
    q = select(VerificationLog)
    if country:
        q = q.where(VerificationLog.country_code == country.upper())
    if result_filter:
        q = q.where(VerificationLog.result == result_filter.upper())
    q = q.order_by(VerificationLog.id).limit(limit)
    result = await db.execute(q)
    rows = result.scalars().all()
    return [
        {
            "id": r.id,
            "table_name": r.table_name,
            "record_id": r.record_id,
            "country_code": r.country_code,
            "indicator": r.indicator,
            "claimed_value": r.claimed_value,
            "found_value": r.found_value,
            "match": r.match,
            "result": r.result,
            "method": r.method,
            "verification_date": r.verification_date,
        }
        for r in rows
    ]


@router.get("/verification/summary")
async def verification_summary(db: AsyncSession = Depends(get_db)):
    """Return aggregate verification statistics."""
    total_r = await db.execute(select(func.count(VerificationLog.id)))
    total = total_r.scalar() or 0

    confirmed_r = await db.execute(
        select(func.count(VerificationLog.id)).where(VerificationLog.result == "CONFIRMED")
    )
    confirmed = confirmed_r.scalar() or 0

    mismatch_r = await db.execute(
        select(func.count(VerificationLog.id)).where(VerificationLog.result == "MISMATCH")
    )
    mismatch = mismatch_r.scalar() or 0

    ab_total_r = await db.execute(select(func.count(AnnualBaseline.id)))
    ab_total = ab_total_r.scalar() or 0

    ab_vh_r = await db.execute(
        select(func.count(AnnualBaseline.id)).where(AnnualBaseline.confidence_score == "Very High")
    )
    ab_vh = ab_vh_r.scalar() or 0

    return {
        "total_verifications": total,
        "confirmed": confirmed,
        "mismatch": mismatch,
        "parse_failed": total - confirmed - mismatch,
        "total_baselines": ab_total,
        "very_high_count": ab_vh,
        "pct_verified": round(ab_vh / ab_total * 100, 1) if ab_total else 0,
    }


# ---------------------------------------------------------------------------
# Simulation Parameters
# ---------------------------------------------------------------------------

@router.get("/sim-params/{country_code}")
async def get_country_sim_params(
    country_code: str,
    db: AsyncSession = Depends(get_db),
):
    """Return simulation parameters for a country."""
    q = (
        select(SimulationParameterData)
        .where(SimulationParameterData.country_code == country_code.upper())
    )
    result = await db.execute(q)
    rows = result.scalars().all()
    return [
        {
            "id": r.id,
            "country_code": r.country_code,
            "parameter_name": r.parameter_name,
            "value": r.value,
            "unit": r.unit,
            "source_name": r.source_name,
            "source_url": r.source_url,
            "is_hypothesis": r.is_hypothesis,
            "justification": r.justification,
        }
        for r in rows
    ]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _serialize_baseline(r: AnnualBaseline) -> dict:
    return {
        "id": r.id,
        "indicator": r.indicator,
        "value": r.value,
        "unit": r.unit,
        "reference_year": r.reference_year,
        "source_name": r.source_name,
        "source_url": r.source_url,
        "definition": r.definition,
        "confidence_score": r.confidence_score,
        "verification_method": r.verification_method,
        "verified_date": r.verified_date,
    }
