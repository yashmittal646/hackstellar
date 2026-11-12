"use client";

import { useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Camera,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Package,
  RefreshCw,
  Tag,
} from "lucide-react";

type Phase = "ready" | "detecting" | "looking_up" | "done" | "error";

function fmt(p: number) {
  return p ? `₹${p.toLocaleString("en-IN")}` : null;
}

/** Render file as an ImageBitmap for BarcodeDetector */
function fileToBitmap(file: File): Promise<ImageBitmap> {
  return createImageBitmap(file);
}

/** Draw file onto a canvas and return as HTMLImageElement (for html5-qrcode) */
function fileToObjectURL(file: File): string {
  return URL.createObjectURL(file);
}

function CompanionContent() {
  const params = useSearchParams();
  const sessionId = params.get("session") ?? "";

  const [phase, setPhase] = useState<Phase>("ready");
  const [stepMsg, setStepMsg] = useState("");
  const [product, setProduct] = useState<any>(null);
  const [barcode, setBarcode] = useState("");
  const [preview, setPreview] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState("");
  const [errorDetail, setErrorDetail] = useState("");
  const qrDivRef = useRef<HTMLDivElement>(null);

  const reset = () => {
    setPhase("ready");
    setProduct(null);
    setBarcode("");
    setPreview("");
    setErrorMsg("");
    setErrorDetail("");
    setStepMsg("");
  };

  const processImage = async (file: File) => {
    setPhase("detecting");
    setStepMsg("Reading barcode from photo…");
    setErrorMsg("");
    setProduct(null);

    // Show preview
    const objUrl = fileToObjectURL(file);
    setPreview(objUrl);

    let detectedCode = "";

    // ── Method 1: BarcodeDetector (built into Android Chrome, free) ──────
    if ("BarcodeDetector" in window) {
      try {
        setStepMsg("Scanning barcode (device scanner)…");
        const bd = new (window as any).BarcodeDetector({
          formats: [
            "ean_13", "ean_8",
            "upc_a", "upc_e",
            "code_128", "code_93", "code_39",
            "itf", "codabar",
            "qr_code", "data_matrix",
          ],
        });
        const bitmap = await fileToBitmap(file);
        const results: any[] = await bd.detect(bitmap);
        if (results.length > 0) {
          detectedCode = results[0].rawValue;
          console.log("[BarcodeDetector] found:", detectedCode);
        }
      } catch (e) {
        console.warn("[BarcodeDetector] failed:", e);
      }
    }

    // ── Method 2: html5-qrcode (JS ZXing — works on all browsers) ───────
    if (!detectedCode) {
      try {
        setStepMsg("Scanning barcode (software scanner)…");
        const { Html5Qrcode } = await import("html5-qrcode");

        // The div MUST exist in the DOM and have a real size
        const divId = "companion-qr-div";
        const scanner = new Html5Qrcode(divId, { verbose: false } as any);

        try {
          detectedCode = await scanner.scanFile(file, /* showImage= */ false);
          console.log("[html5-qrcode] found:", detectedCode);
        } finally {
          try { await scanner.clear(); } catch {}
        }
      } catch (e) {
        console.warn("[html5-qrcode] failed:", e);
      }
    }

    if (!detectedCode) {
      setErrorMsg("No barcode found in this photo.");
      setErrorDetail(
        "Try again: hold the phone closer (10-20 cm), make sure the barcode is well-lit and fills most of the frame."
      );
      setPhase("error");
      return;
    }

    setBarcode(detectedCode);

    // ── Step 2: Look up product via Open Food Facts (free, no API key) ──
    setPhase("looking_up");
    setStepMsg(`Barcode ${detectedCode} — looking up product…`);

    try {
      const res = await fetch(`/api/barcode/${encodeURIComponent(detectedCode)}`);
      const json = await res.json();

      if (!json.success) throw new Error(json.message || "Lookup failed");

      const data = json.data;
      setProduct(data.product);

      // ── Step 3: Relay return ID to laptop scanner (if paired) ─────────
      if (sessionId) {
        const payload = data.return?._id ?? `BARCODE:${detectedCode}`;
        await fetch(`/api/scan-relay/session/${sessionId}/scan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: payload }),
        }).catch(console.warn);
      }

      setPhase("done");
    } catch (e: any) {
      setErrorMsg("Product lookup failed.");
      setErrorDetail(e?.message ?? "Check you're connected to the same network as the laptop.");
      setPhase("error");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImage(file);
    e.target.value = "";
  };

  return (
    <div className="min-h-screen bg-[#07090e] px-4 py-6 flex flex-col items-center">

      {/*
        This div MUST be rendered at all times so html5-qrcode can find it.
        It's visually hidden but NOT display:none — has real pixel dimensions.
      */}
      <div
        id="companion-qr-div"
        ref={qrDivRef}
        style={{
          position: "fixed",
          bottom: 0,
          right: 0,
          width: "1px",
          height: "1px",
          overflow: "hidden",
          opacity: 0,
          pointerEvents: "none",
          zIndex: -1,
        }}
      />

      {/* Header */}
      <div className="w-full max-w-sm mb-6 flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
          <Camera className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-white font-bold">OrbitRider Scanner</p>
          {sessionId
            ? <p className="text-emerald-400 text-xs font-mono">Session: {sessionId}</p>
            : <p className="text-slate-500 text-xs">Standalone mode</p>}
        </div>
      </div>

      <div className="w-full max-w-sm space-y-4">

        {/* ══ READY ═══════════════════════════════════════════════════════ */}
        {phase === "ready" && (
          <>
            {/* Use <label> wrapping the input — most reliable mobile trigger */}
            <label
              htmlFor="cam-input"
              className="flex flex-col items-center justify-center gap-4 w-full h-56 rounded-2xl bg-emerald-500 active:bg-emerald-600 text-white cursor-pointer shadow-xl shadow-emerald-500/30 select-none"
            >
              <Camera className="h-20 w-20" />
              <span className="font-bold text-xl">Tap to Scan Barcode</span>
              <span className="text-emerald-100 text-sm">Opens your phone camera</span>
            </label>
            <input
              id="cam-input"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleChange}
              style={{ position: "absolute", width: "1px", height: "1px", opacity: 0 }}
            />
            <p className="text-center text-slate-500 text-xs">
              No API key needed · Works with EAN-13, UPC, Code-128 and more
            </p>
          </>
        )}

        {/* ══ PROCESSING ══════════════════════════════════════════════════ */}
        {(phase === "detecting" || phase === "looking_up") && (
          <div className="space-y-4">
            {/* Preview */}
            {preview && (
              <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 flex items-center justify-center" style={{ minHeight: 160 }}>
                <img src={preview} alt="Captured" className="max-h-52 object-contain w-full" />
              </div>
            )}

            {/* Status */}
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex items-center gap-3">
              <Loader2 className="h-6 w-6 text-emerald-400 animate-spin shrink-0" />
              <div>
                <p className="text-white font-semibold text-sm">{stepMsg}</p>
                {phase === "detecting" && (
                  <p className="text-slate-500 text-xs mt-0.5">Using device barcode scanner…</p>
                )}
                {phase === "looking_up" && (
                  <p className="text-slate-500 text-xs mt-0.5">Fetching from product database…</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══ DONE ════════════════════════════════════════════════════════ */}
        {phase === "done" && product && (
          <div className="space-y-4">
            <div className={`rounded-xl p-3 border flex items-center gap-3 ${sessionId ? "bg-emerald-500/10 border-emerald-500/30" : "bg-indigo-500/10 border-indigo-500/30"}`}>
              <CheckCircle2 className={`h-6 w-6 shrink-0 ${sessionId ? "text-emerald-400" : "text-indigo-400"}`} />
              <div>
                <p className={`font-bold text-sm ${sessionId ? "text-emerald-400" : "text-indigo-400"}`}>
                  {sessionId ? "✅ Sent to laptop! Watch the screen." : "✅ Product identified!"}
                </p>
                <p className="text-slate-400 text-xs mt-0.5">AI inspection running on laptop</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex items-start gap-3">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name}
                  className="h-20 w-20 rounded-lg object-contain bg-white shrink-0" />
              ) : (
                <div className="h-20 w-20 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                  <Package className="h-9 w-9 text-slate-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm leading-snug">{product.name}</p>
                <p className="text-slate-400 text-xs mt-0.5">{product.brand}</p>
                <p className="text-slate-500 text-[11px] mt-0.5">{product.category}</p>
                {fmt(product.price) && <p className="text-emerald-400 font-bold text-sm mt-1">{fmt(product.price)}</p>}
                <div className="flex items-center gap-1 mt-1">
                  <Tag className="h-3 w-3 text-slate-600" />
                  <span className="text-slate-600 text-[10px] font-mono">{barcode}</span>
                </div>
              </div>
            </div>

            <button onClick={reset}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border border-slate-700 text-slate-400 font-medium text-sm hover:border-emerald-500/50 hover:text-emerald-400 transition-colors">
              <RefreshCw className="h-4 w-4" />
              Scan Another Package
            </button>
          </div>
        )}

        {/* ══ ERROR ════════════════════════════════════════════════════════ */}
        {phase === "error" && (
          <div className="space-y-4">
            {preview && (
              <div className="rounded-xl overflow-hidden border border-red-500/20 bg-slate-900 flex items-center justify-center" style={{ minHeight: 140 }}>
                <img src={preview} alt="Captured" className="max-h-44 object-contain w-full opacity-60" />
              </div>
            )}

            <div className="text-center">
              <div className="h-14 w-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="h-7 w-7 text-red-400" />
              </div>
              <p className="text-white font-semibold">{errorMsg}</p>
              {errorDetail && <p className="text-slate-400 text-sm mt-1">{errorDetail}</p>}
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-xs text-slate-400 space-y-1.5">
              <p className="font-semibold text-slate-300 mb-2">📸 Tips for best results:</p>
              <p>• Hold phone <strong className="text-white">10–20 cm</strong> from barcode</p>
              <p>• Barcode should <strong className="text-white">fill most of the frame</strong></p>
              <p>• Good lighting — no glare or shadow on barcode</p>
              <p>• Keep phone <strong className="text-white">flat & parallel</strong> to barcode</p>
            </div>

            <label htmlFor="cam-retry"
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-base cursor-pointer transition-colors">
              <Camera className="h-5 w-5" />
              Take Another Photo
            </label>
            <input id="cam-retry" type="file" accept="image/*" capture="environment"
              style={{ position: "absolute", width: "1px", height: "1px", opacity: 0 }}
              onChange={(e) => { reset(); handleChange(e); }} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function ScanCompanionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
      </div>
    }>
      <CompanionContent />
    </Suspense>
  );
}
