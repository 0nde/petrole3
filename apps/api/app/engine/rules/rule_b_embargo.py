"""Rule B — Embargo / Export Restrictions.

A country can lose all or part of its export flows:
- embargo_total: all exports from a country are blocked
- embargo_targeted: exports toward specific countries or regions are blocked
"""

from app.engine.types import SimulationState


def apply_rule_b(state: SimulationState) -> None:
    embargo_total_actions = [
        a for a in state.actions if a.action_type == "embargo_total"
    ]
    embargo_targeted_actions = [
        a for a in state.actions if a.action_type == "embargo_targeted"
    ]

    if not embargo_total_actions and not embargo_targeted_actions:
        return

    # Total embargoes
    for action in embargo_total_actions:
        exporter_code = action.target_id
        country = state.countries.get(exporter_code)
        if country is None:
            state.add_step(
                rule_id="B",
                description=f"Warning: country '{exporter_code}' not found for embargo, skipping",
            )
            continue

        affected_flows: list[str] = []
        total_lost = 0.0

        for flow in state.flows.values():
            if flow.exporter_code == exporter_code and flow.volume_current > 0:
                lost = flow.volume_current
                flow.volume_current = 0.0
                flow.loss_reasons.append(
                    f"Total embargo on exports from {country.name}"
                )
                affected_flows.append(flow.id)
                total_lost += lost

        state.add_step(
            rule_id="B",
            description=(
                f"Total embargo on {country.name}: "
                f"{len(affected_flows)} export flows blocked, "
                f"{total_lost:.3f} Mb/d lost"
            ),
            affected_entities={"countries": [exporter_code], "flows": affected_flows},
            detail={
                "embargo_type": "total",
                "exporter": exporter_code,
                "flows_blocked": len(affected_flows),
                "volume_lost_mbpd": round(total_lost, 4),
            },
        )

    # Targeted embargoes
    for action in embargo_targeted_actions:
        exporter_code = action.target_id
        country = state.countries.get(exporter_code)
        if country is None:
            state.add_step(
                rule_id="B",
                description=f"Warning: country '{exporter_code}' not found for targeted embargo, skipping",
            )
            continue

        target_countries: list[str] = action.params.get("target_countries", [])
        target_regions: list[str] = action.params.get("target_regions", [])

        # Build set of target importer codes
        target_importers: set[str] = set(target_countries)
        for region_id in target_regions:
            for c in state.countries.values():
                if c.region_id == region_id:
                    target_importers.add(c.code)

        affected_flows: list[str] = []
        total_lost = 0.0

        for flow in state.flows.values():
            if (
                flow.exporter_code == exporter_code
                and flow.importer_code in target_importers
                and flow.volume_current > 0
            ):
                lost = flow.volume_current
                flow.volume_current = 0.0
                flow.loss_reasons.append(
                    f"Targeted embargo from {country.name} "
                    f"toward {flow.importer_code}"
                )
                affected_flows.append(flow.id)
                total_lost += lost

        targets_desc = ", ".join(sorted(target_importers)[:10])
        if len(target_importers) > 10:
            targets_desc += f" (+{len(target_importers) - 10} more)"

        state.add_step(
            rule_id="B",
            description=(
                f"Targeted embargo from {country.name} toward [{targets_desc}]: "
                f"{len(affected_flows)} flows blocked, {total_lost:.3f} Mb/d lost"
            ),
            affected_entities={"countries": [exporter_code], "flows": affected_flows},
            detail={
                "embargo_type": "targeted",
                "exporter": exporter_code,
                "target_importers": sorted(target_importers),
                "flows_blocked": len(affected_flows),
                "volume_lost_mbpd": round(total_lost, 4),
            },
        )
