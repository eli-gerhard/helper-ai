from typing import List, Dict, Any, Optional
import openai
from config import Config

class Message:
    def __init__(self, role: str, content: str):
        self.role = role
        self.content = content

    def to_dict(self) -> Dict[str, str]:
        return {
            "role": self.role,
            "content": self.content
        }

class LLMClient:
    def __init__(self):
        self.openai_client = openai.OpenAI(api_key=Config.OPENAI_API_KEY)
    
    async def generate_response(self, messages: List[Dict[str, str]], model: str) -> Dict[str, Any]:
        """
        Generate a response using the specified model.
        """
        try:
            return await self._call_openai_api(messages, model)
        except Exception as e:
            return {
                "error": str(e),
                "message": {
                    "role": "assistant",
                    "content": f"Sorry, there was an error: {str(e)}"
                }
            }
    
    async def _call_openai_api(self, messages: List[Dict[str, str]], model: str) -> Dict[str, Any]:
        """
        Call the OpenAI API to generate a response.
        """
        response = await self.openai_client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=Config.MAX_TOKENS,
            temperature=Config.TEMPERATURE
        )
        
        return {
            "message": {
                "role": "assistant",
                "content": response.choices[0].message.content
            }
        }