import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  Shield,
  Search,
  FileText,
  Globe,
  Image,
  ChevronDown,
  ChevronUp,
  Share2,
  Download,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  Flag,
  ArrowLeft,
} from "lucide-react";
import type { AnalysisResponse } from "../../services/api";

const NAVY = "#1E3A5F";
const TEAL = "#0D9488";
const RED = "#DC2626";
const AMBER = "#D97706";
const GREEN = "#059669";
const BORDER = "#E2E8F0";
const BG_LIGHT = "#F8FAFC";
const TEXT = "#1E293B";
const TEXT_MUTED = "#64748B";

function TrustGauge({ score }: { score: number }) {
  const color = score <= 30 ? RED : score <= 60 ? AMBER : score <= 80 ? "#16A34A" : GREEN;
  const r = 70;
  const circumference = Math.PI * r;
  const strokeDash = (score / 100) * circumference;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <svg width="180" height="100" viewBox="0 0 180 100">
        <path
          d={`M 20 90 A ${r} ${r} 0 0 1 160 90`}
          fill="none"
          stroke="#F1F5F9"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d={`M 20 90 A ${r} ${r} 0 0 1 160 90`}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${strokeDash} ${circumference}`}
        />
        <text x="90" y="74" textAnchor="middle" fill={NAVY} fontSize="30" fontWeight="800">{score}</text>
        <text x="90" y="90" textAnchor="middle" fill={TEXT_MUTED} fontSize="12">/ 100</text>
      </svg>
      <div style={{ textAlign: "center", marginTop: -8 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {score <= 30 ? "Likely Fake" : score <= 60 ? "Suspicious" : score <= 80 ? "Mostly Credible" : "Verified"}
        </span>
      </div>
    </div>
  );
}

function CollapsibleCard({
  icon,
  title,
  badge,
  badgeColor,
  children,
  defaultOpen = false,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: string;
  badgeColor?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: `1px solid ${BORDER}`,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        marginBottom: 16,
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "20px 24px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          borderBottom: open ? `1px solid ${BORDER}` : "none",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            backgroundColor: "#F1F5F9",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <span style={{ fontWeight: 700, color: NAVY, fontSize: 15, flex: 1 }}>{title}</span>
        {badge && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: badgeColor || TEXT_MUTED,
              backgroundColor: `${badgeColor || TEXT_MUTED}18`,
              borderRadius: 20,
              padding: "3px 10px",
            }}
          >
            {badge}
          </span>
        )}
        {open ? <ChevronUp size={16} color={TEXT_MUTED} /> : <ChevronDown size={16} color={TEXT_MUTED} />}
      </button>
      {open && <div style={{ padding: "24px" }}>{children}</div>}
    </div>
  );
}

function ProgressBar({ value, color, label, percent }: { value: number; color: string; label?: string; percent?: boolean }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontSize: 13, color: TEXT }}>{label}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color }}>{value}{percent ? "%" : ""}</span>
        </div>
      )}
      <div style={{ height: 8, backgroundColor: "#F1F5F9", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${value}%`, backgroundColor: color, borderRadius: 4, transition: "width 0.5s" }} />
      </div>
    </div>
  );
}

export function ResultsPage() {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);

  useEffect(() => {
    // Load analysis data from sessionStorage
    const stored = sessionStorage.getItem("latestAnalysis");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setAnalysisData(data);
      } catch (e) {
        console.error("Failed to parse analysis data:", e);
        // Redirect back if no valid data
        navigate("/analyze");
      }
    } else {
      // No analysis data, redirect to analyze page
      navigate("/analyze");
    }
  }, [navigate]);

  if (!analysisData) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: NAVY, marginBottom: 8 }}>Loading analysis...</div>
          <div style={{ fontSize: 14, color: TEXT_MUTED }}>Please wait</div>
        </div>
      </div>
    );
  }

  const score = analysisData.overall_trust_score;
  const verdict = analysisData.verdict;
  const verdictColor = 
    verdict.includes("VERIFIED") || verdict.includes("CREDIBLE") ? GREEN :
    verdict.includes("SUSPICIOUS") ? AMBER : RED;

  // Get verdict icon
  const getVerdictIcon = (v: string) => {
    if (v.includes("TRUE") || v.includes("VERIFIED")) return <CheckCircle size={14} />;
    if (v.includes("FALSE") || v.includes("FAKE")) return <XCircle size={14} />;
    return <AlertTriangle size={14} />;
  };

  const getVerdictColor = (v: string) => {
    if (v.includes("TRUE") || v.includes("VERIFIED")) return GREEN;
    if (v.includes("FALSE") || v.includes("FAKE")) return RED;
    return AMBER;
  };

  return (
    <div style={{ backgroundColor: BG_LIGHT, minHeight: "100vh", color: TEXT }}>
      {/* Header */}
      <div style={{ backgroundColor: "#FFFFFF", borderBottom: `1px solid ${BORDER}`, padding: "16px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => navigate("/analyze")}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "none", border: `1px solid ${BORDER}`, borderRadius: 8,
              padding: "7px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: TEXT_MUTED,
            }}
          >
            <ArrowLeft size={14} /> Back
          </button>
          <span style={{ fontSize: 14, color: TEXT_MUTED }}>
            Analysis Report · <span style={{ color: TEXT }}>Analyzed {new Date(analysisData.timestamp).toLocaleString()}</span>
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "36px 24px" }}>

        {/* Hero Result Card */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            border: `1px solid ${BORDER}`,
            padding: "36px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            marginBottom: 28,
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 36, alignItems: "flex-start" }}>
            {/* Gauge */}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
                Overall Trust Score
              </div>
              <TrustGauge score={score} />
            </div>

            {/* Verdict */}
            <div style={{ flex: 1, minWidth: 260 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  backgroundColor: `${verdictColor}15`,
                  borderRadius: 8,
                  padding: "6px 14px",
                  marginBottom: 14,
                }}
              >
                {getVerdictIcon(verdict)}
                <span style={{ fontWeight: 800, color: verdictColor, fontSize: 15, letterSpacing: "0.3px" }}>
                  {verdict.replace(/_/g, " ")}
                </span>
              </div>
              <p style={{ fontSize: 15, color: TEXT, lineHeight: 1.65, marginBottom: 16 }}>
                {analysisData.summary}
              </p>
              
              {/* Red Flags */}
              {analysisData.red_flags && analysisData.red_flags.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: RED, marginBottom: 8 }}>⚠️ Red Flags:</div>
                  {analysisData.red_flags.slice(0, 3).map((flag, i) => (
                    <div key={i} style={{ fontSize: 13, color: TEXT_MUTED, marginBottom: 4 }}>• {flag}</div>
                  ))}
                </div>
              )}
              
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  onClick={() => navigate("/analyze")}
                  style={{
                    display: "flex", alignItems: "center", gap: 7, padding: "9px 16px",
                    border: `1.5px solid ${NAVY}`, borderRadius: 8, background: NAVY,
                    cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#FFFFFF",
                  }}
                >
                  <RefreshCw size={14} /> Analyze Another
                </button>
              </div>
            </div>
          </div>

          {/* Score breakdown row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: 12,
              marginTop: 28,
              borderTop: `1px solid ${BORDER}`,
              paddingTop: 24,
            }}
          >
            {[
              { label: "Source Credibility", value: analysisData.source_credibility.score },
              { label: "Language Analysis", value: 100 - analysisData.language_analysis.sensationalism_score },
              { label: "Cross-Reference", value: analysisData.cross_reference.credible_sources_count * 20 },
            ].map((s) => {
              const color = s.value <= 30 ? RED : s.value <= 60 ? AMBER : GREEN;
              return (
                <div key={s.label}>
                  <div style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 6 }}>{s.label}</div>
                  <div style={{ height: 6, backgroundColor: "#F1F5F9", borderRadius: 3, overflow: "hidden", marginBottom: 4 }}>
                    <div style={{ height: "100%", width: `${s.value}%`, backgroundColor: color, borderRadius: 3 }} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color }}>{Math.round(s.value)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Analysis Cards */}

        {/* Card 1: Source Credibility */}
        <CollapsibleCard
          icon={<Shield size={18} color={analysisData.source_credibility.score > 60 ? GREEN : RED} />}
          title="Source Credibility"
          badge={`${analysisData.source_credibility.score} / 100`}
          badgeColor={analysisData.source_credibility.score > 60 ? GREEN : RED}
          defaultOpen={true}
        >
          <div>
            {analysisData.source_credibility.domain && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <div style={{ width: 32, height: 32, backgroundColor: "#F1F5F9", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Globe size={16} color={TEXT_MUTED} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: TEXT, fontSize: 14 }}>{analysisData.source_credibility.domain}</div>
                  {analysisData.source_credibility.domain_age && (
                    <div style={{ fontSize: 12, color: TEXT_MUTED }}>Domain age: {analysisData.source_credibility.domain_age}</div>
                  )}
                </div>
              </div>
            )}
            
            <div style={{ padding: "12px 16px", backgroundColor: BG_LIGHT, borderRadius: 8, marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: TEXT, lineHeight: 1.6 }}>{analysisData.source_credibility.details}</div>
            </div>
            
            {analysisData.source_credibility.bias && analysisData.source_credibility.bias !== "NOT_APPLICABLE" && (
              <div style={{ padding: "10px 14px", backgroundColor: "#FEF3C7", borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 3 }}>Political Bias</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: AMBER }}>{analysisData.source_credibility.bias.replace(/_/g, " ")}</div>
              </div>
            )}
          </div>
        </CollapsibleCard>

        {/* Card 2: Claim Verification */}
        {analysisData.claim_verification.claims.length > 0 && (
          <CollapsibleCard
            icon={<Search size={18} color={AMBER} />}
            title="Claim Verification"
            badge={`${analysisData.claim_verification.verified_count} / ${analysisData.claim_verification.claims.length} Verified`}
            badgeColor={analysisData.claim_verification.verified_count > analysisData.claim_verification.false_count ? GREEN : RED}
            defaultOpen={true}
          >
            <div>
              {analysisData.claim_verification.claims.map((claim: any, i: number) => (
                <div
                  key={i}
                  style={{
                    border: `1px solid ${BORDER}`,
                    borderRadius: 10,
                    padding: "16px",
                    marginBottom: 12,
                    borderLeft: `3px solid ${getVerdictColor(claim.verdict || "UNVERIFIED")}`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ color: getVerdictColor(claim.verdict || "UNVERIFIED") }}>
                        {getVerdictIcon(claim.verdict || "UNVERIFIED")}
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: getVerdictColor(claim.verdict || "UNVERIFIED"),
                          backgroundColor: `${getVerdictColor(claim.verdict || "UNVERIFIED")}15`,
                          borderRadius: 4,
                          padding: "2px 8px",
                        }}
                      >
                        {claim.verdict || "UNVERIFIED"}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 8 }}>
                    "{claim.claim_text}"
                  </div>
                  {claim.reasoning && (
                    <p style={{ fontSize: 13, color: TEXT_MUTED, lineHeight: 1.6 }}>{claim.reasoning}</p>
                  )}
                </div>
              ))}
            </div>
          </CollapsibleCard>
        )}

        {/* Card 3: Language & Bias */}
        <CollapsibleCard
          icon={<FileText size={18} color={AMBER} />}
          title="Language & Bias Analysis"
          badge={analysisData.language_analysis.sensationalism_score > 70 ? "High Sensationalism" : "Moderate"}
          badgeColor={analysisData.language_analysis.sensationalism_score > 70 ? RED : AMBER}
        >
          <div>
            <ProgressBar value={analysisData.language_analysis.sensationalism_score} color={RED} label="Sensationalism Score" percent />
            <ProgressBar value={analysisData.language_analysis.clickbait_score} color={AMBER} label="Clickbait Score" percent />
            
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 8 }}>Tone</div>
              <div style={{ padding: "10px 14px", backgroundColor: BG_LIGHT, borderRadius: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>{analysisData.language_analysis.tone}</span>
              </div>
            </div>
            
            {analysisData.language_analysis.logical_fallacies.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 8 }}>Logical Fallacies Detected</div>
                {analysisData.language_analysis.logical_fallacies.map((f: string, i: number) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 6, height: 6, backgroundColor: RED, borderRadius: "50%" }} />
                    <span style={{ fontSize: 13, color: TEXT }}>{f}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CollapsibleCard>

        {/* Card 4: Cross-Reference */}
        {analysisData.cross_reference.related_articles.length > 0 && (
          <CollapsibleCard
            icon={<Globe size={18} color={TEAL} />}
            title="Cross-Reference & News Sources"
            badge={`${analysisData.cross_reference.credible_sources_count} Credible Sources`}
            badgeColor={analysisData.cross_reference.credible_sources_count > 0 ? GREEN : RED}
          >
            <div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <div style={{ padding: "16px", backgroundColor: "#F0FDF4", borderRadius: 10, border: `1px solid ${GREEN}`, textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: GREEN }}>{analysisData.cross_reference.credible_sources_count}</div>
                  <div style={{ fontSize: 13, color: TEXT_MUTED }}>Credible sources</div>
                </div>
                <div style={{ padding: "16px", backgroundColor: "#FEF2F2", borderRadius: 10, border: `1px solid ${RED}`, textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: RED }}>{analysisData.cross_reference.unreliable_sources_count}</div>
                  <div style={{ fontSize: 13, color: TEXT_MUTED }}>Unreliable sources</div>
                </div>
              </div>
              
              <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 12 }}>Related News Articles</div>
              {analysisData.cross_reference.related_articles.slice(0, 5).map((article: any, i: number) => (
                <div key={i} style={{ border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px", marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: TEXT, marginBottom: 4 }}>{article.title}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: TEAL }}>{article.source_name}</span>
                    {article.is_credible && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: GREEN, backgroundColor: `${GREEN}15`, borderRadius: 4, padding: "2px 8px" }}>
                        Credible
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleCard>
        )}

        {/* Feedback */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: `1px solid ${BORDER}`,
            borderRadius: 12,
            padding: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <div style={{ fontWeight: 700, color: NAVY, marginBottom: 4 }}>Was this analysis helpful?</div>
            <div style={{ fontSize: 13, color: TEXT_MUTED }}>Your feedback helps us improve our accuracy</div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              onClick={() => setFeedback("up")}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "9px 16px",
                border: `1.5px solid ${feedback === "up" ? GREEN : BORDER}`,
                borderRadius: 8,
                backgroundColor: feedback === "up" ? "#F0FDF4" : "#FFFFFF",
                cursor: "pointer", fontSize: 13, fontWeight: 600,
                color: feedback === "up" ? GREEN : TEXT,
              }}
            >
              <ThumbsUp size={14} /> Helpful
            </button>
            <button
              onClick={() => setFeedback("down")}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "9px 16px",
                border: `1.5px solid ${feedback === "down" ? RED : BORDER}`,
                borderRadius: 8,
                backgroundColor: feedback === "down" ? "#FEF2F2" : "#FFFFFF",
                cursor: "pointer", fontSize: 13, fontWeight: 600,
                color: feedback === "down" ? RED : TEXT,
              }}
            >
              <ThumbsDown size={14} /> Not helpful
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
