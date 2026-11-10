"use client";

import { useEffect, useState } from "react";
import { fetchFraudAlerts, reviewFraudAlert, runAgentInspect } from "../../lib/api";
import { FraudLogItem } from "../../types";
import { formatCurrency } from "../../lib/utils";
import {
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Sparkles,
  Bot,
  Eye,
  Lock,
  RotateCcw,
  Activity,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";

export default function FraudRadarPage() {
  const [alerts, setAlerts] = useState<FraudLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [inspectingId, setInspectingId] = useState<string | null>(null);
  const [inspectResults, setInspectResults] = useState<Record<string, any>>({});

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

  useEffect(() => { loadData(); }, []);

  const handleReview = async (id: string, action: "approve" | "quarantine") => {
    setProcessingId(id);
    try {
      await reviewFraudAlert(id, action, action === "approve" ? "Customer verified via phone call" : "Confirmed fraudulent serial number match");
      await loadData();
    } catch {
      alert("Error reviewing alert");
    } finally {
      setProcessingId(null);
    }
  };

  const handleAISentinelInspect = async (alert: FraudLogItem) => {
    const alertId = alert._id;
    setInspectingId(alertId);
    try {
      const product = alert.returnId?.productId;
      const result = await runAgentInspect({
        productName: product?.name || "Product",
        category: "Electronics",
        price: product?.price || 0,
        claimedReason: "Suspicious return behavior",
        userId: `fraud_suspect_${alert.userId}`,
        pickupCoords: { lat: 28.6139, lng: 77.209 },
        productWeight: 0.5,
      });
      setInspectResults((prev) => ({ ...prev, [alertId]: result }));
    } catch {
      setInspectResults((prev) => ({ ...prev, [alertId]: { error: true } }));
    } finally {
      setInspectingId(null);
    }
  };

  const highRisk = alerts.filter((a) => a.risk === "high").length;
  const medRisk = alerts.filter((a) => a.risk === "medium").length;

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">

      {/* Global AI Scanning Banner */}
      {inspectingId && (
        <div className="rounded-2xl border border-violet-500/40 bg-violet-950/40 p-4 flex items-center gap-4 animate-pulse">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/30">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-bold text-violet-300 uppercase tracking-wider">AI Sentinel Active</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping" />
                Scanning
              </span>
            </div>
            <p className="text-xs text-white/50">
              Running deep multi-agent analysis — VisionAgent + FraudSentinel profiling return behavior patterns…
            </p>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            {[0,1,2,3,4].map(i => (
              <div
                key={i}
                className="w-1 rounded-full bg-violet-400 animate-bounce"
                style={{ height: `${8 + (i % 3) * 6}px`, animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-rose-950/30 via-slate-900/90 to-slate-950 border border-rose-500/20">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="h-6 w-6 text-rose-400" />
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Fraud Radar</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/25 ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
              Live Shield
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-400 max-w-2xl">
            FraudSentinel AI flags suspicious returns using behavioral pattern analysis, serial number matching, and cross-agent discrepancy detection.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-2xl font-black text-rose-400">{highRisk}</div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">High Risk</div>
            </div>
            <div className="w-px h-10 bg-slate-800" />
            <div className="text-center">
              <div className="text-2xl font-black text-amber-400">{medRisk}</div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Medium</div>
            </div>
            <div className="w-px h-10 bg-slate-800" />
            <div className="text-center">
              <div className="text-2xl font-black text-slate-300">{alerts.length}</div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Total</div>
            </div>
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* How it works strip */}
      <div className="flex flex-wrap items-center gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Bot className="w-3.5 h-3.5 text-violet-400" />
          <span><strong className="text-white">FraudSentinel</strong> analyzes return velocity, serial consistency & claim patterns</span>
        </div>
        <span className="text-slate-700">·</span>
        <div className="flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-blue-400" />
          <span><strong className="text-white">VisionAgent</strong> cross-checks claimed condition against behavioral signals</span>
        </div>
        <span className="text-slate-700">·</span>
        <div className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-rose-400" />
          <span>HIGH risk → auto-quarantined to Central Warehouse</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="p-16 text-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/30">
          <ShieldAlert className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-medium">No active fraud alerts — engine reports all clear.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {alerts.map((alert) => {
            const aiResult = inspectResults[alert._id];
            const isInspecting = inspectingId === alert._id;
            const triggeredFlags = alert.flags.filter((f) => f.triggered);

            return (
              <div
                key={alert._id}
                className={`rounded-3xl border transition-all shadow-lg space-y-4 p-5 ${
                  alert.risk === "high"
                    ? "border-rose-500/40 bg-rose-950/15 hover:border-rose-500/60"
                    : "border-amber-500/20 bg-amber-950/5 hover:border-amber-500/40"
                }`}
              >
                {/* Alert header */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-rose-400">
                    {alert.returnId?.returnId || "RETURN"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3 h-3 text-slate-500" />
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      alert.risk === "high"
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    }`}>
                      Score: {alert.score}/100
                    </span>
                  </div>
                </div>

                {/* Risk score bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Fraud Confidence</span>
                    <span className={alert.risk === "high" ? "text-rose-400" : "text-amber-400"}>{alert.score}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        alert.score > 60 ? "bg-gradient-to-r from-orange-500 to-red-500"
                        : "bg-gradient-to-r from-yellow-500 to-amber-500"
                      }`}
                      style={{ width: `${alert.score}%` }}
                    />
                  </div>
                </div>

                {/* Product info */}
                <div>
                  <h4 className="font-bold text-white text-base">{alert.returnId?.productId?.name || "Product"}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    <span className="text-slate-200 font-medium">{alert.returnId?.userId?.name}</span>
                    {" · "}{formatCurrency(alert.returnId?.productId?.price || 0)}
                  </p>
                </div>

                {/* Triggered flags */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                  <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Anomalies Detected</span>
                  {triggeredFlags.slice(0, 3).map((flag, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" />
                        <span className="text-slate-300 font-medium">{flag.description}</span>
                      </div>
                      <span className="font-mono text-rose-400 font-bold text-[11px] flex-shrink-0 ml-2">+{flag.weight}pts</span>
                    </div>
                  ))}
                </div>

                {/* AI Sentinel Result */}
                {aiResult && !aiResult.error && (
                  <div className="rounded-xl bg-violet-500/5 border border-violet-500/15 p-3 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-violet-400" />
                      <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">AI Sentinel Verdict</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className={`text-xs font-black ${
                          aiResult.visionAgent?.qualityGrade === "PRISTINE" ? "text-emerald-400" :
                          aiResult.visionAgent?.qualityGrade === "LIKE_NEW" ? "text-blue-400" : "text-amber-400"
                        }`}>{aiResult.visionAgent?.qualityGrade}</div>
                        <div className="text-[9px] text-slate-500">Quality</div>
                      </div>
                      <div>
                        <div className={`text-xs font-black ${
                          aiResult.fraudSentinel?.fraudRisk === "HIGH" ? "text-red-400" :
                          aiResult.fraudSentinel?.fraudRisk === "MEDIUM" ? "text-amber-400" : "text-emerald-400"
                        }`}>{aiResult.fraudSentinel?.fraudRisk}</div>
                        <div className="text-[9px] text-slate-500">AI Risk</div>
                      </div>
                      <div>
                        <div className="text-xs font-black text-sky-400">{aiResult.fraudSentinel?.riskScore}/100</div>
                        <div className="text-[9px] text-slate-500">Score</div>
                      </div>
                    </div>
                    <p className="text-[10px] text-white/50 italic leading-relaxed">{aiResult.fraudSentinel?.verdict}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-3 border-t border-slate-800/60 space-y-2">
                  {/* AI Inspect button */}
                  <button
                    onClick={() => handleAISentinelInspect(alert)}
                    disabled={isInspecting || !!aiResult}
                    className="w-full py-2 px-3 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/25 text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isInspecting ? (
                      <><RotateCcw className="h-3 w-3 animate-spin" /> AI Sentinel Analyzing…</>
                    ) : aiResult ? (
                      <><CheckCircle2 className="h-3 w-3 text-emerald-400" /> Sentinel Analysis Complete</>
                    ) : (
                      <><Sparkles className="h-3 w-3" /> Run AI Sentinel Deep-Scan</>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReview(alert._id, "approve")}
                      disabled={processingId === alert._id}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-300 border border-emerald-500/25 text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Clear
                    </button>
                    <button
                      onClick={() => handleReview(alert._id, "quarantine")}
                      disabled={processingId === alert._id}
                      className="flex-1 py-2 px-3 rounded-xl bg-rose-600/15 hover:bg-rose-600/25 text-rose-300 border border-rose-500/25 text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Quarantine
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                    <span>Risk: <strong className={`capitalize ${alert.risk === "high" ? "text-rose-400" : "text-amber-400"}`}>{alert.risk}</strong></span>
                    {alert.returnId?._id && (
                      <Link href={`/returns/${alert.returnId._id}`} className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 font-semibold">
                        Audit Trail <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
