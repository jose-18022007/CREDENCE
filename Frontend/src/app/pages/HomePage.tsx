import { Link } from "react-router";
import {
  Newspaper,
  Image,
  Video,
  Mic,
  Globe,
  Layers,
  Zap,
  Brain,
  FileText,
  Link2,
  Play,
  CheckSquare,
  ArrowRight,
  Shield,
  Search,
  BarChart2,
  Twitter,
  Github,
  Linkedin,
  ChevronRight,
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

export function HomePage() {
  return (
    <div style={{ backgroundColor: "#FFFFFF", color: TEXT }}>
      {/* Hero Section */}
      <section
        style={{
          background: "linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)",
          padding: "96px 24px 80px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              backgroundColor: "#EFF6FF",
              border: "1px solid #BFDBFE",
              borderRadius: 20,
              padding: "4px 14px",
              marginBottom: 28,
            }}
          >
            <Shield size={13} color={NAVY} />
            <span style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>AI-Powered Media Integrity Platform</span>
          </div>

          <h1
            style={{
              fontSize: "clamp(36px, 6vw, 60px)",
              fontWeight: 800,
              color: NAVY,
              lineHeight: 1.15,
              letterSpacing: "-1.5px",
              marginBottom: 20,
            }}
          >
            Don't Get Fooled.
            <br />
            <span style={{ color: TEAL }}>Verify Everything.</span>
          </h1>

          <p
            style={{
              fontSize: "clamp(16px, 2vw, 19px)",
              color: TEXT_MUTED,
              lineHeight: 1.7,
              marginBottom: 40,
              maxWidth: 620,
              margin: "0 auto 40px",
            }}
          >
            AI-powered platform that detects fake news, deepfakes, AI-generated media, and manipulated content across text, images, video, and audio.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 60 }}>
            <Link
              to="/analyze"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "13px 28px",
                backgroundColor: NAVY,
                color: "#FFFFFF",
                borderRadius: 8,
                textDecoration: "none",
                fontSize: 15,
                fontWeight: 600,
                boxShadow: "0 2px 8px rgba(30,58,95,0.25)",
                transition: "background-color 0.15s",
              }}
            >
              Start Analyzing <ArrowRight size={16} />
            </Link>
            <Link
              to="/about"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "13px 28px",
                backgroundColor: "#FFFFFF",
                color: NAVY,
                border: `2px solid ${NAVY}`,
                borderRadius: 8,
                textDecoration: "none",
                fontSize: 15,
                fontWeight: 600,
                transition: "background-color 0.15s",
              }}
            >
              <Play size={16} fill={NAVY} /> Watch Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{ padding: "0 24px 80px", backgroundColor: "#FFFFFF" }}>
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {[
            { icon: <Layers size={22} color={TEAL} />, title: "5 Media Types", sub: "Text, URL, Image, Video, Audio", bg: "#F0FDFA" },
            { icon: <Zap size={22} color={AMBER} />, title: "Real-time Analysis", sub: "Instant integrity checks", bg: "#FFFBEB" },
            { icon: <Brain size={22} color={NAVY} />, title: "AI + Fact-Check", sub: "Cross-reference databases", bg: "#EFF6FF" },
            { icon: <BarChart2 size={22} color={GREEN} />, title: "Detailed Reports", sub: "Full trust score reports", bg: "#F0FDF4" },
          ].map((s) => (
            <div
              key={s.title}
              style={{
                backgroundColor: "#FFFFFF",
                border: `1px solid ${BORDER}`,
                borderRadius: 12,
                padding: "24px 20px",
                display: "flex",
                alignItems: "center",
                gap: 16,
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                transition: "box-shadow 0.15s",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  backgroundColor: s.bg,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {s.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: TEXT, fontSize: 15 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: TEXT_MUTED }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: "80px 24px", backgroundColor: BG_LIGHT }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 36px)", fontWeight: 800, color: NAVY, marginBottom: 12, letterSpacing: "-0.5px" }}>
              What Can Credence Detect?
            </h2>
            <p style={{ fontSize: 16, color: TEXT_MUTED, maxWidth: 520, margin: "0 auto" }}>
              Comprehensive media integrity analysis powered by multiple AI models and fact-check databases.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 20,
            }}
          >
            {[
              {
                icon: <Newspaper size={22} color={RED} />,
                bg: "#FEF2F2",
                title: "Fake News Detection",
                desc: "Analyze articles and claims against fact-check databases and AI reasoning",
                tag: "Text · URL",
              },
              {
                icon: <Image size={22} color={NAVY} />,
                bg: "#EFF6FF",
                title: "AI-Generated Images",
                desc: "Detect MidJourney, DALL-E, Stable Diffusion generated images with high accuracy",
                tag: "Image",
              },
              {
                icon: <Video size={22} color={AMBER} />,
                bg: "#FFFBEB",
                title: "Deepfake Videos",
                desc: "Frame-by-frame face manipulation and lip-sync analysis to catch deepfakes",
                tag: "Video",
              },
              {
                icon: <Mic size={22} color={TEAL} />,
                bg: "#F0FDFA",
                title: "AI Voice & Audio Cloning",
                desc: "Identify ElevenLabs, cloned voices, and spliced audio with spectrogram analysis",
                tag: "Audio",
              },
              {
                icon: <Globe size={22} color={GREEN} />,
                bg: "#F0FDF4",
                title: "Source Credibility Scoring",
                desc: "Domain reputation, age, bias detection, and reliability scoring against known databases",
                tag: "URL · Text",
              },
              {
                icon: <Layers size={22} color="#7C3AED" />,
                bg: "#F5F3FF",
                title: "Manipulated Media Detection",
                desc: "EXIF analysis, Error Level Analysis, and metadata inspection for edited media",
                tag: "Image · Video",
              },
            ].map((f) => (
              <div
                key={f.title}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 12,
                  border: `1px solid ${BORDER}`,
                  padding: "28px 24px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  transition: "box-shadow 0.2s",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    backgroundColor: f.bg,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  {f.icon}
                </div>
                <div style={{ fontWeight: 700, color: NAVY, marginBottom: 8, fontSize: 16 }}>{f.title}</div>
                <p style={{ fontSize: 14, color: TEXT_MUTED, lineHeight: 1.65, marginBottom: 14 }}>{f.desc}</p>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: TEXT_MUTED,
                    backgroundColor: "#F1F5F9",
                    borderRadius: 4,
                    padding: "3px 8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {f.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: "80px 24px", backgroundColor: "#FFFFFF" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 36px)", fontWeight: 800, color: NAVY, marginBottom: 12, letterSpacing: "-0.5px" }}>
              How It Works
            </h2>
            <p style={{ fontSize: 16, color: TEXT_MUTED }}>Four simple steps from submission to verified report</p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 0,
              position: "relative",
            }}
          >
            {[
              {
                step: "01",
                title: "Upload or Paste",
                desc: "Upload a screenshot, paste text, drop a URL, or upload media files directly",
                icon: <FileText size={22} color={TEAL} />,
              },
              {
                step: "02",
                title: "AI Processes",
                desc: "OCR extraction, content scraping, media fingerprinting, and multi-model AI analysis",
                icon: <Brain size={22} color={NAVY} />,
              },
              {
                step: "03",
                title: "Cross-Reference",
                desc: "Checked against fact-check databases, reverse image search, and source credibility",
                icon: <Search size={22} color={AMBER} />,
              },
              {
                step: "04",
                title: "Get Your Report",
                desc: "Detailed trust score, red flags, supporting evidence, and actionable recommendations",
                icon: <BarChart2 size={22} color={GREEN} />,
              },
            ].map((item, idx, arr) => (
              <div
                key={item.step}
                style={{
                  padding: "32px 28px",
                  position: "relative",
                  borderRight: idx < arr.length - 1 ? `1px dashed ${BORDER}` : "none",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: TEAL,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    marginBottom: 12,
                  }}
                >
                  STEP {item.step}
                </div>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    backgroundColor: "#F8FAFC",
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 14,
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  {item.icon}
                </div>
                <div style={{ fontWeight: 700, color: NAVY, marginBottom: 8, fontSize: 16 }}>{item.title}</div>
                <p style={{ fontSize: 14, color: TEXT_MUTED, lineHeight: 1.65 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 48 }}>
            <Link
              to="/analyze"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "13px 28px",
                backgroundColor: NAVY,
                color: "#FFFFFF",
                borderRadius: 8,
                textDecoration: "none",
                fontSize: 15,
                fontWeight: 600,
                boxShadow: "0 2px 8px rgba(30,58,95,0.2)",
              }}
            >
              Try It Now <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Media Types Section */}
      <section style={{ padding: "80px 24px", backgroundColor: BG_LIGHT }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(24px, 3.5vw, 32px)", fontWeight: 800, color: NAVY, marginBottom: 10, letterSpacing: "-0.5px" }}>
              Supported Media Types
            </h2>
            <p style={{ fontSize: 15, color: TEXT_MUTED }}>Analyze any format of content in one unified platform</p>
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
            {[
              { icon: <FileText size={24} color={NAVY} />, label: "Text", desc: "Articles, claims, social posts", bg: "#EFF6FF" },
              { icon: <Link2 size={24} color={TEAL} />, label: "URL", desc: "Any web article or page", bg: "#F0FDFA" },
              { icon: <Image size={24} color={AMBER} />, label: "Image", desc: "PNG, JPG, WEBP (max 10MB)", bg: "#FFFBEB" },
              { icon: <Play size={24} color={RED} />, label: "Video", desc: "MP4, MOV, AVI (max 100MB)", bg: "#FEF2F2" },
              { icon: <Mic size={24} color={GREEN} />, label: "Audio", desc: "MP3, WAV, FLAC (max 50MB)", bg: "#F0FDF4" },
            ].map((m) => (
              <div
                key={m.label}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 12,
                  border: `1px solid ${BORDER}`,
                  padding: "28px 24px",
                  textAlign: "center",
                  minWidth: 160,
                  flex: "1 1 160px",
                  maxWidth: 200,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    backgroundColor: m.bg,
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 14px",
                  }}
                >
                  {m.icon}
                </div>
                <div style={{ fontWeight: 700, color: NAVY, marginBottom: 6, fontSize: 15 }}>{m.label}</div>
                <div style={{ fontSize: 12, color: TEXT_MUTED, lineHeight: 1.5 }}>{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section
        style={{
          padding: "80px 24px",
          backgroundColor: NAVY,
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, color: "#FFFFFF", marginBottom: 16, letterSpacing: "-0.5px" }}>
            Start Verifying Content Today
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", marginBottom: 36, lineHeight: 1.6 }}>
            Join thousands of journalists, researchers, and everyday users fighting misinformation.
          </p>
          <Link
            to="/analyze"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "13px 32px",
              backgroundColor: TEAL,
              color: "#FFFFFF",
              borderRadius: 8,
              textDecoration: "none",
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            Analyze Now <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: "#0F172A",
          color: "rgba(255,255,255,0.7)",
          padding: "56px 24px 32px",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 40,
              marginBottom: 48,
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    backgroundColor: TEAL,
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Shield size={14} color="#FFFFFF" />
                </div>
                <span style={{ fontWeight: 700, fontSize: 16, color: "#FFFFFF" }}>Credence</span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(255,255,255,0.5)" }}>
                AI-powered media integrity platform fighting misinformation across all content types.
              </p>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#FFFFFF", marginBottom: 16, fontSize: 13, letterSpacing: "0.5px", textTransform: "uppercase" }}>Platform</div>
              {["Analyze", "Dashboard", "API Docs", "Integrations"].map((l) => (
                <div key={l} style={{ marginBottom: 10 }}>
                  <Link to={l === "Analyze" ? "/analyze" : l === "Dashboard" ? "/dashboard" : "/about"} style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: 14 }}>{l}</Link>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#FFFFFF", marginBottom: 16, fontSize: 13, letterSpacing: "0.5px", textTransform: "uppercase" }}>Company</div>
              {["About", "Blog", "Careers", "Press"].map((l) => (
                <div key={l} style={{ marginBottom: 10 }}>
                  <Link to="/about" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: 14 }}>{l}</Link>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#FFFFFF", marginBottom: 16, fontSize: 13, letterSpacing: "0.5px", textTransform: "uppercase" }}>Legal</div>
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((l) => (
                <div key={l} style={{ marginBottom: 10 }}>
                  <a href="#" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: 14 }}>{l}</a>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.08)",
              paddingTop: 28,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
              © 2026 Credence · ThunderBoltz
            </span>
            <div style={{ display: "flex", gap: 16 }}>
              {[<Twitter size={16} />, <Github size={16} />, <Linkedin size={16} />].map((icon, i) => (
                <a
                  key={i}
                  href="#"
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    transition: "color 0.15s",
                    display: "flex",
                  }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
