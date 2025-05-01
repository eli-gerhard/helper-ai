# LLM Chat Interface

A modular chat interface that uses the OpenAI API for backend processing, similar to popular LLM chat interfaces like ChatGPT, Claude, or Gemini.

## Features

- Clean, modern UI similar to popular LLM chat interfaces
- Toggle between different models: gpt-4.1-mini, o4-mini (high), and gpt-4o-mini-search-preview
- Markdown support in messages (code blocks, bold, italic)
- Error handling and loading indicators

## Project Structure

### Frontend (TypeScript)

- `index.html` - Main HTML structure
- `styles.css` - Styling for the chat interface
- `src/app.ts` - Main TypeScript application logic
- `src/chatService.ts` - Service for handling API calls to the backend
- `src/types.ts` - TypeScript interfaces and types

### Backend (Python)

- `backend/app.py` - FastAPI application
- `backend/openai_client.py` - Module for interacting with the OpenAI API
- `backend/config.py` - Configuration settings

## Setup Instructions

### Prerequisites

- Node.js and npm
- Python 3.8+
- OpenAI API key

### Backend Setup

1. Create a virtual environment:
   ```
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```
   pip install fastapi uvicorn openai python-dotenv
   ```

3. Create a `.env` file with your API keys (copy from .env.template):
   ```
   cp .env.template .env
   # Then edit .env with your actual API keys
   ```

4. Start the backend server:
   ```
   python app.py
   ```

### Frontend Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Build the TypeScript code:
   ```
   npm run build
   # or for development with auto-rebuild:
   npm run dev
   ```

3. Start a local server:
   ```
   npm start
   ```

4. Open your browser to http://localhost:8080

## Usage

1. Type your message in the input box at the bottom of the page.
2. Select a model from the dropdown menu.
3. Click the Send button or press Enter to send your message.
4. The assistant's response will appear in the chat history.

## Notes

- All models use the OpenAI API.
- The model names should correspond to actual available models in the respective APIs.
- For production use, you should add proper authentication and rate limiting.
