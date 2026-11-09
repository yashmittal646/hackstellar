"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchPendingOrders, runAgentInspect } from "../../../lib/api";
import { Order } from "../../../types";
import {
  Sparkles,
  Eye,
  ShieldAlert,
  Truck,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Package,
  Zap,
  Lock,
  Unlock,
  AlertTriangle,
  Bot,
  ChevronDown,
} from "lucide-react";

type AgentStep = { agent: string; step: string; thought: string; timestamp: string };

const QUICK_REASONS = [
  { label: "Changed my mind", value: "Changed my mind — item is unopened, sealed box, never used" },
  { label: "Wrong size/fit", value: "Wrong size ordered, tags intact, never worn or used" },
  { label: "Damaged in transit", value: "Package arrived damaged, dented box, item is broken" },
  { label: "Not as described", value: "Product looks different from listing photos" },
  { label: "Defective product", value: "Product is not working, dead on arrival, missing parts" },
];

function getGradeColor(grade: string) {
  if (grade === "PRISTINE") return "text-emerald-400";
  if (grade === "LIKE_NEW") return "text-blue-400";
  if (grade === "REFURBISHABLE") return "text-amber-400";
  if (grade === "TAMPERED") return "text-orange-400";
  return "text-red-400";
}

function getRiskBadge(risk: string) {
  if (risk === "LOW") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/25";
  if (risk === "MEDIUM") return "bg-amber-500/15 text-amber-400 border-amber-500/25";
  return "bg-red-500/15 text-red-400 border-red-500/25";
}

export default function NewReturnPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reason, setReason] = useState("");
  const [running, setRunning] = useState(false);
  const [dossier, setDossier] = useState<any>(null);
  const [cotReveal, setCotReveal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentAgentIdx, setCurrentAgentIdx] = useState(0);

  const AGENTS = ["VisionQualityAgent", "FraudSentinel", "LogisticsDispatcher"];

  useEffect(() => {
    fetchPendingOrders()
      .then((ords) => {
        setOrders(ords);
        if (ords.length > 0) setSelectedOrder(ords[0]);
      })
      .finally(() => setLoadingOrders(false));
  }, []);

  async function submitReturn() {
    if (!selectedOrder || !reason.trim()) return;
    setRunning(true);
    setDossier(null);
    setError(null);
    setCotReveal(0);
    setCurrentAgentIdx(0);

    // Simulate agent progression animation
    let agentTimer = 0;
    const agentInterval = setInterval(() => {
      agentTimer++;
      setCurrentAgentIdx(Math.min(agentTimer, AGENTS.length - 1));
    }, 1200);

    try {
      const product = typeof selectedOrder.productId === "object" ? (selectedOrder.productId as any) : null;
      const productName = product?.name || "Product";
      const category = product?.category || "Electronics";
      const price = product?.price || selectedOrder.totalAmount || 0;
      const result = await runAgentInspect({
        productName,
        category,
        price,
        claimedReason: reason,
        userId: (selectedOrder.userId as any)?._id?.toString() || selectedOrder.userId?.toString() || "demo_user",
        pickupCoords: { lat: 28.6139, lng: 77.209 },
        productWeight: 0.5,
      });
      clearInterval(agentInterval);
      setDossier(result);
      let i = 0;
      const cot = result.unifiedChainOfThought || [];
      const cotInterval = setInterval(() => {
        i++;
        setCotReveal(i);
        if (i >= cot.length) clearInterval(cotInterval);
      }, 300);
    } catch (err: any) {
      clearInterval(agentInterval);
      setError(err.message || "Agent pipeline failed");
    } finally {
      setRunning(false);
    }
  }

  const cot: AgentStep[] = dossier?.unifiedChainOfThought || [];

  return (
    <div className="min-h-screen bg-[#060a0f] text-white">
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-sm text-white/40 mb-2">
            <span
              className="hover:text-white/70 cursor-pointer"
              onClick={() => router.push("/returns")}
            >
              Returns
            </span>
            <ChevronDown className="w-3 h-3 -rotate-90" />
            <span>New Return</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Initiate Return</h1>
          <p className="text-white/40 text-sm mt-1">
            Our AI agents will automatically inspect quality, detect fraud, and find the optimal route.
          </p>
        </div>

        {/* AI Pipeline Explainer */}
        {!dossier && !running && (
          <div className="rounded-2xl border border-violet-500/15 bg-gradient-to-r from-violet-950/30 to-purple-950/20 p-4 flex items-center gap-4">
            <div className="flex items-center gap-2 flex-shrink-0">
              {[
                { icon: Eye, color: "text-blue-400", bg: "bg-blue-500/15", label: "Vision" },
                { icon: ShieldAlert, color: "text-red-400", bg: "bg-red-500/15", label: "Fraud" },
                { icon: Truck, color: "text-emerald-400", bg: "bg-emerald-500/15", label: "Route" },
              ].map((a, i) => {
                const AIcon = a.icon;
                return (
                  <div key={a.label} className="flex items-center gap-1">
                    <div className={`w-8 h-8 rounded-xl ${a.bg} flex items-center justify-center`}>
                      <AIcon className={`w-4 h-4 ${a.color}`} />
                    </div>
                    {i < 2 && <div className="w-3 h-px bg-white/15" />}
                  </div>
                );
              })}
            </div>
            <div>
              <p className="text-xs font-semibold text-white/70">3-Agent Autonomous Pipeline</p>
              <p className="text-[11px] text-white/35 mt-0.5">
                VisionQualityAgent grades condition → FraudSentinel scores risk → LogisticsDispatcher finds optimal route
              </p>
            </div>
          </div>
        )}

        {/* Step 1: Select Order */}
        {!dossier && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/8 bg-[#0d1117] p-5">
              <label className="block text-sm font-semibold text-white mb-3">
                <Package className="w-4 h-4 inline mr-1.5 text-white/50" />
                Select Order to Return
              </label>
              {loadingOrders ? (
                <div className="h-12 bg-white/5 rounded-xl animate-pulse" />
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {orders.map((o) => (
                    <div
                      key={o._id}
                      onClick={() => setSelectedOrder(o)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all hover:border-white/20 ${
                        selectedOrder?._id === o._id
                          ? "border-violet-500/50 bg-violet-500/5"
                          : "border-white/8 bg-white/2"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            selectedOrder?._id === o._id ? "bg-violet-500/20" : "bg-white/5"
                          }`}
                        >
                          <Package className="w-4 h-4 text-white/60" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{(o.productId as any)?.name || o.orderId}</p>
                          <p className="text-xs text-white/40">
                            {(o.productId as any)?.category || "Product"} · ₹{((o.productId as any)?.price || o.totalAmount)?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {selectedOrder?._id === o._id && (
                        <CheckCircle2 className="w-4 h-4 text-violet-400" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Step 2: Reason */}
            <div className="rounded-2xl border border-white/8 bg-[#0d1117] p-5">
              <label className="block text-sm font-semibold text-white mb-3">Return Reason</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {QUICK_REASONS.map((r) => (
                  <button
                    key={r.label}
                    onClick={() => setReason(r.value)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      reason === r.value
                        ? "bg-violet-500/20 border-violet-500/50 text-white"
                        : "bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              <textarea
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/60 resize-none"
                rows={3}
                placeholder="Describe the return reason (or click a quick reason above)…"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={submitReturn}
              disabled={running || !selectedOrder || !reason.trim()}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl py-4 text-base font-bold text-white flex items-center justify-center gap-3 transition-all"
            >
              {running ? (
                <>
                  <RotateCcw className="w-5 h-5 animate-spin" />
                  Agents Analyzing…
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Analyze with AI Agents
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Running: agent pipeline animation */}
        {running && (
          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-8">
            <p className="text-center text-white/60 text-sm mb-6">
              Running 3-agent autonomous pipeline for{" "}
              <span className="text-white font-semibold">{(selectedOrder?.productId as any)?.name || selectedOrder?.orderId}</span>
            </p>
            <div className="flex items-center justify-center gap-2">
              {AGENTS.map((name, i) => {
                const icons = [
                  <Eye key="eye" className="w-5 h-5" />,
                  <ShieldAlert key="shield" className="w-5 h-5" />,
                  <Truck key="truck" className="w-5 h-5" />,
                ];
                const colors = ["text-blue-400", "text-red-400", "text-emerald-400"];
                const bgColors = ["bg-blue-500/20", "bg-red-500/20", "bg-emerald-500/20"];
                const done = i < currentAgentIdx;
                const active = i === currentAgentIdx;
                return (
                  <div key={name} className="flex items-center gap-2">
                    <div
                      className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-500 ${
                        done
                          ? "bg-emerald-500/20 border-emerald-500/30 scale-90"
                          : active
                          ? `${bgColors[i]} border-white/20 scale-110 shadow-lg`
                          : "bg-white/5 border-white/10 scale-90 opacity-40"
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <div className={`${colors[i]} ${active ? "animate-pulse" : ""}`}>{icons[i]}</div>
                      )}
                    </div>
                    {i < AGENTS.length - 1 && (
                      <div
                        className={`w-8 h-px transition-colors duration-500 ${done ? "bg-emerald-500/50" : "bg-white/10"}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="text-center mt-4 text-xs text-white/40">
              {AGENTS[currentAgentIdx]} running…
            </div>
          </div>
        )}

        {/* Results */}
        {dossier && !running && (
          <div className="space-y-5">
            {/* Summary */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="font-semibold text-emerald-400">Analysis Complete</span>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">{dossier.orchestratorSummary}</p>
            </div>

            {/* Score cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/8 bg-[#0d1117] p-4 text-center">
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center mx-auto mb-2">
                  <Eye className="w-4 h-4 text-blue-400" />
                </div>
                <div className={`text-xl font-black ${getGradeColor(dossier.visionAgent?.qualityGrade)}`}>
                  {dossier.visionAgent?.qualityGrade}
                </div>
                <div className="text-xs text-white/40 mt-0.5">Quality Grade</div>
                <div className="text-sm font-semibold text-white/70 mt-1">
                  {dossier.visionAgent?.overallQualityScore}/100
                </div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-[#0d1117] p-4 text-center">
                <div className="w-8 h-8 rounded-xl bg-red-500/15 flex items-center justify-center mx-auto mb-2">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                </div>
                <div
                  className={`text-xl font-black px-2 py-0.5 rounded-lg inline-block border ${getRiskBadge(
                    dossier.fraudSentinel?.fraudRisk
                  )}`}
                >
                  {dossier.fraudSentinel?.fraudRisk}
                </div>
                <div className="text-xs text-white/40 mt-1.5">Fraud Risk</div>
                <div className="text-sm font-semibold text-white/70 mt-1">
                  Score: {dossier.fraudSentinel?.riskScore}/100
                </div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-[#0d1117] p-4 text-center">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center mx-auto mb-2">
                  <Truck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-sm font-black text-white leading-tight">
                  {dossier.dispatcher?.assignedDestination?.name?.split(" ").slice(0, 2).join(" ")}
                </div>
                <div className="text-xs text-white/40 mt-0.5">Routed To</div>
                <div className="text-sm font-semibold text-emerald-400 mt-1">
                  ₹{dossier.dispatcher?.savings?.costSavedINR?.toLocaleString()} saved
                </div>
              </div>
            </div>

            {/* Seal + defects */}
            <div className="rounded-2xl border border-white/8 bg-[#0d1117] p-4 flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                {dossier.visionAgent?.sealIntegrity?.status === "INTACT" ? (
                  <Lock className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Unlock className="w-4 h-4 text-red-400" />
                )}
                <span className="text-sm text-white/70">
                  Seal:{" "}
                  <span
                    className={
                      dossier.visionAgent?.sealIntegrity?.status === "INTACT"
                        ? "text-emerald-400 font-semibold"
                        : "text-red-400 font-semibold"
                    }
                  >
                    {dossier.visionAgent?.sealIntegrity?.status}
                  </span>
                </span>
              </div>
              {dossier.visionAgent?.detectedDefects?.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  {dossier.visionAgent.detectedDefects.map((d: any, i: number) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    >
                      {d.label}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-1 ml-auto">
                <Bot className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-xs text-white/40">AI Analyzed</span>
              </div>
            </div>

            {/* Chain of Thought */}
            {cotReveal > 0 && (
              <div className="rounded-2xl border border-white/8 bg-[#0d1117] p-4">
                <p className="text-xs text-white/40 font-medium uppercase tracking-wider mb-3">
                  Agent Reasoning Chain
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {cot.slice(0, cotReveal).map((s, i) => {
                    const colors: Record<string, string> = {
                      MultiAgentOrchestrator: "bg-purple-500",
                      VisionQualityAgent: "bg-blue-500",
                      FraudSentinelAgent: "bg-red-500",
                      LogisticsDispatcherAgent: "bg-emerald-500",
                    };
                    return (
                      <div key={i} className="flex gap-2 text-xs">
                        <div
                          className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                            colors[s.agent] || "bg-slate-500"
                          }`}
                        />
                        <p className="text-white/60 leading-relaxed">{s.thought}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDossier(null);
                  setReason("");
                  setCotReveal(0);
                  setCurrentAgentIdx(0);
                }}
                className="flex-1 rounded-2xl border border-white/10 py-3.5 text-sm font-semibold text-white/70 hover:text-white hover:border-white/20 transition-colors"
              >
                New Return
              </button>
              <button
                onClick={() => router.push("/returns")}
                className="flex-1 rounded-2xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 py-3.5 text-sm font-bold text-white flex items-center justify-center gap-2 transition-all"
              >
                <Package className="w-4 h-4" />
                View Fleet
              </button>
              <button
                onClick={() => router.push("/agent-lab")}
                className="flex-1 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 py-3.5 text-sm font-bold text-white flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Full Agent Lab
              </button>
            </div>

            {/* Savings summary banner */}
            <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-4 flex flex-wrap items-center justify-center gap-6 text-center">
              <div>
                <div className="text-xl font-black text-emerald-400">₹{dossier.dispatcher?.savings?.costSavedINR?.toLocaleString() || 0}</div>
                <div className="text-[11px] text-white/40 mt-0.5">Cost Saved</div>
              </div>
              <div className="text-white/20">|</div>
              <div>
                <div className="text-xl font-black text-teal-400">{dossier.dispatcher?.savings?.co2SavedKg || 0} kg</div>
                <div className="text-[11px] text-white/40 mt-0.5">CO₂ Avoided</div>
              </div>
              <div className="text-white/20">|</div>
              <div>
                <div className="text-xl font-black text-indigo-400">{dossier.dispatcher?.savings?.distanceAvoidedKm || 0} km</div>
                <div className="text-[11px] text-white/40 mt-0.5">Distance Saved</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
