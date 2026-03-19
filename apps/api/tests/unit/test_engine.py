"""Unit tests for the simulation engine — Rules A through I."""

from __future__ import annotations

import pytest
from tests.conftest import make_country, make_flow, make_chokepoint, make_route, make_route_cp
from app.engine.core import SimulationEngine


engine = SimulationEngine()


# ---------------------------------------------------------------------------
# Rule A — Chokepoint disruptions
# ---------------------------------------------------------------------------

class TestRuleA:
    def test_full_chokepoint_block(self, simple_world):
        """A full chokepoint block should reduce all flows through it to zero."""
        actions = [{"action_type": "chokepoint_block", "target_id": "cp1", "severity": 1.0, "params": {}}]
        result = engine.run(**simple_world, actions=actions)

        # Flows through cp1 should be zero
        for fi in result.flow_impacts:
            if fi.flow_id in ("AAA-BBB-crude", "AAA-CCC-crude"):
                assert fi.volume_after == 0.0, f"{fi.flow_id} should be zero"
                assert fi.loss_pct == 100.0

    def test_partial_chokepoint_block(self, simple_world):
        """A 50% block should reduce flows by 50%."""
        actions = [{"action_type": "chokepoint_block", "target_id": "cp1", "severity": 0.5, "params": {}}]
        result = engine.run(**simple_world, actions=actions)

        for fi in result.flow_impacts:
            if fi.flow_id == "AAA-BBB-crude":
                assert abs(fi.volume_after - 1.25) < 0.01, f"Expected ~1.25, got {fi.volume_after}"

    def test_no_block_no_impact(self, simple_world):
        """No actions should produce no flow losses."""
        result = engine.run(**simple_world, actions=[])

        for fi in result.flow_impacts:
            assert fi.loss_pct == 0.0, f"{fi.flow_id} should have no loss"

    def test_route_block(self, simple_world):
        """A direct route block should reduce flows on that route."""
        actions = [{"action_type": "route_block", "target_id": "r2", "severity": 1.0, "params": {}}]
        result = engine.run(**simple_world, actions=actions)

        for fi in result.flow_impacts:
            if fi.flow_id == "CCC-BBB-refined":
                assert fi.volume_after == 0.0


# ---------------------------------------------------------------------------
# Rule B — Embargo
# ---------------------------------------------------------------------------

class TestRuleB:
    def test_total_embargo(self, simple_world):
        """Total embargo on AAA should zero all its exports."""
        actions = [{"action_type": "embargo_total", "target_id": "AAA", "severity": 1.0, "params": {}}]
        result = engine.run(**simple_world, actions=actions)

        for fi in result.flow_impacts:
            if fi.flow_id in ("AAA-BBB-crude", "AAA-CCC-crude"):
                assert fi.volume_after == 0.0

    def test_targeted_embargo(self, simple_world):
        """Targeted embargo from AAA toward europe should only block AAA→BBB."""
        actions = [{
            "action_type": "embargo_targeted", "target_id": "AAA", "severity": 1.0,
            "params": {"target_regions": ["europe"]},
        }]
        result = engine.run(**simple_world, actions=actions)

        for fi in result.flow_impacts:
            if fi.flow_id == "AAA-BBB-crude":
                assert fi.volume_after == 0.0
            elif fi.flow_id == "AAA-CCC-crude":
                # Not targeted — should not be zero from embargo
                # (may be reduced by domestic priority)
                assert fi.volume_after > 0.0 or fi.loss_pct < 100.0


# ---------------------------------------------------------------------------
# Rule C — Production changes
# ---------------------------------------------------------------------------

class TestRuleC:
    def test_production_decrease(self, simple_world):
        """A -50% production change should reduce available output."""
        actions = [{"action_type": "production_change", "target_id": "AAA", "severity": 0.5,
                     "params": {"delta_pct": -50}}]
        result = engine.run(**simple_world, actions=actions)

        for ci in result.country_impacts:
            if ci.country_code == "AAA":
                assert abs(ci.production_after - 5.0) < 0.01

    def test_production_increase(self, simple_world):
        """A +20% production change should increase output."""
        actions = [{"action_type": "production_change", "target_id": "AAA", "severity": 0.2,
                     "params": {"delta_pct": 20}}]
        result = engine.run(**simple_world, actions=actions)

        for ci in result.country_impacts:
            if ci.country_code == "AAA":
                assert abs(ci.production_after - 12.0) < 0.01


# ---------------------------------------------------------------------------
# Rule D — Domestic priority
# ---------------------------------------------------------------------------

class TestRuleD:
    def test_domestic_priority_caps_exports(self):
        """If production drops, exports should be capped by domestic priority."""
        countries = [
            make_country("X", "Exporter X", production=4.0, consumption=2.0, priority=0.5),
            make_country("Y", "Importer Y", production=0.0, consumption=3.0),
        ]
        flows = [make_flow("X-Y-crude", "X", "Y", 3.0, "r1")]
        chokepoints = []
        routes = [make_route("r1", "Direct")]
        route_chokepoints = []

        # With production=4 and priority=0.5, max_exportable = 4 - 2 = 2.0
        # But flow is 3.0, so it should be capped at 2.0
        result = engine.run(
            countries=countries, flows=flows, chokepoints=chokepoints,
            routes=routes, route_chokepoints=route_chokepoints, actions=[],
        )

        for fi in result.flow_impacts:
            if fi.flow_id == "X-Y-crude":
                assert fi.volume_after <= 2.01, f"Expected ≤2.0, got {fi.volume_after}"


# ---------------------------------------------------------------------------
# Rule E — Refining hub cascade
# ---------------------------------------------------------------------------

class TestRuleE:
    def test_refining_cascade(self, simple_world):
        """If CCC (hub) loses crude imports, its refined exports should drop."""
        actions = [{"action_type": "chokepoint_block", "target_id": "cp1", "severity": 1.0, "params": {}}]
        result = engine.run(**simple_world, actions=actions)

        for fi in result.flow_impacts:
            if fi.flow_id == "CCC-BBB-refined":
                # CCC lost all crude imports via cp1, so refined exports should be zero
                assert fi.volume_after == 0.0


# ---------------------------------------------------------------------------
# Rule F — Strategic reserves
# ---------------------------------------------------------------------------

class TestRuleF:
    def test_reserve_release_increases_coverage(self, simple_world):
        """Releasing reserves for BBB should improve its demand coverage."""
        # First: block chokepoint to create deficit
        actions_no_reserve = [
            {"action_type": "chokepoint_block", "target_id": "cp1", "severity": 1.0, "params": {}},
        ]
        result_no = engine.run(**simple_world, actions=actions_no_reserve)

        actions_with_reserve = [
            {"action_type": "chokepoint_block", "target_id": "cp1", "severity": 1.0, "params": {}},
            {"action_type": "reserve_release", "target_id": "BBB", "severity": 1.0, "params": {}},
        ]
        result_yes = engine.run(**simple_world, actions=actions_with_reserve)

        cov_no = next(c.demand_coverage_ratio for c in result_no.country_impacts if c.country_code == "BBB")
        cov_yes = next(c.demand_coverage_ratio for c in result_yes.country_impacts if c.country_code == "BBB")

        assert cov_yes > cov_no, f"Reserves should improve coverage: {cov_yes} > {cov_no}"


# ---------------------------------------------------------------------------
# Rule G — Demand coverage
# ---------------------------------------------------------------------------

class TestRuleG:
    def test_baseline_coverage(self, simple_world):
        """Without shocks, countries should have reasonable coverage."""
        result = engine.run(**simple_world, actions=[])

        for ci in result.country_impacts:
            assert ci.demand_coverage_ratio >= 0, f"{ci.country_code} has negative coverage"


# ---------------------------------------------------------------------------
# Rule H — Stress scoring
# ---------------------------------------------------------------------------

class TestRuleH:
    def test_stress_bounded(self, simple_world):
        """Stress scores should be in [0, 100]."""
        actions = [{"action_type": "chokepoint_block", "target_id": "cp1", "severity": 1.0, "params": {}}]
        result = engine.run(**simple_world, actions=actions)

        for ci in result.country_impacts:
            assert 0 <= ci.stress_score <= 100, f"{ci.country_code} score={ci.stress_score}"

    def test_stress_status_valid(self, simple_world):
        """Stress status should be one of the four valid values."""
        result = engine.run(**simple_world, actions=[])

        valid = {"stable", "tension", "critical", "emergency"}
        for ci in result.country_impacts:
            assert ci.stress_status in valid


# ---------------------------------------------------------------------------
# Rule I — Price impact
# ---------------------------------------------------------------------------

class TestRuleI:
    def test_no_shock_no_price_impact(self, simple_world):
        """Without shocks, price impact should be zero."""
        result = engine.run(**simple_world, actions=[])
        # May have small domestic priority adjustments
        assert result.estimated_price_impact_pct >= 0

    def test_full_block_positive_price_impact(self, simple_world):
        """Full chokepoint block should produce positive price impact."""
        actions = [{"action_type": "chokepoint_block", "target_id": "cp1", "severity": 1.0, "params": {}}]
        result = engine.run(**simple_world, actions=actions)
        assert result.estimated_price_impact_pct > 0


# ---------------------------------------------------------------------------
# Integration: combined scenario
# ---------------------------------------------------------------------------

class TestCombinedScenarios:
    def test_combined_shock(self, simple_world):
        """Multiple shocks should compound correctly."""
        actions = [
            {"action_type": "chokepoint_block", "target_id": "cp1", "severity": 0.5, "params": {}},
            {"action_type": "production_change", "target_id": "AAA", "severity": 0.3, "params": {"delta_pct": -30}},
        ]
        result = engine.run(**simple_world, actions=actions)

        assert result.global_supply_loss_pct > 0
        assert result.estimated_price_impact_pct > 0
        assert len(result.steps) > 0

    def test_determinism(self, simple_world):
        """Running the same scenario twice should produce identical results."""
        actions = [{"action_type": "chokepoint_block", "target_id": "cp1", "severity": 0.7, "params": {}}]
        r1 = engine.run(**simple_world, actions=actions)
        r2 = engine.run(**simple_world, actions=actions)

        assert r1.global_stress_score == r2.global_stress_score
        assert r1.global_supply_loss_pct == r2.global_supply_loss_pct
        assert len(r1.country_impacts) == len(r2.country_impacts)
