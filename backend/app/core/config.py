from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    APP_NAME: str = "RL-Fold"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True

    DATABASE_URL: str
    REDIS_URL: str = "redis://localhost:6379"

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    STORAGE_PATH: str = "./storage"

    WANDB_API_KEY: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
