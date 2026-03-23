"""Rule A — Chokepoint & Route Disruptions.

When a chokepoint is blocked (partially or fully), all flows whose route
traverses that chokepoint lose capacity proportionally.

Multiplicative model: if a flow's route crosses chokepoints with severities
s1, s2, ... the combined capacity factor is ∏(1 - si).
"""

from app.engine.types import SimulationState


def apply_rule_a(state: SimulationState) -> None:
    # 1. Collect chokepoint block actions
    chokepoint_actions = [
        a for a in state.actions if a.action_type == "chokepoint_block"
    ]
    route_actions = [
        a for a in state.actions if a.action_type == "route_block"
    ]

    if not chokepoint_actions and not route_actions:
        return

    # 2. Apply chokepoint severities
    for action in chokepoint_actions:
        cp = state.chokepoints.get(action.target_id)
        if cp is None:
            state.add_step(
                rule_id="A",
                description=f"Warning: chokepoint '{action.target_id}' not found, skipping",
            )
            continue
        cp.severity = max(cp.severity, action.severity)  # take worst severity

        # Per-importer exemptions: {"CHN": 0.2} means China keeps 20% open
        exempt = action.params.get("exempt_importers", {})
        if exempt:
            for code, open_frac in exempt.items():
                cp.exempt_importers[code] = open_frac

        desc = f"Chokepoint '{cp.name}' disrupted at {action.severity * 100:.0f}% severity"
        if exempt:
            exemptions = ", ".join(f"{k} keeps {v*100:.0f}%" for k, v in exempt.items())
            desc += f" (exemptions: {exemptions})"

        state.add_step(
            rule_id="A",
            description=desc,
            affected_entities={"chokepoints": [cp.id]},
            detail={"severity": action.severity, "exempt_importers": exempt},
        )

    # 3. Apply route block severities
    for action in route_actions:
        route = state.routes.get(action.target_id)
        if route is None:
            state.add_step(
                rule_id="A",
                description=f"Warning: route '{action.target_id}' not found, skipping",
            )
            continue
        route.severity = max(route.severity, action.severity)
        state.add_step(
            rule_id="A",
            description=(
                f"Route '{route.name}' disrupted at {action.severity * 100:.0f}% severity"
            ),
            affected_entities={"routes": [route.id]},
            detail={"severity": action.severity},
        )

    # 4. Apply capacity reduction to flows
    affected_flows: list[str] = []
    total_volume_lost = 0.0

    for flow in state.flows.values():
        route = state.routes.get(flow.route_id)
        if route is None:
            continue

        # Calculate combined capacity factor from chokepoints on this route
        capacity_factor = 1.0

        # Chokepoint-based reduction (multiplicative, with per-importer exemptions)
        for cp_id in flow.chokepoint_ids:
            cp = state.chokepoints.get(cp_id)
            if cp and cp.severity > 0:
                # Check if this flow's importer has an exemption
                open_frac = cp.exempt_importers.get(flow.importer_code, 0.0)
                effective_severity = cp.severity * (1.0 - open_frac)
                capacity_factor *= (1.0 - effective_severity)

        # Direct route block
        if route.severity > 0:
            capacity_factor *= (1.0 - route.severity)

        if capacity_factor < 1.0:
            volume_before = flow.volume_current
            flow.volume_current = flow.volume_baseline * max(0.0, capacity_factor)
            loss = volume_before - flow.volume_current

            reasons = []
            for cp_id in flow.chokepoint_ids:
                cp = state.chokepoints.get(cp_id)
                if cp and cp.severity > 0:
                    reasons.append(
                        f"Chokepoint '{cp.name}' blocked at {cp.severity * 100:.0f}%"
                    )
            if route.severity > 0:
                reasons.append(
                    f"Route '{route.name}' blocked at {route.severity * 100:.0f}%"
                )

            flow.loss_reasons.extend(reasons)
            affected_flows.append(flow.id)
            total_volume_lost += loss

    if affected_flows:
        state.add_step(
            rule_id="A",
            description=(
                f"Chokepoint/route disruptions affected {len(affected_flows)} flows, "
                f"total volume lost: {total_volume_lost:.3f} Mb/d"
            ),
            affected_entities={"flows": affected_flows},
            detail={
                "flows_affected_count": len(affected_flows),
                "total_volume_lost_mbpd": round(total_volume_lost, 4),
            },
        )
