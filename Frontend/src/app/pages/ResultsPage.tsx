import { useState } from "react";
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
  const rotation = -180 + (score / 100) * 180;
  const r = 70;
  const cx = 90;
  const cy = 90;
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

const CLAIMS = [
  {
    claim: "\"The vaccine was developed in under 48 hours with no testing\"",
    verdict: "FALSE",
    verdictColor: RED,
    verdictIcon: <XCircle size={14} />,
    explanation: "Clinical trials lasted over 6 months, with extensive Phase 3 testing involving 40,000+ participants.",
    source: "WHO.int",
  },
  {
    claim: "\"The government has hidden all adverse event data\"",
    verdict: "MISLEADING",
    verdictColor: AMBER,
    verdictIcon: <AlertTriangle size={14} />,
    explanation: "Adverse event data is publicly available on official health authority websites, though some datasets have reporting delays.",
    source: "CDC VAERS",
  },
  {
    claim: "\"Over 500,000 deaths linked to the rollout\"",
    verdict: "FALSE",
    verdictColor: RED,
    verdictIcon: <XCircle size={14} />,
    explanation: "No credible epidemiological study has established this causal link. The statistic is from an unreviewed preprint.",
    source: "PubMed",
  },
  {
    claim: "\"Emergency authorization was granted\"",
    verdict: "TRUE",
    verdictColor: GREEN,
    verdictIcon: <CheckCircle size={14} />,
    explanation: "EUA was granted after meeting FDA safety and efficacy thresholds. This is accurate.",
    source: "FDA.gov",
  },
];

const SIMILAR = [
  { title: "Viral claim about election fraud debunked", score: 15, color: RED },
  { title: "AI-generated flood photo spreading on Twitter", score: 28, color: RED },
  { title: "Misleading graph on economic data", score: 44, color: AMBER },
  { title: "Out-of-context video clip from 2019", score: 33, color: AMBER },
  { title: "Satire site article shared as real news", score: 22, color: RED },
];

export function ResultsPage() {
  const navigate = useNavigate();
  const score = 35;
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

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
            Analysis Report · <span style={{ color: TEXT }}>Analyzed Dec 15, 2025 at 3:42 PM</span>
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
                  backgroundColor: "#FEF3C7",
                  borderRadius: 8,
                  padding: "6px 14px",
                  marginBottom: 14,
                }}
              >
                <AlertTriangle size={16} color={AMBER} />
                <span style={{ fontWeight: 800, color: AMBER, fontSize: 15, letterSpacing: "0.3px" }}>
                  SUSPICIOUS — LIKELY MISLEADING
                </span>
              </div>
              <p style={{ fontSize: 15, color: TEXT, lineHeight: 1.65, marginBottom: 16 }}>
                This article contains multiple unverified claims and originates from a low-credibility source with sensationalist language patterns.
              </p>
              <div style={{ fontSize: 13, color: TEXT_MUTED, marginBottom: 24 }}>
                🕒 Analyzed: <strong>Dec 15, 2025 at 3:42 PM</strong>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  style={{
                    display: "flex", alignItems: "center", gap: 7, padding: "9px 16px",
                    border: `1.5px solid ${BORDER}`, borderRadius: 8, background: "#FFFFFF",
                    cursor: "pointer", fontSize: 13, fontWeight: 600, color: TEXT,
                  }}
                >
                  <Share2 size={14} /> Share Report
                </button>
                <button
                  style={{
                    display: "flex", alignItems: "center", gap: 7, padding: "9px 16px",
                    border: `1.5px solid ${BORDER}`, borderRadius: 8, background: "#FFFFFF",
                    cursor: "pointer", fontSize: 13, fontWeight: 600, color: TEXT,
                  }}
                >
                  <Download size={14} /> Download PDF
                </button>
                <button
                  onClick={() => navigate("/analyze")}
                  style={{
                    display: "flex", alignItems: "center", gap: 7, padding: "9px 16px",
                    border: `1.5px solid ${NAVY}`, borderRadius: 8, background: NAVY,
                    cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#FFFFFF",
                  }}
                >
                  <RefreshCw size={14} /> Re-analyze
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
              { label: "Source Credibility", value: 18, color: RED },
              { label: "Claim Accuracy", value: 28, color: RED },
              { label: "Language Bias", value: 41, color: AMBER },
              { label: "Media Integrity", value: 55, color: AMBER },
              { label: "Cross-Reference", value: 32, color: AMBER },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 6 }}>{s.label}</div>
                <div style={{ height: 6, backgroundColor: "#F1F5F9", borderRadius: 3, overflow: "hidden", marginBottom: 4 }}>
                  <div style={{ height: "100%", width: `${s.value}%`, backgroundColor: s.color, borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Analysis Cards */}

        {/* Card 1: Source Credibility */}
        <CollapsibleCard
          icon={<Shield size={18} color={RED} />}
          title="Source Credibility"
          badge="18 / 100 — Very Low"
          badgeColor={RED}
          defaultOpen={true}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <div style={{ width: 32, height: 32, backgroundColor: "#F1F5F9", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Globe size={16} color={TEXT_MUTED} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: TEXT, fontSize: 14 }}>truthbustersnews.net</div>
                  <div style={{ fontSize: 12, color: TEXT_MUTED }}>Not verified by any credibility index</div>
                </div>
              </div>

              {/* Star rating */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: TEXT_MUTED, marginBottom: 6 }}>Trust Rating</div>
                <div style={{ display: "flex", gap: 3 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} width="18" height="18" viewBox="0 0 24 24" fill={s <= 1.5 ? AMBER : "#E2E8F0"} stroke={s <= 1.5 ? AMBER : BORDER} strokeWidth="2">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                    </svg>
                  ))}
                  <span style={{ fontSize: 13, color: TEXT_MUTED, marginLeft: 6 }}>1.5 / 5</span>
                </div>
              </div>

              {[
                { label: "Domain Age", value: "Registered 23 days ago ⚠️", color: RED },
                { label: "Known Bias", value: "Strong political bias — Far Right", color: AMBER },
                { label: "Fact-Check History", value: "Flagged by 3 fact-checking organizations", color: RED },
                { label: "WHOIS Status", value: "Private Registration · No contact info", color: AMBER },
              ].map((item) => (
                <div key={item.label} style={{ marginBottom: 12, padding: "10px 14px", backgroundColor: BG_LIGHT, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 3 }}>{item.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: item.color }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleCard>

        {/* Card 2: Claim Verification */}
        <CollapsibleCard
          icon={<Search size={18} color={AMBER} />}
          title="Claim Verification"
          badge="1 / 4 True — 25% Accuracy"
          badgeColor={RED}
          defaultOpen={true}
        >
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 14, color: TEXT_MUTED }}>Overall claim accuracy</span>
              <span style={{ fontWeight: 700, color: RED, fontSize: 14 }}>25%</span>
            </div>
            <div style={{ height: 10, backgroundColor: "#F1F5F9", borderRadius: 5, overflow: "hidden", display: "flex" }}>
              <div style={{ height: "100%", width: "25%", backgroundColor: GREEN }} />
              <div style={{ height: "100%", width: "25%", backgroundColor: AMBER }} />
              <div style={{ height: "100%", width: "50%", backgroundColor: RED }} />
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
              <span style={{ fontSize: 11, color: GREEN, fontWeight: 600 }}>● 25% True</span>
              <span style={{ fontSize: 11, color: AMBER, fontWeight: 600 }}>● 25% Misleading</span>
              <span style={{ fontSize: 11, color: RED, fontWeight: 600 }}>● 50% False</span>
            </div>
          </div>

          {CLAIMS.map((claim, i) => (
            <div
              key={i}
              style={{
                border: `1px solid ${BORDER}`,
                borderRadius: 10,
                padding: "16px",
                marginBottom: 12,
                borderLeft: `3px solid ${claim.verdictColor}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ color: claim.verdictColor }}>{claim.verdictIcon}</div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: claim.verdictColor,
                      backgroundColor: `${claim.verdictColor}15`,
                      borderRadius: 4,
                      padding: "2px 8px",
                    }}
                  >
                    {claim.verdict}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 8, fontStyle: "italic" }}>
                {claim.claim}
              </div>
              <p style={{ fontSize: 13, color: TEXT_MUTED, lineHeight: 1.6, marginBottom: 8 }}>{claim.explanation}</p>
              <a href="#" style={{ fontSize: 12, color: TEAL, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                <ExternalLink size={11} /> Source: {claim.source}
              </a>
            </div>
          ))}
        </CollapsibleCard>

        {/* Card 3: Language & Bias */}
        <CollapsibleCard
          icon={<FileText size={18} color={AMBER} />}
          title="Language & Bias Analysis"
          badge="High Sensationalism"
          badgeColor={RED}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            <div>
              <ProgressBar value={85} color={RED} label="Sensationalism Score" percent />
              <ProgressBar value={72} color={AMBER} label="Clickbait Score" percent />
              <ProgressBar value={68} color={AMBER} label="Emotional Manipulation" percent />

              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 8 }}>Detected Patterns</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {["Fear-mongering", "Outrage bait", "Sensationalist", "Loaded language"].map((p) => (
                    <span key={p} style={{ fontSize: 12, backgroundColor: "#FEF2F2", color: RED, borderRadius: 4, padding: "3px 9px", fontWeight: 500 }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 8 }}>Logical Fallacies Detected</div>
                {["Ad Hominem", "Appeal to Fear", "Straw Man"].map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 6, height: 6, backgroundColor: RED, borderRadius: "50%" }} />
                    <span style={{ fontSize: 13, color: TEXT }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 16 }}>Political Bias Spectrum</div>
              <div style={{ position: "relative", marginBottom: 24 }}>
                <div style={{ height: 8, borderRadius: 4, background: "linear-gradient(to right, #1D4ED8, #9333EA, #94A3B8, #F97316, #DC2626)" }} />
                {/* Marker at ~80% (Far Right) */}
                <div style={{ position: "absolute", top: -4, left: "78%", width: 16, height: 16, backgroundColor: NAVY, borderRadius: "50%", transform: "translateX(-50%)", border: "2px solid #FFFFFF", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                  <span style={{ fontSize: 11, color: TEXT_MUTED }}>Far Left</span>
                  <span style={{ fontSize: 11, color: TEXT_MUTED }}>Center</span>
                  <span style={{ fontSize: 11, color: TEXT_MUTED }}>Far Right</span>
                </div>
                <div style={{ textAlign: "center", marginTop: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: RED, backgroundColor: "#FEF2F2", borderRadius: 4, padding: "3px 10px" }}>
                    Strong Far-Right Bias Detected
                  </span>
                </div>
              </div>

              <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 8 }}>Tone Assessment</div>
              <div
                style={{
                  padding: "12px 16px",
                  backgroundColor: "#FEF2F2",
                  border: `1px solid #FECACA`,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <AlertTriangle size={16} color={RED} />
                <span style={{ fontSize: 14, fontWeight: 700, color: RED }}>Inflammatory</span>
              </div>
            </div>
          </div>
        </CollapsibleCard>

        {/* Card 4: Media Integrity */}
        <CollapsibleCard
          icon={<Image size={18} color={NAVY} />}
          title="Media Integrity Analysis"
          badge="Image Manipulation Detected"
          badgeColor={RED}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            <div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: TEXT_MUTED, marginBottom: 6 }}>AI-Generated Probability</div>
                <div style={{ height: 14, backgroundColor: "#F1F5F9", borderRadius: 7, overflow: "hidden", marginBottom: 6 }}>
                  <div style={{ height: "100%", width: "92%", backgroundColor: RED, borderRadius: 7 }} />
                </div>
                <div style={{ fontWeight: 800, fontSize: 22, color: RED }}>92% <span style={{ fontSize: 13, fontWeight: 500, color: TEXT_MUTED }}>AI Generated</span></div>
                <div style={{ fontSize: 13, color: TEXT_MUTED, marginTop: 4 }}>Likely generated by: <strong style={{ color: TEXT }}>Stable Diffusion XL</strong></div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 10 }}>EXIF Metadata</div>
                {[
                  { key: "Camera", val: "⚠️ Metadata Stripped" },
                  { key: "Date Taken", val: "⚠️ Not Found" },
                  { key: "GPS Data", val: "⚠️ Not Found" },
                  { key: "Software", val: "Photoshop 25.0" },
                ].map((row) => (
                  <div key={row.key} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 13 }}>
                    <span style={{ color: TEXT_MUTED }}>{row.key}</span>
                    <span style={{ fontWeight: 500, color: row.val.startsWith("⚠") ? AMBER : TEXT }}>{row.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 10 }}>Reverse Image Search</div>
              {[
                { title: "Original photo from Reuters, 2019", source: "reuters.com", match: "98%" },
                { title: "Same image on Getty Images", source: "gettyimages.com", match: "94%" },
                { title: "Found on fact-check article", source: "snopes.com", match: "91%" },
              ].map((r, i) => (
                <div key={i} style={{ border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px", marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: TEXT, marginBottom: 4 }}>{r.title}</div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: TEAL }}>{r.source}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: GREEN }}>{r.match} match</span>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 16, padding: "12px 16px", backgroundColor: "#FEF2F2", borderRadius: 8, border: `1px solid #FECACA` }}>
                <div style={{ fontWeight: 700, color: RED, fontSize: 14, marginBottom: 4 }}>Manipulation Verdict</div>
                <div style={{ fontSize: 13, color: TEXT }}>Edited regions detected in upper-left quadrant. Likely composited image.</div>
              </div>
            </div>
          </div>
        </CollapsibleCard>

        {/* Card 5: Cross-Reference */}
        <CollapsibleCard
          icon={<Globe size={18} color={TEAL} />}
          title="Cross-Reference & Fact-Check"
          badge="3 Fact-Checks Found"
          badgeColor={AMBER}
        >
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 12 }}>Google Fact Check Results</div>
              {[
                { org: "Snopes", rating: "False", color: RED, url: "snopes.com" },
                { org: "PolitiFact", rating: "Pants on Fire", color: RED, url: "politifact.com" },
                { org: "FactCheck.org", rating: "Misleading", color: AMBER, url: "factcheck.org" },
              ].map((fc, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ width: 36, height: 36, backgroundColor: "#F1F5F9", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Globe size={16} color={TEXT_MUTED} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: TEXT }}>{fc.org}</div>
                    <div style={{ fontSize: 12, color: TEXT_MUTED }}>{fc.url}</div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: fc.color, backgroundColor: `${fc.color}15`, borderRadius: 4, padding: "3px 10px" }}>
                    {fc.rating}
                  </span>
                  <ExternalLink size={14} color={TEXT_MUTED} />
                </div>
              ))}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <div style={{ padding: "16px", backgroundColor: "#FEF2F2", borderRadius: 10, border: `1px solid #FECACA`, textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: RED }}>2</div>
                <div style={{ fontSize: 13, color: TEXT_MUTED }}>Credible sources</div>
              </div>
              <div style={{ padding: "16px", backgroundColor: "#FEF2F2", borderRadius: 10, border: `1px solid #FECACA`, textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: AMBER }}>47</div>
                <div style={{ fontSize: 13, color: TEXT_MUTED }}>Unreliable sources</div>
              </div>
            </div>

            <div style={{ padding: "14px 16px", backgroundColor: "#FFFBEB", borderRadius: 8, border: `1px solid #FDE68A`, display: "flex", alignItems: "center", gap: 10 }}>
              <AlertTriangle size={16} color={AMBER} />
              <span style={{ fontSize: 13, color: TEXT }}>This content matches known patterns of viral misinformation spreading on social media.</span>
            </div>
          </div>
        </CollapsibleCard>

        {/* Similar Content */}
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: NAVY, marginBottom: 14 }}>Similar Content Analyzed by Others</h3>
          <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8 }}>
            {SIMILAR.map((item, i) => (
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
                }}
              >
                <p style={{ fontSize: 13, color: TEXT, lineHeight: 1.5, marginBottom: 10 }}>{item.title}</p>
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
            <button
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "9px 16px",
                border: `1.5px solid ${BORDER}`, borderRadius: 8, background: "#FFFFFF",
                cursor: "pointer", fontSize: 13, fontWeight: 600, color: TEXT_MUTED,
              }}
            >
              <Flag size={14} /> Report Inaccuracy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
