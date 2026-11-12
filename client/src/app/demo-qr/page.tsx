"use client";

import { useEffect, useState } from "react";
import { fetchAllReturns } from "../../lib/api";
import { ReturnItem } from "../../types";
import Link from "next/link";
import { QrCode, ChevronLeft, Loader2, Package, Printer } from "lucide-react";

/** Build a QR code image URL using a free public API (no install needed) */
function qrUrl(data: string, size = 160) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
    data
  )}&color=10b981&bgcolor=07090e&qzone=1&format=svg`;
}

function routingBadge(dest?: string) {
  if (dest === "direct_to_customer")
    return { label: "→ Peer Intercept", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" };
  if (dest === "nearby_hub")
    return { label: "→ Local Warehouse", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" };
  if (dest === "central_warehouse")
    return { label: "→ Main Warehouse", color: "text-red-400 bg-red-500/10 border-red-500/30" };
  return { label: "⏳ Unrouted", color: "text-slate-400 bg-slate-800 border-slate-700" };
}

export default function DemoQrPage() {
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [loading, setLoading] = useState(true);
  // Use window.location.origin so the QR code works from any device on the LAN
  const [origin, setOrigin] = useState("http://localhost:3000");

  useEffect(() => {
    setOrigin(window.location.origin);
    fetchAllReturns()
      .then((data) => setReturns(data.slice(0, 20))) // show up to 20
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#07090e] px-4 pt-5 pb-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link
          href="/scanner"
          className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 text-slate-400" />
        </Link>
        <div>
          <h1 className="text-white font-bold text-lg flex items-center gap-2">
            <QrCode className="h-5 w-5 text-emerald-400" />
            Demo QR Codes
          </h1>
          <p className="text-slate-500 text-xs">
            Scan any code below with the camera scanner on your phone
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 text-xs hover:text-white transition-colors"
        >
          <Printer className="h-3.5 w-3.5" />
          Print
        </button>
      </div>

      {/* Instructions banner */}
      <div className="mt-4 mb-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
        <strong className="text-emerald-400">How to demo:</strong> Open{" "}
        <span className="font-mono text-white">{origin}/scanner</span> on your phone →
        tap <strong>Open Camera to Scan</strong> → point at any QR code below →
        AI pipeline runs automatically.
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
        </div>
      )}

      {/* QR grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 print:grid-cols-4">
        {returns.map((r) => {
          const scanUrl = `${origin}/scanner?returnId=${r._id}`;
          const badge = routingBadge(r.routingDestination);
          const product =
            typeof r.productId === "object" ? r.productId : null;

          return (
            <div
              key={r._id}
              className="bg-slate-900/70 border border-slate-700 rounded-xl p-3 flex flex-col items-center gap-2 hover:border-emerald-500/40 transition-colors print:border-slate-600 print:break-inside-avoid"
            >
              {/* QR code — fetched from api.qrserver.com */}
              <div className="relative">
                <img
                  src={qrUrl(scanUrl, 160)}
                  alt={`QR for ${r._id}`}
                  width={120}
                  height={120}
                  className="rounded-lg"
                  loading="lazy"
                />
              </div>

              {/* Package name */}
              <p className="text-white text-xs font-semibold text-center line-clamp-2 leading-tight">
                {product?.name ?? "Package"}
              </p>

              {/* Routing badge */}
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.color}`}
              >
                {badge.label}
              </span>

              {/* ID */}
              <p className="text-slate-600 text-[9px] font-mono text-center break-all">
                {String(r._id).slice(-8)}
              </p>

              {/* Quick link */}
              <Link
                href={`/scanner?returnId=${r._id}`}
                className="text-[10px] text-emerald-400 underline underline-offset-2 hover:text-emerald-300"
              >
                Open in Scanner →
              </Link>
            </div>
          );
        })}
      </div>

      {!loading && returns.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No returns found. Make sure the backend is running.</p>
        </div>
      )}
    </div>
  );
}

