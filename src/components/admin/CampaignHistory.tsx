import { useState, useEffect, useCallback } from "react";
import {
  RefreshCw,
  Loader2,
  AlertCircle,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Database,
  Upload,
  Send,
  Inbox,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Campaign {
  id: number;
  created_at: string;
  subject: string;
  source: string;
  filters: Record<string, string> | null;
  recipient_count: number;
  sent_count: number;
  failed_count: number;
  status: string;
  sent_by: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const SOURCE_LABELS: Record<string, string> = {
  ssc2026_registrations: "SSC 2026 Registrations",
  ssc2026_volunteers:    "SSC 2026 Volunteers",
  campus_registrations:  "Campus Chapter (UNILAG)",
  ttb_registrations:     "Takeover Table",
  fcf_registrations:     "First Class Formula",
  tribe_applications:    "Tribe Applications",
  csv:                   "CSV Upload",
};

function sourceLabel(key: string): string {
  return SOURCE_LABELS[key] ?? key;
}

function formatDate(dt: string): string {
  if (!dt) return "—";
  const d = new Date(dt.replace(" ", "T") + "Z");
  return d.toLocaleString("en-GB", {
    day:    "2-digit",
    month:  "short",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  });
}

function deliveryRate(sent: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((sent / total) * 100);
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status, failed }: { status: string; failed: number }) {
  if (status === "done" && failed === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
        <CheckCircle size={11} /> Delivered
      </span>
    );
  }
  if (status === "done" && failed > 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
        <AlertCircle size={11} /> Partial
      </span>
    );
  }
  if (status === "sending") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
        <Loader2 size={11} className="animate-spin" /> Sending
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
        <XCircle size={11} /> Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-foreground-muted border border-white/10">
      <Clock size={11} /> {status}
    </span>
  );
}

// ─── Delivery bar ──────────────────────────────────────────────────────────────
function DeliveryBar({ sent, total }: { sent: number; total: number }) {
  const pct = deliveryRate(sent, total);
  const color =
    pct === 100 ? "bg-green-500" : pct >= 80 ? "bg-orange-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-foreground-subtle whitespace-nowrap">{pct}%</span>
    </div>
  );
}

// ─── Expanded detail row ──────────────────────────────────────────────────────
function CampaignDetail({ campaign }: { campaign: Campaign }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3 px-6 pb-5 pt-1">
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-widest text-foreground-subtle">
          Delivery Detail
        </p>
        <div className="glass-strong rounded-xl border border-white/10 p-3 space-y-2">
          {[
            { label: "Total Recipients", value: campaign.recipient_count.toLocaleString(), color: "text-white" },
            { label: "Successfully Sent", value: campaign.sent_count.toLocaleString(), color: "text-green-400" },
            { label: "Failed",           value: campaign.failed_count.toLocaleString(), color: campaign.failed_count > 0 ? "text-red-400" : "text-foreground-subtle" },
            { label: "Delivery Rate",    value: `${deliveryRate(campaign.sent_count, campaign.recipient_count)}%`, color: "text-blue-400" },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-xs text-foreground-subtle">{row.label}</span>
              <span className={`text-xs font-bold ${row.color}`}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-widest text-foreground-subtle">
          Campaign Info
        </p>
        <div className="glass-strong rounded-xl border border-white/10 p-3 space-y-2">
          {[
            { label: "Source",   value: sourceLabel(campaign.source) },
            { label: "Sent By",  value: campaign.sent_by || "Admin" },
            { label: "Sent At",  value: formatDate(campaign.created_at) },
            { label: "Campaign ID", value: `#${campaign.id}` },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-4">
              <span className="text-xs text-foreground-subtle shrink-0">{row.label}</span>
              <span className="text-xs text-white text-right truncate">{row.value}</span>
            </div>
          ))}
          {campaign.filters && Object.keys(campaign.filters).length > 0 && (
            <div className="flex items-start justify-between gap-4 pt-1 border-t border-white/5">
              <span className="text-xs text-foreground-subtle shrink-0">Filters</span>
              <div className="flex flex-wrap gap-1 justify-end">
                {Object.entries(campaign.filters).map(([k, v]) => (
                  <span
                    key={k}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-purple/20 text-purple-glow border border-purple/30"
                  >
                    {k}: {v}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function CampaignHistory() {
  const [campaigns, setCampaigns]   = useState<Campaign[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCampaigns = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else         setRefreshing(true);
    setError("");

    try {
      const res  = await fetch("/email-manager.php?action=get_campaigns");
      const json = await res.json();
      if (json.ok) setCampaigns(json.campaigns);
      else         setError(json.error ?? "Failed to load campaigns");
    } catch {
      setError("Could not reach the server");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="animate-spin text-purple-glow" size={32} />
        <p className="text-sm text-foreground-muted">Loading campaign history…</p>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-5 py-4 flex items-center gap-3 text-red-400">
        <AlertCircle size={18} className="shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">Failed to load history</p>
          <p className="text-xs mt-0.5 text-red-400/70">{error}</p>
        </div>
        <button
          onClick={() => fetchCampaigns()}
          className="text-xs underline hover:no-underline"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
          <Inbox size={36} className="text-foreground-subtle" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">No campaigns yet</p>
          <p className="text-xs text-foreground-subtle mt-1">
            Dispatched campaigns will appear here with delivery stats.
          </p>
        </div>
        <button
          onClick={() => fetchCampaigns()}
          className="inline-flex items-center gap-2 text-xs text-foreground-muted hover:text-white transition-colors"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>
    );
  }

  // ── Table ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">
            {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""}
          </p>
          <p className="text-xs text-foreground-subtle">Most recent first</p>
        </div>
        <button
          onClick={() => fetchCampaigns(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 text-xs text-foreground-muted hover:text-white
            transition-colors disabled:opacity-50"
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Campaign list */}
      <div className="glass-strong rounded-2xl border border-white/5 overflow-hidden">
        <div className="divide-y divide-white/5">
          {campaigns.map((c) => {
            const expanded = expandedId === c.id;
            return (
              <div key={c.id}>
                {/* Main row */}
                <button
                  onClick={() => setExpandedId(expanded ? null : c.id)}
                  className="w-full text-left hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-start gap-4 px-5 py-4">

                    {/* Icon */}
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10 mt-0.5 shrink-0">
                      {c.source === "csv"
                        ? <Upload size={15} className="text-blue-glow" />
                        : <Database size={15} className="text-purple-glow" />}
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {c.subject}
                          </p>
                          <p className="text-xs text-foreground-subtle mt-0.5">
                            {sourceLabel(c.source)} · {formatDate(c.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <StatusBadge status={c.status} failed={c.failed_count} />
                          <div className="hidden sm:flex items-center gap-1.5 text-xs text-foreground-muted">
                            <Send size={12} className="text-green-400" />
                            {c.sent_count.toLocaleString()} / {c.recipient_count.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Delivery bar */}
                      <div className="mt-2.5 flex items-center gap-4">
                        <DeliveryBar sent={c.sent_count} total={c.recipient_count} />
                        <span className="sm:hidden text-xs text-foreground-subtle">
                          {c.sent_count.toLocaleString()} sent
                        </span>
                        {c.failed_count > 0 && (
                          <span className="text-xs text-red-400 flex items-center gap-1">
                            <XCircle size={11} /> {c.failed_count} failed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Expand toggle */}
                    <div className="mt-1 shrink-0 text-foreground-muted">
                      {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </button>

                {/* Expanded detail */}
                {expanded && (
                  <div className="border-t border-white/5 bg-white/[0.01]">
                    <CampaignDetail campaign={c} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Table footer */}
        <div className="px-5 py-3 border-t border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-4 text-xs text-foreground-subtle">
            <span className="flex items-center gap-1.5">
              <Mail size={11} />
              Total sent:{" "}
              <strong className="text-white">
                {campaigns.reduce((a, c) => a + c.sent_count, 0).toLocaleString()}
              </strong>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle size={11} className="text-green-400" />
              Campaigns:{" "}
              <strong className="text-white">{campaigns.length}</strong>
            </span>
            <span className="flex items-center gap-1.5 ml-auto">
              Showing last 100
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
