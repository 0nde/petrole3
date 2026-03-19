# API Contract

## Base URL
`http://localhost:8000/api/v1`

## Endpoints

### Reference Data

#### GET /countries
Returns all countries with their energy profile.

Response: `Country[]`
```json
[{
  "code": "SAU",
  "name": "Saudi Arabia",
  "region_id": "middle_east",
  "production_mbpd": 10.5,
  "consumption_mbpd": 3.1,
  "refining_capacity_mbpd": 2.9,
  "strategic_reserves_mb": 0,
  "reserve_release_rate_mbpd": 0,
  "is_refining_hub": false,
  "domestic_priority_ratio": 0.3,
  "longitude": 45.0,
  "latitude": 25.0
}]
```

#### GET /countries/{code}
Returns a single country with full detail.

#### GET /regions
Returns all regions.

#### GET /chokepoints
Returns all chokepoints.

#### GET /routes
Returns all routes with their chokepoints.

#### GET /flows
Query params: `?exporter=SAU&importer=CHN&product=crude`
Returns filtered flows.

#### GET /flows/summary
Returns aggregate flow statistics.

#### GET /ports
Returns all ports.

### Scenarios

#### GET /scenarios
Returns all scenarios (presets + user-created).

#### GET /scenarios/{id}
Returns a single scenario with its actions.

#### POST /scenarios
Creates a new scenario.

Request:
```json
{
  "name": "Hormuz Blockade",
  "description": "Full blockade of the Strait of Hormuz",
  "actions": [
    {
      "action_type": "chokepoint_block",
      "target_id": "hormuz",
      "severity": 1.0,
      "params": {}
    }
  ]
}
```

Response: `Scenario` with generated `id`.

#### PUT /scenarios/{id}
Updates an existing scenario.

#### DELETE /scenarios/{id}
Deletes a scenario (presets cannot be deleted).

### Simulation

#### POST /simulations/run
Launches a simulation for a scenario.

Request:
```json
{
  "scenario_id": "uuid-here"
}
```

Response: `SimulationRun` with `status: "completed"` and results.

Note: In v1, simulation is synchronous (fast enough). If needed, we can add async execution later.

#### GET /simulations/{id}
Returns a simulation run with synthetic results.

#### GET /simulations/{id}/countries
Returns per-country impact table.

Query params: `?sort_by=stress_score&order=desc&limit=20`

#### GET /simulations/{id}/flows
Returns per-flow impact table.

Query params: `?min_loss_pct=10`

#### GET /simulations/{id}/journal
Returns the causal journal (simulation steps).

Response:
```json
{
  "steps": [
    {
      "step_number": 1,
      "rule_id": "A",
      "description": "Chokepoint 'Strait of Hormuz' blocked at 100% severity",
      "affected_entities": {
        "chokepoints": ["hormuz"],
        "flows": ["SAU-JPN-crude", "SAU-CHN-crude", "IRQ-IND-crude"]
      },
      "detail": {
        "flows_affected_count": 15,
        "total_volume_lost_mbpd": 17.2
      }
    }
  ]
}
```

#### GET /simulations/{id}/narrative
Returns a human-readable narrative of the simulation.

Response:
```json
{
  "narrative": "## Simulation: Hormuz Blockade\n\nThe Strait of Hormuz was fully blocked...\n\n### Direct Impacts\n- 15 crude oil flows disrupted...\n\n### Most Affected Countries\n1. Japan: demand coverage dropped to 42%..."
}
```

### Health

#### GET /health
Returns API health status.

## Error Format

```json
{
  "detail": "Scenario not found",
  "status_code": 404
}
```

## Pagination

List endpoints support `?offset=0&limit=50` pagination.
Default limit: 50. Max limit: 500.

## Content Type

All requests and responses use `application/json`.
