"""Data structures used throughout the simulation engine."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class CountryState:
    """Mutable state of a country during simulation."""
    code: str
    name: str
    region_id: str
    production_baseline: float  # Mb/d
    production_current: float   # Mb/d
    consumption_baseline: float # Mb/d
    consumption_current: float  # Mb/d
    refining_capacity: float    # Mb/d
    strategic_reserves_mb: float
    reserve_release_rate: float # Mb/d
    is_refining_hub: bool
    domestic_priority_ratio: float
    reserve_mobilized: float = 0.0  # Mb/d actually released
    longitude: float = 0.0
    latitude: float = 0.0
    # Computed by rules G/H — explicit fields instead of dynamic attrs
    exports_after: float = 0.0
    imports_after: float = 0.0
    domestic_available: float = 0.0
    coverage: float = 1.0
    stress_score: float = 0.0
    stress_status: str = "stable"


@dataclass
class FlowState:
    """Mutable state of a bilateral flow during simulation."""
    id: str
    exporter_code: str
    importer_code: str
    product_id: str  # "crude" or "refined"
    volume_baseline: float  # Mb/d
    volume_current: float   # Mb/d
    route_id: str
    chokepoint_ids: list[str] = field(default_factory=list)
    loss_reasons: list[str] = field(default_factory=list)


@dataclass
class ChokepointState:
    """State of a chokepoint during simulation."""
    id: str
    name: str
    throughput: float  # Mb/d
    severity: float = 0.0  # 0 = open, 1 = fully blocked
    exempt_importers: dict[str, float] = field(default_factory=dict)
    # Maps importer_code → open_fraction (e.g. {"CHN": 0.2} = China keeps 20%)


@dataclass
class RouteState:
    """State of a route during simulation."""
    id: str
    name: str
    chokepoint_ids: list[str] = field(default_factory=list)
    severity: float = 0.0  # direct route block severity


@dataclass
class ScenarioActionData:
    """Deserialized scenario action for the engine."""
    action_type: str
    target_id: str
    severity: float
    params: dict[str, Any] = field(default_factory=dict)


@dataclass
class SimulationStep:
    """One entry in the causal journal."""
    step_number: int
    rule_id: str
    description: str
    affected_entities: dict[str, list[str]] = field(default_factory=dict)
    detail: dict[str, Any] = field(default_factory=dict)


@dataclass
class CountryImpactResult:
    """Final impact result for one country."""
    country_code: str
    production_before: float
    production_after: float
    consumption: float
    imports_before: float
    imports_after: float
    exports_before: float
    exports_after: float
    domestic_available: float
    demand_coverage_ratio: float
    stress_score: float
    stress_status: str
    reserve_mobilized_mbpd: float


@dataclass
class FlowImpactResult:
    """Final impact result for one flow."""
    flow_id: str
    volume_before: float
    volume_after: float
    loss_pct: float
    loss_reasons: list[str]


@dataclass
class SimulationResult:
    """Complete output of a simulation run."""
    global_stress_score: float
    global_supply_loss_pct: float
    estimated_price_impact_pct: float
    country_impacts: list[CountryImpactResult]
    flow_impacts: list[FlowImpactResult]
    steps: list[SimulationStep]
    summary: dict[str, Any]
    duration_ms: int = 0


@dataclass
class SimulationState:
    """Full mutable state of the simulation world."""
    countries: dict[str, CountryState] = field(default_factory=dict)
    flows: dict[str, FlowState] = field(default_factory=dict)
    chokepoints: dict[str, ChokepointState] = field(default_factory=dict)
    routes: dict[str, RouteState] = field(default_factory=dict)
    actions: list[ScenarioActionData] = field(default_factory=list)
    journal: list[SimulationStep] = field(default_factory=list)
    step_counter: int = 0
    # Computed by rule I — explicit fields instead of dynamic attrs
    global_supply_loss_pct: float = 0.0
    estimated_price_impact_pct: float = 0.0

    def add_step(self, rule_id: str, description: str,
                 affected_entities: dict[str, list[str]] | None = None,
                 detail: dict[str, Any] | None = None) -> None:
        self.step_counter += 1
        self.journal.append(SimulationStep(
            step_number=self.step_counter,
            rule_id=rule_id,
            description=description,
            affected_entities=affected_entities or {},
            detail=detail or {},
        ))
