import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  ScanLine,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Camera,
  Keyboard,
  Wifi,
  WifiOff,
  UserCheck,
  RefreshCw,
} from "lucide-react";

export const Route = createFileRoute("/checkin")({
  component: CheckInPage,
});

interface CheckInResult {
  ok: boolean;
  already_checked_in?: boolean;
  id?: string;
  name?: string;
  school_org?: string;
  checked_in_at?: string;
  checked_in_by?: string;
  referred_by?: string;
  message?: string;
  error?: string;
}

function CheckInPage() {
  // Staff Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [staffPin, setStaffPin] = useState("");
  const [staffName, setStaffName] = useState("");
  const [authError, setAuthError] = useState("");

  // Scanner Mode: 'camera' | 'hardware'
  const [scanMode, setScanMode] = useState<"camera" | "hardware">("camera");
  const [manualInput, setManualInput] = useState("");

  // Scan & Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<CheckInResult | null>(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const hardwareInputRef = useRef<HTMLInputElement | null>(null);

  // Monitor connectivity
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Check stored staff session
  useEffect(() => {
    try {
      const storedPin = sessionStorage.getItem("ssc_staff_pin");
      const storedName = sessionStorage.getItem("ssc_staff_name");
      if (storedPin) {
        setStaffPin(storedPin);
        setStaffName(storedName || "Gate Staff");
        setIsAuthenticated(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // Initialize html5-qrcode when in camera mode and authenticated
  useEffect(() => {
    if (!isAuthenticated || scanMode !== "camera") {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
      return;
    }

    const timer = setTimeout(() => {
      const elem = document.getElementById("qr-reader-gate");
      if (elem && !scannerRef.current) {
        try {
          const scanner = new Html5QrcodeScanner(
            "qr-reader-gate",
            { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1.0 },
            false
          );
          scannerRef.current = scanner;
          scanner.render(
            (decodedText) => handleProcessScan(decodedText),
            () => {}
          );
        } catch (e) {
          console.error("Scanner init error:", e);
        }
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [isAuthenticated, scanMode]);

  // Autofocus hardware scanner input
  useEffect(() => {
    if (isAuthenticated && scanMode === "hardware" && hardwareInputRef.current) {
      hardwareInputRef.current.focus();
    }
  }, [isAuthenticated, scanMode, isProcessing]);

  function handleStaffLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    const pin = staffPin.trim();
    if (!pin) {
      setAuthError("Staff PIN is required.");
      return;
    }
    const name = staffName.trim() || "Staff Member";
    try {
      sessionStorage.setItem("ssc_staff_pin", pin);
      sessionStorage.setItem("ssc_staff_name", name);
    } catch {
      // ignore
    }
    setStaffName(name);
    setIsAuthenticated(true);
  }

  async function handleProcessScan(code: string) {
    if (isProcessing || !code.trim()) return;
    setIsProcessing(true);
    setLastResult(null);

    const payload = {
      qr_data: code.trim(),
      staff_pin: staffPin,
      staff_name: staffName || "Gate Staff",
    };

    try {
      if (import.meta.env.DEV) {
        try {
          const res = await fetch("/checkin.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const json = await res.json();
          if (json.ok) {
            setLastResult(json);
            if (!json.already_checked_in) {
              setSessionCount((c) => c + 1);
            }
            return;
          }
        } catch {
          // Dev mock fallback
          await new Promise((r) => setTimeout(r, 400));
          const mockName = "Sample Attendee (" + code.slice(0, 10) + ")";
          const isDup = code.includes("DUP");
          setLastResult({
            ok: true,
            already_checked_in: isDup,
            id: code.trim(),
            name: mockName,
            school_org: "University of Lagos",
            checked_in_at: new Date().toLocaleTimeString(),
            message: isDup ? "Attendee is already checked in." : "Check-in successful!",
          });
          if (!isDup) setSessionCount((c) => c + 1);
          return;
        }
      }

      const res = await fetch((import.meta.env.BASE_URL || "/") + "checkin.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      setLastResult(json);
      if (json.ok && !json.already_checked_in) {
        setSessionCount((c) => c + 1);
      }
    } catch (err: any) {
      setLastResult({
        ok: false,
        error: "Network / server connection error. Please verify Wi-Fi or data connection.",
      });
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        if (scanMode === "hardware" && hardwareInputRef.current) {
          setManualInput("");
          hardwareInputRef.current.focus();
        }
      }, 1500);
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      handleProcessScan(manualInput.trim());
    }
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem("ssc_staff_pin");
      sessionStorage.removeItem("ssc_staff_name");
    } catch {}
    setIsAuthenticated(false);
    setStaffPin("");
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-foreground flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-white/5 bg-[#0a0d14] px-4 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-purple/20 border border-purple/40 flex items-center justify-center text-purple-glow">
            <ScanLine size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">SSC 2026 Gate Check-In</h1>
            <p className="text-[10px] text-foreground-subtle">Saturday, 5 December 2026</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Connectivity Status */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
              isOnline
                ? "bg-green-500/10 text-green-400 border-green-500/20"
                : "bg-red-500/10 text-red-400 border-red-500/20"
            }`}
          >
            {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
            <span>{isOnline ? "Online" : "Offline"}</span>
          </div>

          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="text-xs text-foreground-subtle hover:text-white px-2 py-1 rounded transition-colors"
            >
              Sign Out
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 max-w-xl mx-auto w-full">
        {!isAuthenticated ? (
          /* Staff PIN Login */
          <div className="w-full glass-strong rounded-3xl p-8 border border-white/10 text-center shadow-2xl">
            <div className="mb-4 mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-purple/15 border border-purple/30 text-purple-glow">
              <ShieldCheck size={28} />
            </div>
            <h2 className="text-xl font-bold font-display text-white">Staff Authorization</h2>
            <p className="mt-1 text-xs text-foreground-muted">
              Enter your event staff PIN to activate the check-in terminal.
            </p>

            {authError && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                {authError}
              </div>
            )}

            <form onSubmit={handleStaffLogin} className="mt-6 space-y-4 text-left">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-foreground-muted mb-1.5">
                  Staff Check-In PIN *
                </label>
                <input
                  type="password"
                  value={staffPin}
                  onChange={(e) => setStaffPin(e.target.value)}
                  placeholder="Enter staff PIN (e.g. SSC2026)"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-purple font-mono"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-foreground-muted mb-1.5">
                  Your Name / Gate Station
                </label>
                <input
                  type="text"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="e.g. Samuel — Gate A"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-purple"
                />
              </div>

              <div className="pt-2">
                <button type="submit" className="btn-primary w-full py-3.5 text-sm font-bold">
                  Open Check-In Terminal
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Check-In Interface */
          <div className="w-full space-y-5">
            {/* Session Stats Bar */}
            <div className="glass-strong rounded-2xl border border-white/5 p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-foreground-subtle">
                  Operator: {staffName}
                </span>
                <p className="text-xs text-foreground-muted">Live Gate Session</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-foreground-muted">Checked in:</span>
                <span className="px-3 py-1 rounded-xl bg-purple/20 text-purple-glow border border-purple/30 font-mono font-bold text-base">
                  {sessionCount}
                </span>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex rounded-xl bg-black/40 p-1 border border-white/5">
              <button
                type="button"
                onClick={() => setScanMode("camera")}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  scanMode === "camera"
                    ? "bg-purple/20 text-white border border-purple/30"
                    : "text-foreground-muted hover:text-white"
                }`}
              >
                <Camera size={14} />
                <span>Camera Scanner</span>
              </button>
              <button
                type="button"
                onClick={() => setScanMode("hardware")}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  scanMode === "hardware"
                    ? "bg-purple/20 text-white border border-purple/30"
                    : "text-foreground-muted hover:text-white"
                }`}
              >
                <Keyboard size={14} />
                <span>Barcode / Manual Gun</span>
              </button>
            </div>

            {/* Camera Scanner View */}
            {scanMode === "camera" && (
              <div className="glass-strong rounded-3xl p-5 border border-white/10 text-center relative overflow-hidden">
                <div className="rounded-2xl bg-black overflow-hidden relative min-h-[280px]">
                  <div
                    id="qr-reader-gate"
                    className="w-full h-full text-white [&_button]:btn-primary [&_button]:mt-3 [&_button]:mb-3 [&_select]:bg-ink-deep [&_select]:text-white [&_select]:p-2 [&_select]:rounded-lg"
                  />
                  {isProcessing && (
                    <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center backdrop-blur-sm z-20">
                      <RefreshCw className="animate-spin text-purple-glow mb-2" size={32} />
                      <span className="text-white font-bold text-sm">Verifying Attendee...</span>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-foreground-subtle mt-3">
                  Center the attendee's QR pass inside the scanner frame.
                </p>
              </div>
            )}

            {/* Hardware / Barcode Gun View */}
            {scanMode === "hardware" && (
              <div className="glass-strong rounded-3xl p-6 border border-white/10">
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-purple-glow mb-2">
                      Scan or Type Registration ID
                    </label>
                    <input
                      ref={hardwareInputRef}
                      type="text"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      placeholder="Scan with barcode gun or type SSC26-XXXXXXXX"
                      className="w-full rounded-xl bg-black/60 border border-white/20 px-4 py-3.5 text-base text-white font-mono placeholder:text-foreground-subtle focus:outline-none focus:border-purple"
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isProcessing || !manualInput.trim()}
                    className="btn-primary w-full py-3 text-xs font-bold flex justify-center items-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="animate-spin" size={14} />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <UserCheck size={16} />
                        <span>Submit Registration ID</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Scan Result Feedback Card */}
            {lastResult && (
              <div
                className={`p-5 rounded-2xl border transition-all animate-in fade-in duration-200 ${
                  lastResult.ok && !lastResult.already_checked_in
                    ? "bg-green-500/15 border-green-500/40 text-white"
                    : lastResult.ok && lastResult.already_checked_in
                    ? "bg-yellow-500/15 border-yellow-500/40 text-white"
                    : "bg-red-500/15 border-red-500/40 text-white"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="shrink-0 mt-0.5">
                    {lastResult.ok && !lastResult.already_checked_in && (
                      <CheckCircle className="text-green-400" size={30} />
                    )}
                    {lastResult.ok && lastResult.already_checked_in && (
                      <AlertTriangle className="text-yellow-400" size={30} />
                    )}
                    {!lastResult.ok && <XCircle className="text-red-400" size={30} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-black text-lg ${
                        lastResult.ok && !lastResult.already_checked_in
                          ? "text-green-400"
                          : lastResult.ok && lastResult.already_checked_in
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      {lastResult.ok && !lastResult.already_checked_in && "Check-In Confirmed! ✓"}
                      {lastResult.ok && lastResult.already_checked_in && "Already Checked In"}
                      {!lastResult.ok && "Invalid Registration"}
                    </h3>

                    {lastResult.ok ? (
                      <div className="mt-1 space-y-1 text-xs">
                        <p className="text-white font-bold text-sm">{lastResult.name}</p>
                        <p className="text-foreground-muted">
                          ID: <span className="font-mono text-white">{lastResult.id}</span>
                        </p>
                        {lastResult.school_org && (
                          <p className="text-foreground-subtle">{lastResult.school_org}</p>
                        )}
                        {lastResult.already_checked_in && lastResult.checked_in_at && (
                          <p className="text-yellow-300/80 text-[11px] pt-1">
                            Previously verified at: {lastResult.checked_in_at} ({lastResult.checked_in_by || "Staff"})
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-red-200 mt-1">{lastResult.error}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
