import { useState } from "react";
import {
  Shield,
  Brain,
  Database,
  Globe,
  Cpu,
  Search,
  ChevronDown,
  ChevronUp,
  Mail,
  Send,
  Twitter,
  Linkedin,
  Github,
  CheckCircle,
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

const TECH_STACK = [
  { name: "GPT-4 Vision", desc: "Text & image analysis", color: "#6366F1", bg: "#EEF2FF" },
  { name: "Claude 3.5", desc: "Claim verification", color: "#7C3AED", bg: "#F5F3FF" },
  { name: "Meta Llama 3", desc: "Bias detection", color: NAVY, bg: "#EFF6FF" },
  { name: "Google Fact Check", desc: "Fact-check database", color: "#1D4ED8", bg: "#DBEAFE" },
  { name: "Snopes API", desc: "Misinformation database", color: AMBER, bg: "#FFFBEB" },
  { name: "PolitiFact", desc: "Political fact-checks", color: RED, bg: "#FEF2F2" },
  { name: "Deepfake Detector", desc: "Video authenticity", color: TEAL, bg: "#F0FDFA" },
  { name: "AWS Rekognition", desc: "Image AI detection", color: "#F97316", bg: "#FFF7ED" },
  { name: "OpenCV", desc: "Media manipulation", color: GREEN, bg: "#F0FDF4" },
  { name: "Whisper AI", desc: "Audio transcription", color: "#0EA5E9", bg: "#F0F9FF" },
  { name: "ElevenLabs Detector", desc: "Voice clone detection", color: "#EC4899", bg: "#FDF2F8" },
  { name: "EXIF.tools", desc: "Metadata extraction", color: TEXT_MUTED, bg: "#F1F5F9" },
];

const TEAM = [
  { name: "Sarah Chen", role: "Lead AI Engineer", initials: "SC", color: TEAL },
  { name: "Marcus Johnson", role: "Full Stack Dev", initials: "MJ", color: NAVY },
  { name: "Priya Patel", role: "ML Research Lead", initials: "PP", color: "#7C3AED" },
  { name: "Alex Rivera", role: "Product Designer", initials: "AR", color: AMBER },
];

const FAQS = [
  {
    q: "How accurate is Credence?",
    a: "Credence achieves approximately 87% accuracy on our benchmark dataset. We cross-reference multiple AI models and fact-check databases to minimize false positives. We always recommend treating results as one input among many — not as definitive truth.",
  },
  {
    q: "What data is stored when I analyze content?",
    a: "We store anonymized metadata about analysis requests (type, score, date) to improve our models. We do not store the actual content you analyze. Your privacy is protected — no personal information is collected without explicit consent.",
  },
  {
    q: "Can Credence detect all AI-generated images?",
    a: "We can detect the majority of AI-generated images with high confidence, especially from major generators like Midjourney, DALL-E 3, and Stable Diffusion. However, as AI generation technology evolves rapidly, no detector can guarantee 100% accuracy. We continuously update our models.",
  },
  {
    q: "Is there an API available for developers?",
    a: "Yes! We offer a RESTful API with endpoints for all analysis types. Free tier includes 100 requests/month. Contact us for enterprise pricing. Full API documentation is available in our developer portal.",
  },
  {
    q: "How does the Source Credibility score work?",
    a: "Source credibility is calculated from multiple signals: domain age, historical fact-check flags, known bias ratings from NewsGuard and AllSides, WHOIS data, SSL certificate status, and cross-reference with credibility index databases like MBFC and IFCN.",
  },
  {
    q: "What should I do if Credence gets it wrong?",
    a: "Use the 'Report Inaccuracy' button on any report page. Our team reviews flagged reports within 24 hours. These corrections are used to retrain our models. We take accuracy very seriously and appreciate community feedback.",
  },
];

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          gap: 16,
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: NAVY }}>{q}</span>
        {open ? <ChevronUp size={18} color={TEXT_MUTED} style={{ flexShrink: 0 }} /> : <ChevronDown size={18} color={TEXT_MUTED} style={{ flexShrink: 0 }} />}
      </button>
      {open && (
        <div style={{ paddingBottom: 20 }}>
          <p style={{ fontSize: 15, color: TEXT_MUTED, lineHeight: 1.7 }}>{a}</p>
        </div>
      )}
    </div>
  );
}

export function AboutPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    border: `1.5px solid ${BORDER}`,
    borderRadius: 8,
    fontSize: 14,
    color: TEXT,
    outline: "none",
    fontFamily: "inherit",
    backgroundColor: "#FAFAFA",
    boxSizing: "border-box",
    lineHeight: 1.5,
  };

  return (
    <div style={{ backgroundColor: "#FFFFFF", color: TEXT }}>
      {/* Hero */}
      <section style={{ padding: "80px 24px 72px", backgroundColor: BG_LIGHT, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <div
            style={{
              width: 64,
              height: 64,
              backgroundColor: NAVY,
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <Shield size={28} color="#FFFFFF" />
          </div>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: NAVY, marginBottom: 16, letterSpacing: "-0.5px" }}>
            Fighting Misinformation<br />with AI Precision
          </h1>
          <p style={{ fontSize: 17, color: TEXT_MUTED, lineHeight: 1.7 }}>
            Credence was built at Hackathon 2025 with a simple mission: make fact-checking accessible, fast, and comprehensive for everyone — from journalists to everyday readers.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section style={{ padding: "80px 24px", backgroundColor: "#FFFFFF" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: TEAL, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 12 }}>Our Mission</div>
              <h2 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 800, color: NAVY, marginBottom: 18, letterSpacing: "-0.5px" }}>
                Empowering People to Verify Before They Share
              </h2>
              <p style={{ fontSize: 15, color: TEXT_MUTED, lineHeight: 1.75, marginBottom: 16 }}>
                We believe that access to truth shouldn't require a journalism degree. In a world where AI-generated content is indistinguishable from reality, everyone deserves powerful verification tools.
              </p>
              <p style={{ fontSize: 15, color: TEXT_MUTED, lineHeight: 1.75 }}>
                Credence combines state-of-the-art AI models with established fact-check databases to provide the most comprehensive media integrity analysis available today.
              </p>
              <div style={{ marginTop: 28, display: "flex", gap: 24 }}>
                {[
                  { label: "Accuracy Rate", value: "87%" },
                  { label: "Fact-Check DBs", value: "12+" },
                  { label: "Content Types", value: "5" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: NAVY }}>{stat.value}</div>
                    <div style={{ fontSize: 12, color: TEXT_MUTED }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { icon: <Brain size={22} color={NAVY} />, title: "Multi-Model AI", desc: "Using 3+ AI models for cross-validation", bg: "#EFF6FF" },
                { icon: <Database size={22} color={TEAL} />, title: "12+ Databases", desc: "Fact-check and credibility databases", bg: "#F0FDFA" },
                { icon: <Globe size={22} color={GREEN} />, title: "Global Coverage", desc: "Sources from 40+ countries", bg: "#F0FDF4" },
                { icon: <CheckCircle size={22} color={AMBER} />, title: "Real-time", desc: "Analysis in under 10 seconds", bg: "#FFFBEB" },
              ].map((card) => (
                <div
                  key={card.title}
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 12,
                    padding: "20px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: card.bg,
                      borderRadius: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 12,
                    }}
                  >
                    {card.icon}
                  </div>
                  <div style={{ fontWeight: 700, color: NAVY, fontSize: 14, marginBottom: 4 }}>{card.title}</div>
                  <div style={{ fontSize: 12, color: TEXT_MUTED }}>{card.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section style={{ padding: "80px 24px", backgroundColor: BG_LIGHT }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(24px, 3.5vw, 34px)", fontWeight: 800, color: NAVY, marginBottom: 10, letterSpacing: "-0.5px" }}>
              Powered by Best-in-Class Technology
            </h2>
            <p style={{ fontSize: 15, color: TEXT_MUTED }}>We integrate with leading AI providers and fact-check databases</p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 14,
            }}
          >
            {TECH_STACK.map((tech) => (
              <div
                key={tech.name}
                style={{
                  backgroundColor: "#FFFFFF",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 10,
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  transition: "box-shadow 0.15s",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    backgroundColor: tech.bg,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Cpu size={16} color={tech.color} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{tech.name}</div>
                  <div style={{ fontSize: 11, color: TEXT_MUTED }}>{tech.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: "80px 24px", backgroundColor: "#FFFFFF" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(24px, 3.5vw, 34px)", fontWeight: 800, color: NAVY, marginBottom: 10, letterSpacing: "-0.5px" }}>
              The Team
            </h2>
            <p style={{ fontSize: 15, color: TEXT_MUTED }}>Built with passion at Hackathon 2025</p>
          </div>
          <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
            {TEAM.map((member) => (
              <div
                key={member.name}
                style={{
                  backgroundColor: "#FFFFFF",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 12,
                  padding: "28px 24px",
                  textAlign: "center",
                  flex: "1 1 180px",
                  maxWidth: 220,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    backgroundColor: member.color,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#FFFFFF",
                  }}
                >
                  {member.initials}
                </div>
                <div style={{ fontWeight: 700, color: NAVY, marginBottom: 6, fontSize: 15 }}>{member.name}</div>
                <div style={{ fontSize: 13, color: TEXT_MUTED }}>{member.role}</div>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 14 }}>
                  <Twitter size={15} color={TEXT_MUTED} style={{ cursor: "pointer" }} />
                  <Linkedin size={15} color={TEXT_MUTED} style={{ cursor: "pointer" }} />
                  <Github size={15} color={TEXT_MUTED} style={{ cursor: "pointer" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "80px 24px", backgroundColor: BG_LIGHT }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(24px, 3.5vw, 34px)", fontWeight: 800, color: NAVY, marginBottom: 10, letterSpacing: "-0.5px" }}>
              Frequently Asked Questions
            </h2>
            <p style={{ fontSize: 15, color: TEXT_MUTED }}>Everything you need to know about Credence</p>
          </div>
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: `1px solid ${BORDER}`,
              borderRadius: 12,
              padding: "8px 32px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            {FAQS.map((faq, i) => (
              <AccordionItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section style={{ padding: "80px 24px", backgroundColor: "#FFFFFF" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(24px, 3.5vw, 34px)", fontWeight: 800, color: NAVY, marginBottom: 10, letterSpacing: "-0.5px" }}>
              Get in Touch
            </h2>
            <p style={{ fontSize: 15, color: TEXT_MUTED }}>Have questions, feedback, or partnership inquiries? We'd love to hear from you.</p>
          </div>

          {sent && (
            <div
              style={{
                backgroundColor: "#F0FDF4",
                border: `1px solid #BBF7D0`,
                borderRadius: 10,
                padding: "14px 18px",
                marginBottom: 24,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <CheckCircle size={16} color={GREEN} />
              <span style={{ fontSize: 14, fontWeight: 600, color: GREEN }}>Message sent! We'll get back to you within 24 hours.</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 6 }}>Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 6 }}>Email Address</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 6 }}>Subject</label>
              <input
                type="text"
                placeholder="How can we help?"
                value={form.subject}
                onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                required
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 6 }}>Message</label>
              <textarea
                rows={6}
                placeholder="Tell us more..."
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                required
                style={{ ...inputStyle, resize: "vertical" } as React.CSSProperties}
              />
            </div>

            <button
              type="submit"
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
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Send size={16} /> Send Message
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
