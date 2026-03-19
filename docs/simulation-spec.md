# Simulation Specification

## Overview

The PetroSim simulation engine is **deterministic**, **causal**, and **explainable**.
Given a reference data snapshot and a scenario (list of actions), it produces reproducible results with a full trace.

**This is NOT econometric forecasting.** It is a rule-based deterministic model that propagates shocks through a dependency graph. The results are "what-if" analyses, not predictions.

## Execution Pipeline

The engine executes the following steps in order:

```
Step 1: Initialize state from reference data snapshot
Step 2: Apply scenario actions (shocks)
Step 3: Rule A — Chokepoint/route disruptions → flow capacity reduction
Step 4: Rule B — Embargo restrictions → flow blocking
Step 5: Rule C — Production changes → country production adjustment
Step 6: Rule D — Domestic priority → export cap enforcement
Step 7: Rule E — Refining hub cascade → refined export reduction
Step 8: Rule F — Strategic reserves release → supply injection
Step 9: Rule G — Demand coverage calculation per country
Step 10: Rule H — Stress scoring per country
Step 11: Rule I — Global price impact estimation
Step 12: Aggregate global results
Step 13: Produce causal journal
```

## Rule Details

### Rule A — Chokepoint & Route Disruptions

**Input:** Actions of type `chokepoint_block` or `route_block`

**Logic:**
1. For each `chokepoint_block` action with severity `s ∈ [0, 1]`:
   - Mark chokepoint capacity reduced by `s × 100%`
2. For each flow whose route traverses an affected chokepoint:
   - `flow_capacity_factor = ∏(1 - severity_i)` for all chokepoints on its route
   - This multiplicative model avoids double-counting when multiple chokepoints on the same route are affected
3. For `route_block` actions, the entire route is affected regardless of chokepoints:
   - `flow_capacity_factor = 1 - severity`

**[HYPOTHESIS]** When a flow's route traverses multiple disrupted chokepoints, we use a multiplicative model: if chokepoint A has severity 0.5 and chokepoint B has severity 0.3, the combined factor is `(1-0.5) × (1-0.3) = 0.35`, meaning 65% loss. This is documented and configurable.

**[HYPOTHESIS]** No alternative routing in v1. If a flow's route is blocked, the flow is reduced. Future versions could model rerouting via Cape of Good Hope.

### Rule B — Embargo Restrictions

**Input:** Actions of type `embargo_total` or `embargo_targeted`

**Logic:**
1. `embargo_total` on country X: all flows where exporter = X get volume set to 0
2. `embargo_targeted` on country X toward region/countries Y:
   - Flows where exporter = X AND importer ∈ Y get volume set to 0
   - Other flows from X are unaffected

### Rule C — Production Changes

**Input:** Actions of type `production_change`

**Logic:**
1. Adjust country production: `new_production = base_production × (1 + delta_pct / 100)`
2. If new_production < 0, clamp to 0
3. Log the change in the journal

### Rule D — Domestic Priority

**Logic:** Applied after Rules A, B, C.

For each exporting country:
1. Calculate remaining production after any production changes
2. Calculate minimum domestic requirement: `min_domestic = production × domestic_priority_ratio`
3. Calculate max exportable: `max_exportable = max(0, production - min_domestic)`
4. If sum of remaining flows (after A, B) > max_exportable:
   - Scale down all export flows proportionally so total ≤ max_exportable
   - Log which flows were reduced and why

**[HYPOTHESIS]** When export flows must be reduced due to domestic priority, all flows are scaled proportionally. No per-importer priority. This is a simplification; real-world geopolitics involves preferential supply agreements.

### Rule E — Refining Hub Cascade

**Logic:** Applied after Rules A-D.

For each country where `is_refining_hub = true`:
1. Calculate crude import loss: `crude_import_ratio = actual_crude_imports / baseline_crude_imports`
2. If `crude_import_ratio < 1.0`:
   - Reduce refining output: `refining_factor = crude_import_ratio`
   - Reduce all refined product export flows from this hub by `(1 - refining_factor)`
3. Log the cascade: "Hub X lost Y% of crude imports → refined exports reduced by Z%"

**[HYPOTHESIS]** Linear relationship between crude import loss and refining output loss. In reality, refineries have min operating thresholds and yield curves. For v1, linear is the simplest explainable model.

### Rule F — Strategic Reserves

**Input:** Actions of type `reserve_release`

**Logic:**
1. For targeted release (specific country):
   - `injection = min(country.reserve_release_rate, country.strategic_reserves / 90)`
   - The `/90` assumes a 90-day planning horizon
   - Add injection to country's domestic available supply
2. For regional release:
   - Apply to all countries in region that have reserves
3. For global release:
   - Apply to all countries with reserves
4. Reserves consumed = injection × planning horizon (tracked but not deducted in single-step simulation)

**[HYPOTHESIS]** Planning horizon of 90 days for reserve calculation. The model treats a single time step (not multi-period). Reserves are modeled as flow injection, not stock depletion over time. This is a simplification documented here.

**[ASSUMPTION]** `reserve_release_rate` is capped at `strategic_reserves / 90` to prevent unrealistic instant depletion.

### Rule G — Demand Coverage

**Logic:** Applied after all supply-side rules.

For each country:
1. `domestic_available = production_after_shocks - exports_after_shocks + imports_after_shocks + reserve_injection`
2. `demand_coverage_ratio = domestic_available / consumption`
3. If consumption = 0: coverage = ∞ (not applicable)

### Rule H — Stress Scoring

**Logic:**

```
coverage_ratio → stress_score mapping:
  ≥ 0.95  →  0-10   (stable)
  0.80-0.95 → 10-40  (tension)
  0.60-0.80 → 40-70  (critical)
  < 0.60    → 70-100 (emergency)
```

Linear interpolation within each band.

**Stress status thresholds:**
| Status | Score Range | Meaning |
|---|---|---|
| stable | 0-20 | Demand adequately covered |
| tension | 20-50 | Notable supply pressure |
| critical | 50-80 | Significant shortfall risk |
| emergency | 80-100 | Severe supply crisis |

### Rule I — Price Impact Estimation

**Logic:**

```
global_supply_loss_pct = (total_baseline_flows - total_post_shock_flows) / total_baseline_flows × 100
estimated_price_impact_pct = global_supply_loss_pct × price_elasticity_factor
```

**[HYPOTHESIS]** `price_elasticity_factor = 3.0` — a 1% supply loss leads to ~3% price increase. This is a rough heuristic based on historical oil market behavior. It is NOT an econometric model. The factor is configurable.

**[LIMITATION]** This does not model demand destruction, speculation, OPEC response, or financial market dynamics.

## Output Structure

### Synthetic Result
- Global stress score (0-100)
- Global supply loss percentage
- Estimated price impact percentage
- Number of countries in each stress status
- Top 5 most affected countries

### Detailed Result
- Per-country impact table (CountryImpact)
- Per-flow impact table (FlowImpact)

### Causal Journal
- Ordered list of simulation steps
- Each step: rule ID, description, affected entities, quantitative detail
- Human-readable narrative

## Preview vs. Authoritative Engine

| Aspect | Preview (Web Worker) | Authoritative (Backend) |
|---|---|---|
| Language | TypeScript | Python |
| Speed | <100ms target | <2s target |
| Rules | A, B, C, D, G, H, I | A through I (all) |
| Hub cascade (E) | Simplified | Full |
| Reserves (F) | Simplified | Full |
| Journal | Summary only | Full trace |
| Persistence | None | Stored in DB |

The preview engine intentionally simplifies Rules E and F for speed. This is acceptable for interactive exploration. The user should "Run Full Simulation" for authoritative results.
