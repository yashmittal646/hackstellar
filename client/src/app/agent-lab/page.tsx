"use client";

import { useState, useRef, useEffect } from "react";
import { runAgentInspect, askCopilot } from "../../lib/api";
import {
  Sparkles,
  Eye,
  ShieldAlert,
  Truck,
  Bot,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  Send,
  RotateCcw,
  ChevronRight,
  Activity,
  Package,
  Star,
  Flame,
  Lock,
  Unlock,
  Copy,
  ClipboardCheck,
} from "lucide-react";

const PRESETS = [
  {
    id: "pristine",
    label: "✨ Pristine Return",
    icon: "✨",
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    payload: {
      productName: "iPhone 15 Pro Max",
      category: "Electronics",
      price: 159900,
      claimedReason: "Changed my mind — unopened, sealed box, never used",
      userId: "demo_user_a",
      pickupCoords: { lat: 28.6139, lng: 77.209 },
      productWeight: 0.5,
    },
  },
  {
    id: "fraud",
    label: "🚨 Fraud Ring",
    icon: "🚨",
    color: "from-red-500 to-rose-600",
    bg: "bg-red-500/10 border-red-500/30",
    payload: {
      productName: "Samsung Galaxy S24 Ultra",
      category: "Electronics",
      price: 129999,
      claimedReason: "Dead on arrival, not charging",
      userId: "fraud_user_suspicious",
      pickupCoords: { lat: 19.076, lng: 72.8777 },
      productWeight: 0.6,
    },
  },
  {
    id: "damaged",
    label: "📦 Damaged Transit",
    icon: "📦",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-500/10 border-amber-500/30",
    payload: {
      productName: "Sony WH-1000XM5 Headphones",
      category: "Electronics",
      price: 29990,
      claimedReason: "Package arrived crushed, headband broken",
      userId: "demo_user_b",
      pickupCoords: { lat: 12.9716, lng: 77.5946 },
      productWeight: 0.3,
    },
  },
  {
    id: "fashion",
    label: "👗 Size Mismatch",
    icon: "👗",
    color: "from-purple-500 to-pink-500",
    bg: "bg-purple-500/10 border-purple-500/30",
    payload: {
      productName: "Zara Premium Blazer",
      category: "Fashion",
      price: 5990,
      claimedReason: "Wrong size ordered, tags intact, never worn",
      userId: "demo_user_c",
      pickupCoords: { lat: 22.5726, lng: 88.3639 },
      productWeight: 0.8,
    },
  },
];

type AgentStep = {
  agent: string;
  step: string;
  thought: string;
  timestamp: string;
};

type DossierResult = {
  visionAgent: any;
  fraudSentinel: any;
  dispatcher: any;
  orchestratorSummary: string;
  unifiedChainOfThought: AgentStep[];
  productName: string;
  category: string;
  price: number;
};

function getGradeColor(grade: string) {
  if (grade === "PRISTINE") return "text-emerald-400";
  if (grade === "LIKE_NEW") return "text-blue-400";
  if (grade === "REFURBISHABLE") return "text-amber-400";
  if (grade === "TAMPERED") return "text-orange-400";
  return "text-red-400";
}

function getRiskColor(risk: string) {
  if (risk === "LOW") return "text-emerald-400 bg-emerald-400/10";
  if (risk === "MEDIUM") return "text-amber-400 bg-amber-400/10";
  return "text-red-400 bg-red-400/10";
}

function AgentCard({
  title,
  icon,
  color,
  children,
  delay = 0,
  visible,
}: {
  title: string;
  icon: React.ReactNode;
  color: string;
  children: React.ReactNode;
  delay?: number;
  visible: boolean;
}) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setShow(true), delay);
      return () => clearTimeout(t);
    } else {
      setShow(false);
    }
  }, [visible, delay]);

  return (
    <div
      className={`rounded-2xl border bg-[#0d1117] p-5 transition-all duration-700 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{ borderColor: "rgba(255,255,255,0.08)" }}
    >
      <div className={`flex items-center gap-3 mb-4`}>
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
          {icon}
        </div>
        <span className="font-semibold text-white">{title}</span>
      </div>
      {children}
    </div>
  );
}

function ChainStep({ step, index, total }: { step: AgentStep; index: number; total: number }) {
  const agentColors: Record<string, string> = {
    MultiAgentOrchestrator: "bg-purple-500",
    VisionQualityAgent: "bg-blue-500",
    FraudSentinelAgent: "bg-red-500",
    LogisticsDispatcherAgent: "bg-emerald-500",
  };
  const color = agentColors[step.agent] || "bg-slate-500";
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${color}`} />
        {index < total - 1 && <div className="w-px flex-1 bg-white/10 mt-1" />}
      </div>
      <div className="pb-4">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${color} bg-opacity-20 text-white/80`}>
            {step.agent}
          </span>
          <span className="text-[10px] text-white/40 font-mono">{step.step}</span>
        </div>
        <p className="text-sm text-white/70 leading-relaxed">{step.thought}</p>
      </div>
    </div>
  );
}

// ─── Sequential Pipeline Animation ─────────────────────────────────────────

const PIPELINE_STEPS = [
  {
    id: "vision",
    name: "VisionQualityAgent",
    label: "Visual Analysis",
    icon: Eye,
    color: "from-blue-500 to-cyan-600",
    textColor: "text-blue-400",
    borderColor: "border-blue-500/40",
    bgColor: "bg-blue-500/10",
    tasks: ["Scanning item surface...", "Detecting defects...", "Grading condition..."],
  },
  {
    id: "fraud",
    name: "FraudSentinelAgent",
    label: "Fraud Detection",
    icon: ShieldAlert,
    color: "from-red-500 to-rose-600",
    textColor: "text-rose-400",
    borderColor: "border-rose-500/40",
    bgColor: "bg-rose-500/10",
    tasks: ["Checking return velocity...", "Serial verification...", "Computing risk score..."],
  },
  {
    id: "dispatch",
    name: "LogisticsDispatcher",
    label: "Route Optimization",
    icon: Truck,
    color: "from-emerald-500 to-teal-600",
    textColor: "text-emerald-400",
    borderColor: "border-emerald-500/40",
    bgColor: "bg-emerald-500/10",
    tasks: ["Finding nearby hubs...", "Matching demand signals...", "Computing optimal route..."],
  },
];

function AgentPipelineAnimation() {
  const [activeStep, setActiveStep] = useState(0);
  const [taskIndex, setTaskIndex] = useState(0);
  const [doneSteps, setDoneSteps] = useState<number[]>([]);

  useEffect(() => {
    // Cycle through tasks within each step
    const taskTimer = setInterval(() => {
      setTaskIndex((prev) => {
        const next = prev + 1;
        const tasksInStep = PIPELINE_STEPS[activeStep]?.tasks.length ?? 3;
        if (next >= tasksInStep) {
          return prev; // hold last task
        }
        return next;
      });
    }, 900);

    // Advance to next step every 3s
    const stepTimer = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < PIPELINE_STEPS.length - 1) {
          setDoneSteps((d) => [...d, prev]);
          setTaskIndex(0);
          return prev + 1;
        }
        return prev;
      });
    }, 2800);

    return () => { clearInterval(taskTimer); clearInterval(stepTimer); };
  }, [activeStep]);

  return (
    <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6 space-y-5">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-violet-400 animate-pulse" />
          <span className="text-sm font-semibold text-white/70">Multi-Agent Pipeline Running</span>
        </div>
        <span className="text-xs text-white/30 font-mono animate-pulse">processing…</span>
      </div>

      {/* Steps */}
      <div className="relative">
        {PIPELINE_STEPS.map((step, i) => {
          const Icon = step.icon;
          const isDone = doneSteps.includes(i);
          const isActive = activeStep === i;
          const isPending = !isDone && !isActive;

          return (
            <div key={step.id} className="relative">
              {/* Connecting line */}
              {i < PIPELINE_STEPS.length - 1 && (
                <div className="absolute left-5 top-14 w-px h-6 z-0">
                  <div
                    className={`w-full h-full transition-all duration-700 ${isDone ? "bg-white/30" : "bg-white/8"}`}
                  />
                </div>
              )}

              <div
                className={`relative z-10 flex items-start gap-4 p-4 rounded-xl border mb-2 transition-all duration-500 ${
                  isActive
                    ? `${step.borderColor} ${step.bgColor} shadow-lg`
                    : isDone
                    ? "border-white/10 bg-white/[0.02]"
                    : "border-white/[0.05] bg-transparent opacity-40"
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    isActive ? "shadow-lg scale-110" : isDone ? "opacity-80" : "opacity-30 grayscale"
                  }`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs font-bold ${isActive ? step.textColor : isDone ? "text-white/60" : "text-white/25"}`}>
                      {step.name}
                    </span>
                    {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    {isActive && (
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${step.bgColor} ${step.textColor} border ${step.borderColor}`}>
                        Active
                      </span>
                    )}
                  </div>
                  <p className={`text-xs transition-all duration-300 ${isActive ? "text-white/60" : isDone ? "text-white/30" : "text-white/15"}`}>
                    {isDone
                      ? "✓ " + step.tasks[step.tasks.length - 1]
                      : isActive
                      ? step.tasks[Math.min(taskIndex, step.tasks.length - 1)]
                      : step.label}
                  </p>
                  {/* Progress dots */}
                  {isActive && (
                    <div className="flex gap-1 mt-2">
                      {step.tasks.map((_, ti) => (
                        <div
                          key={ti}
                          className={`h-1 rounded-full transition-all duration-500 ${
                            ti <= taskIndex ? `${step.bgColor.replace("/10", "/60")} flex-1` : "bg-white/10 w-4"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Step number */}
                <span className={`text-[10px] font-mono flex-shrink-0 ${isActive ? step.textColor : "text-white/20"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Orchestrator summary */}
      <div className="flex items-center gap-2 pt-2 border-t border-white/5">
        <Bot className="w-3.5 h-3.5 text-purple-400" />
        <span className="text-xs text-white/40 font-mono">MultiAgentOrchestrator · synthesizing decisions…</span>
        <span className="ml-auto flex gap-0.5">
          {[0,1,2].map(i => (
            <span
              key={i}
              className="w-1 h-1 rounded-full bg-purple-400 animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}

export default function AgentLabPage() {
  const [running, setRunning] = useState(false);
  const [dossier, setDossier] = useState<DossierResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [customPayload, setCustomPayload] = useState({
    productName: "",
    category: "Electronics",
    price: 0,
    claimedReason: "",
  });
  const [cotReveal, setCotReveal] = useState(0); // how many steps shown
  const [copilotQ, setCopilotQ] = useState("");
  const [copilotA, setCopilotA] = useState<string | null>(null);
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ q: string; a: string }[]>([]);
  const [copied, setCopied] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  function copyDossier() {
    if (!dossier) return;
    const text = [
      `=== OrbitReturn AI Dossier ===`,
      `Product: ${dossier.productName} (${dossier.category}) · ₹${dossier.price?.toLocaleString()}`,
      ``,
      `[Vision Quality Agent]`,
      `  Grade: ${dossier.visionAgent?.qualityGrade}`,
      `  Score: ${dossier.visionAgent?.overallQualityScore}/100`,
      `  Seal: ${dossier.visionAgent?.sealIntegrity?.status}`,
      `  Resaleable: ${dossier.visionAgent?.resaleReadiness ? "Yes" : "No"}`,
      dossier.visionAgent?.detectedDefects?.length > 0
        ? `  Defects: ${dossier.visionAgent.detectedDefects.map((d: any) => d.label).join(", ")}`
        : "",
      ``,
      `[Fraud Sentinel]`,
      `  Risk Level: ${dossier.fraudSentinel?.fraudRisk}`,
      `  Risk Score: ${dossier.fraudSentinel?.riskScore}/100`,
      `  Verdict: ${dossier.fraudSentinel?.verdict}`,
      ``,
      `[Logistics Dispatcher]`,
      `  Decision: ${dossier.dispatcher?.decision}`,
      `  Destination: ${dossier.dispatcher?.assignedDestination?.name}`,
      `  Distance: ${dossier.dispatcher?.assignedDestination?.distanceKm} km`,
      `  Cost Saved: ₹${dossier.dispatcher?.savings?.costSavedINR?.toLocaleString()}`,
      `  CO₂ Avoided: ${dossier.dispatcher?.savings?.co2SavedKg} kg`,
      ``,
      `[AI Summary]`,
      dossier.orchestratorSummary,
      ``,
      `Generated by OrbitReturn · Hackstellar 2026 PS-16`,
    ].filter((l) => l !== undefined).join("\n");

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  async function runPipeline(payload: any, presetId: string) {
    setRunning(true);
    setDossier(null);
    setError(null);
    setCotReveal(0);
    setCopilotA(null);
    setChatHistory([]);
    setActivePreset(presetId);
    try {
      const result = await runAgentInspect(payload);
      setDossier(result);
      // Auto-scroll to results
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      // Animate chain of thought reveal
      let i = 0;
      const cot = result.unifiedChainOfThought || [];
      const interval = setInterval(() => {
        i++;
        setCotReveal(i);
        if (i >= cot.length) clearInterval(interval);
      }, 350);
    } catch (err: any) {
      setError(err.message || "Agent pipeline failed");
    } finally {
      setRunning(false);
    }
  }

  async function handleCopilot(e: React.FormEvent) {
    e.preventDefault();
    if (!copilotQ.trim() || !dossier) return;
    setCopilotLoading(true);
    try {
      const answer = await askCopilot(dossier, copilotQ);
      const entry = { q: copilotQ, a: answer };
      setChatHistory((h) => [...h, entry]);
      setCopilotQ("");
      setTimeout(() => chatRef.current?.scrollTo({ top: 9999, behavior: "smooth" }), 100);
    } catch {
      setChatHistory((h) => [...h, { q: copilotQ, a: "Agent unavailable. Try again." }]);
    } finally {
      setCopilotLoading(false);
    }
  }

  const cot = dossier?.unifiedChainOfThought || [];
  const shownSteps = cot.slice(0, cotReveal);

  return (
    <div className="min-h-screen bg-[#060a0f] text-white">
      {/* Header */}
      <div className="border-b border-white/5 bg-[#060a0f]/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Agent Lab</h1>
              <p className="text-xs text-white/40">Multi-Agent Autonomous Return Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/50">3 Agents Online</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Preset buttons */}
        <div>
          <p className="text-sm text-white/50 mb-3 font-medium uppercase tracking-wider">1-Click Demo Scenarios</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => runPipeline(p.payload, p.id)}
                disabled={running}
                className={`relative rounded-2xl border p-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${p.bg} ${
                  activePreset === p.id ? "ring-2 ring-white/30" : ""
                }`}
              >
                <div className={`text-2xl mb-2`}>{p.icon}</div>
                <div className="font-semibold text-sm text-white">{p.label}</div>
                <div
                  className={`absolute top-3 right-3 w-6 h-6 rounded-full bg-gradient-to-br ${p.color} flex items-center justify-center`}
                >
                  <Zap className="w-3 h-3 text-white" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom run */}
        <div className="rounded-2xl border border-white/8 bg-[#0d1117] p-5">
          <p className="text-sm text-white/50 mb-4 font-medium uppercase tracking-wider">Or Run Custom Inspection</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              className="col-span-1 md:col-span-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/60"
              placeholder="Product name (e.g. MacBook Air M3)"
              value={customPayload.productName}
              onChange={(e) => setCustomPayload((p) => ({ ...p, productName: e.target.value }))}
            />
            <select
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/60"
              value={customPayload.category}
              onChange={(e) => setCustomPayload((p) => ({ ...p, category: e.target.value }))}
            >
              {["Electronics", "Fashion", "Home & Kitchen", "Beauty", "Sports", "Books"].map((c) => (
                <option key={c} value={c} className="bg-[#0d1117]">
                  {c}
                </option>
              ))}
            </select>
            <input
              type="number"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/60"
              placeholder="Price (₹)"
              value={customPayload.price || ""}
              onChange={(e) => setCustomPayload((p) => ({ ...p, price: Number(e.target.value) }))}
            />
            <textarea
              className="col-span-1 md:col-span-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/60 resize-none"
              rows={2}
              placeholder="Return reason (describe it naturally — the AI agents will evaluate it)"
              value={customPayload.claimedReason}
              onChange={(e) => setCustomPayload((p) => ({ ...p, claimedReason: e.target.value }))}
            />
            <button
              onClick={() => {
                if (!customPayload.productName || !customPayload.claimedReason) return;
                runPipeline(customPayload, "custom");
              }}
              disabled={running || !customPayload.productName || !customPayload.claimedReason}
              className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl px-6 py-2.5 text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Inspect
            </button>
          </div>
        </div>

        {/* Running animation — sequential agent activation */}
        {running && <AgentPipelineAnimation />}

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-red-400 text-sm flex items-center gap-2">
            <XCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Results */}
        {dossier && !running && (
          <div ref={resultsRef} className="space-y-6">
            {/* Summary banner — with animated score ring */}
            <div className="rounded-2xl border border-white/8 bg-gradient-to-r from-[#0d1117] via-[#111827] to-[#0d1117] p-6">
              <div className="flex items-start gap-6 flex-wrap">
                {/* SVG Score Ring */}
                {(() => {
                  const score = dossier.visionAgent?.overallQualityScore ?? 0;
                  const grade = dossier.visionAgent?.qualityGrade ?? "";
                  const r = 36, cx = 44, cy = 44, strokeW = 7;
                  const circ = 2 * Math.PI * r;
                  const fill = (score / 100) * circ;
                  const gradeGrad: Record<string, string> = {
                    PRISTINE: "#10b981", LIKE_NEW: "#3b82f6",
                    REFURBISHABLE: "#f59e0b", TAMPERED: "#f97316", DEFECTIVE: "#ef4444",
                  };
                  const color = gradeGrad[grade] ?? "#6366f1";
                  return (
                    <svg width={88} height={88} viewBox="0 0 88 88" className="shrink-0">
                      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeW} />
                      <circle
                        cx={cx} cy={cy} r={r}
                        fill="none" stroke={color} strokeWidth={strokeW}
                        strokeDasharray={`${fill} ${circ}`}
                        strokeDashoffset={circ / 4}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dasharray 1s ease" }}
                        transform={`rotate(-90 ${cx} ${cy})`}
                      />
                      <text x={cx} y={cy - 4} textAnchor="middle" fill="white" fontSize="18" fontWeight="800">{score}</text>
                      <text x={cx} y={cy + 10} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8">/100</text>
                    </svg>
                  );
                })()}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-semibold text-emerald-400">Inspection Complete</span>
                    <span className={`ml-2 text-xs font-black px-2 py-0.5 rounded-full ${getGradeColor(dossier.visionAgent?.qualityGrade)} bg-white/5`}>
                      {dossier.visionAgent?.qualityGrade}
                    </span>
                    {/* Copy Dossier button */}
                    <button
                      onClick={copyDossier}
                      className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                        copied
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                          : "bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/20"
                      }`}
                    >
                      {copied ? (
                        <><ClipboardCheck className="w-3.5 h-3.5" /> Copied!</>
                      ) : (
                        <><Copy className="w-3.5 h-3.5" /> Copy Dossier</>
                      )}
                    </button>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-1">{dossier.productName}</h2>
                  <p className="text-sm text-white/60 leading-relaxed">{dossier.orchestratorSummary}</p>
                  {/* Quick savings strip */}
                  <div className="flex flex-wrap gap-4 mt-3 text-xs">
                    <span className="text-emerald-400 font-semibold">
                      ₹{dossier.dispatcher?.savings?.costSavedINR?.toLocaleString() ?? 0} saved
                    </span>
                    <span className="text-teal-400 font-semibold">
                      {dossier.dispatcher?.savings?.co2SavedKg ?? 0} kg CO₂ avoided
                    </span>
                    <span className="text-indigo-400 font-semibold">
                      → {dossier.dispatcher?.assignedDestination?.name?.split(" ").slice(0, 3).join(" ")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 agent cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Vision Agent */}
              <AgentCard
                title="Vision Quality Agent"
                icon={<Eye className="w-4 h-4 text-white" />}
                color="from-blue-500 to-cyan-600"
                delay={0}
                visible={!!dossier}
              >
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Quality Grade</span>
                    <span className={`font-bold ${getGradeColor(dossier.visionAgent.qualityGrade)}`}>
                      {dossier.visionAgent.qualityGrade}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Overall Score</span>
                    <span className="text-white font-semibold">{dossier.visionAgent.overallQualityScore}/100</span>
                  </div>
                  {/* Animated score bar */}
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-1000"
                      style={{ width: `${dossier.visionAgent.overallQualityScore}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Packaging</span>
                    <span className="text-white font-semibold">{dossier.visionAgent.packagingScore}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Seal Status</span>
                    <span
                      className={`flex items-center gap-1 font-semibold ${
                        dossier.visionAgent.sealIntegrity?.status === "INTACT"
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {dossier.visionAgent.sealIntegrity?.status === "INTACT" ? (
                        <Lock className="w-3 h-3" />
                      ) : (
                        <Unlock className="w-3 h-3" />
                      )}
                      {dossier.visionAgent.sealIntegrity?.status}
                    </span>
                  </div>
                  {dossier.visionAgent.detectedDefects?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <p className="text-xs text-white/40 mb-2">Detected Defects</p>
                      <div className="flex flex-wrap gap-1.5">
                        {dossier.visionAgent.detectedDefects.map((d: any, i: number) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20"
                          >
                            {d.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Resaleable</span>
                    <span className={dossier.visionAgent.resaleReadiness ? "text-emerald-400" : "text-red-400"}>
                      {dossier.visionAgent.resaleReadiness ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </AgentCard>

              {/* Fraud Sentinel */}
              <AgentCard
                title="Fraud Sentinel"
                icon={<ShieldAlert className="w-4 h-4 text-white" />}
                color="from-red-500 to-rose-600"
                delay={300}
                visible={!!dossier}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/50">Fraud Risk</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getRiskColor(dossier.fraudSentinel.fraudRisk)}`}>
                      {dossier.fraudSentinel.fraudRisk}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Risk Score</span>
                    <span className="text-white font-semibold">{dossier.fraudSentinel.riskScore}/100</span>
                  </div>
                  {/* Animated risk bar — higher score = more red */}
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        dossier.fraudSentinel.riskScore > 60
                          ? "bg-gradient-to-r from-orange-500 to-red-500"
                          : dossier.fraudSentinel.riskScore > 30
                          ? "bg-gradient-to-r from-yellow-500 to-amber-500"
                          : "bg-gradient-to-r from-emerald-500 to-teal-400"
                      }`}
                      style={{ width: `${dossier.fraudSentinel.riskScore}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Verdict</span>
                    <span className="text-white text-xs font-medium">{dossier.fraudSentinel.verdict}</span>
                  </div>
                  {dossier.fraudSentinel.flags?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <p className="text-xs text-white/40 mb-2">Active Flags</p>
                      <div className="space-y-1.5">
                        {dossier.fraudSentinel.flags.map((f: any, i: number) => (
                          <div key={i} className="flex items-center gap-2">
                            <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" />
                            <span className="text-xs text-white/70">{f.description || f.code}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </AgentCard>

              {/* Logistics Dispatcher */}
              <AgentCard
                title="Logistics Dispatcher"
                icon={<Truck className="w-4 h-4 text-white" />}
                color="from-emerald-500 to-teal-600"
                delay={600}
                visible={!!dossier}
              >
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Decision</span>
                    <span className="text-white font-bold text-xs">{dossier.dispatcher.decision}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Destination</span>
                    <span className="text-white text-xs">{dossier.dispatcher.assignedDestination?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Distance</span>
                    <span className="text-white font-semibold">{dossier.dispatcher.assignedDestination?.distanceKm} km</span>
                  </div>
                  {/* Routing confidence bar */}
                  {dossier.dispatcher.routingScore != null && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/50">Routing Score</span>
                        <span className="text-emerald-400 font-semibold">{Math.round(dossier.dispatcher.routingScore * 100)}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000"
                          style={{ width: `${Math.round(dossier.dispatcher.routingScore * 100)}%` }}
                        />
                      </div>
                    </>
                  )}
                  <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/15 p-2.5 text-center">
                      <div className="text-emerald-400 font-bold text-sm">
                        ₹{dossier.dispatcher.savings?.costSavedINR?.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-white/40">Cost Saved</div>
                    </div>
                    <div className="rounded-xl bg-blue-500/5 border border-blue-500/15 p-2.5 text-center">
                      <div className="text-blue-400 font-bold text-sm">
                        {dossier.dispatcher.savings?.co2SavedKg} kg
                      </div>
                      <div className="text-[10px] text-white/40">CO₂ Avoided</div>
                    </div>
                  </div>
                </div>
              </AgentCard>
            </div>

            {/* Chain of Thought */}
            <div className="rounded-2xl border border-white/8 bg-[#0d1117] p-5">
              <div className="flex items-center gap-2 mb-5">
                <Bot className="w-4 h-4 text-violet-400" />
                <span className="font-semibold text-white text-sm">Chain of Thought</span>
                <span className="ml-auto text-xs text-white/30 font-mono">{shownSteps.length}/{cot.length} steps</span>
              </div>
              <div className="max-h-72 overflow-y-auto pr-1 space-y-0">
                {shownSteps.map((step, i) => (
                  <ChainStep key={i} step={step} index={i} total={shownSteps.length} />
                ))}
                {cotReveal < cot.length && (
                  <div className="text-xs text-white/30 animate-pulse pl-5">processing...</div>
                )}
              </div>
            </div>

            {/* AI Copilot */}
            <div className="rounded-2xl border border-white/8 bg-[#0d1117] p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span className="font-semibold text-white text-sm">AI Copilot</span>
                <span className="text-xs text-white/30 ml-1">— Ask anything about this inspection</span>
              </div>

              {/* Quick questions */}
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  "Why was it routed to this destination?",
                  "Is it safe for peer resale?",
                  "What defects were found?",
                  "Explain the fraud risk",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => setCopilotQ(q)}
                    className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-violet-500/50 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Chat history */}
              {chatHistory.length > 0 && (
                <div
                  ref={chatRef}
                  className="max-h-52 overflow-y-auto space-y-3 mb-4 pr-1"
                >
                  {chatHistory.map((entry, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[9px] text-white/70">U</span>
                        </div>
                        <p className="text-sm text-white/70 italic">{entry.q}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Sparkles className="w-2.5 h-2.5 text-white" />
                        </div>
                        <p className="text-sm text-white/90 leading-relaxed">{entry.a}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleCopilot} className="flex gap-2">
                <input
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/60"
                  placeholder="Ask the AI about this return decision…"
                  value={copilotQ}
                  onChange={(e) => setCopilotQ(e.target.value)}
                  disabled={copilotLoading}
                />
                <button
                  type="submit"
                  disabled={!copilotQ.trim() || copilotLoading}
                  className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 disabled:opacity-40 rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm font-semibold text-white transition-all"
                >
                  {copilotLoading ? (
                    <RotateCcw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!dossier && !running && (
          <div className="rounded-2xl border border-dashed border-white/10 p-12 flex flex-col items-center gap-6 text-center">
            {/* Animated 3-agent icons */}
            <div className="flex items-center gap-4">
              {[
                { icon: Eye, color: "from-blue-500 to-cyan-600", label: "Vision" },
                { icon: ShieldAlert, color: "from-red-500 to-rose-600", label: "Fraud" },
                { icon: Truck, color: "from-emerald-500 to-teal-600", label: "Logistics" },
              ].map((agent, i) => {
                const Icon = agent.icon;
                return (
                  <div key={agent.label} className="flex flex-col items-center gap-2">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${agent.color} flex items-center justify-center opacity-30`}
                      style={{ animationDelay: `${i * 0.3}s` }}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-[10px] text-white/20 font-semibold uppercase tracking-widest">{agent.label}</span>
                  </div>
                );
              })}
            </div>
            <div>
              <p className="text-white/40 font-semibold text-base">3 AI Agents Standing By</p>
              <p className="text-white/25 text-sm mt-1">Click a scenario above to trigger the autonomous pipeline</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => runPipeline(p.payload, p.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border ${p.bg} text-white/60 hover:text-white transition-colors`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

