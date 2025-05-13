#!/usr/bin/env python
"""
Database initialization script. 
This script initializes the database with system prompts and can create test data.
"""
import os
import sys
import argparse
from datetime import datetime, timedelta
import uuid

## LOCAL #######################################################################################
# Add these lines near the top of the file, after the imports
from dotenv import load_dotenv
load_dotenv('.env.local')  # Load from .env.local file
################################################################################################

# Add the parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database import get_db
import crud
from models import Base
from config import Config

def init_system_prompts(db):
    """Initialize system prompts from the prompts directory"""
    print("Initializing system prompts...")
    
    # Get the parent directory (backend)
    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    prompts_dir = os.path.join(backend_dir, "prompts")
    
    # List of prompt files to initialize
    prompt_files = [
        ("identityprompt.txt", "Identity Prompt", "Main system prompt for assistant identity"),
        ("queryprompt.txt", "Query Routing Prompt", "Prompt for routing user queries to the appropriate model"),
        ("questionprompt.txt", "Question Prompt", "Prompt for generating clarifying questions")
    ]
    
    for filename, name, description in prompt_files:
        file_path = os.path.join(prompts_dir, filename)
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as file:
                content = file.read()
                
                # Check if this prompt already exists
                existing_prompt = crud.get_system_prompt_by_name(db, name)
                if existing_prompt:
                    print(f"Updating existing prompt: {name}")
                    crud.update_system_prompt(db, existing_prompt.id, content, description)
                else:
                    print(f"Creating new prompt: {name}")
                    crud.create_system_prompt(db, name, content, description)
        else:
            print(f"Warning: Prompt file not found: {file_path}")
    
    print("System prompts initialized successfully.")

def create_test_data(db):
    """Create test data for development"""
    print("Creating test data...")
    
    # Create test user
    test_user = crud.get_user_by_email(db, "test@example.com")
    if not test_user:
        test_user = crud.create_user(
            db, 
            email="test@example.com", 
            username="testuser"
        )
        print(f"Created test user with ID: {test_user.id}")
    else:
        print(f"Using existing test user with ID: {test_user.id}")
    
    # Create a few test conversations
    convo_titles = ["General Questions", "Technical Support", "Feature Requests"]
    
    for title in convo_titles:
        conversation = crud.create_conversation(db, test_user.id, title)
        print(f"Created conversation: {title} with ID: {conversation.id}")
        
        # Add some messages to each conversation
        messages = [
            ("user", "Hello, how can you help me today?"),
            ("assistant", "I'm here to assist you with any questions or tasks you might have. How can I help you?"),
            ("user", f"Tell me more about {title}"),
            ("assistant", f"I'd be happy to tell you more about {title}. What specific aspects are you interested in?")
        ]
        
        for role, content in messages:
            message = crud.create_message(
                db=db,
                conversation_id=conversation.id,
                role=role,
                content=content,
                prompt_tokens=len(content) // 4,  # Simple token estimate
                completion_tokens=len(content) // 4 if role == "assistant" else 0
            )
    
    # Create sample token usage data for the past 30 days
    start_date = datetime.utcnow() - timedelta(days=30)
    for day_offset in range(30):
        date = start_date + timedelta(days=day_offset)
        # Create random token usage (more on recent days)
        prompt_tokens = 1000 + (day_offset * 50)
        completion_tokens = 500 + (day_offset * 25)
        
        token_usage = {
            "id": str(uuid.uuid4()),
            "user_id": test_user.id,
            "date": date,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": prompt_tokens + completion_tokens,
            "model": Config.DEFAULT_MODEL
        }
        
        db.execute(
            """
            INSERT INTO token_usage (id, user_id, date, prompt_tokens, completion_tokens, total_tokens, model)
            VALUES (:id, :user_id, :date, :prompt_tokens, :completion_tokens, :total_tokens, :model)
            """,
            token_usage
        )
    
    db.commit()
    print("Test data created successfully.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Initialize the database')
    parser.add_argument('--test-data', action='store_true', help='Create test data')
    args = parser.parse_args()
    
    with get_db() as db:
        # Initialize system prompts
        init_system_prompts(db)
        
        # Create test data if requested
        if args.test_data:
            create_test_data(db)
    
    print("Database initialization complete.")