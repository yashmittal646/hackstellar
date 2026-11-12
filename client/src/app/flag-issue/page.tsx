"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldAlert,
  ChevronLeft,
  AlertTriangle,
  Package,
  CheckCircle2,
  Loader2,
  Weight,
  ScanLine,
  User,
  FileWarning,
  RotateCcw,
  Ban,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const ISSUE_TYPES = [
  { id: "tampered_seal", label: "Tampered / Broken Seal", icon: FileWarning, color: "red" },
  { id: "wrong_item", label: "Wrong Item Inside / SKU Mismatch", icon: ScanLine, color: "orange" },
  { id: "empty_box", label: "Empty Box / Missing Contents", icon: Package, color: "red" },
  { id: "counterfeit", label: "Suspected Counterfeit / Fake Item", icon: ShieldAlert, color: "red" },
  { id: "weight_mismatch", label: "Box Weight Mismatch", icon: Weight, color: "yellow" },
  { id: "refused_unboxing", label: "Customer Refused Inspection", icon: AlertTriangle, color: "orange" },
  { id: "aggressive_customer", label: "Aggressive / Threatening Customer", icon: User, color: "red" },
  { id: "other", label: "Other Fraud / Safety Issue", icon: FileWarning, color: "slate" },
];

function colorClass(color: string, variant: "bg" | "text" | "border") {
  const map: Record<string, Record<string, string>> = {
    red: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/40" },
    orange: { bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/40" },
    amber: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/40" },
    yellow: { bg: "bg-yellow-500/15", text: "text-yellow-400", border: "border-yellow-500/40" },
    slate: { bg: "bg-slate-800", text: "text-slate-400", border: "border-slate-700" },
  };
  return map[color]?.[variant] ?? "";
}

function FlagIssueContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const returnId = searchParams.get("returnId");
  const initialIssue = searchParams.get("issue") || "tampered_seal";
  const initialReasons = searchParams.get("reasons") || "";
  const isAutoFraud = searchParams.get("fraud") === "true";

  const [selectedIssue, setSelectedIssue] = useState<string>(initialIssue);
  const [notes, setNotes] = useState(initialReasons ? `Doorstep AI detected: ${initialReasons}` : "");
  const [returnDetails, setReturnDetails] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Fetch return details if returnId is present
  useEffect(() => {
    if (returnId) {
      fetch(`/api/returns/${returnId}`)
        .then((r) => r.json())
        .then((j) => {
          if (j.data) setReturnDetails(j.data);
        })
        .catch(() => {});
    }
  }, [returnId]);

  const handleSubmit = async () => {
    if (!selectedIssue) return;
    setSubmitting(true);

    try {
      if (returnId) {
        // Freeze return in database
        await fetch(`/api/returns/${returnId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "frozen",
            issueType: selectedIssue,
            notes: notes || `Return frozen at doorstep. Issue: ${selectedIssue}. Product returned to customer.`,
          }),
        });
      }
    } catch (e) {
      console.warn("Status update error:", e);
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  const selectedIssueObj = ISSUE_TYPES.find((i) => i.id === selectedIssue);

  // ── SUCCESS: RETURN FROZEN SCREEN ──────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#07090e] px-4 py-8 flex flex-col items-center justify-center max-w-lg mx-auto w-full">
        <div className="bg-slate-900 border-2 border-red-500/50 rounded-3xl p-6 text-center w-full space-y-5 shadow-2xl shadow-red-500/20">
          {/* Frozen icon */}
          <div className="relative mx-auto w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
            <Ban className="h-10 w-10 text-red-400" />
          </div>

          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-black uppercase tracking-wider mb-2">
              🚨 RETURN FROZEN & CANCELLED
            </span>
            <h2 className="text-white font-black text-2xl">Do Not Accept Return</h2>
          </div>

          {/* MAIN DRIVER ACTION DIRECTIVE */}
          <div className="bg-red-500/15 border-2 border-red-500/40 rounded-2xl p-4 text-left space-y-2">
            <p className="text-red-300 font-black text-base flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-red-400 shrink-0" />
              HAND PACKAGE BACK TO CUSTOMER
            </p>
            <p className="text-slate-200 text-xs leading-relaxed">
              <strong>Action required:</strong> Hand the item back to the customer immediately. Do not take this item into your vehicle.
            </p>
            <p className="text-red-400/90 text-xs font-mono">
              Reason: {selectedIssueObj?.label || selectedIssue}
            </p>
          </div>

          {/* Return Info Box */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3.5 text-left text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Return ID:</span>
              <span className="text-white font-mono font-bold">{returnDetails?.returnId || returnId || "RET-SCAN"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">System Status:</span>
              <span className="text-red-400 font-bold">FROZEN (Rejected at doorstep)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Customer Notice:</span>
              <span className="text-slate-300">Customer notified via SMS & App</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Driver Protection:</span>
              <span className="text-emerald-400 font-semibold">✓ Zero Driver Liability Logged</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <Link
              href="/scanner"
              className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-base flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
            >
              Scan Next Package
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/"
              className="w-full py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-sm flex items-center justify-center transition-colors"
            >
              Back to Home Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── ISSUE SELECTION FORM ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#07090e] px-4 pt-5 pb-12 max-w-lg mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Link
          href={returnId ? `/scanner?returnId=${returnId}` : "/scanner"}
          className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 text-slate-400" />
        </Link>
        <div>
          <h1 className="text-white font-bold text-lg flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-400" />
            Report Issue & Freeze Return
          </h1>
          <p className="text-slate-500 text-xs">AI flagged security / doorstep fraud anomaly</p>
        </div>
      </div>

      {/* Auto-Fraud Alert Notice */}
      {isAutoFraud && (
        <div className="p-4 rounded-2xl bg-red-500/15 border-2 border-red-500/40 mb-5 flex items-start gap-3 shadow-lg">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-black text-sm">AI Fraud Detection Triggered</p>
            <p className="text-red-200/90 text-xs mt-1 leading-relaxed">
              The AI inspection identified severe fraud indicators at the doorstep. Confirm the issue below to <strong>freeze the return</strong> and return the item to the customer.
            </p>
          </div>
        </div>
      )}

      {/* Product Summary (if known) */}
      {returnDetails && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 mb-5 flex items-center gap-3">
          <Package className="h-5 w-5 text-slate-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-xs truncate">
              {typeof returnDetails.productId === "object" ? returnDetails.productId.name : "Product"}
            </p>
            <p className="text-slate-500 text-[11px] font-mono">Return ID: {returnDetails.returnId}</p>
          </div>
        </div>
      )}

      {/* Step prompt */}
      <p className="text-white font-bold text-sm mb-2.5">Select the verified doorstep issue:</p>

      {/* Issue Type List */}
      <div className="space-y-2 mb-5">
        {ISSUE_TYPES.map(({ id, label, icon: Icon, color }) => (
          <button
            key={id}
            type="button"
            onClick={() => setSelectedIssue(id)}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
              selectedIssue === id
                ? `${colorClass(color, "bg")} ${colorClass(color, "border")} ${colorClass(color, "text")} shadow-md`
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
            }`}
          >
            <div
              className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                selectedIssue === id ? colorClass(color, "bg") : "bg-slate-800"
              }`}
            >
              <Icon className={`h-4.5 w-4.5 ${selectedIssue === id ? colorClass(color, "text") : "text-slate-500"}`} />
            </div>
            <span className="font-semibold text-sm">{label}</span>
            {selectedIssue === id && (
              <CheckCircle2 className={`h-4 w-4 ml-auto shrink-0 ${colorClass(color, "text")}`} />
            )}
          </button>
        ))}
      </div>

      {/* Additional Details */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 mb-6">
        <p className="text-white font-semibold text-xs mb-2">Driver Notes / Doorstep Observation</p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Describe physical condition observed at customer doorstep…"
          rows={3}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500 transition-colors resize-none"
        />
      </div>

      {/* Action Directive Button */}
      <button
        onClick={handleSubmit}
        disabled={!selectedIssue || submitting}
        className={`w-full py-4 rounded-xl font-black text-base flex items-center justify-center gap-2 transition-all shadow-xl ${
          submitting
            ? "bg-red-800 text-white cursor-wait"
            : "bg-red-600 hover:bg-red-500 text-white shadow-red-600/30 active:scale-[0.99]"
        }`}
      >
        {submitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Freezing Return on System…
          </>
        ) : (
          <>
            <Ban className="h-5 w-5" />
            Freeze Return & Return to Customer
          </>
        )}
      </button>

      <p className="text-center text-slate-500 text-[11px] mt-3">
        Submitting will immediately cancel doorstep return and instruct you to hand the item back.
      </p>
    </div>
  );
}

export default function FlagIssuePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07090e] flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-red-400 animate-spin" />
        </div>
      }
    >
      <FlagIssueContent />
    </Suspense>
  );
}
