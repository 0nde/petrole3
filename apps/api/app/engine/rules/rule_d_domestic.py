"""Rule D — Domestic Priority.

An exporting country must not export beyond its capacity if production
doesn't cover a minimum domestic safety margin.

domestic_priority_ratio defines the minimum share of production reserved
for domestic use. If remaining exports exceed max_exportable, they are
scaled down proportionally.
"""

from app.engine.types import SimulationState


def apply_rule_d(state: SimulationState) -> None:
    affected_countries: list[str] = []
    affected_flows: list[str] = []
    total_export_reduction = 0.0

    for country in state.countries.values():
        if country.production_current <= 0:
            continue

        # Calculate minimum domestic requirement
        min_domestic = country.production_current * country.domestic_priority_ratio
        max_exportable = max(0.0, country.production_current - min_domestic)

        # Sum current export flows from this country
        export_flows = [
            f for f in state.flows.values()
            if f.exporter_code == country.code and f.volume_current > 0
        ]
        total_exports = sum(f.volume_current for f in export_flows)

        if total_exports <= max_exportable:
            continue

        # Need to scale down exports
        if total_exports <= 0:
            continue

        scale_factor = max_exportable / total_exports

        for flow in export_flows:
            old_vol = flow.volume_current
            flow.volume_current = flow.volume_current * scale_factor
            reduction = old_vol - flow.volume_current
            if reduction > 0:
                flow.loss_reasons.append(
                    f"Domestic priority cap for {country.name} "
                    f"(ratio={country.domestic_priority_ratio:.2f})"
                )
                affected_flows.append(flow.id)
                total_export_reduction += reduction

        affected_countries.append(country.code)

    if affected_countries:
        state.add_step(
            rule_id="D",
            description=(
                f"Domestic priority enforced for {len(affected_countries)} countries: "
                f"exports reduced by {total_export_reduction:.3f} Mb/d across "
                f"{len(affected_flows)} flows"
            ),
            affected_entities={
                "countries": affected_countries,
                "flows": affected_flows,
            },
            detail={
                "countries_affected": len(affected_countries),
                "flows_reduced": len(affected_flows),
                "total_export_reduction_mbpd": round(total_export_reduction, 4),
            },
        )
