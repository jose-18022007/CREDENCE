import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Shield,
  Search,
  Globe,
  Image,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
  Scan,
  Eye,
  Layers,
  BookOpen,
  MessageSquare,
  Lightbulb,
  Link2,
  FileWarning,
  ShieldCheck,
  ShieldX,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Quote,
  FileText,
  Copy,
  Check,
  HelpCircle,
  ShieldAlert,
} from "lucide-react";
import type { AnalysisResponse } from "../../services/api";

/* ============================== */
/* ===== HELPERS ===== */
/* ============================== */

// OVERALL page verdict — binary: Real or Fake (for the big hero)
function getVerdictTheme(verdict: string) {
  const v = verdict.toUpperCase();
  
  // Special handling for AI-generated image verdicts
  if (v.includes("AI_GENERATED_IMAGE_TRUE_CONTENT")) {
    return {
      color: "#F59E0B",
      bg: "rgba(245,158,11,0.04)",
      border: "rgba(245,158,11,0.12)",
      icon: <ShieldAlert size={28} />,
      label: "AI-generated image, but text content is credible",
      isFake: false,
    };
  }
  
  if (v.includes("AI_GENERATED_IMAGE_MIXED_CONTENT")) {
    return {
      color: "#F59E0B",
      bg: "rgba(245,158,11,0.04)",
      border: "rgba(245,158,11,0.12)",
      icon: <ShieldAlert size={28} />,
      label: "AI-generated image with questionable content",
      isFake: true,
    };
  }
  
  if (v.includes("AI_GENERATED_IMAGE_FALSE_CONTENT")) {
    return {
      color: "#EF4444",
      bg: "rgba(239,68,68,0.04)",
      border: "rgba(239,68,68,0.12)",
      icon: <ShieldX size={28} />,
      label: "AI-generated image with false content",
      isFake: true,
    };
  }
  
  if (v.includes("TRUE") || v.includes("VERIFIED") || v.includes("CREDIBLE"))
    return {
      color: "#10B981",
      bg: "rgba(16,185,129,0.04)",
      border: "rgba(16,185,129,0.12)",
      icon: <ShieldCheck size={28} />,
      label: "This news is real and verified",
      isFake: false,
    };
  return {
    color: "#EF4444",
    bg: "rgba(239,68,68,0.04)",
    border: "rgba(239,68,68,0.12)",
    icon: <ShieldX size={28} />,
    label: "This news is fake",
    isFake: true,
  };
}

// INDIVIDUAL CLAIM — show the raw API verdict with appropriate color
// No mapping to Real/Fake — show exactly what API returns
function getClaimTheme(verdict: string) {
  const v = (verdict || "UNVERIFIED").toUpperCase();

  // TRUE / VERIFIED / CONFIRMED → green
  if (v.includes("TRUE") || v === "VERIFIED" || v.includes("CONFIRMED") || v.includes("ACCURATE"))
    return { color: "#10B981", icon: <CheckCircle size={15} />, bg: "rgba(16,185,129,0.04)" };

  // FALSE / FAKE / FABRICATED → red
  if (v.includes("FALSE") || v.includes("FAKE") || v.includes("FABRICAT") || v.includes("DEBUNKED"))
    return { color: "#EF4444", icon: <XCircle size={15} />, bg: "rgba(239,68,68,0.04)" };

  // MISLEADING / PARTIALLY → amber
  if (v.includes("MISLEAD") || v.includes("PARTIAL") || v.includes("HALF") || v.includes("MIXED"))
    return { color: "#F59E0B", icon: <AlertTriangle size={15} />, bg: "rgba(245,158,11,0.04)" };

  // SUSPICIOUS → amber-red
  if (v.includes("SUSPICIOUS") || v.includes("SUSPECT") || v.includes("DOUBT"))
    return { color: "#F59E0B", icon: <ShieldAlert size={15} />, bg: "rgba(245,158,11,0.04)" };

  // UNVERIFIED / NEEDS CONTEXT / UNKNOWN / anything else → gray-blue
  return { color: "#6366F1", icon: <HelpCircle size={15} />, bg: "rgba(99,102,241,0.04)" };
}

// Clean the verdict text for display
function formatVerdict(verdict: string): string {
  return (verdict || "UNVERIFIED").replace(/_/g, " ").toUpperCase();
}

/* ============================== */
/* ===== INPUT PREVIEW ===== */
/* ============================== */
function InputPreview({ data }: { data: AnalysisResponse }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const inputType = data.analysis_type || "text";
  const inputContent = data.input_text || data.input_url || data.input_preview || "";

  if (!inputContent) return null;

  const isLong = inputContent.length > 300;
  const displayText = expanded ? inputContent : inputContent.slice(0, 300);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inputContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* */ }
  };

  return (
    <div style={{ animation: "fadeInUp 0.6s cubic-bezier(0.23,1,0.32,1) 0.68s both" }}>
      <div className="glass-panel" style={{ padding: "28px 34px", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(13,148,136,0.06)", border: "1px solid rgba(13,148,136,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {inputType === "url" ? <Globe size={16} color="#0D9488" /> : inputType === "image" ? <Image size={16} color="#0D9488" /> : <FileText size={16} color="#0D9488" />}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.2px" }}>
                {inputType === "url" ? "Analyzed URL" : inputType === "image" ? "Analyzed Image" : "Analyzed Text"}
              </div>
              {inputType !== "url" && (
                <div style={{ fontSize: 12, color: "#94A3B8" }}>{inputContent.length} characters</div>
              )}
            </div>
          </div>
          <button onClick={handleCopy} className="copy-btn" style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10, border: "1px solid rgba(226,232,240,0.4)", background: copied ? "rgba(16,185,129,0.06)" : "rgba(241,245,249,0.5)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", cursor: "pointer", fontSize: 12, fontWeight: 600, color: copied ? "#10B981" : "#64748B", transition: "all 0.3s ease" }}>
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <div style={{ background: "rgba(241,245,249,0.4)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", border: "1px solid rgba(226,232,240,0.35)", borderRadius: 14, padding: "18px 20px" }}>
          {inputType === "url" ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Globe size={16} color="#0D9488" style={{ flexShrink: 0 }} />
              <a href={inputContent} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: "#0D9488", textDecoration: "none", fontWeight: 500, wordBreak: "break-all", lineHeight: 1.5 }}>
                {inputContent}
              </a>
              <ExternalLink size={13} color="#94A3B8" style={{ flexShrink: 0 }} />
            </div>
          ) : (
            <>
              <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {displayText}
                {isLong && !expanded && <span style={{ color: "#94A3B8" }}>...</span>}
              </p>
              {isLong && (
                <button onClick={() => setExpanded(!expanded)} style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 14, padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(13,148,136,0.1)", background: "rgba(13,148,136,0.04)", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#0D9488", transition: "all 0.25s ease" }}>
                  {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  {expanded ? "Show less" : "Show full text"}
                </button>
              )}
            </>
          )}
        </div>

        {/* Source info for URLs */}
        {inputType === "url" && data.source_credibility?.domain && (
          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", background: "rgba(241,245,249,0.35)", borderRadius: 12, border: "1px solid rgba(226,232,240,0.3)" }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(13,148,136,0.06)", border: "1px solid rgba(13,148,136,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Globe size={15} color="#0D9488" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{data.source_credibility.domain}</div>
              <div style={{ fontSize: 12, color: "#94A3B8" }}>
                {data.source_credibility.domain_age && `Domain age: ${data.source_credibility.domain_age}`}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================== */
/* ===== RESULTS PAGE ===== */
/* ============================== */
export function ResultsPage() {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("latestAnalysis");
    if (stored) {
      try { setAnalysisData(JSON.parse(stored)); }
      catch { navigate("/analyze"); }
    } else { navigate("/analyze"); }
  }, [navigate]);

  if (!analysisData) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#FAFBFF" }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 44, height: 44, border: "3px solid rgba(13,148,136,0.12)", borderTopColor: "#0D9488", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 18px" }} />
          <div style={{ fontSize: 16, fontWeight: 600, color: "#0F172A" }}>Loading results...</div>
        </div>
      </div>
    );
  }

  const verdict = analysisData.verdict;
  const theme = getVerdictTheme(verdict);
  const claims = analysisData.claim_verification?.claims || [];
  const articles = analysisData.cross_reference?.related_articles || [];
  const redFlags = analysisData.red_flags || [];
  
  // Debug: Log cross_reference data
  console.log("Cross Reference Data:", analysisData.cross_reference);
  console.log("Related Articles:", articles);
  const hasMedia = analysisData.media_integrity && (
    analysisData.media_integrity.ai_generated_probability !== null ||
    analysisData.media_integrity.deepfake_probability !== null ||
    analysisData.media_integrity.exif_data ||
    analysisData.media_integrity.ela_result ||
    analysisData.media_integrity.ai_voice_probability !== null
  );

  return (
    <div style={{ backgroundColor: "#FAFBFF", minHeight: "100vh", color: "#1E293B", overflowX: "hidden" }}>
      <style>{`
        @keyframes fadeInUp{from{opacity:0;transform:translateY(35px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeInScale{from{opacity:0;transform:scale(0.93)}to{opacity:1;transform:scale(1)}}
        @keyframes slideInLeft{from{opacity:0;transform:translateX(-25px)}to{opacity:1;transform:translateX(0)}}
        @keyframes shimmer{0%{left:-150%}100%{left:150%}}
        @keyframes orbFloat{0%,100%{transform:translate(0,0) scale(1);opacity:0.6}33%{transform:translate(30px,-20px) scale(1.08);opacity:0.8}66%{transform:translate(-20px,15px) scale(0.95);opacity:0.5}}
        @keyframes scanV{0%{transform:translateY(-100%);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translateY(100%);opacity:0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes verdictPop{from{opacity:0;transform:scale(0.6) rotate(-5deg)}to{opacity:1;transform:scale(1) rotate(0deg)}}
        @keyframes claimSlide{from{opacity:0;transform:translateX(-30px) scale(0.97)}to{opacity:1;transform:translateX(0) scale(1)}}
        @keyframes gridPulse{0%,100%{opacity:.3}50%{opacity:.7}}
        @keyframes verdictGlow{0%,100%{box-shadow:0 0 30px var(--glow,rgba(0,0,0,0.05))}50%{box-shadow:0 0 50px var(--glow,rgba(0,0,0,0.1))}}

        .grid-r{position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:0}
        .grid-r::before{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(15,23,42,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(15,23,42,0.025) 1px,transparent 1px);background-size:60px 60px}
        .grid-r::after{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(13,148,136,0.012) 1px,transparent 1px),linear-gradient(90deg,rgba(13,148,136,0.012) 1px,transparent 1px);background-size:180px 180px}

        .glass-panel{background:rgba(255,255,255,0.58);backdrop-filter:blur(24px) saturate(190%);-webkit-backdrop-filter:blur(24px) saturate(190%);border:1px solid rgba(255,255,255,0.6);border-radius:24px;box-shadow:0 6px 32px rgba(0,0,0,0.03),inset 0 1px 0 rgba(255,255,255,0.85);position:relative;overflow:hidden}
        .glass-sm{background:rgba(255,255,255,0.45);backdrop-filter:blur(14px) saturate(170%);-webkit-backdrop-filter:blur(14px) saturate(170%);border:1px solid rgba(255,255,255,0.5);border-radius:18px;box-shadow:0 4px 20px rgba(0,0,0,0.02),inset 0 1px 0 rgba(255,255,255,0.7);transition:all 0.4s cubic-bezier(0.23,1,0.32,1)}
        .glass-sm:hover{background:rgba(255,255,255,0.7);box-shadow:0 12px 40px rgba(0,0,0,0.05),inset 0 1px 0 #fff;transform:translateY(-3px)}

        .verdict-hero{padding:48px 44px;position:relative;overflow:hidden}
        .verdict-hero::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:var(--verdict-gradient)}
        .verdict-hero::after{content:'';position:absolute;inset:0;background:var(--verdict-bg);z-index:0}
        .verdict-icon-wrap{width:84px;height:84px;border-radius:26px;display:flex;align-items:center;justify-content:center;position:relative;z-index:1;transition:all 0.4s ease;animation:verdictGlow 3s ease-in-out infinite}
        .verdict-icon-wrap::after{content:'';position:absolute;inset:-8px;border-radius:30px;background:inherit;filter:blur(20px);opacity:0.25;z-index:-1}

        .claim-item{background:rgba(255,255,255,0.4);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(226,232,240,0.35);border-radius:18px;padding:24px 24px 24px 28px;margin-bottom:14px;transition:all 0.4s cubic-bezier(0.23,1,0.32,1);position:relative}
        .claim-item:hover{transform:translateY(-3px);box-shadow:0 12px 36px rgba(0,0,0,0.04);background:rgba(255,255,255,0.65)}
        .claim-border{position:absolute;left:0;top:16px;bottom:16px;width:3.5px;border-radius:3px}

        .article-card{background:rgba(255,255,255,0.4);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid rgba(226,232,240,0.35);border-radius:16px;padding:18px 22px;margin-bottom:10px;transition:all 0.35s cubic-bezier(0.23,1,0.32,1);display:flex;align-items:center;gap:16px;cursor:pointer;text-decoration:none}
        .article-card:hover{transform:translateX(6px);background:rgba(255,255,255,0.65);border-color:rgba(13,148,136,0.1);box-shadow:0 8px 28px rgba(0,0,0,0.04)}
        .article-card:hover .article-arrow{transform:translateX(4px);opacity:1}
        .article-arrow{transition:all 0.3s ease;opacity:0.4;flex-shrink:0}

        .red-flag{display:flex;align-items:start;gap:12px;padding:14px 18px;margin-bottom:8px;background:rgba(239,68,68,0.03);border:1px solid rgba(239,68,68,0.06);border-radius:14px;transition:all 0.3s ease}
        .red-flag:hover{background:rgba(239,68,68,0.06);transform:translateX(3px)}

        .back-btn{display:flex;align-items:center;gap:7px;background:rgba(255,255,255,0.5);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(226,232,240,0.4);border-radius:12px;padding:10px 20px;cursor:pointer;font-size:13px;font-weight:600;color:#64748B;transition:all 0.3s cubic-bezier(0.23,1,0.32,1)}
        .back-btn:hover{transform:translateX(-4px);background:rgba(255,255,255,0.75);color:#0D9488;border-color:rgba(13,148,136,0.12)}

        .primary-btn{display:inline-flex;align-items:center;gap:9px;padding:13px 26px;border:none;border-radius:14px;font-size:15px;font-weight:600;cursor:pointer;background:linear-gradient(135deg,#0D9488,#0F766E);color:#fff;box-shadow:0 4px 18px rgba(13,148,136,0.22);transition:all 0.35s cubic-bezier(0.23,1,0.32,1);position:relative;overflow:hidden}
        .primary-btn::before{content:'';position:absolute;top:0;left:-150%;width:120%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)}
        .primary-btn:hover{transform:translateY(-3px) scale(1.02);box-shadow:0 12px 35px rgba(13,148,136,0.3)}
        .primary-btn:hover::before{animation:shimmer 0.65s ease forwards}
        .primary-btn:active{transform:translateY(-1px) scale(1)}

        .fb-btn{display:flex;align-items:center;gap:8px;padding:11px 20px;border-radius:14px;cursor:pointer;font-size:13px;font-weight:600;background:rgba(255,255,255,0.4);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);transition:all 0.3s cubic-bezier(0.23,1,0.32,1)}
        .fb-btn:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,0.04)}

        .view-link{display:inline-flex;align-items:center;gap:7px;padding:10px 18px;border-radius:12px;font-size:13px;font-weight:600;text-decoration:none;background:linear-gradient(135deg,#0D9488,#0F766E);color:#fff;box-shadow:0 2px 12px rgba(13,148,136,0.18);transition:all 0.3s ease}
        .view-link:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(13,148,136,0.25)}

        .fc-chip{background:rgba(241,245,249,0.45);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);border-radius:12px;padding:12px 16px;margin-bottom:8px;border:1px solid rgba(226,232,240,0.3);transition:all 0.25s ease}
        .fc-chip:hover{background:rgba(255,255,255,0.5)}

        .media-detail{background:rgba(241,245,249,0.4);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);border:1px solid rgba(226,232,240,0.35);border-radius:14px;padding:16px 20px;transition:all 0.3s ease}
        .media-detail:hover{background:rgba(255,255,255,0.55);box-shadow:0 4px 16px rgba(0,0,0,0.02)}

        .section-head{display:flex;align-items:center;gap:12px;margin-bottom:22px}
        .section-head-icon{width:38px;height:38px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .section-head h3{font-size:18px;font-weight:700;color:#0F172A;letter-spacing:-0.3px;margin:0}

        .copy-btn:hover{background:rgba(13,148,136,0.06)!important;border-color:rgba(13,148,136,0.12)!important;color:#0D9488!important}
      `}</style>

      {/* BG */}
      <div className="grid-r" />
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(13,148,136,0.12), transparent)", animation: "scanV 12s linear infinite" }} />
        <div style={{ position: "absolute", top: "-12%", right: "-8%", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, ${theme.color}08 0%, transparent 55%)`, filter: "blur(80px)", animation: "orbFloat 22s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "-15%", left: "-8%", width: 550, height: 550, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.03) 0%, transparent 55%)", filter: "blur(70px)", animation: "orbFloat 28s ease-in-out infinite", animationDelay: "5s" }} />
      </div>

      {/* TOP BAR */}
      <div style={{ position: "relative", zIndex: 10, padding: "14px 24px", background: "rgba(255,255,255,0.55)", backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)", borderBottom: "1px solid rgba(226,232,240,0.35)" }}>
        <div style={{ maxWidth: 880, margin: "0 auto", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <button onClick={() => navigate("/analyze")} className="back-btn">
            <ArrowLeft size={15} /> Back
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#94A3B8" }}>
            <Scan size={13} color="#0D9488" />
            <span style={{ fontWeight: 600, color: "#64748B" }}>Analysis Report</span>
            <span style={{ color: "#CBD5E1" }}>·</span>
            <span>{new Date(analysisData.timestamp).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 880, margin: "0 auto", padding: "44px 24px 90px" }}>

        {/* VERDICT HERO */}
        <div className="glass-panel verdict-hero" style={{ "--verdict-gradient": `linear-gradient(90deg, transparent, ${theme.color}50, transparent)`, "--verdict-bg": theme.bg, marginBottom: 28, animation: "fadeInScale 0.7s cubic-bezier(0.23,1,0.32,1) both" } as React.CSSProperties}>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 32, flexWrap: "wrap" }}>
              <div className="verdict-icon-wrap" style={{ background: `linear-gradient(135deg, ${theme.color}15, ${theme.color}08)`, border: `2px solid ${theme.border}`, color: theme.color, animation: "verdictPop 0.6s cubic-bezier(0.23,1,0.32,1) 0.2s both", "--glow": `${theme.color}15` } as React.CSSProperties}>
                {theme.icon}
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 22px", borderRadius: 14, background: `${theme.color}08`, border: `1.5px solid ${theme.color}20`, marginBottom: 10, animation: "slideInLeft 0.5s cubic-bezier(0.23,1,0.32,1) 0.3s both" }}>
                  {theme.isFake ? <XCircle size={18} color={theme.color} /> : <CheckCircle size={18} color={theme.color} />}
                  <span style={{ fontSize: 18, fontWeight: 800, color: theme.color, letterSpacing: "0.5px" }}>
                    {verdict.includes("AI_GENERATED_IMAGE") ? "MIXED SIGNALS" : theme.isFake ? "FAKE NEWS" : "REAL NEWS"}
                  </span>
                </div>
                <div style={{ fontSize: 17, fontWeight: 600, color: "#0F172A", lineHeight: 1.4, letterSpacing: "-0.3px", animation: "slideInLeft 0.6s cubic-bezier(0.23,1,0.32,1) 0.35s both" }}>
                  {theme.label}
                </div>
              </div>
            </div>

            {/* AI Summary */}
            <div style={{ animation: "fadeInUp 0.7s cubic-bezier(0.23,1,0.32,1) 0.4s both" }}>
              {/* Special notice for AI-generated images with credible text */}
              {verdict.includes("AI_GENERATED_IMAGE_TRUE_CONTENT") && (
                <div style={{ display: "flex", alignItems: "start", gap: 14, padding: "18px 22px", background: "rgba(245,158,11,0.05)", border: "1.5px solid rgba(245,158,11,0.15)", borderRadius: 16, marginBottom: 20 }}>
                  <Lightbulb size={18} color="#F59E0B" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#F59E0B", marginBottom: 6, letterSpacing: "0.3px" }}>IMPORTANT CONTEXT</div>
                    <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.7, margin: 0 }}>
                      This image was created by AI, but the text content it contains appears to be accurate news. This is common when real news is illustrated with AI-generated imagery. Always verify with the original source.
                    </p>
                  </div>
                </div>
              )}
              
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <MessageSquare size={14} color="#0D9488" />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#0D9488", letterSpacing: "0.8px", textTransform: "uppercase" }}>AI Analysis</span>
              </div>
              <p style={{ fontSize: 16, color: "#334155", lineHeight: 1.85, margin: 0, fontWeight: 450 }}>
                {analysisData.summary}
              </p>
            </div>

            {/* Red Flags */}
            {theme.isFake && redFlags.length > 0 && (
              <div style={{ marginTop: 28, animation: "fadeInUp 0.7s cubic-bezier(0.23,1,0.32,1) 0.5s both" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <FileWarning size={14} color="#EF4444" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#EF4444", letterSpacing: "0.8px", textTransform: "uppercase" }}>Why this is fake</span>
                </div>
                {redFlags.slice(0, 5).map((flag, i) => (
                  <div key={i} className="red-flag" style={{ animation: `claimSlide 0.5s cubic-bezier(0.23,1,0.32,1) ${0.55 + i * 0.06}s both` }}>
                    <XCircle size={14} color="#EF4444" style={{ marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: "#475569", lineHeight: 1.6 }}>{flag}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 32, animation: "fadeInUp 0.7s cubic-bezier(0.23,1,0.32,1) 0.65s both" }}>
              <button onClick={() => navigate("/analyze")} className="primary-btn">
                <RefreshCw size={16} /> Analyze Another Content
              </button>
            </div>
          </div>
        </div>

        {/* INPUT PREVIEW */}
        <InputPreview data={analysisData} />

        {/* ===== CLAIM-BY-CLAIM ANALYSIS ===== */}
        {claims.length > 0 && (
          <div style={{ animation: "fadeInUp 0.6s cubic-bezier(0.23,1,0.32,1) 0.75s both" }}>
            <div className="glass-panel" style={{ padding: "36px 38px", marginBottom: 28 }}>
              <div className="section-head">
                <div className="section-head-icon" style={{ background: "rgba(13,148,136,0.06)", border: "1px solid rgba(13,148,136,0.08)" }}>
                  <Search size={17} color="#0D9488" />
                </div>
                <div>
                  <h3>Claim-by-Claim Analysis</h3>
                  <p style={{ fontSize: 13, color: "#94A3B8", margin: "4px 0 0" }}>Each claim was individually checked against fact-check databases and real-time sources</p>
                </div>
              </div>

              {claims.map((claim: any, i: number) => {
                const ct = getClaimTheme(claim.verdict);
                const verdictText = formatVerdict(claim.verdict);

                return (
                  <div
                    key={i}
                    className="claim-item"
                    style={{
                      borderLeft: `3.5px solid ${ct.color}`,
                      animation: `claimSlide 0.5s cubic-bezier(0.23,1,0.32,1) ${0.8 + i * 0.08}s both`,
                    }}
                  >
                    <div className="claim-border" style={{ background: `linear-gradient(180deg, ${ct.color}, ${ct.color}60)`, boxShadow: `0 0 8px ${ct.color}20` }} />

                    {/* RAW API VERDICT — shown exactly as returned */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                      <span style={{ color: ct.color, display: "flex" }}>{ct.icon}</span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: ct.color,
                          background: ct.bg,
                          border: `1.5px solid ${ct.color}18`,
                          borderRadius: 10,
                          padding: "6px 16px",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {verdictText}
                      </span>
                    </div>

                    {/* The claim itself */}
                    <div style={{ display: "flex", alignItems: "start", gap: 10, marginBottom: 14 }}>
                      <Quote size={15} color="#CBD5E1" style={{ marginTop: 3, flexShrink: 0 }} />
                      <p style={{ fontSize: 15, fontWeight: 600, color: "#0F172A", lineHeight: 1.6, margin: 0 }}>
                        {claim.claim_text}
                      </p>
                    </div>

                    {/* REASONING — explains WHY this verdict */}
                    {claim.reasoning && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "start",
                          gap: 10,
                          padding: "14px 18px",
                          background: ct.bg,
                          border: `1px solid ${ct.color}0A`,
                          borderRadius: 12,
                          marginTop: 4,
                        }}
                      >
                        <Lightbulb size={14} color={ct.color} style={{ marginTop: 2, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: ct.color, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 6 }}>
                            Why this is {verdictText.toLowerCase()}
                          </div>
                          <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.75, margin: 0 }}>
                            {claim.reasoning}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* External fact checks */}
                    {claim.external_fact_checks?.length > 0 && (
                      <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(226,232,240,0.3)" }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                          <Eye size={12} /> External Verification Sources
                        </div>
                        {claim.external_fact_checks.map((fc: any, fi: number) => {
                          const fcV = fc.fact_check_rating.toUpperCase();
                          const fcColor = fcV.includes("TRUE") ? "#10B981" : fcV.includes("FALSE") ? "#EF4444" : "#F59E0B";
                          return (
                            <div key={fi} className="fc-chip">
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{fc.fact_checker_name}</span>
                                  <span style={{ fontSize: 11, fontWeight: 700, color: fcColor, background: `${fcColor}08`, border: `1px solid ${fcColor}12`, borderRadius: 6, padding: "3px 9px" }}>
                                    {fc.fact_check_rating}
                                  </span>
                                </div>
                                {fc.fact_checker_url && (
                                  <a href={fc.fact_checker_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#0D9488", textDecoration: "none", fontWeight: 600 }}>
                                    View source <ExternalLink size={11} />
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MEDIA INTEGRITY */}
        {hasMedia && (
          <div style={{ animation: "fadeInUp 0.6s cubic-bezier(0.23,1,0.32,1) 0.9s both" }}>
            <div className="glass-panel" style={{ padding: "36px 38px", marginBottom: 28 }}>
              <div className="section-head">
                <div className="section-head-icon" style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.08)" }}>
                  <Layers size={17} color="#7C3AED" />
                </div>
                <div>
                  <h3>Media Analysis</h3>
                  <p style={{ fontSize: 13, color: "#94A3B8", margin: "4px 0 0" }}>
                    {verdict.includes("AI_GENERATED_IMAGE") ? "Image authenticity vs text content credibility" : "Forensic analysis of the uploaded media"}
                  </p>
                </div>
              </div>
              
              {/* Show separation notice for AI-generated images with text */}
              {verdict.includes("AI_GENERATED_IMAGE") && (
                <div style={{ display: "flex", alignItems: "start", gap: 12, padding: "14px 18px", background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.08)", borderRadius: 12, marginBottom: 18 }}>
                  <Eye size={14} color="#6366F1" style={{ marginTop: 2, flexShrink: 0 }} />
                  <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, margin: 0 }}>
                    We analyze the image and text separately. An AI-generated image can still contain accurate news text.
                  </p>
                </div>
              )}
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                {analysisData.media_integrity.ai_generated_probability !== null && (
                  <div className="media-detail">
                    <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500, marginBottom: 6 }}>Image Authenticity</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: analysisData.media_integrity.ai_generated_probability > 0.5 ? "#EF4444" : "#10B981" }}>
                      {analysisData.media_integrity.ai_generated_probability > 0.5 ? "AI-Generated" : "Authentic"}
                    </div>
                    <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>
                      {(analysisData.media_integrity.ai_generated_probability * 100).toFixed(0)}% confidence
                    </div>
                  </div>
                )}
                {analysisData.media_integrity.deepfake_probability !== null && (
                  <div className="media-detail">
                    <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500, marginBottom: 6 }}>Deepfake</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: analysisData.media_integrity.deepfake_probability > 0.5 ? "#EF4444" : "#10B981" }}>
                      {analysisData.media_integrity.deepfake_probability > 0.5 ? "Fake — Deepfake" : "Real — Authentic"}
                    </div>
                  </div>
                )}
                {analysisData.media_integrity.ai_voice_probability !== null && (
                  <div className="media-detail">
                    <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500, marginBottom: 6 }}>Voice</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: analysisData.media_integrity.ai_voice_probability > 0.5 ? "#EF4444" : "#10B981" }}>
                      {analysisData.media_integrity.ai_voice_probability > 0.5 ? "Fake — AI Voice" : "Real — Human Voice"}
                    </div>
                  </div>
                )}
                {analysisData.media_integrity.exif_data && (
                  <div className="media-detail">
                    <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500, marginBottom: 6 }}>Metadata</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: analysisData.media_integrity.exif_data.has_metadata ? "#10B981" : "#EF4444" }}>
                      {analysisData.media_integrity.exif_data.has_metadata ? "Present" : "Stripped — Suspicious"}
                    </div>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 22 }}>
                {analysisData.media_integrity.ela_result && (
                  <a href={`http://localhost:8000${analysisData.media_integrity.ela_result}`} target="_blank" rel="noopener noreferrer" className="view-link">View ELA Analysis <ExternalLink size={13} /></a>
                )}
                {analysisData.media_integrity.spectrogram_url && (
                  <a href={`http://localhost:8000${analysisData.media_integrity.spectrogram_url}`} target="_blank" rel="noopener noreferrer" className="view-link">View Spectrogram <ExternalLink size={13} /></a>
                )}
              </div>
              {analysisData.media_integrity.transcription && (
                <div style={{ marginTop: 22 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Transcription</div>
                  <div className="media-detail" style={{ maxHeight: 180, overflowY: "auto", fontFamily: "monospace", fontSize: 13, lineHeight: 1.7, color: "#334155" }}>{analysisData.media_integrity.transcription}</div>
                </div>
              )}
              {analysisData.media_integrity.splice_detection && (
                <div style={{ marginTop: 18 }}>
                  <div className="media-detail" style={{ background: analysisData.media_integrity.splice_detection.splice_detected ? "rgba(239,68,68,0.03)" : "rgba(16,185,129,0.03)", border: `1px solid ${analysisData.media_integrity.splice_detection.splice_detected ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)"}` }}>
                    {analysisData.media_integrity.splice_detection.splice_detected ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#EF4444", fontWeight: 600 }}><XCircle size={14} /> Audio splicing detected</div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#10B981", fontWeight: 600 }}><CheckCircle size={14} /> No splicing — Authentic audio</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* RELATED ARTICLES */}
        {articles.length > 0 && (
          <div style={{ animation: "fadeInUp 0.6s cubic-bezier(0.23,1,0.32,1) 1s both" }}>
            <div className="glass-panel" style={{ padding: "36px 38px", marginBottom: 28 }}>
              <div className="section-head">
                <div className="section-head-icon" style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.08)" }}>
                  <BookOpen size={17} color="#0891B2" />
                </div>
                <div>
                  <h3>Related Coverage</h3>
                  <p style={{ fontSize: 13, color: "#94A3B8", margin: "4px 0 0" }}>
                    {theme.isFake ? "See what credible sources actually report" : "Other sources covering this story"}
                  </p>
                </div>
              </div>
              {analysisData.web_search_evidence?.search_performed && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "rgba(13,148,136,0.04)", border: "1px solid rgba(13,148,136,0.08)", borderRadius: 10, marginBottom: 20, fontSize: 12, color: "#0D9488", fontWeight: 600 }}>
                  <Search size={12} />
                  {analysisData.web_search_evidence.total_results_found} sources searched · {analysisData.web_search_evidence.news_results_count} news articles
                </div>
              )}
              {articles.slice(0, 6).map((article: any, i: number) => (
                <a key={i} href={article.url || "#"} target="_blank" rel="noopener noreferrer" className="article-card" style={{ animation: `claimSlide 0.4s cubic-bezier(0.23,1,0.32,1) ${1.05 + i * 0.06}s both` }}>
                  <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(13,148,136,0.05)", border: "1px solid rgba(13,148,136,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Link2 size={16} color="#0D9488" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#0F172A", marginBottom: 4, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{article.title}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, color: "#0D9488", fontWeight: 500 }}>{article.source_name}</span>
                      {article.is_credible && <span style={{ fontSize: 10, fontWeight: 700, color: "#10B981", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.1)", borderRadius: 5, padding: "2px 7px" }}>Credible</span>}
                    </div>
                  </div>
                  <ChevronRight size={16} color="#CBD5E1" className="article-arrow" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* FEEDBACK */}
        <div className="glass-sm" style={{ padding: "28px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 18, animation: "fadeInUp 0.6s cubic-bezier(0.23,1,0.32,1) 1.15s both" }}>
          <div>
            <div style={{ fontWeight: 700, color: "#0F172A", marginBottom: 4, fontSize: 15 }}>Was this analysis helpful?</div>
            <div style={{ fontSize: 13, color: "#94A3B8" }}>Your feedback directly improves our AI accuracy</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setFeedback("up")} className="fb-btn" style={{ border: `1.5px solid ${feedback === "up" ? "rgba(16,185,129,0.3)" : "rgba(226,232,240,0.5)"}`, background: feedback === "up" ? "rgba(16,185,129,0.06)" : "rgba(255,255,255,0.4)", color: feedback === "up" ? "#10B981" : "#64748B" }}>
              <ThumbsUp size={15} /> Yes, helpful
            </button>
            <button onClick={() => setFeedback("down")} className="fb-btn" style={{ border: `1.5px solid ${feedback === "down" ? "rgba(239,68,68,0.3)" : "rgba(226,232,240,0.5)"}`, background: feedback === "down" ? "rgba(239,68,68,0.06)" : "rgba(255,255,255,0.4)", color: feedback === "down" ? "#EF4444" : "#64748B" }}>
              <ThumbsDown size={15} /> Not helpful
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}