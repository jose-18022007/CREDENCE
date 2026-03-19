import { useState } from "react";
import emailjs from "@emailjs/browser";
import {
  Shield,
  Brain,
  Database,
  Globe,
  Cpu,
  ChevronDown,
  ChevronUp,
  Send,
  Twitter,
  Linkedin,
  Github,
  CheckCircle,
  Zap,
  Users,
  MessageCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Target,
  Award,
} from "lucide-react";

const TECH_STACK = [
  { name: "GPT-4 Vision", desc: "Text & image analysis", color: "#6366F1" },
  { name: "Claude 3.5", desc: "Claim verification", color: "#7C3AED" },
  { name: "Meta Llama 3", desc: "Bias detection", color: "#1E3A5F" },
  { name: "Google Fact Check", desc: "Fact-check database", color: "#1D4ED8" },
  { name: "Snopes API", desc: "Misinfo database", color: "#D97706" },
  { name: "PolitiFact", desc: "Political fact-checks", color: "#DC2626" },
  { name: "AWS Rekognition", desc: "Image AI detection", color: "#F97316" },
  { name: "OpenCV", desc: "Media manipulation", color: "#059669" },
];

const TEAM = [
  { name: "Emmanuel Joshua", role: "Lead AI Engineer", initials: "EJ", color: "#0D9488" },
  { name: "Jose", role: "Full Stack Dev", initials: "J", color: "#1E3A5F" },
  { name: "Bhaarathi Nesan", role: "ML Research Lead", initials: "BN", color: "#7C3AED" },
];

const FAQS = [
  { q: "How accurate is Credence?", a: "Credence achieves approximately 87% accuracy on our benchmark dataset. We cross-reference multiple AI models and fact-check databases to minimize false positives. We always recommend treating results as one input among many — not as definitive truth." },
  { q: "What data is stored when I analyze content?", a: "We store anonymized metadata about analysis requests (type, score, date) to improve our models. We do not store the actual content you analyze. Your privacy is protected — no personal information is collected without explicit consent." },
  { q: "Can Credence detect all AI-generated images?", a: "We can detect the majority of AI-generated images with high confidence, especially from major generators like Midjourney, DALL-E 3, and Stable Diffusion. However, as AI generation technology evolves rapidly, no detector can guarantee 100% accuracy." },
  { q: "Is there an API available for developers?", a: "Yes! We offer a RESTful API with endpoints for all analysis types. Free tier includes 100 requests/month. Contact us for enterprise pricing. Full API documentation is available in our developer portal." },
  { q: "How does the Source Credibility score work?", a: "Source credibility is calculated from multiple signals: domain age, historical fact-check flags, known bias ratings from NewsGuard and AllSides, WHOIS data, SSL certificate status, and cross-reference with credibility index databases like MBFC and IFCN." },
  { q: "What should I do if Credence gets it wrong?", a: "Use the 'Report Inaccuracy' button on any report page. Our team reviews flagged reports within 24 hours. These corrections are used to retrain our models. We take accuracy very seriously and appreciate community feedback." },
];

/* ============================== */
/* ===== ACCORDION ITEM ===== */
/* ============================== */
function AccordionItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        borderBottom: "1px solid rgba(226,232,240,0.4)",
        transition: "all 0.3s ease",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="faq-btn"
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "22px 4px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          gap: 16,
          transition: "all 0.3s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: open ? "rgba(13,148,136,0.08)" : "rgba(241,245,249,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
              flexShrink: 0,
              fontSize: 12,
              fontWeight: 700,
              color: open ? "#0D9488" : "#94A3B8",
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </div>
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: open ? "#0D9488" : "#0F172A",
              transition: "color 0.3s",
            }}
          >
            {q}
          </span>
        </div>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: open ? "rgba(13,148,136,0.08)" : "rgba(241,245,249,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "all 0.3s cubic-bezier(0.23,1,0.32,1)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <ChevronDown size={15} color={open ? "#0D9488" : "#94A3B8"} />
        </div>
      </button>
      <div
        style={{
          maxHeight: open ? 300 : 0,
          overflow: "hidden",
          transition: "max-height 0.4s cubic-bezier(0.23,1,0.32,1), opacity 0.3s ease",
          opacity: open ? 1 : 0,
        }}
      >
        <div style={{ paddingBottom: 22, paddingLeft: 42 }}>
          <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.8 }}>{a}</p>
        </div>
      </div>
    </div>
  );
}

/* ============================== */
/* ===== ABOUT PAGE ===== */
/* ============================== */
export function AboutPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");

    try {
      // EmailJS configuration from environment variables
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_x5t6vxy";
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_390ggkw";
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "5QQACvSQe3-5qwT99";

      // Send email using EmailJS
      const result = await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: form.name,
          from_email: form.email,
          subject: form.subject,
          message: form.message,
          to_name: "Credence Team",
        },
        publicKey
      );

      console.log("Email sent successfully:", result);
      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSent(false), 5000);
    } catch (err: any) {
      console.error("Email send error:", err);
      setError("Failed to send message. Please try again or email us directly.");
      setTimeout(() => setError(""), 5000);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#FAFBFF", color: "#1E293B", overflowX: "hidden" }}>
      <style>{`
        @keyframes fadeInUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
        @keyframes gridPulse{0%,100%{opacity:.35}50%{opacity:.8}}
        @keyframes scanV{0%{transform:translateY(-100%);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translateY(100%);opacity:0}}
        @keyframes scanH{0%{transform:translateX(-100%);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translateX(100%);opacity:0}}
        @keyframes orbFloat{0%,100%{transform:translate(0,0) scale(1);opacity:0.6}33%{transform:translate(30px,-20px) scale(1.08);opacity:0.8}66%{transform:translate(-20px,15px) scale(0.95);opacity:0.5}}
        @keyframes shimmer{0%{left:-150%}100%{left:150%}}
        @keyframes breathe{0%,100%{transform:scale(1);opacity:0.6}50%{transform:scale(1.4);opacity:1}}
        @keyframes tiltIn{from{opacity:0;transform:perspective(1200px) rotateX(6deg) translateY(30px)}to{opacity:1;transform:perspective(1200px) rotateX(0deg) translateY(0)}}
        @keyframes cardFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes successIn{from{opacity:0;transform:translateY(-12px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes counterUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes techPop{from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)}}
        @keyframes spinSlow{to{transform:rotate(360deg)}}
        @keyframes spin{to{transform:rotate(360deg)}}

        .grid-about{position:absolute;inset:0;pointer-events:none;overflow:hidden}
        .grid-about::before{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(15,23,42,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(15,23,42,0.035) 1px,transparent 1px);background-size:60px 60px}
        .grid-about::after{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(13,148,136,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(13,148,136,0.02) 1px,transparent 1px);background-size:180px 180px}
        .g-dot{position:absolute;border-radius:50%;animation:gridPulse 4s ease-in-out infinite}
        .sep{height:1px;max-width:900px;margin:0 auto;background:linear-gradient(90deg,transparent,rgba(13,148,136,0.12),rgba(124,58,237,0.08),transparent)}

        /* Glass card */
        .glass-card{
          background:rgba(255,255,255,0.55);
          backdrop-filter:blur(22px) saturate(190%);
          -webkit-backdrop-filter:blur(22px) saturate(190%);
          border:1px solid rgba(255,255,255,0.6);
          box-shadow:0 4px 24px rgba(0,0,0,0.03),inset 0 1px 0 rgba(255,255,255,0.8);
          transition:all 0.45s cubic-bezier(0.23,1,0.32,1);
          transform-style:preserve-3d;
          position:relative;overflow:hidden;
        }
        .glass-card::before{
          content:'';position:absolute;top:0;left:0;right:0;height:2px;
          background:linear-gradient(90deg,transparent,rgba(13,148,136,0.2),transparent);
          opacity:0;transition:opacity 0.3s;
        }
        .glass-card:hover{
          transform:translateY(-8px) rotateX(1.5deg) scale(1.01);
          box-shadow:0 28px 60px rgba(0,0,0,0.06),0 0 0 1px rgba(13,148,136,0.06),inset 0 1px 0 #fff;
          border-color:rgba(13,148,136,0.1);
          background:rgba(255,255,255,0.8);
        }
        .glass-card:hover::before{opacity:1}

        /* Tech chip */
        .tech-chip{
          background:rgba(255,255,255,0.5);
          backdrop-filter:blur(14px) saturate(160%);
          -webkit-backdrop-filter:blur(14px) saturate(160%);
          border:1px solid rgba(255,255,255,0.55);
          box-shadow:0 2px 12px rgba(0,0,0,0.02),inset 0 1px 0 rgba(255,255,255,0.7);
          transition:all 0.4s cubic-bezier(0.23,1,0.32,1);
          transform-style:preserve-3d;
        }
        .tech-chip:hover{
          transform:translateY(-5px) scale(1.03);
          box-shadow:0 16px 40px rgba(0,0,0,0.05),inset 0 1px 0 #fff;
          background:rgba(255,255,255,0.82);
        }

        /* Team card */
        .team-card{
          background:rgba(255,255,255,0.5);
          backdrop-filter:blur(20px) saturate(180%);
          -webkit-backdrop-filter:blur(20px) saturate(180%);
          border:1px solid rgba(255,255,255,0.6);
          box-shadow:0 4px 20px rgba(0,0,0,0.03),inset 0 1px 0 rgba(255,255,255,0.7);
          transition:all 0.5s cubic-bezier(0.23,1,0.32,1);
          transform-style:preserve-3d;
          position:relative;overflow:hidden;
        }
        .team-card::after{
          content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;
          background:conic-gradient(from 0deg,transparent,rgba(13,148,136,0.03),transparent 25%);
          opacity:0;transition:opacity .5s;animation:spinSlow 10s linear infinite paused;
        }
        .team-card:hover{
          transform:translateY(-10px) rotateY(-2deg) rotateX(2deg) scale(1.03);
          box-shadow:0 30px 60px rgba(0,0,0,0.07),0 0 30px rgba(13,148,136,0.03),inset 0 1px 0 #fff;
          background:rgba(255,255,255,0.85);
        }
        .team-card:hover::after{opacity:1;animation-play-state:running}
        .team-card:hover .team-avatar{transform:scale(1.08) translateZ(10px)}
        .team-avatar{transition:all 0.4s cubic-bezier(0.23,1,0.32,1)}
        .team-social{
          transition:all 0.25s ease;cursor:pointer;
          padding:6px;border-radius:8px;
          display:flex;align-items:center;justify-content:center;
        }
        .team-social:hover{
          background:rgba(13,148,136,0.06);
          color:#0D9488!important;
          transform:translateY(-2px);
        }

        /* FAQ container */
        .faq-glass{
          background:rgba(255,255,255,0.55);
          backdrop-filter:blur(22px) saturate(190%);
          -webkit-backdrop-filter:blur(22px) saturate(190%);
          border:1px solid rgba(255,255,255,0.6);
          box-shadow:0 4px 24px rgba(0,0,0,0.03),inset 0 1px 0 rgba(255,255,255,0.8);
        }
        .faq-btn:hover{background:rgba(13,148,136,0.02);border-radius:12px}

        /* Form glass */
        .form-glass{
          background:rgba(255,255,255,0.5);
          backdrop-filter:blur(22px) saturate(190%);
          -webkit-backdrop-filter:blur(22px) saturate(190%);
          border:1px solid rgba(255,255,255,0.6);
          box-shadow:0 4px 24px rgba(0,0,0,0.03),inset 0 1px 0 rgba(255,255,255,0.8);
        }
        .glass-input-about{
          width:100%;padding:13px 16px;
          border:1.5px solid rgba(226,232,240,0.5);
          border-radius:12px;font-size:14px;color:#1E293B;
          outline:none;font-family:inherit;box-sizing:border-box;
          background:rgba(250,251,255,0.5);
          backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
          transition:all 0.3s ease;line-height:1.6;
        }
        .glass-input-about:focus{
          border-color:rgba(13,148,136,0.3);
          box-shadow:0 0 0 4px rgba(13,148,136,0.06),0 4px 16px rgba(0,0,0,0.03);
          background:rgba(255,255,255,0.7);
        }
        .glass-input-about::placeholder{color:#94A3B8}

        /* Submit btn */
        .submit-btn{
          width:100%;padding:16px;border:none;border-radius:14px;
          font-size:15px;font-weight:600;cursor:pointer;
          background:linear-gradient(135deg,#0D9488,#0F766E);color:#fff;
          box-shadow:0 4px 18px rgba(13,148,136,0.22);
          transition:all 0.35s cubic-bezier(0.23,1,0.32,1);
          position:relative;overflow:hidden;
          display:flex;align-items:center;justify-content:center;gap:10px;
        }
        .submit-btn::before{
          content:'';position:absolute;top:0;left:-150%;
          width:120%;height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent);
        }
        .submit-btn:hover{
          transform:translateY(-2px) scale(1.01);
          box-shadow:0 10px 35px rgba(13,148,136,0.3);
        }
        .submit-btn:hover::before{animation:shimmer 0.65s ease forwards}
        .submit-btn:active{transform:translateY(0) scale(0.99)}
        .submit-btn:disabled{opacity:0.6;cursor:not-allowed;transform:none!important}

        /* Mission stat */
        .mission-stat{
          transition:all 0.3s ease;
          padding:8px 0;
        }
        .mission-stat:hover .stat-value{
          transform:scale(1.05);
        }
        .stat-value{
          transition:transform 0.3s cubic-bezier(0.23,1,0.32,1);
          display:inline-block;
        }

        /* Section pill */
        .section-pill{
          display:inline-flex;align-items:center;gap:7px;
          padding:7px 18px;border-radius:100px;
          backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
          margin-bottom:20px;
        }
      `}</style>

      {/* ===== HERO ===== */}
      <section
        style={{
          position: "relative",
          padding: "90px 24px 80px",
          overflow: "hidden",
          background: "linear-gradient(180deg, #F0F4FF 0%, #FAFBFF 100%)",
        }}
      >
        <div className="grid-about" />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(13,148,136,0.15), transparent)", animation: "scanV 10s linear infinite" }} />
          <div style={{ position: "absolute", top: "-12%", right: "-6%", width: 550, height: 550, borderRadius: "50%", background: "radial-gradient(circle, rgba(13,148,136,0.06) 0%, transparent 60%)", filter: "blur(70px)", animation: "orbFloat 22s ease-in-out infinite" }} />
          <div style={{ position: "absolute", bottom: "-18%", left: "-8%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.04) 0%, transparent 60%)", filter: "blur(65px)", animation: "orbFloat 28s ease-in-out infinite", animationDelay: "4s" }} />
          {[
            { t: "12%", r: "8%", w: 80, h: 52 },
            { t: "65%", l: "5%", w: 60, h: 60 },
            { t: "35%", l: "3%", w: 50, h: 38 },
          ].map((r, i) => (
            <div key={i} style={{ position: "absolute", top: r.t, left: (r as any).l, right: (r as any).r, width: r.w, height: r.h, background: "linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1))", backdropFilter: "blur(8px)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.3)", animation: `orbFloat ${18 + i * 3}s ease-in-out infinite`, opacity: 0.4 }} />
          ))}
          {[
            { t: 60, l: 180, s: 8, c: "rgba(13,148,136,0.4)" },
            { t: 120, l: 540, s: 6, c: "rgba(124,58,237,0.3)" },
            { t: 180, l: 780, s: 7, c: "rgba(6,182,212,0.3)" },
          ].map((d, i) => (
            <div key={i} className="g-dot" style={{ top: d.t, left: d.l, width: d.s, height: d.s, background: d.c, boxShadow: `0 0 ${d.s * 2}px ${d.c}`, animationDelay: `${i * 0.6}s` }} />
          ))}
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 22,
              background: "linear-gradient(135deg, #0F766E, #0D9488, #14B8A6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 28px",
              boxShadow: "0 8px 30px rgba(13,148,136,0.2)",
              animation: "fadeInUp 0.7s cubic-bezier(0.23,1,0.32,1) both",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Shield size={30} color="#fff" />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, transparent 35%, rgba(255,255,255,0.15) 50%, transparent 65%)", backgroundSize: "300% 300%", animation: "shimmer 5s ease-in-out infinite" }} />
          </div>

          <h1
            style={{
              fontSize: "clamp(30px, 5vw, 48px)",
              fontWeight: 800,
              color: "#0F172A",
              marginBottom: 18,
              letterSpacing: "-1.5px",
              lineHeight: 1.1,
              animation: "fadeInUp 0.8s cubic-bezier(0.23,1,0.32,1) 0.1s both",
            }}
          >
            Fighting Misinformation
            <br />
            <span style={{ background: "linear-gradient(135deg, #0D9488, #0891B2, #7C3AED)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              with AI Precision
            </span>
          </h1>
          <p
            style={{
              fontSize: 17,
              color: "#64748B",
              lineHeight: 1.75,
              maxWidth: 560,
              margin: "0 auto",
              animation: "fadeInUp 0.8s cubic-bezier(0.23,1,0.32,1) 0.2s both",
            }}
          >
            Credence was built with a simple mission: make fact-checking accessible, fast, and comprehensive for everyone — from journalists to everyday readers.
          </p>
        </div>
      </section>

      <div className="sep" />

      {/* ===== MISSION ===== */}
      <section style={{ position: "relative", padding: "100px 24px", overflow: "hidden", background: "#FFFFFF" }}>
        <div className="grid-about" />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(13,148,136,0.03) 0%, transparent 55%)", filter: "blur(50px)" }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1050, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 48, alignItems: "center" }}>
            {/* Left */}
            <div>
              <div className="section-pill" style={{ background: "rgba(13,148,136,0.06)", border: "1px solid rgba(13,148,136,0.08)" }}>
                <Target size={13} color="#0D9488" />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#0D9488", letterSpacing: "1.2px", textTransform: "uppercase" }}>Our Mission</span>
              </div>
              <h2 style={{ fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 800, color: "#0F172A", marginBottom: 20, letterSpacing: "-1px", lineHeight: 1.15 }}>
                Empowering People to{" "}
                <span style={{ background: "linear-gradient(135deg, #0D9488, #0891B2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Verify Before They Share
                </span>
              </h2>
              <p style={{ fontSize: 15, color: "#64748B", lineHeight: 1.8, marginBottom: 16 }}>
                We believe that access to truth shouldn't require a journalism degree. In a world where AI-generated content is indistinguishable from reality, everyone deserves powerful verification tools.
              </p>
              <p style={{ fontSize: 15, color: "#64748B", lineHeight: 1.8 }}>
                Credence combines state-of-the-art AI models with established fact-check databases to provide the most comprehensive media integrity analysis available today.
              </p>

              {/* Stats */}
              <div style={{ marginTop: 32, display: "flex", gap: 32 }}>
                {[
                  { label: "Accuracy Rate", value: "87%", color: "#0D9488" },
                  { label: "Fact-Check DBs", value: "12+", color: "#7C3AED" },
                  { label: "Content Types", value: "5", color: "#D97706" },
                ].map((stat, i) => (
                  <div key={stat.label} className="mission-stat" style={{ animation: `counterUp 0.6s cubic-bezier(0.23,1,0.32,1) ${0.3 + i * 0.1}s both` }}>
                    <div className="stat-value" style={{ fontSize: 32, fontWeight: 800, color: stat.color, letterSpacing: "-1px" }}>{stat.value}</div>
                    <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500, marginTop: 2 }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[
                { icon: <Brain size={22} color="#1E3A5F" />, title: "Multi-Model AI", desc: "3+ AI models for cross-validation", color: "#1E3A5F" },
                { icon: <Database size={22} color="#0D9488" />, title: "12+ Databases", desc: "Fact-check & credibility DBs", color: "#0D9488" },
                { icon: <Globe size={22} color="#059669" />, title: "Global Coverage", desc: "Sources from 40+ countries", color: "#059669" },
                { icon: <Zap size={22} color="#D97706" />, title: "Real-time", desc: "Analysis in under 10 seconds", color: "#D97706" },
              ].map((card, i) => (
                <div
                  key={card.title}
                  className="glass-card"
                  style={{
                    borderRadius: 18,
                    padding: "24px",
                    animation: `tiltIn 0.6s cubic-bezier(0.23,1,0.32,1) ${0.2 + i * 0.1}s both`,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 13,
                      background: `${card.color}08`,
                      border: `1px solid ${card.color}10`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 14,
                      transition: "all 0.3s ease",
                    }}
                  >
                    {card.icon}
                  </div>
                  <div style={{ fontWeight: 700, color: "#0F172A", fontSize: 15, marginBottom: 5 }}>{card.title}</div>
                  <div style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.5 }}>{card.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="sep" />

      {/* ===== TECH STACK ===== */}
      <section style={{ position: "relative", padding: "100px 24px", overflow: "hidden", background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFF 50%, #FFFFFF 100%)" }}>
        <div className="grid-about" />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: "1px", height: "100%", background: "linear-gradient(180deg, transparent, rgba(13,148,136,0.1), transparent)", animation: "scanH 16s linear infinite" }} />
          <div style={{ position: "absolute", top: "5%", right: "-5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.04) 0%, transparent 55%)", filter: "blur(50px)", animation: "orbFloat 24s ease-in-out infinite" }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1050, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="section-pill" style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.08)" }}>
              <Cpu size={13} color="#7C3AED" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#7C3AED", letterSpacing: "1.2px", textTransform: "uppercase" }}>Technology</span>
            </div>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800, color: "#0F172A", marginBottom: 12, letterSpacing: "-1px", lineHeight: 1.1 }}>
              Powered by <span style={{ background: "linear-gradient(135deg, #7C3AED, #0D9488)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Best-in-Class</span> Technology
            </h2>
            <p style={{ fontSize: 16, color: "#64748B", maxWidth: 480, margin: "0 auto" }}>We integrate with leading AI providers and fact-check databases</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(195px, 1fr))", gap: 14 }}>
            {TECH_STACK.map((tech, i) => (
              <div
                key={tech.name}
                className="tech-chip"
                style={{
                  borderRadius: 16,
                  padding: "18px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  animation: `techPop 0.5s cubic-bezier(0.23,1,0.32,1) ${i * 0.04}s both`,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 11,
                    background: `${tech.color}0A`,
                    border: `1px solid ${tech.color}12`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Cpu size={16} color={tech.color} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{tech.name}</div>
                  <div style={{ fontSize: 11, color: "#94A3B8" }}>{tech.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="sep" />

      {/* ===== TEAM ===== */}
      <section style={{ position: "relative", padding: "100px 24px", overflow: "hidden", background: "#FFFFFF" }}>
        <div className="grid-about" />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{ position: "absolute", bottom: "-10%", left: "-5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(217,119,6,0.03) 0%, transparent 55%)", filter: "blur(50px)", animation: "orbFloat 20s ease-in-out infinite" }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 950, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="section-pill" style={{ background: "rgba(217,119,6,0.06)", border: "1px solid rgba(217,119,6,0.08)" }}>
              <Users size={13} color="#D97706" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#D97706", letterSpacing: "1.2px", textTransform: "uppercase" }}>The Team</span>
            </div>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800, color: "#0F172A", marginBottom: 12, letterSpacing: "-1px", lineHeight: 1.1 }}>
              Built with <span style={{ background: "linear-gradient(135deg, #D97706, #DC2626)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Passion</span>
            </h2>
            <p style={{ fontSize: 16, color: "#64748B" }}>The minds behind Credence</p>
          </div>

          <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
            {TEAM.map((member, i) => (
              <div
                key={member.name}
                className="team-card"
                style={{
                  borderRadius: 22,
                  padding: "32px 28px",
                  textAlign: "center",
                  flex: "1 1 190px",
                  maxWidth: 230,
                  animation: `tiltIn 0.6s cubic-bezier(0.23,1,0.32,1) ${0.1 + i * 0.1}s both`,
                }}
              >
                <div
                  className="team-avatar"
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${member.color}, ${member.color}CC)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 18px",
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#fff",
                    boxShadow: `0 6px 20px ${member.color}25`,
                    position: "relative",
                  }}
                >
                  {member.initials}
                </div>
                <div style={{ fontWeight: 700, color: "#0F172A", marginBottom: 6, fontSize: 16 }}>{member.name}</div>
                <div style={{ fontSize: 13, color: "#94A3B8", marginBottom: 16 }}>{member.role}</div>
                <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                  {[<Twitter size={14} />, <Linkedin size={14} />, <Github size={14} />].map((icon, j) => (
                    <div key={j} className="team-social" style={{ color: "#94A3B8" }}>
                      {icon}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="sep" />

      {/* ===== FAQ ===== */}
      <section style={{ position: "relative", padding: "100px 24px", overflow: "hidden", background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFF 50%, #FFFFFF 100%)" }}>
        <div className="grid-about" />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "50%", right: "-5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(13,148,136,0.04) 0%, transparent 55%)", filter: "blur(50px)", animation: "orbFloat 22s ease-in-out infinite" }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 780, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="section-pill" style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.08)" }}>
              <HelpCircle size={13} color="#0891B2" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#0891B2", letterSpacing: "1.2px", textTransform: "uppercase" }}>FAQ</span>
            </div>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800, color: "#0F172A", marginBottom: 12, letterSpacing: "-1px", lineHeight: 1.1 }}>
              Frequently Asked <span style={{ background: "linear-gradient(135deg, #0891B2, #0D9488)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Questions</span>
            </h2>
            <p style={{ fontSize: 16, color: "#64748B" }}>Everything you need to know about Credence</p>
          </div>

          <div className="faq-glass" style={{ borderRadius: 22, padding: "12px 36px" }}>
            {FAQS.map((faq, i) => (
              <AccordionItem key={i} q={faq.q} a={faq.a} index={i} />
            ))}
          </div>
        </div>
      </section>

      <div className="sep" />

      {/* ===== CONTACT ===== */}
      <section style={{ position: "relative", padding: "100px 24px", overflow: "hidden", background: "#FFFFFF" }}>
        <div className="grid-about" />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(13,148,136,0.03) 0%, transparent 50%)", filter: "blur(50px)" }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="section-pill" style={{ background: "rgba(13,148,136,0.06)", border: "1px solid rgba(13,148,136,0.08)" }}>
              <MessageCircle size={13} color="#0D9488" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#0D9488", letterSpacing: "1.2px", textTransform: "uppercase" }}>Contact</span>
            </div>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800, color: "#0F172A", marginBottom: 12, letterSpacing: "-1px", lineHeight: 1.1 }}>
              Get in <span style={{ background: "linear-gradient(135deg, #0D9488, #0891B2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Touch</span>
            </h2>
            <p style={{ fontSize: 16, color: "#64748B" }}>Questions, feedback, or partnership inquiries? We'd love to hear from you.</p>
          </div>

          {sent && (
            <div
              style={{
                background: "rgba(16,185,129,0.06)",
                border: "1px solid rgba(16,185,129,0.15)",
                borderRadius: 14,
                padding: "16px 20px",
                marginBottom: 28,
                display: "flex",
                alignItems: "center",
                gap: 12,
                backdropFilter: "blur(8px)",
                animation: "successIn 0.4s cubic-bezier(0.23,1,0.32,1) both",
              }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(16,185,129,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle size={16} color="#10B981" />
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#10B981" }}>Message sent! We'll get back to you within 24 hours.</span>
            </div>
          )}

          {error && (
            <div
              style={{
                background: "rgba(239,68,68,0.06)",
                border: "1px solid rgba(239,68,68,0.15)",
                borderRadius: 14,
                padding: "16px 20px",
                marginBottom: 28,
                display: "flex",
                alignItems: "center",
                gap: 12,
                backdropFilter: "blur(8px)",
                animation: "successIn 0.4s cubic-bezier(0.23,1,0.32,1) both",
              }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(239,68,68,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <HelpCircle size={16} color="#EF4444" />
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#EF4444" }}>{error}</span>
            </div>
          )}

          <div className="form-glass" style={{ borderRadius: 22, padding: "36px" }}>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#0F172A", marginBottom: 8 }}>Full Name</label>
                  <input type="text" placeholder="John Doe" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required className="glass-input-about" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#0F172A", marginBottom: 8 }}>Email Address</label>
                  <input type="email" placeholder="john@example.com" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required className="glass-input-about" />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#0F172A", marginBottom: 8 }}>Subject</label>
                <input type="text" placeholder="How can we help?" value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} required className="glass-input-about" />
              </div>

              <div style={{ marginBottom: 28 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#0F172A", marginBottom: 8 }}>Message</label>
                <textarea rows={6} placeholder="Tell us more about your inquiry..." value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} required className="glass-input-about" style={{ resize: "vertical" }} />
              </div>

              <button type="submit" className="submit-btn" disabled={sending}>
                {sending ? (
                  <>
                    <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Send Message
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}