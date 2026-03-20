"""Rule I — Price Impact Estimation.

Simplified linear model:
  global_supply_loss_pct = (baseline_total - current_total) / baseline_total × 100
  estimated_price_impact_pct = global_supply_loss_pct × price_elasticity_factor

Default price_elasticity_factor = 3.0 (configurable).

THIS IS NOT AN ECONOMETRIC MODEL. See docs/assumptions-and-limitations.md — Assumption A6.
"""

from app.config import settings
from app.engine.types import SimulationState


def apply_rule_i(state: SimulationState) -> None:
    total_baseline = sum(f.volume_baseline for f in state.flows.values())
    total_current = sum(f.volume_current for f in state.flows.values())

    if total_baseline <= 0:
        state.add_step(
            rule_id="I",
            description="No baseline flows — price impact cannot be calculated",
            detail={"error": "no_baseline_flows"},
        )
        state.global_supply_loss_pct = 0.0
        state.estimated_price_impact_pct = 0.0
        return

    supply_loss_pct = (total_baseline - total_current) / total_baseline * 100
    price_impact_pct = supply_loss_pct * settings.PRICE_ELASTICITY_FACTOR

    state.global_supply_loss_pct = supply_loss_pct
    state.estimated_price_impact_pct = price_impact_pct

    state.add_step(
        rule_id="I",
        description=(
            f"Price impact estimation: "
            f"global supply loss = {supply_loss_pct:.2f}%, "
            f"estimated price impact = +{price_impact_pct:.1f}% "
            f"(elasticity factor = {settings.PRICE_ELASTICITY_FACTOR})"
        ),
        detail={
            "total_baseline_mbpd": round(total_baseline, 4),
            "total_current_mbpd": round(total_current, 4),
            "supply_loss_pct": round(supply_loss_pct, 4),
            "price_elasticity_factor": settings.PRICE_ELASTICITY_FACTOR,
            "estimated_price_impact_pct": round(price_impact_pct, 4),
        },
    )
