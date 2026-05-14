from pydantic_settings import BaseSettings
from functools import lru_cache
import os


def _resolve_database_url() -> str:
    """
    Resolves the database URL from environment variables.
    Railway MySQL plugin exposes MYSQL_URL with scheme 'mysql://',
    which needs to be converted to 'mysql+pymysql://' for SQLAlchemy.
    """
    url = os.environ.get("DATABASE_URL") or os.environ.get("MYSQL_URL") or os.environ.get("MYSQL_PRIVATE_URL")
    if url:
        if url.startswith("mysql://"):
            url = url.replace("mysql://", "mysql+pymysql://", 1)
        return url
    return "mysql+pymysql://root:root@localhost:3306/agrostack"


class Settings(BaseSettings):
    DATABASE_URL: str = _resolve_database_url()
    JWT_SECRET: str = "agrostack-super-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
