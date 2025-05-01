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
    
    @classmethod
    def is_production(cls):
        return cls.ENV.lower() == "production"