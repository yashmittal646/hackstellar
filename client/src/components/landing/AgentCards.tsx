"use client";

import { motion } from "framer-motion";
import { useInView } from "../../hooks/useInView";
import Link from "next/link";
import { 
  Eye, 
  ShieldAlert, 
  Truck, 
  ArrowRight, 
  Cpu, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Binary, 
  Compass 
} from "lucide-react";

export function AgentCards() {
  const [ref, inView] = useInView(0.15);

  return (
    <section ref={ref} className="relative py-28 border-b border-white/[0.06] bg-[#090b11]">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs uppercase tracking-wider mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Specialized Neural Agents
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              Three Coordinated Agents. <br />
              Zero Human Bottlenecks.
            </h2>
            <p className="text-neutral-400 text-base sm:text-lg mt-3 leading-relaxed">
              Each autonomous agent runs as an isolated micro-service with its own verification heuristics, scoring weights, and fallback mechanisms.
            </p>
          </div>

          <Link
            href="/agent-lab"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.1] font-semibold text-xs font-mono uppercase tracking-wider transition-all shrink-0"
          >
            <span>Launch Agent Lab</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 3 Specialized Agent Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Agent 1: VisionQualityAgent */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="p-7 rounded-2xl bg-[#0c0f17] border border-white/[0.08] hover:border-cyan-500/30 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Eye className="w-6 h-6" />
                </div>
                <span className="font-mono text-xs text-neutral-400 uppercase tracking-widest">AGENT // 01</span>
              </div>

              <div className="font-mono text-[11px] text-cyan-400 uppercase tracking-wider mb-1">OPTIC & PACKAGING CLASSIFIER</div>
              <h3 className="text-xl font-bold text-white mb-2.5">VisionQualityAgent</h3>
              <p className="text-sm text-neutral-400 leading-relaxed mb-6">
                Analyzes item imagery for scratches, open box seals, missing accessories, and structural damage to determine immediate resale readiness.
              </p>

              {/* Technical Specifications */}
              <div className="space-y-2 p-3.5 rounded-xl bg-[#07090d] border border-white/[0.04] font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-400">CLASSIFICATION TIERS</span>
                  <span className="text-white">5 Standard Grades</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">CONFIDENCE METRIC</span>
                  <span className="text-cyan-400">0.00 – 1.00 Float</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">DECISION LATENCY</span>
                  <span className="text-emerald-400">~180 ms</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-neutral-400">
              <span>PRISTINE · LIKE_NEW · DEFECTIVE</span>
              <span className="text-cyan-400">Active</span>
            </div>
          </motion.div>

          {/* Agent 2: FraudSentinel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="p-7 rounded-2xl bg-[#0c0f17] border border-white/[0.08] hover:border-rose-500/30 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <span className="font-mono text-xs text-neutral-400 uppercase tracking-widest">AGENT // 02</span>
              </div>

              <div className="font-mono text-[11px] text-rose-400 uppercase tracking-wider mb-1">RISK & RETURN ABUSE DETECTOR</div>
              <h3 className="text-xl font-bold text-white mb-2.5">FraudSentinel</h3>
              <p className="text-sm text-neutral-400 leading-relaxed mb-6">
                Cross-examines package weight disparities, serial number spoofing, rapid return velocity, and buyer claim patterns to instantly quarantine suspect returns.
              </p>

              {/* Technical Specifications */}
              <div className="space-y-2 p-3.5 rounded-xl bg-[#07090d] border border-white/[0.04] font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-400">RISK SCORING RANGE</span>
                  <span className="text-white">0 – 100 Risk Index</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">QUARANTINE THRESHOLD</span>
                  <span className="text-rose-400">Score &gt; 70 Auto-Hold</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">ANOMALY VECTORS</span>
                  <span className="text-emerald-400">14 Features Checked</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-neutral-400">
              <span>SERIAL SWAP & ABUSE SHIELD</span>
              <span className="text-emerald-400">Active</span>
            </div>
          </motion.div>

          {/* Agent 3: LogisticsDispatcher */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="p-7 rounded-2xl bg-[#0c0f17] border border-white/[0.08] hover:border-emerald-500/30 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Truck className="w-6 h-6" />
                </div>
                <span className="font-mono text-xs text-neutral-400 uppercase tracking-widest">AGENT // 03</span>
              </div>

              <div className="font-mono text-[11px] text-emerald-400 uppercase tracking-wider mb-1">SPATIAL ROUTING OPTIMIZER</div>
              <h3 className="text-xl font-bold text-white mb-2.5">LogisticsDispatcher</h3>
              <p className="text-sm text-neutral-400 leading-relaxed mb-6">
                Calculates the mathematically optimal drop point by querying 2dsphere indexes for pending buyer orders, local micro-fulfillment hubs, or liquidators.
              </p>

              {/* Technical Specifications */}
              <div className="space-y-2 p-3.5 rounded-xl bg-[#07090d] border border-white/[0.04] font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-400">SPATIAL INDEXING</span>
                  <span className="text-white">MongoDB 2dsphere</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">INTERCEPT RADIUS</span>
                  <span className="text-cyan-400">Up to 25 km Dynamic</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">DECISION WEIGHTING</span>
                  <span className="text-emerald-400">5 Dynamic Factors</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-neutral-400">
              <span>DIRECT PEER & MICRO-HUB ROUTING</span>
              <span className="text-emerald-400">Active</span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
