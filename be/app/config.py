from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Bank Statement Analyser"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    ALGORITHM: str = os.getenv("ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")
    REFRESH_TOKEN_EXPIRE_DAYS: int = os.getenv("REFRESH_TOKEN_EXPIRE_DAYS")
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    
    # Redis & Celery
    REDIS_URL: str = os.getenv("REDIS_URL")
    
    # File Storage
    FILE_STORAGE_PATH: str = "./storage/statements"
    MAX_UPLOAD_SIZE_MB: int = 20
    
    # LLM
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL")

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

settings = Settings()
