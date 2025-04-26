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
        try:
            print(f"Calling OpenAI API with model: {model}")
            print(f"Using API Key: {Config.OPENAI_API_KEY[:5]}..." if Config.OPENAI_API_KEY else "No API key found!")
            
            # For newer OpenAI library (v1.0.0+)
            response = self.openai_client.chat.completions.create(
                model=model,
                messages=messages,
                max_completion_tokens=Config.MAX_COMPLETION_TOKENS,
                # temperature=Config.TEMPERATURE
            )
            
            # No need to await here in newer versions
            return {
                "message": {
                    "role": "assistant",
                    "content": response.choices[0].message.content
                }
            }
        except Exception as e:
            print(f"ERROR in OpenAI API call: {str(e)}")
            import traceback
            traceback.print_exc()
            raise