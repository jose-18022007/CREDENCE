"""Test HuggingFace API connection."""
import asyncio
import httpx
from dotenv import load_dotenv
import os

load_dotenv()

async def test_huggingface_api():
    """Test HuggingFace API with a simple request."""
    api_key = os.getenv("HUGGINGFACE_API_KEY")
    
    if not api_key:
        print("❌ HUGGINGFACE_API_KEY not set in .env")
        return
    
    print(f"✅ API Key found: {api_key[:20]}...")
    
    # Test with the AI image detector model (same as image service)
    api_url = "https://api-inference.huggingface.co/models/umm-maybe/AI-image-detector"
    
    headers = {
        "Authorization": f"Bearer {api_key}"
    }
    
    payload = {
        "inputs": "test"
    }
    
    print(f"\n🔍 Testing API connection with AI image detector model...")
    print(f"URL: {api_url}")
    print(f"Note: This will test with text, but the model expects images")
    print(f"We're just checking if the API key works")
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(api_url, headers=headers, json=payload)
            
            print(f"\n📡 Response Status: {response.status_code}")
            
            if response.status_code == 200:
                print("✅ API is working!")
                print(f"Response: {response.json()}")
            elif response.status_code == 401:
                print("❌ Authentication failed - API key is invalid")
                print(f"Response: {response.text}")
            elif response.status_code == 503:
                print("⏳ Model is loading (cold start) - this is normal")
                print("Wait 20-60 seconds and try again")
            else:
                print(f"⚠️ Unexpected status: {response.status_code}")
                print(f"Response: {response.text[:200]}")
                
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_huggingface_api())
