from fastapi import FastAPI, HTTPException, Depends, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import uvicorn
import logging
import os
import json

from openai_client import LLMClient
from config import Config
import crud
from database import get_db_session, engine
import models
from models import Base

# Set up logging
logging.basicConfig(level=logging.INFO if Config.DEBUG else logging.WARNING)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="LLM Chat API",
    description="API for LLM chat interface",
    version="1.0.0"
)

# Add CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the LLM client
llm_client = LLMClient()

# Create database tables if they don't exist (will be replaced with Alembic migrations in production)
if Config.ENV.lower() == "development":
    Base.metadata.create_all(bind=engine)

# Pydantic models for request/response validation
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    model: str
    conversation_id: Optional[str] = None
    user_id: Optional[str] = None

class ChatResponse(BaseModel):
    message: Message
    error: Optional[str] = None

class UserCreate(BaseModel):
    email: str
    username: str
    auth0_id: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    auth0_id: Optional[str] = None
    token_balance: int
    token_usage_this_month: int
    subscription_tier: str
    created_at: datetime
    class Config:
        orm_mode = True

class ConversationCreate(BaseModel):
    user_id: str
    title: Optional[str] = "New Conversation"

class ConversationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    created_at: datetime
    updated_at: datetime
    class Config:
        orm_mode = True

class ConversationUpdate(BaseModel):
    title: str

class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    created_at: datetime
    total_tokens: int
    model: Optional[str] = None
    class Config:
        orm_mode = True

class SystemPromptCreate(BaseModel):
    name: str
    content: str
    description: Optional[str] = None

class SystemPromptResponse(BaseModel):
    id: str
    name: str
    content: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    class Config:
        orm_mode = True

class TokenUsageResponse(BaseModel):
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int

# Auth middleware helper
async def get_current_user(request: Request, db: Session = Depends(get_db_session)) -> models.User:
    """
    This is a placeholder for Auth0 integration.
    In a real implementation, you would validate the token from Auth0 and get the user.
    For now, we'll use a user_id header for testing.
    """
    user_id = request.headers.get("X-User-ID")
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

# Root endpoints
@app.get("/")
async def root():
    return {"status": "ok", "message": "API is working!"}

@app.get("/health")
async def health_check():
    """Health check endpoint for AWS Elastic Beanstalk"""
    return {"status": "healthy"}

# User endpoints
@app.post("/api/users", response_model=UserResponse)
async def create_user(user: UserCreate, db: Session = Depends(get_db_session)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, email=user.email, username=user.username, auth0_id=user.auth0_id)

@app.get("/api/users/me", response_model=UserResponse)
async def get_current_user_info(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.get("/api/users/{user_id}", response_model=UserResponse)
async def get_user_info(user_id: str, db: Session = Depends(get_db_session)):
    db_user = crud.get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.get("/api/users/usage/total", response_model=TokenUsageResponse)
async def get_usage(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db_session)):
    usage = crud.get_user_token_usage(db, user_id=current_user.id)
    return usage

@app.get("/api/users/usage/daily")
async def get_daily_usage(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db_session)):
    usage = crud.get_token_usage_by_day(db, user_id=current_user.id)
    return usage

# Conversation endpoints
@app.post("/api/conversations", response_model=ConversationResponse)
async def create_conversation(
    conversation: ConversationCreate, 
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db_session)
):
    # Ensure the user can only create conversations for themselves
    if conversation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot create conversation for another user")
    
    return crud.create_conversation(db=db, user_id=conversation.user_id, title=conversation.title)

@app.get("/api/conversations", response_model=List[ConversationResponse])
async def get_conversations(
    skip: int = 0, 
    limit: int = 100, 
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db_session)
):
    conversations = crud.get_user_conversations(db, user_id=current_user.id, skip=skip, limit=limit)
    return conversations

@app.get("/api/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: str, 
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db_session)
):
    conversation = crud.get_conversation(db, conversation_id=conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Ensure the user can only access their own conversations
    if conversation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot access another user's conversation")
    
    return conversation

@app.put("/api/conversations/{conversation_id}", response_model=ConversationResponse)
async def update_conversation_title(
    conversation_id: str, 
    conversation_update: ConversationUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db_session)
):
    conversation = crud.get_conversation(db, conversation_id=conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Ensure the user can only update their own conversations
    if conversation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot update another user's conversation")
    
    return crud.update_conversation(db, conversation_id=conversation_id, title=conversation_update.title)

@app.delete("/api/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str, 
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db_session)
):
    conversation = crud.get_conversation(db, conversation_id=conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Ensure the user can only delete their own conversations
    if conversation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot delete another user's conversation")
    
    success = crud.delete_conversation(db, conversation_id=conversation_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete conversation")
    
    return {"status": "success", "message": "Conversation deleted"}

# Message endpoints
@app.get("/api/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
async def get_conversation_messages(
    conversation_id: str, 
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db_session)
):
    conversation = crud.get_conversation(db, conversation_id=conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Ensure the user can only access their own messages
    if conversation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot access another user's messages")
    
    messages = crud.get_conversation_messages(db, conversation_id=conversation_id)
    return messages

# System prompt endpoints
@app.post("/api/system-prompts", response_model=SystemPromptResponse)
async def create_system_prompt(
    prompt: SystemPromptCreate, 
    db: Session = Depends(get_db_session)
):
    # In production, you would add admin-only authentication here
    db_prompt = crud.get_system_prompt_by_name(db, name=prompt.name)
    if db_prompt:
        raise HTTPException(status_code=400, detail="Prompt name already exists")
    
    return crud.create_system_prompt(db=db, name=prompt.name, content=prompt.content, description=prompt.description)

@app.get("/api/system-prompts", response_model=List[SystemPromptResponse])
async def get_system_prompts(db: Session = Depends(get_db_session)):
    prompts = crud.get_all_system_prompts(db)
    return prompts

@app.get("/api/system-prompts/{prompt_id}", response_model=SystemPromptResponse)
async def get_system_prompt(prompt_id: str, db: Session = Depends(get_db_session)):
    prompt = crud.get_system_prompt(db, prompt_id=prompt_id)
    if not prompt:
        raise HTTPException(status_code=404, detail="System prompt not found")
    return prompt

# Legacy prompt endpoints (Keep for backward compatibility)
@app.get("/prompts/{prompt_name}")
async def get_prompt(prompt_name: str):
    """Get prompt content by name"""
    try:
        # Define allowed prompts for security
        allowed_prompts = ["identityprompt", "queryprompt", "questionprompt"]
        
        if prompt_name not in allowed_prompts:
            return {"error": "Prompt not found"}
        
        # Get the directory of the current script
        current_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Create absolute path to the prompt file
        file_path = os.path.join(current_dir, "prompts", f"{prompt_name}.txt")
        
        with open(file_path, "r", encoding="utf-8") as file:
            content = file.read()
            
        return {"content": content}
    except Exception as e:
        logger.exception(f"Error reading prompt: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# Chat endpoint with database integration
@app.post("/api/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    db: Session = Depends(get_db_session)
):
    try:
        if not request.user_id:
            # Create a temporary user ID
            request.user_id = "anonymous_user"  # or str(uuid.uuid4())
            logger.info(f"No user_id provided, using temporary: {request.user_id}")
            
        if not request.conversation_id:
            # Create a new conversation
            conversation = crud.create_conversation(db, user_id=request.user_id)
            request.conversation_id = conversation.id
            logger.info(f"Created new conversation: {request.conversation_id}")
        
        # Convert Pydantic models to dictionaries
        messages = [msg.dict() for msg in request.messages]
        
        # Log the incoming request in debug mode
        logger.debug(f"Received chat request with model: {request.model}")
        
        # Model version router
        if request.model == "chat":
            model_name ='gpt-4.1-mini-2025-04-14'
        elif request.model == "reason":
            model_name = 'o4-mini-2025-04-16'
        elif request.model == "search":
            model_name = 'gpt-4o-mini-search-preview-2025-03-11'
        else:
            model_name ='gpt-4.1-mini-2025-04-14'            

        # Store user message if conversation_id is provided
        if request.conversation_id and request.user_id:
            # Check if conversation exists and belongs to the user
            conversation = crud.get_conversation(db, conversation_id=request.conversation_id)
            if not conversation:
                # Create a new conversation if it doesn't exist
                conversation = crud.create_conversation(db, user_id=request.user_id)
                
            # Store user message (find last user message)
            user_message = None
            for msg in reversed(messages):
                if msg["role"] == "user":
                    user_message = msg
                    break
                    
            if user_message:
                crud.create_message(
                    db=db,
                    conversation_id=conversation.id,
                    role=user_message["role"],
                    content=user_message["content"]
                )

        # Generate response
        response = await llm_client.generate_response(messages, model_name)
        
        if "error" in response:
            logger.error(f"Error generating response: {response['error']}")
            return ChatResponse(
                message=Message(role="assistant", content=""),
                error=response["error"]
            )
        
        # Store assistant message if conversation_id is provided
        if request.conversation_id and request.user_id:
            # Try to get token usage from the OpenAI response
            prompt_tokens = 0
            completion_tokens = 0
            
            # The response might have usage info
            if "usage" in response:
                usage = response["usage"]
                prompt_tokens = usage.get("prompt_tokens", 0)
                completion_tokens = usage.get("completion_tokens", 0)
            else:
                # Estimate token usage if not provided by API
                # This is a rough estimate: ~4 chars per token
                prompt_chars = sum(len(msg["content"]) for msg in messages)
                completion_chars = len(response["message"]["content"])
                
                prompt_tokens = prompt_chars // 4
                completion_tokens = completion_chars // 4
            
            # Store assistant message
            crud.create_message(
                db=db,
                conversation_id=request.conversation_id,
                role=response["message"]["role"],
                content=response["message"]["content"],
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
                model=model_name
            )
        
        return ChatResponse(
            message=Message(
                role=response["message"]["role"],
                content=response["message"]["content"]
            )
        )
    except Exception as e:
        logger.exception("Exception in chat endpoint")
        raise HTTPException(status_code=500, detail=str(e))

# For local development
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)