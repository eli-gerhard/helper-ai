from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import uvicorn

from openai_client import LLMClient

app = FastAPI()

# Add CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development - restrict this in production
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
    return {"message": "API is working!"}

@app.get("/test")
async def test():
    return {"message": "API is working!"}

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Convert Pydantic models to dictionaries
        messages = [msg.dict() for msg in request.messages]
        
        # Generate response
        response = await llm_client.generate_response(messages, request.model)
        
        if "error" in response:
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
        raise HTTPException(status_code=500, detail=str(e))

# For local development
if __name__ == "__main__":
    # uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
    uvicorn.run(app, host="0.0.0.0", port=8000)