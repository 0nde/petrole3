"""Shared test fixtures for the PetroSim test suite."""

from __future__ import annotations

import pytest

from app.engine.types import SimulationState, CountryState, FlowState, ChokepointState, RouteState


def make_country(code: str, name: str, region: str = "middle_east",
                 production: float = 5.0, consumption: float = 2.0,
                 refining_cap: float = 0.0, reserves_mb: float = 0.0,
                 reserve_rate: float = 0.0, is_hub: bool = False,
                 priority: float = 0.3) -> dict:
    return {
        "code": code, "name": name, "region_id": region,
        "production_mbpd": production, "consumption_mbpd": consumption,
        "refining_capacity_mbpd": refining_cap,
        "strategic_reserves_mb": reserves_mb,
        "reserve_release_rate_mbpd": reserve_rate,
        "is_refining_hub": is_hub,
        "domestic_priority_ratio": priority,
        "longitude": 0.0, "latitude": 0.0,
    }


def make_flow(id: str, exporter: str, importer: str, volume: float,
              route: str, product: str = "crude") -> dict:
    return {
        "id": id, "exporter_code": exporter, "importer_code": importer,
        "product_id": product, "volume_mbpd": volume, "route_id": route,
    }


def make_chokepoint(id: str, name: str, throughput: float = 10.0) -> dict:
    return {"id": id, "name": name, "throughput_mbpd": throughput}


def make_route(id: str, name: str, route_type: str = "maritime") -> dict:
    return {"id": id, "name": name, "route_type": route_type}


def make_route_cp(route_id: str, cp_id: str, order: int = 0) -> dict:
    return {"route_id": route_id, "chokepoint_id": cp_id, "order_index": order}


@pytest.fixture
def simple_world():
    """A simple test world with 3 countries, 1 chokepoint, 2 routes, 3 flows."""
    countries = [
        make_country("AAA", "Producer A", production=10.0, consumption=3.0, priority=0.3),
        make_country("BBB", "Consumer B", region="europe", production=0.5, consumption=5.0,
                     reserves_mb=100, reserve_rate=0.5, priority=0.8),
        make_country("CCC", "Hub C", region="asia_pacific", production=4.0, consumption=3.0,
                     refining_cap=4.0, is_hub=True, reserves_mb=50, reserve_rate=0.2, priority=0.7),
    ]
    chokepoints = [
        make_chokepoint("cp1", "Test Strait", throughput=15.0),
    ]
    routes = [
        make_route("r1", "Route via strait"),
        make_route("r2", "Direct route"),
    ]
    route_chokepoints = [
        make_route_cp("r1", "cp1", 0),
    ]
    flows = [
        make_flow("AAA-BBB-crude", "AAA", "BBB", 2.5, "r1", "crude"),
        make_flow("AAA-CCC-crude", "AAA", "CCC", 3.0, "r1", "crude"),
        make_flow("CCC-BBB-refined", "CCC", "BBB", 1.0, "r2", "refined"),
    ]
    return {
        "countries": countries,
        "flows": flows,
        "chokepoints": chokepoints,
        "routes": routes,
        "route_chokepoints": route_chokepoints,
    }
