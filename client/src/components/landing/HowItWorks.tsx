"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "../../hooks/useInView";
import { 
  ScanLine, 
  Eye, 
  ShieldAlert, 
  Truck, 
  ArrowRight, 
  CheckCircle2, 
  Cpu, 
  GitBranch, 
  Activity, 
  Sparkles 
} from "lucide-react";

const PIPELINE_NODES = [
  {
    step: "01",
    tag: "EDGE TELEMETRY",
    title: "Pickup & Doorstep Ingest",
    desc: "Delivery executive scans return barcode via carrier app. High-resolution package metadata and spatial coordinates are transmitted directly to the OrbitReturn event pipeline.",
    telemetry: {
      input: "Barcode #ORB-8839",
      latency: "42 ms",
      payload: "GeoJSON Point [19.0760, 72.8777]",
      status: "Edge Ingested",
    },
    icon: ScanLine,
  },
  {
    step: "02",
    tag: "COMPUTER VISION",
    title: "VisionQualityAgent",
    desc: "Autonomous vision model analyzes product packaging, factory seals, and cosmetic integrity. Evaluates quality against 5 strict tiers: Pristine, Like New, Refurbishable, Tampered, or Defective.",
    telemetry: {
      input: "Optic Surface Stream",
      latency: "185 ms",
      payload: "Grade: PRISTINE (Score: 97/100)",
      status: "Resale Certified",
    },
    icon: Eye,
  },
  {
    step: "03",
    tag: "RISK INTELLIGENCE",
    title: "FraudSentinel Analysis",
    desc: "Synthesizes customer return velocity, weight telemetry, serial number cross-referencing, and fraud cluster signatures to prevent item swapping or counterfeit exploitation.",
    telemetry: {
      input: "Behavioral Vector",
      latency: "68 ms",
      payload: "Fraud Risk: 0.04 (LOW)",
      status: "Clearance Granted",
    },
    icon: ShieldAlert,
  },
  {
    step: "04",
    tag: "AUTONOMOUS LOGISTICS",
    title: "LogisticsDispatcher",
    desc: "Executes multi-factor optimization (Proximity 30%, Margin 25%, Quality 20%, Demand 15%, Risk 10%). Matches directly to a pending customer order or stages in a local micro-hub.",
    telemetry: {
      input: "2dsphere Spatial Index",
      latency: "45 ms",
      payload: "Destination: Order #ORD-9201 (3.2 km)",
      status: "Direct Peer Dispatch",
    },
    icon: Truck,
  },
];

export function HowItWorks() {
  const [ref, inView] = useInView(0.15);
  const [activeIdx, setActiveIdx] = useState(0);
  const activeNode = PIPELINE_NODES[activeIdx];
  const ActiveIcon = activeNode.icon;

  return (
    <section ref={ref} className="relative py-28 border-b border-white/[0.06] bg-[#07090e]">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            Autonomous Decision Pipeline
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            How OrbitReturn Reroutes in Under 400 Milliseconds.
          </h2>
          <p className="text-neutral-400 text-base sm:text-lg mt-3 leading-relaxed">
            Four specialized services coordinate in a deterministic DAG pipeline. No manual triage docks. No delayed reconciliation.
          </p>
        </div>

        {/* 4 Pipeline Stages Selector */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {PIPELINE_NODES.map((node, idx) => {
            const Icon = node.icon;
            const isSelected = activeIdx === idx;
            return (
              <button
                key={node.step}
                onClick={() => setActiveIdx(idx)}
                className={`text-left p-5 rounded-2xl border transition-all relative overflow-hidden group ${
                  isSelected
                    ? "bg-[#0e131d] border-cyan-500/50 shadow-[0_0_24px_rgba(0,240,255,0.1)]"
                    : "bg-[#0a0d14] border-white/[0.06] hover:border-white/[0.14]"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 to-emerald-400" />
                )}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs text-neutral-400 font-bold">STAGE {node.step}</span>
                  <div className={`p-2 rounded-lg ${isSelected ? "bg-cyan-500/20 text-cyan-300" : "bg-neutral-800 text-neutral-400"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-mono text-[10px] text-cyan-400/90 uppercase tracking-widest">{node.tag}</div>
                <div className="font-bold text-white text-base mt-1">{node.title}</div>
              </button>
            );
          })}
        </div>

        {/* Active Node Detail Interactive Console */}
        <motion.div
          key={activeNode.step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6 sm:p-8 rounded-2xl bg-[#0b0e16] border border-white/[0.08] shadow-2xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Description & Overview */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <ActiveIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-mono text-xs text-neutral-400 uppercase tracking-wider">PIPELINE STAGE {activeNode.step} // {activeNode.tag}</div>
                  <h3 className="text-2xl font-bold text-white">{activeNode.title}</h3>
                </div>
              </div>
              <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
                {activeNode.desc}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-neutral-400">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  Deterministic Execution
                </span>
                <span className="text-neutral-600">·</span>
                <span>Audit trail logged to MongoDB</span>
                <span className="text-neutral-600">·</span>
                <span>Zero human intervention</span>
              </div>
            </div>

            {/* Live Telemetry Output Box */}
            <div className="lg:col-span-5 p-5 rounded-xl bg-[#07090e] border border-white/[0.08] font-mono text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] text-neutral-400">
                <span>STAGE_OUTPUT_TELEMETRY</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  200 OK
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">INPUT SIGNAL</span>
                <span className="text-white font-semibold">{activeNode.telemetry.input}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">EXECUTION TIME</span>
                <span className="text-cyan-400 font-semibold">{activeNode.telemetry.latency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">STATE RESOLUTION</span>
                <span className="text-white font-semibold">{activeNode.telemetry.payload}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/[0.06]">
                <span className="text-neutral-400">OUTPUT STATUS</span>
                <span className="text-emerald-400 font-bold">{activeNode.telemetry.status}</span>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
