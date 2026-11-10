"use client";

import { motion } from "framer-motion";
import { useInView } from "../../hooks/useInView";
import { useCountUp } from "../../hooks/useCountUp";
import { ArrowDownRight, ArrowRight, Building, Clock, DollarSign, Gauge, TrendingDown, Truck, XCircle, CheckCircle2 } from "lucide-react";

const STATS = [
  {
    value: 30,
    suffix: "%",
    label: "Industry Return Rate",
    detail: "Up to 30% of fashion and electronics purchases in India are returned, eroding merchant margins.",
    metric: "Source: RedSeer Logistics Index",
  },
  {
    value: 1.4,
    suffix: "T",
    prefix: "₹",
    decimals: 1,
    label: "Annual Reverse Freight Loss",
    detail: "Trillions of rupees wasted on double-handling, central sortation, and deadhead logistics.",
    metric: "Direct operational expenditure",
  },
  {
    value: 68,
    suffix: "%",
    label: "Avoidable Warehouse Transit",
    detail: "Items in pristine condition that should be diverted directly to local pending orders instead.",
    metric: "Recoverable with edge rerouting",
  },
];

export function ProblemSection() {
  const [ref, inView] = useInView(0.15);

  return (
    <section ref={ref} className="relative py-28 border-b border-white/[0.06] bg-[#090b11]">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-mono text-xs uppercase tracking-wider mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Supply Chain Inefficiency
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            The Traditional Returns Cycle is Fundamentally Broken.
          </h2>
          <p className="text-neutral-400 text-base sm:text-lg mt-3 leading-relaxed">
            Every e-commerce return in India is forced through centralized distribution centers hundreds of kilometers away — even when a customer down the street wants the exact same item.
          </p>
        </div>

        {/* 3 Core Data Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {STATS.map((stat, i) => {
            const count = useCountUp(stat.value, 2000, inView, stat.decimals ?? 0);
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
                className="p-7 rounded-2xl bg-[#0d1017] border border-white/[0.08] hover:border-white/[0.16] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="font-mono text-xs text-neutral-400 uppercase tracking-widest">{stat.label}</div>
                  <div className="text-4xl sm:text-5xl font-bold font-mono tracking-tight text-white mt-3 mb-2">
                    {stat.prefix ?? ""}{count}{stat.suffix}
                  </div>
                  <p className="text-sm text-neutral-300 leading-relaxed">{stat.detail}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/[0.06] text-[11px] font-mono text-neutral-400">
                  {stat.metric}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Architecture Comparison Table: Legacy vs OrbitReturn */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          className="rounded-2xl bg-[#0c0f16] border border-white/[0.08] overflow-hidden shadow-2xl"
        >
          <div className="px-6 py-4 bg-[#0e121b] border-b border-white/[0.08] flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              FLOW ARCHITECTURE COMPARISON
            </span>
            <span className="text-xs text-neutral-400 font-mono">PROBLEM STATEMENT 16 SPEC</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
            
            {/* Legacy Model */}
            <div className="p-6 sm:p-8 space-y-6 bg-rose-950/[0.04]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-rose-400" />
                  <span className="font-bold text-white text-base">Legacy Central Warehouse Flow</span>
                </div>
                <span className="text-xs font-mono text-rose-400/90 bg-rose-500/10 px-2.5 py-1 rounded border border-rose-500/20">
                  Average 10–14 Days
                </span>
              </div>

              {/* Steps */}
              <div className="space-y-3 font-mono text-xs text-neutral-400">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <span className="w-6 h-6 rounded bg-neutral-800 flex items-center justify-center text-neutral-400 shrink-0">1</span>
                  <span>Pickup from customer in Mumbai</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <span className="w-6 h-6 rounded bg-neutral-800 flex items-center justify-center text-neutral-400 shrink-0">2</span>
                  <span>Long-haul transport to Gurgaon/Delhi Central Sortation (1,400 km)</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <span className="w-6 h-6 rounded bg-neutral-800 flex items-center justify-center text-neutral-400 shrink-0">3</span>
                  <span>Manual QA inspection dock triage (4–6 day queue)</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <span className="w-6 h-6 rounded bg-neutral-800 flex items-center justify-center text-neutral-400 shrink-0">4</span>
                  <span>Re-listed and shipped back to Mumbai for new buyer (another 1,400 km)</span>
                </div>
              </div>

              {/* Legacy Outcome */}
              <div className="p-4 rounded-xl bg-rose-500/[0.06] border border-rose-500/20 grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-[10px] font-mono text-neutral-400">CYCLE TIME</div>
                  <div className="text-rose-400 font-bold font-mono text-sm mt-0.5">12 Days</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-neutral-400">COST / RETURN</div>
                  <div className="text-rose-400 font-bold font-mono text-sm mt-0.5">₹1,180</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-neutral-400">CARBON INTENSITY</div>
                  <div className="text-rose-400 font-bold font-mono text-sm mt-0.5">2.8 kg CO₂</div>
                </div>
              </div>
            </div>

            {/* OrbitReturn Model */}
            <div className="p-6 sm:p-8 space-y-6 bg-cyan-950/[0.06]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                  <span className="font-bold text-white text-base">OrbitReturn Edge Rerouting</span>
                </div>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20">
                  Average &lt; 4 Minutes
                </span>
              </div>

              {/* Steps */}
              <div className="space-y-3 font-mono text-xs text-neutral-300">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-cyan-500/20">
                  <span className="w-6 h-6 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold shrink-0">1</span>
                  <span>Driver app barcode & condition scan at customer doorstep</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-cyan-500/20">
                  <span className="w-6 h-6 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold shrink-0">2</span>
                  <span>Vision & Fraud agents classify condition & risk score in real-time</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-cyan-500/20">
                  <span className="w-6 h-6 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold shrink-0">3</span>
                  <span>Geospatial engine matches nearby buyer order within 15 km radius</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-cyan-500/20">
                  <span className="w-6 h-6 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold shrink-0">4</span>
                  <span>Instant shipping manifest generated: direct cross-dock delivery</span>
                </div>
              </div>

              {/* OrbitReturn Outcome */}
              <div className="p-4 rounded-xl bg-cyan-500/[0.08] border border-cyan-500/30 grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-[10px] font-mono text-neutral-400">DECISION TIME</div>
                  <div className="text-cyan-400 font-bold font-mono text-sm mt-0.5">380 ms</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-neutral-400">COST SAVINGS</div>
                  <div className="text-emerald-400 font-bold font-mono text-sm mt-0.5">₹1,280 avg</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-neutral-400">CO₂ SAVED</div>
                  <div className="text-cyan-400 font-bold font-mono text-sm mt-0.5">94% reduction</div>
                </div>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
