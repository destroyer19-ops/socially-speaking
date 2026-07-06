import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export function QRScanner() {
  const [scanResult, setScanResult] = useState<{
    ok: boolean;
    name?: string;
    email?: string;
    already_checked_in?: boolean;
    error?: string;
  } | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Only init if not already initialized
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1 },
        false
      );

      scannerRef.current.render(onScanSuccess, onScanFailure);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, []);

  async function onScanSuccess(decodedText: string) {
    if (isProcessing) return;
    setIsProcessing(true);
    setScanResult(null);

    try {
      const res = await fetch("/checkin.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qr_data: decodedText }),
      });
      const data = await res.json();
      setScanResult(data);
    } catch (err) {
      setScanResult({ ok: false, error: "Network error. Try again." });
    } finally {
      // Pause for 3 seconds before allowing next scan
      setTimeout(() => {
        setIsProcessing(false);
      }, 3000);
    }
  }

  function onScanFailure(error: any) {
    // silently ignore frame errors
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="glass-strong rounded-3xl border border-white/10 p-6 md:p-8 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Event Check-In Scanner</h2>
        <p className="text-sm text-foreground-muted mb-6">
          Scan a participant's QR code to mark them as checked in.
        </p>

        <div className="bg-black/50 rounded-2xl overflow-hidden mb-6 min-h-[300px] border border-white/5 relative">
          {/* html5-qrcode injects its UI into this div */}
          <div id="qr-reader" className="w-full h-full text-white [&_button]:btn-primary [&_button]:mt-4 [&_button]:mb-4 [&_select]:bg-ink-deep [&_select]:text-white [&_select]:p-2 [&_select]:rounded-lg" />
          
          {isProcessing && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm z-10">
              <span className="text-white font-semibold flex items-center gap-2">
                <span className="animate-spin h-5 w-5 border-2 border-purple border-t-transparent rounded-full" />
                Processing...
              </span>
            </div>
          )}
        </div>

        {/* Results Toast */}
        <div className="h-28 flex flex-col justify-end">
          {scanResult && (
            <div className={`p-4 rounded-xl flex items-center gap-4 text-left animate-in fade-in slide-in-from-bottom-2 ${
              scanResult.ok && !scanResult.already_checked_in ? 'bg-green-500/10 border border-green-500/20' : 
              scanResult.ok && scanResult.already_checked_in ? 'bg-yellow-500/10 border border-yellow-500/20' : 
              'bg-red-500/10 border border-red-500/20'
            }`}>
              <div className="shrink-0">
                {scanResult.ok && !scanResult.already_checked_in && <CheckCircle className="text-green-400" size={28} />}
                {scanResult.ok && scanResult.already_checked_in && <AlertTriangle className="text-yellow-400" size={28} />}
                {!scanResult.ok && <XCircle className="text-red-400" size={28} />}
              </div>
              <div>
                {scanResult.ok ? (
                  <>
                    <h3 className={`font-bold text-lg ${scanResult.already_checked_in ? 'text-yellow-400' : 'text-green-400'}`}>
                      {scanResult.already_checked_in ? 'Already Checked In' : 'Check-In Successful'}
                    </h3>
                    <p className="text-sm text-foreground-muted">
                      <strong className="text-white">{scanResult.name}</strong> ({scanResult.email})
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="font-bold text-lg text-red-400">Invalid QR Code</h3>
                    <p className="text-sm text-foreground-muted">{scanResult.error}</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
