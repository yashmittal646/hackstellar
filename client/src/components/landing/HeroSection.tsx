"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { StarField } from "../StarField";
import { AuroraBackground } from "../AuroraBackground";
import {
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Activity,
  CheckCircle2,
  Terminal,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
} from "lucide-react";

interface Stats {
  totalReturns: number;
  savings: { totalCostSaved: number; totalCo2Saved: number };
  routingBreakdown: Record<string, number>;
}

export function HeroSection() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/dashboard/stats")
      .then((r) => r.json())
      .then((d) => setStats(d.data || d))
      .catch(() => {});
  }, []);

  const totalReturns = stats?.totalReturns ?? 21;
  const totalCost = stats?.savings?.totalCostSaved != null ? Math.round(stats.savings.totalCostSaved) : 26896;
  const totalCo2 = stats?.savings?.totalCo2Saved != null ? Math.round(stats.savings.totalCo2Saved * 10) / 10 : 197.8;

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-center overflow-hidden pt-12 pb-20 border-b border-white/[0.06]">
      {/* Dynamic ambient canvas & telemetry grid */}
      <StarField />
      <AuroraBackground />

      <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Editorial Content */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-7 space-y-7"
          >
            {/* System Status Monospace Pill */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 relative">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
              </span>
              <span className="font-mono text-xs uppercase tracking-wider text-neutral-300">
                ORBIT-RETURN ENGINE // PS-16 PRODUCTION SPEC
              </span>
            </div>

            {/* Core Headline */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.06]">
                Reverse Logistics,{" "}
                <br />
                <span className="cyan-gradient font-extrabold">Intercepted at the Edge.</span>
              </h1>
              <p className="text-base sm:text-lg text-neutral-400 max-w-xl font-normal leading-relaxed pt-1">
                An autonomous multi-agent intelligence layer that inspects condition, stops refund fraud, and recalculates point-to-point delivery routes before items ever reach a warehouse.
              </p>
            </div>

            {/* Live Operational Metrics Ledger */}
            <div className="grid grid-cols-3 gap-3 max-w-lg pt-1">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm">
                <div className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider">Processed</div>
                <div className="text-2xl font-bold text-white mt-0.5">{totalReturns}</div>
                <div className="text-[11px] text-emerald-400 font-medium">100% Autonomous</div>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm">
                <div className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider">Capital Saved</div>
                <div className="text-2xl font-bold text-cyan-300 mt-0.5">₹{totalCost.toLocaleString()}</div>
                <div className="text-[11px] text-neutral-400 font-medium">₹1,280 / item avg</div>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm">
                <div className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider">CO₂ Diverted</div>
                <div className="text-2xl font-bold text-emerald-300 mt-0.5">{totalCo2} kg</div>
                <div className="text-[11px] text-neutral-400 font-medium">Zero-haul return</div>
              </div>
            </div>

            {/* High-Contrast Action Triggers */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                href="/agent-lab"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-neutral-950 font-semibold text-sm hover:bg-neutral-100 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_16px_rgba(255,255,255,0.15)] group"
              >
                <Zap className="w-4 h-4 text-neutral-950 fill-neutral-950" />
                <span>Simulate Agent Pipeline</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-neutral-200 border border-white/[0.1] font-medium text-sm transition-all backdrop-blur-sm"
              >
                <Play className="w-3.5 h-3.5 text-neutral-400 fill-neutral-400" />
                <span>Interactive Demo Guide</span>
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-3 text-neutral-400 hover:text-white text-sm font-medium transition-colors"
              >
                <span>Live Fleet Console</span>
                <span className="text-neutral-600 font-mono">→</span>
              </Link>
            </div>

            {/* Micro Tech Protocol Badges */}
            <div className="pt-2 flex items-center gap-6 text-xs text-neutral-400 font-mono">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>VISION INFERENCE 300MS</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>DYNAMIC FRAUD QUARANTINE</span>
              </div>
            </div>
          </motion.div>

          {/* Right Precision Telemetry Console */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-5"
          >
            <div className="relative">
              {/* Subtle back ambient glow */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-transparent to-emerald-500/10 blur-xl opacity-50 pointer-events-none" />

              {/* Console Chassis */}
              <div className="relative rounded-2xl bg-[#0b0e14] border border-white/[0.1] shadow-2xl overflow-hidden">
                {/* Header Bar */}
                <div className="px-4 py-3 bg-[#0e121a] border-b border-white/[0.08] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-neutral-700 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-neutral-700 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-neutral-700 inline-block" />
                    <span className="ml-2 font-mono text-[11px] text-neutral-400 uppercase tracking-widest">
                      TELEMETRY_HUD // INGEST_QUEUE
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <Activity className="w-3 h-3 animate-pulse" />
                    STREAM: ACTIVE
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-4">
                  {/* Item Telemetry Bar */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <div>
                      <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">RETURN MANIFEST #ORB-8839</div>
                      <div className="font-semibold text-white text-sm mt-0.5">Apple iPhone 15 Pro Max</div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">Origin: Bandra West, Mumbai → Buyer In Transit</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-mono text-neutral-400 uppercase">QUALITY GRADE</div>
                      <div className="text-emerald-400 font-mono font-bold text-sm mt-0.5">PRISTINE · 97.4%</div>
                      <div className="text-[10px] text-neutral-400">Resale Ready</div>
                    </div>
                  </div>

                  {/* Laser Scanning Visualizer */}
                  <div className="relative h-28 rounded-xl bg-[#07090d] border border-white/[0.06] overflow-hidden flex items-center justify-center">
                    {/* Laser sweep line */}
                    <div className="laser-beam" />
                    {/* Grid texture inside viewport */}
                    <div className="absolute inset-0 tech-grid opacity-20 pointer-events-none" />
                    {/* Crosshair indicators */}
                    <div className="absolute top-2 left-2 text-[9px] font-mono text-cyan-400/80">[SYS.OPTIC: OK]</div>
                    <div className="absolute bottom-2 right-2 text-[9px] font-mono text-neutral-400">RES: 3840×2160</div>

                    {/* Central Inspection Target */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-mono text-xs font-bold shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                        97/100
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400 mt-1.5 uppercase tracking-widest">
                        SERIAL & SEAL VERIFIED
                      </span>
                    </div>
                  </div>

                  {/* Multi-Agent Sequential Decision Flow */}
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <div className="flex items-center gap-2 text-neutral-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>01 VisionQualityAgent</span>
                      </div>
                      <span className="text-cyan-400 font-semibold">PASS (Pristine Grade)</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <div className="flex items-center gap-2 text-neutral-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>02 FraudSentinel</span>
                      </div>
                      <span className="text-emerald-400 font-semibold">CLEARED (Risk: 0.04)</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <div className="flex items-center gap-2 text-neutral-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>03 LogisticsDispatcher</span>
                      </div>
                      <span className="text-white font-semibold">Direct Peer Match (3.2 km)</span>
                    </div>
                  </div>

                  {/* Routing Decision Result Strip */}
                  <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-950/40 via-emerald-950/30 to-neutral-900 border border-cyan-500/30 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-mono text-cyan-300 uppercase tracking-widest">AUTONOMOUS DISPATCH DECISION</div>
                      <div className="text-xs font-bold text-white mt-0.5">Rerouted to Buyer #ORB-9201 · Bypass Hub</div>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-400 font-mono font-bold text-sm">₹4,200 SAVED</div>
                      <div className="text-[10px] text-neutral-400">12.8 kg CO₂ reduced</div>
                    </div>
                  </div>
                </div>

                {/* Console Footer */}
                <div className="px-4 py-2.5 bg-[#090b10] border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-neutral-400">
                  <span>DISPATCH PROTOCOL // ACTIVE</span>
                  <span className="text-neutral-400">HASH: a8f9c1...9e</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
