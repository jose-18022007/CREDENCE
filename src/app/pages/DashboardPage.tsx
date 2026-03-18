import { useState } from "react";
import { useNavigate } from "react-router";
import {
  FileText,
  Link2,
  Image,
  Video,
  Mic,
  Search,
  Filter,
  TrendingUp,
  AlertTriangle,
  XCircle,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const NAVY = "#1E3A5F";
const TEAL = "#0D9488";
const RED = "#DC2626";
const AMBER = "#D97706";
const GREEN = "#059669";
const BORDER = "#E2E8F0";
const BG_LIGHT = "#F8FAFC";
const TEXT = "#1E293B";
const TEXT_MUTED = "#64748B";

const PIE_DATA = [
  { name: "Text", value: 18, color: NAVY },
  { name: "URL", value: 14, color: TEAL },
  { name: "Image", value: 8, color: AMBER },
  { name: "Video", value: 4, color: RED },
  { name: "Audio", value: 3, color: "#7C3AED" },
];

const BAR_DATA = [
  { range: "0–20", count: 8, label: "Fake" },
  { range: "21–40", count: 15, label: "Suspicious" },
  { range: "41–60", count: 7, label: "Mixed" },
  { range: "61–80", count: 10, label: "Credible" },
  { range: "81–100", count: 7, label: "Verified" },
];

const TABLE_DATA = [
  { type: "url", icon: <Link2 size={14} />, preview: "Breaking: New study links diet to longevity in...", source: "healthnews.com", score: 78, status: "Credible", date: "Mar 18, 2026" },
  { type: "text", icon: <FileText size={14} />, preview: "Government secretly vaccinating water supply with...", source: "Pasted text", score: 12, status: "Fake", date: "Mar 18, 2026" },
  { type: "image", icon: <Image size={14} />, preview: "Viral protest image from downtown", source: "Uploaded image", score: 34, status: "Suspicious", date: "Mar 17, 2026" },
  { type: "url", icon: <Link2 size={14} />, preview: "WHO releases new guidelines on antibiotic use", source: "who.int", score: 95, status: "Verified", date: "Mar 17, 2026" },
  { type: "video", icon: <Video size={14} />, preview: "Celebrity caught saying controversial things in...", source: "Uploaded video", score: 22, status: "Fake", date: "Mar 16, 2026" },
  { type: "audio", icon: <Mic size={14} />, preview: "Leaked audio allegedly from government meeting...", source: "Uploaded audio", score: 41, status: "Suspicious", date: "Mar 16, 2026" },
  { type: "url", icon: <Link2 size={14} />, preview: "Climate report: Record temperatures for 5th year...", source: "reuters.com", score: 88, status: "Verified", date: "Mar 15, 2026" },
  { type: "text", icon: <FileText size={14} />, preview: "Stock market manipulation scheme exposed by...", source: "Pasted text", score: 29, status: "Suspicious", date: "Mar 15, 2026" },
  { type: "image", icon: <Image size={14} />, preview: "AI-generated disaster aftermath photo", source: "Uploaded image", score: 8, status: "Fake", date: "Mar 14, 2026" },
  { type: "url", icon: <Link2 size={14} />, preview: "Tech giant announces layoffs affecting 10,000...", source: "techcrunch.com", score: 82, status: "Verified", date: "Mar 14, 2026" },
];

const STATUS_CONFIG = {
  Fake: { color: RED, bg: "#FEF2F2", icon: <XCircle size={12} /> },
  Suspicious: { color: AMBER, bg: "#FFFBEB", icon: <AlertTriangle size={12} /> },
  Credible: { color: GREEN, bg: "#F0FDF4", icon: <CheckCircle size={12} /> },
  Verified: { color: TEAL, bg: "#F0FDFA", icon: <CheckCircle size={12} /> },
  Mixed: { color: TEXT_MUTED, bg: "#F1F5F9", icon: <HelpCircle size={12} /> },
};

const TRENDING = [
  { title: "5G towers cause disease claims resurface", count: "12,400 shares", severity: "High" },
  { title: "AI-generated video of world leader going viral", count: "8,200 shares", severity: "Critical" },
  { title: "Manipulated unemployment statistics spreading", count: "6,100 shares", severity: "High" },
  { title: "Out-of-context climate graph being misused", count: "4,800 shares", severity: "Medium" },
];

function StatCard({ title, value, subtitle, color, icon }: { title: string; value: string | number; subtitle: string; color: string; icon: React.ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: `1px solid ${BORDER}`,
        borderRadius: 12,
        padding: "24px 20px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        borderTop: `3px solid ${color}`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ fontSize: 13, color: TEXT_MUTED, fontWeight: 500 }}>{title}</div>
        <div style={{ width: 32, height: 32, backgroundColor: `${color}18`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color, lineHeight: 1.2, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 13, color: TEXT_MUTED }}>{subtitle}</div>
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = TABLE_DATA.filter((row) => {
    const matchSearch = row.preview.toLowerCase().includes(search.toLowerCase()) || row.source.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || row.type === filterType;
    const matchStatus = filterStatus === "all" || row.status.toLowerCase() === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  return (
    <div style={{ backgroundColor: BG_LIGHT, minHeight: "100vh", color: TEXT }}>
      {/* Header */}
      <section style={{ padding: "48px 24px 36px", backgroundColor: "#FFFFFF", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h1 style={{ fontSize: "clamp(26px, 4vw, 36px)", fontWeight: 800, color: NAVY, marginBottom: 8, letterSpacing: "-0.5px" }}>
            Your Dashboard
          </h1>
          <p style={{ fontSize: 15, color: TEXT_MUTED }}>Track and manage all your analyzed content</p>
        </div>
      </section>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 24px" }}>
        {/* Stats Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <StatCard title="Total Analyses" value={47} subtitle="All-time analyses" color={NAVY} icon={<FileText size={15} color={NAVY} />} />
          <StatCard title="Fake / Misleading" value={23} subtitle="Detected as problematic" color={RED} icon={<XCircle size={15} color={RED} />} />
          <StatCard title="Credible Content" value={18} subtitle="Verified as trustworthy" color={GREEN} icon={<CheckCircle size={15} color={GREEN} />} />
          <StatCard title="Suspicious / Unverified" value={6} subtitle="Requires further review" color={AMBER} icon={<HelpCircle size={15} color={AMBER} />} />
        </div>

        {/* Charts */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
            marginBottom: 32,
          }}
        >
          {/* Pie Chart */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: `1px solid ${BORDER}`,
              borderRadius: 12,
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Content Breakdown by Type</h3>
            <p style={{ fontSize: 13, color: TEXT_MUTED, marginBottom: 16 }}>Distribution of analyzed media types</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={PIE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {PIE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} items`, ""]} />
                <Legend formatter={(value) => <span style={{ fontSize: 12, color: TEXT }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: `1px solid ${BORDER}`,
              borderRadius: 12,
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Trust Score Distribution</h3>
            <p style={{ fontSize: 13, color: TEXT_MUTED, marginBottom: 16 }}>Number of items in each score range</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={BAR_DATA} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="range" tick={{ fontSize: 12, fill: TEXT_MUTED }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: TEXT_MUTED }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: 13 }}
                  cursor={{ fill: "#F8FAFC" }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Analyses">
                  {BAR_DATA.map((entry, index) => {
                    const colors = [RED, AMBER, "#94A3B8", GREEN, TEAL];
                    return <Cell key={`bar-${index}`} fill={colors[index]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Analyses Table */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: `1px solid ${BORDER}`,
            borderRadius: 12,
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            marginBottom: 32,
            overflow: "hidden",
          }}
        >
          {/* Table Header */}
          <div style={{ padding: "20px 24px", borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>All Analyses</h3>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {/* Search */}
                <div style={{ position: "relative" }}>
                  <Search size={14} color={TEXT_MUTED} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="text"
                    placeholder="Search content..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                      padding: "8px 12px 8px 32px",
                      border: `1px solid ${BORDER}`,
                      borderRadius: 8,
                      fontSize: 13,
                      outline: "none",
                      width: 200,
                      color: TEXT,
                      backgroundColor: "#FAFAFA",
                      fontFamily: "inherit",
                    }}
                  />
                </div>

                {/* Type Filter */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 8,
                    fontSize: 13,
                    color: TEXT,
                    backgroundColor: "#FAFAFA",
                    outline: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <option value="all">All Types</option>
                  <option value="text">Text</option>
                  <option value="url">URL</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                </select>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 8,
                    fontSize: 13,
                    color: TEXT,
                    backgroundColor: "#FAFAFA",
                    outline: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="fake">Fake</option>
                  <option value="suspicious">Suspicious</option>
                  <option value="credible">Credible</option>
                  <option value="verified">Verified</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: BG_LIGHT }}>
                  {["Type", "Content Preview", "Source", "Trust Score", "Date", "Status"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontSize: 12,
                        fontWeight: 700,
                        color: TEXT_MUTED,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        borderBottom: `1px solid ${BORDER}`,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => {
                  const sc = STATUS_CONFIG[row.status as keyof typeof STATUS_CONFIG];
                  return (
                    <tr
                      key={i}
                      onClick={() => navigate("/results")}
                      style={{
                        backgroundColor: i % 2 === 0 ? "#FFFFFF" : BG_LIGHT,
                        cursor: "pointer",
                        transition: "background-color 0.1s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#EFF6FF")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = i % 2 === 0 ? "#FFFFFF" : BG_LIGHT)}
                    >
                      <td style={{ padding: "14px 16px", borderBottom: `1px solid ${BORDER}` }}>
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            backgroundColor: "#F1F5F9",
                            borderRadius: 6,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: TEXT_MUTED,
                          }}
                        >
                          {row.icon}
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", borderBottom: `1px solid ${BORDER}`, maxWidth: 280 }}>
                        <div
                          style={{
                            fontSize: 13,
                            color: TEXT,
                            fontWeight: 500,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {row.preview}
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", borderBottom: `1px solid ${BORDER}`, whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: 13, color: TEXT_MUTED }}>{row.source}</span>
                      </td>
                      <td style={{ padding: "14px 16px", borderBottom: `1px solid ${BORDER}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 48, height: 5, backgroundColor: "#F1F5F9", borderRadius: 3, overflow: "hidden" }}>
                            <div
                              style={{
                                height: "100%",
                                width: `${row.score}%`,
                                backgroundColor: row.score <= 30 ? RED : row.score <= 60 ? AMBER : GREEN,
                                borderRadius: 3,
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: row.score <= 30 ? RED : row.score <= 60 ? AMBER : GREEN,
                            }}
                          >
                            {row.score}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", borderBottom: `1px solid ${BORDER}`, whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: 13, color: TEXT_MUTED }}>{row.date}</span>
                      </td>
                      <td style={{ padding: "14px 16px", borderBottom: `1px solid ${BORDER}` }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 12,
                            fontWeight: 700,
                            color: sc.color,
                            backgroundColor: sc.bg,
                            borderRadius: 4,
                            padding: "3px 9px",
                          }}
                        >
                          {sc.icon}
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div style={{ padding: "40px", textAlign: "center", color: TEXT_MUTED, fontSize: 14 }}>
                No results match your filters.
              </div>
            )}
          </div>

          <div style={{ padding: "12px 24px", borderTop: `1px solid ${BORDER}`, fontSize: 13, color: TEXT_MUTED }}>
            Showing {filtered.length} of {TABLE_DATA.length} analyses
          </div>
        </div>

        {/* Trending Misinformation */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: `1px solid ${BORDER}`,
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ padding: "20px 24px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 10 }}>
            <TrendingUp size={18} color={RED} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>Currently Trending Misinformation</h3>
            <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: RED, backgroundColor: "#FEF2F2", borderRadius: 4, padding: "2px 8px" }}>
              Live
            </span>
          </div>
          <div>
            {TRENDING.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "16px 24px",
                  borderBottom: i < TRENDING.length - 1 ? `1px solid ${BORDER}` : "none",
                  backgroundColor: i % 2 === 0 ? "#FFFFFF" : BG_LIGHT,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: item.severity === "Critical" ? RED : item.severity === "High" ? AMBER : TEXT_MUTED,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 2 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: TEXT_MUTED }}>{item.count}</div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: item.severity === "Critical" ? RED : item.severity === "High" ? AMBER : TEXT_MUTED,
                    backgroundColor: item.severity === "Critical" ? "#FEF2F2" : item.severity === "High" ? "#FFFBEB" : "#F1F5F9",
                    borderRadius: 4,
                    padding: "3px 8px",
                  }}
                >
                  {item.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
