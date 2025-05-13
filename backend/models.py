from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime, Text, Boolean, func, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    auth0_id = Column(String(128), unique=True, nullable=True)  # For Auth0 integration
    email = Column(String(255), unique=True, nullable=False)
    username = Column(String(50), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Token tracking for billing
    token_balance = Column(Integer, default=0)  # For subscription-based model
    token_usage_this_month = Column(Integer, default=0)  # Reset monthly
    last_token_reset = Column(DateTime, default=datetime.utcnow)
    
    # Subscription status
    subscription_tier = Column(String(20), default="free")  # free, basic, premium, etc.
    subscription_end_date = Column(DateTime, nullable=True)
    
    # Relationships
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index('idx_user_email', email),
        Index('idx_user_auth0_id', auth0_id),
    )

class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    title = Column(String(255), default="New Conversation")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index('idx_conversation_user_id', user_id),
        Index('idx_conversation_updated_at', updated_at),
    )

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String(36), ForeignKey("conversations.id"), nullable=False)
    role = Column(String(20), nullable=False)  # user, assistant, system, etc.
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Token usage tracking
    prompt_tokens = Column(Integer, default=0)
    completion_tokens = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)
    
    # Model used for this message
    model = Column(String(50), nullable=True)
    
    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    
    # Indexes
    __table_args__ = (
        Index('idx_message_conversation_id', conversation_id),
        Index('idx_message_created_at', created_at),
    )

class SystemPrompt(Base):
    __tablename__ = "system_prompts"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, nullable=False)
    content = Column(Text, nullable=False)
    description = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Indexes
    __table_args__ = (
        Index('idx_system_prompt_name', name),
    )

class TokenUsage(Base):
    __tablename__ = "token_usage"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    prompt_tokens = Column(Integer, default=0)
    completion_tokens = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)
    model = Column(String(50), nullable=True)
    
    # Indexes
    __table_args__ = (
        Index('idx_token_usage_user_id', user_id),
        Index('idx_token_usage_date', date),
    )