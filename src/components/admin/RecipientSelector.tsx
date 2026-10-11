import { useState, useEffect, useRef } from "react";
import {
  Database,
  Upload,
  Users,
  ChevronDown,
  CheckCircle,
  Loader2,
  FileText,
  AlertCircle,
  X,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Recipient {
  [key: string]: string;
}

export interface RecipientSource {
  type: "db" | "csv";
  sourceKey: string;       // e.g. "ssc2026_registrations" | "csv"
  label: string;
  emailCol: string;
  nameCol: string;
  recipients: Recipient[];
  availableColumns: string[];
}

interface DbSource {
  key: string;
  label: string;
  count: number;
  columns: string[];
  statuses: string[];
}

interface RecipientSelectorProps {
  onConfirm: (source: RecipientSource) => void;
}

// ─── CSV parser (no library needed) ──────────────────────────────────────────
function parseCSV(text: string): { headers: string[]; rows: Recipient[] } {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  if (lines.length < 2) return { headers: [], rows: [] };

  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseRow(lines[0]);
  const rows: Recipient[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const vals = parseRow(lines[i]);
    const row: Recipient = {};
    headers.forEach((h, idx) => { row[h] = vals[idx] ?? ""; });
    rows.push(row);
  }
  return { headers, rows };
}

// ─── Sub-component: Mode toggle ───────────────────────────────────────────────
function ModeButton({
  active,
  onClick,
  icon,
  label,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-start gap-4 rounded-2xl border p-5 text-left transition-all duration-200 ${
        active
          ? "bg-purple/10 border-purple/50 ring-1 ring-purple/30"
          : "glass-strong border-white/10 hover:border-white/25"
      }`}
    >
      <span
        className={`mt-0.5 p-2.5 rounded-xl border ${
          active
            ? "bg-purple/20 border-purple/40 text-purple-glow"
            : "bg-white/5 border-white/10 text-foreground-muted"
        }`}
      >
        {icon}
      </span>
      <span>
        <span className={`block font-semibold text-sm ${active ? "text-white" : "text-foreground-muted"}`}>
          {label}
        </span>
        <span className="block text-xs text-foreground-subtle mt-0.5">{sub}</span>
      </span>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function RecipientSelector({ onConfirm }: RecipientSelectorProps) {
  const [mode, setMode] = useState<"db" | "csv">("db");

  // ── DB mode state ─────────────────────────────────────────────────────────
  const [dbSources, setDbSources]         = useState<DbSource[]>([]);
  const [sourcesLoading, setSourcesLoading] = useState(true);
  const [sourcesError, setSourcesError]   = useState("");
  const [selectedSource, setSelectedSource] = useState<DbSource | null>(null);
  const [statusFilter, setStatusFilter]   = useState("all");
  const [recipientsLoading, setRecipientsLoading] = useState(false);
  const [fetchedRecipients, setFetchedRecipients] = useState<Recipient[]>([]);
  const [fetchedCount, setFetchedCount]   = useState(0);

  // ── CSV mode state ────────────────────────────────────────────────────────
  const [csvHeaders, setCsvHeaders]       = useState<string[]>([]);
  const [csvRows, setCsvRows]             = useState<Recipient[]>([]);
  const [csvFileName, setCsvFileName]     = useState("");
  const [csvEmailCol, setCsvEmailCol]     = useState("");
  const [csvNameCol, setCsvNameCol]       = useState("");
  const [csvError, setCsvError]           = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Load DB sources on mount ──────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch("/email-manager.php?action=get_sources");
        const json = await res.json();
        if (json.ok) setDbSources(json.sources);
        else setSourcesError(json.error ?? "Failed to load sources");
      } catch {
        setSourcesError("Could not reach the server");
      } finally {
        setSourcesLoading(false);
      }
    })();
  }, []);

  // ── Fetch recipients when source/filter changes ───────────────────────────
  useEffect(() => {
    if (!selectedSource) return;
    let cancelled = false;
    setRecipientsLoading(true);
    setFetchedRecipients([]);

    const params = new URLSearchParams({
      action: "get_recipients",
      source: selectedSource.key,
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    });

    (async () => {
      try {
        const res  = await fetch(`/email-manager.php?${params}`);
        const json = await res.json();
        if (!cancelled && json.ok) {
          setFetchedRecipients(json.recipients);
          setFetchedCount(json.count);
        }
      } catch {
        // silently fail — user sees empty list
      } finally {
        if (!cancelled) setRecipientsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [selectedSource, statusFilter]);

  // ── CSV file upload ───────────────────────────────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvError("");
    setCsvFileName(file.name);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const { headers, rows } = parseCSV(text);
      if (headers.length === 0 || rows.length === 0) {
        setCsvError("CSV appears to be empty or malformed.");
        return;
      }
      setCsvHeaders(headers);
      setCsvRows(rows);

      // Auto-detect email and name columns
      const emailGuess = headers.find((h) =>
        /email/i.test(h)
      ) ?? "";
      const nameGuess = headers.find((h) =>
        /name|full.?name/i.test(h)
      ) ?? "";
      setCsvEmailCol(emailGuess);
      setCsvNameCol(nameGuess);
    };
    reader.readAsText(file);
  }

  // ── Confirm handlers ──────────────────────────────────────────────────────
  function confirmDb() {
    if (!selectedSource || fetchedRecipients.length === 0) return;
    onConfirm({
      type:             "db",
      sourceKey:        selectedSource.key,
      label:            selectedSource.label,
      emailCol:         "email",
      nameCol:          "full_name",
      recipients:       fetchedRecipients,
      availableColumns: selectedSource.columns,
    });
  }

  function confirmCsv() {
    if (!csvEmailCol || csvRows.length === 0) return;
    const validRows = csvRows.filter((r) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r[csvEmailCol] ?? "")
    );
    onConfirm({
      type:             "csv",
      sourceKey:        "csv",
      label:            csvFileName || "CSV Upload",
      emailCol:         csvEmailCol,
      nameCol:          csvNameCol || csvEmailCol,
      recipients:       validRows,
      availableColumns: csvHeaders,
    });
  }

  const canConfirmDb  = !!selectedSource && !recipientsLoading && fetchedRecipients.length > 0;
  const canConfirmCsv = csvRows.length > 0 && !!csvEmailCol;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Mode selector */}
      <div className="flex flex-col sm:flex-row gap-3">
        <ModeButton
          active={mode === "db"}
          onClick={() => setMode("db")}
          icon={<Database size={20} />}
          label="From Database"
          sub="Pick a registration or volunteer table"
        />
        <ModeButton
          active={mode === "csv"}
          onClick={() => setMode("csv")}
          icon={<Upload size={20} />}
          label="Upload CSV"
          sub="Import a custom list of recipients"
        />
      </div>

      {/* ── DB MODE ─────────────────────────────────────────────────────── */}
      {mode === "db" && (
        <div className="space-y-4">
          {/* Source list */}
          {sourcesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-purple-glow" size={28} />
            </div>
          ) : sourcesError ? (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 flex items-center gap-2">
              <AlertCircle size={16} /> {sourcesError}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {dbSources.map((src) => {
                const active = selectedSource?.key === src.key;
                return (
                  <button
                    key={src.key}
                    onClick={() => {
                      setSelectedSource(src);
                      setStatusFilter("all");
                    }}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-all duration-200 ${
                      active
                        ? "bg-purple/10 border-purple/50 ring-1 ring-purple/30"
                        : "glass-strong border-white/10 hover:border-white/25"
                    }`}
                  >
                    <div>
                      <p className={`text-sm font-semibold ${active ? "text-white" : "text-foreground-muted"}`}>
                        {src.label}
                      </p>
                      <p className="text-xs text-foreground-subtle mt-0.5">
                        {(src.count ?? 0).toLocaleString()} record{(src.count ?? 0) !== 1 ? "s" : ""}
                      </p>
                    </div>
                    {active && <CheckCircle size={18} className="text-purple-glow shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Status filter */}
          {selectedSource && selectedSource.statuses.length > 0 && (
            <div className="glass-strong rounded-xl border border-white/10 p-4 space-y-3">
              <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                Filter by Status
              </p>
              <div className="flex flex-wrap gap-2">
                {["all", ...selectedSource.statuses].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      statusFilter === s
                        ? "bg-purple/20 border-purple/50 text-purple-glow"
                        : "bg-white/5 border-white/10 text-foreground-muted hover:border-white/25"
                    }`}
                  >
                    {s === "all" ? "All Statuses" : s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recipient count / loading */}
          {selectedSource && (
            <div className="flex items-center justify-between glass-strong rounded-xl border border-white/10 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <Users size={16} className="text-purple-glow" />
                {recipientsLoading ? (
                  <span className="text-sm text-foreground-muted flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> Loading recipients…
                  </span>
                ) : (
                  <span className="text-sm text-white">
                    <strong className="text-purple-glow">{fetchedCount.toLocaleString()}</strong>{" "}
                    recipient{fetchedCount !== 1 ? "s" : ""} selected
                    {statusFilter !== "all" && (
                      <span className="text-foreground-subtle"> · {statusFilter}</span>
                    )}
                  </span>
                )}
              </div>
              {fetchedCount === 0 && !recipientsLoading && (
                <span className="text-xs text-orange-400">No records match this filter</span>
              )}
            </div>
          )}

          {/* Confirm button */}
          {selectedSource && (
            <button
              onClick={confirmDb}
              disabled={!canConfirmDb}
              className="w-full btn-primary justify-center disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Use These {fetchedCount > 0 ? `${fetchedCount.toLocaleString()} ` : ""}Recipients →
            </button>
          )}
        </div>
      )}

      {/* ── CSV MODE ─────────────────────────────────────────────────────── */}
      {mode === "csv" && (
        <div className="space-y-4">
          {/* Drop zone */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full glass-strong rounded-2xl border-2 border-dashed border-white/15 hover:border-purple/40 transition-colors py-12 flex flex-col items-center gap-3 group"
          >
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:bg-purple/10 group-hover:border-purple/30 transition-colors">
              <Upload size={24} className="text-foreground-muted group-hover:text-purple-glow transition-colors" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground-muted group-hover:text-white transition-colors">
                Click to upload a CSV file
              </p>
              <p className="text-xs text-foreground-subtle mt-1">
                Must include an email column · UTF-8 encoding
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={handleFileChange}
            />
          </button>

          {csvError && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 flex items-center gap-2">
              <AlertCircle size={16} /> {csvError}
            </div>
          )}

          {/* File info + column mapping */}
          {csvRows.length > 0 && (
            <div className="space-y-4">
              {/* File info */}
              <div className="flex items-center justify-between glass-strong rounded-xl border border-white/10 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <FileText size={16} className="text-blue-glow" />
                  <div>
                    <p className="text-sm font-medium text-white">{csvFileName}</p>
                    <p className="text-xs text-foreground-subtle">
                      {csvRows.length.toLocaleString()} rows · {csvHeaders.length} columns
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setCsvRows([]);
                    setCsvHeaders([]);
                    setCsvFileName("");
                    setCsvEmailCol("");
                    setCsvNameCol("");
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-foreground-muted hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Column mapping */}
              <div className="glass-strong rounded-xl border border-white/10 p-4 space-y-4">
                <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                  Map Columns
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Email column — required */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Email Column <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={csvEmailCol}
                        onChange={(e) => setCsvEmailCol(e.target.value)}
                        className="w-full rounded-xl bg-ink-deep border border-white/10 px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-purple-glow appearance-none pr-8"
                      >
                        <option value="">— select column —</option>
                        {csvHeaders.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground-muted pointer-events-none" />
                    </div>
                  </div>

                  {/* Name column — optional */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Name Column <span className="text-foreground-subtle">(optional)</span>
                    </label>
                    <div className="relative">
                      <select
                        value={csvNameCol}
                        onChange={(e) => setCsvNameCol(e.target.value)}
                        className="w-full rounded-xl bg-ink-deep border border-white/10 px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-purple-glow appearance-none pr-8"
                      >
                        <option value="">— select column —</option>
                        {csvHeaders.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground-muted pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* All columns as available variables hint */}
                <div>
                  <p className="text-xs text-foreground-subtle mb-2">
                    All columns will be available as <code className="text-purple-glow">{"{{column_name}}"}</code> variables in your email:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {csvHeaders.map((h) => (
                      <span
                        key={h}
                        className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-foreground-muted"
                      >
                        {`{{${h}}}`}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview table */}
              <div className="glass-strong rounded-xl border border-white/10 overflow-hidden">
                <p className="px-4 py-2.5 text-xs font-semibold text-foreground-subtle border-b border-white/5">
                  Preview (first 4 rows)
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-white/[0.03]">
                      <tr>
                        {csvHeaders.slice(0, 6).map((h) => (
                          <th key={h} className="px-3 py-2 text-left text-foreground-subtle font-medium">
                            {h}
                          </th>
                        ))}
                        {csvHeaders.length > 6 && (
                          <th className="px-3 py-2 text-foreground-subtle">+{csvHeaders.length - 6} more</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {csvRows.slice(0, 4).map((row, i) => (
                        <tr key={i}>
                          {csvHeaders.slice(0, 6).map((h) => (
                            <td key={h} className="px-3 py-2 text-foreground-muted truncate max-w-[120px]">
                              {row[h]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Confirm button */}
              <button
                onClick={confirmCsv}
                disabled={!canConfirmCsv}
                className="w-full btn-primary justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Use These {csvRows.length.toLocaleString()} Recipients →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
