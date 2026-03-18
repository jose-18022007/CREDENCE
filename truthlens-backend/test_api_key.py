"""Test Gemini API key to diagnose issues."""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_api_key():
    """Test if the Gemini API key works."""
    api_key = os.getenv("GEMINI_API_KEY", "").strip('"')
    
    print("=" * 60)
    print("GEMINI API KEY TEST")
    print("=" * 60)
    
    # Check if key exists
    if not api_key:
        print("❌ ERROR: No API key found in .env file")
        print("\nAdd this to your .env file:")
        print('GEMINI_API_KEY="your_key_here"')
        return False
    
    print(f"✓ API key found: {api_key[:20]}...{api_key[-4:]}")
    print(f"✓ Key length: {len(api_key)} characters")
    
    # Test with new google.genai library
    try:
        from google import genai
        
        print("\n" + "=" * 60)
        print("TESTING API CONNECTION")
        print("=" * 60)
        
        client = genai.Client(api_key=api_key)
        
        # Try to generate content
        print("\nSending test request to Gemini...")
        response = client.models.generate_content(
            model="models/gemini-flash-latest",
            contents="Say 'Hello, I am working!' in exactly those words."
        )
        
        if response and response.text:
            print(f"✓ SUCCESS! Response: {response.text}")
            print("\n" + "=" * 60)
            print("✅ YOUR API KEY IS WORKING!")
            print("=" * 60)
            return True
        else:
            print("❌ ERROR: Empty response from API")
            return False
            
    except Exception as e:
        error_msg = str(e)
        print(f"\n❌ ERROR: {error_msg}")
        
        print("\n" + "=" * 60)
        print("DIAGNOSIS")
        print("=" * 60)
        
        if "expired" in error_msg.lower():
            print("❌ API key has EXPIRED")
            print("\nSOLUTION:")
            print("1. Go to: https://aistudio.google.com/app/apikey")
            print("2. DELETE the old key")
            print("3. CREATE a new key")
            print("4. Make sure to COPY it immediately")
            print("5. Update your .env file")
            
        elif "invalid" in error_msg.lower() or "403" in error_msg:
            print("❌ API key is INVALID or LEAKED")
            print("\nSOLUTION:")
            print("1. Go to: https://aistudio.google.com/app/apikey")
            print("2. CREATE a completely new key")
            print("3. Update your .env file")
            
        elif "400" in error_msg:
            print("❌ Bad request - possibly wrong model name")
            print("\nSOLUTION:")
            print("1. Check if you're using 'gemini-1.5-flash' model")
            print("2. Try 'gemini-1.5-pro' if flash doesn't work")
            
        else:
            print("❌ Unknown error")
            print("\nTRY:")
            print("1. Get a fresh API key from Google AI Studio")
            print("2. Make sure you're signed in with the right Google account")
            print("3. Check if you have any billing or quota issues")
        
        return False

if __name__ == "__main__":
    success = test_api_key()
    
    if not success:
        print("\n" + "=" * 60)
        print("NEXT STEPS")
        print("=" * 60)
        print("1. Visit: https://aistudio.google.com/app/apikey")
        print("2. Sign in with your Google account")
        print("3. Click 'Create API Key'")
        print("4. Copy the ENTIRE key (starts with AIzaSy...)")
        print("5. Open truthlens-backend/.env")
        print("6. Replace line 1 with: GEMINI_API_KEY=\"your_new_key\"")
        print("7. Save and run this test again")
        print("=" * 60)
