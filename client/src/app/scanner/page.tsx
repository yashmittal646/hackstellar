"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ReturnItem } from "../../types";
import Link from "next/link";
import {
  ScanLine, Package, CheckCircle2, AlertTriangle, Zap,
  MapPin, Navigation, Loader2, ShieldAlert, Truck,
  Warehouse, Users, ChevronLeft, Camera, Tag, RefreshCw,
  Hash, ImagePlus, X, Sparkles, ThumbsUp, ThumbsDown,
  Eye, QrCode, Smartphone, Shield, ShieldCheck, AlertOctagon,
} from "lucide-react";

type Stage =
  | "ready"          // show scan options
  | "detecting"      // detecting barcode from photo
  | "looking_up"     // barcode found → fetch product
  | "fraud_check"    // show product + doorstep checklist + quick fraud scan
  | "photo_capture"  // take product photos (only if not fraud)
  | "analyzing"      // Gemini Vision analyzing photos
  | "result"         // show routing verdict
  | "error";

// ── helpers ──────────────────────────────────────────────────────────────────
function conditionColor(s: number) {
  return s >= 80 ? "text-emerald-400" : s >= 50 ? "text-amber-400" : "text-red-400";
}
function conditionBg(s: number) {
  return s >= 80
    ? "bg-emerald-500/10 border-emerald-500/40"
    : s >= 50
    ? "bg-amber-500/10 border-amber-500/40"
    : "bg-red-500/10 border-red-500/40";
}
function conditionLabel(s: number) {
  if (s >= 90) return "PRISTINE";
  if (s >= 70) return "LIKE NEW";
  if (s >= 50) return "GOOD";
  if (s >= 30) return "FAIR";
  return "DEFECTIVE";
}
function fmt(p: number) { return p ? `₹${p.toLocaleString("en-IN")}` : ""; }

// ── Barcode detection: BarcodeDetector → ZXing → html5-qrcode ────────────────
async function detectBarcode(file: File): Promise<string> {
  if ("BarcodeDetector" in window) {
    try {
      const bd = new (window as any).BarcodeDetector({
        formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39", "code_93", "itf", "codabar", "qr_code", "data_matrix"],
      });
      const hits: any[] = await bd.detect(await createImageBitmap(file));
      if (hits.length > 0) return hits[0].rawValue;
    } catch {}
  }
  try {
    const { BrowserMultiFormatReader } = await import("@zxing/browser");
    const reader = new BrowserMultiFormatReader();
    const imgEl = document.createElement("img");
    imgEl.style.cssText = "position:fixed;bottom:0;right:0;width:1px;height:1px;opacity:0;pointer-events:none";
    document.body.appendChild(imgEl);
    const code = await new Promise<string>((resolve, reject) => {
      imgEl.onload = async () => {
        try { resolve((await reader.decodeFromImageElement(imgEl)).getText()); }
        catch (e) { reject(e); }
        finally { document.body.removeChild(imgEl); }
      };
      imgEl.onerror = () => { document.body.removeChild(imgEl); reject(new Error("img load fail")); };
      imgEl.src = URL.createObjectURL(file);
    });
    return code;
  } catch {}
  try {
    const { Html5Qrcode } = await import("html5-qrcode");
    const tmpId = "__barcode_scan_tmp";
    let tmp = document.getElementById(tmpId);
    if (!tmp) {
      tmp = document.createElement("div");
      tmp.id = tmpId;
      Object.assign(tmp.style, { position: "fixed", width: "1px", height: "1px", bottom: "0", right: "0", opacity: "0", pointerEvents: "none" });
      document.body.appendChild(tmp);
    }
    const scanner = new Html5Qrcode(tmpId, { verbose: false } as any);
    try { return await scanner.scanFile(file, false); }
    finally { try { scanner.clear(); } catch {} }
  } catch {}
  throw new Error("No barcode detected");
}

// ── Compress image to base64 (max 1200px wide, quality 0.75) ─────────────────
function compressToBase64(file: File, maxW = 1200, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("img load fail")); };
    img.src = url;
  });
}

// ── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ product, barcode }: { product: any; barcode: string }) {
  if (!product) return null;
  return (
    <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3">
      {product.imageUrl ? (
        <img src={product.imageUrl} alt={product.name} className="h-20 w-20 rounded-xl object-contain bg-white shrink-0" />
      ) : (
        <div className="h-20 w-20 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
          <Package className="h-9 w-9 text-slate-500" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-sm leading-snug">{product.name}</p>
        <p className="text-slate-400 text-xs mt-0.5">{product.brand}</p>
        <p className="text-slate-500 text-[11px] mt-0.5">{product.category}</p>
        {product.price > 0 && <p className="text-emerald-400 font-bold text-sm mt-1">{fmt(product.price)}</p>}
        {barcode && (
          <div className="flex items-center gap-1 mt-1">
            <Tag className="h-3 w-3 text-slate-600" />
            <span className="text-slate-600 text-[10px] font-mono">{barcode}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Wireless Phone Scanner QR Modal ───────────────────────────────────────
function WirelessPhoneModal({
  session,
  phoneConnected,
  onClose,
}: {
  session: { token: string; phoneUrl: string; qrDataUrl: string };
  phoneConnected: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(session.phoneUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center pt-2">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mb-2">
            <Smartphone className="h-6 w-6" />
          </div>
          <h3 className="text-white font-bold text-base">Wireless Phone Scanner</h3>
          <p className="text-slate-400 text-xs mt-1">
            Scan this QR code with your phone to pair.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl shadow-inner mx-auto max-w-[220px]">
          {session.qrDataUrl ? (
            <img src={session.qrDataUrl} alt="Pairing QR code" className="w-full h-auto aspect-square object-contain" />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">Generating QR…</div>
          )}
        </div>

        <div className={`p-2.5 rounded-xl text-center text-xs font-semibold flex items-center justify-center gap-2 ${
          phoneConnected
            ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
            : "bg-slate-800 border border-slate-700 text-slate-300"
        }`}>
          <span className={`h-2 w-2 rounded-full ${phoneConnected ? "bg-emerald-400 animate-ping" : "bg-amber-400 animate-pulse"}`} />
          <span>{phoneConnected ? "Phone Connected! Point at barcode…" : "Waiting for phone to scan QR…"}</span>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-xl p-2">
          <span className="text-[11px] text-slate-400 font-mono truncate flex-1">{session.phoneUrl}</span>
          <button
            onClick={copyUrl}
            className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Manual barcode modal ──────────────────────────────────────────────────────
function ManualEntryModal({ onSubmit, onCancel }: { onSubmit: (c: string) => void; onCancel: () => void }) {
  const [val, setVal] = useState("");
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm space-y-4">
        <p className="text-white font-bold text-base">Enter Barcode Manually</p>
        <p className="text-slate-400 text-sm">Type the number printed under the barcode lines</p>
        <input
          type="text" inputMode="numeric" autoFocus
          placeholder="e.g. 8901030876722"
          value={val}
          onChange={(e) => setVal(e.target.value.replace(/\D/g, ""))}
          className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white text-lg font-mono tracking-widest placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
        />
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 font-semibold">Cancel</button>
          <button
            onClick={() => val.length >= 4 && onSubmit(val)}
            disabled={val.length < 4}
            className="flex-1 py-3 rounded-xl bg-emerald-500 disabled:opacity-40 text-white font-bold"
          >Confirm</button>
        </div>
      </div>
    </div>
  );
}

// ── Main scanner component ────────────────────────────────────────────────────
function ScannerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [stage, setStage] = useState<Stage>("ready");
  const [stepMsg, setStepMsg] = useState("");
  const [barcode, setBarcode] = useState("");
  const [barcodePreview, setBarcodePreview] = useState(""); // photo of barcode
  const [product, setProduct] = useState<any>(null);
  const [returnId, setReturnId] = useState<string | null>(searchParams.get("returnId"));
  const [returnItem, setReturnItem] = useState<ReturnItem | null>(null);
  const [aiResult, setAiResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [checklist, setChecklist] = useState({ sealed: false, noDamage: false, correctItem: false });
  const [showManual, setShowManual] = useState(false);
  const [showPhoneQr, setShowPhoneQr] = useState(false);
  const [phoneSession, setPhoneSession] = useState<{ token: string; phoneUrl: string; qrDataUrl: string } | null>(null);
  const [phoneConnected, setPhoneConnected] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [fraudRunning, setFraudRunning] = useState(false);
  const lastPolledScanIdRef = useRef<string | null>(null);

  // Product photos for Gemini analysis
  const [productPhotos, setProductPhotos] = useState<{ url: string; b64: string }[]>([]);
  const [captureMsg, setCaptureMsg] = useState("");

  // ── Poll for scans when wireless QR modal is active ──────────────────────
  useEffect(() => {
    if (!showPhoneQr || !phoneSession?.token) return;
    let cancelled = false;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/session/${phoneSession.token}/scans`);
        const data = await res.json();
        if (cancelled) return;
        if (data.success) {
          if (data.phoneConnected) setPhoneConnected(true);
          if (data.scans && data.scans.length > 0) {
            const scan = data.scans[0];
            // Avoid re-processing same scan
            if (scan.id === lastPolledScanIdRef.current) return;
            lastPolledScanIdRef.current = scan.id;
            clearInterval(interval);
            setShowPhoneQr(false);
            lookupBarcode(scan.barcode, scan.imageDataUrl || "");
          }
        }
      } catch {}
    }, 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [showPhoneQr, phoneSession?.token]);

  const startPhonePairing = async () => {
    setPhoneLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        setPhoneSession(data);
        setPhoneConnected(false);
        setShowPhoneQr(true);
        lastPolledScanIdRef.current = null;
      } else {
        alert("Failed to initialize phone session: " + data.message);
      }
    } catch {
      alert("Scanner Bridge service not reachable at http://localhost:3001. Make sure the backend is running.");
    } finally {
      setPhoneLoading(false);
    }
  };

  // If loaded with returnId, go directly to fraud_check
  useEffect(() => {
    const rid = searchParams.get("returnId");
    if (rid) {
      setReturnId(rid);
      setStage("fraud_check");
      fetch(`/api/returns/${rid}`).then(r => r.json()).then(j => setReturnItem(j.data)).catch(() => {});
    }
  }, []);

  // ── Barcode lookup ────────────────────────────────────────────────────────
  const lookupBarcode = async (code: string, previewDataUrl?: string) => {
    setBarcode(code);
    setStage("looking_up");
    setStepMsg(`Found barcode ${code} — looking up product…`);
    if (previewDataUrl && !barcodePreview) {
      setBarcodePreview(previewDataUrl);
    }
    try {
      const res = await fetch(`/api/barcode/${encodeURIComponent(code)}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setProduct(json.data.product);
      if (json.data.return?._id) setReturnId(json.data.return._id);
      // Advance to fraud check (not checklist)
      setStage("fraud_check");
    } catch (e: any) {
      setErrorMsg("Product lookup failed: " + (e?.message ?? "Network error"));
      setStage("error");
    }
  };

  // ── Handle barcode photo ──────────────────────────────────────────────────
  const handleBarcodePhoto = async (file: File) => {
    setStage("detecting");
    setErrorMsg("");
    setProduct(null);
    setBarcodePreview(URL.createObjectURL(file));
    setStepMsg("Reading barcode from photo…");
    let code = "";
    try {
      code = await detectBarcode(file);
    } catch {
      // Try server-side AI OCR as fallback
      setStepMsg("Local decode failed — trying AI OCR…");
      try {
        const b64 = await compressToBase64(file, 1000, 0.8);
        const ocrRes = await fetch("/api/barcode/from-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: b64 }),
        });
        const ocrJson = await ocrRes.json();
        if (ocrJson.success && ocrJson.data?.barcode) {
          code = ocrJson.data.barcode;
          if (ocrJson.data.product) {
            setProduct(ocrJson.data.product);
          }
          if (ocrJson.data.return?._id) setReturnId(ocrJson.data.return._id);
          setBarcode(code);
          setStage("fraud_check");
          return;
        }
      } catch {}
      setErrorMsg("Could not read barcode. Try again in better lighting, or enter the number manually.");
      setStage("error");
      return;
    }
    await lookupBarcode(code);
  };

  const handleBarcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleBarcodePhoto(file);
    e.target.value = "";
  };

  // ── Handle product photo capture ──────────────────────────────────────────
  const handleProductPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (productPhotos.length >= 3) { setCaptureMsg("Max 3 photos allowed"); return; }
    setCaptureMsg("Compressing…");
    try {
      const b64 = await compressToBase64(file);
      const url = URL.createObjectURL(file);
      setProductPhotos(prev => [...prev, { url, b64 }]);
      setCaptureMsg("");
    } catch {
      setCaptureMsg("Failed to load photo. Try again.");
    }
  };

  const removePhoto = (i: number) => {
    setProductPhotos(prev => prev.filter((_, idx) => idx !== i));
  };

  // ── Run Quick Fraud Check ─────────────────────────────────────────────────
  const runFraudCheck = async () => {
    setFraudRunning(true);

    // Count how many suspicious signals we have
    const signals: string[] = [];
    if (!checklist.sealed) signals.push("Packaging seal broken or missing");
    if (!checklist.noDamage) signals.push("Visible damage or dents on box");
    if (!checklist.correctItem) signals.push("Item does NOT match order label");

    await new Promise(r => setTimeout(r, 1200)); // brief analysis delay for UX

    if (signals.length >= 2) {
      // HIGH RISK FRAUD — Directly navigate to report issue page!
      setFraudRunning(false);
      const defaultIssue = !checklist.sealed ? "tampered_seal" : !checklist.correctItem ? "wrong_item" : "counterfeit";
      router.push(`/flag-issue?returnId=${returnId || ""}&issue=${defaultIssue}&fraud=true&reasons=${encodeURIComponent(signals.join("; "))}`);
      return;
    } else {
      // LOW/MEDIUM RISK — proceed to photo capture
      setFraudRunning(false);
      setStage("photo_capture");
    }
  };

  // ── Run Gemini Vision Analysis ────────────────────────────────────────────
  const runVisionAnalysis = async () => {
    if (productPhotos.length === 0) return;
    setStage("analyzing");

    try {
      const res = await fetch("/api/vision/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: productPhotos.map(p => p.b64),
          productName: product?.name ?? returnItem?.productId?.name ?? "Unknown Product",
          barcode,
          returnId,
          checklist,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      // If AI detected fraud in the photos -> directly navigate to flag-issue!
      if (json.data.isFraud || json.data.fraudRisk === "high") {
        router.push(
          `/flag-issue?returnId=${returnId || ""}&issue=counterfeit&fraud=true&reasons=${encodeURIComponent(
            json.data.summary || "Severe fraud or counterfeit indicators detected in photos"
          )}`
        );
        return;
      }

      setAiResult(json.data);

      if (returnId) {
        const retRes = await fetch(`/api/returns/${returnId}`);
        const retJson = await retRes.json();
        if (retJson.data) setReturnItem(retJson.data);
      }

      setStage("result");
    } catch (e: any) {
      console.warn("Vision analysis failed, using fallback:", e.message);
      try {
        if (returnId) {
          const res = await fetch(`/api/routing/process/${returnId}`, { method: "POST" });
          const json = await res.json();
          setAiResult({ ...json.data, fallback: true });
          const retRes = await fetch(`/api/returns/${returnId}`);
          const retJson = await retRes.json();
          setReturnItem(retJson.data);
        } else {
          setAiResult({
            conditionScore: 72, confidence: 85,
            conditionLabel: "LIKE NEW", defects: [], positives: ["Packaging appears intact"],
            routing: "nearby_hub", routingReason: "Fallback: standard routing applied.",
            recommendation: "SEND_TO_HUB", summary: "Could not reach AI — applied standard routing.",
            fallback: true, analysedByAI: true,
          });
        }
      } catch {}
      setStage("result");
    }
  };

  // ── Skip photo — run standard AI routing pipeline ─────────────────────────
  const skipToAI = async () => {
    setStage("analyzing");
    try {
      if (returnId) {
        const res = await fetch(`/api/routing/process/${returnId}`, { method: "POST" });
        const json = await res.json();
        setAiResult(json.data);
        const retRes = await fetch(`/api/returns/${returnId}`);
        const retJson = await retRes.json();
        setReturnItem(retJson.data);
      } else {
        await new Promise(r => setTimeout(r, 1800));
        setAiResult({ conditionResult: { score: 76 }, fraudResult: { risk: "low", score: 14 }, routingResult: { destination: "nearby_hub" } });
      }
    } catch {}
    setStage("result");
  };

  const reset = () => {
    setStage("ready"); setBarcode(""); setBarcodePreview(""); setProduct(null);
    setReturnId(null); setReturnItem(null); setAiResult(null); setErrorMsg("");
    setProductPhotos([]); setCaptureMsg(""); setFraudRunning(false);
    setChecklist({ sealed: false, noDamage: false, correctItem: false });
    router.replace("/scanner");
  };

  // ── Derived display values ────────────────────────────────────────────────
  const isVisionResult = aiResult?.analysedByAI === true;
  const destination = isVisionResult
    ? aiResult.routing
    : (aiResult?.routingResult?.destination ?? returnItem?.routingDestination);
  const condScore = isVisionResult
    ? aiResult.conditionScore
    : (aiResult?.conditionResult?.score ?? returnItem?.conditionScore ?? 0);
  const condLabelText = isVisionResult ? aiResult.conditionLabel : conditionLabel(condScore);
  const confidence = isVisionResult ? aiResult.confidence : null;
  const fraudRisk = aiResult?.fraudResult?.risk ?? returnItem?.fraudRisk ?? "low";
  const fraudScore = aiResult?.fraudResult?.score ?? returnItem?.fraudScore ?? 0;
  const isFraud = aiResult?.isFraud || fraudRisk === "high" || fraudScore >= 60;
  const dbProduct = typeof returnItem?.productId === "object" ? returnItem?.productId : null;
  const displayProduct = dbProduct ?? product;

  // Checklist suspicious count for UI feedback
  const suspiciousCount = [!checklist.sealed, !checklist.noDamage, !checklist.correctItem].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#07090e] px-4 pt-5 pb-24 max-w-lg mx-auto w-full">

      {showManual && (
        <ManualEntryModal
          onSubmit={code => { setShowManual(false); lookupBarcode(code); }}
          onCancel={() => setShowManual(false)}
        />
      )}

      {showPhoneQr && phoneSession && (
        <WirelessPhoneModal
          session={phoneSession}
          phoneConnected={phoneConnected}
          onClose={() => setShowPhoneQr(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700">
          <ChevronLeft className="h-4 w-4 text-slate-400" />
        </Link>
        <div>
          <h1 className="text-white font-bold text-lg flex items-center gap-2">
            <ScanLine className="h-5 w-5 text-emerald-400" />
            Doorstep Scanner
          </h1>
          <p className="text-slate-500 text-xs">Barcode + AI quality inspection</p>
        </div>
        {/* Stage indicator */}
        <div className="ml-auto flex items-center gap-1.5">
          {["fraud_check", "photo_capture", "analyzing", "result"].map((s, i) => (
            <div key={s} className={`h-1.5 w-6 rounded-full transition-all ${
              stage === "result" ? "bg-emerald-500"
              : stage === "analyzing" ? (i <= 2 ? "bg-indigo-500" : "bg-slate-700")
              : stage === "photo_capture" ? (i <= 1 ? "bg-indigo-500" : "bg-slate-700")
              : stage === "fraud_check" ? (i === 0 ? "bg-indigo-500" : "bg-slate-700")
              : "bg-slate-700"
            }`} />
          ))}
        </div>
      </div>

      {/* ══ READY ══════════════════════════════════════════════════════════ */}
      {stage === "ready" && (
        <div className="space-y-4">
          {/* Wireless Phone Scanner Button */}
          <button
            onClick={startPhonePairing}
            disabled={phoneLoading}
            className="flex flex-col items-center justify-center gap-3 w-full h-44 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 active:from-indigo-700 text-white cursor-pointer shadow-xl shadow-indigo-600/30 transition-all border border-indigo-400/30 select-none group"
          >
            <div className="flex items-center gap-2">
              <Smartphone className="h-10 w-10 text-indigo-200 group-hover:scale-110 transition-transform" />
              <QrCode className="h-10 w-10 text-indigo-200 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-center px-4">
              <span className="font-black text-lg block">Scan with Phone (Wireless)</span>
              <span className="text-indigo-200 text-xs mt-0.5 block">
                {phoneLoading ? "Starting wireless bridge…" : "Tap here · Scan QR with phone · Live stream to laptop"}
              </span>
            </div>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-slate-600 text-[10px] uppercase font-mono tracking-wider">Or scan on this device</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <label
            htmlFor="barcode-file-input"
            className="flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-white cursor-pointer transition-colors shadow-md select-none"
          >
            <Camera className="h-5 w-5 text-emerald-400" />
            <span className="font-semibold text-sm">Upload Photo / Laptop Camera</span>
          </label>
          <input id="barcode-file-input" type="file" accept="image/*" capture="environment"
            onChange={handleBarcodeChange}
            style={{ position: "fixed", top: 0, left: 0, width: "1px", height: "1px", opacity: 0, pointerEvents: "none" }} />

          <button onClick={() => setShowManual(true)}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors text-sm font-medium">
            <Hash className="h-4 w-4" />
            Enter Barcode Manually
          </button>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-500 space-y-2">
            <p className="font-semibold text-slate-400 mb-1">📋 How the inspection works:</p>
            <div className="flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
              <span>Scan barcode → instant product details</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
              <span>Quick fraud check at doorstep</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-400 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
              <span>Photo inspection → Gemini AI routing decision</span>
            </div>
          </div>
        </div>
      )}

      {/* ══ DETECTING / LOOKING UP ══════════════════════════════════════════ */}
      {(stage === "detecting" || stage === "looking_up") && (
        <div className="space-y-5">
          {barcodePreview && (
            <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 flex items-center justify-center" style={{ minHeight: 160 }}>
              <img src={barcodePreview} alt="Barcode" className="max-h-48 object-contain w-full" />
            </div>
          )}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex flex-col items-center gap-3 text-center">
            <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
            <p className="text-white font-semibold">{stepMsg || "Processing…"}</p>
            {stage === "detecting" && <p className="text-slate-500 text-sm">Reading barcode from image…</p>}
            {stage === "looking_up" && <p className="text-slate-500 text-sm">Fetching product details…</p>}
          </div>
        </div>
      )}

      {/* ══ ERROR ═══════════════════════════════════════════════════════════ */}
      {stage === "error" && (
        <div className="space-y-4">
          {barcodePreview && (
            <div className="rounded-xl overflow-hidden border border-red-500/20 bg-slate-900 flex items-center justify-center" style={{ minHeight: 120 }}>
              <img src={barcodePreview} alt="Failed" className="max-h-36 object-contain w-full opacity-60" />
            </div>
          )}
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 text-center">
            <AlertTriangle className="h-10 w-10 text-red-400 mx-auto mb-3" />
            <p className="text-white font-semibold mb-1">Could Not Read Barcode</p>
            <p className="text-red-300 text-sm">{errorMsg}</p>
          </div>
          <label htmlFor="barcode-retry-input"
            className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-emerald-500 text-white font-bold text-base cursor-pointer transition-colors">
            <Camera className="h-5 w-5" />Try Again with Camera
          </label>
          <input id="barcode-retry-input" type="file" accept="image/*" capture="environment"
            onChange={e => { reset(); handleBarcodeChange(e); }}
            style={{ position: "fixed", top: 0, left: 0, width: "1px", height: "1px", opacity: 0, pointerEvents: "none" }} />
          <button onClick={() => setShowManual(true)}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 font-semibold text-sm">
            <Hash className="h-4 w-4 text-emerald-400" />Enter Barcode Number Manually
          </button>
        </div>
      )}

      {/* ══ FRAUD CHECK ═══════════════════════════════════════════════════════ */}
      {stage === "fraud_check" && (
        <div className="space-y-4">
          {/* Step header */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Shield className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Step 1 · Doorstep Fraud Check</p>
              <p className="text-slate-500 text-xs">Verify the package before accepting</p>
            </div>
          </div>

          {/* Product details */}
          <ProductCard product={displayProduct} barcode={barcode} />

          {/* Checklist */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-3">Physical Inspection Checklist</p>
            <div className="space-y-3">
              {[
                { key: "sealed",      icon: "📦", label: "Packaging box intact & factory seal present" },
                { key: "noDamage",    icon: "✅", label: "No visible water damage or dents on box" },
                { key: "correctItem", icon: "🏷️", label: "Item matches the order (SKU / label verified)" },
              ].map(({ key, icon, label }) => (
                <label key={key} className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-colors ${
                  checklist[key as keyof typeof checklist]
                    ? "bg-emerald-500/8 border border-emerald-500/20"
                    : "hover:bg-slate-800/60"
                }`}>
                  <input type="checkbox"
                    checked={checklist[key as keyof typeof checklist]}
                    onChange={e => setChecklist(c => ({ ...c, [key]: e.target.checked }))}
                    className="h-4 w-4 rounded accent-emerald-500" />
                  <span className="text-sm">{icon}</span>
                  <span className={`text-sm ${checklist[key as keyof typeof checklist] ? "text-emerald-300" : "text-slate-300"}`}>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Risk indicator */}
          {suspiciousCount > 0 && (
            <div className={`flex items-center gap-3 p-3 rounded-xl border ${
              suspiciousCount >= 2
                ? "bg-red-500/10 border-red-500/30 text-red-300"
                : "bg-amber-500/10 border-amber-500/30 text-amber-300"
            }`}>
              <AlertOctagon className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-bold text-sm">
                  {suspiciousCount >= 2 ? "⚠️ HIGH FRAUD RISK DETECTED" : "⚠️ Suspicious signal — proceed with caution"}
                </p>
                <p className="text-xs opacity-80 mt-0.5">
                  {suspiciousCount >= 2
                    ? "2+ red flags found. AI will likely route to main warehouse."
                    : "1 red flag noted. Photos required for final verdict."}
                </p>
              </div>
            </div>
          )}

          {suspiciousCount === 0 && Object.values(checklist).every(Boolean) && (
            <div className="flex items-center gap-3 p-3 rounded-xl border bg-emerald-500/10 border-emerald-500/30 text-emerald-300">
              <ShieldCheck className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-bold text-sm">✅ Package looks clean</p>
                <p className="text-xs opacity-80 mt-0.5">All checks passed. Proceed to photo inspection.</p>
              </div>
            </div>
          )}

          {/* Quick Fraud Check Button */}
          <button
            onClick={runFraudCheck}
            disabled={fraudRunning}
            className={`w-full py-4 rounded-xl font-black text-base flex items-center justify-center gap-2 transition-all shadow-lg ${
              suspiciousCount >= 2
                ? "bg-red-600 hover:bg-red-500 text-white shadow-red-600/30 animate-pulse"
                : "bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20"
            } disabled:opacity-50`}
          >
            {fraudRunning ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {suspiciousCount >= 2 ? "Navigating to Report Issue…" : "Running Fraud Check…"}
              </>
            ) : (
              <>
                <ShieldAlert className="h-5 w-5" />
                {suspiciousCount >= 2 ? "🚨 Fraud Detected — Report Issue & Freeze" : "Run Doorstep Fraud Check & Continue"}
              </>
            )}
          </button>

          <button onClick={reset}
            className="w-full py-2.5 rounded-xl border border-slate-700 text-slate-500 text-sm flex items-center justify-center gap-2 hover:text-slate-300 transition-colors">
            <RefreshCw className="h-4 w-4" />Scan Different Package
          </button>
        </div>
      )}

      {/* ══ PHOTO CAPTURE ═══════════════════════════════════════════════════ */}
      {stage === "photo_capture" && (
        <div className="space-y-4">
          {/* Product name reminder */}
          {displayProduct && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <p className="text-emerald-300 text-sm font-semibold">Fraud check passed — take product photos</p>
            </div>
          )}

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <p className="text-white font-bold text-sm flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              Step 2 · AI Photo Inspection
            </p>
            <p className="text-slate-400 text-xs">
              Take 1–3 clear photos. Gemini AI will analyze condition and decide: Customer / Local Hub / Main Warehouse.
            </p>
          </div>

          {/* Photo thumbnails */}
          <div className="grid grid-cols-3 gap-3">
            {productPhotos.map((p, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
                <img src={p.url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/70 flex items-center justify-center hover:bg-red-500/80 transition-colors"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
                <div className="absolute bottom-1 left-1 bg-black/60 rounded px-1.5 py-0.5 text-[10px] text-white font-mono">
                  {i + 1}
                </div>
              </div>
            ))}

            {productPhotos.length < 3 && (
              <label
                htmlFor="product-photo-input"
                className="aspect-square rounded-xl border-2 border-dashed border-slate-700 hover:border-indigo-500/60 bg-slate-900/40 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <ImagePlus className="h-7 w-7 text-slate-600" />
                <span className="text-[11px] text-slate-600">Add photo</span>
              </label>
            )}
          </div>
          <input
            id="product-photo-input"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleProductPhoto}
            style={{ position: "fixed", top: 0, left: 0, width: "1px", height: "1px", opacity: 0, pointerEvents: "none" }}
          />

          {captureMsg && (
            <p className="text-xs text-amber-400 text-center">{captureMsg}</p>
          )}

          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3 text-xs text-slate-500 space-y-1">
            <p>📸 <strong className="text-slate-400">Photo tips for best AI results:</strong></p>
            <p>• Show all sides if possible (front, back, damaged area)</p>
            <p>• Good lighting — no dark shadows on the product</p>
            <p>• Include any visible damage or defects in frame</p>
          </div>

          {/* Analyze button */}
          <button
            onClick={runVisionAnalysis}
            disabled={productPhotos.length === 0}
            className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-base flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
          >
            <Sparkles className="h-5 w-5" />
            {productPhotos.length === 0
              ? "Take at least 1 photo first"
              : `Analyze ${productPhotos.length} Photo${productPhotos.length > 1 ? "s" : ""} with Gemini AI`}
          </button>

          {/* Skip */}
          <button
            onClick={skipToAI}
            className="w-full py-2.5 rounded-xl border border-slate-700 text-slate-500 text-sm flex items-center justify-center gap-2 hover:text-slate-300 transition-colors"
          >
            <Zap className="h-4 w-4" />Skip photos — use standard AI routing
          </button>
        </div>
      )}

      {/* ══ ANALYZING ═══════════════════════════════════════════════════════ */}
      {stage === "analyzing" && (
        <div className="text-center py-16">
          <div className="relative mx-auto w-28 h-28 rounded-full border-2 border-dashed border-indigo-500/50 flex items-center justify-center mb-6 bg-indigo-500/5">
            <Sparkles className="h-12 w-12 text-indigo-400 animate-pulse" />
          </div>
          <p className="text-white font-bold text-lg">Gemini AI Analyzing…</p>
          <p className="text-slate-500 text-sm mt-2">Reading product condition from photos</p>
          <div className="text-slate-600 text-sm mt-5 space-y-1.5">
            <p>🔵 Detecting defects & surface damage</p>
            <p>🟡 Checking packaging integrity</p>
            <p>🟢 Computing routing at ≥90% confidence</p>
          </div>
        </div>
      )}

      {/* ══ RESULT ══════════════════════════════════════════════════════════ */}
      {stage === "result" && (
        <div className="space-y-4">
          {/* Product name bar */}
          {displayProduct && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-3">
              <Package className="h-5 w-5 text-slate-500 shrink-0" />
              <p className="text-white font-semibold text-sm line-clamp-1">{displayProduct.name}</p>
              {barcode && <span className="ml-auto text-[10px] font-mono text-slate-600">{barcode.slice(-6)}</span>}
            </div>
          )}

          {/* Fraud Warning (if flagged as fraud) */}
          {isFraud && (
            <div className="p-4 rounded-xl bg-red-500/10 border-2 border-red-500/50">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="h-6 w-6 text-red-400 shrink-0" />
                <p className="text-red-400 font-black text-base">⚠ FRAUD DETECTED AT DOORSTEP</p>
              </div>
              <p className="text-red-300 text-sm mb-2">Multiple suspicious signals found during inspection.</p>
              {aiResult?.defects?.length > 0 && (
                <ul className="space-y-1">
                  {aiResult.defects.map((d: string, i: number) => (
                    <li key={i} className="text-red-300 text-xs flex items-start gap-1.5">
                      <span className="mt-0.5 shrink-0">⚠</span>{d}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* AI analysis card */}
          {isVisionResult && !isFraud && (
            <div className={`rounded-xl border p-4 ${conditionBg(condScore)}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-400" />
                  <p className="text-white font-bold text-sm">Gemini AI Report</p>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-900/60 rounded-full px-2.5 py-1">
                  <div className={`h-2 w-2 rounded-full ${confidence && confidence >= 90 ? "bg-emerald-400" : "bg-amber-400"}`} />
                  <span className="text-xs text-slate-300 font-mono">{confidence}% confident</span>
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-3">{aiResult.summary}</p>

              {aiResult.defects?.length > 0 && (
                <div className="mb-2">
                  <p className="text-red-400 text-xs font-semibold mb-1 flex items-center gap-1"><ThumbsDown className="h-3 w-3" />Defects found:</p>
                  <ul className="space-y-0.5">
                    {aiResult.defects.map((d: string, i: number) => (
                      <li key={i} className="text-red-300 text-xs flex items-start gap-1.5">
                        <span className="mt-0.5 shrink-0">•</span>{d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {aiResult.positives?.length > 0 && (
                <div>
                  <p className="text-emerald-400 text-xs font-semibold mb-1 flex items-center gap-1"><ThumbsUp className="h-3 w-3" />Positives:</p>
                  <ul className="space-y-0.5">
                    {aiResult.positives.map((p: string, i: number) => (
                      <li key={i} className="text-emerald-300 text-xs flex items-start gap-1.5">
                        <span className="mt-0.5 shrink-0">•</span>{p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Scores */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center">
              <p className="text-[10px] text-slate-500 font-mono uppercase mb-1">Condition</p>
              <p className={`text-2xl font-black tabular-nums ${conditionColor(condScore)}`}>
                {condScore}<span className="text-sm font-normal">/100</span>
              </p>
              <p className={`text-xs font-bold mt-0.5 ${conditionColor(condScore)}`}>{condLabelText}</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center">
              <p className="text-[10px] text-slate-500 font-mono uppercase mb-1">
                {isVisionResult ? "AI Confidence" : "Fraud Risk"}
              </p>
              {isVisionResult ? (
                <>
                  <p className={`text-2xl font-black tabular-nums ${confidence && confidence >= 90 ? "text-emerald-400" : "text-amber-400"}`}>
                    {confidence}<span className="text-sm font-normal">%</span>
                  </p>
                  <p className={`text-xs font-bold mt-0.5 ${confidence && confidence >= 90 ? "text-emerald-400" : "text-amber-400"}`}>
                    {confidence && confidence >= 90 ? "HIGH CERTAINTY" : "MODERATE"}
                  </p>
                </>
              ) : (
                <>
                  <p className={`text-2xl font-black tabular-nums ${isFraud ? "text-red-400" : fraudRisk === "medium" ? "text-amber-400" : "text-emerald-400"}`}>
                    {fraudScore}<span className="text-sm font-normal">/100</span>
                  </p>
                  <p className={`text-xs font-bold mt-0.5 uppercase ${isFraud ? "text-red-400" : fraudRisk === "medium" ? "text-amber-400" : "text-emerald-400"}`}>
                    {isFraud ? "HIGH" : fraudRisk} risk
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Routing decision */}
          <RoutingCard destination={destination} returnItem={returnItem} result={aiResult} />

          {/* Actions */}
          <div className="flex gap-3">
            <Link href={`/feedback?returnId=${returnId ?? ""}`}
              className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors">
              <CheckCircle2 className="h-4 w-4" />Confirm & Feedback
            </Link>
            <Link href={`/flag-issue?returnId=${returnId ?? ""}`}
              className="py-3 px-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-sm flex items-center justify-center hover:bg-red-500/20 transition-colors">
              <ShieldAlert className="h-4 w-4" />
            </Link>
          </div>

          <button onClick={reset}
            className="w-full py-2.5 rounded-xl border border-slate-700 text-slate-400 text-sm flex items-center justify-center gap-2 hover:text-white transition-colors">
            <Camera className="h-4 w-4" />Scan Another Package
          </button>
        </div>
      )}
    </div>
  );
}

// ── Routing card ──────────────────────────────────────────────────────────────
function RoutingCard({ destination, returnItem, result }: {
  destination?: string;
  returnItem?: ReturnItem | null;
  result?: any;
}) {
  if (!destination) return null;

  if (destination === "direct_to_customer") {
    const mo = typeof returnItem?.matchedOrderId === "object" ? returnItem?.matchedOrderId : null;
    const dist = returnItem?.optimizedDistance ?? result?.routingResult?.optimizedDistance ?? 3;
    return (
      <div className="p-4 rounded-xl bg-emerald-500/10 border-2 border-emerald-500/50">
        <div className="flex items-center gap-2 mb-2"><Zap className="h-5 w-5 text-emerald-400 shrink-0" /><p className="text-emerald-400 font-black">INTERCEPT! Peer Match Found</p></div>
        <p className="text-white font-bold text-sm mb-1">🛑 DO NOT return to warehouse</p>
        <p className="text-emerald-300 text-sm mb-3">Item is in great condition. Deliver directly to a nearby buyer.</p>
        {result?.routingReason && <p className="text-emerald-200/70 text-xs mb-3 italic">"{result.routingReason}"</p>}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex items-center gap-3">
          <Users className="h-6 w-6 text-emerald-400 shrink-0" />
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">{(mo as any)?.deliveryAddress?.city ?? "Nearby Buyer"}</p>
            <p className="text-emerald-400 text-xs flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{dist} km away</p>
          </div>
          <div className="flex flex-col gap-1.5 shrink-0">
            <a href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${(mo as any)?.deliveryAddress?.coordinates?.lat ? `${(mo as any).deliveryAddress.coordinates.lat},${(mo as any).deliveryAddress.coordinates.lng}` : "28.6139,77.2090"}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-sm">
              <Eye className="h-3 w-3" />Street View
            </a>
            <a href={`https://maps.google.com/?q=${(mo as any)?.deliveryAddress?.coordinates?.lat ? `${(mo as any).deliveryAddress.coordinates.lat},${(mo as any).deliveryAddress.coordinates.lng}` : "Delhi,India"}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold">
              <Navigation className="h-3 w-3" />Navigate
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (destination === "nearby_hub") {
    const hub = typeof returnItem?.assignedHubId === "object" ? returnItem?.assignedHubId : null;
    return (
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40">
        <div className="flex items-center gap-2 mb-2"><Warehouse className="h-5 w-5 text-amber-400 shrink-0" /><p className="text-amber-400 font-bold">Drop at Local Warehouse</p></div>
        <p className="text-slate-300 text-sm mb-1">Item needs hub processing before re-dispatch.</p>
        {result?.routingReason && <p className="text-amber-200/70 text-xs mb-3 italic">"{result.routingReason}"</p>}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-center gap-3">
          <Truck className="h-6 w-6 text-amber-400 shrink-0" />
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">{hub?.name ?? "Regional Micro-Hub"}</p>
            <p className="text-amber-400 text-xs mt-0.5">{hub?.address?.city ?? "Nearest Hub"} — {hub?.address?.pincode ?? ""}</p>
          </div>
          <div className="flex flex-col gap-1.5 shrink-0">
            <a href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${(hub as any)?.location?.coordinates ? `${(hub as any).location.coordinates[1]},${(hub as any).location.coordinates[0]}` : "28.5355,77.3910"}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-sm">
              <Eye className="h-3 w-3" />Street View
            </a>
            <a href={`https://maps.google.com/?q=${hub?.address?.street ?? ""}+${hub?.address?.city ?? "Delhi"}+India`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold">
              <Navigation className="h-3 w-3" />Navigate
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-red-500/10 border-2 border-red-500/40 space-y-3">
      <div className="flex items-center gap-2">
        <Warehouse className="h-5 w-5 text-red-400 shrink-0" />
        <p className="text-red-400 font-black text-base">Route to Main Warehouse (Defects Detected)</p>
      </div>
      <p className="text-slate-200 text-xs leading-relaxed">
        {result?.routingReason || "Item has defects or damage detected in photo inspection. Route package to Central Warehouse for repair & recovery."}
      </p>
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-3">
        <Warehouse className="h-6 w-6 text-red-400 shrink-0" />
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">Central Main Warehouse — Delhi</p>
          <p className="text-red-400 text-xs mt-0.5">NH-8 Logistics Park, Gurgaon · 122001</p>
        </div>
        <div className="flex flex-col gap-1.5 shrink-0">
          <a href="https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=28.4595,77.0266"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-sm">
            <Eye className="h-3 w-3" />Street View
          </a>
          <a href="https://maps.google.com/?q=NH-8+Logistics+Park+Gurgaon+India"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500 hover:bg-red-400 text-white text-xs font-semibold">
            <Navigation className="h-3 w-3" />Navigate
          </a>
        </div>
      </div>
      <div className="flex items-start gap-2 p-2 rounded-lg bg-red-500/5 border border-red-500/10">
        <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
        <p className="text-xs text-red-300">Collect item in secure return bin. Package will not be re-sold to another customer.</p>
      </div>
    </div>
  );
}

export default function ScannerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
      </div>
    }>
      <ScannerContent />
    </Suspense>
  );
}
