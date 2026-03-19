# Architecture

## Overview

PetroSim is a monorepo application with two main apps and shared contracts.

```
petrole3/
├── apps/
│   ├── web/           # React 19 + Vite + TypeScript frontend
│   └── api/           # FastAPI + Python 3.12 backend
├── packages/
│   └── contracts/     # Shared TypeScript types (generated from OpenAPI)
├── docs/              # All documentation
├── infra/             # Docker Compose, DB init scripts
├── data/              # Data pipeline: raw → normalized → curated → seed
│   ├── raw/
│   ├── normalized/
│   ├── curated/
│   └── seed/
├── scripts/           # Utility scripts
└── docker-compose.yml
```

## Components

### Frontend (`apps/web`)

- **Framework**: React 19 + TypeScript strict + Vite
- **State**: Zustand for global state, TanStack Query for server state
- **Map**: MapLibre GL JS + deck.gl for flow visualization
- **Preview Engine**: Web Worker running a TypeScript port of the simulation core
- **Testing**: Vitest (unit) + Playwright (E2E)

Key modules:
- `src/features/map/` — Interactive globe with flow arcs, chokepoint markers
- `src/features/scenarios/` — Scenario builder UI
- `src/features/simulation/` — Results display, country panel, causal journal
- `src/features/dashboard/` — Global analytics
- `src/engine/` — Web Worker preview simulation engine
- `src/api/` — Generated API client from OpenAPI

### Backend (`apps/api`)

- **Framework**: FastAPI with Pydantic v2 models
- **Database**: PostgreSQL 16 + PostGIS via SQLAlchemy 2.x + Alembic
- **Data processing**: Polars for data transformations
- **Testing**: Pytest + Hypothesis (property-based)

Key modules:
- `app/domain/` — Domain entities and value objects
- `app/engine/` — Simulation engine (deterministic, causal, explainable)
- `app/engine/rules/` — Individual business rules (A through I)
- `app/engine/journal.py` — Causal trace and explanation journal
- `app/api/` — FastAPI routers
- `app/db/` — SQLAlchemy models, repositories
- `app/services/` — Application services

### Database

- PostgreSQL 16 with PostGIS extension
- Schema managed via Alembic migrations
- Seed data loaded from `data/seed/`

## Key Design Decisions

### ADR-001: Deterministic Simulation Engine
The simulation engine is purely deterministic. Given the same inputs (reference data snapshot + scenario), it always produces the same outputs. No randomness, no ML. This enables reproducibility and testability.

### ADR-002: Dual Execution Model
- **Preview** (Web Worker): Fast approximate results for interactive exploration. May simplify some cascade rules.
- **Authoritative** (Backend): Full simulation with complete causal trace. Source of truth for all reported results.
- Both share the same conceptual algorithm. Differences are documented in `docs/simulation-spec.md`.

### ADR-003: Causal Journal
Every simulation produces a structured journal of steps, each explaining what happened and why. This is not optional — it's a core product feature.

### ADR-004: Data Provenance
All reference data carries source, date, unit, coverage, and confidence metadata. Data lineage is tracked from raw to seed.

### ADR-005: No Microservices
Single backend process. Complexity is managed through module boundaries, not service boundaries.

### ADR-006: Scenario as Configuration
A scenario is a declarative list of actions (shocks). The engine interprets actions — it does not embed scenario logic.

## Data Flow

```
User creates/selects scenario
        │
        ▼
┌─────────────────┐     ┌──────────────────┐
│  Web Worker      │     │  FastAPI Backend  │
│  (preview)       │     │  (authoritative)  │
│                  │     │                   │
│  Quick approx.   │     │  Full simulation  │
│  results         │     │  + causal journal │
└────────┬────────┘     └────────┬─────────┘
         │                       │
         ▼                       ▼
    Preview panel          Final results
    (immediate)            (detailed + trace)
```

## Scaling Considerations (Future)

- DuckDB + Parquet for batch Monte Carlo simulations
- OR-Tools for supply re-routing optimization
- Redis for caching simulation results
- These are NOT implemented in v1.
