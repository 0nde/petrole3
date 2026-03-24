# Architecture

## Overview

PetroSim is a monorepo application with two main apps and shared contracts.

```
petrole3/
├── apps/
│   ├── web/           # React 19 + Vite 8 + TypeScript 6 frontend
│   └── api/           # FastAPI 0.135 + Python 3.12 backend
├── docs/              # All documentation
├── infra/             # SAM templates (prod + dev), Docker Compose
├── data/              # Data pipeline: raw → normalized → curated → seed
│   ├── raw/
│   ├── normalized/
│   ├── curated/
│   └── seed/
├── .github/workflows/ # CI/CD pipelines with pedagogical comments
└── docker-compose.yml # Local PostgreSQL 16
```

## Components

### Frontend (`apps/web`)

- **Framework**: React 19 + TypeScript 6.0 (strict) + Vite 8
- **Styling**: TailwindCSS 3.4.19 (locked to v3, v4 has breaking changes)
- **State**: Zustand 5 for global state, TanStack Query 5 for server state
- **Map**: MapLibre GL 5.21.0 (choropleth + blue ocean styling)
- **Preview Engine**: Web Worker running a TypeScript port of the simulation core
- **Testing**: Vitest 4 (unit) + Playwright 1.49 (E2E)

**Recent updates (March 2026)**:
- MapLibre GL 5.21.0 fixed choropleth rendering bugs
- Added dynamic blue ocean styling (#1e3a8a) for better land-water contrast
- TypeScript 6.0 with `ignoreDeprecations: "6.0"` for baseUrl

Key modules:
- `src/features/map/` — Interactive globe with flow arcs, chokepoint markers
- `src/features/scenarios/` — Scenario builder UI
- `src/features/simulation/` — Results display, country panel, causal journal
- `src/features/dashboard/` — Global analytics
- `src/engine/` — Web Worker preview simulation engine
- `src/api/` — Generated API client from OpenAPI

### Backend (`apps/api`)

- **Framework**: FastAPI 0.135.2 with Pydantic 2.10.4 models
- **Server**: Uvicorn 0.42.0 (ASGI) + Mangum (Lambda adapter)
- **Database**: PostgreSQL 16 via SQLAlchemy 2.0.48 (async) + Alembic 1.14.1
- **Data processing**: Polars 1.39.3 for data transformations
- **Testing**: Pytest 8.3.4 + Hypothesis 6.151.9 (property-based)

**Hosting**: AWS Lambda (Python 3.12) via SAM/CloudFormation

Key modules:
- `app/domain/` — Domain entities and value objects
- `app/engine/` — Simulation engine (deterministic, causal, explainable)
- `app/engine/rules/` — Individual business rules (A through I)
- `app/engine/journal.py` — Causal trace and explanation journal
- `app/api/` — FastAPI routers
- `app/db/` — SQLAlchemy models, repositories
- `app/services/` — Application services

### Database

- **Production**: Neon.tech PostgreSQL 16 serverless (eu-west-3)
  - Endpoint: ep-withered-block-alwtryyg-pooler
  - Project: dark-king-21176733
- **Development**: Neon.tech PostgreSQL 16 serverless (eu-central-1)
  - Endpoint: ep-tiny-thunder-alx82aci-pooler
- **Local**: Docker Compose PostgreSQL 16
- Schema managed via Alembic migrations
- Seed data loaded from `data/seed/`
- Enriched data: 1,638 verified indicators (94.9% machine-verified)

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

## Deployment Architecture

**Production** (petrosim.joyon.org):
- Frontend: S3 + CloudFront (E39MKQBJY7TQL3)
- Backend: Lambda + API Gateway (6n66m2gr9c)
- Database: Neon.tech (ep-withered-block-alwtryyg-pooler)
- Security: CloudFront Functions (IP whitelist with CIDR)
- Region: eu-west-3

**Development** (dev-petrosim.joyon.org):
- Frontend: S3 + CloudFront (EC4H1MGV4R0MT)
- Backend: Lambda + API Gateway (13ys6hwabg)
- Database: Neon.tech (ep-tiny-thunder-alx82aci-pooler)
- Region: eu-west-3 (frontend/backend), eu-central-1 (database)

**CI/CD**:
- GitHub Actions with OIDC authentication (no long-lived credentials)
- Matrix testing: Node 20/22 × Python 3.11/3.12
- Dependabot: Monthly updates (npm, pip, GitHub Actions)

## Scaling Considerations (Future)

- DuckDB + Parquet for batch Monte Carlo simulations
- OR-Tools for supply re-routing optimization
- Redis for caching simulation results
- These are NOT implemented in v1.
