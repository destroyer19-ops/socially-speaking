import { useState } from "react";
import {
  ArrowLeft,
  Send,
  Loader2,
  CheckCircle,
  XCircle,
  Users,
  Mail,
  Database,
  Upload,
  Eye,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import type { RecipientSource } from "./RecipientSelector";
import type { ComposedEmail } from "./CampaignComposer";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DispatchResult {
  total: number;
  sent: number;
  failed: number;
  campaign_id: number | null;
  errors: string[];
}

interface CampaignConfirmProps {
  source: RecipientSource;
  email: ComposedEmail;
  onBack: () => void;
  onDone: () => void; // called after a successful dispatch to reset the wizard
}

type DispatchState = "idle" | "sending" | "success" | "error";

// ─── Small summary row ────────────────────────────────────────────────────────
function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
      <span className="mt-0.5 p-1.5 rounded-lg bg-white/5 border border-white/10 text-foreground-muted shrink-0">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-foreground-subtle">{label}</p>
        <p className="text-sm font-medium text-white mt-0.5 break-words">{value}</p>
      </div>
    </div>
  );
}

// ─── Result stat card ─────────────────────────────────────────────────────────
function ResultCard({
  value,
  label,
  accent,
}: {
  value: number;
  label: string;
  accent: "green" | "red" | "blue";
}) {
  const colors = {
    green: "text-green-400 bg-green-500/10 border-green-500/20",
    red:   "text-red-400   bg-red-500/10   border-red-500/20",
    blue:  "text-blue-400  bg-blue-500/10  border-blue-500/20",
  };
  return (
    <div className={`rounded-2xl border p-4 text-center ${colors[accent]}`}>
      <p className="text-3xl font-black">{value.toLocaleString()}</p>
      <p className="text-xs font-semibold mt-1 opacity-80">{label}</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function CampaignConfirm({
  source,
  email,
  onBack,
  onDone,
}: CampaignConfirmProps) {
  const [confirmed, setConfirmed]         = useState(false);
  const [showPreview, setShowPreview]     = useState(false);
  const [showErrors, setShowErrors]       = useState(false);
  const [dispatchState, setDispatchState] = useState<DispatchState>("idle");
  const [result, setResult]               = useState<DispatchResult | null>(null);
  const [serverError, setServerError]     = useState("");

  const isSending = dispatchState === "sending";

  // ── Dispatch ────────────────────────────────────────────────────────────────
  async function handleDispatch() {
    if (!confirmed) return;
    setDispatchState("sending");
    setServerError("");

    try {
      const res = await fetch("/email-manager.php?action=dispatch", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject:    email.subject,
          html_body:  email.htmlBody,
          source:     source.sourceKey,
          recipients: source.recipients,
          email_col:  source.emailCol,
          name_col:   source.nameCol,
          filters:    null,
          sent_by:    "Admin",
        }),
      });

      const json = await res.json();

      if (json.ok) {
        setResult(json);
        setDispatchState("success");
      } else {
        setServerError(json.error ?? "Server returned an error.");
        setDispatchState("error");
      }
    } catch {
      setServerError("Could not reach the server. Check your connection and try again.");
      setDispatchState("error");
    }
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (dispatchState === "success" && result) {
    const allOk = result.failed === 0;
    return (
      <div className="space-y-6">
        {/* Hero */}
        <div className="text-center py-6">
          <div className={`mx-auto mb-5 w-20 h-20 rounded-full flex items-center justify-center border ${
            allOk
              ? "bg-green-500/15 border-green-500/30"
              : "bg-orange-500/15 border-orange-500/30"
          }`}>
            {allOk
              ? <CheckCircle size={36} className="text-green-400" />
              : <AlertTriangle size={36} className="text-orange-400" />}
          </div>
          <h2 className="text-2xl font-black text-white">
            {allOk ? "Campaign Dispatched!" : "Campaign Sent with Warnings"}
          </h2>
          <p className="text-foreground-muted mt-2 text-sm">
            {allOk
              ? `All ${result.total.toLocaleString()} emails were sent successfully.`
              : `${result.sent.toLocaleString()} of ${result.total.toLocaleString()} emails sent. ${result.failed} failed.`}
          </p>
          {result.campaign_id && (
            <p className="text-xs text-foreground-subtle mt-1">
              Campaign #{result.campaign_id} recorded in history.
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <ResultCard value={result.total}  label="Total"  accent="blue"  />
          <ResultCard value={result.sent}   label="Sent"   accent="green" />
          <ResultCard value={result.failed} label="Failed" accent="red"   />
        </div>

        {/* Error log */}
        {result.errors.length > 0 && (
          <div className="glass-strong rounded-xl border border-orange-500/20">
            <button
              onClick={() => setShowErrors((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm text-orange-400 hover:text-orange-300 transition-colors"
            >
              <span className="flex items-center gap-2">
                <AlertTriangle size={15} />
                {result.errors.length} delivery issue{result.errors.length > 1 ? "s" : ""}
              </span>
              {showErrors ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
            {showErrors && (
              <div className="border-t border-white/5 px-4 pb-4 pt-3 space-y-1.5">
                {result.errors.map((err, i) => (
                  <p key={i} className="text-xs text-red-400 font-mono">{err}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onDone}
            className="flex-1 btn-primary justify-center"
          >
            Back to Email Manager
          </button>
          <button
            onClick={onDone}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/10
              bg-white/5 hover:bg-white/10 text-white font-semibold text-sm py-3 transition-colors"
          >
            <RotateCcw size={15} />
            New Campaign
          </button>
        </div>
      </div>
    );
  }

  // ── Idle / error / sending screen ───────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Back */}
      {!isSending && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
      )}

      {/* Summary card */}
      <div className="glass-strong rounded-2xl border border-white/10 p-5">
        <h3 className="text-sm font-bold text-foreground-subtle uppercase tracking-wider mb-1">
          Campaign Summary
        </h3>
        <div className="divide-y divide-white/5">
          <SummaryRow
            icon={<Mail size={14} />}
            label="Subject"
            value={email.subject}
          />
          <SummaryRow
            icon={<Users size={14} />}
            label="Recipients"
            value={
              <span>
                <strong className="text-purple-glow text-base">
                  {source.recipients.length.toLocaleString()}
                </strong>{" "}
                people
              </span>
            }
          />
          <SummaryRow
            icon={source.type === "csv" ? <Upload size={14} /> : <Database size={14} />}
            label="Recipient Source"
            value={source.label}
          />
          <SummaryRow
            icon={<Mail size={14} />}
            label="Sender"
            value={
              <span className="text-foreground-muted">
                Socially Speaking &lt;hello@thetakeover2025.com&gt;
              </span>
            }
          />
        </div>
      </div>

      {/* Collapsible email preview */}
      <div className="glass-strong rounded-2xl border border-white/10 overflow-hidden">
        <button
          onClick={() => setShowPreview((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
        >
          <span className="flex items-center gap-2 text-sm font-medium text-white">
            <Eye size={15} className="text-purple-glow" />
            Email Preview
          </span>
          {showPreview
            ? <ChevronUp size={16} className="text-foreground-muted" />
            : <ChevronDown size={16} className="text-foreground-muted" />}
        </button>
        {showPreview && (
          <div className="border-t border-white/5 bg-white">
            <iframe
              srcDoc={email.htmlBody}
              title="Campaign preview"
              className="w-full border-0"
              style={{ height: "480px" }}
              sandbox="allow-same-origin"
            />
          </div>
        )}
      </div>

      {/* Warning */}
      <div className="rounded-xl bg-orange-500/10 border border-orange-500/20 px-4 py-3.5 flex items-start gap-3">
        <AlertTriangle size={16} className="text-orange-400 mt-0.5 shrink-0" />
        <p className="text-sm text-orange-300 leading-relaxed">
          You are about to send this email to{" "}
          <strong className="text-orange-200">
            {source.recipients.length.toLocaleString()} recipient
            {source.recipients.length !== 1 ? "s" : ""}
          </strong>
          . This action cannot be undone. Make sure you have sent a test email and are
          happy with the content before proceeding.
        </p>
      </div>

      {/* Confirmation checkbox */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <span
          onClick={() => !isSending && setConfirmed((v) => !v)}
          className={`mt-0.5 h-5 w-5 shrink-0 rounded border-2 flex items-center justify-center transition-all ${
            confirmed
              ? "bg-purple border-purple"
              : "border-white/30 group-hover:border-white/50"
          } ${isSending ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {confirmed && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <span
          className={`text-sm leading-relaxed ${
            confirmed ? "text-white" : "text-foreground-muted"
          } ${isSending ? "opacity-50" : ""}`}
          onClick={() => !isSending && setConfirmed((v) => !v)}
        >
          I have reviewed the email content and I'm ready to send this campaign.
        </span>
      </label>

      {/* Server error */}
      {dispatchState === "error" && serverError && (
        <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          <XCircle size={16} className="shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Dispatch button */}
      <button
        onClick={handleDispatch}
        disabled={!confirmed || isSending}
        className="w-full inline-flex items-center justify-center gap-2.5 py-4 rounded-xl font-bold text-sm
          bg-gradient-to-r from-purple to-blue-glow text-white
          hover:opacity-90 active:scale-[0.99] transition-all
          disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
          shadow-lg shadow-purple/20"
      >
        {isSending ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Sending to {source.recipients.length.toLocaleString()} recipients…
          </>
        ) : (
          <>
            <Send size={18} />
            Dispatch Campaign
          </>
        )}
      </button>

      {isSending && (
        <p className="text-center text-xs text-foreground-subtle animate-pulse">
          Please keep this window open. Large sends may take a moment…
        </p>
      )}
    </div>
  );
}
