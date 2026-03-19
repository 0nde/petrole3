"""Rule C — Production Changes.

A country's production can increase or decrease.
This affects its ability to satisfy domestic demand and to export.
"""

from app.engine.types import SimulationState


def apply_rule_c(state: SimulationState) -> None:
    production_actions = [
        a for a in state.actions if a.action_type == "production_change"
    ]

    if not production_actions:
        return

    for action in production_actions:
        country_code = action.target_id
        country = state.countries.get(country_code)
        if country is None:
            state.add_step(
                rule_id="C",
                description=f"Warning: country '{country_code}' not found for production change, skipping",
            )
            continue

        delta_pct = action.params.get("delta_pct", -action.severity * 100)
        old_production = country.production_current
        new_production = max(0.0, old_production * (1 + delta_pct / 100))
        country.production_current = new_production

        change_mbpd = new_production - old_production
        direction = "increased" if change_mbpd > 0 else "decreased"

        state.add_step(
            rule_id="C",
            description=(
                f"{country.name} production {direction} by {abs(delta_pct):.1f}%: "
                f"{old_production:.3f} → {new_production:.3f} Mb/d "
                f"({change_mbpd:+.3f} Mb/d)"
            ),
            affected_entities={"countries": [country_code]},
            detail={
                "country": country_code,
                "delta_pct": delta_pct,
                "production_before": round(old_production, 4),
                "production_after": round(new_production, 4),
                "change_mbpd": round(change_mbpd, 4),
            },
        )
