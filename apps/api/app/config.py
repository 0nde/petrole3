from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://petrosim:petrosim@localhost:5432/petrosim"
    SYNC_DATABASE_URL: str = "postgresql://petrosim:petrosim@localhost:5432/petrosim"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]
    PRICE_ELASTICITY_FACTOR: float = 3.0
    DEFAULT_DOMESTIC_PRIORITY_RATIO: float = 0.3
    RESERVE_PLANNING_HORIZON_DAYS: int = 90

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
