# PetroSim — Geoenergy Simulation Workbench

A deterministic, explainable simulation platform for analyzing the impact of geopolitical shocks on global oil logistics.

## What is PetroSim?

PetroSim is a "simplified but serious digital twin" of global oil flows. It lets analysts explore questions like:

- What happens if the Strait of Hormuz is blocked?
- Which countries become critical if Russian exports to Europe stop?
- How does a Saudi production drop propagate through refining hubs?
- What strategic reserves can absorb a crisis?

## Architecture

- **Monorepo** with `apps/web` (React 19 + Vite), `apps/api` (FastAPI), shared contracts
- **PostgreSQL + PostGIS** for geospatial data
- **Deterministic simulation engine** with full causal trace
- **Dual execution**: fast Web Worker preview + authoritative backend engine

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Python 3.12+
- pnpm 9+

### Development

```bash
# Start infrastructure (PostgreSQL)
docker compose up -d

# Backend
cd apps/api
python -m venv .venv
.venv/Scripts/activate  # Windows
pip install -r requirements.txt
alembic upgrade head
python -m scripts.seed
uvicorn app.main:app --reload

# Frontend
cd apps/web
pnpm install
pnpm dev
```

### Running Tests

```bash
# Backend tests
cd apps/api
pytest

# Frontend tests
cd apps/web
pnpm test

# E2E tests
cd apps/web
pnpm test:e2e
```

## Documentation

- [Architecture](docs/architecture.md)
- [Domain Model](docs/domain-model.md)
- [Simulation Spec](docs/simulation-spec.md)
- [Data Model](docs/data-model.md)
- [API Contract](docs/api-contract.md)
- [Data Lineage](docs/data-lineage.md)
- [Assumptions & Limitations](docs/assumptions-and-limitations.md)
- [Runbook](docs/runbook.md)

## Project Structure

```
petrole3/
├── apps/
│   ├── api/                    # FastAPI backend
│   │   ├── app/
│   │   │   ├── api/            # Route handlers (ref, scenarios, simulations)
│   │   │   ├── engine/         # Simulation engine (rules A-I, narrative)
│   │   │   ├── models.py       # SQLAlchemy ORM models
│   │   │   ├── schemas.py      # Pydantic v2 schemas
│   │   │   ├── database.py     # Async DB session
│   │   │   ├── config.py       # Settings
│   │   │   └── main.py         # FastAPI app entry point
│   │   ├── alembic/            # Database migrations
│   │   ├── scripts/            # Seed script
│   │   └── tests/              # Unit, property-based, golden tests
│   └── web/                    # React 19 + Vite frontend
│       ├── src/
│       │   ├── api/            # API client & TanStack Query hooks
│       │   ├── components/     # Header, SidePanel, GlobalStats
│       │   ├── features/       # Map, Scenarios, Simulation panels
│       │   ├── hooks/          # usePreviewEngine
│       │   ├── store/          # Zustand global state
│       │   ├── workers/        # Web Worker preview engine
│       │   └── types.ts        # Shared TypeScript types
│       └── e2e/                # Playwright E2E tests
├── data/seed/                  # JSON seed data files
├── docs/                       # Architecture & spec documentation
└── docker-compose.yml          # PostgreSQL + PostGIS
```

## Simulation Rules

| Rule | Name | Description |
|------|------|-------------|
| A | Chokepoint blockade | Block flows through disrupted maritime chokepoints |
| B | Embargo | Zero out flows from embargoed exporters |
| C | Production change | Adjust country production capacity |
| D | Domestic priority | Allocate production to domestic use first |
| E | Refining cascade | Propagate impact through refining hubs |
| F | Reserve release | Mobilize strategic reserves to cover shortfall |
| G | Coverage ratio | Compute demand coverage per country |
| H | Stress scoring | Classify countries: stable/tension/critical/emergency |
| I | Price impact | Estimate global price impact via elasticity model |

## License

Proprietary — All rights reserved.
