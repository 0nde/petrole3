# Assumptions and Limitations

## Modeling Assumptions

### A1. Single Time Step
The simulation operates on a single time step. It computes the immediate impact of shocks, not a multi-period evolution. There is no temporal dynamics (inventory drawdown over weeks, demand adjustment over months).

**Implication**: Results represent "instantaneous impact" scenarios, not time-series projections.

### A2. No Alternative Routing
When a chokepoint or route is blocked, affected flows are reduced. The model does NOT automatically reroute flows via alternative paths (e.g., Cape of Good Hope instead of Suez).

**Implication**: Results may overstate impact for scenarios where rerouting is feasible. A future version could add rerouting with capacity constraints and cost penalties.

### A3. Multiplicative Chokepoint Model
When a flow traverses multiple disrupted chokepoints, the combined capacity factor is the product of individual factors: `∏(1 - severity_i)`.

**Justification**: This avoids double-counting and has a natural interpretation — each chokepoint independently restricts capacity.

### A4. Proportional Export Reduction
When domestic priority forces export reduction (Rule D), all export flows from a country are reduced proportionally. No per-importer priority is modeled.

**Implication**: In reality, countries may prioritize long-term contract partners. This is a simplification.

### A5. Linear Refining Cascade
A refining hub's output is linearly proportional to its crude input. If crude imports drop by 30%, refined exports drop by 30%.

**Implication**: Real refineries have non-linear behavior (minimum throughput, yield optimization). For v1, linear is the simplest explainable model.

### A6. Price Elasticity Heuristic
Price impact = supply loss % × 3.0. This is a rough heuristic, not an econometric model.

**Implication**: Real oil prices are driven by speculation, OPEC decisions, demand destruction, and financial markets. Our estimate is directional only.

### A7. Strategic Reserves as Flow
Reserves are modeled as a flow injection (Mb/d) rather than a stock drawdown over time. The release rate is capped at `min(release_rate, stock / 90_days)`.

**Implication**: Adequate for single-step analysis. Multi-period scenarios would need stock depletion tracking.

### A8. Domestic Priority Ratio
Default 0.3 — a country reserves at least 30% of its production for domestic use.

**Source**: Heuristic based on observation that most oil-producing countries maintain domestic supply commitments. Configurable per country.

### A9. Single Route per Flow
Each bilateral flow is assigned one primary route. In reality, flows may use multiple routes.

**Implication**: Impact may be overstated for flows that in practice use diversified routing.

## Data Limitations

### D1. Bilateral Flow Coverage
Complete bilateral flow data for all country pairs does not exist publicly. We use a combination of UN Comtrade, EIA, and estimates. Many smaller flows are estimated or omitted.

### D2. Non-OECD Reserve Data
Strategic petroleum reserve data is well-documented for OECD/IEA members but sparse or unreliable for many developing countries.

### D3. Refining Utilization
We model refining capacity, not actual utilization. A country's effective refining throughput may be lower than nameplate capacity.

### D4. Temporal Snapshot
Data represents a 2022-2023 average. The oil market changes annually. Regular data refresh would be needed for production use.

### D5. Product Aggregation
We do not distinguish between gasoline, diesel, jet fuel, naphtha, etc. All refined products are treated as a single aggregate.

## What This Tool Is NOT

- **Not a forecasting tool**: It does not predict future prices or supply.
- **Not an econometric model**: It does not estimate elasticities or market equilibria.
- **Not a real-time system**: It uses static reference data, not live feeds.
- **Not a trading tool**: Results should not be used for financial decisions.
- **Not a policy simulator**: It does not model government responses or OPEC decisions.

It IS a structured what-if analysis tool for understanding oil flow dependencies and vulnerability.
