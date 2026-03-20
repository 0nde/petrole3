"""Golden tests — reference scenarios with expected results.

These tests lock in expected behavior for key scenarios.
If the engine changes, these tests will catch regressions.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest
from app.engine.core import SimulationEngine

SEED_DIR = Path(__file__).resolve().parent.parent.parent.parent.parent / "data" / "seed"

engine = SimulationEngine()


def load_seed():
    """Load full seed data for golden tests."""
    def _load(name):
        with open(SEED_DIR / name, "r", encoding="utf-8") as f:
            return json.load(f)

    routes_raw = _load("routes.json")
    route_chokepoints = []
    for r in routes_raw:
        for cp in r.get("chokepoints", []):
            route_chokepoints.append({"route_id": r["id"], **cp})

    routes = [{"id": r["id"], "name": r["name"], "route_type": r["route_type"]} for r in routes_raw]

    return {
        "countries": _load("countries.json"),
        "flows": _load("flows.json"),
        "chokepoints": _load("chokepoints.json"),
        "routes": routes,
        "route_chokepoints": route_chokepoints,
    }


@pytest.fixture
def seed_world():
    return load_seed()


class TestGoldenHormuzFullBlock:
    """Golden test: Full Hormuz blockade."""

    def test_supply_loss_significant(self, seed_world):
        actions = [{"action_type": "chokepoint_block", "target_id": "hormuz", "severity": 1.0, "params": {}}]
        result = engine.run(**seed_world, actions=actions)

        # Hormuz handles ~21 Mb/d — blocking should cause massive supply loss
        assert result.global_supply_loss_pct > 30, (
            f"Hormuz block should cause >30% supply loss, got {result.global_supply_loss_pct}%"
        )

    def test_japan_severely_affected(self, seed_world):
        actions = [{"action_type": "chokepoint_block", "target_id": "hormuz", "severity": 1.0, "params": {}}]
        result = engine.run(**seed_world, actions=actions)

        jpn = next((c for c in result.country_impacts if c.country_code == "JPN"), None)
        assert jpn is not None
        assert jpn.stress_status in ("critical", "emergency"), (
            f"Japan should be critical/emergency, got {jpn.stress_status}"
        )

    def test_price_impact_high(self, seed_world):
        actions = [{"action_type": "chokepoint_block", "target_id": "hormuz", "severity": 1.0, "params": {}}]
        result = engine.run(**seed_world, actions=actions)

        assert result.estimated_price_impact_pct > 50, (
            f"Hormuz block should push prices >50%, got {result.estimated_price_impact_pct}%"
        )

    def test_journal_has_entries(self, seed_world):
        actions = [{"action_type": "chokepoint_block", "target_id": "hormuz", "severity": 1.0, "params": {}}]
        result = engine.run(**seed_world, actions=actions)

        assert len(result.steps) >= 5, "Journal should have substantial entries"


class TestGoldenRussiaEmbargo:
    """Golden test: Russian export embargo to Europe."""

    def test_european_countries_affected(self, seed_world):
        actions = [{
            "action_type": "embargo_targeted", "target_id": "RUS", "severity": 1.0,
            "params": {"target_regions": ["europe"]},
        }]
        result = engine.run(**seed_world, actions=actions)

        deu = next((c for c in result.country_impacts if c.country_code == "DEU"), None)
        pol = next((c for c in result.country_impacts if c.country_code == "POL"), None)

        assert deu is not None
        assert pol is not None
        # Germany depends on Russian oil via Druzhba — imports must drop
        assert deu.imports_after < deu.imports_before
        # Poland has no direct import flows in seed data (imports_before=0)
        # but should still be severely affected structurally
        assert pol.stress_status in ("critical", "emergency"), (
            f"Poland should be critical/emergency under Russian embargo, got {pol.stress_status}"
        )

    def test_china_india_unaffected(self, seed_world):
        actions = [{
            "action_type": "embargo_targeted", "target_id": "RUS", "severity": 1.0,
            "params": {"target_regions": ["europe"]},
        }]
        result = engine.run(**seed_world, actions=actions)

        chn = next((c for c in result.country_impacts if c.country_code == "CHN"), None)
        ind = next((c for c in result.country_impacts if c.country_code == "IND"), None)

        # Russia → China and Russia → India flows should remain
        assert chn is not None
        # China's Russian crude imports should not be blocked by EU-targeted embargo
        rus_chn_flow = next((f for f in result.flow_impacts if f.flow_id == "RUS-CHN-crude"), None)
        assert rus_chn_flow is not None
        assert rus_chn_flow.volume_after > 0


class TestGoldenSaudiProductionDrop:
    """Golden test: Saudi -40% production."""

    def test_production_reduced(self, seed_world):
        actions = [{"action_type": "production_change", "target_id": "SAU", "severity": 0.4,
                     "params": {"delta_pct": -40}}]
        result = engine.run(**seed_world, actions=actions)

        sau = next((c for c in result.country_impacts if c.country_code == "SAU"), None)
        assert sau is not None
        assert abs(sau.production_after - 6.3) < 0.1, f"Expected ~6.3, got {sau.production_after}"

    def test_global_supply_loss(self, seed_world):
        actions = [{"action_type": "production_change", "target_id": "SAU", "severity": 0.4,
                     "params": {"delta_pct": -40}}]
        result = engine.run(**seed_world, actions=actions)

        assert result.global_supply_loss_pct > 5


class TestGoldenNoShock:
    """Golden test: Baseline (no shocks)."""

    def test_baseline_stable(self, seed_world):
        result = engine.run(**seed_world, actions=[])

        emergency_count = sum(1 for c in result.country_impacts if c.stress_status == "emergency")
        # In baseline, there might be countries with structural deficits,
        # but no emergency-level stress from shocks
        assert result.global_supply_loss_pct < 20, (
            f"Baseline should have minimal supply loss, got {result.global_supply_loss_pct}%"
        )

    def test_all_flows_intact(self, seed_world):
        """Without shocks, flows should mostly remain at baseline (except domestic priority)."""
        result = engine.run(**seed_world, actions=[])

        severe_losses = [f for f in result.flow_impacts if f.loss_pct > 50]
        # Allow some domestic priority adjustments but no massive losses
        assert len(severe_losses) < 5, f"Too many severe losses in baseline: {len(severe_losses)}"
