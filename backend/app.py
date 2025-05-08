from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import uvicorn
import logging
import os

from openai_client import LLMClient
from config import Config

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

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    model: str

class ChatResponse(BaseModel):
    message: Message
    error: Optional[str] = None

@app.get("/")
async def root():
    return {"status": "ok", "message": "API is working!"}

@app.get("/health")
async def health_check():
    """Health check endpoint for AWS Elastic Beanstalk"""
    return {"status": "healthy"}

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
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

        # Generate response
        response = await llm_client.generate_response(messages, model_name)
        
        if "error" in response:
            logger.error(f"Error generating response: {response['error']}")
            return ChatResponse(
                message=Message(role="assistant", content=""),
                error=response["error"]
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

# For local development
if __name__ == "__main__":
    
    uvicorn.run(app, host="0.0.0.0", port=8000)