from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    """
    Configuración centralizada de la aplicación.
    Todas las variables de entorno se definen aquí.
    """
    
    # Database
    DB_HOST: str
    DB_NAME: str
    DB_USER: str
    DB_PASSWORD: str
    DB_PORT: str = "5432"
    
    # API Keys
    GEMINI_API_KEY: str
    
    # Azure Storage (opcional)
    AZURE_STORAGE_CONNECTION_STRING: str | None = None
    
    # Application Settings
    PORT: int = 8001
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    DEBUG: bool = False
    
    # CORS
    CORS_ORIGINS: str = "*"
    
    # Scheduled Jobs
    ENABLE_SCHEDULED_JOBS: bool = True
    
    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_STORAGE: str = "memory"  # "redis" en producción
    
    # Redis (opcional para caché)
    REDIS_URL: str | None = None
    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    @property
    def database_url(self) -> str:
        """URL de conexión a PostgreSQL. SSL solo para Azure."""
        from urllib.parse import quote_plus
        # Detectar si es Azure o base de datos local
        is_azure = "azure" in self.DB_HOST.lower() or "postgres.database" in self.DB_HOST.lower()
        sslmode = "require" if is_azure else "prefer"
        return f"postgresql://{quote_plus(self.DB_USER)}:{quote_plus(self.DB_PASSWORD)}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?sslmode={sslmode}"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Lista de orígenes CORS permitidos."""
        if self.CORS_ORIGINS == "*":
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    @property
    def is_production(self) -> bool:
        """True si estamos en ambiente de producción."""
        return self.ENVIRONMENT == "production"
    
    @property
    def is_development(self) -> bool:
        """True si estamos en desarrollo."""
        return self.ENVIRONMENT == "development"


@lru_cache
def get_settings() -> Settings:
    """Singleton de settings con caché."""
    return Settings()

