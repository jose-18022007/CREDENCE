"""List available Gemini models."""
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY", "").strip('"')

if not api_key:
    print("No API key found!")
    exit(1)

try:
    from google import genai
    
    client = genai.Client(api_key=api_key)
    
    print("Available Gemini models:")
    print("=" * 60)
    
    models = client.models.list()
    for model in models:
        print(f"- {model.name}")
        if hasattr(model, 'supported_generation_methods'):
            print(f"  Methods: {model.supported_generation_methods}")
    
except Exception as e:
    print(f"Error: {e}")
