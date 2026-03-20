# PetroSim — Oil Geopolitics Simulator

[![CI](https://github.com/0nde/petrole3/actions/workflows/ci.yml/badge.svg)](https://github.com/0nde/petrole3/actions/workflows/ci.yml)
[![CD](https://github.com/0nde/petrole3/actions/workflows/cd.yml/badge.svg)](https://github.com/0nde/petrole3/actions/workflows/cd.yml)

> **Live**: hosted on AWS (IP-restricted, custom domain via Route 53)

A pedagogical, bilingual (FR/EN) simulation platform for analyzing the impact of geopolitical shocks on global oil logistics. Built with verified 2023 data from EIA, IEA, OPEC, and national agencies.

## Features

- **Interactive map** with country choropleth fills (colored by stress level after simulation)
- **14 preset scenarios** (Hormuz blockade, Russian embargo, Gulf crisis, etc.) — bilingual FR/EN
- **Multi-scenario combination** — select 2+ scenarios and run their combined effects
- **Pedagogical chokepoint profiles** — detailed history, strategic importance, real-world impact for 8 major chokepoints
- **Real-economy impact timeline** — how an oil crisis cascades through 12 sectors (aviation, food, pharma, etc.) over days/weeks/months
- **Oil news feed** — live RSS from EIA + OilPrice.com (free, no API key)
- **64 countries, 157 bilateral flows, 30 maritime/pipeline routes** — all verified against official sources
- **Trade relationship tooltips** — hover on any supplier/client to understand why they trade oil

## Quick Start

### One-command setup (Windows)
```powershell
.\start.ps1          # Starts Docker DB + API + Frontend
.\start.ps1 -Seed    # Force re-seed the database
.\start.ps1 -Stop    # Stop all services
```

### Manual setup
```bash
docker compose up -d                          # PostgreSQL
cd apps/api && pip install -r requirements.txt # Backend deps
alembic upgrade head && python -m scripts.seed # DB setup
uvicorn app.main:app --reload                  # API on :8000
cd apps/web && pnpm install && pnpm dev        # Frontend on :5173
```

## Architecture

| Layer | Technology | Hosting |
|-------|-----------|---------|
| Frontend | React 19 + Vite + TailwindCSS + MapLibre GL | S3 + CloudFront |
| Backend | FastAPI + SQLAlchemy 2 + Mangum | AWS Lambda |
| Database | PostgreSQL 16 | Neon.tech (serverless, free) |
| CI/CD | GitHub Actions | Automated on push to main |
| Infra | SAM/CloudFormation | ~$0.50/month |

## Environments

| Environment | URL | Branch | Deploys on |
|-------------|-----|--------|------------|
| **Production** | Custom domain (secret `DOMAIN`) | `main` | Push to main (after CI passes) |
| **Development** | Custom domain (secret `DEV_DOMAIN`) | Any non-main branch | Push to any branch |

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

## Documentation

- [Architecture](docs/architecture.md)
- [Data Sources & Methodology](docs/data-sources.md)
- [AWS Deployment](docs/aws-deployment.md)
- [Data Update Plan](docs/data-update-plan.md)
- [Domain Model](docs/domain-model.md)
- [Simulation Spec](docs/simulation-spec.md)
- [API Contract](docs/api-contract.md)
- [Data Lineage](docs/data-lineage.md)

## License

Proprietary — All rights reserved.
