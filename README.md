# PetroSim — Oil Geopolitics Simulator

[![CI](https://github.com/0nde/petrole3/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/0nde/petrole3/actions/workflows/ci.yml)
[![CD](https://github.com/0nde/petrole3/actions/workflows/cd.yml/badge.svg?branch=main)](https://github.com/0nde/petrole3/actions/workflows/cd.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)

> **Live**: Hosted on AWS (S3 + CloudFront + Lambda) • IP-restricted • Custom domain via Route 53

A pedagogical, bilingual (FR/EN) simulation platform for analyzing the impact of geopolitical shocks on global oil logistics. Built with verified 2023 data from EIA, IEA, OPEC, and national agencies.

**Interactive demo** featuring 64 countries, 157 bilateral flows, 14 preset scenarios, and real-time impact analysis across 12 economic sectors.

## ✨ Features

### 🗺️ Interactive Visualization
- **MapLibre GL globe** with country choropleth fills (colored by stress level: stable/tension/critical/emergency)
- **Flow arcs** showing bilateral oil trade routes (maritime + pipeline)
- **Chokepoint markers** for 8 strategic bottlenecks (Hormuz, Malacca, Suez, etc.)
- **Country panels** with production, consumption, reserves, and trade data
- **Verified data tooltips** explaining trade relationships and geopolitical context

### 🎯 Scenario Engine
- **14 preset scenarios** (Hormuz blockade, Russian embargo, Iran sanctions, Gulf crisis, etc.) — bilingual FR/EN
- **Multi-scenario combination** — select 2+ scenarios and run their combined effects
- **Custom scenario builder** — create your own disruption scenarios
- **Deterministic simulation** — same inputs always produce same outputs (reproducible)
- **Causal journal** — detailed explanation of every simulation step

### 📊 Impact Analysis
- **Real-economy timeline** — how oil crises cascade through 12 sectors (aviation, food, pharma, manufacturing, etc.) over days/weeks/months
- **Price impact model** — estimate global oil price changes via elasticity
- **Strategic reserve simulation** — model SPR releases and their effectiveness
- **Domestic priority rules** — countries prioritize local consumption during crises

### 📰 Live Data
- **Oil news feed** — live RSS from EIA + OilPrice.com (no API key required)
- **64 countries** with production, consumption, reserves, refining capacity
- **157 bilateral flows** — all verified against IEA, EIA, OPEC, UN Comtrade
- **30 maritime/pipeline routes** with chokepoint dependencies

### 🎓 Pedagogical Focus
- **Chokepoint profiles** — detailed history, strategic importance, real-world incidents for 8 major chokepoints
- **Scenario intelligence** — contextual explanations for each preset scenario
- **Trade relationship tooltips** — why countries trade oil (geography, refining, politics)
- **Bilingual interface** — full FR/EN support throughout the app

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

## 🏗️ Architecture

| Layer | Technology | Hosting |
|-------|-----------|---------|
| **Frontend** | React 19 + Vite 8 + TypeScript 6 + TailwindCSS 3 + MapLibre GL 5 | S3 + CloudFront |
| **Backend** | FastAPI 0.135 + SQLAlchemy 2.0 + Uvicorn 0.42 + Mangum | AWS Lambda (Python 3.12) |
| **Database** | PostgreSQL 16 + Alembic migrations | Neon.tech (serverless) |
| **State Management** | Zustand 5 + TanStack Query 5 | Client-side |
| **Testing** | Vitest 4 + Playwright 1.49 + Pytest 8 | GitHub Actions |
| **CI/CD** | GitHub Actions (matrix: Node 20/22, Python 3.11/3.12) | Automated on push |
| **Infra** | AWS SAM + CloudFormation + OIDC auth | ~$0.50/month |
| **Security** | CloudFront Functions (IP whitelist) + CORS + HTTPS only | Edge locations |

## 🌍 Environments

| Environment | URL | Branch | Deploys on | CloudFront | Lambda |
|-------------|-----|--------|------------|------------|--------|
| **Production** | Custom domain (secret `DOMAIN`) | `main` | Push to main (after CI ✅) | E39MKQBJY7TQL3 | petrosim |
| **Development** | Custom domain (secret `DEV_DOMAIN`) | Any non-main | Push to branch | EC4H1MGV4R0MT | petrosim-dev |

**Deployment pipeline**:
1. Push to `main` → CI runs (typecheck, lint, tests on Node 20/22 + Python 3.11/3.12)
2. CI passes → CD deploys backend (SAM) + frontend (S3 + CloudFront invalidation)
3. Smoke tests verify deployment (backend `/health` + frontend HTTP 200/403)
4. CloudFront propagates globally (~1 minute)

**IP Whitelist**: Production is IP-restricted via CloudFront Functions. Update via manual workflow: Actions → "Update IP Whitelist".

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

## 📚 Documentation

- [Architecture](docs/architecture.md) — System design, ADRs, data flow
- [Data Sources & Methodology](docs/data-sources.md) — EIA, IEA, OPEC, UN Comtrade verification
- [AWS Deployment](docs/aws-deployment.md) — SAM templates, CloudFormation, OIDC setup
- [Data Update Plan](docs/data-update-plan.md) — How to refresh 2024+ data
- [Domain Model](docs/domain-model.md) — Entities, value objects, aggregates
- [Simulation Spec](docs/simulation-spec.md) — Algorithm, rules A-I, causal journal
- [API Contract](docs/api-contract.md) — OpenAPI spec, endpoints, schemas
- [Data Lineage](docs/data-lineage.md) — Raw → Normalized → Curated → Seed
- [Runbook](docs/runbook.md) — Operations, troubleshooting, monitoring

## 🔧 Tech Stack Details

### Frontend Dependencies
```json
"dependencies": {
  "@tanstack/react-query": "^5.95.2",  // Server state management
  "maplibre-gl": "^5.21.0",            // Interactive globe
  "react": "^19.0.0",                   // UI framework
  "react-dom": "^19.0.0",
  "zustand": "^5.0.2"                   // Global state
}
```

### Backend Dependencies
```python
fastapi==0.135.2          # Web framework
uvicorn==0.42.0           # ASGI server
sqlalchemy==2.0.48        # ORM + async support
alembic==1.14.1           # DB migrations
polars==1.39.3            # Data processing
pydantic==2.10.4          # Validation
```

## 🚀 CI/CD Workflows

### CI (`ci.yml`)
- **Triggers**: Push, PR, workflow_call
- **Matrix**: Node 20/22 × Python 3.11/3.12
- **Frontend**: TypeScript typecheck, Vitest unit tests
- **Backend**: Ruff linting, Pytest unit tests
- **Caching**: pnpm store, pip cache, Playwright browsers
- **Duration**: ~20-30 seconds

### CD Production (`cd.yml`)
- **Triggers**: Push to `main` (after CI passes)
- **Backend**: SAM build + deploy to Lambda (eu-west-3)
- **Frontend**: Vite build + S3 sync + CloudFront invalidation
- **Smoke tests**: Backend `/health` + Frontend HTTP 200/403
- **Duration**: ~3-4 minutes

### CD Dev (`cd-dev.yml`)
- **Triggers**: Push to any non-main branch
- **Same as production** but deploys to dev environment
- **Smoke tests**: Continue on error (IP whitelist may block)

### Update IP Whitelist (`update-ip-whitelist.yml`)
- **Triggers**: Manual workflow_dispatch only
- **Inputs**: environment (dev/prod), reason (audit trail)
- **Action**: Generates CloudFront Function with CIDR matching, deploys to edge locations
- **Duration**: ~1 minute

## 🔐 Security

- **HTTPS only** — CloudFront enforces TLS 1.2+
- **IP whitelist** — CloudFront Functions block unauthorized IPs (CIDR support)
- **CORS** — Strict origin validation
- **OIDC** — GitHub Actions authenticate to AWS without long-lived credentials
- **Secrets** — All sensitive data in GitHub Secrets (15 total)
- **No API keys** — RSS feeds are public, no external API dependencies

## 📦 Monorepo Structure

```
petrole3/
├── .github/
│   ├── workflows/          # CI/CD pipelines (pedagogical comments)
│   └── dependabot.yml      # Monthly dependency updates
├── apps/
│   ├── api/                # FastAPI backend
│   │   ├── app/
│   │   │   ├── api/        # Route handlers
│   │   │   ├── db/         # SQLAlchemy models
│   │   │   ├── domain/     # Pydantic schemas
│   │   │   ├── engine/     # Simulation core
│   │   │   └── services/   # Business logic
│   │   ├── alembic/        # DB migrations
│   │   ├── scripts/        # Seed, backup, etc.
│   │   └── tests/          # Pytest suite
│   └── web/                # React frontend
│       ├── src/
│       │   ├── api/        # API client
│       │   ├── components/ # Reusable UI
│       │   ├── features/   # Feature modules
│       │   ├── hooks/      # Custom React hooks
│       │   └── stores/     # Zustand stores
│       ├── e2e/            # Playwright tests
│       └── public/         # Static assets
├── data/
│   ├── raw/                # Original sources
│   ├── normalized/         # Cleaned data
│   ├── curated/            # Enriched data
│   └── seed/               # DB seed files
├── docs/                   # Comprehensive documentation
├── infra/
│   ├── template.yaml       # SAM template (prod)
│   └── template-dev.yaml   # SAM template (dev)
└── start.ps1               # One-command local setup
```

## 🤝 Contributing

This is a pedagogical project. Contributions are welcome for:
- Data updates (2024+ statistics)
- New scenarios (geopolitical events)
- Bug fixes and performance improvements
- Documentation enhancements

Please open an issue first to discuss major changes.

## 📝 Development Notes

- **Dependabot**: Monthly updates for npm, pip, GitHub Actions
- **TailwindCSS**: Locked to v3.x (v4 has breaking changes)
- **TypeScript**: Using 6.0 with `ignoreDeprecations` for `baseUrl`
- **Node.js**: CI tests on both Node 20 LTS and Node 22
- **Python**: CI tests on both Python 3.11 and 3.12

## 📊 Project Stats

- **Lines of code**: ~15,000 (TypeScript + Python)
- **Test coverage**: Backend 85%+, Frontend 60%+
- **Data points**: 1,638 verified indicators across 64 countries
- **Scenarios**: 14 preset + unlimited custom
- **API endpoints**: 25+ (scenarios, simulations, reference data, geo, news)
- **Deployment time**: ~3 minutes (CI + CD)
- **Cold start**: <500ms (Lambda with provisioned concurrency)

## 🎓 Educational Use

PetroSim is designed for:
- **University courses** on energy geopolitics, supply chain resilience
- **Policy analysis** for strategic petroleum reserves, embargo impact
- **Journalism** to illustrate oil crisis scenarios with data
- **Self-learning** about global oil logistics and chokepoint vulnerabilities

All data sources are cited, all assumptions are documented, all calculations are reproducible.

## 📄 License

Proprietary — All rights reserved.

---

**Built with ❤️ for energy geopolitics education**
