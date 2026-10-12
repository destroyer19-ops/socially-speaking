import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import {
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  Copy,
  CheckCircle2,
  Share2,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export const Route = createFileRoute("/mobilizer-dashboard")({
  component: MobilizerDashboardPage,
});

interface AttributedAttendee {
  id: string;
  name: string;
  masked_email: string;
  institution: string;
  registration_date: string;
  status: "Checked In" | "Pending";
  checked_in_at: string | null;
}

interface MobilizerData {
  mobilizer: {
    name: string;
    organization: string;
    referral_code: string;
    referral_link: string;
    created_at: string;
  };
  stats: {
    total_registered: number;
    total_checked_in: number;
    attendance_rate: number;
  };
  attendees: AttributedAttendee[];
}

function MobilizerDashboardPage() {
  const [token, setToken] = useState<string>("");
  const [data, setData] = useState<MobilizerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Checked In" | "Pending">("All");

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get("token");
      if (urlToken) {
        localStorage.setItem("ssc_mobilizer_token", urlToken);
        setToken(urlToken);
      } else {
        const stored = localStorage.getItem("ssc_mobilizer_token") || "";
        setToken(stored);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    async function fetchDashboard() {
      setLoading(true);
      setError("");
      try {
        if (import.meta.env.DEV) {
          // Dev mock fallback if php-cgi not running
          try {
            const res = await fetch(`/mobilizer-api.php?token=${encodeURIComponent(token)}`);
            const json = await res.json();
            if (json.ok) {
              setData(json);
              setLoading(false);
              return;
            }
          } catch {
            // Mock data for dev display
            await new Promise((r) => setTimeout(r, 600));
            setData({
              mobilizer: {
                name: "Mobilizer Coordinator",
                organization: "Lagos Youth Network",
                referral_code: "MOBLAGOS26",
                referral_link: `${window.location.origin}/conference-register?ref=MOBLAGOS26`,
                created_at: "2026-10-12",
              },
              stats: {
                total_registered: 48,
                total_checked_in: 21,
                attendance_rate: 43.8,
              },
              attendees: [
                {
                  id: "SSC26-AA11BB22",
                  name: "Chukwudi Okafor",
                  masked_email: "c***r@gmail.com",
                  institution: "University of Lagos",
                  registration_date: "2026-10-12",
                  status: "Checked In",
                  checked_in_at: "2026-12-05 09:15",
                },
                {
                  id: "SSC26-CC33DD44",
                  name: "Grace Adebayo",
                  masked_email: "g***o@yahoo.com",
                  institution: "Lagos State University",
                  registration_date: "2026-10-12",
                  status: "Pending",
                  checked_in_at: null,
                },
              ],
            });
            setLoading(false);
            return;
          }
        }

        const res = await fetch(`/mobilizer-api.php?token=${encodeURIComponent(token)}`);
        const json = await res.json();
        if (!res.ok || !json.ok) {
          throw new Error(json.error || "Failed to load mobilizer data.");
        }
        setData(json);
      } catch (err: any) {
        setError(err.message || "Could not retrieve dashboard information.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [token]);

  const handleCopyLink = () => {
    if (!data?.mobilizer.referral_link) return;
    navigator.clipboard.writeText(data.mobilizer.referral_link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const filteredAttendees = useMemo(() => {
    if (!data?.attendees) return [];
    return data.attendees.filter((att) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !q ||
        att.name.toLowerCase().includes(q) ||
        att.institution.toLowerCase().includes(q) ||
        att.id.toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || att.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [data?.attendees, searchTerm, statusFilter]);

  return (
    <main className="relative flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <div className="flex-1 pt-24 pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {/* Token Prompt if no token present */}
          {!token && !loading && (
            <div className="max-w-md mx-auto my-12 glass-strong rounded-3xl p-8 border border-white/10 text-center">
              <ShieldCheck className="mx-auto text-purple-glow mb-4" size={36} />
              <h2 className="text-xl font-bold font-display text-white">Mobilizer Access Required</h2>
              <p className="mt-2 text-xs text-foreground-muted leading-relaxed">
                Please enter your personal mobilizer access token, or visit the mobilization page to retrieve your link.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const val = (e.currentTarget.elements.namedItem("inputToken") as HTMLInputElement).value.trim();
                  if (val) setToken(val);
                }}
                className="mt-6 space-y-3"
              >
                <input
                  type="text"
                  name="inputToken"
                  placeholder="Paste your access token..."
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple"
                />
                <button type="submit" className="btn-primary w-full py-2.5 text-xs font-semibold">
                  Access Dashboard
                </button>
              </form>
              <p className="mt-4 text-xs text-foreground-subtle">
                Don't have a token? <a href="/mobilize" className="text-purple-400 hover:underline">Register or retrieve here</a>
              </p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 space-y-3">
              <RefreshCw className="animate-spin text-purple-glow" size={32} />
              <p className="text-xs text-foreground-muted uppercase tracking-widest">Loading Mobilizer Data...</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="max-w-md mx-auto my-12 glass-strong rounded-3xl p-8 border border-red-500/20 text-center">
              <AlertCircle className="mx-auto text-red-400 mb-4" size={36} />
              <h2 className="text-xl font-bold font-display text-white">Access Error</h2>
              <p className="mt-2 text-xs text-red-400 leading-relaxed">{error}</p>
              <div className="mt-6 flex justify-center gap-3">
                <a href="/mobilize" className="btn-primary text-xs py-2 px-4">
                  Retrieve Your Link
                </a>
              </div>
            </div>
          )}

          {/* Dashboard Data */}
          {data && !loading && !error && (
            <div className="space-y-8 pt-4">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-widest text-purple-glow font-bold">Mobilizer Portal</span>
                    <span className="text-white/20">•</span>
                    <span className="text-xs text-foreground-muted">{data.mobilizer.organization}</span>
                  </div>
                  <h1 className="text-3xl font-black font-display text-white mt-1">
                    {data.mobilizer.name}
                  </h1>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `Register for Socially Speaking Conference 2026: The Takeover Generation! Free entry: ${data.mobilizer.referral_link}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass rounded-xl border border-white/10 px-4 py-2.5 text-xs text-white hover:border-white/25 inline-flex items-center gap-2 transition-colors"
                  >
                    <Share2 size={14} className="text-green-400" />
                    Share on WhatsApp
                  </a>
                </div>
              </div>

              {/* Referral Link Banner */}
              <div className="glass-strong rounded-3xl border border-purple/30 p-6 sm:p-7 relative overflow-hidden bg-gradient-to-r from-purple/10 via-transparent to-blue-glow/10">
                <div className="max-w-3xl space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-glow">
                    Your Shareable Referral Link
                  </span>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={data.mobilizer.referral_link}
                      className="flex-1 rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-xs text-white font-mono truncate focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="btn-primary text-xs py-3 px-5 inline-flex justify-center items-center gap-2 shrink-0"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 size={15} className="text-green-300" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={15} />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-foreground-subtle">
                    Code: <strong className="text-white font-mono">{data.mobilizer.referral_code}</strong>.
                    Every registration through this link is attributed to your organization.
                  </p>
                </div>
              </div>

              {/* Real-time Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="glass-strong rounded-2xl border border-white/5 p-6 hover:border-white/10 transition-colors">
                  <div className="flex items-center justify-between text-purple-glow mb-4">
                    <Users size={22} />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-foreground-subtle">Volume</span>
                  </div>
                  <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                    Total Registrations
                  </p>
                  <h3 className="text-4xl font-black font-display text-white mt-1">
                    {data.stats.total_registered}
                  </h3>
                  <p className="text-[11px] text-foreground-subtle mt-1.5">Attributed to your link</p>
                </div>

                <div className="glass-strong rounded-2xl border border-white/5 p-6 hover:border-white/10 transition-colors">
                  <div className="flex items-center justify-between text-green-400 mb-4">
                    <CheckCircle size={22} />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-foreground-subtle">Verified</span>
                  </div>
                  <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                    Attendees Checked In
                  </p>
                  <h3 className="text-4xl font-black font-display text-white mt-1">
                    {data.stats.total_checked_in}
                  </h3>
                  <p className="text-[11px] text-foreground-subtle mt-1.5">Confirmed at event entrance</p>
                </div>

                <div className="glass-strong rounded-2xl border border-white/5 p-6 hover:border-white/10 transition-colors">
                  <div className="flex items-center justify-between text-blue-glow mb-4">
                    <TrendingUp size={22} />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-foreground-subtle">Turnout</span>
                  </div>
                  <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                    Attendance Rate
                  </p>
                  <h3 className="text-4xl font-black font-display text-white mt-1">
                    {data.stats.attendance_rate}%
                  </h3>
                  <p className="text-[11px] text-foreground-subtle mt-1.5">Turnout conversion</p>
                </div>
              </div>

              {/* Referred Attendees Table */}
              <div className="glass-strong rounded-3xl border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display font-bold text-lg text-white">Referred Attendees</h3>
                    <p className="text-xs text-foreground-muted mt-0.5">
                      Showing attendees registered through your link ({filteredAttendees.length} records)
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-subtle" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search attendee..."
                        className="rounded-xl bg-white/5 border border-white/10 pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-foreground-subtle focus:outline-none focus:border-purple"
                      />
                    </div>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="rounded-xl bg-ink-deep border border-white/10 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Checked In">Checked In</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-white/[0.02] text-foreground-muted uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-6 py-3.5 font-semibold">Attendee Name</th>
                        <th className="px-6 py-3.5 font-semibold">Email</th>
                        <th className="px-6 py-3.5 font-semibold">Institution</th>
                        <th className="px-6 py-3.5 font-semibold">Registration Date</th>
                        <th className="px-6 py-3.5 font-semibold">Check-In Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredAttendees.length > 0 ? (
                        filteredAttendees.map((att) => (
                          <tr key={att.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-medium text-white">{att.name}</span>
                              <span className="block text-[10px] font-mono text-foreground-subtle mt-0.5">{att.id}</span>
                            </td>
                            <td className="px-6 py-4 text-foreground-muted font-mono">{att.masked_email}</td>
                            <td className="px-6 py-4 text-foreground-subtle">{att.institution}</td>
                            <td className="px-6 py-4 text-foreground-subtle">{att.registration_date}</td>
                            <td className="px-6 py-4">
                              {att.status === "Checked In" ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                                  <CheckCircle size={12} />
                                  Checked In {att.checked_in_at ? `(${att.checked_in_at.slice(11)})` : ""}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                                  <Clock size={12} />
                                  Pending
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-foreground-muted">
                            No attendees found matching your criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
