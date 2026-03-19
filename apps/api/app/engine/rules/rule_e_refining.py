"""Rule E — Refining Hub Cascade.

If a refining hub loses crude imports, its refined product exports must
be reduced proportionally.

Linear model: refined_export_factor = crude_import_ratio
(see docs/assumptions-and-limitations.md — Assumption A5)
"""

from app.engine.types import SimulationState


def apply_rule_e(state: SimulationState) -> None:
    affected_hubs: list[str] = []
    affected_flows: list[str] = []
    total_refined_loss = 0.0

    for country in state.countries.values():
        if not country.is_refining_hub:
            continue

        # Calculate baseline crude imports to this hub
        baseline_crude_imports = sum(
            f.volume_baseline for f in state.flows.values()
            if f.importer_code == country.code and f.product_id == "crude"
        )

        if baseline_crude_imports <= 0:
            continue

        # Calculate current crude imports
        current_crude_imports = sum(
            f.volume_current for f in state.flows.values()
            if f.importer_code == country.code and f.product_id == "crude"
        )

        crude_import_ratio = current_crude_imports / baseline_crude_imports

        if crude_import_ratio >= 1.0:
            continue  # No loss

        # Reduce refined product exports from this hub
        refined_exports = [
            f for f in state.flows.values()
            if f.exporter_code == country.code
            and f.product_id == "refined"
            and f.volume_current > 0
        ]

        hub_refined_loss = 0.0
        for flow in refined_exports:
            old_vol = flow.volume_current
            flow.volume_current = flow.volume_current * crude_import_ratio
            loss = old_vol - flow.volume_current
            if loss > 0:
                flow.loss_reasons.append(
                    f"Refining hub cascade: {country.name} lost "
                    f"{(1 - crude_import_ratio) * 100:.1f}% of crude imports"
                )
                affected_flows.append(flow.id)
                hub_refined_loss += loss

        if hub_refined_loss > 0:
            affected_hubs.append(country.code)
            total_refined_loss += hub_refined_loss

            state.add_step(
                rule_id="E",
                description=(
                    f"Refining hub {country.name}: crude imports at "
                    f"{crude_import_ratio * 100:.1f}% of baseline → "
                    f"refined exports reduced by {hub_refined_loss:.3f} Mb/d"
                ),
                affected_entities={
                    "countries": [country.code],
                    "flows": [f.id for f in refined_exports if f.id in affected_flows],
                },
                detail={
                    "hub": country.code,
                    "crude_import_ratio": round(crude_import_ratio, 4),
                    "baseline_crude_imports": round(baseline_crude_imports, 4),
                    "current_crude_imports": round(current_crude_imports, 4),
                    "refined_export_loss_mbpd": round(hub_refined_loss, 4),
                },
            )

    if affected_hubs:
        state.add_step(
            rule_id="E",
            description=(
                f"Refining hub cascade summary: {len(affected_hubs)} hubs affected, "
                f"total refined export loss: {total_refined_loss:.3f} Mb/d"
            ),
            affected_entities={"countries": affected_hubs, "flows": affected_flows},
            detail={
                "hubs_affected": len(affected_hubs),
                "total_refined_loss_mbpd": round(total_refined_loss, 4),
            },
        )
