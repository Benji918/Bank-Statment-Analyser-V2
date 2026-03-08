from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Bank Statement Analyser"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/bankanalyser"
    
    # Redis & Celery
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # File Storage
    FILE_STORAGE_PATH: str = "./storage/statements"
    MAX_UPLOAD_SIZE_MB: int = 20
    
    # LLM
    OLLAMA_MODEL: str = "llama3"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

settings = Settings()
