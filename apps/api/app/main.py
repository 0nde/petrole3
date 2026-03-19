"""PetroSim API — FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes_ref import router as ref_router
from app.api.routes_scenarios import router as scenarios_router
from app.api.routes_simulations import router as simulations_router
from app.api.routes_news import router as news_router
from app.config import settings

app = FastAPI(
    title="PetroSim API",
    description="Geoenergy simulation workbench for global oil flow disruption analysis",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_prefix = "/api/v1"

app.include_router(ref_router, prefix=api_prefix)
app.include_router(scenarios_router, prefix=api_prefix)
app.include_router(simulations_router, prefix=api_prefix)
app.include_router(news_router, prefix=api_prefix)


@app.get("/health")
async def health():
    return {"status": "ok", "environment": settings.ENVIRONMENT}
