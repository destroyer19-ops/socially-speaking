import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  Download,
  Search,
  Users,
  Activity,
  CheckCircle,
  Clock,
  XCircle,
  CalendarDays,
  Loader2,
  Trophy,
  ListFilter,
  Mail,
  LayoutDashboard,
  History,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { RecipientSelector } from "@/components/admin/RecipientSelector";
import type { RecipientSource } from "@/components/admin/RecipientSelector";
import { CampaignComposer } from "@/components/admin/CampaignComposer";
import type { ComposedEmail } from "@/components/admin/CampaignComposer";
import { EmailPreview } from "@/components/admin/EmailPreview";
import { CampaignConfirm } from "@/components/admin/CampaignConfirm";
import { CampaignHistory } from "@/components/admin/CampaignHistory";
import { QRScanner } from "@/components/admin/QRScanner";
import { ScanLine } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
});

const COLORS = ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#06B6D4", "#84CC16"];

// ─── Types ──────────────────────────────────────────────────────────────────
interface Registration {
  id: string;
  form_type: string;
  name: string;
  email: string;
  phone: string;
  university: string;
  level: string;
  date: string;
  status: string;
}

interface ApiData {
  ok: boolean;
  data: Registration[];
  counts: {
    campus: number;
    ttb: number;
    fcf: number;
    tribe: number;
    volunteer: number;
    ssc2026: number;
  };
  vol_status: Record<string, number>;
  vol_dept: Record<string, number>;
  ssc2026_status: Record<string, number>;
  error?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function statusColor(status: string) {
  const s = status.toLowerCase();
  if (s === "selected" || s === "approved" || s === "paid" || s === "confirmed")
    return "bg-green-500/10 text-green-400 border-green-500/20";
  if (s === "pending" || s === "new" || s === "under review")
    return "bg-orange-500/10 text-orange-400 border-orange-500/20";
  if (s === "waitlisted")
    return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
  if (s === "not selected")
    return "bg-red-500/10 text-red-400 border-red-500/20";
  return "bg-blue-500/10 text-blue-400 border-blue-500/20";
}

const FORM_TYPE_STYLES: Record<string, string> = {
  "Campus Chapter": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Takeover Table": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "First Class Formula": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Tribe Application": "bg-green-500/10 text-green-400 border-green-500/20",
  "Volunteer Application": "bg-pink-500/10 text-pink-400 border-pink-500/20",
  "SSC 2026 Registration": "bg-sky-500/10 text-sky-400 border-sky-500/20",
};

function FormTypeBadge({ type }: { type: string }) {
  const style = FORM_TYPE_STYLES[type] ?? "bg-white/5 text-foreground-subtle border-white/10";
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border ${style}`}>
      {type}
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  icon,
  title,
  value,
  sub,
  accent = "purple",
}: {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  sub?: string;
  accent?: "purple" | "green" | "orange" | "pink" | "blue" | "yellow";
}) {
  const accentMap = {
    purple: "text-purple-glow",
    green: "text-green-400",
    orange: "text-orange-400",
    pink: "text-pink-400",
    blue: "text-blue-glow",
    yellow: "text-yellow-400",
  };
  return (
    <div className="glass-strong rounded-2xl border border-white/5 p-5 flex items-start gap-4 transition-transform hover:-translate-y-1 duration-300">
      <div className={`p-3 rounded-xl bg-white/5 border border-white/10 mt-0.5 ${accentMap[accent]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">{title}</p>
        <h4 className="text-3xl font-black font-display text-white mt-1">{value}</h4>
        {sub && <p className="text-[11px] text-foreground-subtle mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-foreground-subtle mb-4 flex items-center gap-2">
      <span className="h-px flex-1 bg-white/5" />
      {children}
      <span className="h-px flex-1 bg-white/5" />
    </h2>
  );
}

// ─── Email Manager Wizard ──────────────────────────────────────────────────────
type WizardStep = "select" | "compose" | "preview" | "confirm";
type EmailTab = "new" | "history";

function EmailManager() {
  const [emailTab, setEmailTab] = useState<EmailTab>("new");
  const [step, setStep] = useState<WizardStep>("select");
  const [source, setSource] = useState<RecipientSource | null>(null);
  const [email, setEmail] = useState<ComposedEmail | null>(null);

  // Step labels for breadcrumb
  const stepLabels: Record<WizardStep, string> = {
    select:  "Select Recipients",
    compose: "Compose Email",
    preview: "Preview & Test",
    confirm: "Confirm & Dispatch",
  };
  const STEPS: WizardStep[] = ["select", "compose", "preview", "confirm"];
  const currentIdx = STEPS.indexOf(step);

  function resetWizard() {
    setStep("select");
    setSource(null);
    setEmail(null);
  }

  return (
    <div className="space-y-8">
      {/* Email tab switcher */}
      <div className="flex gap-2 glass-strong rounded-2xl border border-white/5 p-1.5 self-start">
        {(["new", "history"] as EmailTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setEmailTab(t)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              emailTab === t
                ? "bg-purple/20 text-purple-glow border border-purple/30"
                : "text-foreground-muted hover:text-white"
            }`}
          >
            {t === "new" ? <Mail size={15} /> : <History size={15} />}
            {t === "new" ? "New Campaign" : "Campaign History"}
          </button>
        ))}
      </div>

      {emailTab === "history" ? (
        <CampaignHistory />
      ) : (
        <>
          {/* Step breadcrumb */}
          <div className="flex items-center gap-2 flex-wrap">
            {STEPS.map((s, i) => {
              const done   = i < currentIdx;
              const active = i === currentIdx;
              return (
                <div key={s} className="flex items-center gap-2">
                  {i > 0 && <span className="text-white/15 text-xs">›</span>}
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                      active
                        ? "bg-purple/20 border-purple/40 text-purple-glow"
                        : done
                        ? "border-white/10 text-foreground-subtle"
                        : "border-white/5 text-white/20"
                    }`}
                  >
                    {i + 1}. {stepLabels[s]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Step panels */}
          <div className="glass-strong rounded-2xl border border-white/10 p-6 sm:p-8">
            {step === "select" && (
              <RecipientSelector
                onConfirm={(src) => {
                  setSource(src);
                  setStep("compose");
                }}
              />
            )}

            {step === "compose" && source && (
              <CampaignComposer
                source={source}
                onBack={() => setStep("select")}
                onConfirm={(composed) => {
                  setEmail(composed);
                  setStep("preview");
                }}
              />
            )}

            {step === "preview" && source && email && (
              <EmailPreview
                source={source}
                email={email}
                onBack={() => setStep("compose")}
                onConfirm={() => setStep("confirm")}
              />
            )}

            {step === "confirm" && source && email && (
              <CampaignConfirm
                source={source}
                email={email}
                onBack={() => setStep("preview")}
                onDone={() => {
                  resetWizard();
                  setEmailTab("history");
                }}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "email" | "scanner">("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFormType, setFilterFormType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const [apiData, setApiData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/admin-api.php");
        const text = await response.text();
        let data: ApiData;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(`Server returned non-JSON:\n${text.slice(0, 300)}`);
        }
        if (data.ok) {
          setApiData(data);
        } else {
          throw new Error(data.error ?? "Unknown server error");
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const registrations = apiData?.data ?? [];
  const counts = apiData?.counts ?? { campus: 0, ttb: 0, fcf: 0, tribe: 0, volunteer: 0, ssc2026: 0 };
  const volStatus = apiData?.vol_status ?? {};
  const volDept = apiData?.vol_dept ?? {};
  const ssc2026Status = apiData?.ssc2026_status ?? {};

  // ─── SSC 2026 conference stats ────────────────────────────────────────────
  const confTotal = counts.ssc2026;
  const confConfirmed = ssc2026Status["Confirmed"] ?? ssc2026Status["Approved"] ?? ssc2026Status["Paid"] ?? 0;
  const confPending = ssc2026Status["Pending"] ?? ssc2026Status["New"] ?? confTotal - confConfirmed;

  // ─── Volunteer stats ──────────────────────────────────────────────────────
  const volTotal = counts.volunteer;
  const volPending = volStatus["Pending"] ?? 0;
  const volSelected = volStatus["Selected"] ?? 0;
  const volWaitlisted = volStatus["Waitlisted"] ?? 0;
  const volUnderReview = volStatus["Under Review"] ?? 0;

  // ─── Charts data ──────────────────────────────────────────────────────────
  const volStatusChartData = [
    { name: "Pending", value: volPending },
    { name: "Under Review", value: volUnderReview },
    { name: "Selected", value: volSelected },
    { name: "Waitlisted", value: volWaitlisted },
    { name: "Not Selected", value: volStatus["Not Selected"] ?? 0 },
  ].filter((d) => d.value > 0);

  const volDeptChartData = Object.entries(volDept)
    .map(([name, count]) => ({ name: name.replace(" and ", " & "), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const confStatusChartData = Object.entries(ssc2026Status)
    .map(([name, value]) => ({ name, value }))
    .filter((d) => d.value > 0);

  // ─── Filtered table ───────────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    return registrations.filter((reg) => {
      const q = searchTerm.toLowerCase();
      const matchSearch = !q || reg.name.toLowerCase().includes(q) || reg.email.toLowerCase().includes(q) || (reg.phone ?? "").includes(q);
      const matchType = filterFormType === "All" || reg.form_type === filterFormType;
      const matchStatus = filterStatus === "All" || reg.status.toLowerCase() === filterStatus.toLowerCase();
      return matchSearch && matchType && matchStatus;
    });
  }, [searchTerm, filterFormType, filterStatus, registrations]);

  const handleExportCSV = () => {
    const headers = ["ID", "Form Type", "Name", "Department / School", "Role", "Email", "Phone", "Date", "Status"];
    const csvContent = [
      headers.join(","),
      ...filteredData.map((row) =>
        [
          row.id,
          `"${row.form_type ?? ""}"`,
          `"${row.name}"`,
          `"${row.university}"`,
          `"${row.level}"`,
          `"${row.email}"`,
          `"${row.phone ?? ""}"`,
          `"${row.date}"`,
          `"${row.status}"`,
        ].join(","),
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ssc2026_export_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="relative flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="flex-1 pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand mb-1">
                Socially Speaking Conference
              </p>
              <h1 className="text-3xl md:text-4xl font-black font-display tracking-tight">
                SSC 2026{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-glow to-blue-glow">
                  Admin Dashboard
                </span>
              </h1>
              <p className="text-foreground-muted mt-1 text-sm">
                Live overview of registrations, volunteers and recruitment for{" "}
                <strong className="text-white/70">The Takeover Generation · 5 Dec 2026</strong>
              </p>
            </div>
            {activeTab === "dashboard" && (
              <button
                onClick={handleExportCSV}
                disabled={loading || filteredData.length === 0}
                className="btn-primary inline-flex items-center gap-2 whitespace-nowrap self-start md:self-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={18} />
                Export CSV
              </button>
            )}
          </div>

          {/* ── Main Tab Navigation ── */}
          <div className="flex gap-2 glass-strong rounded-2xl border border-white/5 p-1.5 mb-10 w-fit">
            {([
              { key: "dashboard", label: "Dashboard",     icon: <LayoutDashboard size={16} /> },
              { key: "email",     label: "Email Manager", icon: <Mail size={16} /> },
            ] as { key: "dashboard" | "email" | "scanner"; label: string; icon: React.ReactNode }[]).map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === t.key
                    ? "bg-purple/20 text-purple-glow border border-purple/30"
                    : "text-foreground-muted hover:text-white"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Scanner Tab ── */}
          {activeTab === "scanner" && (
            <div className="py-8">
              <QRScanner />
            </div>
          )}

          {/* ── Email Manager Tab ── */}
          {activeTab === "email" && (
            <EmailManager />
          )}

          {/* ── Dashboard Tab ── */}
          {activeTab === "dashboard" && (
          <>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-12 h-12 text-purple-glow animate-spin mb-4" />
              <p className="text-foreground-muted">Loading dashboard data…</p>
            </div>
          ) : error ? (
            <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-center">
              <p className="font-bold mb-2">Failed to load data</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <>
              {/* ── SSC 2026 Conference Registrations ── */}
              <SectionHeading>SSC 2026 — Conference Registrations</SectionHeading>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <StatCard icon={<CalendarDays size={22} />} title="Total Registrations" value={confTotal} sub="SSC 2026" accent="blue" />
                <StatCard icon={<CheckCircle size={22} />} title="Confirmed" value={confConfirmed} sub="Approved / Paid" accent="green" />
                <StatCard icon={<Clock size={22} />} title="Pending" value={confPending} sub="Awaiting confirmation" accent="orange" />
                <StatCard icon={<Users size={22} />} title="Other Forms" value={counts.campus + counts.ttb + counts.fcf + counts.tribe} sub="Campus, TTB, FCF, Tribe" accent="purple" />
              </div>

              {/* ── Volunteer Recruitment ── */}
              <SectionHeading>SSC 2026 — Volunteer Recruitment</SectionHeading>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
                <StatCard icon={<Users size={22} />} title="Total Applications" value={volTotal} accent="pink" />
                <StatCard icon={<Clock size={22} />} title="Pending" value={volPending} accent="orange" />
                <StatCard icon={<Activity size={22} />} title="Under Review" value={volUnderReview} accent="blue" />
                <StatCard icon={<Trophy size={22} />} title="Selected" value={volSelected} accent="green" />
                <StatCard icon={<ListFilter size={22} />} title="Waitlisted" value={volWaitlisted} accent="yellow" />
                <StatCard icon={<XCircle size={22} />} title="Not Selected" value={volStatus["Not Selected"] ?? 0} accent="purple" />
              </div>

              {/* ── Charts ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                {/* Conference status pie */}
                <div className="glass-strong rounded-2xl border border-white/5 p-6">
                  <h3 className="text-base font-bold text-white mb-1">SSC 2026 Registration Status</h3>
                  <p className="text-xs text-foreground-subtle mb-5">Breakdown of conference registrations</p>
                  {confStatusChartData.length > 0 ? (
                    <>
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={confStatusChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                              {confStatusChartData.map((_entry, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ backgroundColor: "#0a0a0a", borderColor: "#333", borderRadius: "12px" }} itemStyle={{ color: "#fff" }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {confStatusChartData.map((d, i) => (
                          <div key={d.name} className="flex items-center gap-1.5 text-xs text-foreground-muted">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            {d.name} ({d.value})
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-center text-foreground-subtle text-sm py-10">No conference registration data yet</p>
                  )}
                </div>

                {/* Volunteer status pie */}
                <div className="glass-strong rounded-2xl border border-white/5 p-6">
                  <h3 className="text-base font-bold text-white mb-1">Volunteer Application Status</h3>
                  <p className="text-xs text-foreground-subtle mb-5">Across all volunteer applications</p>
                  {volStatusChartData.length > 0 ? (
                    <>
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={volStatusChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                              {volStatusChartData.map((_entry, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ backgroundColor: "#0a0a0a", borderColor: "#333", borderRadius: "12px" }} itemStyle={{ color: "#fff" }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {volStatusChartData.map((d, i) => (
                          <div key={d.name} className="flex items-center gap-1.5 text-xs text-foreground-muted">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            {d.name} ({d.value})
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-center text-foreground-subtle text-sm py-10">No volunteer applications yet</p>
                  )}
                </div>

                {/* Recent registrations mini list */}
                <div className="glass-strong rounded-2xl border border-white/5 p-6">
                  <h3 className="text-base font-bold text-white mb-1">Recent Activity</h3>
                  <p className="text-xs text-foreground-subtle mb-5">Last 6 submissions across all forms</p>
                  <div className="space-y-3">
                    {registrations.slice(0, 6).map((r) => (
                      <div key={r.id} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {r.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{r.name}</p>
                          <p className="text-[11px] text-foreground-subtle">{r.form_type} · {r.date}</p>
                        </div>
                        <span className={`ml-auto shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusColor(r.status)}`}>
                          {r.status}
                        </span>
                      </div>
                    ))}
                    {registrations.length === 0 && (
                      <p className="text-center text-foreground-subtle text-sm py-4">No submissions yet</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Volunteer Departments bar chart */}
              {volDeptChartData.length > 0 && (
                <div className="glass-strong rounded-2xl border border-white/5 p-6 mb-10">
                  <h3 className="text-base font-bold text-white mb-1">Volunteer Applications by Department</h3>
                  <p className="text-xs text-foreground-subtle mb-6">First-choice department selections (top 10)</p>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={volDeptChartData} margin={{ top: 5, right: 10, left: -10, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
                        <XAxis dataKey="name" stroke="#555" tick={{ fill: "#888", fontSize: 11 }} angle={-35} textAnchor="end" interval={0} />
                        <YAxis stroke="#555" tick={{ fill: "#888", fontSize: 11 }} allowDecimals={false} />
                        <RechartsTooltip contentStyle={{ backgroundColor: "#0a0a0a", borderColor: "#333", borderRadius: "12px" }} itemStyle={{ color: "#fff" }} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                        <Bar dataKey="count" name="Applications" fill="#EC4899" radius={[4, 4, 0, 0]} maxBarSize={48} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* ── All Records Table ── */}
              <SectionHeading>All Submissions</SectionHeading>
              <div className="glass-strong rounded-2xl border border-white/5 overflow-hidden">
                {/* Table header / filters */}
                <div className="p-5 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">All Registrations</h3>
                    <p className="text-xs text-foreground-muted mt-0.5">
                      Showing {filteredData.length} of {registrations.length} total
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full md:w-auto">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" size={15} />
                      <input
                        type="text"
                        placeholder="Search name, email, phone…"
                        className="w-full sm:w-60 rounded-xl bg-white/5 border border-white/10 pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-purple-glow"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <select
                      className="rounded-xl bg-ink-deep border border-white/10 px-3 py-2 text-sm text-foreground focus:outline-none focus:border-purple-glow [&>option]:bg-ink-deep"
                      value={filterFormType}
                      onChange={(e) => setFilterFormType(e.target.value)}
                    >
                      <option value="All">All Form Types</option>
                      <option value="SSC 2026 Registration">SSC 2026 Registration</option>
                      <option value="Volunteer Application">Volunteer Application</option>
                      <option value="Campus Chapter">Campus Chapter</option>
                      <option value="Takeover Table">Takeover Table</option>
                      <option value="First Class Formula">First Class Formula</option>
                      <option value="Tribe Application">Tribe Application</option>
                    </select>

                    <select
                      className="rounded-xl bg-ink-deep border border-white/10 px-3 py-2 text-sm text-foreground focus:outline-none focus:border-purple-glow [&>option]:bg-ink-deep"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="All">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Selected">Selected</option>
                      <option value="Waitlisted">Waitlisted</option>
                      <option value="Not Selected">Not Selected</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Approved">Approved</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-white/[0.03] text-foreground-muted uppercase text-[11px] tracking-wider">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Name</th>
                        <th className="px-6 py-4 font-semibold">Form Type</th>
                        <th className="px-6 py-4 font-semibold">Department / School</th>
                        <th className="px-6 py-4 font-semibold">Role</th>
                        <th className="px-6 py-4 font-semibold">Date</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredData.length > 0 ? (
                        filteredData.map((reg) => (
                          <tr key={reg.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-medium text-white">{reg.name}</div>
                              <div className="text-foreground-muted text-xs">{reg.email}</div>
                              {reg.phone && <div className="text-foreground-muted text-xs">{reg.phone}</div>}
                            </td>
                            <td className="px-6 py-4">
                              <FormTypeBadge type={reg.form_type} />
                            </td>
                            <td className="px-6 py-4 text-foreground-subtle text-xs max-w-[160px] truncate">{reg.university}</td>
                            <td className="px-6 py-4 text-foreground-subtle text-xs">{reg.level}</td>
                            <td className="px-6 py-4 text-foreground-subtle text-xs">{reg.date}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor(reg.status)}`}>
                                {reg.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-16 text-center text-foreground-muted">
                            No records match your search criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
          </>
          )}
          </div>
        </div>
      </main>
    </div>
  );
}
