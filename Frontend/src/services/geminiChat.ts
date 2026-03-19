// services/geminiChat.ts

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

// System instruction that tells Gemini who it is and what it knows
const SYSTEM_INSTRUCTION = `You are "Credence AI Assistant" — a helpful, intelligent, and friendly AI assistant built into the Credence platform.

ABOUT CREDENCE:
Credence is an AI-powered media integrity platform that detects fake news, deepfakes, AI-generated media, and manipulated content. Here's what you know about it:

- Supports 5 media types: Text, URL, Image, Video, Audio
- Uses multiple AI models: Google Gemini, HuggingFace transformers, OpenAI Whisper
- Integrates with fact-check databases: Google Fact Check API, Snopes, PolitiFact
- Key features: Fake news detection, AI-generated image detection (MidJourney/DALL-E/Stable Diffusion), Deepfake video detection, AI voice cloning detection, Source credibility scoring, EXIF metadata analysis, Error Level Analysis (ELA), Reverse image search
- How it works: 4 steps — Upload/Paste content → AI Processes (OCR, scraping, fingerprinting, multi-model analysis) → Cross-Reference against databases → Get detailed report
- Results show: Trust Score (0-100), Verdict (VERIFIED/MOSTLY_CREDIBLE/SUSPICIOUS/LIKELY_MISLEADING/FAKE), Claim verification with evidence, Source credibility analysis, Media integrity checks
- Privacy: Content is not stored permanently, anonymized metadata only
- Accuracy: ~87% across all media types
- File limits: Images up to 10MB (PNG/JPG/WEBP), Videos up to 100MB (MP4/MOV/AVI), Audio up to 50MB (MP3/WAV/FLAC)
- App pages: Home (/), Analyze (/analyze), About (/about), Results (/results)
- Built by passionate team fighting misinformation
- Free to use, API available for developers

YOUR BEHAVIOR:
1. You are a GENERAL AI ASSISTANT — you can answer questions about ANY topic: science, technology, history, math, coding, current events, philosophy, health, entertainment, sports, etc.
2. For Credence-related questions: provide detailed, accurate information about the platform
3. For fake news/misinformation topics: provide expert-level educational information and tips
4. For any other topic: answer helpfully and accurately like a knowledgeable AI assistant
5. Keep responses concise — 2-4 short paragraphs max unless user asks for detail
6. Use markdown formatting:
   - **bold** for emphasis
   - - bullet points for lists
   - \`backticks\` for technical terms
   - Keep paragraphs short (2-3 sentences)
7. Be friendly and conversational but professional
8. When relevant to the conversation, naturally suggest Credence features (e.g., "You can verify that claim using our Analyze feature")
9. If asked who you are: "I'm Credence AI Assistant, powered by Google Gemini. I can help you with anything — from using the Credence platform to answering questions about any topic!"
10. Never make up information. If you don't know something, say so honestly.
11. Never provide harmful, illegal, or dangerous content.
12. Support multiple languages — respond in whatever language the user writes in.`;

// Types
export interface ChatMessage {
  role: "user" | "model";
  content: string;
  timestamp: number;
}

interface GeminiContent {
  role: "user" | "model";
  parts: { text: string }[];
}

interface GeminiResponse {
  candidates?: {
    content: {
      parts: { text: string }[];
    };
    finishReason: string;
  }[];
  error?: {
    code: number;
    message: string;
  };
}

// Build the conversation payload for Gemini
function buildContents(history: ChatMessage[], newMessage: string): GeminiContent[] {
  const contents: GeminiContent[] = [];

  // System instruction as first user message + model acknowledgment
  contents.push({
    role: "user",
    parts: [{ text: SYSTEM_INSTRUCTION }],
  });
  contents.push({
    role: "model",
    parts: [
      {
        text: "Understood! I am Credence AI Assistant. I'm ready to help with anything — whether it's about the Credence platform, fake news detection, or any other topic. How can I help you today?",
      },
    ],
  });

  // Add conversation history (last 20 messages to stay within token limits)
  const recentHistory = history.slice(-20);
  for (const msg of recentHistory) {
    contents.push({
      role: msg.role,
      parts: [{ text: msg.content }],
    });
  }

  // Add the new user message
  contents.push({
    role: "user",
    parts: [{ text: newMessage }],
  });

  return contents;
}

// Main function to send message to Gemini
export async function sendMessageToGemini(
  message: string,
  history: ChatMessage[]
): Promise<string> {
  // Check API key
  if (!API_KEY) {
    throw new Error(
      "Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file."
    );
  }

  const contents = buildContents(history, message);

  const requestBody = {
    contents,
    generationConfig: {
      temperature: 0.75,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    ],
  };

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      if (response.status === 429) {
        throw new Error("RATE_LIMITED");
      }
      if (response.status === 403) {
        throw new Error("API_KEY_INVALID");
      }

      throw new Error(
        errorData?.error?.message || `API request failed with status ${response.status}`
      );
    }

    const data: GeminiResponse = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error(
        "No response generated. The content may have been blocked by safety filters."
      );
    }

    const candidate = data.candidates[0];

    if (candidate.finishReason === "SAFETY") {
      return "I can't provide a response to that particular question. Could you try rephrasing or asking something else? I'm happy to help with a wide range of topics! 😊";
    }

    const responseText = candidate.content.parts.map((part) => part.text).join("").trim();

    if (!responseText) {
      throw new Error("Empty response received from AI");
    }

    return responseText;
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      throw new Error("TIMEOUT");
    }

    throw error;
  }
}

// Helper to get user-friendly error message
export function getErrorMessage(error: any): string {
  const msg = error?.message || "Unknown error";

  if (msg === "RATE_LIMITED") {
    return "I need a quick breather! 😅 Please wait a few seconds before sending another message.";
  }
  if (msg === "TIMEOUT") {
    return "The response is taking too long. Please check your internet connection and try again.";
  }
  if (msg === "API_KEY_INVALID") {
    return "There's a configuration issue with the AI service. Please contact support.";
  }
  if (msg.includes("API key")) {
    return "The AI service is not configured yet. Please set up your API key.";
  }
  if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
    return "Looks like you're offline. Please check your internet connection and try again. 📡";
  }
  if (msg.includes("safety") || msg.includes("blocked")) {
    return "I can't respond to that particular question. Try asking something different! 😊";
  }

  return "Something went wrong. Please try again in a moment. 🔄";
}
