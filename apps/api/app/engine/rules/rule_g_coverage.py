"""Rule G — Demand Coverage.

Calculate each country's demand coverage ratio after all supply-side rules.

domestic_available = production_after - exports_after + imports_after + reserve_injection
demand_coverage_ratio = domestic_available / consumption
"""

from app.engine.types import SimulationState


def apply_rule_g(state: SimulationState) -> None:
    results: list[dict] = []

    for country in state.countries.values():
        # Sum current exports from this country
        exports_after = sum(
            f.volume_current for f in state.flows.values()
            if f.exporter_code == country.code
        )

        # Sum current imports to this country
        imports_after = sum(
            f.volume_current for f in state.flows.values()
            if f.importer_code == country.code
        )

        domestic_available = (
            country.production_current
            - exports_after
            + imports_after
            + country.reserve_mobilized
        )

        if country.consumption_current > 0:
            coverage = domestic_available / country.consumption_current
        else:
            coverage = float("inf")

        # Store on country state for downstream rules
        country.coverage = coverage
        country.domestic_available = domestic_available
        country.exports_after = exports_after
        country.imports_after = imports_after

        if coverage < 0.95:
            results.append({
                "country": country.code,
                "name": country.name,
                "coverage": round(coverage, 4),
                "domestic_available": round(domestic_available, 4),
                "consumption": round(country.consumption_current, 4),
            })

    # Sort by coverage ascending (most affected first)
    results.sort(key=lambda r: r["coverage"])

    undercovered = [r for r in results if r["coverage"] < 0.95]

    state.add_step(
        rule_id="G",
        description=(
            f"Demand coverage calculated: {len(undercovered)} countries below 95% coverage"
        ),
        affected_entities={
            "countries": [r["country"] for r in undercovered[:20]],
        },
        detail={
            "undercovered_count": len(undercovered),
            "most_affected": results[:10],
        },
    )
