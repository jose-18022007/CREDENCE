import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { Search, Shield, Menu, X, ArrowRight, Scan } from "lucide-react";

export function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Analyze", path: "/analyze" },
    { label: "About", path: "/about" },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <style>{`
        /* ===== KEYFRAMES ===== */
        @keyframes navShimmer {
          0%{left:-150%}
          100%{left:150%}
        }
        @keyframes breatheDot {
          0%,100%{transform:scale(1);opacity:0.6}
          50%{transform:scale(1.5);opacity:1}
        }
        @keyframes logoShine {
          0%{background-position:200% center}
          100%{background-position:-200% center}
        }
        @keyframes mobileSlideDown {
          from{opacity:0;transform:translateY(-12px)}
          to{opacity:1;transform:translateY(0)}
        }
        @keyframes mobileLinkIn {
          from{opacity:0;transform:translateX(-16px)}
          to{opacity:1;transform:translateX(0)}
        }
        @keyframes menuOverlayIn {
          from{opacity:0}
          to{opacity:1}
        }
        @keyframes activeBarIn {
          from{transform:scaleX(0)}
          to{transform:scaleX(1)}
        }
        @keyframes ctaPulse {
          0%,100%{box-shadow:0 2px 12px rgba(13,148,136,0.18)}
          50%{box-shadow:0 4px 20px rgba(13,148,136,0.3)}
        }

        /* ===== NAVBAR GLASS ===== */
        .navbar-glass {
          position:sticky;
          top:0;
          z-index:200;
          transition:all 0.45s cubic-bezier(0.23,1,0.32,1);
          will-change:background,box-shadow,backdrop-filter;
        }
        .navbar-glass.at-top {
          background:rgba(250,251,255,0.6);
          backdrop-filter:blur(12px) saturate(140%);
          -webkit-backdrop-filter:blur(12px) saturate(140%);
          border-bottom:1px solid rgba(255,255,255,0.4);
          box-shadow:none;
        }
        .navbar-glass.is-scrolled {
          background:rgba(255,255,255,0.78);
          backdrop-filter:blur(28px) saturate(200%);
          -webkit-backdrop-filter:blur(28px) saturate(200%);
          border-bottom:1px solid rgba(226,232,240,0.4);
          box-shadow:
            0 4px 32px rgba(0,0,0,0.04),
            0 1px 4px rgba(0,0,0,0.02),
            inset 0 -1px 0 rgba(13,148,136,0.04);
        }

        /* ===== INNER CONTAINER ===== */
        .navbar-inner {
          max-width:1200px;
          margin:0 auto;
          padding:0 24px;
        }
        .navbar-row {
          display:flex;
          align-items:center;
          justify-content:space-between;
          height:70px;
        }

        /* ===== LOGO ===== */
        .n-logo {
          display:flex;
          align-items:center;
          gap:11px;
          text-decoration:none;
          transition:all 0.35s cubic-bezier(0.23,1,0.32,1);
          position:relative;
        }
        .n-logo:hover {
          transform:scale(1.025);
        }
        .n-logo:hover .n-logo-box {
          box-shadow:0 6px 24px rgba(13,148,136,0.22);
          transform:rotate(-4deg) scale(1.06);
        }
        .n-logo-box {
          width:40px;height:40px;
          border-radius:12px;
          display:flex;align-items:center;justify-content:center;
          position:relative;
          background:linear-gradient(135deg,#0F766E 0%,#0D9488 60%,#14B8A6 100%);
          box-shadow:0 3px 14px rgba(13,148,136,0.2);
          transition:all 0.45s cubic-bezier(0.23,1,0.32,1);
          overflow:hidden;
          flex-shrink:0;
        }
        .n-logo-box::after {
          content:'';
          position:absolute;inset:0;
          background:linear-gradient(135deg,transparent 35%,rgba(255,255,255,0.2) 50%,transparent 65%);
          background-size:300% 300%;
          animation:logoShine 5s ease-in-out infinite;
          border-radius:inherit;
        }
        .n-logo-text {
          font-weight:800;
          font-size:22px;
          letter-spacing:-0.8px;
          color:#0F172A;
          transition:all 0.3s ease;
        }
        .n-logo-dot {
          width:6px;height:6px;
          border-radius:50%;
          background:#0D9488;
          box-shadow:0 0 10px rgba(13,148,136,0.4);
          animation:breatheDot 3s ease-in-out infinite;
          margin-left:-5px;
          margin-bottom:14px;
          flex-shrink:0;
        }

        /* ===== DESKTOP NAV LINKS ===== */
        .n-links {
          display:flex;
          align-items:center;
          gap:2px;
          padding:4px;
          border-radius:14px;
          background:rgba(241,245,249,0.5);
          border:1px solid rgba(226,232,240,0.4);
        }
        .n-link {
          position:relative;
          text-decoration:none;
          padding:8px 18px;
          border-radius:10px;
          font-size:14px;
          font-weight:500;
          letter-spacing:0.15px;
          transition:all 0.3s cubic-bezier(0.23,1,0.32,1);
          display:inline-flex;
          align-items:center;
          white-space:nowrap;
          cursor:pointer;
        }
        .n-link-off {
          color:#64748B;
          background:transparent;
        }
        .n-link-off:hover {
          color:#0F172A;
          background:rgba(255,255,255,0.7);
          box-shadow:0 2px 8px rgba(0,0,0,0.03);
          transform:translateY(-1px);
        }
        .n-link-on {
          color:#0D9488;
          background:rgba(255,255,255,0.85);
          font-weight:600;
          box-shadow:0 2px 10px rgba(0,0,0,0.04);
        }
        .n-link-on::after {
          content:'';
          position:absolute;
          bottom:4px;
          left:50%;
          transform:translateX(-50%);
          width:18px;
          height:2.5px;
          border-radius:3px;
          background:linear-gradient(90deg,#0D9488,#0891B2);
          box-shadow:0 0 10px rgba(13,148,136,0.3);
          animation:activeBarIn 0.4s cubic-bezier(0.23,1,0.32,1) both;
        }

        /* ===== DESKTOP CTA ===== */
        .n-cta {
          display:inline-flex;
          align-items:center;
          gap:8px;
          padding:10px 22px;
          background:linear-gradient(135deg,#0D9488 0%,#0F766E 100%);
          color:#fff;
          border-radius:12px;
          text-decoration:none;
          font-size:14px;
          font-weight:600;
          letter-spacing:0.2px;
          box-shadow:0 3px 14px rgba(13,148,136,0.2);
          transition:all 0.35s cubic-bezier(0.23,1,0.32,1);
          position:relative;
          overflow:hidden;
          border:none;
          cursor:pointer;
          white-space:nowrap;
        }
        .n-cta::before {
          content:'';
          position:absolute;
          top:0;left:-150%;
          width:120%;height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent);
        }
        .n-cta:hover {
          transform:translateY(-2px) scale(1.04);
          box-shadow:0 10px 32px rgba(13,148,136,0.3);
        }
        .n-cta:hover::before {
          animation:navShimmer 0.65s ease forwards;
        }
        .n-cta:active {
          transform:translateY(0) scale(1);
          box-shadow:0 2px 10px rgba(13,148,136,0.2);
        }

        /* ===== MOBILE HAMBURGER ===== */
        .n-burger {
          background:rgba(241,245,249,0.6);
          border:1px solid rgba(226,232,240,0.5);
          border-radius:11px;
          cursor:pointer;
          color:#334155;
          padding:9px;
          display:none;
          align-items:center;
          justify-content:center;
          transition:all 0.3s cubic-bezier(0.23,1,0.32,1);
          backdrop-filter:blur(8px);
          -webkit-backdrop-filter:blur(8px);
        }
        .n-burger:hover {
          background:rgba(13,148,136,0.06);
          border-color:rgba(13,148,136,0.12);
          color:#0D9488;
          transform:scale(1.06);
        }
        .n-burger:active {
          transform:scale(0.94);
        }

        /* ===== MOBILE OVERLAY ===== */
        .n-overlay {
          position:fixed;
          inset:0;
          top:70px;
          background:rgba(15,23,42,0.12);
          backdrop-filter:blur(4px);
          -webkit-backdrop-filter:blur(4px);
          z-index:190;
          animation:menuOverlayIn 0.3s ease both;
        }

        /* ===== MOBILE MENU PANEL ===== */
        .n-mobile {
          animation:mobileSlideDown 0.4s cubic-bezier(0.23,1,0.32,1) both;
          border-top:1px solid rgba(226,232,240,0.4);
          padding:16px 0 20px;
          background:rgba(255,255,255,0.65);
          backdrop-filter:blur(24px) saturate(180%);
          -webkit-backdrop-filter:blur(24px) saturate(180%);
          border-bottom-left-radius:20px;
          border-bottom-right-radius:20px;
          box-shadow:0 20px 50px rgba(0,0,0,0.06);
        }
        .n-m-link {
          display:flex;
          align-items:center;
          gap:10px;
          text-decoration:none;
          padding:13px 18px;
          margin:3px 8px;
          border-radius:14px;
          font-size:15px;
          font-weight:500;
          transition:all 0.3s ease;
          animation:mobileLinkIn 0.35s cubic-bezier(0.23,1,0.32,1) both;
        }
        .n-m-link-off {
          color:#475569;
        }
        .n-m-link-off:hover {
          color:#0F172A;
          background:rgba(241,245,249,0.6);
        }
        .n-m-link-on {
          color:#0D9488;
          background:rgba(13,148,136,0.05);
          font-weight:600;
        }
        .n-m-link-on .n-m-bar {
          display:block;
        }
        .n-m-bar {
          display:none;
          width:3px;height:20px;
          border-radius:3px;
          background:linear-gradient(180deg,#0D9488,#0891B2);
          box-shadow:0 0 10px rgba(13,148,136,0.3);
          flex-shrink:0;
        }
        .n-m-cta {
          display:flex;
          align-items:center;
          justify-content:center;
          gap:9px;
          padding:14px 0;
          margin:14px 8px 0;
          background:linear-gradient(135deg,#0D9488,#0F766E);
          color:#fff;
          border-radius:14px;
          text-decoration:none;
          font-size:15px;
          font-weight:600;
          box-shadow:0 4px 18px rgba(13,148,136,0.2);
          transition:all 0.3s cubic-bezier(0.23,1,0.32,1);
          position:relative;
          overflow:hidden;
          animation:mobileLinkIn 0.4s cubic-bezier(0.23,1,0.32,1) 0.25s both;
        }
        .n-m-cta::before {
          content:'';
          position:absolute;
          top:0;left:-150%;
          width:120%;height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent);
        }
        .n-m-cta:hover {
          box-shadow:0 8px 28px rgba(13,148,136,0.28);
          transform:translateY(-1px);
        }
        .n-m-cta:hover::before {
          animation:navShimmer 0.65s ease forwards;
        }

        /* ===== RESPONSIVE ===== */
        @media(max-width:768px) {
          .n-desk{display:none!important}
          .n-burger{display:flex!important}
        }
        @media(min-width:769px) {
          .n-desk{display:flex!important}
          .n-burger{display:none!important}
          .n-overlay{display:none!important}
          .n-mobile{display:none!important}
        }
      `}</style>

      <nav className={`navbar-glass ${scrolled ? "is-scrolled" : "at-top"}`}>
        <div className="navbar-inner">
          <div className="navbar-row">

            {/* ===== LOGO ===== */}
            <Link to="/" className="n-logo">
              <div className="n-logo-box">
                <Shield size={18} color="#FFFFFF" strokeWidth={2.2} />
                <Search
                  size={9}
                  color="#A7F3D0"
                  strokeWidth={3}
                  style={{ position: "absolute", bottom: 8, right: 7 }}
                />
              </div>
              <span className="n-logo-text">Credence</span>
              <div className="n-logo-dot" />
            </Link>

            {/* ===== DESKTOP NAV ===== */}
            <div className="n-links n-desk">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`n-link ${isActive(link.path) ? "n-link-on" : "n-link-off"}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* ===== RIGHT ===== */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Link to="/analyze" className="n-cta n-desk">
                <Scan size={15} />
                Get Started
                <ArrowRight size={14} />
              </Link>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="n-burger"
                aria-label="Toggle navigation menu"
              >
                <div
                  style={{
                    transition: "transform 0.35s cubic-bezier(0.23,1,0.32,1)",
                    transform: mobileOpen ? "rotate(180deg)" : "rotate(0deg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {mobileOpen ? <X size={20} strokeWidth={2.2} /> : <Menu size={20} strokeWidth={2.2} />}
                </div>
              </button>
            </div>
          </div>

          {/* ===== MOBILE MENU ===== */}
          {mobileOpen && (
            <div className="n-mobile">
              {navLinks.map((link, i) => (
                <Link
                  key={link.label}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`n-m-link ${isActive(link.path) ? "n-m-link-on" : "n-m-link-off"}`}
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <div className="n-m-bar" />
                  {link.label}
                </Link>
              ))}
              <Link
                to="/analyze"
                onClick={() => setMobileOpen(false)}
                className="n-m-cta"
              >
                <Scan size={16} />
                Get Started
                <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="n-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}