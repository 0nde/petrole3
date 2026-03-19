# Runbook

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- Python 3.12+
- Node.js 20+ with pnpm 9+
- Git

## Local Development Setup

### 1. Start Infrastructure

```bash
docker compose up -d
```

This starts PostgreSQL 16 with PostGIS on port 5432.

### 2. Backend Setup

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

# Seed reference data
python -m scripts.seed

# Start dev server
uvicorn app.main:app --reload --port 8000
```

API available at http://localhost:8000
API docs at http://localhost:8000/docs (Swagger UI)

### 3. Frontend Setup

```bash
cd apps/web
pnpm install
pnpm dev
```

App available at http://localhost:5173

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

# Unit tests
pnpm test

# With coverage
pnpm test:coverage

# E2E tests (requires running backend)
pnpm test:e2e
```

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
- Check if port 5432 is already in use: `netstat -an | findstr 5432`
- Check Docker logs: `docker compose logs db`

### Migrations fail
- Ensure PostgreSQL is running and accessible
- Check `apps/api/.env` for correct DATABASE_URL
- Try resetting: `alembic downgrade base && alembic upgrade head`

### Frontend can't reach API
- Ensure backend is running on port 8000
- Check CORS configuration in `apps/api/app/main.py`
- Check proxy configuration in `apps/web/vite.config.ts`

## Environment Variables

### Backend (`apps/api/.env`)
```
DATABASE_URL=postgresql+asyncpg://petrosim:petrosim@localhost:5432/petrosim
ENVIRONMENT=development
LOG_LEVEL=DEBUG
```

### Frontend (`apps/web/.env`)
```
VITE_API_URL=http://localhost:8000/api/v1
```
