import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configuration class
class Config:
    # OpenAI API Key
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    
    # Default settings
    DEFAULT_MODEL = "gpt-4.1-mini"
    MAX_COMPLETION_TOKENS = 2000
    # TEMPERATURE = 0.7