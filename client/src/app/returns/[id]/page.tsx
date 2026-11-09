"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchReturnById, processReturnRouting, runAgentInspect, askCopilot } from "../../../lib/api";
import { ShippingLabelModal } from "../../../components/ShippingLabelModal";
import { ReturnItem } from "../../../types";
import { formatCurrency } from "../../../lib/utils";
import {
  ArrowLeft,
  MapPin,
  Truck,
  Sparkles,
  Clock,
  Leaf,
  TrendingUp,
  ShieldAlert,
  CheckCircle2,
  Warehouse,
  Printer,
  Eye,
  Bot,
  RotateCcw,
  Send,
  Lock,
  Unlock,
  AlertTriangle,
  Zap,
  X,
} from "lucide-react";

type AgentStep = { agent: string; step: string; thought: string; timestamp: string };

function getGradeColor(grade: string) {
  if (grade === "PRISTINE") return "text-emerald-400";
  if (grade === "LIKE_NEW") return "text-blue-400";
  if (grade === "REFURBISHABLE") return "text-amber-400";
  if (grade === "TAMPERED") return "text-orange-400";
  return "text-red-400";
}

function getRiskColor(risk: string) {
  if (risk === "LOW") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/25";
  if (risk === "MEDIUM") return "text-amber-400 bg-amber-500/10 border-amber-500/25";
  return "text-red-400 bg-red-500/10 border-red-500/25";
}

export default function ReturnDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [returnDoc, setReturnDoc] = useState<ReturnItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [routingInProgress, setRoutingInProgress] = useState(false);
  const [isLabelOpen, setIsLabelOpen] = useState(false);

  // AI Agent panel
  const [agentPanelOpen, setAgentPanelOpen] = useState(false);
  const [agentRunning, setAgentRunning] = useState(false);
  const [dossier, setDossier] = useState<any>(null);
  const [cotReveal, setCotReveal] = useState(0);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [currentAgentIdx, setCurrentAgentIdx] = useState(0);

  // Copilot
  const [copilotQ, setCopilotQ] = useState("");
  const [chatHistory, setChatHistory] = useState<{ q: string; a: string }[]>([]);
  const [copilotLoading, setCopilotLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const AGENTS = ["VisionQualityAgent", "FraudSentinel", "LogisticsDispatcher"];

  const loadData = async () => {
    try {
      if (!id) return;
      const data = await fetchReturnById(id);
      setReturnDoc(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const handleRouteNow = async () => {
    if (!id) return;
    setRoutingInProgress(true);
    try {
      await processReturnRouting(id);
      loadData();
    } catch {
      alert("Error routing return");
    } finally {
      setRoutingInProgress(false);
    }
  };

  const handleRunAgentAnalysis = async () => {
    if (!returnDoc) return;
    setAgentPanelOpen(true);
    setAgentRunning(true);
    setDossier(null);
    setAgentError(null);
    setCotReveal(0);
    setCurrentAgentIdx(0);
    setChatHistory([]);

    const agentTimer = { v: 0 };
    const agentInterval = setInterval(() => {
      agentTimer.v++;
      setCurrentAgentIdx(Math.min(agentTimer.v, AGENTS.length - 1));
    }, 1000);

    try {
      const product = returnDoc.productId as any;
      const result = await runAgentInspect({
        productName: product?.name || "Product",
        category: product?.category || "Electronics",
        price: product?.price || 0,
        claimedReason: returnDoc.reason || "Changed mind",
        userId: (returnDoc.userId as any)?._id?.toString() || "demo_user",
        pickupCoords: returnDoc.pickupAddress?.coordinates || { lat: 28.6139, lng: 77.209 },
        productWeight: product?.weight || 0.5,
      });
      clearInterval(agentInterval);
      setDossier(result);
      let i = 0;
      const cot = result.unifiedChainOfThought || [];
      const cotI = setInterval(() => { i++; setCotReveal(i); if (i >= cot.length) clearInterval(cotI); }, 300);
    } catch (err: any) {
      clearInterval(agentInterval);
      setAgentError(err.message || "Agent pipeline failed");
    } finally {
      setAgentRunning(false);
    }
  };

  const handleCopilot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotQ.trim() || !dossier) return;
    setCopilotLoading(true);
    const q = copilotQ;
    setCopilotQ("");
    try {
      const answer = await askCopilot(dossier, q);
      setChatHistory((h) => [...h, { q, a: answer }]);
      setTimeout(() => chatRef.current?.scrollTo({ top: 9999, behavior: "smooth" }), 100);
    } catch {
      setChatHistory((h) => [...h, { q, a: "Agent unavailable. Try again." }]);
    } finally {
      setCopilotLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (!returnDoc) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12 text-center">
        <p className="text-slate-400">Return record not found.</p>
        <button onClick={() => router.push("/returns")} className="mt-4 px-4 py-2 bg-slate-800 rounded-xl text-xs font-semibold text-white">
          Back to fleet
        </button>
      </div>
    );
  }

  const reasoning = returnDoc.routingReasoning || {
    conditionFactor: 0.8, demandFactor: 0.7, fraudFactor: 0.9, proximityFactor: 0.85, timeSavingsFactor: 0.6,
  };
  const cot: AgentStep[] = dossier?.unifiedChainOfThought || [];

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
      <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-indigo-400">{returnDoc.returnId}</span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {returnDoc.status.replace(/_/g, " ")}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">{(returnDoc.productId as any)?.name || "Product"}</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Customer: <strong className="text-slate-200">{returnDoc.userId?.name}</strong> ({returnDoc.pickupAddress?.city})
          </p>
          <p className="text-xs text-slate-500 mt-1 italic">"{returnDoc.reason}"</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* AI Re-Analyze button */}
          <button
            onClick={handleRunAgentAnalysis}
            disabled={agentRunning}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-violet-500/25 transition-all"
          >
            {agentRunning ? <RotateCcw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {agentRunning ? "AI Analyzing…" : "Re-Analyze with AI"}
          </button>

          {returnDoc.routingDestination && (
            <button
              onClick={() => setIsLabelOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
            >
              <Printer className="h-4 w-4" /> Print Waybill
            </button>
          )}

          {!returnDoc.routingDestination && (
            <button
              onClick={handleRouteNow}
              disabled={routingInProgress}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 text-white text-xs font-bold shadow-lg disabled:opacity-50"
            >
              <Zap className="h-4 w-4" />
              {routingInProgress ? "Routing…" : "Run Routing Engine"}
            </button>
          )}
        </div>
      </div>

      {/* AI Agent Results Panel */}
      {agentPanelOpen && (
        <div className="rounded-3xl border border-violet-500/20 bg-[#0d0a1a] p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-white text-sm">AI Agent Deep Inspection</span>
              {agentRunning && <span className="text-xs text-violet-400 animate-pulse">Running…</span>}
              {dossier && <span className="text-xs text-emerald-400">✓ Complete</span>}
            </div>
            <button onClick={() => setAgentPanelOpen(false)} className="text-white/30 hover:text-white/70 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Agent animation */}
          {agentRunning && (
            <div className="flex items-center gap-3 py-2">
              {AGENTS.map((name, i) => {
                const icons = [<Eye key="e" className="w-4 h-4" />, <ShieldAlert key="s" className="w-4 h-4" />, <Truck key="t" className="w-4 h-4" />];
                const cols = ["text-blue-400", "text-red-400", "text-emerald-400"];
                const bgs = ["bg-blue-500/20", "bg-red-500/20", "bg-emerald-500/20"];
                const done = i < currentAgentIdx;
                const active = i === currentAgentIdx;
                return (
                  <div key={name} className="flex items-center gap-2">
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${done ? "bg-emerald-500/15 border-emerald-500/25" : active ? `${bgs[i]} border-white/15 shadow-md` : "bg-white/5 border-white/8 opacity-40"}`}>
                      {done ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <div className={`${cols[i]} ${active ? "animate-pulse" : ""}`}>{icons[i]}</div>}
                    </div>
                    {i < 2 && <div className={`w-6 h-px ${done ? "bg-emerald-500/50" : "bg-white/10"}`} />}
                  </div>
                );
              })}
              <span className="text-xs text-white/40 ml-1">{AGENTS[currentAgentIdx]}…</span>
            </div>
          )}

          {agentError && <p className="text-red-400 text-xs bg-red-500/10 rounded-xl px-4 py-3">{agentError}</p>}

          {dossier && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15">
                <p className="text-sm text-white/70 leading-relaxed">{dossier.orchestratorSummary}</p>
              </div>

              {/* 3 mini agent cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Eye className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[10px] text-white/50 font-semibold">Vision Agent</span>
                  </div>
                  <div className={`text-lg font-black ${getGradeColor(dossier.visionAgent?.qualityGrade)}`}>{dossier.visionAgent?.qualityGrade}</div>
                  <div className="text-xs text-white/50">{dossier.visionAgent?.overallQualityScore}/100</div>
                  <div className="flex items-center gap-1 mt-1.5">
                    {dossier.visionAgent?.sealIntegrity?.status === "INTACT" ? <Lock className="w-3 h-3 text-emerald-400" /> : <Unlock className="w-3 h-3 text-red-400" />}
                    <span className="text-[10px] text-white/40">{dossier.visionAgent?.sealIntegrity?.status}</span>
                  </div>
                  {dossier.visionAgent?.detectedDefects?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {dossier.visionAgent.detectedDefects.slice(0, 2).map((d: any, i: number) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">{d.label}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-[10px] text-white/50 font-semibold">Fraud Sentinel</span>
                  </div>
                  <div className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full border ${getRiskColor(dossier.fraudSentinel?.fraudRisk)}`}>{dossier.fraudSentinel?.fraudRisk}</div>
                  <div className="text-xs text-white/50 mt-1">{dossier.fraudSentinel?.riskScore}/100</div>
                  <div className="text-[10px] text-white/40 mt-1 leading-tight">{dossier.fraudSentinel?.verdict}</div>
                  {dossier.fraudSentinel?.flags?.length > 0 && (
                    <div className="mt-1.5 space-y-0.5">
                      {dossier.fraudSentinel.flags.slice(0, 2).map((f: any, i: number) => (
                        <div key={i} className="flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5 text-amber-400 flex-shrink-0" />
                          <span className="text-[9px] text-white/50">{f.code}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Truck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10px] text-white/50 font-semibold">Dispatcher</span>
                  </div>
                  <div className="text-[10px] font-bold text-white leading-tight">{dossier.dispatcher?.decision}</div>
                  <div className="text-[10px] text-white/40 mt-1 leading-tight">{dossier.dispatcher?.assignedDestination?.name}</div>
                  <div className="text-xs font-semibold text-emerald-400 mt-2">₹{dossier.dispatcher?.savings?.costSavedINR?.toLocaleString()} saved</div>
                  <div className="text-[10px] text-blue-400">{dossier.dispatcher?.savings?.co2SavedKg} kg CO₂</div>
                </div>
              </div>

              {/* Chain of thought */}
              {cotReveal > 0 && (
                <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-3">Agent Reasoning Chain</p>
                  <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                    {cot.slice(0, cotReveal).map((s, i) => {
                      const cols: Record<string, string> = { MultiAgentOrchestrator: "bg-purple-500", VisionQualityAgent: "bg-blue-500", FraudSentinelAgent: "bg-red-500", LogisticsDispatcherAgent: "bg-emerald-500" };
                      return (
                        <div key={i} className="flex gap-2 text-xs">
                          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${cols[s.agent] || "bg-slate-500"}`} />
                          <p className="text-white/60 leading-relaxed">{s.thought}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Copilot chat */}
              <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Bot className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-xs font-semibold text-white">Ask AI about this return</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {["Why this route?", "Is it resaleable?", "Explain fraud score"].map((q) => (
                    <button key={q} onClick={() => setCopilotQ(q)} className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-violet-500/50 transition-colors">
                      {q}
                    </button>
                  ))}
                </div>
                {chatHistory.length > 0 && (
                  <div ref={chatRef} className="max-h-32 overflow-y-auto space-y-2.5 mb-3 pr-1">
                    {chatHistory.map((entry, i) => (
                      <div key={i} className="space-y-1">
                        <p className="text-xs text-white/50 italic">"{entry.q}"</p>
                        <p className="text-xs text-white/80 leading-relaxed">{entry.a}</p>
                      </div>
                    ))}
                  </div>
                )}
                <form onSubmit={handleCopilot} className="flex gap-2">
                  <input
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-violet-500/60"
                    placeholder="Ask about quality, routing, fraud…"
                    value={copilotQ}
                    onChange={(e) => setCopilotQ(e.target.value)}
                    disabled={copilotLoading}
                  />
                  <button type="submit" disabled={!copilotQ.trim() || copilotLoading} className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 rounded-lg px-3 py-2 transition-colors">
                    {copilotLoading ? <RotateCcw className="w-3.5 h-3.5 text-white animate-spin" /> : <Send className="w-3.5 h-3.5 text-white" />}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Metrics Banner */}
      {returnDoc.routingDestination && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Cost Saved</span>
            <div className="text-xl font-black text-emerald-400 mt-0.5">{formatCurrency(returnDoc.costSaved)}</div>
            <span className="text-[10px] text-slate-400">vs Warehouse transport</span>
          </div>
          <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">CO₂ Offset</span>
            <div className="text-xl font-black text-teal-400 mt-0.5">{returnDoc.co2Saved} kg</div>
            <span className="text-[10px] text-slate-400">Green rerouting saving</span>
          </div>
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Hours Saved</span>
            <div className="text-xl font-black text-amber-400 mt-0.5">{returnDoc.timeSaved}h</div>
            <span className="text-[10px] text-slate-400">Turnaround acceleration</span>
          </div>
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Distance Saved</span>
            <div className="text-xl font-black text-indigo-400 mt-0.5">{Math.max(0, returnDoc.originalDistance - returnDoc.optimizedDistance)} km</div>
            <span className="text-[10px] text-slate-400">{returnDoc.originalDistance}km → {returnDoc.optimizedDistance}km</span>
          </div>
        </div>
      )}

      {/* Decision Engine Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Explainable AI Factors */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" /> Multi-Factor Routing Score
            </h3>
            <span className="font-mono text-xs font-bold text-emerald-400">Score: {returnDoc.routingScore.toFixed(1)} / 100</span>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { label: "Product Condition Factor", weight: "25%", value: reasoning.conditionFactor, color: "bg-emerald-500", glow: "shadow-emerald-500/30" },
              { label: "Nearby Local Demand", weight: "30%", value: reasoning.demandFactor, color: "bg-indigo-500", glow: "shadow-indigo-500/30" },
              { label: "Fraud Safety Inversion", weight: "20%", value: reasoning.fraudFactor, color: "bg-teal-500", glow: "shadow-teal-500/30" },
              { label: "Geographic Proximity", weight: "15%", value: reasoning.proximityFactor, color: "bg-sky-500", glow: "shadow-sky-500/30" },
              { label: "Time & Speed Optimization", weight: "10%", value: reasoning.timeSavingsFactor, color: "bg-amber-500", glow: "shadow-amber-500/30" },
            ].map((f) => {
              const pct = Math.round(f.value * 100);
              const scoreColor = pct >= 80 ? "text-emerald-400" : pct >= 55 ? "text-amber-400" : "text-red-400";
              return (
                <div key={f.label}>
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-300 font-medium">{f.label}</span>
                      <span className="text-slate-600 font-mono text-[10px]">({f.weight})</span>
                    </div>
                    <span className={`font-mono font-bold ${scoreColor}`}>{pct}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-800/80 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${f.color} shadow-lg ${f.glow}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 mt-2">
            Destination:{" "}
            <strong className="text-white capitalize">
              {returnDoc.routingDestination ? returnDoc.routingDestination.replace(/_/g, " ") : "Pending computation"}
            </strong>
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-400" /> Dynamic Journey Tracking
          </h3>
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {returnDoc.timeline?.map((step, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-6 top-0.5 h-4 w-4 rounded-full border-2 border-slate-900 bg-indigo-500" />
                <div className="text-xs font-bold text-white capitalize">{step.status.replace(/_/g, " ")}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{step.notes || "Status logged"}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {new Date(step.timestamp).toLocaleDateString()} {new Date(step.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ShippingLabelModal item={returnDoc} isOpen={isLabelOpen} onClose={() => setIsLabelOpen(false)} />
    </div>
  );
}
