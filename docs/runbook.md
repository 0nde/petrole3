# Runbook

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- Python 3.12+ (tested on 3.11 and 3.12)
- Node.js 20+ or 22+ with pnpm 9+
- Git
- AWS CLI + SAM CLI (for deployment)
- GitHub CLI (optional, for PR management)

## Local Development Setup

### Quick Start (Windows)

```powershell
.\start.ps1          # Starts Docker DB + API + Frontend
.\start.ps1 -Seed    # Force re-seed the database
.\start.ps1 -Stop    # Stop all services
```

### Manual Setup

#### 1. Start Infrastructure

```bash
docker compose up -d
```

This starts PostgreSQL 16 on port 5432.

#### 2. Backend Setup

```bash
cd apps/api
python -m venv .venv

# Windows
.venv\Scripts\activate
# Linux/Mac
source .venv/bin/activate

pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Seed reference data (1,638 verified indicators)
python -m scripts.seed

# Start dev server
uvicorn app.main:app --reload --port 8000
```

**API available at:**
- http://localhost:8000
- http://localhost:8000/docs (Swagger UI)
- http://localhost:8000/redoc (ReDoc)
- http://localhost:8000/health (Health check)

#### 3. Frontend Setup

```bash
cd apps/web
pnpm install
pnpm dev
```

**App available at:**
- http://localhost:5173
- Vite HMR enabled (hot module replacement)
- API proxy configured to http://localhost:8000

## Running Tests

### Backend

```bash
cd apps/api

# All tests
pytest

# With coverage
pytest --cov=app --cov-report=html

# Property-based tests only
pytest tests/properties/

# Golden tests only
pytest tests/golden/

# Specific test
pytest tests/unit/test_engine.py -v
```

### Frontend

```bash
cd apps/web

# Unit tests (Vitest)
pnpm test

# With coverage
pnpm test:coverage

# E2E tests (Playwright - requires running backend)
pnpm test:e2e

# E2E in UI mode
pnpm exec playwright test --ui

# Generate Playwright report
pnpm exec playwright show-report
```

**Note**: Playwright artifacts are in `.gitignore` (test-results/, playwright-report/)

## Database Operations

### Reset database
```bash
cd apps/api
alembic downgrade base
alembic upgrade head
python -m scripts.seed
```

### Create new migration
```bash
cd apps/api
alembic revision --autogenerate -m "description"
```

## Troubleshooting

### PostgreSQL won't start
- Check if port 5432 is already in use: `netstat -an | findstr 5432` (Windows) or `lsof -i :5432` (Linux/Mac)
- Check Docker logs: `docker compose logs db`
- Try: `docker compose down -v && docker compose up -d`

### Migrations fail
- Ensure PostgreSQL is running and accessible
- Check `apps/api/.env` for correct DATABASE_URL
- Try resetting: `alembic downgrade base && alembic upgrade head`
- Check Alembic version: should be 1.14.1+

### Frontend can't reach API
- Ensure backend is running on port 8000
- Check CORS configuration in `apps/api/app/config.py`
- Check proxy configuration in `apps/web/vite.config.ts`
- Clear browser cache and restart Vite dev server

### TypeScript errors after update
- Current version: TypeScript 6.0.2
- Uses `ignoreDeprecations: "6.0"` for `baseUrl` in `tsconfig.json`
- Run: `pnpm install` to ensure dependencies are up to date

### TailwindCSS build errors
- Current version: TailwindCSS 3.4.19 (locked)
- TailwindCSS 4.x has breaking changes (blocked in Dependabot)
- If you see v4 errors, downgrade: `pnpm add -D tailwindcss@3.4.19`

### MapLibre choropleth not showing
- Fixed in MapLibre GL 5.21.0+ (layout bug)
- Ensure you're on the latest version: `pnpm add maplibre-gl@^5.21.0`
- Check browser console for errors

### Ocean colors not blue
- Feature added in commit f67785d (March 24, 2026)
- Ensure you're on latest `main`: `git pull origin main`
- Check `apps/web/src/features/map/MapView.tsx` lines 170-183

### CI/CD failures
- Check GitHub Actions logs: `gh run list --limit 5`
- Common issues:
  - TypeScript deprecation warnings (fixed with `ignoreDeprecations`)
  - Playwright artifacts in git (added to `.gitignore`)
  - OIDC authentication (check AWS_ROLE_ARN secret)
  - CloudFront smoke test 403 (expected with IP whitelist)

### Dependabot PRs
- Schedule: Monthly (changed from weekly)
- TailwindCSS major updates: Blocked
- Safe to merge: Minor/patch updates
- Check CI before merging: `gh pr checks <PR_NUMBER>`

## Environment Variables

### Backend (`apps/api/.env`)
```bash
# Database (local Docker)
DATABASE_URL=postgresql+asyncpg://petrosim:petrosim@localhost:5432/petrosim
SYNC_DATABASE_URL=postgresql://petrosim:petrosim@localhost:5432/petrosim

# Or use Neon.tech dev database
# DATABASE_URL=postgresql+asyncpg://neondb_owner:<password>@ep-tiny-thunder-alx82aci-pooler.eu-central-1.aws.neon.tech/neondb
# SYNC_DATABASE_URL=postgresql://neondb_owner:<password>@ep-tiny-thunder-alx82aci-pooler.eu-central-1.aws.neon.tech/neondb

ENVIRONMENT=development
LOG_LEVEL=DEBUG

# CORS (allow frontend dev server)
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]

# Simulation parameters
PRICE_ELASTICITY_FACTOR=3.0
DEFAULT_DOMESTIC_PRIORITY_RATIO=0.3
RESERVE_PLANNING_HORIZON_DAYS=90
```

### Frontend (`apps/web/.env`)
```bash
# API URL (proxied by Vite)
VITE_API_URL=http://localhost:8000/api/v1
```

### Production (GitHub Secrets)
See `docs/aws-deployment.md` for the 15 GitHub Secrets required.
