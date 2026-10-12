import { useState, useMemo } from "react";
import {
  Users,
  CheckCircle,
  TrendingUp,
  Award,
  Search,
  Download,
  Copy,
  CheckCircle2,
  Filter,
  UserCheck,
  Clock,
  ArrowUpDown,
  ExternalLink,
} from "lucide-react";

export interface MobilizerRecord {
  id: string;
  type: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  referral_code: string;
  date: string;
  total_registrations: number;
  checked_in_count: number;
  attendance_rate: number;
  status: string;
}

export interface AttendeeRecord {
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
}

export interface MobilizationData {
  total_registrations: number;
  total_checked_in: number;
  attendance_rate: number;
  total_mobilizers: number;
  total_referred: number;
  total_direct: number;
  mobilizers: MobilizerRecord[];
  attendee_referrers: any[];
}

interface MobilizationManagerProps {
  data?: MobilizationData;
  registrations: AttendeeRecord[];
}

export function MobilizationManager({ data, registrations }: MobilizationManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"registrations" | "attendance" | "rate">("registrations");
  const [selectedReferrerCode, setSelectedReferrerCode] = useState<string | null>(null);
  const [attendeeSearch, setAttendeeSearch] = useState("");
  const [attendeeStatusFilter, setAttendeeStatusFilter] = useState<"All" | "Checked In" | "Pending">("All");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const mobilizers = data?.mobilizers ?? [];

  // Filter & sort mobilizers
  const filteredMobilizers = useMemo(() => {
    return mobilizers
      .filter((m) => {
        const q = searchTerm.toLowerCase();
        return (
          !q ||
          m.name.toLowerCase().includes(q) ||
          m.organization.toLowerCase().includes(q) ||
          m.referral_code.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === "attendance") {
          return b.checked_in_count - a.checked_in_count;
        }
        if (sortBy === "rate") {
          return b.attendance_rate - a.attendance_rate;
        }
        return b.total_registrations - a.total_registrations;
      });
  }, [mobilizers, searchTerm, sortBy]);

  // Conference registrations only (form_type === 'SSC 2026 Registration')
  const confAttendees = useMemo(() => {
    return registrations.filter((r) => r.form_type === "SSC 2026 Registration");
  }, [registrations]);

  // Filtered referred attendees for drill-down
  const drillDownAttendees = useMemo(() => {
    return confAttendees.filter((att) => {
      // If a specific referrer is selected, filter by it
      if (selectedReferrerCode) {
        if (att.referred_by_code?.toUpperCase() !== selectedReferrerCode.toUpperCase()) {
          return false;
        }
      } else {
        // Only show attendees who have a referral code
        if (!att.referred_by_code) return false;
      }

      const q = attendeeSearch.toLowerCase();
      const matchSearch =
        !q ||
        att.name.toLowerCase().includes(q) ||
        att.email.toLowerCase().includes(q) ||
        att.university.toLowerCase().includes(q) ||
        (att.referred_by_code ?? "").toLowerCase().includes(q) ||
        (att.reg_id ?? "").toLowerCase().includes(q);

      const isCheckedIn = att.status === "Checked In" || !!att.checked_in_at;
      const matchStatus =
        attendeeStatusFilter === "All" ||
        (attendeeStatusFilter === "Checked In" && isCheckedIn) ||
        (attendeeStatusFilter === "Pending" && !isCheckedIn);

      return matchSearch && matchStatus;
    });
  }, [confAttendees, selectedReferrerCode, attendeeSearch, attendeeStatusFilter]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Export Mobilizers Summary CSV
  const exportMobilizersCSV = () => {
    const headers = [
      "ID",
      "Mobilizer Name",
      "Organization",
      "Email",
      "Phone",
      "Referral Code",
      "Total Registrations",
      "Checked-In Count",
      "Attendance Rate (%)",
      "Status",
    ];

    const rows = filteredMobilizers.map((m) => [
      m.id,
      `"${m.name}"`,
      `"${m.organization}"`,
      `"${m.email}"`,
      `"${m.phone}"`,
      m.referral_code,
      m.total_registrations,
      m.checked_in_count,
      `${m.attendance_rate}%`,
      m.status,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ssc2026_mobilizers_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Referred Attendees Drill-Down CSV
  const exportAttendeesCSV = () => {
    const headers = [
      "Registration ID",
      "Attendee Name",
      "Email",
      "Phone",
      "Institution",
      "Referral Code (Referrer)",
      "Registration Date",
      "Status",
      "Checked In At",
      "Checked In By",
    ];

    const rows = drillDownAttendees.map((a) => [
      a.reg_id || a.id,
      `"${a.name}"`,
      `"${a.email}"`,
      `"${a.phone}"`,
      `"${a.university}"`,
      a.referred_by_code || "Direct",
      a.date,
      a.status,
      a.checked_in_at || "N/A",
      a.checked_in_by || "N/A",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ssc2026_referred_attendees_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalRegs = data?.total_registrations ?? confAttendees.length;
  const totalCheckedIn = data?.total_checked_in ?? confAttendees.filter((a) => a.status === "Checked In" || a.checked_in_at).length;
  const overallRate = totalRegs > 0 ? ((totalCheckedIn / totalRegs) * 100).toFixed(1) : "0.0";
  const totalMobilizers = data?.total_mobilizers ?? mobilizers.length;
  const totalReferred = data?.total_referred ?? confAttendees.filter((a) => a.referred_by_code).length;

  return (
    <div className="space-y-8">
      {/* ── Summary Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-strong rounded-2xl border border-white/5 p-5">
          <div className="flex items-center justify-between text-purple-glow mb-3">
            <Users size={20} />
            <span className="text-[10px] uppercase font-bold text-foreground-subtle">Total</span>
          </div>
          <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Conference Registrations</p>
          <h4 className="text-3xl font-black font-display text-white mt-1">{totalRegs}</h4>
          <p className="text-[11px] text-foreground-subtle mt-0.5">Attendee count</p>
        </div>

        <div className="glass-strong rounded-2xl border border-white/5 p-5">
          <div className="flex items-center justify-between text-green-400 mb-3">
            <CheckCircle size={20} />
            <span className="text-[10px] uppercase font-bold text-foreground-subtle">Entrance</span>
          </div>
          <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Verified Check-Ins</p>
          <h4 className="text-3xl font-black font-display text-white mt-1">{totalCheckedIn}</h4>
          <p className="text-[11px] text-foreground-subtle mt-0.5">Actual event attendance</p>
        </div>

        <div className="glass-strong rounded-2xl border border-white/5 p-5">
          <div className="flex items-center justify-between text-blue-glow mb-3">
            <TrendingUp size={20} />
            <span className="text-[10px] uppercase font-bold text-foreground-subtle">Turnout</span>
          </div>
          <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Overall Attendance Rate</p>
          <h4 className="text-3xl font-black font-display text-white mt-1">{overallRate}%</h4>
          <p className="text-[11px] text-foreground-subtle mt-0.5">Checked-in / Registered</p>
        </div>

        <div className="glass-strong rounded-2xl border border-white/5 p-5">
          <div className="flex items-center justify-between text-yellow-400 mb-3">
            <Award size={20} />
            <span className="text-[10px] uppercase font-bold text-foreground-subtle">Mobilizers</span>
          </div>
          <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Active Mobilizers</p>
          <h4 className="text-3xl font-black font-display text-white mt-1">{totalMobilizers}</h4>
          <p className="text-[11px] text-foreground-subtle mt-0.5">Registered leaders</p>
        </div>

        <div className="glass-strong rounded-2xl border border-white/5 p-5 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-pink-400 mb-3">
            <UserCheck size={20} />
            <span className="text-[10px] uppercase font-bold text-foreground-subtle">Attribution</span>
          </div>
          <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Referred Registrations</p>
          <h4 className="text-3xl font-black font-display text-white mt-1">{totalReferred}</h4>
          <p className="text-[11px] text-foreground-subtle mt-0.5">
            {totalRegs > 0 ? `${((totalReferred / totalRegs) * 100).toFixed(1)}% of all attendees` : "0%"}
          </p>
        </div>
      </div>

      {/* ── Mobilizers Performance Leaderboard ── */}
      <div className="glass-strong rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-bold text-lg text-white">Mobilizers Leaderboard & Attribution</h3>
            <p className="text-xs text-foreground-muted mt-0.5">
              Comparison between registrations brought in vs. verified attendees who showed up.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-subtle" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search mobilizer / org..."
                className="rounded-xl bg-white/5 border border-white/10 pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-foreground-subtle focus:outline-none focus:border-purple"
              />
            </div>

            <div className="flex items-center gap-1.5 rounded-xl bg-white/5 border border-white/10 p-1">
              <span className="text-[10px] uppercase font-bold text-foreground-subtle px-2">Sort:</span>
              <button
                type="button"
                onClick={() => setSortBy("registrations")}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  sortBy === "registrations" ? "bg-purple/20 text-purple-glow font-bold" : "text-foreground-muted hover:text-white"
                }`}
              >
                Volume
              </button>
              <button
                type="button"
                onClick={() => setSortBy("attendance")}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  sortBy === "attendance" ? "bg-purple/20 text-purple-glow font-bold" : "text-foreground-muted hover:text-white"
                }`}
              >
                Actual Attendance
              </button>
              <button
                type="button"
                onClick={() => setSortBy("rate")}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  sortBy === "rate" ? "bg-purple/20 text-purple-glow font-bold" : "text-foreground-muted hover:text-white"
                }`}
              >
                Turnout %
              </button>
            </div>

            <button
              onClick={exportMobilizersCSV}
              disabled={filteredMobilizers.length === 0}
              className="btn-primary text-xs py-2 px-3 inline-flex items-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              <Download size={14} />
              Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-white/[0.02] text-foreground-muted uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Mobilizer Name</th>
                <th className="px-6 py-3.5 font-semibold">Institution / Org</th>
                <th className="px-6 py-3.5 font-semibold">Referral Code</th>
                <th className="px-6 py-3.5 font-semibold text-right">Registrations</th>
                <th className="px-6 py-3.5 font-semibold text-right">Verified Attendees</th>
                <th className="px-6 py-3.5 font-semibold text-right">Turnout Rate</th>
                <th className="px-6 py-3.5 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredMobilizers.length > 0 ? (
                filteredMobilizers.map((mob) => {
                  const isSelected = selectedReferrerCode?.toUpperCase() === mob.referral_code.toUpperCase();
                  return (
                    <tr
                      key={mob.id}
                      className={`hover:bg-white/[0.03] transition-colors ${
                        isSelected ? "bg-purple/10 border-l-2 border-purple-glow" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{mob.name}</div>
                        <div className="text-[11px] text-foreground-muted">{mob.email}</div>
                        {mob.phone && <div className="text-[10px] text-foreground-subtle">{mob.phone}</div>}
                      </td>
                      <td className="px-6 py-4 text-foreground-subtle max-w-[200px] truncate">{mob.organization}</td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleCopy(mob.referral_code)}
                          className="inline-flex items-center gap-1.5 font-mono text-[11px] text-purple-400 bg-purple/10 px-2 py-1 rounded-md hover:bg-purple/20 transition-colors"
                          title="Click to copy code"
                        >
                          {mob.referral_code}
                          {copiedCode === mob.referral_code ? (
                            <CheckCircle2 size={12} className="text-green-400" />
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-white text-sm">{mob.total_registrations}</td>
                      <td className="px-6 py-4 text-right font-bold text-green-400 text-sm">{mob.checked_in_count}</td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            mob.attendance_rate >= 50
                              ? "bg-green-500/10 text-green-400 border border-green-500/20"
                              : mob.attendance_rate >= 25
                              ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                              : "bg-white/5 text-foreground-muted"
                          }`}
                        >
                          {mob.attendance_rate}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedReferrerCode(null);
                            } else {
                              setSelectedReferrerCode(mob.referral_code);
                            }
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                            isSelected
                              ? "bg-purple/30 text-white border border-purple/50"
                              : "bg-white/5 text-foreground-muted hover:text-white hover:bg-white/10"
                          }`}
                        >
                          {isSelected ? "Clear Filter" : "Filter Attendees"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-foreground-muted">
                    No mobilizers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Referred Attendees Detailed Drill-Down ── */}
      <div className="glass-strong rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-lg text-white">Referred Attendees Drill-Down</h3>
              {selectedReferrerCode && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple/20 text-purple-glow border border-purple/40">
                  Referrer: {selectedReferrerCode}
                </span>
              )}
            </div>
            <p className="text-xs text-foreground-muted mt-0.5">
              Showing individual attendee records and their live event check-in status ({drillDownAttendees.length} attendees)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {selectedReferrerCode && (
              <button
                type="button"
                onClick={() => setSelectedReferrerCode(null)}
                className="text-xs text-purple-400 hover:underline px-2 py-1"
              >
                Show All Referrals
              </button>
            )}

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-subtle" />
              <input
                type="text"
                value={attendeeSearch}
                onChange={(e) => setAttendeeSearch(e.target.value)}
                placeholder="Search attendee by name/ID..."
                className="rounded-xl bg-white/5 border border-white/10 pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-foreground-subtle focus:outline-none focus:border-purple"
              />
            </div>

            <select
              value={attendeeStatusFilter}
              onChange={(e) => setAttendeeStatusFilter(e.target.value as any)}
              className="rounded-xl bg-ink-deep border border-white/10 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple"
            >
              <option value="All">All Statuses</option>
              <option value="Checked In">Checked In Only</option>
              <option value="Pending">Pending Only</option>
            </select>

            <button
              onClick={exportAttendeesCSV}
              disabled={drillDownAttendees.length === 0}
              className="btn-primary text-xs py-2 px-3 inline-flex items-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              <Download size={14} />
              Export Referrals CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-white/[0.02] text-foreground-muted uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Attendee</th>
                <th className="px-6 py-3.5 font-semibold">Institution / Org</th>
                <th className="px-6 py-3.5 font-semibold">Referrer Code</th>
                <th className="px-6 py-3.5 font-semibold">Registration Date</th>
                <th className="px-6 py-3.5 font-semibold">Check-In Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {drillDownAttendees.length > 0 ? (
                drillDownAttendees.map((att) => {
                  const isCheckedIn = att.status === "Checked In" || !!att.checked_in_at;
                  return (
                    <tr key={att.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{att.name}</div>
                        <div className="text-[11px] text-foreground-muted font-mono">{att.email}</div>
                        <div className="text-[10px] text-foreground-subtle font-mono">{att.reg_id || att.id}</div>
                      </td>
                      <td className="px-6 py-4 text-foreground-subtle max-w-[180px] truncate">{att.university}</td>
                      <td className="px-6 py-4 font-mono font-bold text-purple-400">
                        {att.referred_by_code || "Direct"}
                      </td>
                      <td className="px-6 py-4 text-foreground-subtle">{att.date}</td>
                      <td className="px-6 py-4">
                        {isCheckedIn ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                            <CheckCircle size={12} />
                            Checked In {att.checked_in_at ? `(${att.checked_in_at.slice(11)})` : ""}
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                            <Clock size={12} />
                            Pending
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-foreground-muted">
                    No referred attendees match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
