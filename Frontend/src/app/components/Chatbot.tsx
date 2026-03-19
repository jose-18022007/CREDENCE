import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { MessageCircle, X, Send, Shield, Zap, ArrowRight } from "lucide-react";
import { sendMessageToGemini, getErrorMessage, type ChatMessage } from "../../services/geminiChat";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  quickReplies?: string[];
}

const TEAL = "#0D9488";
const NAVY = "#0F172A";
const TEXT = "#334155";
const TEXT_MUTED = "#64748B";
const BORDER = "rgba(226,232,240,0.4)";

export function Chatbot() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load chat history from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem("credence_chat_history");
    const savedGemini = sessionStorage.getItem("credence_gemini_history");
    
    if (saved) {
      const parsed = JSON.parse(saved);
      setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
    } else {
      // Show welcome message on first load
      const welcomeMsg: Message = {
        id: Date.now().toString(),
        text: "Hi! I'm Credence AI, your intelligent assistant powered by Google Gemini. I can help you understand media integrity, fake news detection, and answer questions about any topic. How can I help you today?",
        sender: "bot",
        timestamp: new Date(),
        quickReplies: [
          "What is Credence?",
          "How do I analyze content?",
          "What can you detect?",
          "Tips for spotting fake news",
        ],
      };
      setMessages([welcomeMsg]);
      setHasUnread(true);
    }

    if (savedGemini) {
      setChatHistory(JSON.parse(savedGemini));
    }
  }, []);

  // Save chat history to sessionStorage
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem("credence_chat_history", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (chatHistory.length > 0) {
      sessionStorage.setItem("credence_gemini_history", JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setHasUnread(false);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      // Call real Gemini API
      const response = await sendMessageToGemini(input.trim(), chatHistory);

      // Update Gemini conversation history
      const newHistory: ChatMessage[] = [
        ...chatHistory,
        { role: "user", content: input.trim(), timestamp: Date.now() },
        { role: "model", content: response, timestamp: Date.now() },
      ];
      setChatHistory(newHistory);

      // Generate quick replies based on response content
      const quickReplies = generateQuickReplies(response);

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: "bot",
        timestamp: new Date(),
        quickReplies,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: getErrorMessage(error),
        sender: "bot",
        timestamp: new Date(),
        quickReplies: ["Try again", "What is Credence?", "Contact support"],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickReply = (text: string) => {
    setInput(text);
    setTimeout(() => handleSend(), 100);
  };

  const generateQuickReplies = (botResponse: string): string[] => {
    const response = botResponse.toLowerCase();

    // Credence-related responses
    if (response.includes("credence") && response.includes("platform")) {
      return ["How does it work?", "What can you detect?", "Try it now"];
    }
    if (response.includes("analyze") || response.includes("upload")) {
      return ["Start analyzing", "File size limits?", "Supported formats?"];
    }
    if (response.includes("deepfake") || response.includes("ai-generated")) {
      return ["How accurate is it?", "Analyze content", "More about detection"];
    }
    if (response.includes("fake news") || response.includes("misinformation")) {
      return ["Tips for spotting fakes", "Check source credibility", "Analyze now"];
    }

    // General helpful suggestions
    return ["Tell me more", "Analyze content", "What else can you do?"];
  };

  const formatMessage = (text: string) => {
    // Simple markdown-like formatting
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight:700;color:#0F172A">$1</strong>')
      .replace(/\n\n/g, "</p><p style='margin-top:12px'>")
      .replace(/\n/g, "<br/>");

    return `<p>${formatted}</p>`;
  };

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(13,148,136,0.4); }
          50% { box-shadow: 0 0 0 12px rgba(13,148,136,0); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }
        @keyframes breathe {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .chat-panel {
          animation: slideUp 0.4s cubic-bezier(0.23,1,0.32,1) both;
        }
        .message-fade {
          animation: fadeIn 0.3s ease-out both;
        }
        .pulse-btn {
          animation: pulse 2s infinite;
        }
        .typing-dot {
          animation: bounce 1.4s infinite ease-in-out;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        .online-dot {
          animation: breathe 2s ease-in-out infinite;
        }
        .quick-chip {
          transition: all 0.2s cubic-bezier(0.23,1,0.32,1);
        }
        .quick-chip:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(13,148,136,0.2);
        }
        @media (max-width: 480px) {
          .chat-panel {
            width: 100vw !important;
            height: 100vh !important;
            bottom: 0 !important;
            right: 0 !important;
            border-radius: 0 !important;
          }
        }
      `}</style>

      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={hasUnread ? "pulse-btn" : ""}
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #0D9488, #0F766E)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 24px rgba(13,148,136,0.35)",
            zIndex: 9999,
            transition: "transform 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <MessageCircle size={26} color="#FFFFFF" />
          {hasUnread && (
            <div
              style={{
                position: "absolute",
                top: 4,
                right: 4,
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#EF4444",
                border: "2px solid #FFFFFF",
              }}
            />
          )}
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="chat-panel"
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 380,
            height: "min(520px, 70vh)",
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(24px) saturate(200%)",
            border: "1px solid rgba(255,255,255,0.6)",
            borderRadius: 24,
            boxShadow: "0 20px 60px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid rgba(226,232,240,0.5)",
              background: "linear-gradient(135deg, rgba(13,148,136,0.03), rgba(15,118,110,0.02))",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: "linear-gradient(90deg, #0D9488, #7C3AED, #0D9488)",
                backgroundSize: "200% 100%",
                animation: "gradientShift 4s linear infinite",
              }}
            />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    background: "linear-gradient(135deg, #0D9488, #0F766E)",
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Shield size={18} color="#FFFFFF" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: NAVY }}>Credence AI</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: TEXT_MUTED }}>
                    <div
                      className="online-dot"
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#10B981",
                      }}
                    />
                    Online
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => {
                    if (confirm("Clear all chat history?")) {
                      setMessages([]);
                      setChatHistory([]);
                      sessionStorage.removeItem("credence_chat_history");
                      sessionStorage.removeItem("credence_gemini_history");
                      // Show welcome message again
                      const welcomeMsg: Message = {
                        id: Date.now().toString(),
                        text: "Chat cleared! How can I help you today?",
                        sender: "bot",
                        timestamp: new Date(),
                        quickReplies: ["What is Credence?", "How do I analyze content?", "What can you detect?"],
                      };
                      setMessages([welcomeMsg]);
                    }
                  }}
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "none",
                    borderRadius: 8,
                    padding: "6px 12px",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#EF4444",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.15)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
                >
                  Clear
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: "rgba(15,23,42,0.05)",
                    border: "none",
                    borderRadius: 8,
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(15,23,42,0.1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(15,23,42,0.05)")}
                >
                  <X size={18} color={TEXT} />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={msg.id}
                className="message-fade"
                style={{
                  display: "flex",
                  justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                  animationDelay: `${idx * 0.05}s`,
                }}
              >
                {msg.sender === "bot" && (
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: "linear-gradient(135deg, #0D9488, #0F766E)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 10,
                      flexShrink: 0,
                    }}
                  >
                    <Shield size={14} color="#FFFFFF" />
                  </div>
                )}
                <div
                  style={{
                    maxWidth: "75%",
                    padding: "12px 16px",
                    borderRadius: msg.sender === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background:
                      msg.sender === "user"
                        ? "linear-gradient(135deg, #0D9488, #0F766E)"
                        : "rgba(255,255,255,0.6)",
                    backdropFilter: msg.sender === "bot" ? "blur(16px)" : "none",
                    border: msg.sender === "bot" ? "1px solid rgba(255,255,255,0.5)" : "none",
                    color: msg.sender === "user" ? "#FFFFFF" : TEXT,
                    fontSize: 14,
                    lineHeight: 1.6,
                    boxShadow:
                      msg.sender === "user"
                        ? "0 4px 12px rgba(13,148,136,0.25)"
                        : "0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.6)",
                  }}
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
                />
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="message-fade" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #0D9488, #0F766E)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Shield size={14} color="#FFFFFF" />
                </div>
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "16px 16px 16px 4px",
                    background: "rgba(255,255,255,0.6)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(255,255,255,0.5)",
                    display: "flex",
                    gap: 4,
                    alignItems: "center",
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="typing-dot"
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: TEAL,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quick Replies */}
            {messages.length > 0 &&
              !isTyping &&
              messages[messages.length - 1].sender === "bot" &&
              messages[messages.length - 1].quickReplies && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                  {messages[messages.length - 1].quickReplies!.map((reply, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickReply(reply)}
                      className="quick-chip"
                      style={{
                        padding: "8px 14px",
                        borderRadius: 20,
                        background: "rgba(255,255,255,0.7)",
                        backdropFilter: "blur(12px)",
                        border: `1px solid ${BORDER}`,
                        color: TEAL,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                      }}
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div
            style={{
              padding: "16px 20px",
              borderTop: "1px solid rgba(226,232,240,0.5)",
              background: "rgba(248,250,252,0.5)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything about Credence..."
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: `1px solid ${BORDER}`,
                  background: "rgba(255,255,255,0.8)",
                  backdropFilter: "blur(8px)",
                  fontSize: 14,
                  color: TEXT,
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: input.trim()
                    ? "linear-gradient(135deg, #0D9488, #0F766E)"
                    : "rgba(148,163,184,0.3)",
                  border: "none",
                  cursor: input.trim() ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                  boxShadow: input.trim() ? "0 4px 12px rgba(13,148,136,0.3)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (input.trim()) e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <Send size={18} color={input.trim() ? "#FFFFFF" : "#94A3B8"} />
              </button>
            </div>
            <div style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 8, textAlign: "center" }}>
              Powered by Credence AI
            </div>
          </div>
        </div>
      )}
    </>
  );
}
