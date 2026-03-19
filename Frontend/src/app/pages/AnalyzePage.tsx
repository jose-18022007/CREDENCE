import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  FileText,
  Link2,
  Image,
  Video,
  Mic,
  UploadCloud,
  X,
  Check,
  AlertCircle,
  Wifi,
  WifiOff,
  Globe,
  Newspaper,
  Scan,
  ArrowRight,
  Zap,
  Sparkles,
} from "lucide-react";
import {
  analyzeText,
  analyzeURL,
  analyzeImage,
  analyzeVideo,
  analyzeAudio,
  getDashboardStats,
  type AnalysisResponse,
} from "../../services/api";
import { useApiHealth } from "../../hooks/useApiHealth";

const TABS = [
  { id: "text", label: "Text", icon: <FileText size={16} /> },
  { id: "url", label: "URL", icon: <Link2 size={16} /> },
  { id: "image", label: "Image", icon: <Image size={16} /> },
];

const STEPS = [
  "Extracting content",
  "Checking sources",
  "Verifying claims",
  "Analyzing media",
  "Generating report",
];

/* ============================== */
/* ===== INPUT VALIDATION ===== */
/* ============================== */
function validateTextInput(text: string): string | null {
  // Check minimum length
  if (text.trim().length < 10) {
    return "Text must be at least 10 characters long";
  }

  // Check if only numbers
  if (/^\d+$/.test(text.trim())) {
    return "Invalid input: Text cannot contain only numbers";
  }

  // Check if only special characters (no letters)
  if (!/[a-zA-Z]/.test(text)) {
    return "Invalid input: Text must contain at least some letters";
  }

  // Check if mostly special characters (less than 20% alphanumeric)
  const alphanumeric = text.match(/[a-zA-Z0-9]/g) || [];
  const total = text.replace(/\s/g, "").length;
  if (total > 0 && alphanumeric.length / total < 0.2) {
    return "Invalid input: Text contains too many special characters";
  }

  // Check if only repeated characters (e.g., "aaaaaaa")
  if (/^(.)\1+$/.test(text.trim())) {
    return "Invalid input: Text cannot be only repeated characters";
  }

  // Check if meaningful words exist (at least 3 words with 2+ letters)
  const words = text.trim().split(/\s+/).filter(w => /[a-zA-Z]{2,}/.test(w));
  if (words.length < 3) {
    return "Invalid input: Text must contain at least 3 meaningful words";
  }

  return null; // Valid input
}

function getTypeIcon(type: string) {
  switch (type) {
    case "text": return <FileText size={14} />;
    case "url": return <Globe size={14} />;
    case "image": return <Image size={14} />;
    case "video": return <Video size={14} />;
    case "audio": return <Mic size={14} />;
    default: return <Newspaper size={14} />;
  }
}

function getVerdictColor(verdict: string) {
  const v = verdict.toUpperCase();
  if (v.includes("FAKE") || v.includes("MISLEADING")) return "#EF4444";
  if (v.includes("SUSPICIOUS")) return "#F59E0B";
  if (v.includes("CREDIBLE") || v.includes("VERIFIED")) return "#10B981";
  return "#94A3B8";
}

/* ============================== */
/* ===== TOGGLE CHIP ===== */
/* ============================== */
function ToggleChip({ label, enabled, onToggle }: { label: string; enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="toggle-chip"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "7px 14px",
        borderRadius: 22,
        border: `1.5px solid ${enabled ? "rgba(13,148,136,0.3)" : "rgba(226,232,240,0.6)"}`,
        backgroundColor: enabled ? "rgba(13,148,136,0.06)" : "rgba(255,255,255,0.5)",
        backdropFilter: "blur(8px)",
        color: enabled ? "#0D9488" : "#64748B",
        fontSize: 13,
        fontWeight: enabled ? 600 : 500,
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.23,1,0.32,1)",
        transform: "translateY(0)",
      }}
      onMouseEnter={(e) => {
        (e.target as HTMLElement).style.transform = "translateY(-1px)";
        (e.target as HTMLElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.04)";
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLElement).style.transform = "translateY(0)";
        (e.target as HTMLElement).style.boxShadow = "none";
      }}
    >
      {enabled && <Check size={12} strokeWidth={2.5} />}
      {label}
    </button>
  );
}

/* ============================== */
/* ===== PROCESSING OVERLAY ===== */
/* ============================== */
function ProcessingOverlay() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= STEPS.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 700);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.25)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 300,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes overlayIn{from{opacity:0;transform:scale(0.92) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes stepPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
        @keyframes progressGlow{0%,100%{box-shadow:0 0 12px rgba(13,148,136,0.2)}50%{box-shadow:0 0 24px rgba(13,148,136,0.4)}}
      `}</style>
      <div
        style={{
          background: "rgba(255,255,255,0.82)",
          backdropFilter: "blur(28px) saturate(200%)",
          WebkitBackdropFilter: "blur(28px) saturate(200%)",
          borderRadius: 24,
          padding: "52px 56px",
          maxWidth: 520,
          width: "92%",
          textAlign: "center",
          boxShadow: "0 30px 80px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.6), inset 0 1px 0 #fff",
          border: "1px solid rgba(255,255,255,0.5)",
          animation: "overlayIn 0.5s cubic-bezier(0.23,1,0.32,1) both",
        }}
      >
        {/* Spinner */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(13,148,136,0.08), rgba(124,58,237,0.05))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            animation: "progressGlow 2s ease-in-out infinite",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              border: "3px solid rgba(13,148,136,0.15)",
              borderTopColor: "#0D9488",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
        </div>

        <h3 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", marginBottom: 8, letterSpacing: "-0.5px" }}>
          Analyzing Content
        </h3>
        <p style={{ fontSize: 14, color: "#94A3B8", marginBottom: 40 }}>
          Our AI is processing your content across multiple models
        </p>

        {/* Steps */}
        <div style={{ textAlign: "left" }}>
          {STEPS.map((step, i) => {
            const done = i < currentStep;
            const active = i === currentStep;
            return (
              <div
                key={step}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "12px 0",
                  borderBottom: i < STEPS.length - 1 ? "1px solid rgba(226,232,240,0.4)" : "none",
                  transition: "all 0.4s ease",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    background: done
                      ? "linear-gradient(135deg, #10B981, #059669)"
                      : active
                      ? "linear-gradient(135deg, #0D9488, #0891B2)"
                      : "rgba(241,245,249,0.6)",
                    boxShadow: done
                      ? "0 2px 8px rgba(16,185,129,0.25)"
                      : active
                      ? "0 2px 8px rgba(13,148,136,0.25)"
                      : "none",
                    transition: "all 0.4s cubic-bezier(0.23,1,0.32,1)",
                    animation: active ? "stepPulse 1.5s ease-in-out infinite" : "none",
                  }}
                >
                  {done ? (
                    <Check size={13} color="#fff" strokeWidth={3} />
                  ) : active ? (
                    <div style={{ width: 8, height: 8, background: "#fff", borderRadius: "50%" }} />
                  ) : (
                    <div style={{ width: 6, height: 6, background: "#CBD5E1", borderRadius: "50%" }} />
                  )}
                </div>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: done || active ? 600 : 400,
                    color: done ? "#10B981" : active ? "#0F172A" : "#94A3B8",
                    transition: "all 0.3s",
                  }}
                >
                  {step}
                  {active && <span style={{ color: "#0D9488" }}>...</span>}
                </span>
                {done && (
                  <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: "#10B981" }}>Done</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============================== */
/* ===== MAIN ANALYZE PAGE ===== */
/* ============================== */
export function AnalyzePage() {
  const navigate = useNavigate();
  const { isHealthy, isChecking } = useApiHealth();
  const [activeTab, setActiveTab] = useState("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [textOptions, setTextOptions] = useState({ bias: true, deep: false, fallacies: false });
  const [imageOptions, setImageOptions] = useState({ ai: true, reverse: true, exif: true, ela: true });
  const [videoOptions, setVideoOptions] = useState({ deepfake: true, aiGen: true, frameByFrame: true, audio: true, lipsync: true });
  const [audioOptions, setAudioOptions] = useState({ aiVoice: true, cloning: true, spectrogram: true, splice: true, transcription: true });

  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const stats = await getDashboardStats();
        setRecentAnalyses(stats.recent_analyses || []);
      } catch {
        setRecentAnalyses([]);
      } finally {
        setLoadingRecent(false);
      }
    };
    fetchRecent();
  }, []);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      let result: AnalysisResponse;
      if (activeTab === "text") {
        // Validate text input
        const validationError = validateTextInput(text);
        if (validationError) {
          throw new Error(validationError);
        }
        result = await analyzeText(text, { check_bias: textOptions.bias, check_fallacies: textOptions.fallacies });
      } else if (activeTab === "url") {
        result = await analyzeURL(url);
      } else if (activeTab === "image" && uploadedFile) {
        result = await analyzeImage(uploadedFile, { check_ai_generated: imageOptions.ai, check_exif: imageOptions.exif, check_ela: imageOptions.ela, reverse_search: imageOptions.reverse });
      } else if (activeTab === "video" && uploadedFile) {
        result = await analyzeVideo(uploadedFile, { check_deepfake: videoOptions.deepfake, check_ai_generated: videoOptions.aiGen, extract_audio: videoOptions.audio });
      } else if (activeTab === "audio" && uploadedFile) {
        result = await analyzeAudio(uploadedFile, { check_ai_voice: audioOptions.aiVoice, transcribe: audioOptions.transcription });
      } else {
        throw new Error("No content to analyze");
      }
      sessionStorage.setItem("latestAnalysis", JSON.stringify(result));
      setTimeout(() => navigate("/results"), 600);
    } catch (err: any) {
      setError(err.message || "Analysis failed. Please try again.");
      setAnalyzing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setUploadedFile(file);
  }, []);

  const urlPreview = url.length > 8
    ? {
        title: "Article: " + url.replace(/https?:\/\//i, "").slice(0, 40),
        domain: url.replace(/https?:\/\//i, "").split("/")[0],
      }
    : null;

  const canAnalyze = () => {
    if (!isHealthy) return false;
    if (activeTab === "text") return !!text.trim();
    if (activeTab === "url") return !!url.trim();
    return !!uploadedFile;
  };

  return (
    <div style={{ backgroundColor: "#FAFBFF", minHeight: "100vh", color: "#1E293B", overflowX: "hidden" }}>
      <style>{`
        @keyframes fadeInUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes gridPulse{0%,100%{opacity:.35}50%{opacity:.8}}
        @keyframes scanV{0%{transform:translateY(-100%);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translateY(100%);opacity:0}}
        @keyframes orbFloat{0%,100%{transform:translate(0,0) scale(1);opacity:0.6}33%{transform:translate(30px,-20px) scale(1.08);opacity:0.8}66%{transform:translate(-20px,15px) scale(0.95);opacity:0.5}}
        @keyframes shimmer{0%{left:-150%}100%{left:150%}}
        @keyframes breathe{0%,100%{transform:scale(1);opacity:0.6}50%{transform:scale(1.4);opacity:1}}
        @keyframes tabSlide{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes dropGlow{0%,100%{border-color:rgba(13,148,136,0.15)}50%{border-color:rgba(13,148,136,0.35)}}
        @keyframes errorIn{from{opacity:0;transform:translateX(40px) scale(0.95)}to{opacity:1;transform:translateX(0) scale(1)}}
        @keyframes recentCardIn{from{opacity:0;transform:translateY(16px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}

        .grid-analyze{position:absolute;inset:0;pointer-events:none;overflow:hidden}
        .grid-analyze::before{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(15,23,42,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(15,23,42,0.035) 1px,transparent 1px);background-size:60px 60px}
        .grid-analyze::after{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(13,148,136,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(13,148,136,0.02) 1px,transparent 1px);background-size:180px 180px}

        .g-dot{position:absolute;border-radius:50%;animation:gridPulse 4s ease-in-out infinite}

        /* Tab bar */
        .tab-bar{
          display:flex;gap:4px;
          padding:5px;border-radius:16px;
          background:rgba(241,245,249,0.6);
          backdrop-filter:blur(12px);
          -webkit-backdrop-filter:blur(12px);
          border:1px solid rgba(226,232,240,0.5);
          overflow-x:auto;
          margin-bottom:40px;
        }
        .tab-btn{
          flex:1;min-width:100px;
          display:flex;align-items:center;justify-content:center;gap:8px;
          padding:12px 18px;border-radius:12px;
          border:none;cursor:pointer;
          font-size:14px;font-weight:500;
          transition:all 0.35s cubic-bezier(0.23,1,0.32,1);
          position:relative;overflow:hidden;
          background:transparent;color:#64748B;
        }
        .tab-btn:hover:not(.tab-active){
          color:#334155;
          background:rgba(255,255,255,0.5);
        }
        .tab-active{
          background:rgba(255,255,255,0.9)!important;
          color:#0D9488!important;
          font-weight:600!important;
          box-shadow:0 2px 12px rgba(0,0,0,0.04),0 0 0 1px rgba(13,148,136,0.06);
        }
        .tab-active::after{
          content:'';position:absolute;bottom:6px;left:50%;transform:translateX(-50%);
          width:20px;height:2.5px;border-radius:3px;
          background:linear-gradient(90deg,#0D9488,#0891B2);
          box-shadow:0 0 8px rgba(13,148,136,0.3);
        }

        /* Content card */
        .content-card{
          background:rgba(255,255,255,0.6);
          backdrop-filter:blur(24px) saturate(200%);
          -webkit-backdrop-filter:blur(24px) saturate(200%);
          border:1px solid rgba(255,255,255,0.65);
          border-radius:22px;
          padding:36px;
          box-shadow:0 4px 24px rgba(0,0,0,0.03),inset 0 1px 0 #fff;
          margin-bottom:48px;
          animation:tabSlide 0.4s cubic-bezier(0.23,1,0.32,1) both;
          position:relative;
          overflow:hidden;
        }
        .content-card::before{
          content:'';position:absolute;top:0;left:0;right:0;height:3px;
          background:linear-gradient(90deg,transparent,#0D9488,#7C3AED,transparent);
          background-size:200% 100%;
          opacity:0.6;
        }

        /* Textarea */
        .glass-textarea{
          width:100%;padding:16px 18px;
          border:1.5px solid rgba(226,232,240,0.5);
          border-radius:14px;font-size:14px;color:#1E293B;
          resize:vertical;outline:none;line-height:1.7;
          font-family:inherit;box-sizing:border-box;
          background:rgba(250,251,255,0.5);
          backdrop-filter:blur(8px);
          -webkit-backdrop-filter:blur(8px);
          transition:all 0.3s ease;
        }
        .glass-textarea:focus{
          border-color:rgba(13,148,136,0.3);
          box-shadow:0 0 0 4px rgba(13,148,136,0.06),0 4px 16px rgba(0,0,0,0.03);
          background:rgba(255,255,255,0.7);
        }
        .glass-textarea::placeholder{color:#94A3B8}

        /* Input */
        .glass-input{
          width:100%;padding:14px 16px 14px 44px;
          border:1.5px solid rgba(226,232,240,0.5);
          border-radius:14px;font-size:14px;color:#1E293B;
          outline:none;font-family:inherit;box-sizing:border-box;
          background:rgba(250,251,255,0.5);
          backdrop-filter:blur(8px);
          -webkit-backdrop-filter:blur(8px);
          transition:all 0.3s ease;
        }
        .glass-input:focus{
          border-color:rgba(13,148,136,0.3);
          box-shadow:0 0 0 4px rgba(13,148,136,0.06),0 4px 16px rgba(0,0,0,0.03);
          background:rgba(255,255,255,0.7);
        }
        .glass-input::placeholder{color:#94A3B8}

        /* Drop zone */
        .drop-zone{
          border:2px dashed rgba(226,232,240,0.6);
          border-radius:18px;padding:56px 24px;
          text-align:center;cursor:pointer;
          background:rgba(250,251,255,0.4);
          backdrop-filter:blur(8px);
          -webkit-backdrop-filter:blur(8px);
          transition:all 0.35s cubic-bezier(0.23,1,0.32,1);
          margin-bottom:24px;
          position:relative;
          overflow:hidden;
        }
        .drop-zone:hover{
          border-color:rgba(13,148,136,0.2);
          background:rgba(13,148,136,0.02);
          transform:translateY(-2px);
          box-shadow:0 8px 30px rgba(0,0,0,0.03);
        }
        .drop-zone.dragging{
          border-color:rgba(13,148,136,0.35)!important;
          background:rgba(13,148,136,0.04)!important;
          animation:dropGlow 1.5s ease-in-out infinite;
          transform:translateY(-2px);
          box-shadow:0 8px 30px rgba(13,148,136,0.06);
        }

        /* Analyze Button */
        .analyze-btn{
          width:100%;padding:16px;
          border:none;border-radius:14px;
          font-size:15px;font-weight:600;
          cursor:pointer;
          transition:all 0.35s cubic-bezier(0.23,1,0.32,1);
          position:relative;overflow:hidden;
          display:flex;align-items:center;justify-content:center;gap:10px;
          letter-spacing:0.2px;
        }
        .analyze-btn.enabled{
          background:linear-gradient(135deg,#0D9488,#0F766E);
          color:#fff;
          box-shadow:0 4px 18px rgba(13,148,136,0.22);
        }
        .analyze-btn.enabled::before{
          content:'';position:absolute;top:0;left:-150%;
          width:120%;height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent);
        }
        .analyze-btn.enabled:hover{
          transform:translateY(-2px) scale(1.01);
          box-shadow:0 10px 35px rgba(13,148,136,0.3);
        }
        .analyze-btn.enabled:hover::before{animation:shimmer 0.65s ease forwards}
        .analyze-btn.enabled:active{transform:translateY(0) scale(0.99)}
        .analyze-btn.disabled{
          background:rgba(203,213,225,0.4);
          color:#94A3B8;cursor:not-allowed;
          backdrop-filter:blur(8px);
        }

        /* URL Preview */
        .url-preview{
          border:1px solid rgba(226,232,240,0.5);
          border-radius:14px;padding:16px 18px;
          margin-bottom:20px;display:flex;align-items:center;gap:14px;
          background:rgba(248,250,255,0.5);
          backdrop-filter:blur(8px);
          -webkit-backdrop-filter:blur(8px);
          transition:all 0.3s ease;
        }
        .url-preview:hover{
          border-color:rgba(13,148,136,0.12);
          box-shadow:0 4px 16px rgba(0,0,0,0.03);
        }

        /* Recent card */
        .recent-card{
          flex-shrink:0;width:210px;
          background:rgba(255,255,255,0.55);
          backdrop-filter:blur(16px) saturate(180%);
          -webkit-backdrop-filter:blur(16px) saturate(180%);
          border:1px solid rgba(255,255,255,0.6);
          border-radius:18px;padding:18px;
          cursor:pointer;
          box-shadow:0 4px 16px rgba(0,0,0,0.03),inset 0 1px 0 rgba(255,255,255,0.7);
          transition:all 0.4s cubic-bezier(0.23,1,0.32,1);
          transform-style:preserve-3d;
          position:relative;overflow:hidden;
        }
        .recent-card::before{
          content:'';position:absolute;top:0;left:0;right:0;height:2px;
          background:linear-gradient(90deg,transparent,rgba(13,148,136,0.2),transparent);
          opacity:0;transition:opacity 0.3s;
        }
        .recent-card:hover{
          transform:translateY(-8px) rotateX(1deg) scale(1.02);
          box-shadow:0 24px 50px rgba(0,0,0,0.06),0 0 0 1px rgba(13,148,136,0.06),inset 0 1px 0 #fff;
          border-color:rgba(13,148,136,0.1);
          background:rgba(255,255,255,0.82);
        }
        .recent-card:hover::before{opacity:1}

        /* Error toast */
        .error-toast{
          animation:errorIn 0.4s cubic-bezier(0.23,1,0.32,1) both;
          background:rgba(255,255,255,0.85);
          backdrop-filter:blur(20px) saturate(180%);
          -webkit-backdrop-filter:blur(20px) saturate(180%);
          border:1.5px solid rgba(239,68,68,0.2);
          border-radius:16px;padding:18px 22px;
          max-width:420px;z-index:1000;
          display:flex;align-items:start;gap:14px;
          box-shadow:0 12px 40px rgba(239,68,68,0.1),0 4px 12px rgba(0,0,0,0.05);
        }

        /* Checkbox custom */
        .custom-check{
          width:18px;height:18px;
          accent-color:#0D9488;cursor:pointer;
          border-radius:4px;
        }

        /* Section heading */
        .section-label{
          display:block;font-weight:700;
          color:#0F172A;margin-bottom:12px;font-size:15px;
          letter-spacing:-0.2px;
        }

        /* Helper text */
        .helper-text{
          font-size:13px;color:#94A3B8;text-align:center;
          margin-top:8px;
        }
      `}</style>

      {analyzing && <ProcessingOverlay />}

      {/* Error Toast */}
      {error && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 1000 }}>
          <div className="error-toast">
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "rgba(239,68,68,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <AlertCircle size={18} color="#EF4444" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: "#EF4444", marginBottom: 4, fontSize: 14 }}>Analysis Failed</div>
              <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.5 }}>{error}</div>
            </div>
            <button
              onClick={() => setError(null)}
              style={{
                background: "rgba(239,68,68,0.06)",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                padding: 6,
                color: "#EF4444",
                transition: "all 0.2s",
                display: "flex",
              }}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ===== HEADER SECTION ===== */}
      <section
        style={{
          position: "relative",
          padding: "64px 24px 48px",
          overflow: "hidden",
          background: "linear-gradient(180deg, #F0F4FF 0%, #FAFBFF 100%)",
        }}
      >
        <div className="grid-analyze" />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(13,148,136,0.15), transparent)", animation: "scanV 10s linear infinite" }} />
          <div style={{ position: "absolute", top: "-15%", right: "-8%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(13,148,136,0.06) 0%, transparent 60%)", filter: "blur(60px)", animation: "orbFloat 22s ease-in-out infinite" }} />
          <div style={{ position: "absolute", bottom: "-20%", left: "-6%", width: 450, height: 450, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.04) 0%, transparent 60%)", filter: "blur(55px)", animation: "orbFloat 26s ease-in-out infinite", animationDelay: "4s" }} />

          {/* Grid dots */}
          {[
            { t: 60, l: 180, s: 8, c: "rgba(13,148,136,0.35)" },
            { t: 120, l: 540, s: 6, c: "rgba(124,58,237,0.25)" },
            { t: 60, l: 780, s: 7, c: "rgba(6,182,212,0.3)" },
          ].map((d, i) => (
            <div key={i} className="g-dot" style={{ top: d.t, left: d.l, width: d.s, height: d.s, background: d.c, boxShadow: `0 0 ${d.s * 2}px ${d.c}`, animationDelay: `${i * 0.6}s` }} />
          ))}

          {/* Floating glass rects */}
          <div style={{ position: "absolute", top: "15%", right: "6%", width: 80, height: 50, background: "linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1))", backdropFilter: "blur(8px)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.35)", animation: "orbFloat 18s ease-in-out infinite", opacity: 0.4 }} />
          <div style={{ position: "absolute", bottom: "10%", left: "4%", width: 55, height: 55, background: "linear-gradient(135deg, rgba(13,148,136,0.06), rgba(255,255,255,0.05))", backdropFilter: "blur(6px)", borderRadius: 6, border: "1px solid rgba(13,148,136,0.06)", animation: "orbFloat 22s ease-in-out infinite", animationDelay: "3s", opacity: 0.35 }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 18px",
              background: "rgba(255,255,255,0.6)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(13,148,136,0.08)",
              borderRadius: 100,
              marginBottom: 24,
              animation: "fadeInUp 0.6s cubic-bezier(0.23,1,0.32,1) both",
            }}
          >
            <Scan size={14} color="#0D9488" />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#0D9488", letterSpacing: "0.3px" }}>Content Analysis</span>
          </div>

          <h1
            style={{
              fontSize: "clamp(30px, 5vw, 44px)",
              fontWeight: 800,
              color: "#0F172A",
              marginBottom: 14,
              letterSpacing: "-1.5px",
              lineHeight: 1.1,
              animation: "fadeInUp 0.7s cubic-bezier(0.23,1,0.32,1) 0.1s both",
            }}
          >
            Analyze{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #0D9488, #0891B2, #7C3AED)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Any Content
            </span>
          </h1>

          <p
            style={{
              fontSize: 17,
              color: "#64748B",
              lineHeight: 1.6,
              maxWidth: 480,
              margin: "0 auto",
              animation: "fadeInUp 0.7s cubic-bezier(0.23,1,0.32,1) 0.2s both",
            }}
          >
            Upload any content type and get an instant AI-powered integrity report
          </p>

          {/* API Status */}
          {!isChecking && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginTop: 20,
                padding: "8px 18px",
                borderRadius: 100,
                background: isHealthy ? "rgba(16,185,129,0.06)" : "rgba(239,68,68,0.06)",
                border: `1px solid ${isHealthy ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)"}`,
                backdropFilter: "blur(8px)",
                animation: "fadeInUp 0.7s cubic-bezier(0.23,1,0.32,1) 0.3s both",
              }}
            >
              {isHealthy ? (
                <>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 8px rgba(16,185,129,0.4)", animation: "breathe 3s ease-in-out infinite" }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#10B981" }}>Backend Connected</span>
                </>
              ) : (
                <>
                  <WifiOff size={13} color="#EF4444" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#EF4444" }}>Backend Offline</span>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ===== MAIN CONTENT ===== */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px 80px", position: "relative" }}>

        {/* Tab Bar */}
        <div className="tab-bar" style={{ animation: "fadeInUp 0.6s cubic-bezier(0.23,1,0.32,1) 0.35s both" }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setUploadedFile(null); }}
              className={`tab-btn ${activeTab === tab.id ? "tab-active" : ""}`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Card */}
        <div className="content-card" key={activeTab}>

          {/* ===== TEXT TAB ===== */}
          {activeTab === "text" && (
            <div>
              <label className="section-label">
                <FileText size={15} style={{ display: "inline", verticalAlign: "middle", marginRight: 8, color: "#0D9488" }} />
                Paste Text Content
              </label>
              <div style={{ position: "relative", marginBottom: 8 }}>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste the news article, claim, social media post, or any text you want to verify..."
                  rows={8}
                  className="glass-textarea"
                />
                <div style={{ position: "absolute", bottom: 12, right: 14, fontSize: 12, color: "#94A3B8", background: "rgba(255,255,255,0.7)", padding: "2px 8px", borderRadius: 6, backdropFilter: "blur(4px)" }}>
                  {text.length} chars
                </div>
              </div>

              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", margin: "18px 0 24px" }}>
                {[
                  { key: "bias", label: "Check for political bias" },
                  { key: "deep", label: "Deep fact-check mode" },
                  { key: "fallacies", label: "Logical fallacies" },
                ].map((opt) => (
                  <label key={opt.key} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, color: "#334155", fontWeight: 500 }}>
                    <input
                      type="checkbox"
                      checked={textOptions[opt.key as keyof typeof textOptions]}
                      onChange={() => setTextOptions((p) => ({ ...p, [opt.key]: !p[opt.key as keyof typeof textOptions] }))}
                      className="custom-check"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>

              <button onClick={handleAnalyze} disabled={!canAnalyze()} className={`analyze-btn ${canAnalyze() ? "enabled" : "disabled"}`}>
                <Scan size={17} />
                Analyze Text
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* ===== URL TAB ===== */}
          {activeTab === "url" && (
            <div>
              <label className="section-label">
                <Link2 size={15} style={{ display: "inline", verticalAlign: "middle", marginRight: 8, color: "#0D9488" }} />
                Article or Page URL
              </label>
              <div style={{ position: "relative", marginBottom: 20 }}>
                <Link2 size={16} color="#94A3B8" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", zIndex: 1 }} />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/article-to-verify"
                  className="glass-input"
                />
              </div>

              {urlPreview && (
                <div className="url-preview">
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      background: "rgba(13,148,136,0.06)",
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      border: "1px solid rgba(13,148,136,0.08)",
                    }}
                  >
                    <Globe size={20} color="#0D9488" />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{urlPreview.title}</div>
                    <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>{urlPreview.domain}</div>
                  </div>
                </div>
              )}

              <button onClick={handleAnalyze} disabled={!canAnalyze()} className={`analyze-btn ${canAnalyze() ? "enabled" : "disabled"}`}>
                <Globe size={17} />
                Analyze URL
                <ArrowRight size={16} />
              </button>
              <p className="helper-text">
                We'll scrape the content, check source credibility, and verify all claims
              </p>
            </div>
          )}

          {/* ===== IMAGE TAB ===== */}
          {activeTab === "image" && (
            <div>
              <label className="section-label">
                <Image size={15} style={{ display: "inline", verticalAlign: "middle", marginRight: 8, color: "#0D9488" }} />
                Upload Image
              </label>
              <div
                className={`drop-zone ${dragOver ? "dragging" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp"
                  style={{ display: "none" }}
                  onChange={(e) => e.target.files?.[0] && setUploadedFile(e.target.files[0])}
                />
                {uploadedFile && activeTab === "image" ? (
                  <div>
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 16,
                        background: "rgba(13,148,136,0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 14px",
                        border: "1px solid rgba(13,148,136,0.08)",
                      }}
                    >
                      <Image size={24} color="#0D9488" />
                    </div>
                    <div style={{ fontWeight: 700, color: "#0F172A", marginBottom: 4, fontSize: 15 }}>{uploadedFile.name}</div>
                    <div style={{ fontSize: 13, color: "#94A3B8" }}>{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}
                      style={{
                        marginTop: 12,
                        padding: "6px 14px",
                        borderRadius: 8,
                        border: "1px solid rgba(239,68,68,0.15)",
                        background: "rgba(239,68,68,0.04)",
                        color: "#EF4444",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <X size={12} /> Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 18,
                        background: "rgba(13,148,136,0.04)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 18px",
                        border: "1px solid rgba(13,148,136,0.06)",
                      }}
                    >
                      <UploadCloud size={28} color="#94A3B8" />
                    </div>
                    <div style={{ fontWeight: 600, color: "#334155", marginBottom: 6, fontSize: 15 }}>
                      Drag & drop an image or click to upload
                    </div>
                    <div style={{ fontSize: 13, color: "#94A3B8" }}>
                      PNG, JPG, JPEG, WEBP (max 10MB)
                    </div>
                  </>
                )}
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
                {[
                  { key: "ai", label: "AI-Generated Detection" },
                  { key: "reverse", label: "Reverse Image Search" },
                  { key: "exif", label: "EXIF Metadata" },
                  { key: "ela", label: "Error Level Analysis" },
                ].map((opt) => (
                  <ToggleChip
                    key={opt.key}
                    label={opt.label}
                    enabled={imageOptions[opt.key as keyof typeof imageOptions]}
                    onToggle={() => setImageOptions((p) => ({ ...p, [opt.key]: !p[opt.key as keyof typeof imageOptions] }))}
                  />
                ))}
              </div>

              <button onClick={handleAnalyze} disabled={!canAnalyze()} className={`analyze-btn ${canAnalyze() ? "enabled" : "disabled"}`}>
                <Image size={17} />
                Analyze Image
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* ===== VIDEO TAB ===== */}
          {activeTab === "video" && (
            <div>
              <label className="section-label">
                <Video size={15} style={{ display: "inline", verticalAlign: "middle", marginRight: 8, color: "#0D9488" }} />
                Upload Video
              </label>
              <div
                className={`drop-zone ${dragOver ? "dragging" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                <input ref={fileRef} type="file" accept=".mp4,.mov,.avi,.webm" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && setUploadedFile(e.target.files[0])} />
                {uploadedFile && activeTab === "video" ? (
                  <div>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(245,158,11,0.06)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", border: "1px solid rgba(245,158,11,0.08)" }}>
                      <Video size={24} color="#F59E0B" />
                    </div>
                    <div style={{ fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>{uploadedFile.name}</div>
                    <div style={{ fontSize: 13, color: "#94A3B8" }}>{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                ) : (
                  <>
                    <div style={{ width: 64, height: 64, borderRadius: 18, background: "rgba(245,158,11,0.04)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", border: "1px solid rgba(245,158,11,0.06)" }}>
                      <Video size={28} color="#94A3B8" />
                    </div>
                    <div style={{ fontWeight: 600, color: "#334155", marginBottom: 6 }}>Drag & drop a video or click to upload</div>
                    <div style={{ fontSize: 13, color: "#94A3B8" }}>MP4, MOV, AVI, WEBM (max 100MB)</div>
                  </>
                )}
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
                {[
                  { key: "deepfake", label: "Deepfake Detection" },
                  { key: "aiGen", label: "AI-Generated" },
                  { key: "frameByFrame", label: "Frame Analysis" },
                  { key: "audio", label: "Audio Extraction" },
                  { key: "lipsync", label: "Lip-Sync Check" },
                ].map((opt) => (
                  <ToggleChip
                    key={opt.key}
                    label={opt.label}
                    enabled={videoOptions[opt.key as keyof typeof videoOptions]}
                    onToggle={() => setVideoOptions((p) => ({ ...p, [opt.key]: !p[opt.key as keyof typeof videoOptions] }))}
                  />
                ))}
              </div>

              <button onClick={handleAnalyze} disabled={!canAnalyze()} className={`analyze-btn ${canAnalyze() ? "enabled" : "disabled"}`}>
                <Video size={17} />
                Analyze Video
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* ===== AUDIO TAB ===== */}
          {activeTab === "audio" && (
            <div>
              <label className="section-label">
                <Mic size={15} style={{ display: "inline", verticalAlign: "middle", marginRight: 8, color: "#0D9488" }} />
                Upload Audio
              </label>
              <div
                className={`drop-zone ${dragOver ? "dragging" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                <input ref={fileRef} type="file" accept=".mp3,.wav,.m4a,.ogg,.flac" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && setUploadedFile(e.target.files[0])} />
                {uploadedFile && activeTab === "audio" ? (
                  <div>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(16,185,129,0.06)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", border: "1px solid rgba(16,185,129,0.08)" }}>
                      <Mic size={24} color="#10B981" />
                    </div>
                    <div style={{ fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>{uploadedFile.name}</div>
                    <div style={{ fontSize: 13, color: "#94A3B8", marginBottom: 12 }}>{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 2, justifyContent: "center" }}>
                      {Array.from({ length: 40 }, (_, i) => (
                        <div key={i} style={{ width: 3, height: 8 + Math.random() * 24, background: "linear-gradient(180deg, #0D9488, #10B981)", borderRadius: 2, opacity: 0.6 }} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ width: 64, height: 64, borderRadius: 18, background: "rgba(16,185,129,0.04)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", border: "1px solid rgba(16,185,129,0.06)" }}>
                      <Mic size={28} color="#94A3B8" />
                    </div>
                    <div style={{ fontWeight: 600, color: "#334155", marginBottom: 6 }}>Drag & drop audio or click to upload</div>
                    <div style={{ fontSize: 13, color: "#94A3B8" }}>MP3, WAV, M4A, OGG, FLAC (max 50MB)</div>
                  </>
                )}
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
                {[
                  { key: "aiVoice", label: "AI Voice Detection" },
                  { key: "cloning", label: "Voice Cloning" },
                  { key: "spectrogram", label: "Spectrogram" },
                  { key: "splice", label: "Splice Detection" },
                  { key: "transcription", label: "Transcription" },
                ].map((opt) => (
                  <ToggleChip
                    key={opt.key}
                    label={opt.label}
                    enabled={audioOptions[opt.key as keyof typeof audioOptions]}
                    onToggle={() => setAudioOptions((p) => ({ ...p, [opt.key]: !p[opt.key as keyof typeof audioOptions] }))}
                  />
                ))}
              </div>

              <button onClick={handleAnalyze} disabled={!canAnalyze()} className={`analyze-btn ${canAnalyze() ? "enabled" : "disabled"}`}>
                <Mic size={17} />
                Analyze Audio
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* ===== RECENT ANALYSES ===== */}
        <div style={{ animation: "fadeInUp 0.7s cubic-bezier(0.23,1,0.32,1) 0.5s both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: "rgba(13,148,136,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(13,148,136,0.08)",
              }}
            >
              <Zap size={15} color="#0D9488" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.3px" }}>Recent Analyses</h3>
          </div>

          {loadingRecent ? (
            <div
              style={{
                textAlign: "center",
                padding: "48px",
                background: "rgba(255,255,255,0.4)",
                backdropFilter: "blur(12px)",
                borderRadius: 18,
                border: "1px solid rgba(226,232,240,0.4)",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  border: "3px solid rgba(13,148,136,0.12)",
                  borderTopColor: "#0D9488",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  margin: "0 auto 14px",
                }}
              />
              <div style={{ fontSize: 14, color: "#94A3B8" }}>Loading recent analyses...</div>
            </div>
          ) : recentAnalyses.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "48px",
                background: "rgba(255,255,255,0.4)",
                backdropFilter: "blur(12px)",
                borderRadius: 18,
                border: "1px solid rgba(226,232,240,0.4)",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "rgba(13,148,136,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 14px",
                  border: "1px solid rgba(13,148,136,0.06)",
                }}
              >
                <Sparkles size={22} color="#94A3B8" />
              </div>
              <div style={{ fontSize: 14, color: "#94A3B8", fontWeight: 500 }}>No analyses yet. Start analyzing content above!</div>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 12 }}>
              {recentAnalyses.slice(0, 6).map((item, i) => {
                const color = getVerdictColor(item.verdict);
                const icon = getTypeIcon(item.type);
                return (
                  <div
                    key={item.id}
                    className="recent-card"
                    onClick={() => {
                      sessionStorage.setItem("analysisId", item.id);
                      navigate("/results");
                    }}
                    style={{ animationDelay: `${i * 0.08}s`, animation: `recentCardIn 0.5s cubic-bezier(0.23,1,0.32,1) ${i * 0.08}s both` }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 9,
                          background: "rgba(241,245,249,0.6)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#64748B",
                          border: "1px solid rgba(226,232,240,0.4)",
                        }}
                      >
                        {icon}
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: color,
                          backgroundColor: `${color}0A`,
                          border: `1px solid ${color}15`,
                          borderRadius: 6,
                          padding: "3px 8px",
                          letterSpacing: "0.3px",
                        }}
                      >
                        {item.verdict}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: 12,
                        color: "#334155",
                        lineHeight: 1.55,
                        marginBottom: 12,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        fontWeight: 500,
                      }}
                    >
                      {item.input_preview}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div
                        style={{
                          flex: 1,
                          height: 5,
                          background: "rgba(241,245,249,0.6)",
                          borderRadius: 3,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${item.trust_score}%`,
                            background: `linear-gradient(90deg, ${color}, ${color}CC)`,
                            borderRadius: 3,
                            transition: "width 0.6s ease",
                          }}
                        />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color }}>{item.trust_score}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}