import { useState } from "react";
import { Link, useLocation } from "react-router";
import { Search, Shield, Menu, X } from "lucide-react";

export function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Analyze", path: "/analyze" },
    { label: "Dashboard", path: "/dashboard" },
    { label: "About", path: "/about" },
    { label: "API", path: "/about" },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav
      style={{
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #E2E8F0",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                backgroundColor: "#1E3A5F",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <Shield size={16} color="#FFFFFF" strokeWidth={2} />
              <Search
                size={10}
                color="#0D9488"
                strokeWidth={2.5}
                style={{ position: "absolute", bottom: 5, right: 4 }}
              />
            </div>
            <span style={{ fontWeight: 700, fontSize: 20, color: "#1E3A5F", letterSpacing: "-0.5px" }}>
              TruthLens
            </span>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }} className="hidden md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                style={{
                  textDecoration: "none",
                  padding: "6px 14px",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 500,
                  color: isActive(link.path) ? "#1E3A5F" : "#64748B",
                  backgroundColor: isActive(link.path) ? "#F1F5F9" : "transparent",
                  transition: "all 0.15s",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link
              to="/analyze"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 18px",
                backgroundColor: "#1E3A5F",
                color: "#FFFFFF",
                borderRadius: 8,
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 600,
                boxShadow: "0 1px 3px rgba(30,58,95,0.3)",
                transition: "background-color 0.15s",
              }}
              className="hidden md:inline-flex"
            >
              Get Started
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#1E293B", padding: 4 }}
              className="md:hidden"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div style={{ borderTop: "1px solid #E2E8F0", paddingBottom: 16 }}>
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "block",
                  textDecoration: "none",
                  padding: "10px 8px",
                  fontSize: 15,
                  fontWeight: 500,
                  color: isActive(link.path) ? "#1E3A5F" : "#1E293B",
                  borderBottom: "1px solid #F1F5F9",
                }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/analyze"
              onClick={() => setMobileOpen(false)}
              style={{
                display: "block",
                textAlign: "center",
                padding: "10px 0",
                marginTop: 10,
                backgroundColor: "#1E3A5F",
                color: "#FFFFFF",
                borderRadius: 8,
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
