from pydantic_settings import BaseSettings
from functools import lru_cache
from pydantic import model_validator
from urllib.parse import quote_plus
import sys

_VALID_MYSQL_SCHEMES = ("mysql://", "mysql+pymysql://", "mysql+mysqlconnector://")


def _is_valid_mysql_url(url: str) -> bool:
    return bool(url) and any(url.startswith(s) for s in _VALID_MYSQL_SCHEMES)


class Settings(BaseSettings):
    # Full URL candidates (Railway plugin or manual)
    DATABASE_URL: str = ""
    MYSQL_URL: str = ""
    MYSQL_PRIVATE_URL: str = ""

    # Individual Railway MySQL plugin variables
    MYSQLHOST: str = ""
    MYSQLPORT: str = "3306"
    MYSQLUSER: str = ""
    MYSQLPASSWORD: str = ""
    MYSQLDATABASE: str = ""
    MYSQL_DATABASE: str = ""  # alternate naming Railway sometimes uses

    JWT_SECRET: str = "agrostack-super-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    @model_validator(mode="after")
    def resolve_db_url(self) -> "Settings":
        # Priority: only use a URL candidate if it looks like a valid MySQL URL
        url = ""
        for candidate in (self.MYSQL_PRIVATE_URL, self.MYSQL_URL, self.DATABASE_URL):
            if _is_valid_mysql_url(candidate):
                url = candidate
                break

        # Fallback: build from individual Railway plugin variables
        if not url:
            host = self.MYSQLHOST
            port = self.MYSQLPORT or "3306"
            user = self.MYSQLUSER
            password = self.MYSQLPASSWORD
            database = self.MYSQLDATABASE or self.MYSQL_DATABASE
            if host and user and database:
                url = (
                    f"mysql+pymysql://{quote_plus(user)}:{quote_plus(password)}"
                    f"@{host}:{port}/{database}"
                )

        # Normalize scheme
        if url.startswith("mysql://"):
            url = url.replace("mysql://", "mysql+pymysql://", 1)

        if not url:
            url = "mysql+pymysql://root:root@localhost:3306/agrostack"

        # Log the resolved host for easier debugging in Railway logs
        try:
            from urllib.parse import urlparse
            parsed = urlparse(url)
            print(
                f"[config] DB host={parsed.hostname} port={parsed.port} db={parsed.path.lstrip('/')}",
                file=sys.stderr,
            )
        except Exception:
            pass

        self.DATABASE_URL = url
        return self

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
