"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchReturnById } from "../../lib/api";
import { ReturnItem } from "../../types";
import { formatCurrency } from "../../lib/utils";
import Link from "next/link";
import {
  MessageSquare,
  Star,
  CheckCircle2,
  Loader2,
  Package,
  User,
  MapPin,
  Zap,
  Warehouse,
  Users,
  Navigation,
  ChevronLeft,
  ShieldAlert,
  AlertTriangle,
  Send,
} from "lucide-react";

const HANDOVER_TAGS = [
  "Item Sealed",
  "Item Opened",
  "Item Missing Parts",
  "Customer Provided Wrong Item",
  "Customer Cooperative",
  "Customer Unresponsive",
  "Packaging Damaged",
  "Tampered Seal",
];

function FeedbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const returnId = searchParams.get("returnId");

  const [returnItem, setReturnItem] = useState<ReturnItem | null>(null);
  const [loading, setLoading] = useState(!!returnId);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (returnId) {
      fetchReturnById(returnId)
        .then(setReturnItem)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [returnId]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    // Simulate submission
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    setSubmitted(true);
  };

  const destination = returnItem?.routingDestination;
  const product = typeof returnItem?.productId === "object" ? returnItem.productId : null;
  const user = typeof returnItem?.userId === "object" ? returnItem.userId : null;
  const hub = typeof returnItem?.assignedHubId === "object" ? returnItem.assignedHubId : null;
  const matchedOrder = typeof returnItem?.matchedOrderId === "object" ? returnItem.matchedOrderId : null;

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center px-4 pb-8">
        <div className="text-center max-w-xs">
          <div className="h-20 w-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          </div>
          <h2 className="text-white font-black text-2xl mb-2">Feedback Submitted!</h2>
          <p className="text-slate-400 text-sm mb-6">
            Great work. Your feedback and the AI routing decision have been logged.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold transition-colors"
          >
            Back to Tasks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] px-4 pt-5 pb-8 max-w-lg mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={returnId ? `/scanner?returnId=${returnId}` : "/"}
          className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 text-slate-400" />
        </Link>
        <div>
          <h1 className="text-white font-bold text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-emerald-400" />
            Rider Feedback
          </h1>
          <p className="text-slate-500 text-xs">Rate the pickup & confirm AI routing</p>
        </div>
      </div>

      {/* Package info */}
      {loading && (
        <div className="h-20 rounded-xl bg-slate-800/50 animate-pulse border border-slate-800 mb-5" />
      )}
      {!loading && (product || returnItem) && (
        <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4 mb-5 flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
            <Package className="h-5 w-5 text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm line-clamp-1">
              {product?.name ?? "Scanned Package"}
            </p>
            <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-2">
              {user?.name && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {user.name}
                </span>
              )}
              {returnItem?.pickupAddress?.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {returnItem.pickupAddress.city}
                </span>
              )}
            </p>
          </div>
          {returnItem?.fraudRisk === "high" && (
            <span className="shrink-0 inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 font-bold">
              <ShieldAlert className="h-2.5 w-2.5" />
              FRAUD
            </span>
          )}
        </div>
      )}

      {/* ── AI Routing Decision ─────────────────────────────────── */}
      {!loading && (
        <div className="mb-6">
          <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mb-3">
            AI Routing Decision
          </p>

          {!destination && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700 text-center">
              <p className="text-slate-400 text-sm">
                Scan the package first to get an AI routing decision.
              </p>
              <Link
                href={returnId ? `/scanner?returnId=${returnId}` : "/scanner"}
                className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-lg bg-emerald-500 text-white text-xs font-bold"
              >
                Go to Scanner
              </Link>
            </div>
          )}

          {/* Category 1: Direct to nearby customer (within 25km) */}
          {destination === "direct_to_customer" && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border-2 border-emerald-500/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-7 w-7 rounded-full bg-emerald-500 text-white text-xs font-black flex items-center justify-center">1</span>
                <div>
                  <p className="text-emerald-400 font-black text-sm">Direct to Nearby Customer</p>
                  <p className="text-emerald-400/70 text-[10px] font-mono">PEER INTERCEPT · within 25 km</p>
                </div>
                <Zap className="h-5 w-5 text-emerald-400 ml-auto" />
              </div>
              <p className="text-slate-300 text-xs mb-3">
                A customer within 25 km wants this exact product. Deliver it directly — no warehouse needed.
              </p>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-white font-semibold text-xs">
                    {(matchedOrder as any)?.deliveryAddress?.city ?? "Nearby Buyer"} · {returnItem?.optimizedDistance ?? 3} km
                  </p>
                  <p className="text-emerald-400/70 text-[10px]">Saves {formatCurrency(returnItem?.costSaved ?? 1800)} · {returnItem?.co2Saved?.toFixed(1) ?? "12"} kg CO₂</p>
                </div>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-emerald-500 text-white text-[10px] font-bold"
                >
                  <Navigation className="h-3 w-3" />
                  Go
                </a>
              </div>
            </div>
          )}

          {/* Category 2: Local warehouse — no match */}
          {destination === "nearby_hub" && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-7 w-7 rounded-full bg-amber-500 text-white text-xs font-black flex items-center justify-center">2</span>
                <div>
                  <p className="text-amber-400 font-bold text-sm">Return to Local Warehouse</p>
                  <p className="text-amber-400/70 text-[10px] font-mono">NO NEARBY MATCH FOUND</p>
                </div>
                <Warehouse className="h-5 w-5 text-amber-400 ml-auto" />
              </div>
              <p className="text-slate-300 text-xs mb-3">
                No customer found within 25 km right now. Drop the item at the nearest local warehouse for fast regional dispatch.
              </p>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-center gap-2">
                <Warehouse className="h-5 w-5 text-amber-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-white font-semibold text-xs">
                    {hub?.name ?? "Regional Micro-Hub"}
                  </p>
                  <p className="text-amber-400/70 text-[10px]">
                    {hub?.address?.street ?? ""}{hub?.address?.city ? ` · ${hub.address.city}` : ""}
                    {hub?.address?.pincode ? ` · ${hub.address.pincode}` : ""}
                  </p>
                </div>
                <a
                  href={`https://maps.google.com/?q=${hub?.address?.street ?? ""}+${hub?.address?.city ?? "Delhi"}+India`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-amber-500 text-white text-[10px] font-bold"
                >
                  <Navigation className="h-3 w-3" />
                  Go
                </a>
              </div>
            </div>
          )}

          {/* Category 3: Main warehouse — defective/fraud */}
          {destination === "central_warehouse" && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/40">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-7 w-7 rounded-full bg-red-500 text-white text-xs font-black flex items-center justify-center">3</span>
                <div>
                  <p className="text-red-400 font-bold text-sm">Return to Main Warehouse</p>
                  <p className="text-red-400/70 text-[10px] font-mono">DEFECTIVE / FRAUD FLAGGED</p>
                </div>
                <AlertTriangle className="h-5 w-5 text-red-400 ml-auto" />
              </div>
              <p className="text-slate-300 text-xs mb-3">
                Item is defective or flagged as fraudulent by the AI. Must go to the central warehouse for full physical inspection.
              </p>
              {returnItem?.fraudRisk === "high" && (
                <div className="mb-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-xs text-red-400 flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                    <strong>Fraud detected.</strong> Secure the package. Do not return to customer.
                  </p>
                </div>
              )}
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2">
                <Warehouse className="h-5 w-5 text-red-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-white font-semibold text-xs">Central Warehouse — Delhi</p>
                  <p className="text-red-400/70 text-[10px]">NH-8 Logistics Park, Gurgaon · 122001</p>
                </div>
                <a
                  href="https://maps.google.com/?q=NH-8+Logistics+Park+Gurgaon+India"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-red-500 text-white text-[10px] font-bold"
                >
                  <Navigation className="h-3 w-3" />
                  Go
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Customer Rating ─────────────────────────────────────── */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 mb-4">
        <p className="text-white font-semibold text-sm mb-3">Rate Customer Interaction</p>
        <div className="flex items-center gap-2 justify-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="transition-transform active:scale-90"
            >
              <Star
                className={`h-9 w-9 transition-colors ${
                  star <= (hoverRating || rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-700"
                }`}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-center text-xs text-slate-400 mt-2">
            {["", "Very Poor", "Poor", "Okay", "Good", "Excellent"][rating]}
          </p>
        )}
      </div>

      {/* ── Handover Tags ───────────────────────────────────────── */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 mb-4">
        <p className="text-white font-semibold text-sm mb-3">Item Handover Notes</p>
        <div className="flex flex-wrap gap-2">
          {HANDOVER_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                selectedTags.includes(tag)
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* ── Free-text Notes ─────────────────────────────────────── */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 mb-5">
        <p className="text-white font-semibold text-sm mb-2">Additional Notes</p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional: add any notes about this pickup…"
          rows={3}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={rating === 0 || submitting}
        className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
          rating === 0
            ? "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700"
            : submitting
            ? "bg-emerald-600 text-white cursor-wait"
            : "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20"
        }`}
      >
        {submitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Submitting…
          </>
        ) : (
          <>
            <Send className="h-5 w-5" />
            Submit Feedback
          </>
        )}
      </button>
      {rating === 0 && (
        <p className="text-center text-slate-600 text-xs mt-2">Select a star rating to submit</p>
      )}
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
      </div>
    }>
      <FeedbackContent />
    </Suspense>
  );
}

