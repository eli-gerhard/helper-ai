from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import uuid
from typing import List, Optional, Dict, Any

from models import User, Conversation, Message, SystemPrompt, TokenUsage

# User CRUD operations
def create_user(db: Session, email: str, username: str, auth0_id: Optional[str] = None) -> User:
    """Create a new user"""
    user = User(
        id=str(uuid.uuid4()),
        auth0_id=auth0_id,
        email=email,
        username=username
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get_user(db: Session, user_id: str) -> Optional[User]:
    """Get a user by ID"""
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get a user by email"""
    return db.query(User).filter(User.email == email).first()

def get_user_by_auth0_id(db: Session, auth0_id: str) -> Optional[User]:
    """Get a user by Auth0 ID"""
    return db.query(User).filter(User.auth0_id == auth0_id).first()

def update_user(db: Session, user_id: str, user_data: Dict[str, Any]) -> Optional[User]:
    """Update user information"""
    user = get_user(db, user_id)
    if not user:
        return None
    
    for key, value in user_data.items():
        if hasattr(user, key):
            setattr(user, key, value)
    
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return user

def update_user_token_usage(db: Session, user_id: str, tokens_used: int) -> Optional[User]:
    """Update user token usage"""
    user = get_user(db, user_id)
    if not user:
        return None
    
    user.token_usage_this_month += tokens_used
    db.commit()
    db.refresh(user)
    return user

def reset_monthly_token_usage(db: Session, user_id: str) -> Optional[User]:
    """Reset the monthly token usage for a user"""
    user = get_user(db, user_id)
    if not user:
        return None
    
    user.token_usage_this_month = 0
    user.last_token_reset = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return user

# Conversation CRUD operations
def create_conversation(db: Session, user_id: str, title: str = "New Conversation") -> Conversation:
    """Create a new conversation for a user"""
    conversation = Conversation(
        id=str(uuid.uuid4()),
        user_id=user_id,
        title=title
    )
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation

def get_conversation(db: Session, conversation_id: str) -> Optional[Conversation]:
    """Get a conversation by ID"""
    return db.query(Conversation).filter(Conversation.id == conversation_id).first()

def get_user_conversations(db: Session, user_id: str, skip: int = 0, limit: int = 100) -> List[Conversation]:
    """Get all conversations for a user"""
    return db.query(Conversation)\
        .filter(Conversation.user_id == user_id, Conversation.is_active == True)\
        .order_by(Conversation.updated_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()

def update_conversation(db: Session, conversation_id: str, title: str) -> Optional[Conversation]:
    """Update conversation title"""
    conversation = get_conversation(db, conversation_id)
    if not conversation:
        return None
    
    conversation.title = title
    conversation.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(conversation)
    return conversation

def delete_conversation(db: Session, conversation_id: str) -> bool:
    """Soft delete a conversation"""
    conversation = get_conversation(db, conversation_id)
    if not conversation:
        return False
    
    conversation.is_active = False
    db.commit()
    return True

# Message CRUD operations
def create_message(
    db: Session, 
    conversation_id: str, 
    role: str, 
    content: str,
    prompt_tokens: int = 0,
    completion_tokens: int = 0,
    model: Optional[str] = None
) -> Message:
    """Create a new message in a conversation"""
    total_tokens = prompt_tokens + completion_tokens
    
    message = Message(
        id=str(uuid.uuid4()),
        conversation_id=conversation_id,
        role=role,
        content=content,
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
        total_tokens=total_tokens,
        model=model
    )
    db.add(message)
    
    # Update the conversation's updated_at timestamp
    conversation = get_conversation(db, conversation_id)
    if conversation:
        conversation.updated_at = datetime.utcnow()
    
    # If this is an assistant message (completion), update the user's token usage
    if role == "assistant" and conversation and total_tokens > 0:
        user = get_user(db, conversation.user_id)
        if user:
            update_user_token_usage(db, user.id, total_tokens)
            
            # Also record this usage in the token_usage table
            token_usage = TokenUsage(
                id=str(uuid.uuid4()),
                user_id=user.id,
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
                total_tokens=total_tokens,
                model=model
            )
            db.add(token_usage)
    
    db.commit()
    db.refresh(message)
    return message

def get_conversation_messages(db: Session, conversation_id: str) -> List[Message]:
    """Get all messages in a conversation"""
    return db.query(Message)\
        .filter(Message.conversation_id == conversation_id)\
        .order_by(Message.created_at)\
        .all()

# System Prompt CRUD operations
def create_system_prompt(db: Session, name: str, content: str, description: Optional[str] = None) -> SystemPrompt:
    """Create a new system prompt"""
    system_prompt = SystemPrompt(
        id=str(uuid.uuid4()),
        name=name,
        content=content,
        description=description
    )
    db.add(system_prompt)
    db.commit()
    db.refresh(system_prompt)
    return system_prompt

def get_system_prompt(db: Session, prompt_id: str) -> Optional[SystemPrompt]:
    """Get a system prompt by ID"""
    return db.query(SystemPrompt).filter(SystemPrompt.id == prompt_id).first()

def get_system_prompt_by_name(db: Session, name: str) -> Optional[SystemPrompt]:
    """Get a system prompt by name"""
    return db.query(SystemPrompt).filter(SystemPrompt.name == name).first()

def get_all_system_prompts(db: Session) -> List[SystemPrompt]:
    """Get all active system prompts"""
    return db.query(SystemPrompt).filter(SystemPrompt.is_active == True).all()

def update_system_prompt(db: Session, prompt_id: str, content: str, description: Optional[str] = None) -> Optional[SystemPrompt]:
    """Update a system prompt"""
    prompt = get_system_prompt(db, prompt_id)
    if not prompt:
        return None
    
    prompt.content = content
    if description:
        prompt.description = description
    prompt.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(prompt)
    return prompt

# Token Usage reporting
def get_user_token_usage(db: Session, user_id: str, days: int = 30) -> Dict[str, int]:
    """Get token usage for a user over the specified number of days"""
    start_date = datetime.utcnow() - timedelta(days=days)
    
    usage = db.query(TokenUsage)\
        .filter(TokenUsage.user_id == user_id, TokenUsage.date >= start_date)\
        .all()
    
    total_prompt_tokens = sum(u.prompt_tokens for u in usage)
    total_completion_tokens = sum(u.completion_tokens for u in usage)
    total_tokens = sum(u.total_tokens for u in usage)
    
    return {
        "prompt_tokens": total_prompt_tokens,
        "completion_tokens": total_completion_tokens,
        "total_tokens": total_tokens
    }

def get_token_usage_by_day(db: Session, user_id: str, days: int = 30) -> List[Dict[str, Any]]:
    """Get daily token usage for a user over the specified number of days"""
    from sqlalchemy import func, cast, Date
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    daily_usage = db.query(
        cast(TokenUsage.date, Date).label('day'),
        func.sum(TokenUsage.prompt_tokens).label('prompt_tokens'),
        func.sum(TokenUsage.completion_tokens).label('completion_tokens'),
        func.sum(TokenUsage.total_tokens).label('total_tokens')
    )\
        .filter(TokenUsage.user_id == user_id, TokenUsage.date >= start_date)\
        .group_by(cast(TokenUsage.date, Date))\
        .order_by(cast(TokenUsage.date, Date))\
        .all()
    
    return [
        {
            "day": day.strftime('%Y-%m-%d'),
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": total_tokens
        }
        for day, prompt_tokens, completion_tokens, total_tokens in daily_usage
    ]