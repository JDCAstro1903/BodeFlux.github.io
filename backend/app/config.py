from pydantic_settings import BaseSettings
from functools import lru_cache
from pydantic import model_validator
from urllib.parse import quote_plus


class Settings(BaseSettings):
    # Full URL (Railway plugin or manual)
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
        # Priority: MYSQL_PRIVATE_URL > MYSQL_URL > DATABASE_URL > build from components
        url = (
            self.MYSQL_PRIVATE_URL
            or self.MYSQL_URL
            or self.DATABASE_URL
            or ""
        )

        # If still empty or pointing to localhost, try building from individual vars
        if not url or "localhost" in url:
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
            # Fallback to local dev default so the error is clear
            url = "mysql+pymysql://root:root@localhost:3306/agrostack"

        self.DATABASE_URL = url
        return self

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
