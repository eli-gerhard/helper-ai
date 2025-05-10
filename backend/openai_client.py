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
        # # Clear any proxy settings that may be causing issues
        # import os
        # if 'http_proxy' in os.environ:
        #     del os.environ['http_proxy']
        # if 'https_proxy' in os.environ:
        #     del os.environ['https_proxy']
        # if 'HTTP_PROXY' in os.environ:
        #     del os.environ['HTTP_PROXY']
        # if 'HTTPS_PROXY' in os.environ:
        #     del os.environ['HTTPS_PROXY']
        
        # self.openai_client = openai.OpenAI(api_key=Config.OPENAI_API_KEY)
        import os
        for proxy_var in ['http_proxy', 'https_proxy', 'HTTP_PROXY', 'HTTPS_PROXY']:
            if proxy_var in os.environ:
                del os.environ[proxy_var]
        
        # Create client with minimal configuration
        import openai
        from openai import OpenAI
        
        try:
            # Try creating with just the API key
            self.openai_client = openai.OpenAI(api_key=Config.OPENAI_API_KEY)
        except TypeError as e:
            # If that fails, print diagnostic info and try alternative approach
            print(f"Error initializing OpenAI client: {str(e)}")
            print(f"OpenAI version: {openai.__version__}")
            
            # Alternative initialization with no keyword args
            from openai import OpenAI
            self.openai_client = OpenAI()
            # Set API key after initialization
            self.openai_client.api_key = Config.OPENAI_API_KEY
    
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