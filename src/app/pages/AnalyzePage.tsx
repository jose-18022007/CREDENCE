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
  CheckCircle,
  Clock,
  Globe,
  Newspaper,
  Check,
} from "lucide-react";

const NAVY = "#1E3A5F";
const TEAL = "#0D9488";
const RED = "#DC2626";
const AMBER = "#D97706";
const GREEN = "#059669";
const BORDER = "#E2E8F0";
const BG_LIGHT = "#F8FAFC";
const TEXT = "#1E293B";
const TEXT_MUTED = "#64748B";

const TABS = [
  { id: "text", label: "Text", emoji: "", icon: <FileText size={15} /> },
  { id: "url", label: "URL", emoji: "", icon: <Link2 size={15} /> },
  { id: "image", label: "Image", emoji: "", icon: <Image size={15} /> },
  { id: "video", label: "Video", emoji: "", icon: <Video size={15} /> },
  { id: "audio", label: "Audio", emoji: "", icon: <Mic size={15} /> },
];

const STEPS = [
  "Extracting text",
  "Checking source",
  "Verifying claims",
  "Analyzing media",
  "Generating report",
];

const RECENT_ANALYSES = [
  { type: "url", icon: <Globe size={14} />, title: "Breaking: New climate report shows...", score: 72, verdict: "Credible", color: GREEN },
  { type: "text", icon: <FileText size={14} />, title: "Scientists discover cure for all...", score: 18, verdict: "Fake", color: RED },
  { type: "image", icon: <Image size={14} />, title: "Viral protest photo from 2024", score: 41, verdict: "Suspicious", color: AMBER },
  { type: "url", icon: <Globe size={14} />, title: "Government announces new policy...", score: 88, verdict: "Verified", color: GREEN },
  { type: "text", icon: <Newspaper size={14} />, title: "Shocking celebrity scandal truth...", score: 22, verdict: "Fake", color: RED },
  { type: "audio", icon: <Mic size={14} />, title: "Leaked audio from White House...", score: 35, verdict: "Suspicious", color: AMBER },
];

function ToggleChip({ label, enabled, onToggle }: { label: string; enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        borderRadius: 20,
        border: `1.5px solid ${enabled ? TEAL : BORDER}`,
        backgroundColor: enabled ? "#F0FDFA" : "#FFFFFF",
        color: enabled ? TEAL : TEXT_MUTED,
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {enabled && <Check size={12} strokeWidth={2.5} />}
      {label}
    </button>
  );
}

function ProcessingOverlay({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= STEPS.length - 1) {
          clearInterval(interval);
          setTimeout(onComplete, 600);
          return prev;
        }
        return prev + 1;
      });
    }, 700);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          padding: "48px 52px",
          maxWidth: 520,
          width: "90%",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            backgroundColor: "#EFF6FF",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              border: `3px solid ${NAVY}`,
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Analyzing Content...</h3>
        <p style={{ fontSize: 14, color: TEXT_MUTED, marginBottom: 36 }}>Please wait while our AI processes your content</p>

        {/* Stepper */}
        <div style={{ textAlign: "left" }}>
          {STEPS.map((step, i) => (
            <div
              key={step}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 0",
                borderBottom: i < STEPS.length - 1 ? `1px solid ${BORDER}` : "none",
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  backgroundColor: i < currentStep ? GREEN : i === currentStep ? NAVY : "#F1F5F9",
                  transition: "background-color 0.3s",
                }}
              >
                {i < currentStep ? (
                  <Check size={12} color="#FFFFFF" strokeWidth={3} />
                ) : i === currentStep ? (
                  <div style={{ width: 8, height: 8, backgroundColor: "#FFFFFF", borderRadius: "50%" }} />
                ) : null}
              </div>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: i <= currentStep ? 600 : 400,
                  color: i < currentStep ? GREEN : i === currentStep ? NAVY : TEXT_MUTED,
                  transition: "color 0.3s",
                }}
              >
                {step}
                {i === currentStep && "..."}
              </span>
              {i < currentStep && (
                <span style={{ marginLeft: "auto", fontSize: 12, color: GREEN, fontWeight: 600 }}>Done</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AnalyzePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [textOptions, setTextOptions] = useState({ bias: true, deep: false, fallacies: false });
  const [imageOptions, setImageOptions] = useState({ ai: true, reverse: true, exif: true, ela: true });
  const [videoOptions, setVideoOptions] = useState({ deepfake: true, aiGen: true, frameByFrame: true, audio: true, lipsync: true });
  const [audioOptions, setAudioOptions] = useState({ aiVoice: true, cloning: true, spectrogram: true, splice: true, transcription: true });

  const handleAnalyze = () => {
    setAnalyzing(true);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setUploadedFile(file);
  }, []);

  const urlPreview = url.length > 8 ? {
    title: "Article: " + url.replace(/https?:\/\//i, "").slice(0, 40),
    domain: url.replace(/https?:\/\//i, "").split("/")[0],
  } : null;

  return (
    <div style={{ backgroundColor: "#FFFFFF", minHeight: "100vh", color: TEXT }}>
      {analyzing && <ProcessingOverlay onComplete={() => navigate("/results")} />}

      {/* Header */}
      <section style={{ padding: "56px 24px 40px", backgroundColor: BG_LIGHT, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, color: NAVY, marginBottom: 12, letterSpacing: "-0.5px" }}>
            Analyze Content
          </h1>
          <p style={{ fontSize: 16, color: TEXT_MUTED }}>
            Upload any content type and get an instant integrity report
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>
        {/* Tab Bar */}
        <div
          style={{
            display: "flex",
            gap: 8,
            backgroundColor: "#F1F5F9",
            borderRadius: 12,
            padding: 4,
            marginBottom: 36,
            overflowX: "auto",
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                minWidth: 90,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                padding: "10px 16px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: activeTab === tab.id ? 600 : 500,
                backgroundColor: activeTab === tab.id ? "#FFFFFF" : "transparent",
                color: activeTab === tab.id ? NAVY : TEXT_MUTED,
                boxShadow: activeTab === tab.id ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s",
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: `1px solid ${BORDER}`,
            borderRadius: 16,
            padding: "32px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            marginBottom: 40,
          }}
        >
          {/* TEXT TAB */}
          {activeTab === "text" && (
            <div>
              <label style={{ display: "block", fontWeight: 600, color: NAVY, marginBottom: 10, fontSize: 15 }}>
                Paste Text Content
              </label>
              <div style={{ position: "relative" }}>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste the news article, claim, social media post, or any text you want to verify..."
                  rows={8}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    border: `1.5px solid ${BORDER}`,
                    borderRadius: 10,
                    fontSize: 14,
                    color: TEXT,
                    resize: "vertical",
                    outline: "none",
                    lineHeight: 1.65,
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                    backgroundColor: "#FAFAFA",
                  }}
                />
                <div style={{ position: "absolute", bottom: 10, right: 12, fontSize: 12, color: TEXT_MUTED }}>
                  {text.length} characters
                </div>
              </div>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginTop: 16, marginBottom: 20 }}>
                {[
                  { key: "bias", label: "Check for political bias" },
                  { key: "deep", label: "Deep fact-check mode" },
                  { key: "fallacies", label: "Check for logical fallacies" },
                ].map((opt) => (
                  <label key={opt.key} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, color: TEXT }}>
                    <input
                      type="checkbox"
                      checked={textOptions[opt.key as keyof typeof textOptions]}
                      onChange={() => setTextOptions((p) => ({ ...p, [opt.key]: !p[opt.key as keyof typeof textOptions] }))}
                      style={{ width: 15, height: 15, accentColor: NAVY, cursor: "pointer" }}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
              <button
                onClick={handleAnalyze}
                disabled={!text.trim()}
                style={{
                  width: "100%",
                  padding: "14px",
                  backgroundColor: text.trim() ? NAVY : "#CBD5E1",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: text.trim() ? "pointer" : "not-allowed",
                  transition: "background-color 0.15s",
                }}
              >
                Analyze Text
              </button>
            </div>
          )}

          {/* URL TAB */}
          {activeTab === "url" && (
            <div>
              <label style={{ display: "block", fontWeight: 600, color: NAVY, marginBottom: 10, fontSize: 15 }}>
                Article or Page URL
              </label>
              <div style={{ position: "relative", marginBottom: 16 }}>
                <Link2 size={16} color={TEXT_MUTED} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste the article URL here... e.g., https://example.com/article"
                  style={{
                    width: "100%",
                    padding: "13px 14px 13px 40px",
                    border: `1.5px solid ${BORDER}`,
                    borderRadius: 10,
                    fontSize: 14,
                    color: TEXT,
                    outline: "none",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                    backgroundColor: "#FAFAFA",
                  }}
                />
              </div>

              {urlPreview && (
                <div
                  style={{
                    border: `1px solid ${BORDER}`,
                    borderRadius: 10,
                    padding: "14px 16px",
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    backgroundColor: BG_LIGHT,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: "#EFF6FF",
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Globe size={18} color={NAVY} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>{urlPreview.title}</div>
                    <div style={{ fontSize: 12, color: TEXT_MUTED }}>{urlPreview.domain}</div>
                  </div>
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={!url.trim()}
                style={{
                  width: "100%",
                  padding: "14px",
                  backgroundColor: url.trim() ? NAVY : "#CBD5E1",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: url.trim() ? "pointer" : "not-allowed",
                  marginBottom: 12,
                  transition: "background-color 0.15s",
                }}
              >
                Analyze URL
              </button>
              <p style={{ fontSize: 13, color: TEXT_MUTED, textAlign: "center" }}>
                We'll scrape the content, check source credibility, and verify all claims
              </p>
            </div>
          )}

          {/* IMAGE TAB */}
          {activeTab === "image" && (
            <div>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? TEAL : BORDER}`,
                  borderRadius: 12,
                  padding: "48px 24px",
                  textAlign: "center",
                  cursor: "pointer",
                  backgroundColor: dragOver ? "#F0FDFA" : "#FAFAFA",
                  marginBottom: 20,
                  transition: "all 0.15s",
                }}
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
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🖼️</div>
                    <div style={{ fontWeight: 600, color: NAVY, marginBottom: 4 }}>{uploadedFile.name}</div>
                    <div style={{ fontSize: 13, color: TEXT_MUTED }}>{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                ) : (
                  <>
                    <UploadCloud size={40} color={TEXT_MUTED} style={{ margin: "0 auto 14px" }} />
                    <div style={{ fontWeight: 600, color: TEXT, marginBottom: 6 }}>Drag & drop an image or click to upload</div>
                    <div style={{ fontSize: 13, color: TEXT_MUTED }}>Supported: PNG, JPG, JPEG, WEBP (max 10MB)</div>
                  </>
                )}
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                {[
                  { key: "ai", label: "AI-Generated Detection" },
                  { key: "reverse", label: "Reverse Image Search" },
                  { key: "exif", label: "EXIF Metadata Analysis" },
                  { key: "ela", label: "Error Level Analysis (ELA)" },
                ].map((opt) => (
                  <ToggleChip
                    key={opt.key}
                    label={opt.label}
                    enabled={imageOptions[opt.key as keyof typeof imageOptions]}
                    onToggle={() => setImageOptions((p) => ({ ...p, [opt.key]: !p[opt.key as keyof typeof imageOptions] }))}
                  />
                ))}
              </div>

              <button
                onClick={handleAnalyze}
                style={{
                  width: "100%",
                  padding: "14px",
                  backgroundColor: NAVY,
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Analyze Image
              </button>
            </div>
          )}

          {/* VIDEO TAB */}
          {activeTab === "video" && (
            <div>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? TEAL : BORDER}`,
                  borderRadius: 12,
                  padding: "48px 24px",
                  textAlign: "center",
                  cursor: "pointer",
                  backgroundColor: dragOver ? "#F0FDFA" : "#FAFAFA",
                  marginBottom: 20,
                  transition: "all 0.15s",
                }}
              >
                <input ref={fileRef} type="file" accept=".mp4,.mov,.avi,.webm" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && setUploadedFile(e.target.files[0])} />
                {uploadedFile && activeTab === "video" ? (
                  <div>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🎬</div>
                    <div style={{ fontWeight: 600, color: NAVY, marginBottom: 4 }}>{uploadedFile.name}</div>
                    <div style={{ fontSize: 13, color: TEXT_MUTED }}>{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                ) : (
                  <>
                    <Video size={40} color={TEXT_MUTED} style={{ margin: "0 auto 14px" }} />
                    <div style={{ fontWeight: 600, color: TEXT, marginBottom: 6 }}>Drag & drop a video or click to upload</div>
                    <div style={{ fontSize: 13, color: TEXT_MUTED }}>Supported: MP4, MOV, AVI, WEBM (max 100MB)</div>
                  </>
                )}
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                {[
                  { key: "deepfake", label: "Deepfake Face Detection" },
                  { key: "aiGen", label: "AI-Generated Video Detection" },
                  { key: "frameByFrame", label: "Frame-by-Frame Analysis" },
                  { key: "audio", label: "Audio Track Extraction" },
                  { key: "lipsync", label: "Lip-Sync Verification" },
                ].map((opt) => (
                  <ToggleChip
                    key={opt.key}
                    label={opt.label}
                    enabled={videoOptions[opt.key as keyof typeof videoOptions]}
                    onToggle={() => setVideoOptions((p) => ({ ...p, [opt.key]: !p[opt.key as keyof typeof videoOptions] }))}
                  />
                ))}
              </div>

              <button
                onClick={handleAnalyze}
                style={{ width: "100%", padding: "14px", backgroundColor: NAVY, color: "#FFFFFF", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer" }}
              >
                Analyze Video
              </button>
            </div>
          )}

          {/* AUDIO TAB */}
          {activeTab === "audio" && (
            <div>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? TEAL : BORDER}`,
                  borderRadius: 12,
                  padding: "48px 24px",
                  textAlign: "center",
                  cursor: "pointer",
                  backgroundColor: dragOver ? "#F0FDFA" : "#FAFAFA",
                  marginBottom: 16,
                  transition: "all 0.15s",
                }}
              >
                <input ref={fileRef} type="file" accept=".mp3,.wav,.m4a,.ogg,.flac" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && setUploadedFile(e.target.files[0])} />
                {uploadedFile && activeTab === "audio" ? (
                  <div>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🎵</div>
                    <div style={{ fontWeight: 600, color: NAVY, marginBottom: 4 }}>{uploadedFile.name}</div>
                    <div style={{ fontSize: 13, color: TEXT_MUTED }}>{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                    {/* Fake waveform */}
                    <div style={{ display: "flex", alignItems: "center", gap: 2, justifyContent: "center", marginTop: 12 }}>
                      {Array.from({ length: 40 }, (_, i) => (
                        <div key={i} style={{ width: 3, height: 8 + Math.random() * 24, backgroundColor: TEAL, borderRadius: 2, opacity: 0.7 }} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <Mic size={40} color={TEXT_MUTED} style={{ margin: "0 auto 14px" }} />
                    <div style={{ fontWeight: 600, color: TEXT, marginBottom: 6 }}>Drag & drop an audio file or click to upload</div>
                    <div style={{ fontSize: 13, color: TEXT_MUTED }}>Supported: MP3, WAV, M4A, OGG, FLAC (max 50MB)</div>
                  </>
                )}
              </div>

              <button
                onClick={handleAnalyze}
                style={{
                  display: "flex", alignItems: "center", gap: 8, margin: "0 auto 16px",
                  padding: "10px 20px", backgroundColor: "#FEF2F2", color: RED, border: `1.5px solid #FECACA`, borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}
              >
                <span style={{ width: 8, height: 8, backgroundColor: RED, borderRadius: "50%" }} />
                Record Audio
              </button>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                {[
                  { key: "aiVoice", label: "AI Voice Detection" },
                  { key: "cloning", label: "Voice Cloning Detection" },
                  { key: "spectrogram", label: "Spectrogram Analysis" },
                  { key: "splice", label: "Audio Splice Detection" },
                  { key: "transcription", label: "Transcription + Claim Analysis" },
                ].map((opt) => (
                  <ToggleChip
                    key={opt.key}
                    label={opt.label}
                    enabled={audioOptions[opt.key as keyof typeof audioOptions]}
                    onToggle={() => setAudioOptions((p) => ({ ...p, [opt.key]: !p[opt.key as keyof typeof audioOptions] }))}
                  />
                ))}
              </div>

              <button
                onClick={handleAnalyze}
                style={{ width: "100%", padding: "14px", backgroundColor: NAVY, color: "#FFFFFF", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer" }}
              >
                Analyze Audio
              </button>
            </div>
          )}
        </div>

        {/* Recent Analyses */}
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: NAVY, marginBottom: 16 }}>Recent Analyses</h3>
          <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8 }}>
            {RECENT_ANALYSES.map((item, i) => (
              <div
                key={i}
                onClick={() => navigate("/results")}
                style={{
                  flexShrink: 0,
                  width: 200,
                  backgroundColor: "#FFFFFF",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 12,
                  padding: "16px",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  transition: "box-shadow 0.15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      backgroundColor: BG_LIGHT,
                      borderRadius: 6,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: TEXT_MUTED,
                    }}
                  >
                    {item.icon}
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: item.color,
                      backgroundColor: `${item.color}15`,
                      borderRadius: 4,
                      padding: "2px 7px",
                    }}
                  >
                    {item.verdict}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: TEXT, lineHeight: 1.5, marginBottom: 10, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                  {item.title}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ flex: 1, height: 4, backgroundColor: "#F1F5F9", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${item.score}%`, backgroundColor: item.color, borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{item.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}