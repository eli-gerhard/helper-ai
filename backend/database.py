from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session
import os
from contextlib import contextmanager
from typing import Generator

from config import Config

## LOCAL #######################################################################################
# Add these lines near the top of the file, after the imports
from dotenv import load_dotenv
load_dotenv('.env.local')  # Load from .env.local file
################################################################################################

# Build the database URL from environment variables
DATABASE_URL = Config.DATABASE_URL

# Create the SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    pool_size=Config.DB_POOL_SIZE,
    max_overflow=Config.DB_MAX_OVERFLOW,
    pool_pre_ping=True,  # Test connection before using from pool
    pool_recycle=Config.DB_POOL_RECYCLE,  # Recycle connections every 1800 seconds (30 minutes)
)

# Create a scoped session factory
SessionLocal = scoped_session(
    sessionmaker(autocommit=False, autoflush=False, bind=engine)
)

Base = declarative_base()

@contextmanager
def get_db() -> Generator:
    """
    Context manager to handle the database session.
    Usage:
        with get_db() as db:
            db.query(User).all()
    """
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()

def get_db_session():
    """
    Dependency for FastAPI endpoints to get a database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()