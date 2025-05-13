import os
from dotenv import load_dotenv

# Load environment variables from .env file
# This will not override existing environment variables
load_dotenv()

# Configuration class
class Config:
    # OpenAI API Key
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    
    # CORS Settings - Allow specific origins in production
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
    
    # Default settings
    DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "gpt-4.1-mini-2025-04-14")
    MAX_COMPLETION_TOKENS = int(os.getenv("MAX_COMPLETION_TOKENS", "2000"))
    
    # Environment
    ENV = os.getenv("ENV", "development")
    DEBUG = os.getenv("DEBUG", "False").lower() in ["true", "1", "t"]
    
    # Database settings
    DB_USERNAME = os.getenv("DB_USERNAME", "postgres")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "5432")
    DB_NAME = os.getenv("DB_NAME", "chatapp")
    
    # Build the database URL
    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        f"postgresql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )
    
    # Database connection pool settings
    DB_POOL_SIZE = int(os.getenv("DB_POOL_SIZE", "5"))
    DB_MAX_OVERFLOW = int(os.getenv("DB_MAX_OVERFLOW", "10"))
    DB_POOL_RECYCLE = int(os.getenv("DB_POOL_RECYCLE", "1800"))  # 30 minutes
    
    # Token billing settings
    FREE_TIER_TOKENS = int(os.getenv("FREE_TIER_TOKENS", "10000"))
    BASIC_TIER_TOKENS = int(os.getenv("BASIC_TIER_TOKENS", "100000"))
    PREMIUM_TIER_TOKENS = int(os.getenv("PREMIUM_TIER_TOKENS", "1000000"))
    
    @classmethod
    def is_production(cls):
        return cls.ENV.lower() == "production"