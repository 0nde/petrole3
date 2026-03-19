"""Property-based tests using Hypothesis — simulation invariants."""

from __future__ import annotations

from hypothesis import given, strategies as st, settings as h_settings
from tests.conftest import make_country, make_flow, make_chokepoint, make_route, make_route_cp
from app.engine.core import SimulationEngine

engine = SimulationEngine()


def build_world(severity: float = 0.0):
    """Build a minimal consistent world for property testing."""
    countries = [
        make_country("EXP", "Exporter", production=10.0, consumption=2.0, priority=0.3,
                      reserves_mb=100, reserve_rate=0.5),
        make_country("IMP", "Importer", region="europe", production=0.5, consumption=6.0,
                      reserves_mb=200, reserve_rate=1.0, priority=0.8),
    ]
    chokepoints = [make_chokepoint("cp", "Strait", throughput=20.0)]
    routes = [make_route("rt", "Main route")]
    route_cps = [make_route_cp("rt", "cp")]
    flows = [make_flow("EXP-IMP-crude", "EXP", "IMP", 5.0, "rt")]
    return {
        "countries": countries, "flows": flows, "chokepoints": chokepoints,
        "routes": routes, "route_chokepoints": route_cps,
    }


@given(severity=st.floats(min_value=0.0, max_value=1.0))
@h_settings(max_examples=50)
def test_no_negative_volumes(severity: float):
    """No flow volume should ever be negative after simulation."""
    world = build_world()
    actions = [{"action_type": "chokepoint_block", "target_id": "cp", "severity": severity, "params": {}}]
    result = engine.run(**world, actions=actions)

    for fi in result.flow_impacts:
        assert fi.volume_after >= 0, f"Negative volume: {fi.flow_id} = {fi.volume_after}"
        assert fi.volume_before >= 0


@given(severity=st.floats(min_value=0.0, max_value=1.0))
@h_settings(max_examples=50)
def test_stress_score_bounded(severity: float):
    """All stress scores should be in [0, 100]."""
    world = build_world()
    actions = [{"action_type": "chokepoint_block", "target_id": "cp", "severity": severity, "params": {}}]
    result = engine.run(**world, actions=actions)

    for ci in result.country_impacts:
        assert 0 <= ci.stress_score <= 100, f"{ci.country_code}: {ci.stress_score}"


@given(severity=st.floats(min_value=0.0, max_value=1.0))
@h_settings(max_examples=50)
def test_loss_pct_bounded(severity: float):
    """Flow loss percentage should be in [0, 100]."""
    world = build_world()
    actions = [{"action_type": "chokepoint_block", "target_id": "cp", "severity": severity, "params": {}}]
    result = engine.run(**world, actions=actions)

    for fi in result.flow_impacts:
        assert 0 <= fi.loss_pct <= 100.01, f"{fi.flow_id}: {fi.loss_pct}%"


@given(severity=st.floats(min_value=0.0, max_value=1.0))
@h_settings(max_examples=50)
def test_volume_after_leq_before(severity: float):
    """Post-shock volume should not exceed baseline (for block actions)."""
    world = build_world()
    actions = [{"action_type": "chokepoint_block", "target_id": "cp", "severity": severity, "params": {}}]
    result = engine.run(**world, actions=actions)

    for fi in result.flow_impacts:
        assert fi.volume_after <= fi.volume_before + 0.001, (
            f"{fi.flow_id}: after={fi.volume_after} > before={fi.volume_before}"
        )


@given(
    sev1=st.floats(min_value=0.0, max_value=1.0),
    sev2=st.floats(min_value=0.0, max_value=1.0),
)
@h_settings(max_examples=30)
def test_higher_severity_means_more_loss(sev1: float, sev2: float):
    """A higher severity should produce equal or greater supply loss."""
    world1 = build_world()
    world2 = build_world()
    lo, hi = sorted([sev1, sev2])

    r_lo = engine.run(**world1, actions=[
        {"action_type": "chokepoint_block", "target_id": "cp", "severity": lo, "params": {}}
    ])
    r_hi = engine.run(**world2, actions=[
        {"action_type": "chokepoint_block", "target_id": "cp", "severity": hi, "params": {}}
    ])

    assert r_hi.global_supply_loss_pct >= r_lo.global_supply_loss_pct - 0.01, (
        f"sev {hi} loss={r_hi.global_supply_loss_pct} < sev {lo} loss={r_lo.global_supply_loss_pct}"
    )


@given(delta=st.floats(min_value=-90.0, max_value=50.0))
@h_settings(max_examples=50)
def test_production_change_no_negative(delta: float):
    """Production should never go negative regardless of delta."""
    world = build_world()
    actions = [{"action_type": "production_change", "target_id": "EXP", "severity": abs(delta) / 100,
                "params": {"delta_pct": delta}}]
    result = engine.run(**world, actions=actions)

    for ci in result.country_impacts:
        if ci.country_code == "EXP":
            assert ci.production_after >= 0, f"Negative production: {ci.production_after}"


@given(severity=st.floats(min_value=0.0, max_value=1.0))
@h_settings(max_examples=30)
def test_deterministic(severity: float):
    """Same inputs must always produce same outputs."""
    world = build_world()
    actions = [{"action_type": "chokepoint_block", "target_id": "cp", "severity": severity, "params": {}}]
    r1 = engine.run(**build_world(), actions=actions)
    r2 = engine.run(**build_world(), actions=actions)

    assert r1.global_stress_score == r2.global_stress_score
    assert r1.global_supply_loss_pct == r2.global_supply_loss_pct
