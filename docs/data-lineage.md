# Data Lineage

## Pipeline Overview

```
raw/ → normalized/ → curated/ → seed/
```

Each stage applies transformations that are documented and reproducible.

## Stages

### 1. Raw (`data/raw/`)
Original data as obtained from sources.
- Format: CSV, JSON, or other original format
- No transformations applied
- Each file includes a `_metadata.json` sidecar with:
  - source name
  - source URL
  - download date
  - original units
  - coverage description
  - license/terms

### 2. Normalized (`data/normalized/`)
Data converted to consistent formats and units.
- All volumes converted to Mb/d (million barrels per day)
- All reserves converted to Mb (million barrels)
- Country codes standardized to ISO 3166-1 alpha-3
- Missing values explicitly marked (not silently dropped)
- Transformation script: `scripts/normalize.py`

### 3. Curated (`data/curated/`)
Data validated, cross-checked, and enriched.
- Consistency checks applied:
  - Country production ≥ country exports (approximately)
  - Country imports + production ≥ country consumption (approximately)
  - Flow volumes sum ≈ country trade totals (within tolerance)
- Gaps filled with documented estimates (confidence: "estimated")
- Transformation script: `scripts/curate.py`

### 4. Seed (`data/seed/`)
Final data ready for database loading.
- Format: JSON files matching database schema
- Files: `regions.json`, `countries.json`, `ports.json`, `chokepoints.json`, `routes.json`, `flows.json`, `scenarios.json`
- Loaded by: `scripts/seed.py` or `apps/api/scripts/seed.py`

## Data Sources

### Primary Sources (Reference)
| Source | Data | Confidence | Period |
|---|---|---|---|
| EIA (U.S. Energy Information Administration) | Production, consumption, trade flows | High | 2022-2023 |
| IEA (International Energy Agency) | OECD country data, strategic reserves | High | 2022-2023 |
| BP Statistical Review / Energy Institute | Global energy data | High | 2022 |
| OPEC Annual Statistical Bulletin | OPEC member data | High | 2022 |
| UN Comtrade | Bilateral trade flows | Medium | 2022 |

### Supplementary Sources
| Source | Data | Confidence |
|---|---|---|
| Industry reports (Platts, Argus) | Chokepoint throughput, routing | Medium |
| Academic literature | Elasticity estimates | Medium |
| OpenStreetMap / Natural Earth | Geographic data | High |

## Known Limitations

1. **Flow granularity**: Bilateral flow data at country level is often estimated from trade statistics. Actual shipment routing is proprietary.
2. **Chokepoint attribution**: Assigning flows to chokepoints involves assumptions about routing. We use dominant routes.
3. **Refining data**: Country-level refining capacity is available, but utilization rates and product mix are estimated.
4. **Strategic reserves**: SPR data is well-reported for OECD countries but sparse for others.
5. **Temporal alignment**: Different sources may report different reference years. We normalize to 2022-2023 averages.

## Consistency Rules

The curation stage applies these checks:
1. `sum(exports from X) ≤ production(X) × 1.1` — exports cannot vastly exceed production (10% tolerance for re-exports)
2. `sum(imports to X) + production(X) ≥ consumption(X) × 0.9` — supply must roughly meet demand
3. `sum(flows through chokepoint) ≤ chokepoint.throughput × 1.2` — flows should not vastly exceed capacity
4. Warnings are generated for violations, not hard failures

## Uncertainty Tracking

Each data point carries a `confidence` level:
- **high**: From authoritative primary source, well-established
- **medium**: From reliable source but with estimation or interpolation
- **low**: Sparse data, significant estimation
- **estimated**: Gap-filled by our curation process

Confidence is displayed in the UI and available in the API.
