"""Rule F — Strategic Reserves Release.

Strategic reserves inject temporary supply to compensate for a deficit.

Model: daily injection = min(reserve_release_rate, strategic_reserves / planning_horizon)
Planning horizon default: 90 days.
See docs/assumptions-and-limitations.md — Assumption A7.
"""

from app.config import settings
from app.engine.types import SimulationState


def apply_rule_f(state: SimulationState) -> None:
    reserve_actions = [
        a for a in state.actions if a.action_type == "reserve_release"
    ]

    if not reserve_actions:
        return

    planning_horizon = settings.RESERVE_PLANNING_HORIZON_DAYS
    affected_countries: list[str] = []
    total_injection = 0.0

    for action in reserve_actions:
        target = action.target_id
        params = action.params

        # Determine which countries release reserves
        release_countries: list[str] = []

        if target == "global":
            release_countries = [
                c.code for c in state.countries.values()
                if c.strategic_reserves_mb > 0
            ]
        elif params.get("region_id"):
            region_id = params["region_id"]
            release_countries = [
                c.code for c in state.countries.values()
                if c.region_id == region_id and c.strategic_reserves_mb > 0
            ]
        else:
            # Specific country
            if state.countries.get(target) and state.countries[target].strategic_reserves_mb > 0:
                release_countries = [target]

        for code in release_countries:
            country = state.countries[code]
            if country.reserve_mobilized > 0:
                continue  # Already mobilized

            max_rate = country.reserve_release_rate
            stock_rate = country.strategic_reserves_mb / planning_horizon if planning_horizon > 0 else 0
            injection = min(max_rate, stock_rate)

            if injection <= 0:
                continue

            country.reserve_mobilized = injection
            affected_countries.append(code)
            total_injection += injection

        scope = target if target == "global" else (
            f"region {params.get('region_id', target)}" if params.get("region_id") else f"country {target}"
        )
        state.add_step(
            rule_id="F",
            description=(
                f"Strategic reserve release ({scope}): "
                f"{len(release_countries)} countries mobilized, "
                f"total injection: {total_injection:.3f} Mb/d"
            ),
            affected_entities={"countries": affected_countries},
            detail={
                "scope": scope,
                "countries_mobilized": len(release_countries),
                "total_injection_mbpd": round(total_injection, 4),
                "planning_horizon_days": planning_horizon,
            },
        )
