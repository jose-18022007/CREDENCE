# Credence AI Chatbot - Setup Instructions

## ✅ What's Been Done

The chatbot has been fully integrated into your Credence application:

1. **Created `src/services/geminiChat.ts`** - Handles all Google Gemini API communication
2. **Updated `src/app/components/Chatbot.tsx`** - Now uses real AI instead of mock responses
3. **Integrated into `src/app/pages/Root.tsx`** - Chatbot appears on all pages
4. **Created `.env.example`** - Template for environment variables

## 🔧 Setup Required

### Step 1: Get a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

### Step 2: Configure Environment Variable

1. Create a `.env` file in the `Frontend/` directory:
   ```bash
   cd Frontend
   touch .env
   ```

2. Add your API key to `.env`:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

3. **Important:** Restart your Vite dev server after adding the .env file:
   ```bash
   npm run dev
   ```

### Step 3: Test the Chatbot

1. Open your application in the browser
2. Click the floating chat button in the bottom-right corner
3. Try asking questions like:
   - "What is Credence?"
   - "How do I detect deepfakes?"
   - "Explain quantum computing"
   - "Tips for spotting fake news"

## 🎯 Features

- **Real AI Intelligence** - Powered by Google Gemini 2.0 Flash
- **General Knowledge** - Can answer questions about ANY topic
- **Credence Expert** - Deep knowledge about the platform
- **Conversation Memory** - Remembers context within the chat session
- **Smart Quick Replies** - Contextual suggestions based on responses
- **Error Handling** - Graceful fallbacks for API issues
- **Persistent History** - Chat saved in sessionStorage

## 🔒 Security Notes

- API key is only used in the frontend (client-side)
- For production, consider proxying requests through your backend
- The `.env` file is gitignored by default
- Never commit your actual API key to version control

## 📊 API Limits

Google Gemini free tier:
- 1,500 requests per day
- 1 million tokens per month
- Rate limit: 15 requests per minute

For production with high traffic, upgrade to paid tier or implement backend proxy.

## 🐛 Troubleshooting

**Chatbot shows "API key not configured":**
- Make sure `.env` file exists in `Frontend/` directory
- Verify the variable name is exactly `VITE_GEMINI_API_KEY`
- Restart the Vite dev server

**"Rate limited" error:**
- Wait a few seconds between messages
- Check if you've exceeded daily quota

**"Network error":**
- Check internet connection
- Verify API key is valid
- Check browser console for CORS issues

## 🎨 Customization

The chatbot UI matches your Credence design system:
- Glass morphism effects
- Teal gradient (#0D9488)
- Smooth animations
- Mobile responsive

To customize responses, edit the `SYSTEM_INSTRUCTION` in `services/geminiChat.ts`.

---

**That's it! Your chatbot is now powered by real AI.** 🚀
