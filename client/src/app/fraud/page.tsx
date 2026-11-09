"use client";

import { useEffect, useState } from "react";
import { fetchFraudAlerts, reviewFraudAlert } from "../../lib/api";
import { FraudLogItem } from "../../types";
import { formatCurrency } from "../../lib/utils";
import { 
  ShieldAlert, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle, 
  RefreshCw,
  CheckCircle2,
  XCircle,
  Sparkles
} from "lucide-react";
import Link from "next/link";

export default function FraudRadarPage() {
  const [alerts, setAlerts] = useState<FraudLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const data = await fetchFraudAlerts();
      setAlerts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReview = async (id: string, action: "approve" | "quarantine") => {
    setProcessingId(id);
    try {
      await reviewFraudAlert(id, action, action === "approve" ? "Customer verified via phone call" : "Confirmed fraudulent serial number match");
      await loadData();
    } catch (err) {
      alert("Error reviewing alert");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-rose-500" />
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Fraud Radar & Risk Shield
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Suspicious returns quarantined by the fraud detection engine. High risk items are automatically routed to Central Warehouse for physical validation.
          </p>
        </div>

        <button
          onClick={loadData}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Radar
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 text-slate-400 text-sm">
          No returns currently flagged. Security engine reports all clear.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {alerts.map((alert) => (
            <div
              key={alert._id}
              className={`p-5 rounded-3xl border transition-all ${
                alert.risk === "high"
                  ? "border-rose-500/40 bg-rose-950/10 shadow-rose-950/20"
                  : "border-slate-800 bg-slate-900/60"
              } space-y-4 shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-rose-400">
                  {alert.returnId?.returnId || "RETURN"}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                  alert.risk === "high"
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                }`}>
                  Risk Score: {alert.score}/100
                </span>
              </div>

              <div>
                <h4 className="font-bold text-white text-base">
                  {alert.returnId?.productId?.name || "Product"}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Customer: <span className="text-slate-200 font-medium">{alert.returnId?.userId?.name}</span> (
                  {formatCurrency(alert.returnId?.productId?.price || 0)})
                </p>
              </div>

              {/* Triggered Flags */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Behavioral Anomalies Detected
                </span>
                {alert.flags
                  .filter((f) => f.triggered)
                  .map((flag, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs flex items-center justify-between"
                    >
                      <span className="text-slate-300 font-medium">{flag.description}</span>
                      <span className="font-mono text-rose-400 font-bold text-[11px]">
                        +{flag.weight}pts
                      </span>
                    </div>
                  ))}
              </div>

              {/* Admin Actions */}
              <div className="pt-3 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReview(alert._id, "approve")}
                    disabled={processingId === alert._id}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Clear & Reroute Local
                  </button>

                  <button
                    onClick={() => handleReview(alert._id, "quarantine")}
                    disabled={processingId === alert._id}
                    className="flex-1 py-2 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Quarantine
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Current: <strong className="text-slate-300 capitalize">{alert.risk} Risk</strong></span>
                  {alert.returnId?._id && (
                    <Link
                      href={`/returns/${alert.returnId._id}`}
                      className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 font-semibold"
                    >
                      Audit Trail <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
