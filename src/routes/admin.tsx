import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  Download,
  Search,
  Users,
  CheckCircle,
  Clock,
  CalendarDays,
  Loader2,
  Mail,
  LayoutDashboard,
  History,
  ScanLine,
  MessageSquare,
  PenTool,
  Award,
  HeartHandshake,
  ArrowRight,
  Sparkles,
  HelpCircle,
  ChevronRight,
  Filter,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  X,
  FileSpreadsheet,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { RecipientSelector } from "@/components/admin/RecipientSelector";
import type { RecipientSource } from "@/components/admin/RecipientSelector";
import { CampaignComposer } from "@/components/admin/CampaignComposer";
import type { ComposedEmail } from "@/components/admin/CampaignComposer";
import { EmailPreview } from "@/components/admin/EmailPreview";
import { CampaignConfirm } from "@/components/admin/CampaignConfirm";
import { CampaignHistory } from "@/components/admin/CampaignHistory";
import { QRScanner } from "@/components/admin/QRScanner";
import { BlogManager } from "@/components/admin/BlogManager";
import { WhatsAppGroupsManager } from "@/components/admin/WhatsAppGroupsManager";
import { MobilizationManager } from "@/components/admin/MobilizationManager";
import type { MobilizationData } from "@/components/admin/MobilizationManager";
import { AdminOnboardingTour } from "@/components/admin/AdminOnboardingTour";

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
});

// ─── Types ──────────────────────────────────────────────────────────────────
interface Registration {
  id: string;
  reg_id?: string;
  form_type: string;
  name: string;
  email: string;
  phone: string;
  university: string;
  level: string;
  date: string;
  status: string;
  referral_code?: string | null;
  referred_by_code?: string | null;
  checked_in_at?: string | null;
  checked_in_by?: string | null;
  whatsapp_group_id?: number | null;
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
  mobilization?: MobilizationData;
  error?: string;
}

type AdminTab =
  | "overview"
  | "attendees"
  | "volunteers"
  | "mobilization"
  | "scanner"
  | "whatsapp"
  | "blog"
  | "email";

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
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${style}`}>
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
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  sub?: string;
  accent?: "purple" | "green" | "orange" | "pink" | "blue" | "yellow";
  onClick?: () => void;
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
    <div
      onClick={onClick}
      className={`glass-strong rounded-2xl border border-white/10 p-5 flex items-start gap-4 transition-all duration-300 ${
        onClick ? "cursor-pointer hover:-translate-y-1 hover:border-white/20" : ""
      }`}
    >
      <div className={`p-3 rounded-xl bg-white/5 border border-white/10 mt-0.5 ${accentMap[accent]}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">{title}</p>
        <h4 className="text-3xl font-black font-display text-white mt-1">{value}</h4>
        {sub && <p className="text-[11px] text-foreground-subtle mt-0.5">{sub}</p>}
      </div>
    </div>
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

  const stepLabels: Record<WizardStep, string> = {
    select: "Select Recipients",
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
          <div className="flex items-center gap-2 flex-wrap">
            {STEPS.map((s, i) => {
              const done = i < currentIdx;
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

// ─── Main Admin Component ─────────────────────────────────────────────────────
function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFormType, setFilterFormType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const [apiData, setApiData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isApproving, setIsApproving] = useState(false);

  // Tour State
  const [tourOpen, setTourOpen] = useState(false);

  // Selected Attendee Modal
  const [selectedAttendee, setSelectedAttendee] = useState<Registration | null>(null);

  // Auto-launch tour on first visit
  useEffect(() => {
    const tourDone = localStorage.getItem("ssc_admin_tour_completed");
    if (!tourDone) {
      setTourOpen(true);
    }
  }, []);

  const handleApproveVolunteers = async () => {
    if (!window.confirm("Are you sure you want to approve all pending volunteer applications?")) return;
    setIsApproving(true);
    try {
      const res = await fetch((import.meta.env.BASE_URL || "/") + "admin-approve-volunteers.php", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        alert(`Successfully approved ${data.affected} volunteers!`);
        window.location.reload();
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      alert("Failed to approve volunteers.");
    } finally {
      setIsApproving(false);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch((import.meta.env.BASE_URL || "/") + "admin-api.php");
        const text = await response.text();
        let data: ApiData;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(`Server returned non-JSON response:\n${text.slice(0, 300)}`);
        }
        if (data.ok) {
          setApiData(data);
        } else {
          throw new Error(data.error ?? "Unknown server error");
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load admin data");
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

  // Metrics
  const confTotal = counts.ssc2026;
  const confConfirmed = ssc2026Status["Confirmed"] ?? ssc2026Status["Approved"] ?? ssc2026Status["Paid"] ?? 0;
  const confPending = ssc2026Status["Pending"] ?? ssc2026Status["New"] ?? Math.max(0, confTotal - confConfirmed);

  const volTotal = counts.volunteer;
  const volPending = volStatus["Pending"] ?? 0;
  const volSelected = volStatus["Selected"] ?? 0;
  const volWaitlisted = volStatus["Waitlisted"] ?? 0;
  const volUnderReview = volStatus["Under Review"] ?? 0;

  const mobilizedAttendees = apiData?.mobilization?.overview?.total_mobilized_registrations ?? 0;
  const mobilizedCheckedIn = apiData?.mobilization?.overview?.total_mobilized_checked_in ?? 0;

  // Chart data
  const volDeptChartData = Object.entries(volDept)
    .map(([name, count]) => ({ name: name.replace(" and ", " & "), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Filtered registrations
  const filteredData = useMemo(() => {
    return registrations.filter((reg) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !q ||
        reg.name.toLowerCase().includes(q) ||
        reg.email.toLowerCase().includes(q) ||
        (reg.phone ?? "").includes(q) ||
        (reg.id ?? "").toLowerCase().includes(q);
      const matchType = filterFormType === "All" || reg.form_type === filterFormType;
      const matchStatus = filterStatus === "All" || reg.status.toLowerCase() === filterStatus.toLowerCase();
      return matchSearch && matchType && matchStatus;
    });
  }, [searchTerm, filterFormType, filterStatus, registrations]);

  // Volunteer applications subset
  const volunteerApplications = useMemo(() => {
    return registrations.filter((r) => r.form_type === "Volunteer Application");
  }, [registrations]);

  // Safe CSV export protecting against spreadsheet formula injection
  const handleExportCSV = (dataset: Registration[], filenamePrefix = "ssc2026_export") => {
    const sanitize = (val: any) => {
      let str = String(val ?? "").replace(/"/g, '""');
      if (/^[=\+\-@]/.test(str)) {
        str = "'" + str; // prevent formula injection
      }
      return `"${str}"`;
    };

    const headers = [
      "ID",
      "Form Type",
      "Name",
      "Dept / School",
      "Role / Level",
      "Email",
      "Phone",
      "Date",
      "Status",
      "Referral Code",
      "Referred By",
      "Checked In At",
    ];

    const rows = dataset.map((row) => [
      sanitize(row.id),
      sanitize(row.form_type),
      sanitize(row.name),
      sanitize(row.university),
      sanitize(row.level),
      sanitize(row.email),
      sanitize(row.phone),
      sanitize(row.date),
      sanitize(row.status),
      sanitize(row.referral_code),
      sanitize(row.referred_by_code),
      sanitize(row.checked_in_at),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filenamePrefix}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen bg-[#07090e] text-foreground font-sans overflow-hidden">
      
      {/* ── Interactive Onboarding Walkthrough ── */}
      <AdminOnboardingTour
        isOpen={tourOpen}
        onClose={() => setTourOpen(false)}
        onSelectTab={(tab) => setActiveTab(tab as AdminTab)}
      />

      {/* ── Sidebar Navigation ── */}
      <aside className="w-64 shrink-0 border-r border-white/10 bg-[#0b0e17] hidden md:flex flex-col z-20">
        <div className="px-6 py-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h1 className="font-display font-black text-xl text-white tracking-tight flex items-center gap-2">
              SSC <span className="text-purple-glow">2026</span>
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-foreground-subtle mt-0.5">Admin Control Hub</p>
          </div>
          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" title="System Online" />
        </div>

        <nav className="flex-1 p-3 space-y-6 overflow-y-auto">
          
          {/* Group 1: Core Navigation */}
          <div>
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-foreground-subtle">
              Main Operations
            </p>
            <div className="space-y-1">
              {[
                { key: "overview", label: "Executive Overview", icon: <LayoutDashboard size={16} /> },
                { key: "attendees", label: "Attendee Roster", icon: <Users size={16} />, badge: confTotal },
                { key: "volunteers", label: "Volunteers", icon: <HeartHandshake size={16} />, badge: volPending > 0 ? `${volPending} new` : undefined },
                { key: "mobilization", label: "Mobilization & Squads", icon: <Award size={16} /> },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key as AdminTab)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    activeTab === item.key
                      ? "bg-brand/20 text-white border border-brand/40 shadow-sm"
                      : "text-foreground-muted hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={activeTab === item.key ? "text-purple-glow" : "text-foreground-subtle"}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Group 2: Event & Gate Operations */}
          <div>
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-foreground-subtle">
              Event Operations
            </p>
            <div className="space-y-1">
              {[
                { key: "scanner", label: "QR Gate Check-In", icon: <ScanLine size={16} /> },
                { key: "whatsapp", label: "WhatsApp Groups", icon: <MessageSquare size={16} /> },
                { key: "email", label: "Email Broadcasts", icon: <Mail size={16} /> },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key as AdminTab)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    activeTab === item.key
                      ? "bg-brand/20 text-white border border-brand/40 shadow-sm"
                      : "text-foreground-muted hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <span className={activeTab === item.key ? "text-purple-glow" : "text-foreground-subtle"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Group 3: Content CMS */}
          <div>
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-foreground-subtle">
              Content &amp; Publishing
            </p>
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab("blog")}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  activeTab === "blog"
                    ? "bg-brand/20 text-white border border-brand/40 shadow-sm"
                    : "text-foreground-muted hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <span className={activeTab === "blog" ? "text-purple-glow" : "text-foreground-subtle"}>
                  <PenTool size={16} />
                </span>
                <span>Blog &amp; Media CMS</span>
              </button>
            </div>
          </div>

        </nav>

        {/* Sidebar Footer: Walkthrough & Info */}
        <div className="p-3 border-t border-white/10 space-y-1">
          <button
            type="button"
            onClick={() => setTourOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-purple-glow bg-purple-glow/10 hover:bg-purple-glow/20 transition-colors"
          >
            <span className="flex items-center gap-2">
              <HelpCircle size={15} /> Take a Tour
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Help</span>
          </button>
          <a
            href="/"
            target="_blank"
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-foreground-subtle hover:text-white hover:bg-white/5 transition-colors"
          >
            <span>Visit Live Website</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </aside>

      {/* ── Main Content Canvas ── */}
      <main className="flex-1 flex flex-col min-h-0 bg-[#07090e]">
        
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0b0e17] shrink-0">
          <h1 className="font-display font-bold text-lg text-white flex items-center gap-2">
            SSC <span className="text-purple-glow">2026</span>
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTourOpen(true)}
              className="p-1.5 rounded-lg bg-white/10 text-purple-glow"
              title="Tour"
            >
              <HelpCircle size={16} />
            </button>
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as AdminTab)}
              className="bg-[#121524] border border-white/15 text-white text-xs rounded-lg py-1.5 px-3 focus:outline-none"
            >
              <option value="overview">Executive Overview</option>
              <option value="attendees">Attendee Roster</option>
              <option value="volunteers">Volunteers</option>
              <option value="mobilization">Mobilization &amp; Squads</option>
              <option value="scanner">QR Gate Check-In</option>
              <option value="whatsapp">WhatsApp Groups</option>
              <option value="blog">Blog &amp; Media CMS</option>
              <option value="email">Email Broadcasts</option>
            </select>
          </div>
        </header>

        {/* Scrollable Viewport */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Tab Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-glow">
                    {activeTab === "overview"     && "Admin Dashboard"}
                    {activeTab === "attendees"    && "Registration Operations"}
                    {activeTab === "volunteers"   && "People & Teams"}
                    {activeTab === "mobilization" && "Growth & Referrals"}
                    {activeTab === "scanner"      && "Event Day Gate Entry"}
                    {activeTab === "whatsapp"     && "Automations"}
                    {activeTab === "blog"         && "Content Management"}
                    {activeTab === "email"        && "Communications"}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight">
                  {activeTab === "overview"     && "Executive Overview"}
                  {activeTab === "attendees"    && "Attendee Management & Search"}
                  {activeTab === "volunteers"   && "Volunteer Applications & Review"}
                  {activeTab === "mobilization" && "Mobilization & Referral Leaderboard"}
                  {activeTab === "scanner"      && "QR Attendance & Gate Check-In"}
                  {activeTab === "whatsapp"     && "WhatsApp Group Capacity & Rotation"}
                  {activeTab === "blog"         && "Blog & Article CMS"}
                  {activeTab === "email"        && "Email Campaigns & Broadcasts"}
                </h2>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                {activeTab === "attendees" && (
                  <button
                    onClick={() => handleExportCSV(filteredData, "ssc2026_attendees")}
                    disabled={filteredData.length === 0}
                    className="btn-primary inline-flex items-center gap-2 py-2 px-4 text-xs font-bold shrink-0 disabled:opacity-50"
                  >
                    <Download size={14} /> Export CSV ({filteredData.length})
                  </button>
                )}
                {activeTab === "volunteers" && (
                  <button
                    onClick={() => handleExportCSV(volunteerApplications, "ssc2026_volunteers")}
                    disabled={volunteerApplications.length === 0}
                    className="btn-primary inline-flex items-center gap-2 py-2 px-4 text-xs font-bold shrink-0 disabled:opacity-50"
                  >
                    <Download size={14} /> Export Volunteers ({volunteerApplications.length})
                  </button>
                )}
              </div>
            </div>

            {/* ── TAB 1: EXECUTIVE OVERVIEW ──────────────────────────────────── */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-28">
                    <Loader2 className="w-10 h-10 text-purple-glow animate-spin mb-4" />
                    <p className="text-sm text-foreground-muted">Gathering conference telemetry...</p>
                  </div>
                ) : error ? (
                  <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-center">
                    <p className="font-bold mb-1">Failed to load data</p>
                    <p className="text-xs">{error}</p>
                  </div>
                ) : (
                  <>
                    {/* Top 4 Executive KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <StatCard
                        icon={<CalendarDays size={22} />}
                        title="Conference Attendees"
                        value={confTotal}
                        sub={`${confConfirmed} confirmed · ${confPending} pending`}
                        accent="blue"
                        onClick={() => setActiveTab("attendees")}
                      />
                      <StatCard
                        icon={<HeartHandshake size={22} />}
                        title="Volunteer Applicants"
                        value={volTotal}
                        sub={`${volSelected} selected · ${volPending} pending review`}
                        accent="pink"
                        onClick={() => setActiveTab("volunteers")}
                      />
                      <StatCard
                        icon={<Award size={22} />}
                        title="Mobilized Attendees"
                        value={mobilizedAttendees}
                        sub={`${mobilizedCheckedIn} verified checked-in`}
                        accent="yellow"
                        onClick={() => setActiveTab("mobilization")}
                      />
                      <StatCard
                        icon={<Users size={22} />}
                        title="Other Programs"
                        value={counts.campus + counts.ttb + counts.fcf + counts.tribe}
                        sub="Campus Chapters, TTB, FCF, Tribe"
                        accent="purple"
                        onClick={() => setActiveTab("attendees")}
                      />
                    </div>

                    {/* Operational Attention Alerts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Volunteer Review Attention Card */}
                      <div className="rounded-2xl border border-white/10 bg-[#0e101a] p-5 flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 shrink-0">
                            <AlertTriangle size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm">Volunteer Applications Awaiting Review</h4>
                            <p className="text-xs text-foreground-muted mt-1 leading-relaxed">
                              {volPending > 0
                                ? `There are ${volPending} applicants awaiting review across departments.`
                                : "All volunteer applications are currently reviewed."}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveTab("volunteers")}
                          className="px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 text-xs font-semibold text-white hover:bg-white/10 transition-colors shrink-0"
                        >
                          Review →
                        </button>
                      </div>

                      {/* WhatsApp Capacity Attention Card */}
                      <div className="rounded-2xl border border-white/10 bg-[#0e101a] p-5 flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                            <MessageSquare size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm">WhatsApp Group Auto-Rotation</h4>
                            <p className="text-xs text-foreground-muted mt-1 leading-relaxed">
                              Group 01 is configured with the official invite link. Attendees are rotated automatically upon hitting capacity.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveTab("whatsapp")}
                          className="px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 text-xs font-semibold text-white hover:bg-white/10 transition-colors shrink-0"
                        >
                          Manage →
                        </button>
                      </div>
                    </div>

                    {/* Quick Actions Grid */}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-foreground-subtle mb-3">
                        Quick Shortcuts
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {[
                          { label: "Search Attendees", icon: <Users size={16} />, tab: "attendees" },
                          { label: "Review Volunteers", icon: <HeartHandshake size={16} />, tab: "volunteers" },
                          { label: "Mobilizer Leaderboard", icon: <Award size={16} />, tab: "mobilization" },
                          { label: "Gate QR Scanner", icon: <ScanLine size={16} />, tab: "scanner" },
                          { label: "Write Blog Article", icon: <PenTool size={16} />, tab: "blog" },
                          { label: "Email Broadcast", icon: <Mail size={16} />, tab: "email" },
                        ].map((q) => (
                          <button
                            key={q.tab}
                            onClick={() => setActiveTab(q.tab as AdminTab)}
                            className="p-3.5 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20 transition-all text-left flex flex-col justify-between h-24"
                          >
                            <span className="text-purple-glow">{q.icon}</span>
                            <span className="text-xs font-bold text-white leading-tight">{q.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Recent Registrations Preview Table */}
                    <div className="rounded-2xl border border-white/10 bg-[#0e101a] overflow-hidden shadow-xl">
                      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-white text-base">Recent Registrations Activity</h4>
                          <p className="text-xs text-foreground-subtle">Latest incoming submissions across forms</p>
                        </div>
                        <button
                          onClick={() => setActiveTab("attendees")}
                          className="text-xs font-bold text-purple-glow hover:underline flex items-center gap-1"
                        >
                          View All Attendees <ChevronRight size={14} />
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs whitespace-nowrap">
                          <thead className="bg-white/[0.02] text-foreground-muted uppercase text-[10px] tracking-wider border-b border-white/5">
                            <tr>
                              <th className="px-6 py-3 font-semibold">Name / Email</th>
                              <th className="px-6 py-3 font-semibold">Form Type</th>
                              <th className="px-6 py-3 font-semibold">Institution / Org</th>
                              <th className="px-6 py-3 font-semibold">Date</th>
                              <th className="px-6 py-3 font-semibold">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {registrations.slice(0, 6).map((reg) => (
                              <tr
                                key={reg.id}
                                onClick={() => setSelectedAttendee(reg)}
                                className="hover:bg-white/[0.03] transition-colors cursor-pointer"
                              >
                                <td className="px-6 py-3.5">
                                  <div className="font-bold text-white">{reg.name}</div>
                                  <div className="text-foreground-subtle text-[11px]">{reg.email}</div>
                                </td>
                                <td className="px-6 py-3.5">
                                  <FormTypeBadge type={reg.form_type} />
                                </td>
                                <td className="px-6 py-3.5 text-foreground-muted max-w-[180px] truncate">
                                  {reg.university || "—"}
                                </td>
                                <td className="px-6 py-3.5 text-foreground-subtle">
                                  {reg.date ? new Date(reg.date).toLocaleDateString() : "—"}
                                </td>
                                <td className="px-6 py-3.5">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColor(reg.status)}`}>
                                    {reg.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── TAB 2: ATTENDEES ROSTER ────────────────────────────────────── */}
            {activeTab === "attendees" && (
              <div className="space-y-6">
                {/* Search & Filter Bar */}
                <div className="rounded-2xl border border-white/10 bg-[#0e101a] p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-subtle" />
                    <input
                      type="text"
                      placeholder="Search by name, email, phone, or ID (e.g. SSC26-...)"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-4 py-2 text-xs text-white placeholder-white/30 focus:border-purple-glow focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={filterFormType}
                      onChange={(e) => setFilterFormType(e.target.value)}
                      className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:outline-none"
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
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Selected">Selected</option>
                      <option value="Waitlisted">Waitlisted</option>
                      <option value="Not Selected">Not Selected</option>
                    </select>
                  </div>
                </div>

                {/* Table View */}
                <div className="rounded-2xl border border-white/10 bg-[#0e101a] overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-white/[0.02] text-foreground-muted uppercase text-[10px] tracking-wider border-b border-white/5">
                        <tr>
                          <th className="px-6 py-3.5 font-semibold">Attendee</th>
                          <th className="px-6 py-3.5 font-semibold">Form Type</th>
                          <th className="px-6 py-3.5 font-semibold">Institution / Org</th>
                          <th className="px-6 py-3.5 font-semibold">Referral Info</th>
                          <th className="px-6 py-3.5 font-semibold">Date</th>
                          <th className="px-6 py-3.5 font-semibold">Check-In</th>
                          <th className="px-6 py-3.5 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredData.length > 0 ? (
                          filteredData.map((reg) => (
                            <tr
                              key={reg.id}
                              onClick={() => setSelectedAttendee(reg)}
                              className="hover:bg-white/[0.03] transition-colors cursor-pointer"
                            >
                              <td className="px-6 py-3.5">
                                <div className="font-bold text-white">{reg.name}</div>
                                <div className="text-foreground-subtle text-[11px]">{reg.email}</div>
                                {reg.phone && <div className="text-foreground-subtle text-[10px]">{reg.phone}</div>}
                              </td>
                              <td className="px-6 py-3.5">
                                <FormTypeBadge type={reg.form_type} />
                              </td>
                              <td className="px-6 py-3.5 text-foreground-muted max-w-[180px] truncate">
                                {reg.university || "—"}
                              </td>
                              <td className="px-6 py-3.5 text-foreground-muted">
                                {reg.referral_code ? (
                                  <span className="font-mono text-purple-glow">{reg.referral_code}</span>
                                ) : (
                                  "—"
                                )}
                                {reg.referred_by_code && (
                                  <div className="text-[10px] text-foreground-subtle">
                                    Ref by: <span className="text-white">{reg.referred_by_code}</span>
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-3.5 text-foreground-subtle">
                                {reg.date ? new Date(reg.date).toLocaleDateString() : "—"}
                              </td>
                              <td className="px-6 py-3.5">
                                {reg.checked_in_at ? (
                                  <span className="inline-flex items-center gap-1 text-green-400 font-semibold text-[11px]">
                                    <CheckCircle size={12} /> Checked In
                                  </span>
                                ) : (
                                  <span className="text-foreground-subtle text-[11px]">Not Checked In</span>
                                )}
                              </td>
                              <td className="px-6 py-3.5">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColor(reg.status)}`}>
                                  {reg.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="px-6 py-16 text-center text-foreground-muted">
                              No registrations match your search filter.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 3: VOLUNTEERS MANAGEMENT ──────────────────────────────── */}
            {activeTab === "volunteers" && (
              <div className="space-y-8">
                {/* Status KPI summary cards */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="glass-strong rounded-2xl border border-white/5 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-orange-400">Pending Review</p>
                    <h4 className="text-2xl font-black font-display text-orange-400 mt-1">{volPending}</h4>
                  </div>
                  <div className="glass-strong rounded-2xl border border-white/5 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Under Review</p>
                    <h4 className="text-2xl font-black font-display text-blue-400 mt-1">{volUnderReview}</h4>
                  </div>
                  <div className="glass-strong rounded-2xl border border-white/5 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-green-400">Selected</p>
                    <h4 className="text-2xl font-black font-display text-green-400 mt-1">{volSelected}</h4>
                  </div>
                  <div className="glass-strong rounded-2xl border border-white/5 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-yellow-400">Waitlisted</p>
                    <h4 className="text-2xl font-black font-display text-yellow-400 mt-1">{volWaitlisted}</h4>
                  </div>
                  <div className="glass-strong rounded-2xl border border-white/5 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted">Total Applicants</p>
                    <h4 className="text-2xl font-black font-display text-white mt-1">{volTotal}</h4>
                  </div>
                </div>

                {/* Bulk Action & Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Department chart */}
                  <div className="lg:col-span-8 rounded-2xl border border-white/10 bg-[#0e101a] p-6 shadow-xl">
                    <h4 className="font-bold text-white text-sm mb-4">Applicants by Conference Department</h4>
                    {volDeptChartData.length > 0 ? (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={volDeptChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" stroke="#7a87ad" fontSize={11} angle={-25} textAnchor="end" />
                            <YAxis stroke="#7a87ad" fontSize={11} />
                            <RechartsTooltip contentStyle={{ backgroundColor: "#121524", borderColor: "#232738", borderRadius: "10px", fontSize: "12px" }} />
                            <Bar dataKey="count" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <p className="text-xs text-foreground-subtle py-8 text-center">No departmental records yet.</p>
                    )}
                  </div>

                  {/* Actions card */}
                  <div className="lg:col-span-4 rounded-2xl border border-white/10 bg-[#0e101a] p-6 space-y-4 shadow-xl">
                    <h4 className="font-bold text-white text-sm">Bulk Approvals</h4>
                    <p className="text-xs text-foreground-muted leading-relaxed">
                      Approve all pending applicants in one action. This assigns approved volunteer status and records selections.
                    </p>
                    <button
                      onClick={handleApproveVolunteers}
                      disabled={isApproving || volPending === 0}
                      className="w-full py-3 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-colors disabled:opacity-40"
                    >
                      {isApproving ? "Approving Applicants..." : `Approve ${volPending} Pending Volunteers`}
                    </button>
                    <p className="text-[11px] text-foreground-subtle italic">
                      Applicant notifications are automatically dispatched upon status approval.
                    </p>
                  </div>

                </div>

                {/* Volunteer Roster */}
                <div className="rounded-2xl border border-white/10 bg-[#0e101a] overflow-hidden shadow-xl">
                  <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">Volunteer Application Roster</h4>
                      <p className="text-xs text-foreground-subtle">{volunteerApplications.length} total applicant records</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-white/[0.02] text-foreground-muted uppercase text-[10px] tracking-wider border-b border-white/5">
                        <tr>
                          <th className="px-6 py-3.5 font-semibold">Applicant</th>
                          <th className="px-6 py-3.5 font-semibold">Department Preference</th>
                          <th className="px-6 py-3.5 font-semibold">School / Level</th>
                          <th className="px-6 py-3.5 font-semibold">Applied Date</th>
                          <th className="px-6 py-3.5 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {volunteerApplications.map((vol) => (
                          <tr
                            key={vol.id}
                            onClick={() => setSelectedAttendee(vol)}
                            className="hover:bg-white/[0.03] transition-colors cursor-pointer"
                          >
                            <td className="px-6 py-3.5">
                              <div className="font-bold text-white">{vol.name}</div>
                              <div className="text-foreground-subtle text-[11px]">{vol.email}</div>
                              {vol.phone && <div className="text-foreground-subtle text-[10px]">{vol.phone}</div>}
                            </td>
                            <td className="px-6 py-3.5 font-medium text-purple-glow">
                              {vol.university || "General Volunteer"}
                            </td>
                            <td className="px-6 py-3.5 text-foreground-muted">
                              {vol.level || "—"}
                            </td>
                            <td className="px-6 py-3.5 text-foreground-subtle">
                              {vol.date ? new Date(vol.date).toLocaleDateString() : "—"}
                            </td>
                            <td className="px-6 py-3.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColor(vol.status)}`}>
                                {vol.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* ── TAB 4: MOBILIZATION ────────────────────────────────────────── */}
            {activeTab === "mobilization" && (
              <MobilizationManager data={apiData?.mobilization} registrations={registrations} />
            )}

            {/* ── TAB 5: QR SCANNER ──────────────────────────────────────────── */}
            {activeTab === "scanner" && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-white/10 bg-[#0e101a] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-white text-base">Dedicated Door Staff Check-In App</h3>
                    <p className="text-xs text-foreground-muted mt-1">
                      Event staff checking in attendees at doors can use the mobile-optimized /checkin screen directly.
                    </p>
                  </div>
                  <a
                    href="/checkin"
                    target="_blank"
                    className="btn-primary py-2.5 px-6 text-xs font-bold inline-flex items-center gap-2 shrink-0"
                  >
                    Open Standalone Check-In App <ExternalLink size={14} />
                  </a>
                </div>
                <QRScanner />
              </div>
            )}

            {/* ── TAB 6: WHATSAPP GROUPS ─────────────────────────────────────── */}
            {activeTab === "whatsapp" && <WhatsAppGroupsManager />}

            {/* ── TAB 7: BLOG CMS ────────────────────────────────────────────── */}
            {activeTab === "blog" && <BlogManager />}

            {/* ── TAB 8: EMAIL BROADCASTS ────────────────────────────────────── */}
            {activeTab === "email" && <EmailManager />}

          </div>
        </div>
      </main>

      {/* ── ATTENDEE DETAIL MODAL ─────────────────────────────────────────────── */}
      {selectedAttendee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-[#121524] p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setSelectedAttendee(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/5 text-foreground-subtle hover:text-white"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <FormTypeBadge type={selectedAttendee.form_type} />
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColor(selectedAttendee.status)}`}>
                {selectedAttendee.status}
              </span>
            </div>

            <h3 className="font-display font-black text-2xl text-white mb-1">
              {selectedAttendee.name}
            </h3>
            <p className="text-xs text-foreground-muted mb-6">{selectedAttendee.email}</p>

            <div className="space-y-3 rounded-2xl border border-white/10 bg-black/40 p-5 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-foreground-subtle">Registration ID:</span>
                <span className="font-mono font-bold text-purple-glow">{selectedAttendee.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-foreground-subtle">Phone:</span>
                <span className="text-white">{selectedAttendee.phone || "—"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-foreground-subtle">Institution / Dept:</span>
                <span className="text-white">{selectedAttendee.university || "—"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-foreground-subtle">Role / Level:</span>
                <span className="text-white">{selectedAttendee.level || "—"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-foreground-subtle">Unique Referral Code:</span>
                <span className="font-mono text-purple-glow">{selectedAttendee.referral_code || "—"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-foreground-subtle">Referred By Code:</span>
                <span className="text-white font-mono">{selectedAttendee.referred_by_code || "Direct (None)"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-foreground-subtle">Registered Date:</span>
                <span className="text-white">{selectedAttendee.date ? new Date(selectedAttendee.date).toLocaleString() : "—"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-foreground-subtle">Verified Check-In:</span>
                <span className={selectedAttendee.checked_in_at ? "text-green-400 font-bold" : "text-foreground-subtle"}>
                  {selectedAttendee.checked_in_at ? `Yes (${new Date(selectedAttendee.checked_in_at).toLocaleTimeString()})` : "Not checked in"}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedAttendee(null)}
                className="btn-primary py-2 px-6 text-xs font-bold"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}