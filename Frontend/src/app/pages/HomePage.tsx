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
  ArrowRight,
  Shield,
  Search,
  BarChart2,
  Twitter,
  Github,
  Linkedin,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Scan,
  Lock,
} from "lucide-react";

export function HomePage() {
  return (
    <div style={{ backgroundColor: "#FAFBFF", color: "#1E293B", overflowX: "hidden" }}>
      <style>{`
        /* ===== KEYFRAMES ===== */
        @keyframes float1 {
          0%,100%{transform:translate(0,0)}
          25%{transform:translate(25px,-40px)}
          50%{transform:translate(-15px,-65px)}
          75%{transform:translate(35px,-20px)}
        }
        @keyframes float2 {
          0%,100%{transform:translate(0,0)}
          25%{transform:translate(-35px,25px)}
          50%{transform:translate(25px,50px)}
          75%{transform:translate(-15px,35px)}
        }
        @keyframes float3 {
          0%,100%{transform:translate(0,0)}
          33%{transform:translate(40px,25px)}
          66%{transform:translate(-25px,-35px)}
        }
        @keyframes float4 {
          0%,100%{transform:translate(0,0) rotate(0deg)}
          25%{transform:translate(8px,-15px) rotate(3deg)}
          50%{transform:translate(-12px,8px) rotate(-2deg)}
          75%{transform:translate(15px,12px) rotate(2deg)}
        }
        @keyframes fadeInUp {
          from{opacity:0;transform:translateY(50px) scale(0.97)}
          to{opacity:1;transform:translateY(0) scale(1)}
        }
        @keyframes gradientShift {
          0%{background-position:0% 50%}
          50%{background-position:100% 50%}
          100%{background-position:0% 50%}
        }
        @keyframes gridPulse {
          0%,100%{opacity:.35}
          50%{opacity:.85}
        }
        @keyframes scanV {
          0%{transform:translateY(-100%);opacity:0}
          10%{opacity:1}
          90%{opacity:1}
          100%{transform:translateY(100%);opacity:0}
        }
        @keyframes scanH {
          0%{transform:translateX(-100%);opacity:0}
          10%{opacity:1}
          90%{opacity:1}
          100%{transform:translateX(100%);opacity:0}
        }
        @keyframes glowPulse {
          0%,100%{opacity:0.4;transform:scale(1)}
          50%{opacity:0.7;transform:scale(1.05)}
        }
        @keyframes orbFloat {
          0%,100%{transform:translate(0,0) scale(1);opacity:0.6}
          33%{transform:translate(30px,-20px) scale(1.08);opacity:0.8}
          66%{transform:translate(-20px,15px) scale(0.95);opacity:0.5}
        }
        @keyframes shimmer {
          0%{left:-150%}
          100%{left:150%}
        }
        @keyframes tiltIn {
          from{opacity:0;transform:perspective(1200px) rotateX(8deg) translateY(40px)}
          to{opacity:1;transform:perspective(1200px) rotateX(0deg) translateY(0)}
        }
        @keyframes borderGlow {
          0%,100%{border-color:rgba(13,148,136,0.08)}
          50%{border-color:rgba(13,148,136,0.2)}
        }
        @keyframes spinSlow {
          to{transform:rotate(360deg)}
        }
        @keyframes breathe {
          0%,100%{transform:scale(1);opacity:0.5}
          50%{transform:scale(1.15);opacity:0.8}
        }

        /* ===== ENTRANCE ===== */
        .hero-badge{animation:fadeInUp .8s cubic-bezier(.22,1,.36,1) both}
        .hero-title{animation:fadeInUp .9s cubic-bezier(.22,1,.36,1) .12s both}
        .hero-sub{animation:fadeInUp .9s cubic-bezier(.22,1,.36,1) .24s both}
        .hero-btn{animation:fadeInUp .9s cubic-bezier(.22,1,.36,1) .36s both}
        .hero-trust{animation:fadeInUp .9s cubic-bezier(.22,1,.36,1) .48s both}
        .stats-row{animation:tiltIn 1s cubic-bezier(.22,1,.36,1) .6s both}

        /* ===== GRADIENT TEXT ===== */
        .grad-teal {
          background:linear-gradient(135deg,#0D9488 0%,#0891B2 40%,#7C3AED 80%,#0D9488 100%);
          background-size:300% auto;
          animation:gradientShift 8s ease-in-out infinite;
          -webkit-background-clip:text;
          -webkit-text-fill-color:transparent;
          background-clip:text;
        }
        .grad-warm {
          background:linear-gradient(135deg,#DC2626,#D97706,#DC2626);
          background-size:200% auto;
          animation:gradientShift 5s ease-in-out infinite;
          -webkit-background-clip:text;
          -webkit-text-fill-color:transparent;
          background-clip:text;
        }

        /* ===== GRID BG LIGHT ===== */
        .grid-light {
          position:absolute;inset:0;pointer-events:none;overflow:hidden;
        }
        .grid-light::before {
          content:'';position:absolute;inset:0;
          background-image:
            linear-gradient(rgba(15,23,42,0.04) 1px,transparent 1px),
            linear-gradient(90deg,rgba(15,23,42,0.04) 1px,transparent 1px);
          background-size:60px 60px;
        }
        .grid-light::after {
          content:'';position:absolute;inset:0;
          background-image:
            linear-gradient(rgba(13,148,136,0.03) 1px,transparent 1px),
            linear-gradient(90deg,rgba(13,148,136,0.03) 1px,transparent 1px);
          background-size:180px 180px;
        }

        /* ===== GRID BG DARK ===== */
        .grid-dark {
          position:absolute;inset:0;pointer-events:none;overflow:hidden;
        }
        .grid-dark::before {
          content:'';position:absolute;inset:0;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),
            linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px);
          background-size:60px 60px;
        }
        .grid-dark::after {
          content:'';position:absolute;inset:0;
          background-image:
            linear-gradient(rgba(20,184,166,0.03) 1px,transparent 1px),
            linear-gradient(90deg,rgba(20,184,166,0.03) 1px,transparent 1px);
          background-size:180px 180px;
        }

        /* ===== 3D GLASS CARDS ===== */
        .card-3d {
          background:rgba(255,255,255,0.6);
          backdrop-filter:blur(24px) saturate(200%);
          -webkit-backdrop-filter:blur(24px) saturate(200%);
          border:1px solid rgba(255,255,255,0.7);
          box-shadow:
            0 4px 24px rgba(0,0,0,0.04),
            0 1px 3px rgba(0,0,0,0.03),
            inset 0 1px 0 rgba(255,255,255,0.9);
          transition:all .5s cubic-bezier(.23,1,.32,1);
          transform-style:preserve-3d;
          perspective:1000px;
          position:relative;
          overflow:hidden;
        }
        .card-3d::before {
          content:'';position:absolute;top:0;left:0;right:0;height:3px;
          background:linear-gradient(90deg,transparent,#0D9488,#7C3AED,transparent);
          background-size:200% 100%;
          animation:gradientShift 4s linear infinite;
          transform:scaleX(0);transform-origin:left;
          transition:transform .5s cubic-bezier(.23,1,.32,1);
        }
        .card-3d::after {
          content:'';position:absolute;inset:0;
          background:linear-gradient(135deg,rgba(13,148,136,0.03),transparent 50%,rgba(124,58,237,0.02));
          opacity:0;transition:opacity .4s ease;
          border-radius:inherit;
        }
        .card-3d:hover {
          transform:translateY(-12px) rotateX(2deg) rotateY(-1deg) scale(1.01);
          box-shadow:
            0 35px 70px rgba(0,0,0,0.08),
            0 15px 35px rgba(13,148,136,0.06),
            0 0 0 1px rgba(13,148,136,0.08),
            inset 0 1px 0 #fff;
          border-color:rgba(13,148,136,0.12);
          background:rgba(255,255,255,0.85);
        }
        .card-3d:hover::before{transform:scaleX(1)}
        .card-3d:hover::after{opacity:1}

        .stat-card {
          background:rgba(255,255,255,0.55);
          backdrop-filter:blur(20px) saturate(180%);
          -webkit-backdrop-filter:blur(20px) saturate(180%);
          border:1px solid rgba(255,255,255,0.65);
          box-shadow:
            0 4px 20px rgba(0,0,0,0.03),
            inset 0 1px 0 rgba(255,255,255,0.8);
          transition:all .4s cubic-bezier(.23,1,.32,1);
          transform-style:preserve-3d;
        }
        .stat-card:hover {
          transform:translateY(-7px) rotateX(1.5deg) scale(1.02);
          box-shadow:
            0 25px 55px rgba(0,0,0,0.07),
            0 0 30px rgba(13,148,136,0.04),
            inset 0 1px 0 #fff;
          border-color:rgba(13,148,136,0.1);
          background:rgba(255,255,255,0.82);
        }

        .step-card {
          background:rgba(255,255,255,0.5);
          backdrop-filter:blur(20px) saturate(180%);
          -webkit-backdrop-filter:blur(20px) saturate(180%);
          border:1px solid rgba(255,255,255,0.6);
          box-shadow:
            0 4px 20px rgba(0,0,0,0.03),
            inset 0 1px 0 rgba(255,255,255,0.7);
          transition:all .5s cubic-bezier(.23,1,.32,1);
          transform-style:preserve-3d;
          position:relative;
          overflow:hidden;
        }
        .step-card::before {
          content:'';position:absolute;bottom:0;left:0;right:0;height:3px;
          background:linear-gradient(90deg,transparent,var(--accent,#0D9488),transparent);
          opacity:0;transition:opacity .4s;
        }
        .step-card:hover {
          transform:translateY(-10px) rotateX(2deg) scale(1.02);
          box-shadow:
            0 30px 60px rgba(0,0,0,0.07),
            0 0 30px rgba(13,148,136,0.04),
            inset 0 1px 0 #fff;
          border-color:rgba(13,148,136,0.1);
          background:rgba(255,255,255,0.85);
        }
        .step-card:hover::before{opacity:1}

        .media-3d {
          background:rgba(255,255,255,0.5);
          backdrop-filter:blur(20px) saturate(180%);
          -webkit-backdrop-filter:blur(20px) saturate(180%);
          border:1px solid rgba(255,255,255,0.6);
          box-shadow:
            0 4px 20px rgba(0,0,0,0.03),
            inset 0 1px 0 rgba(255,255,255,0.7);
          transition:all .5s cubic-bezier(.23,1,.32,1);
          transform-style:preserve-3d;
          position:relative;
          overflow:hidden;
        }
        .media-3d::after {
          content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;
          background:conic-gradient(from 0deg,transparent,rgba(13,148,136,0.04),transparent 25%);
          opacity:0;transition:opacity .5s;animation:spinSlow 10s linear infinite paused;
        }
        .media-3d:hover {
          transform:translateY(-12px) rotateY(-3deg) rotateX(2deg) scale(1.05);
          box-shadow:
            0 35px 65px rgba(0,0,0,0.08),
            0 0 40px rgba(13,148,136,0.05),
            inset 0 1px 0 #fff;
          border-color:rgba(13,148,136,0.12);
          background:rgba(255,255,255,0.88);
        }
        .media-3d:hover::after{opacity:1;animation-play-state:running}

        /* ===== BUTTONS ===== */
        .btn-glow {
          position:relative;overflow:hidden;
          transition:all .35s cubic-bezier(.23,1,.32,1);
          transform-style:preserve-3d;
        }
        .btn-glow::before {
          content:'';position:absolute;top:0;left:-150%;
          width:120%;height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent);
        }
        .btn-glow:hover {
          transform:translateY(-3px) scale(1.03);
          box-shadow:0 16px 45px rgba(13,148,136,0.3),0 0 25px rgba(13,148,136,0.1);
        }
        .btn-glow:hover::before{animation:shimmer .7s ease forwards}
        .btn-glow:active{transform:translateY(-1px) scale(1.01)}

        .btn-outline {
          transition:all .35s cubic-bezier(.23,1,.32,1);
        }
        .btn-outline:hover {
          transform:translateY(-3px) scale(1.03);
          background:rgba(15,23,42,0.04)!important;
          border-color:rgba(13,148,136,0.25)!important;
          box-shadow:0 12px 35px rgba(0,0,0,0.06);
        }

        /* ===== FOOTER ===== */
        .f-link{transition:all .25s ease;display:inline-block}
        .f-link:hover{color:#0D9488!important;transform:translateX(4px)}
        .s-icon{transition:all .3s cubic-bezier(.23,1,.32,1)}
        .s-icon:hover{color:#0D9488!important;transform:translateY(-4px) scale(1.15)}

        /* ===== DOTS ===== */
        .g-dot {
          position:absolute;border-radius:50%;
          animation:gridPulse 4s ease-in-out infinite;
        }

        /* ===== SEPARATOR ===== */
        .sep {
          height:1px;max-width:900px;margin:0 auto;
          background:linear-gradient(90deg,transparent,rgba(13,148,136,0.12),rgba(124,58,237,0.08),transparent);
        }

        /* ===== ICON BOX ===== */
        .ico {
          display:flex;align-items:center;justify-content:center;
          border-radius:16px;transition:all .4s ease;
        }
        .card-3d:hover .ico,
        .step-card:hover .ico,
        .media-3d:hover .ico {
          transform:scale(1.1) translateZ(12px);
        }

        /* ===== TRUST ===== */
        .trust{display:flex;align-items:center;gap:6px;color:#64748B;font-size:13px;transition:color .3s}
        .trust:hover{color:#0F172A}

        /* ===== STEP NUM ===== */
        .snum {
          display:inline-flex;align-items:center;justify-content:center;
          width:38px;height:38px;border-radius:12px;
          font-size:13px;font-weight:800;color:#fff;
          position:relative;
        }
        .snum::after {
          content:'';position:absolute;inset:-4px;border-radius:15px;
          background:inherit;filter:blur(10px);opacity:0.3;z-index:-1;
        }

        /* ===== TAG ===== */
        .tag {
          font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;
          padding:4px 10px;border-radius:6px;
        }
      `}</style>

      {/* ================================================ */}
      {/* ==================== HERO ====================== */}
      {/* ================================================ */}
      <section
        style={{
          position: "relative",
          padding: "140px 24px 120px",
          textAlign: "center",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #F0F4FF 0%, #FAFBFF 50%, #FFFFFF 100%)",
        }}
      >
        <div className="grid-light" />

        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          {/* Scan lines */}
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(13,148,136,0.18), rgba(124,58,237,0.12), transparent)", animation: "scanV 10s linear infinite" }} />
          <div style={{ position: "absolute", top: 0, left: 0, width: "1px", height: "100%", background: "linear-gradient(180deg, transparent, rgba(13,148,136,0.12), transparent)", animation: "scanH 14s linear infinite" }} />

          {/* Orbs */}
          <div style={{ position: "absolute", top: "-12%", right: "-6%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(13,148,136,0.08) 0%, transparent 60%)", filter: "blur(80px)", animation: "orbFloat 22s ease-in-out infinite" }} />
          <div style={{ position: "absolute", bottom: "-18%", left: "-8%", width: 680, height: 680, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 60%)", filter: "blur(80px)", animation: "orbFloat 28s ease-in-out infinite", animationDelay: "4s" }} />
          <div style={{ position: "absolute", top: "35%", left: "52%", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 55%)", filter: "blur(60px)", animation: "orbFloat 18s ease-in-out infinite", animationDelay: "7s" }} />
          <div style={{ position: "absolute", top: "15%", left: "20%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(217,119,6,0.04) 0%, transparent 55%)", filter: "blur(45px)", animation: "orbFloat 20s ease-in-out infinite", animationDelay: "2s" }} />

          {/* Glass rectangles */}
          {[
            { t: "8%", r: "7%", w: 110, h: 70, a: "float4", d: "20s", o: 0.45 },
            { t: "62%", l: "4%", w: 80, h: 80, a: "float1", d: "24s", o: 0.35 },
            { t: "48%", r: "16%", w: 60, h: 95, a: "float2", d: "18s", o: 0.3 },
            { t: "22%", l: "3%", w: 65, h: 50, a: "float3", d: "22s", o: 0.35 },
            { t: "75%", l: "28%", w: 100, h: 45, a: "float4", d: "26s", o: 0.25 },
            { t: "40%", r: "3%", w: 45, h: 45, a: "float1", d: "28s", o: 0.2 },
          ].map((r, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: r.t, left: (r as any).l, right: (r as any).r,
                width: r.w, height: r.h,
                background: "linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.15))",
                backdropFilter: "blur(10px)",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.5)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.8)",
                animation: `${r.a} ${r.d} ease-in-out infinite`,
                opacity: r.o,
              }}
            />
          ))}

          {/* Grid dots */}
          {[
            { t: 60, l: 180, s: 10, c: "rgba(13,148,136,0.45)" },
            { t: 180, l: 420, s: 7, c: "rgba(124,58,237,0.35)" },
            { t: 360, l: 120, s: 8, c: "rgba(6,182,212,0.35)" },
            { t: 120, l: 660, s: 7, c: "rgba(217,119,6,0.4)" },
            { t: 300, l: 840, s: 6, c: "rgba(16,185,129,0.35)" },
            { t: 420, l: 300, s: 8, c: "rgba(13,148,136,0.3)" },
            { t: 240, l: 960, s: 6, c: "rgba(124,58,237,0.25)" },
            { t: 480, l: 540, s: 10, c: "rgba(6,182,212,0.35)" },
            { t: 540, l: 780, s: 7, c: "rgba(13,148,136,0.25)" },
          ].map((d, i) => (
            <div
              key={i}
              className="g-dot"
              style={{
                top: d.t, left: d.l,
                width: d.s, height: d.s,
                background: d.c,
                boxShadow: `0 0 ${d.s * 2}px ${d.c}`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}

          {/* Grid accent rectangles */}
          <div style={{ position: "absolute", top: 120, left: 60, width: 120, height: 60, border: "1px solid rgba(13,148,136,0.06)", borderRadius: 4, animation: "float4 30s ease-in-out infinite" }} />
          <div style={{ position: "absolute", top: 300, right: 120, width: 180, height: 120, border: "1px solid rgba(124,58,237,0.04)", borderRadius: 4, animation: "float1 28s ease-in-out infinite" }} />
          <div style={{ position: "absolute", bottom: 180, left: 240, width: 60, height: 120, border: "1px solid rgba(6,182,212,0.05)", borderRadius: 4, animation: "float3 32s ease-in-out infinite" }} />
        </div>

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto" }}>
          <div
            className="hero-badge"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "9px 22px",
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(13,148,136,0.1)",
              borderRadius: 100, marginBottom: 40,
              boxShadow: "0 2px 16px rgba(13,148,136,0.06), inset 0 1px 0 #fff",
            }}
          >
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#0D9488", boxShadow: "0 0 10px rgba(13,148,136,0.4)", animation: "breathe 3s ease-in-out infinite" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#0D9488", letterSpacing: "0.5px" }}>
              AI-Powered Media Integrity
            </span>
          </div>

          <h1
            className="hero-title"
            style={{
              fontSize: "clamp(44px, 8vw, 82px)",
              fontWeight: 800,
              color: "#0F172A",
              lineHeight: 1.05,
              letterSpacing: "-3px",
              marginBottom: 28,
            }}
          >
            Don't Get{" "}
            <span className="grad-warm">Fooled.</span>
            <br />
            <span className="grad-teal">Verify Everything.</span>
          </h1>

          <p
            className="hero-sub"
            style={{
              fontSize: "clamp(17px, 2.2vw, 20px)",
              color: "#64748B",
              lineHeight: 1.75,
              maxWidth: 640,
              margin: "0 auto 48px",
            }}
          >
            Detect fake news, deepfakes, AI-generated media, and manipulated content
            across <strong style={{ color: "#334155" }}>text and images</strong> — all in one platform.
          </p>

          <div className="hero-btn" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
            <Link
              to="/analyze"
              className="btn-glow"
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "17px 36px",
                background: "linear-gradient(135deg, #0D9488, #0F766E)",
                color: "#fff", borderRadius: 14,
                textDecoration: "none", fontSize: 16, fontWeight: 600,
                boxShadow: "0 4px 24px rgba(13,148,136,0.25)",
                border: "none",
              }}
            >
              <Scan size={18} /> Start Analyzing <ArrowRight size={17} />
            </Link>
            <Link
              to="/about"
              className="btn-outline"
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "17px 36px",
                background: "rgba(255,255,255,0.6)",
                backdropFilter: "blur(14px)",
                color: "#0F172A",
                border: "1.5px solid rgba(15,23,42,0.1)",
                borderRadius: 14, textDecoration: "none",
                fontSize: 16, fontWeight: 600,
                boxShadow: "inset 0 1px 0 #fff",
              }}
            >
              <Play size={16} fill="#0F172A" /> Watch Demo
            </Link>
          </div>

          <div className="hero-trust" style={{ display: "flex", gap: 28, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { icon: <Lock size={14} />, text: "End-to-end Encrypted" },
              { icon: <CheckCircle2 size={14} />, text: "99.2% Detection Rate" },
              { icon: <Zap size={14} />, text: "Real-time Results" },
            ].map((t) => (
              <div key={t.text} className="trust">
                <span style={{ color: "#0D9488" }}>{t.icon}</span>
                {t.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== STATS ==================== */}
      <section style={{ padding: "0 24px 100px", position: "relative", background: "#FFFFFF" }}>
        <div
          className="stats-row"
          style={{
            maxWidth: 1140, margin: "-40px auto 0",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 16,
          }}
        >
          {[
            { icon: <Layers size={22} color="#0D9488" />, title: "3 Media Types", sub: "Text, URL, Image", c: "#0D9488" },
            { icon: <Zap size={22} color="#D97706" />, title: "Real-time Analysis", sub: "Results in under 5 seconds", c: "#D97706" },
            { icon: <Brain size={22} color="#7C3AED" />, title: "Multi-AI Engine", sub: "Cross-reference 12+ databases", c: "#7C3AED" },
          ].map((s) => (
            <div key={s.title} className="stat-card" style={{ borderRadius: 18, padding: "26px 22px", display: "flex", alignItems: "center", gap: 16 }}>
              <div className="ico" style={{ width: 50, height: 50, background: `${s.c}0A`, border: `1px solid ${s.c}12`, flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: "#0F172A", fontSize: 15 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 3 }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="sep" />

      {/* ==================== FEATURES ==================== */}
      <section style={{ position: "relative", padding: "100px 24px", overflow: "hidden", background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFF 50%, #FFFFFF 100%)" }}>
        <div className="grid-light" />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "5%", right: "-8%", width: 550, height: 550, borderRadius: "50%", background: "radial-gradient(circle, rgba(13,148,136,0.06) 0%, transparent 60%)", filter: "blur(70px)", animation: "orbFloat 24s ease-in-out infinite" }} />
          <div style={{ position: "absolute", bottom: "0", left: "-10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.04) 0%, transparent 60%)", filter: "blur(65px)", animation: "orbFloat 28s ease-in-out infinite", animationDelay: "5s" }} />
          {/* scan */}
          <div style={{ position: "absolute", top: 0, left: 0, width: "1px", height: "100%", background: "linear-gradient(180deg, transparent, rgba(13,148,136,0.1), transparent)", animation: "scanH 18s linear infinite" }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1140, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 18px", background: "rgba(13,148,136,0.06)", backdropFilter: "blur(10px)", borderRadius: 100, marginBottom: 20, border: "1px solid rgba(13,148,136,0.08)" }}>
              <Shield size={13} color="#0D9488" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#0D9488", letterSpacing: "1.2px", textTransform: "uppercase" }}>Detection Suite</span>
            </div>
            <h2 style={{ fontSize: "clamp(30px, 5vw, 48px)", fontWeight: 800, color: "#0F172A", letterSpacing: "-1.5px", marginBottom: 16, lineHeight: 1.1 }}>
              What Can Credence <span className="grad-teal">Detect?</span>
            </h2>
            <p style={{ fontSize: 17, color: "#64748B", maxWidth: 540, margin: "0 auto", lineHeight: 1.65 }}>
              Comprehensive media integrity analysis powered by cutting-edge AI models and global fact-check databases.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))", gap: 20 }}>
            {[
              { icon: <Newspaper size={22} color="#DC2626" />, c: "#DC2626", title: "Fake News Detection", desc: "Analyze articles and claims against fact-check databases with AI-powered reasoning and source verification.", tag: "Text · URL" },
              { icon: <Image size={22} color="#0891B2" />, c: "#0891B2", title: "AI-Generated Images", desc: "Detect MidJourney, DALL-E, Stable Diffusion outputs with forensic pixel analysis and model fingerprinting.", tag: "Image" },
              { icon: <Layers size={22} color="#7C3AED" />, c: "#7C3AED", title: "Manipulated Media", desc: "EXIF metadata inspection, Error Level Analysis, and forensic tampering detection for edited content.", tag: "Image · Video" },
            ].map((f) => (
              <div key={f.title} className="card-3d" style={{ borderRadius: 22, padding: "34px 30px" }}>
                <div className="ico" style={{ width: 52, height: 52, background: `${f.c}08`, border: `1px solid ${f.c}10`, marginBottom: 22 }}>
                  {f.icon}
                </div>
                <div style={{ fontWeight: 700, color: "#0F172A", marginBottom: 10, fontSize: 18 }}>{f.title}</div>
                <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.8, marginBottom: 18 }}>{f.desc}</p>
                <span className="tag" style={{ background: `${f.c}08`, color: f.c, border: `1px solid ${f.c}12` }}>
                  {f.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="sep" />

      {/* ==================== HOW IT WORKS ==================== */}
      <section style={{ position: "relative", padding: "100px 24px", overflow: "hidden", background: "#FFFFFF" }}>
        <div className="grid-light" />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.04) 0%, transparent 55%)", filter: "blur(60px)" }} />
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(13,148,136,0.15), transparent)", animation: "scanV 12s linear infinite" }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1140, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 18px", background: "rgba(124,58,237,0.05)", backdropFilter: "blur(10px)", borderRadius: 100, marginBottom: 20, border: "1px solid rgba(124,58,237,0.08)" }}>
              <Zap size={13} color="#7C3AED" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#7C3AED", letterSpacing: "1.2px", textTransform: "uppercase" }}>How It Works</span>
            </div>
            <h2 style={{ fontSize: "clamp(30px, 5vw, 48px)", fontWeight: 800, color: "#0F172A", letterSpacing: "-1.5px", marginBottom: 16, lineHeight: 1.1 }}>
              Four Steps to <span className="grad-teal">Truth</span>
            </h2>
            <p style={{ fontSize: 17, color: "#64748B", lineHeight: 1.65 }}>From upload to verified report in seconds</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
            {[
              { step: "01", title: "Upload or Paste", desc: "Drop a file, paste text, enter a URL, or upload any media — we handle all formats seamlessly.", icon: <FileText size={22} color="#0D9488" />, c: "#0D9488" },
              { step: "02", title: "AI Processes", desc: "Multi-model AI runs OCR, content extraction, media fingerprinting, and deep analysis simultaneously.", icon: <Brain size={22} color="#7C3AED" />, c: "#7C3AED" },
              { step: "03", title: "Cross-Reference", desc: "Results verified against fact-check databases, reverse image search, and source credibility scoring.", icon: <Search size={22} color="#D97706" />, c: "#D97706" },
              { step: "04", title: "Get Your Report", desc: "Receive a detailed trust score with evidence, red flags, source analysis, and actionable steps.", icon: <BarChart2 size={22} color="#059669" />, c: "#059669" },
            ].map((item) => (
              <div key={item.step} className="step-card" style={{ "--accent": item.c, borderRadius: 22, padding: "34px 28px", textAlign: "center" } as React.CSSProperties}>
                <div className="snum" style={{ background: `linear-gradient(135deg, ${item.c}, ${item.c}BB)`, marginBottom: 22, boxShadow: `0 4px 18px ${item.c}25` }}>
                  {item.step}
                </div>
                <div className="ico" style={{ width: 56, height: 56, background: `${item.c}08`, border: `1px solid ${item.c}0D`, margin: "0 auto 18px" }}>
                  {item.icon}
                </div>
                <div style={{ fontWeight: 700, color: "#0F172A", marginBottom: 10, fontSize: 18 }}>{item.title}</div>
                <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.8 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 60 }}>
            <Link to="/analyze" className="btn-glow" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "16px 34px", background: "linear-gradient(135deg, #1E3A5F, #2D4A6F)", color: "#fff", borderRadius: 14, textDecoration: "none", fontSize: 16, fontWeight: 600, boxShadow: "0 4px 24px rgba(30,58,95,0.2)" }}>
              Try It Now <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <div className="sep" />

      {/* ==================== MEDIA TYPES ==================== */}
      <section style={{ position: "relative", padding: "100px 24px", overflow: "hidden", background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFF 50%, #FFFFFF 100%)" }}>
        <div className="grid-light" />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-10%", left: "-5%", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle, rgba(217,119,6,0.04) 0%, transparent 55%)", filter: "blur(55px)", animation: "orbFloat 22s ease-in-out infinite" }} />
          <div style={{ position: "absolute", bottom: "-5%", right: "-3%", width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(5,150,105,0.04) 0%, transparent 55%)", filter: "blur(55px)", animation: "orbFloat 20s ease-in-out infinite", animationDelay: "5s" }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1140, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 18px", background: "rgba(217,119,6,0.06)", backdropFilter: "blur(10px)", borderRadius: 100, marginBottom: 20, border: "1px solid rgba(217,119,6,0.08)" }}>
              <Layers size={13} color="#D97706" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#D97706", letterSpacing: "1.2px", textTransform: "uppercase" }}>Supported Formats</span>
            </div>
            <h2 style={{ fontSize: "clamp(28px, 4.5vw, 44px)", fontWeight: 800, color: "#0F172A", letterSpacing: "-1px", marginBottom: 14, lineHeight: 1.1 }}>
              One Platform, <span className="grad-teal">Every Format</span>
            </h2>
            <p style={{ fontSize: 16, color: "#64748B", lineHeight: 1.6 }}>Analyze any type of content seamlessly</p>
          </div>

          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", justifyContent: "center" }}>
            {[
              { icon: <FileText size={28} color="#0891B2" />, label: "Text", desc: "Articles, claims, social posts", c: "#0891B2" },
              { icon: <Link2 size={28} color="#0D9488" />, label: "URL", desc: "Any web page or article link", c: "#0D9488" },
              { icon: <Image size={28} color="#D97706" />, label: "Image", desc: "PNG, JPG, WEBP up to 10MB", c: "#D97706" },
            ].map((m) => (
              <div key={m.label} className="media-3d" style={{ borderRadius: 24, padding: "38px 28px", textAlign: "center", minWidth: 180, flex: "1 1 180px", maxWidth: 220 }}>
                <div className="ico" style={{ width: 66, height: 66, background: `${m.c}08`, border: `1px solid ${m.c}0D`, borderRadius: 20, margin: "0 auto 18px" }}>
                  {m.icon}
                </div>
                <div style={{ fontWeight: 700, color: "#0F172A", marginBottom: 8, fontSize: 17 }}>{m.label}</div>
                <div style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.55 }}>{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section style={{ position: "relative", padding: "120px 24px", overflow: "hidden", textAlign: "center", background: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)" }}>
        <div className="grid-dark" />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(20,184,166,0.25), rgba(124,58,237,0.15), transparent)", animation: "scanV 8s linear infinite" }} />
          <div style={{ position: "absolute", top: "-20%", right: "-8%", width: 550, height: 550, borderRadius: "50%", background: "radial-gradient(circle, rgba(13,148,136,0.12) 0%, transparent 55%)", filter: "blur(70px)", animation: "orbFloat 18s ease-in-out infinite" }} />
          <div style={{ position: "absolute", bottom: "-25%", left: "-10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 55%)", filter: "blur(70px)", animation: "orbFloat 22s ease-in-out infinite", animationDelay: "4s" }} />
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 300, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(13,148,136,0.06) 0%, transparent 65%)", filter: "blur(50px)", animation: "glowPulse 6s ease-in-out infinite" }} />

          {/* Floating glass rectangles */}
          {[
            { t: "15%", l: "8%", w: 70, h: 45 },
            { t: "70%", r: "10%", w: 55, h: 80 },
            { t: "55%", l: "25%", w: 40, h: 40 },
          ].map((r, i) => (
            <div key={i} style={{ position: "absolute", top: r.t, left: (r as any).l, right: (r as any).r, width: r.w, height: r.h, background: "rgba(255,255,255,0.02)", backdropFilter: "blur(6px)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.04)", animation: `float${(i % 4) + 1} ${18 + i * 2}s ease-in-out infinite` }} />
          ))}
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 660, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 76, height: 76, borderRadius: 24, background: "rgba(13,148,136,0.08)", border: "1px solid rgba(13,148,136,0.12)", marginBottom: 36, backdropFilter: "blur(12px)", boxShadow: "0 0 40px rgba(13,148,136,0.08)" }}>
            <ShieldCheck size={34} color="#14B8A6" />
          </div>
          <h2 style={{ fontSize: "clamp(30px, 5.5vw, 52px)", fontWeight: 800, color: "#F1F5F9", marginBottom: 20, letterSpacing: "-1.5px", lineHeight: 1.1 }}>
            Ready to Verify{" "}
            <span style={{ background: "linear-gradient(135deg, #14B8A6, #06B6D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Truth?</span>
          </h2>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", marginBottom: 44, lineHeight: 1.7, maxWidth: 520, margin: "0 auto 44px" }}>
            Join journalists, researchers, and millions of users fighting misinformation worldwide.
          </p>
          <Link
            to="/analyze"
            className="btn-glow"
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "18px 42px",
              background: "linear-gradient(135deg, #0D9488, #14B8A6)",
              color: "#fff", borderRadius: 16,
              textDecoration: "none", fontSize: 17, fontWeight: 600,
              boxShadow: "0 6px 35px rgba(13,148,136,0.3), 0 0 60px rgba(13,148,136,0.08)",
            }}
          >
            <Shield size={18} /> Start Analyzing Now <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer style={{ background: "linear-gradient(180deg, #0F172A 0%, #0B1120 100%)", color: "rgba(255,255,255,0.7)", padding: "72px 24px 40px", position: "relative", overflow: "hidden" }}>
        <div className="grid-dark" />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "-40%", left: "50%", transform: "translateX(-50%)", width: 800, height: 350, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(13,148,136,0.03) 0%, transparent 65%)", filter: "blur(50px)" }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1140, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 48, marginBottom: 56 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <div style={{ width: 38, height: 38, background: "linear-gradient(135deg, #0D9488, #14B8A6)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 18px rgba(13,148,136,0.25)" }}>
                  <Shield size={18} color="#fff" />
                </div>
                <span style={{ fontWeight: 700, fontSize: 20, color: "#F1F5F9" }}>Credence</span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.75, color: "#475569", maxWidth: 260 }}>
                AI-powered platform fighting misinformation across all content types with cutting-edge detection.
              </p>
            </div>

            {[
              { heading: "Platform", items: [{ label: "Analyze", to: "/analyze" }, { label: "API Docs", to: "/about" }, { label: "Integrations", to: "/about" }] },
              { heading: "Company", items: [{ label: "About", to: "/about" }, { label: "Blog", to: "/about" }, { label: "Careers", to: "/about" }, { label: "Press", to: "/about" }] },
              { heading: "Legal", items: [{ label: "Privacy Policy", to: "#" }, { label: "Terms of Service", to: "#" }, { label: "Cookie Policy", to: "#" }] },
            ].map((col) => (
              <div key={col.heading}>
                <div style={{ fontWeight: 700, color: "#94A3B8", marginBottom: 20, fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase" }}>
                  {col.heading}
                </div>
                {col.items.map((l) => (
                  <div key={l.label} style={{ marginBottom: 12 }}>
                    <Link to={l.to} className="f-link" style={{ color: "#475569", textDecoration: "none", fontSize: 14 }}>
                      {l.label}
                    </Link>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
            <span style={{ fontSize: 13, color: "#334155" }}>© 2026 Credence · ThunderBoltz</span>
            <div style={{ display: "flex", gap: 20 }}>
              {[<Twitter size={16} />, <Github size={16} />, <Linkedin size={16} />].map((icon, i) => (
                <a key={i} href="#" className="s-icon" style={{ color: "#334155", display: "flex" }}>
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