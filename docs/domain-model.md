# Domain Model

## Core Entities

### Country
A sovereign state that participates in the global oil system.

| Attribute | Type | Unit | Description |
|---|---|---|---|
| code | string (ISO 3166-1 alpha-3) | — | Unique identifier |
| name | string | — | Display name |
| region_id | FK | — | Geographic region |
| production | float | Mb/d (million barrels/day) | Crude oil production capacity |
| consumption | float | Mb/d | Domestic oil consumption |
| refining_capacity | float | Mb/d | Installed refining throughput |
| strategic_reserves | float | Mb (million barrels) | Strategic petroleum reserve volume |
| reserve_release_rate | float | Mb/d | Max daily release from strategic reserves |
| is_refining_hub | bool | — | Whether this country is a significant refining hub |
| domestic_priority_ratio | float [0-1] | — | Min share of production reserved for domestic use (default: 0.3) |
| coordinates | Point (lon, lat) | WGS84 | Centroid for map display |

**[HYPOTHESIS]** `domestic_priority_ratio` defaults to 0.3 — meaning a country will reserve at least 30% of its production for domestic consumption before exporting. This is configurable per country.

**[HYPOTHESIS]** `reserve_release_rate` is modeled as a max daily release rate (Mb/d). Actual mobilization = min(release_rate × duration, available_reserves). This is the simplest explainable model.

### Region
A geographic grouping of countries.

| Attribute | Type | Description |
|---|---|---|
| id | string | e.g., "middle_east", "europe", "asia_pacific" |
| name | string | Display name |
| geometry | MultiPolygon | GeoJSON boundary |

Regions: Middle East, North Africa, Sub-Saharan Africa, Europe, CIS (Russia+), North America, Latin America, Asia-Pacific, South Asia.

### Port
A petroleum port facility.

| Attribute | Type | Description |
|---|---|---|
| id | string | Unique identifier |
| name | string | e.g., "Ras Tanura", "Rotterdam Europoort" |
| country_code | FK | Owning country |
| capacity | float (Mb/d) | Throughput capacity |
| coordinates | Point | Location |
| port_type | enum | export, import, both |

### Chokepoint
A maritime strait or narrow passage through which oil flows.

| Attribute | Type | Description |
|---|---|---|
| id | string | e.g., "hormuz", "bab_el_mandeb", "malacca" |
| name | string | Display name |
| throughput | float (Mb/d) | Estimated daily throughput |
| coordinates | Point | Representative location |
| geometry | LineString | Geographic representation |

Key chokepoints modeled:
- Strait of Hormuz (~21 Mb/d)
- Strait of Malacca (~16 Mb/d)
- Suez Canal / SUMED Pipeline (~5.5 Mb/d)
- Bab el-Mandeb (~6.2 Mb/d)
- Turkish Straits (Bosphorus) (~2.4 Mb/d)
- Danish Straits (~3.2 Mb/d)
- Panama Canal (~0.9 Mb/d)
- Cape of Good Hope (alternative route, not a chokepoint per se)

**[FACT]** Throughput figures from EIA, IEA, and industry estimates (2022-2023 reference).

### Route
A maritime or pipeline route connecting production to consumption.

| Attribute | Type | Description |
|---|---|---|
| id | string | Unique identifier |
| name | string | e.g., "Persian Gulf → East Asia via Malacca" |
| route_type | enum | maritime, pipeline, mixed |
| chokepoints | list[FK] | Ordered list of chokepoints traversed |
| geometry | LineString | Geographic path |

### Flow
A bilateral oil flow from exporter to importer.

| Attribute | Type | Description |
|---|---|---|
| id | string | Unique identifier |
| exporter_code | FK | Exporting country |
| importer_code | FK | Importing country |
| product_type | enum | crude, refined, both |
| volume | float (Mb/d) | Daily flow volume |
| route_id | FK | Primary route used |
| confidence | enum | high, medium, low, estimated |
| source | string | Data provenance |

**[HYPOTHESIS]** Each flow is assigned a single primary route. In reality, flows may use multiple routes. For v1, we use the dominant route. A future version could model route shares.

### Product Type
- `crude` — Crude oil
- `refined` — Refined petroleum products (gasoline, diesel, jet fuel, etc.)

**[HYPOTHESIS]** We do not model individual refined product types in v1. A refined product is treated as a single aggregate. This simplifies the model significantly while still capturing the hub-to-consumer dynamic.

### Scenario
A named collection of shocks to apply to the reference state.

| Attribute | Type | Description |
|---|---|---|
| id | UUID | Unique identifier |
| name | string | Display name |
| description | string | What this scenario explores |
| actions | list[ScenarioAction] | Ordered list of shocks |
| is_preset | bool | Whether this is a built-in scenario |

### ScenarioAction
A single shock within a scenario.

| Attribute | Type | Description |
|---|---|---|
| id | UUID | |
| action_type | enum | See below |
| target_id | string | ID of affected entity |
| severity | float [0-1] | 1.0 = total, 0.5 = 50% disruption |
| params | JSON | Additional parameters |

Action types:
- `chokepoint_block` — Block/restrict a chokepoint
- `route_block` — Block/restrict a route
- `embargo_total` — Total export embargo on a country
- `embargo_targeted` — Embargo toward specific countries/regions
- `production_change` — Increase or decrease production (params: `delta_pct`)
- `demand_change` — Regional demand change (params: `region_id`, `delta_pct`)
- `reserve_release` — Release strategic reserves (params: `country_code` or `region_id` or `global`)
- `port_disruption` — Disrupt a port facility

## Relationships

```
Region 1──* Country
Country 1──* Port
Country 1──* Flow (as exporter)
Country 1──* Flow (as importer)
Route 1──* Chokepoint (ordered, via route_chokepoints)
Flow *──1 Route
Scenario 1──* ScenarioAction
SimulationRun 1──1 Scenario
SimulationRun 1──* SimulationStep (causal journal)
SimulationRun 1──* CountryImpact
SimulationRun 1──* FlowImpact
```

## Simulation Output Entities

### SimulationRun
| Attribute | Type |
|---|---|
| id | UUID |
| scenario_id | FK |
| created_at | timestamp |
| global_stress_score | float [0-100] |
| global_supply_loss_pct | float |
| estimated_price_impact_pct | float |
| status | enum: completed, failed |

### CountryImpact
| Attribute | Type | Description |
|---|---|---|
| country_code | FK | |
| production_after | float (Mb/d) | Post-shock production |
| consumption | float (Mb/d) | Demand (may change) |
| imports_after | float (Mb/d) | Post-shock imports received |
| exports_after | float (Mb/d) | Post-shock exports sent |
| domestic_available | float (Mb/d) | production_after - exports_after + imports_after |
| demand_coverage_ratio | float [0-∞] | domestic_available / consumption |
| stress_score | float [0-100] | |
| stress_status | enum | stable, tension, critical, emergency |
| reserve_mobilized | float (Mb/d) | Reserves released |

### FlowImpact
| Attribute | Type | Description |
|---|---|---|
| flow_id | FK | |
| volume_before | float (Mb/d) | |
| volume_after | float (Mb/d) | |
| loss_pct | float | |
| loss_reasons | list[string] | Causal chain |

### SimulationStep (Causal Journal)
| Attribute | Type | Description |
|---|---|---|
| step_number | int | Order in execution |
| rule_id | string | Which rule fired (A, B, C, ...) |
| description | string | Human-readable explanation |
| affected_entities | JSON | IDs of affected countries/flows/chokepoints |
| detail | JSON | Quantitative detail |
