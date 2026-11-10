"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Eye,
  ShieldAlert,
  Truck,
  Compass,
  Navigation,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Zap,
  Play,
  LayoutDashboard,
  RotateCcw,
  ChevronRight,
} from "lucide-react";

const DEMO_STEPS = [
  {
    id: 1,
    title: "Dashboard — Live AI Engine",
    desc: "Start here. See real-time agent activity feed cycling across 10 AI decisions. 6 animated KPI cards show live impact metrics with count-up animations. The ROI Calculator projects enterprise savings in real time.",
    href: "/",
    icon: LayoutDashboard,
    color: "from-indigo-500 to-blue-600",
    badge: "Start Here",
    highlight: "Watch the Live Agent Activity feed — it auto-updates every 8 seconds.",
    actions: ["Slide the ROI Calculator to 10,000 returns/day", "Watch KPI counters animate on load", "Click 'Simulate Return' to try a new one"],
  },
  {
    id: 2,
    title: "Agent Lab — 1-Click Autonomous Pipeline",
    desc: "The core demo. Click a preset scenario and watch 3 AI agents (Vision, Fraud, Logistics) analyze the return in parallel. See explainable AI reasoning in the chain-of-thought. Use the Copilot to ask questions.",
    href: "/agent-lab",
    icon: Sparkles,
    color: "from-violet-500 to-purple-700",
    badge: "⭐ Key Feature",
    highlight: "Click '🚨 Fraud Ring' — watch FraudSentinel flag it with 88/100 risk score.",
    actions: [
      "Try '✨ Pristine Return' — see DIRECT PEER routing decision",
      "Try '🚨 Fraud Ring' — see HIGH risk quarantine",
      "Ask Copilot: 'Why was it routed here?'",
      "Click 'Copy Dossier' to show judge the AI output",
    ],
  },
  {
    id: 3,
    title: "New Return — Smart Submission Flow",
    desc: "Simulates an e-commerce customer initiating a return. The 3-agent pipeline runs automatically. No manual routing needed — AI decides everything.",
    href: "/returns/new",
    icon: RotateCcw,
    color: "from-emerald-500 to-teal-600",
    badge: "Live Demo",
    highlight: "Select any order, pick a reason, hit Analyze — watch the pipeline run.",
    actions: [
      "Select an order from the dropdown",
      "Click 'Wrong size/fit' quick reason",
      "Hit 'Analyze with AI Agents'",
      "See savings summary: cost, CO₂, distance",
    ],
  },
  {
    id: 4,
    title: "Live Interception Map",
    desc: "MongoDB 2dsphere geospatial indexing powers real-time intercept visualization across Indian metro corridors. Returns appear as colored pins — green = hub, blue = pickup, orange = peer intercept.",
    href: "/map",
    icon: Compass,
    color: "from-sky-500 to-cyan-600",
    badge: "Geo Intelligence",
    highlight: "Each color-coded pin represents a different routing decision by the AI.",
    actions: [
      "Zoom into Delhi NCR — see the hub network",
      "Click any return pin to see routing details",
      "Notice how returns avoid the central warehouse",
    ],
  },
  {
    id: 5,
    title: "Returns Fleet — Batch AI Analysis",
    desc: "See all active returns in one place. Click 'Run AI on All Pending' to trigger batch processing — multiple agents analyze every unrouted return in parallel. Watch results populate live.",
    href: "/returns",
    icon: Truck,
    color: "from-indigo-500 to-violet-600",
    badge: "Batch Processing",
    highlight: "Every card shows condition mini-bar + routing score ring from AI analysis.",
    actions: [
      "Click 'Run AI on All Pending'",
      "Watch batch progress bar fill up",
      "See summary: Pristine count, fraud count, peer routes",
    ],
  },
  {
    id: 6,
    title: "Fraud Radar — Real-Time Threat Detection",
    desc: "FraudSentinel AI flags suspicious returns using behavioral pattern analysis. Each alert card shows fraud confidence bar, triggered anomaly flags, and allows 1-click quarantine or clearance.",
    href: "/fraud",
    icon: ShieldAlert,
    color: "from-rose-500 to-red-600",
    badge: "AI Threat Intel",
    highlight: "Click 'Run AI Sentinel Deep-Scan' on a HIGH risk alert for full AI verdict.",
    actions: [
      "Find a HIGH risk alert card",
      "Read the anomaly flags",
      "Click 'Run AI Sentinel Deep-Scan'",
      "Then 'Quarantine' to simulate action",
    ],
  },
  {
    id: 7,
    title: "Driver App — Last-Mile Rerouting",
    desc: "Simulates what a Delhivery/Shadowfax delivery executive sees at a customer's doorstep. Scan → 3-2-1 countdown → AI intercept alert → redirect to peer customer. Full courier workflow simulation.",
    href: "/carrier",
    icon: Navigation,
    color: "from-amber-500 to-orange-500",
    badge: "Field Operations",
    highlight: "The 3-2-1 countdown scan is dramatic — AI returns routing decision in <2 seconds.",
    actions: [
      "Select a return from the manifest",
      "Click 'Scan Package Barcode'",
      "Watch the AI countdown: 3-2-1 → Analyzing...",
      "Confirm the hand-off when rerouted",
    ],
  },
  {
    id: 8,
    title: "Impact Report — Judge Takeaway",
    desc: "One-page summary of everything OrbitReturn has achieved. Animated KPIs, routing donut chart, tech stack table, and top returns table. Click 'Export PDF' so the judge can take it away.",
    href: "/impact",
    icon: TrendingUp,
    color: "from-violet-500 to-indigo-600",
    badge: "Judge Summary",
    highlight: "Click '🖨️ Export PDF' to give judges a physical copy of the impact report.",
    actions: [
      "Show the 4 KPI stats at the top",
      "Walk through the tech stack table",
      "Click 'Export PDF' for judges",
    ],
  },
];

export default function DemoPage() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
          <Play className="h-3.5 w-3.5" /> Judge Demo Guide — Hackstellar 2026
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight">
          OrbitReturn Demo Walkthrough
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm leading-relaxed">
          8-step guided tour of the system. Click any step to expand and see exactly what to show judges.
          Each step has a <strong className="text-white">highlight moment</strong> and suggested talking points.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/agent-lab"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 text-white text-sm font-bold shadow-lg shadow-violet-500/25 hover:scale-105 transition-all"
          >
            <Sparkles className="h-4 w-4" /> Open Agent Lab (Best First Impression)
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-sm font-semibold hover:bg-slate-700 transition-all"
          >
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
        </div>
      </div>

      {/* Timeline Steps */}
      <div className="space-y-3">
        {DEMO_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isOpen = activeStep === step.id;
          return (
            <div
              key={step.id}
              className={`rounded-2xl border transition-all duration-300 cursor-pointer ${
                isOpen
                  ? "border-white/15 bg-slate-900/80 shadow-xl"
                  : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
              }`}
              onClick={() => setActiveStep(isOpen ? null : step.id)}
            >
              {/* Step Header */}
              <div className="flex items-center gap-4 p-5">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Step {step.id}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {step.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{step.title}</h3>
                  {!isOpen && (
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{step.desc.split(".")[0]}.</p>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Link
                    href={step.href}
                    onClick={(e) => e.stopPropagation()}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r ${step.color} text-white hover:opacity-90 transition-all shadow-md`}
                  >
                    Open <ArrowRight className="h-3 w-3" />
                  </Link>
                  <ChevronRight
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                  />
                </div>
              </div>

              {/* Expanded Content */}
              {isOpen && (
                <div className="px-5 pb-5 pt-0 space-y-4">
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>

                  {/* Highlight box */}
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-300 mb-0.5">⭐ Highlight Moment</p>
                      <p className="text-xs text-amber-200/70">{step.highlight}</p>
                    </div>
                  </div>

                  {/* Actions checklist */}
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">What to Show Judges</p>
                    <div className="space-y-1.5">
                      {step.actions.map((action, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick links footer */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Quick Jump — All Pages</p>
        <div className="flex flex-wrap gap-2">
          {DEMO_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <Link
                key={step.id}
                href={step.href}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
              >
                <Icon className="w-3.5 h-3.5" />
                {step.title.split(" — ")[0]}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

