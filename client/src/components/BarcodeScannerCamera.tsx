"use client";

import { useEffect, useRef, useState } from "react";
import { X, Camera, AlertTriangle, Loader2 } from "lucide-react";

type ScannerState = "starting" | "scanning" | "error";

interface BarcodeScannerCameraProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export function BarcodeScannerCamera({ onScan, onClose }: BarcodeScannerCameraProps) {
  const [state, setState] = useState<ScannerState>("starting");
  const [errorMsg, setErrorMsg] = useState("");
  const scannerRef = useRef<any>(null);
  const divId = "qr-camera-reader";

  useEffect(() => {
    let scanner: any = null;
    let stopped = false;

    async function startScanner() {
      try {
        // Dynamically import so it's never SSR'd
        const { Html5Qrcode } = await import("html5-qrcode");
        if (stopped) return;

        scanner = new Html5Qrcode(divId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" }, // rear camera
          {
            fps: 12,
            qrbox: { width: 260, height: 180 },
            aspectRatio: 1.0,
            supportedScanTypes: [], // scan everything: QR, barcodes
          },
          (decodedText: string) => {
            if (stopped) return;
            stopped = true;
            scanner
              .stop()
              .catch(() => {})
              .finally(() => onScan(decodedText.trim()));
          },
          () => {
            /* per-frame errors — ignore */
          }
        );

        setState("scanning");
      } catch (err: any) {
        if (stopped) return;
        const msg: string = err?.message ?? String(err);
        if (msg.toLowerCase().includes("permission") || msg.toLowerCase().includes("denied")) {
          setErrorMsg("Camera permission denied. Please allow camera access and try again.");
        } else if (msg.toLowerCase().includes("notfound") || msg.toLowerCase().includes("no camera")) {
          setErrorMsg("No camera found on this device.");
        } else {
          setErrorMsg(msg || "Could not start camera.");
        }
        setState("error");
      }
    }

    startScanner();

    return () => {
      stopped = true;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-safe-top py-3 bg-black/80 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-emerald-400" />
          <span className="text-white font-semibold text-sm">Scan Package Barcode</span>
        </div>
        <button
          onClick={onClose}
          className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors active:scale-95"
        >
          <X className="h-4 w-4 text-white" />
        </button>
      </div>

      {/* Camera area */}
      <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
        {/* html5-qrcode renders into this div */}
        <div
          id={divId}
          className="w-full h-full"
          style={{ maxHeight: "calc(100vh - 120px)" }}
        />

        {/* Starting overlay */}
        {state === "starting" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black gap-3">
            <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
            <p className="text-white text-sm font-medium">Starting camera…</p>
            <p className="text-slate-500 text-xs">Allow camera access when prompted</p>
          </div>
        )}

        {/* Error state */}
        {state === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black gap-4 px-6 text-center">
            <div className="h-16 w-16 rounded-full bg-red-500/15 border border-red-500/40 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-base mb-1">Camera Error</p>
              <p className="text-slate-400 text-sm">{errorMsg}</p>
            </div>
            <button
              onClick={onClose}
              className="mt-2 px-6 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-medium"
            >
              Go Back
            </button>
          </div>
        )}

        {/* Scanning frame overlay — decorative corners */}
        {state === "scanning" && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="relative w-64 h-44">
              {/* Corner marks */}
              {[
                "top-0 left-0 border-t-2 border-l-2 rounded-tl-lg",
                "top-0 right-0 border-t-2 border-r-2 rounded-tr-lg",
                "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg",
                "bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg",
              ].map((cls, i) => (
                <div key={i} className={`absolute h-8 w-8 border-emerald-400 ${cls}`} />
              ))}
              {/* Laser sweep */}
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_rgba(16,185,129,0.9)] laser-beam" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom hint */}
      <div className="bg-black/80 backdrop-blur-sm border-t border-white/10 px-4 py-3 text-center pb-safe-bottom">
        {state === "scanning" ? (
          <p className="text-slate-400 text-xs">
            Point camera at any <span className="text-emerald-400 font-semibold">QR code or barcode</span> on the package
          </p>
        ) : state === "starting" ? (
          <p className="text-slate-600 text-xs">Make sure camera permissions are allowed</p>
        ) : null}
      </div>
    </div>
  );
}

