import { useState, useRef } from "react";
import { ArrowLeft, Eye, Code2, Copy, Check, Info } from "lucide-react";
import type { RecipientSource } from "./RecipientSelector";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ComposedEmail {
  subject: string;
  htmlBody: string;
}

interface CampaignComposerProps {
  source: RecipientSource;
  onBack: () => void;
  onConfirm: (email: ComposedEmail) => void;
}

// ─── Variable interpolation preview (client-side, uses first recipient) ───────
function interpolatePreview(template: string, row: Record<string, string>): string {
  const firstName = (row["full_name"] || row["name"] || "").split(" ")[0] || "Friend";
  const vars = { ...row, first_name: firstName };
  let result = template;
  for (const [key, val] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, val);
  }
  // Grey out any remaining un-resolved placeholders for the preview
  result = result.replace(/\{\{(\w+)\}\}/g, '<span style="background:#7c3aed22;color:#a78bfa;border-radius:3px;padding:0 3px;">{{$1}}</span>');
  return result;
}

// ─── Variable chip ────────────────────────────────────────────────────────────
function VarChip({
  variable,
  onInsert,
}: {
  variable: string;
  onInsert: (v: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const tag = `{{${variable}}}`;

  function handleClick() {
    onInsert(tag);
    navigator.clipboard?.writeText(tag).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={`Insert ${tag}`}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all duration-150
        bg-white/5 border-white/10 text-foreground-muted
        hover:bg-purple/15 hover:border-purple/40 hover:text-purple-glow"
    >
      {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
      {tag}
    </button>
  );
}

// ─── Default starter template ─────────────────────────────────────────────────
const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed 0%,#3b82f6 100%);border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;">
              <h1 style="margin:0;font-size:28px;font-weight:900;color:#fff;">Socially Speaking</h1>
              <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.75);">SSC 2026 · The Takeover Generation</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#111;padding:36px 40px;">
              <p style="margin:0 0 16px;font-size:16px;color:#e5e5e5;">Hi <strong style="color:#a78bfa;">{{first_name}}</strong>,</p>

              <p style="margin:0 0 16px;font-size:15px;color:#d4d4d4;line-height:1.7;">
                Write your message here.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0d0d0d;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;border-top:1px solid #1f1f1f;">
              <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#fff;">Socially Speaking</p>
              <p style="margin:0;font-size:12px;color:#525252;">© 2026 Socially Speaking. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

// ─── Always-visible variables for any source ──────────────────────────────────
const UNIVERSAL_VARS = ["first_name", "full_name", "email", "status", "id"];

// ─── Main component ───────────────────────────────────────────────────────────
export function CampaignComposer({ source, onBack, onConfirm }: CampaignComposerProps) {
  const [subject, setSubject]     = useState("");
  const [htmlBody, setHtmlBody]   = useState(DEFAULT_TEMPLATE);
  const [tab, setTab]             = useState<"code" | "preview">("code");
  const [errors, setErrors]       = useState<{ subject?: string; htmlBody?: string }>({});
  const textareaRef               = useRef<HTMLTextAreaElement>(null);

  // Derive variable list: universal + source-specific columns (deduplicated)
  const sourceVars = source.availableColumns.filter(
    (c) => !UNIVERSAL_VARS.includes(c),
  );
  const allVars = [...UNIVERSAL_VARS, ...sourceVars];

  // Sample row for preview: first recipient with fallback dummy values
  const sampleRow: Record<string, string> = {
    first_name: "Sample",
    full_name: "Sample Recipient",
    email: source.recipients[0]?.[source.emailCol] ?? "sample@example.com",
    status: "Pending",
    id: "SSC26-PREVIEW",
    qr_code_url: "https://api.qrserver.com/v1/create-qr-code/?data=SSC26-PREVIEW&size=200x200",
    ...(source.recipients[0] ?? {}),
  };

  // Insert a variable tag at the cursor position in the textarea
  function handleInsert(tag: string) {
    const el = textareaRef.current;
    if (!el) {
      setHtmlBody((prev) => prev + tag);
      return;
    }
    const start = el.selectionStart;
    const end   = el.selectionEnd;
    const next  = htmlBody.slice(0, start) + tag + htmlBody.slice(end);
    setHtmlBody(next);
    // Restore cursor after the inserted tag
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + tag.length, start + tag.length);
    });
  }

  function validate(): boolean {
    const errs: typeof errors = {};
    if (!subject.trim())   errs.subject  = "Subject is required";
    if (!htmlBody.trim())  errs.htmlBody = "Email body is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleConfirm() {
    if (!validate()) return;
    onConfirm({ subject: subject.trim(), htmlBody: htmlBody.trim() });
  }

  const previewHtml = interpolatePreview(htmlBody, sampleRow);

  return (
    <div className="space-y-6">

      {/* Back + source info */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-2 glass-strong rounded-xl border border-white/10 px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-glow shrink-0" />
          <span className="text-xs text-foreground-muted">
            <strong className="text-white">{source.recipients.length.toLocaleString()}</strong> recipients
            · {source.label}
          </span>
        </div>
      </div>

      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Subject Line <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => {
            setSubject(e.target.value);
            if (errors.subject) setErrors((p) => ({ ...p, subject: undefined }));
          }}
          placeholder="e.g. Your SSC 2026 ticket is confirmed 🎉"
          className={`w-full rounded-xl glass-strong border px-4 py-3 text-sm text-white placeholder:text-foreground-subtle
            focus:outline-none focus:border-purple-glow transition-colors
            ${errors.subject ? "border-red-400" : "border-white/10"}`}
        />
        {errors.subject && (
          <p className="mt-1.5 text-xs text-red-400">{errors.subject}</p>
        )}
      </div>

      {/* Variable chips */}
      <div className="glass-strong rounded-xl border border-white/10 p-4 space-y-3">
        <div className="flex items-start gap-2">
          <Info size={14} className="text-blue-glow mt-0.5 shrink-0" />
          <p className="text-xs text-foreground-muted leading-relaxed">
            Click any variable below to insert it at your cursor, or copy and paste it manually
            into the HTML body. Each one will be replaced with real data per recipient when sent.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {allVars.map((v) => (
            <VarChip key={v} variable={v} onInsert={handleInsert} />
          ))}
        </div>
      </div>

      {/* Editor tabs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-white">
            Email Body <span className="text-red-400">*</span>
          </label>
          <div className="flex rounded-xl overflow-hidden border border-white/10">
            <button
              onClick={() => setTab("code")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                tab === "code"
                  ? "bg-purple/20 text-purple-glow"
                  : "bg-white/5 text-foreground-muted hover:text-white"
              }`}
            >
              <Code2 size={13} /> HTML
            </button>
            <button
              onClick={() => setTab("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                tab === "preview"
                  ? "bg-purple/20 text-purple-glow"
                  : "bg-white/5 text-foreground-muted hover:text-white"
              }`}
            >
              <Eye size={13} /> Preview
            </button>
          </div>
        </div>

        {tab === "code" ? (
          <div>
            <textarea
              ref={textareaRef}
              value={htmlBody}
              onChange={(e) => {
                setHtmlBody(e.target.value);
                if (errors.htmlBody) setErrors((p) => ({ ...p, htmlBody: undefined }));
              }}
              rows={22}
              spellCheck={false}
              className={`w-full rounded-xl glass-strong border px-4 py-3.5 text-xs font-mono text-foreground
                leading-relaxed resize-y focus:outline-none focus:border-purple-glow transition-colors
                ${errors.htmlBody ? "border-red-400" : "border-white/10"}`}
              placeholder="Paste or write your HTML email here…"
            />
            {errors.htmlBody && (
              <p className="mt-1.5 text-xs text-red-400">{errors.htmlBody}</p>
            )}
            <p className="mt-2 text-xs text-foreground-subtle">
              {htmlBody.length.toLocaleString()} characters · Drag the corner to resize
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 overflow-hidden bg-white">
            {htmlBody.trim() ? (
              <iframe
                key={previewHtml}
                srcDoc={previewHtml}
                title="Email preview"
                className="w-full border-0"
                style={{ height: "520px" }}
                sandbox="allow-same-origin"
              />
            ) : (
              <div className="flex items-center justify-center h-52 text-foreground-subtle text-sm bg-[#111]">
                Add some HTML to see the preview
              </div>
            )}
          </div>
        )}
      </div>

      {/* Note about preview data */}
      {tab === "preview" && (
        <p className="text-xs text-foreground-subtle flex items-center gap-1.5">
          <Info size={12} className="text-blue-glow shrink-0" />
          Preview uses data from your first recipient
          {source.recipients[0]
            ? ` (${source.recipients[0][source.nameCol] || source.recipients[0][source.emailCol]})`
            : " (sample data)"}
          . Unresolved variables are shown in purple.
        </p>
      )}

      {/* Continue */}
      <button
        onClick={handleConfirm}
        className="w-full btn-primary justify-center"
      >
        Continue to Preview & Test →
      </button>
    </div>
  );
}
