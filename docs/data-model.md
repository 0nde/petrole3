# Data Model

## Database: PostgreSQL 16 + PostGIS

All geographic columns use SRID 4326 (WGS84).

## Tables

### regions
| Column | Type | Constraints |
|---|---|---|
| id | VARCHAR(50) | PK |
| name | VARCHAR(200) | NOT NULL |
| geometry | GEOMETRY(MultiPolygon, 4326) | NULLABLE |

### countries
| Column | Type | Constraints |
|---|---|---|
| code | CHAR(3) | PK (ISO 3166-1 alpha-3) |
| name | VARCHAR(200) | NOT NULL |
| region_id | VARCHAR(50) | FK → regions.id |
| production_mbpd | FLOAT | >= 0, unit: Mb/d |
| consumption_mbpd | FLOAT | >= 0, unit: Mb/d |
| refining_capacity_mbpd | FLOAT | >= 0, unit: Mb/d |
| strategic_reserves_mb | FLOAT | >= 0, unit: Mb |
| reserve_release_rate_mbpd | FLOAT | >= 0, unit: Mb/d |
| is_refining_hub | BOOLEAN | DEFAULT false |
| domestic_priority_ratio | FLOAT | DEFAULT 0.3, CHECK [0,1] |
| longitude | FLOAT | NOT NULL |
| latitude | FLOAT | NOT NULL |

### ports
| Column | Type | Constraints |
|---|---|---|
| id | VARCHAR(50) | PK |
| name | VARCHAR(200) | NOT NULL |
| country_code | CHAR(3) | FK → countries.code |
| capacity_mbpd | FLOAT | >= 0 |
| port_type | VARCHAR(20) | CHECK IN ('export','import','both') |
| longitude | FLOAT | NOT NULL |
| latitude | FLOAT | NOT NULL |

### chokepoints
| Column | Type | Constraints |
|---|---|---|
| id | VARCHAR(50) | PK |
| name | VARCHAR(200) | NOT NULL |
| throughput_mbpd | FLOAT | >= 0, unit: Mb/d |
| longitude | FLOAT | NOT NULL |
| latitude | FLOAT | NOT NULL |

### routes
| Column | Type | Constraints |
|---|---|---|
| id | VARCHAR(50) | PK |
| name | VARCHAR(300) | NOT NULL |
| route_type | VARCHAR(20) | CHECK IN ('maritime','pipeline','mixed') |

### route_chokepoints
| Column | Type | Constraints |
|---|---|---|
| route_id | VARCHAR(50) | FK → routes.id, PK |
| chokepoint_id | VARCHAR(50) | FK → chokepoints.id, PK |
| order_index | INT | NOT NULL |

### products
| Column | Type | Constraints |
|---|---|---|
| id | VARCHAR(20) | PK |
| name | VARCHAR(100) | NOT NULL |

Values: `crude`, `refined`

### flows
| Column | Type | Constraints |
|---|---|---|
| id | VARCHAR(100) | PK |
| exporter_code | CHAR(3) | FK → countries.code |
| importer_code | CHAR(3) | FK → countries.code |
| product_id | VARCHAR(20) | FK → products.id |
| volume_mbpd | FLOAT | >= 0, unit: Mb/d |
| route_id | VARCHAR(50) | FK → routes.id |
| confidence | VARCHAR(20) | CHECK IN ('high','medium','low','estimated') |
| source | VARCHAR(500) | Data provenance |

### scenarios
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| name | VARCHAR(300) | NOT NULL |
| description | TEXT | |
| is_preset | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

### scenario_actions
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| scenario_id | UUID | FK → scenarios.id ON DELETE CASCADE |
| action_type | VARCHAR(50) | NOT NULL |
| target_id | VARCHAR(100) | NOT NULL |
| severity | FLOAT | CHECK [0,1] |
| params | JSONB | DEFAULT '{}' |
| order_index | INT | NOT NULL |

action_type values: `chokepoint_block`, `route_block`, `embargo_total`, `embargo_targeted`, `production_change`, `demand_change`, `reserve_release`, `port_disruption`

### simulation_runs
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| scenario_id | UUID | FK → scenarios.id |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| duration_ms | INT | |
| status | VARCHAR(20) | CHECK IN ('running','completed','failed') |
| global_stress_score | FLOAT | |
| global_supply_loss_pct | FLOAT | |
| estimated_price_impact_pct | FLOAT | |
| summary | JSONB | Synthetic result |

### simulation_country_impacts
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| run_id | UUID | FK → simulation_runs.id ON DELETE CASCADE |
| country_code | CHAR(3) | FK → countries.code |
| production_before | FLOAT | Mb/d |
| production_after | FLOAT | Mb/d |
| consumption | FLOAT | Mb/d |
| imports_before | FLOAT | Mb/d |
| imports_after | FLOAT | Mb/d |
| exports_before | FLOAT | Mb/d |
| exports_after | FLOAT | Mb/d |
| domestic_available | FLOAT | Mb/d |
| demand_coverage_ratio | FLOAT | |
| stress_score | FLOAT | [0-100] |
| stress_status | VARCHAR(20) | |
| reserve_mobilized_mbpd | FLOAT | Mb/d |

### simulation_flow_impacts
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| run_id | UUID | FK → simulation_runs.id ON DELETE CASCADE |
| flow_id | VARCHAR(100) | FK → flows.id |
| volume_before | FLOAT | Mb/d |
| volume_after | FLOAT | Mb/d |
| loss_pct | FLOAT | |
| loss_reasons | JSONB | Array of causal reasons |

### simulation_steps
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| run_id | UUID | FK → simulation_runs.id ON DELETE CASCADE |
| step_number | INT | NOT NULL |
| rule_id | VARCHAR(10) | e.g., 'A', 'B', 'C' |
| description | TEXT | Human-readable |
| affected_entities | JSONB | |
| detail | JSONB | Quantitative data |

### data_snapshots
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR(200) | |
| created_at | TIMESTAMPTZ | |
| source | VARCHAR(500) | |
| period | VARCHAR(50) | e.g., "2023" |
| notes | TEXT | |

### source_provenance
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| entity_type | VARCHAR(50) | e.g., 'flow', 'country' |
| entity_id | VARCHAR(100) | |
| source_name | VARCHAR(300) | |
| source_url | VARCHAR(500) | |
| source_date | DATE | |
| coverage | VARCHAR(200) | |
| confidence | VARCHAR(20) | |
| notes | TEXT | |

## Indexes

- `flows`: index on (exporter_code), (importer_code), (route_id)
- `route_chokepoints`: index on (chokepoint_id)
- `scenario_actions`: index on (scenario_id)
- `simulation_country_impacts`: index on (run_id), (country_code)
- `simulation_flow_impacts`: index on (run_id)
- `simulation_steps`: index on (run_id, step_number)

## Units Convention

All volume data uses **Mb/d** (million barrels per day) unless otherwise noted.
Reserve stocks use **Mb** (million barrels).
This is consistent with EIA/IEA reporting conventions.
