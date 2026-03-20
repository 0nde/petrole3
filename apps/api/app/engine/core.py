"""Core simulation engine — orchestrates rules A through I.

This is the authoritative simulation engine. It is deterministic:
given the same inputs (reference data + scenario), it always produces
the same outputs.
"""

from __future__ import annotations

import time
from typing import Any

from app.engine.rules import (
    apply_rule_a,
    apply_rule_b,
    apply_rule_c,
    apply_rule_d,
    apply_rule_e,
    apply_rule_f,
    apply_rule_g,
    apply_rule_h,
    apply_rule_i,
)
from app.engine.types import (
    ChokepointState,
    CountryImpactResult,
    CountryState,
    FlowImpactResult,
    FlowState,
    RouteState,
    ScenarioActionData,
    SimulationResult,
    SimulationState,
)


class SimulationEngine:
    """Deterministic, causal, explainable simulation engine."""

    def run(
        self,
        countries: list[dict[str, Any]],
        flows: list[dict[str, Any]],
        chokepoints: list[dict[str, Any]],
        routes: list[dict[str, Any]],
        route_chokepoints: list[dict[str, Any]],
        actions: list[dict[str, Any]],
    ) -> SimulationResult:
        """Execute a full simulation and return results.

        All inputs are plain dicts to decouple the engine from ORM models.
        """
        start = time.perf_counter_ns()

        # 1. Initialize state
        state = self._init_state(countries, flows, chokepoints, routes, route_chokepoints, actions)

        state.add_step(
            rule_id="INIT",
            description=(
                f"Simulation initialized: {len(state.countries)} countries, "
                f"{len(state.flows)} flows, {len(state.chokepoints)} chokepoints, "
                f"{len(state.routes)} routes, {len(state.actions)} actions"
            ),
            detail={
                "countries": len(state.countries),
                "flows": len(state.flows),
                "chokepoints": len(state.chokepoints),
                "routes": len(state.routes),
                "actions": len(state.actions),
            },
        )

        # 2. Apply demand change actions before running rules
        self._apply_demand_changes(state)

        # 3. Execute rules in order
        apply_rule_a(state)  # Chokepoint/route disruptions
        apply_rule_b(state)  # Embargo restrictions
        apply_rule_c(state)  # Production changes
        apply_rule_d(state)  # Domestic priority
        apply_rule_e(state)  # Refining hub cascade
        apply_rule_f(state)  # Strategic reserves
        apply_rule_g(state)  # Demand coverage
        apply_rule_h(state)  # Stress scoring
        apply_rule_i(state)  # Price impact

        # 4. Aggregate results
        result = self._aggregate(state)

        elapsed_ms = (time.perf_counter_ns() - start) // 1_000_000
        result.duration_ms = elapsed_ms

        state.add_step(
            rule_id="DONE",
            description=f"Simulation completed in {elapsed_ms}ms",
            detail={
                "duration_ms": elapsed_ms,
                "global_stress_score": round(result.global_stress_score, 2),
                "global_supply_loss_pct": round(result.global_supply_loss_pct, 2),
                "estimated_price_impact_pct": round(result.estimated_price_impact_pct, 2),
            },
        )

        result.steps = state.journal
        return result

    def _init_state(
        self,
        countries: list[dict],
        flows: list[dict],
        chokepoints: list[dict],
        routes: list[dict],
        route_chokepoints: list[dict],
        actions: list[dict],
    ) -> SimulationState:
        state = SimulationState()

        # Countries
        for c in countries:
            state.countries[c["code"]] = CountryState(
                code=c["code"],
                name=c["name"],
                region_id=c["region_id"],
                production_baseline=c["production_mbpd"],
                production_current=c["production_mbpd"],
                consumption_baseline=c["consumption_mbpd"],
                consumption_current=c["consumption_mbpd"],
                refining_capacity=c.get("refining_capacity_mbpd", 0),
                strategic_reserves_mb=c.get("strategic_reserves_mb", 0),
                reserve_release_rate=c.get("reserve_release_rate_mbpd", 0),
                is_refining_hub=c.get("is_refining_hub", False),
                domestic_priority_ratio=c.get("domestic_priority_ratio", 0.3),
                longitude=c.get("longitude", 0),
                latitude=c.get("latitude", 0),
            )

        # Chokepoints
        for cp in chokepoints:
            state.chokepoints[cp["id"]] = ChokepointState(
                id=cp["id"],
                name=cp["name"],
                throughput=cp.get("throughput_mbpd", 0),
            )

        # Build route → chokepoint mapping
        route_cp_map: dict[str, list[str]] = {}
        for rc in route_chokepoints:
            rid = rc["route_id"]
            if rid not in route_cp_map:
                route_cp_map[rid] = []
            route_cp_map[rid].append(rc["chokepoint_id"])

        # Routes
        for r in routes:
            state.routes[r["id"]] = RouteState(
                id=r["id"],
                name=r["name"],
                chokepoint_ids=route_cp_map.get(r["id"], []),
            )

        # Flows
        for f in flows:
            route = state.routes.get(f["route_id"])
            cp_ids = route.chokepoint_ids if route else []
            state.flows[f["id"]] = FlowState(
                id=f["id"],
                exporter_code=f["exporter_code"],
                importer_code=f["importer_code"],
                product_id=f.get("product_id", "crude"),
                volume_baseline=f["volume_mbpd"],
                volume_current=f["volume_mbpd"],
                route_id=f["route_id"],
                chokepoint_ids=list(cp_ids),
            )

        # Actions
        for a in actions:
            state.actions.append(ScenarioActionData(
                action_type=a["action_type"],
                target_id=a["target_id"],
                severity=a.get("severity", 1.0),
                params=a.get("params", {}),
            ))

        return state

    def _apply_demand_changes(self, state: SimulationState) -> None:
        """Apply demand_change actions before the main rule chain."""
        demand_actions = [a for a in state.actions if a.action_type == "demand_change"]

        for action in demand_actions:
            region_id = action.params.get("region_id", action.target_id)
            delta_pct = action.params.get("delta_pct", action.severity * 100)

            affected: list[str] = []
            for country in state.countries.values():
                if country.region_id == region_id:
                    old = country.consumption_current
                    country.consumption_current = max(0.0, old * (1 + delta_pct / 100))
                    affected.append(country.code)

            direction = "increased" if delta_pct > 0 else "decreased"
            state.add_step(
                rule_id="DEMAND",
                description=(
                    f"Regional demand {direction} by {abs(delta_pct):.1f}% "
                    f"for region '{region_id}' ({len(affected)} countries)"
                ),
                affected_entities={"countries": affected},
                detail={"region_id": region_id, "delta_pct": delta_pct},
            )

    def _aggregate(self, state: SimulationState) -> SimulationResult:
        """Build the final SimulationResult from mutable state."""
        country_impacts: list[CountryImpactResult] = []
        flow_impacts: list[FlowImpactResult] = []

        # Baseline aggregates for each country
        baseline_exports: dict[str, float] = {}
        baseline_imports: dict[str, float] = {}
        for f in state.flows.values():
            baseline_exports[f.exporter_code] = baseline_exports.get(f.exporter_code, 0) + f.volume_baseline
            baseline_imports[f.importer_code] = baseline_imports.get(f.importer_code, 0) + f.volume_baseline

        # Country impacts
        stress_scores: list[float] = []
        status_counts = {"stable": 0, "tension": 0, "critical": 0, "emergency": 0}

        for country in state.countries.values():
            exports_before = baseline_exports.get(country.code, 0)
            imports_before = baseline_imports.get(country.code, 0)
            exports_after = country.exports_after
            imports_after = country.imports_after
            domestic_available = country.domestic_available or country.production_current
            coverage = country.coverage
            stress_score = country.stress_score
            stress_status = country.stress_status

            country_impacts.append(CountryImpactResult(
                country_code=country.code,
                production_before=country.production_baseline,
                production_after=country.production_current,
                consumption=country.consumption_current,
                imports_before=imports_before,
                imports_after=imports_after,
                exports_before=exports_before,
                exports_after=exports_after,
                domestic_available=domestic_available,
                demand_coverage_ratio=coverage if coverage != float("inf") else 999.0,
                stress_score=stress_score,
                stress_status=stress_status,
                reserve_mobilized_mbpd=country.reserve_mobilized,
            ))

            stress_scores.append(stress_score)
            status_counts[stress_status] = status_counts.get(stress_status, 0) + 1

        # Flow impacts
        for flow in state.flows.values():
            loss_pct = 0.0
            if flow.volume_baseline > 0:
                loss_pct = (flow.volume_baseline - flow.volume_current) / flow.volume_baseline * 100

            flow_impacts.append(FlowImpactResult(
                flow_id=flow.id,
                volume_before=flow.volume_baseline,
                volume_after=flow.volume_current,
                loss_pct=round(loss_pct, 2),
                loss_reasons=list(flow.loss_reasons),
            ))

        # Global metrics
        global_stress = sum(stress_scores) / len(stress_scores) if stress_scores else 0.0
        supply_loss_pct = state.global_supply_loss_pct
        price_impact_pct = state.estimated_price_impact_pct

        # Sort country impacts by stress descending for top-affected
        country_impacts.sort(key=lambda c: c.stress_score, reverse=True)
        top_affected = [
            {
                "country_code": c.country_code,
                "stress_score": round(c.stress_score, 1),
                "stress_status": c.stress_status,
                "demand_coverage_ratio": round(c.demand_coverage_ratio, 3),
            }
            for c in country_impacts[:5]
        ]

        total_flow_loss = sum(
            fi.volume_before - fi.volume_after
            for fi in flow_impacts
            if fi.volume_before > fi.volume_after
        )

        summary = {
            "countries_stable": status_counts.get("stable", 0),
            "countries_tension": status_counts.get("tension", 0),
            "countries_critical": status_counts.get("critical", 0),
            "countries_emergency": status_counts.get("emergency", 0),
            "top_affected": top_affected,
            "total_flow_loss_mbpd": round(total_flow_loss, 4),
        }

        return SimulationResult(
            global_stress_score=round(global_stress, 2),
            global_supply_loss_pct=round(supply_loss_pct, 2),
            estimated_price_impact_pct=round(price_impact_pct, 2),
            country_impacts=country_impacts,
            flow_impacts=flow_impacts,
            steps=[],  # Will be filled from state.journal
            summary=summary,
        )
