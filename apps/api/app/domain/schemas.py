"""Pydantic v2 schemas for API request/response contracts."""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class ProductType(str, Enum):
    crude = "crude"
    refined = "refined"


class Confidence(str, Enum):
    high = "high"
    medium = "medium"
    low = "low"
    estimated = "estimated"


class PortType(str, Enum):
    export = "export"
    import_ = "import"
    both = "both"


class RouteType(str, Enum):
    maritime = "maritime"
    pipeline = "pipeline"
    mixed = "mixed"


class ActionType(str, Enum):
    chokepoint_block = "chokepoint_block"
    route_block = "route_block"
    embargo_total = "embargo_total"
    embargo_targeted = "embargo_targeted"
    production_change = "production_change"
    demand_change = "demand_change"
    reserve_release = "reserve_release"
    port_disruption = "port_disruption"


class StressStatus(str, Enum):
    stable = "stable"
    tension = "tension"
    critical = "critical"
    emergency = "emergency"


class SimulationStatus(str, Enum):
    running = "running"
    completed = "completed"
    failed = "failed"


# ---------------------------------------------------------------------------
# Reference data schemas
# ---------------------------------------------------------------------------

class RegionOut(BaseModel):
    id: str
    name: str

    model_config = {"from_attributes": True}


class CountryOut(BaseModel):
    code: str
    name: str
    region_id: str
    production_mbpd: float
    consumption_mbpd: float
    refining_capacity_mbpd: float
    strategic_reserves_mb: float
    reserve_release_rate_mbpd: float
    is_refining_hub: bool
    domestic_priority_ratio: float
    longitude: float
    latitude: float

    model_config = {"from_attributes": True}


class PortOut(BaseModel):
    id: str
    name: str
    country_code: str
    capacity_mbpd: float
    port_type: str
    longitude: float
    latitude: float

    model_config = {"from_attributes": True}


class ChokepointOut(BaseModel):
    id: str
    name: str
    throughput_mbpd: float
    longitude: float
    latitude: float

    model_config = {"from_attributes": True}


class RouteChokepointOut(BaseModel):
    chokepoint_id: str
    order_index: int

    model_config = {"from_attributes": True}


class RouteOut(BaseModel):
    id: str
    name: str
    route_type: str
    chokepoints: list[RouteChokepointOut] = []

    model_config = {"from_attributes": True}


class FlowOut(BaseModel):
    id: str
    exporter_code: str
    importer_code: str
    product_id: str
    volume_mbpd: float
    route_id: str
    confidence: str
    source: str | None = None

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Scenario schemas
# ---------------------------------------------------------------------------

class ScenarioActionIn(BaseModel):
    action_type: ActionType
    target_id: str
    severity: float = Field(ge=0.0, le=1.0, default=1.0)
    params: dict[str, Any] = Field(default_factory=dict)
    order_index: int = 0


class ScenarioActionOut(BaseModel):
    id: uuid.UUID
    action_type: str
    target_id: str
    severity: float
    params: dict[str, Any]
    order_index: int

    model_config = {"from_attributes": True}


class ScenarioCreate(BaseModel):
    name: str = Field(min_length=1, max_length=300)
    description: str | None = None
    actions: list[ScenarioActionIn] = []


class ScenarioUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    actions: list[ScenarioActionIn] | None = None


class ScenarioOut(BaseModel):
    id: uuid.UUID
    name: str
    name_fr: str | None = None
    description: str | None
    description_fr: str | None = None
    is_preset: bool
    created_at: datetime
    updated_at: datetime
    actions: list[ScenarioActionOut] = []

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Simulation schemas
# ---------------------------------------------------------------------------

class SimulationRunRequest(BaseModel):
    scenario_id: uuid.UUID


class SimulationRunCombinedRequest(BaseModel):
    scenario_ids: list[uuid.UUID] = Field(min_length=1, max_length=10)


class CountryImpactOut(BaseModel):
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

    model_config = {"from_attributes": True}


class FlowImpactOut(BaseModel):
    flow_id: str
    volume_before: float
    volume_after: float
    loss_pct: float
    loss_reasons: list[str]

    model_config = {"from_attributes": True}


class SimulationStepOut(BaseModel):
    step_number: int
    rule_id: str
    description: str
    affected_entities: dict[str, Any]
    detail: dict[str, Any]

    model_config = {"from_attributes": True}


class SimulationSummary(BaseModel):
    countries_stable: int = 0
    countries_tension: int = 0
    countries_critical: int = 0
    countries_emergency: int = 0
    top_affected: list[dict[str, Any]] = []
    total_flow_loss_mbpd: float = 0.0


class SimulationRunOut(BaseModel):
    id: uuid.UUID
    scenario_id: uuid.UUID
    created_at: datetime
    duration_ms: int | None
    status: str
    global_stress_score: float | None
    global_supply_loss_pct: float | None
    estimated_price_impact_pct: float | None
    summary: SimulationSummary | None = None

    model_config = {"from_attributes": True}


class SimulationDetailOut(BaseModel):
    run: SimulationRunOut
    country_impacts: list[CountryImpactOut]
    flow_impacts: list[FlowImpactOut]
    steps: list[SimulationStepOut]


class NarrativeOut(BaseModel):
    narrative: str
