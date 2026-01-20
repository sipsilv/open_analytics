from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, List, Union

import os

class Settings(BaseSettings):
    # Base directory calculation (backend/app/core/config.py -> backend/)
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    # Project root (backend/ -> root/)
    PROJECT_ROOT: str = os.path.dirname(BASE_DIR)

    # Data directory - reads from DATA_DIR environment variable, falls back to default relative path
    # Normalize and strip to handle both mixed path separators and trailing whitespace
    # This is critical on Windows where batch scripts can introduce trailing spaces
    DATA_DIR: str = os.path.normpath(os.getenv("DATA_DIR", os.path.join(PROJECT_ROOT, "data")).strip())
    
    # Testing flag
    TESTING: bool = os.getenv("TESTING", "false").lower() == "true"
    
    # Database (legacy - now using connection manager)
    DATABASE_URL: str = f"sqlite:///{os.path.join(DATA_DIR, 'auth/sqlite/auth.db')}"
    DUCKDB_PATH: str = os.path.join(DATA_DIR, "analytics/duckdb")
    
    # JWT
    JWT_SECRET_KEY: str
    JWT_SYSTEM_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 hours
    IDLE_TIMEOUT_MINUTES: int = 30
    
    # Encryption (Fernet key for encrypting connection credentials)
    # Generate a new key with: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
    # IMPORTANT: Change this in production! Store in .env file as ENCRYPTION_KEY
    # Note: Fernet keys must be valid base64url-encoded strings (44 characters, no leading/trailing dashes)
    ENCRYPTION_KEY: str
    
    # CORS - can be comma-separated string or list
    CORS_ORIGINS: str = "http://localhost:3000,https://openanalytics.co.in,https://www.openanalytics.co.in"
    
    # Rate Limiting
    # Format: "number/time_unit" where time_unit can be: second, minute, hour, day
    RATE_LIMIT_LOGIN: str = "200/minute"
    RATE_LIMIT_PASSWORD_RESET: str = "50/minute"
    RATE_LIMIT_ADMIN_CREATE_USER: str = "200/minute"
    RATE_LIMIT_ADMIN_DELETE_USER: str = "200/minute"
    RATE_LIMIT_ADMIN_CREATE_REQUEST: str = "200/minute"
    RATE_LIMIT_ADMIN_CREATE_AI_CONFIG: str = "200/minute"
    
    # TrueData Connection Defaults
    TRUEDATA_DEFAULT_AUTH_URL: str = "https://auth.truedata.in/token"
    TRUEDATA_DEFAULT_WEBSOCKET_PORT: str = "8086"
    
    @property
    def cors_origins_list(self) -> List[str]:
        if not self.CORS_ORIGINS:
            return ["http://localhost:3000"]
        """Convert CORS_ORIGINS to list format"""
        if isinstance(self.CORS_ORIGINS, list):
            origins =  self.CORS_ORIGINS
        else:
            origins = [
                    origin.strip()
                    for origin in self.CORS_ORIGINS.split(",")
                    if origin.strip()
                    ]
        if "*" in origins:
            raise ValueError(
                "CORS_ORIGINS cannot contain '*' when allow_credentials=True. "
                "Use explicit origins like http://localhost:3000"
            )
            # Split by comma and strip whitespace
        # Always ensure production domains are included, regardless of env var
        required_origins = ["https://openanalytics.co.in", "https://www.openanalytics.co.in", "https://api.openanalytics.co.in"]
        for origin in required_origins:
            if origin not in origins:
                origins.append(origin)
                
        return origins
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
