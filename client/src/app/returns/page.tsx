"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ReturnItem } from "../../types";
import { fetchAllReturns, processReturnRouting, runAgentInspect } from "../../lib/api";
import { ReturnCard } from "../../components/ReturnCard";
import {
  RotateCcw,
  Filter,
  Search,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Zap,
  Eye,
  ShieldAlert,
  Truck,
  AlertTriangle,
  X,
  TrendingUp,
  Percent,
  Star,
} from "lucide-react";

type BatchResult = { returnId: string; product: string; grade: string; risk: string; decision: string };

export default function ReturnsFleetPage() {
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  // Batch AI state
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchTotal, setBatchTotal] = useState(0);
  const [batchResults, setBatchResults] = useState<BatchResult[]>([]);
  const [batchDone, setBatchDone] = useState(false);
  const [batchError, setBatchError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAllReturns();
      setReturns(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleProcess = async (id: string) => {
    try {
      await processReturnRouting(id);
      loadData();
    } catch {
      alert("Error routing return");
    }
  };

  // Batch AI pipeline on unrouted returns
  const handleBatchAI = async () => {
    const unrouted = returns.filter((r) => !r.routingDestination);
    if (unrouted.length === 0) {
      alert("No unrouted returns found — all returns already have a destination.");
      return;
    }
    setBatchRunning(true);
    setBatchDone(false);
    setBatchResults([]);
    setBatchError(null);
    setBatchProgress(0);
    setBatchTotal(unrouted.length);

    const results: BatchResult[] = [];

    for (let i = 0; i < unrouted.length; i++) {
      const r = unrouted[i];
      try {
        const product = r.productId as any;
        const dossier = await runAgentInspect({
          productName: product?.name || "Product",
          category: product?.category || "Electronics",
          price: product?.price || 0,
          claimedReason: r.reason || "Changed mind",
          userId: (r.userId as any)?._id?.toString() || "demo_user",
          pickupCoords: r.pickupAddress?.coordinates || { lat: 28.6139, lng: 77.209 },
          productWeight: product?.weight || 0.5,
        });
        results.push({
          returnId: r.returnId,
          product: product?.name || "Product",
          grade: dossier.visionAgent?.qualityGrade || "—",
          risk: dossier.fraudSentinel?.fraudRisk || "—",
          decision: dossier.dispatcher?.decision || "—",
        });
      } catch {
        results.push({ returnId: r.returnId, product: (r.productId as any)?.name || "Product", grade: "ERROR", risk: "ERROR", decision: "ERROR" });
      }
      setBatchProgress(i + 1);
      setBatchResults([...results]);
    }

    setBatchRunning(false);
    setBatchDone(true);
  };

  const unroutedCount = returns.filter((r) => !r.routingDestination).length;

  const filteredReturns = returns.filter((r) => {
    if (filter === "direct" && r.routingDestination !== "direct_to_customer") return false;
    if (filter === "hub" && r.routingDestination !== "nearby_hub") return false;
    if (filter === "warehouse" && r.routingDestination !== "central_warehouse") return false;
    if (filter === "fraud" && r.fraudRisk !== "high") return false;
    if (filter === "unrouted" && r.routingDestination) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.returnId?.toLowerCase().includes(q) ||
        (r.productId as any)?.name?.toLowerCase().includes(q) ||
        r.userId?.name?.toLowerCase().includes(q) ||
        r.pickupAddress?.city?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const gradeColor = (g: string) => {
    if (g === "PRISTINE") return "text-emerald-400";
    if (g === "LIKE_NEW") return "text-blue-400";
    if (g === "REFURBISHABLE") return "text-amber-400";
    if (g === "ERROR") return "text-red-400";
    return "text-orange-400";
  };
  const riskColor = (r: string) => {
    if (r === "LOW") return "text-emerald-400";
    if (r === "MEDIUM") return "text-amber-400";
    return "text-red-400";
  };
  const decisionIcon = (d: string) => {
    if (d === "DIRECT_TO_PEER") return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
    if (d === "REGIONAL_HUB_STAGING") return <Truck className="w-3.5 h-3.5 text-blue-400" />;
    return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
  };

  // Compute live stats
  const routedCount = returns.filter((r) => r.routingDestination).length;
  const routedPct = returns.length > 0 ? Math.round((routedCount / returns.length) * 100) : 0;
  const peerCount = returns.filter((r) => r.routingDestination === "direct_to_customer").length;
  const highRiskCount = returns.filter((r) => r.fraudRisk === "high").length;
  const totalSaved = returns.reduce((acc, r) => acc + (r.costSaved || 0), 0);
  const avgScore = returns.length > 0
    ? Math.round(returns.reduce((acc, r) => acc + (r.conditionScore || 0), 0) / returns.length)
    : 0;

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Returns Fleet</h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            {returns.length} total returns · {unroutedCount} awaiting AI routing
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Batch AI Button */}
          <button
            onClick={handleBatchAI}
            disabled={batchRunning || unroutedCount === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg shadow-violet-500/25 transition-all"
          >
            {batchRunning ? (
              <>
                <RotateCcw className="h-3.5 w-3.5 animate-spin" />
                AI Analyzing {batchProgress}/{batchTotal}…
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Run AI on All Pending ({unroutedCount})
              </>
            )}
          </button>

          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Live Stats Bar */}
      {!loading && returns.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Routed", value: `${routedPct}%`, sub: `${routedCount}/${returns.length}`, color: "text-emerald-400", border: "border-emerald-500/20 bg-emerald-500/5" },
            { label: "Direct Peer", value: peerCount, sub: "intercepts", color: "text-violet-400", border: "border-violet-500/20 bg-violet-500/5" },
            { label: "High Risk", value: highRiskCount, sub: "flagged", color: "text-red-400", border: "border-red-500/20 bg-red-500/5" },
            { label: "Cost Saved", value: `₹${(totalSaved / 1000).toFixed(1)}k`, sub: "total", color: "text-teal-400", border: "border-teal-500/20 bg-teal-500/5" },
            { label: "Avg Score", value: avgScore > 0 ? `${avgScore}/100` : "—", sub: "condition", color: "text-amber-400", border: "border-amber-500/20 bg-amber-500/5" },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl border p-3.5 ${s.border}`}>
              <div className={`text-lg font-black ${s.color}`}>{s.value}</div>
              <div className="text-[11px] text-slate-400 font-semibold">{s.label}</div>
              <div className="text-[10px] text-slate-600">{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Batch Progress Bar */}
      {batchRunning && (
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
              <span className="text-sm font-semibold text-white">Running AI agents on {batchTotal} unrouted returns…</span>
            </div>
            <span className="text-sm font-bold text-violet-400">{batchProgress}/{batchTotal}</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${(batchProgress / batchTotal) * 100}%` }}
            />
          </div>
          {batchResults.length > 0 && (
            <div className="mt-3 text-xs text-white/50 flex items-center gap-2">
              <span className="text-emerald-400">✓ Last:</span>
              <span>{batchResults[batchResults.length - 1].product}</span>
              <span className={gradeColor(batchResults[batchResults.length - 1].grade)}>{batchResults[batchResults.length - 1].grade}</span>
            </div>
          )}
        </div>
      )}

      {/* Batch Results Table */}
      {batchDone && batchResults.length > 0 && (
        <div className="rounded-2xl border border-white/8 bg-[#0d1117] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-white text-sm">Batch Analysis Complete — {batchResults.length} returns inspected</span>
            </div>
            <button onClick={() => setBatchDone(false)} className="text-white/30 hover:text-white/70">
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* Quick summary strip */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              {
                label: "Pristine / Like New",
                value: batchResults.filter((r) => ["PRISTINE", "LIKE_NEW"].includes(r.grade)).length,
                color: "text-emerald-400", border: "border-emerald-500/20 bg-emerald-500/5",
              },
              {
                label: "High Fraud Risk",
                value: batchResults.filter((r) => r.risk === "HIGH").length,
                color: "text-red-400", border: "border-red-500/20 bg-red-500/5",
              },
              {
                label: "Direct Peer Routes",
                value: batchResults.filter((r) => r.decision === "DIRECT_TO_PEER").length,
                color: "text-violet-400", border: "border-violet-500/20 bg-violet-500/5",
              },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl border p-2.5 text-center ${s.border}`}>
                <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left pb-2 text-white/40 font-semibold">Return ID</th>
                  <th className="text-left pb-2 text-white/40 font-semibold">Product</th>
                  <th className="text-left pb-2 text-white/40 font-semibold">
                    <div className="flex items-center gap-1"><Eye className="w-3 h-3" /> Grade</div>
                  </th>
                  <th className="text-left pb-2 text-white/40 font-semibold">
                    <div className="flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Risk</div>
                  </th>
                  <th className="text-left pb-2 text-white/40 font-semibold">
                    <div className="flex items-center gap-1"><Truck className="w-3 h-3" /> Decision</div>
                  </th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {batchResults.map((r, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 font-mono text-white/60">{r.returnId}</td>
                    <td className="py-2.5 text-white/80 max-w-[120px] truncate">{r.product}</td>
                    <td className={`py-2.5 font-semibold ${gradeColor(r.grade)}`}>{r.grade}</td>
                    <td className={`py-2.5 font-semibold ${riskColor(r.risk)}`}>{r.risk}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-1.5">
                        {decisionIcon(r.decision)}
                        <span className="text-white/60 text-[10px]">{r.decision.replace(/_/g, " ")}</span>
                      </div>
                    </td>
                    <td className="py-2.5">
                      <Link href={`/returns/${r.returnId}`} className="text-violet-400 hover:text-violet-300 text-[10px]">View →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, product, customer or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: "all", label: "All" },
            { id: "unrouted", label: `Unrouted (${unroutedCount})` },
            { id: "direct", label: "Direct Peer" },
            { id: "hub", label: "Hub Staged" },
            { id: "warehouse", label: "Warehouse" },
            { id: "fraud", label: "⚠ High Risk" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === tab.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Returns Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
      ) : filteredReturns.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 text-slate-400 text-sm">
          No returns found matching the current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReturns.map((item) => (
            <ReturnCard key={item._id} item={item} onProcess={handleProcess} />
          ))}
        </div>
      )}
    </div>
  );
}
