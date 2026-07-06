import { useState } from "react";
import {
  ArrowLeft,
  Send,
  CheckCircle,
  XCircle,
  Loader2,
  Mail,
  Eye,
  User,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { RecipientSource } from "./RecipientSelector";
import type { ComposedEmail } from "./CampaignComposer";

// ─── Types ────────────────────────────────────────────────────────────────────
interface EmailPreviewProps {
  source: RecipientSource;
  email: ComposedEmail;
  onBack: () => void;
  onConfirm: () => void;
}

type TestStatus = "idle" | "sending" | "success" | "error";

// ─── Client-side interpolation (mirrors PHP logic) ────────────────────────────
function interpolate(template: string, row: Record<string, string>): string {
  const firstName =
    (row["full_name"] || row["name"] || "").split(" ")[0] || "Friend";
  const vars = { ...row, first_name: firstName };
  let result = template;
  for (const [key, val] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, val);
  }
  return result;
}

// ─── Recipient picker for preview ─────────────────────────────────────────────
function RecipientPicker({
  source,
  selectedIdx,
  onChange,
}: {
  source: RecipientSource;
  selectedIdx: number;
  onChange: (idx: number) => void;
}) {
  const recipients = source.recipients;
  const current    = recipients[selectedIdx];
  const name       = current?.[source.nameCol]  || "";
  const email      = current?.[source.emailCol] || "";

  return (
    <div className="flex items-center gap-3 glass-strong rounded-xl border border-white/10 px-4 py-3">
      <div className="p-2 rounded-lg bg-white/5 border border-white/10">
        <User size={15} className="text-foreground-muted" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-foreground-subtle">Previewing with data from</p>
        <p className="text-sm font-medium text-white truncate">
          {name || email || "Recipient"}
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          disabled={selectedIdx === 0}
          onClick={() => onChange(selectedIdx - 1)}
          className="p-1.5 rounded-lg hover:bg-white/10 text-foreground-muted hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronUp size={15} />
        </button>
        <span className="text-xs text-foreground-subtle w-16 text-center">
          {selectedIdx + 1} / {recipients.length}
        </span>
        <button
          disabled={selectedIdx >= recipients.length - 1}
          onClick={() => onChange(selectedIdx + 1)}
          className="p-1.5 rounded-lg hover:bg-white/10 text-foreground-muted hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronDown size={15} />
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function EmailPreview({ source, email, onBack, onConfirm }: EmailPreviewProps) {
  const [previewIdx, setPreviewIdx]   = useState(0);
  const [testEmail, setTestEmail]     = useState("");
  const [testStatus, setTestStatus]   = useState<TestStatus>("idle");
  const [testMessage, setTestMessage] = useState("");
  const [showRaw, setShowRaw]         = useState(false);

  // Build the sample row for preview
  const sampleRow: Record<string, string> = {
    full_name:   "Sample Recipient",
    first_name:  "Sample",
    email:       "sample@example.com",
    status:      "Pending",
    id:          "SSC26-PREVIEW",
    qr_code_url: "https://api.qrserver.com/v1/create-qr-code/?data=SSC26-PREVIEW&size=200x200",
    ...(source.recipients[previewIdx] ?? {}),
  };

  const renderedHtml = interpolate(email.htmlBody, sampleRow);

  // ── Send test email ─────────────────────────────────────────────────────────
  async function handleSendTest() {
    if (!testEmail.trim()) {
      setTestMessage("Please enter a test email address.");
      setTestStatus("error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail.trim())) {
      setTestMessage("That doesn't look like a valid email address.");
      setTestStatus("error");
      return;
    }

    setTestStatus("sending");
    setTestMessage("");

    try {
      const res = await fetch("/email-manager.php?action=send_test", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          test_email: testEmail.trim(),
          subject:    email.subject,
          html_body:  email.htmlBody,
          sample_row: sampleRow,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setTestStatus("success");
        setTestMessage(`Test email sent to ${testEmail.trim()}`);
      } else {
        setTestStatus("error");
        setTestMessage(json.error ?? "Brevo rejected the send. Check your API key.");
      }
    } catch {
      setTestStatus("error");
      setTestMessage("Could not reach the server. Please try again.");
    }
  }

  const previewName =
    source.recipients[previewIdx]?.[source.nameCol] ||
    source.recipients[previewIdx]?.[source.emailCol] ||
    "first recipient";

  return (
    <div className="space-y-6">

      {/* Back + context */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-2 glass-strong rounded-xl border border-white/10 px-3 py-1.5">
          <Mail size={13} className="text-purple-glow" />
          <span className="text-xs text-foreground-muted">
            <strong className="text-white">{email.subject}</strong>
          </span>
        </div>
      </div>

      {/* Recipient picker */}
      {source.recipients.length > 0 && (
        <RecipientPicker
          source={source}
          selectedIdx={previewIdx}
          onChange={setPreviewIdx}
        />
      )}

      {/* Email preview iframe */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Eye size={14} className="text-purple-glow" />
            <span className="text-sm font-medium text-white">Email Preview</span>
          </div>
          <button
            onClick={() => setShowRaw((v) => !v)}
            className="text-xs text-foreground-subtle hover:text-white transition-colors flex items-center gap-1"
          >
            {showRaw ? "Show rendered" : "Show raw HTML"}
          </button>
        </div>

        <div className="rounded-xl border border-white/10 overflow-hidden">
          {showRaw ? (
            <pre className="overflow-x-auto p-4 text-xs font-mono text-foreground-muted bg-[#0d0d0d] leading-relaxed max-h-[520px]">
              {renderedHtml}
            </pre>
          ) : (
            <div className="bg-white">
              <iframe
                key={renderedHtml}
                srcDoc={renderedHtml}
                title={`Email preview — ${previewName}`}
                className="w-full border-0"
                style={{ height: "560px" }}
                sandbox="allow-same-origin"
              />
            </div>
          )}
        </div>

        <p className="mt-2 text-xs text-foreground-subtle flex items-center gap-1.5">
          <Info size={11} className="text-blue-glow shrink-0" />
          Rendered with data from <span className="text-white/60">{previewName}</span>.
          Use the arrows above to cycle through recipients.
        </p>
      </div>

      {/* ── Send test section ──────────────────────────────────────────────── */}
      <div className="glass-strong rounded-2xl border border-white/10 p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white">Send a Test Email</h3>
          <p className="text-xs text-foreground-subtle mt-0.5">
            Receive the exact email — formatting, images, links, and dynamic variables —
            before it goes to all recipients.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => {
              setTestEmail(e.target.value);
              if (testStatus !== "idle") setTestStatus("idle");
            }}
            onKeyDown={(e) => { if (e.key === "Enter") handleSendTest(); }}
            placeholder="your@email.com"
            className="flex-1 rounded-xl glass-strong border border-white/10 px-4 py-2.5 text-sm text-white
              placeholder:text-foreground-subtle focus:outline-none focus:border-purple-glow transition-colors"
          />
          <button
            onClick={handleSendTest}
            disabled={testStatus === "sending"}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm
              bg-white/10 border border-white/15 text-white hover:bg-white/15 hover:border-white/25
              disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
          >
            {testStatus === "sending" ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Send size={15} />
                Send Test
              </>
            )}
          </button>
        </div>

        {/* Test result */}
        {testStatus === "success" && (
          <div className="flex items-center gap-2.5 rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-400">
            <CheckCircle size={16} className="shrink-0" />
            {testMessage}
          </div>
        )}
        {testStatus === "error" && (
          <div className="flex items-center gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            <XCircle size={16} className="shrink-0" />
            {testMessage}
          </div>
        )}
      </div>

      {/* Proceed */}
      <button
        onClick={onConfirm}
        className="w-full btn-primary justify-center"
      >
        Continue to Confirm & Dispatch →
      </button>
    </div>
  );
}
