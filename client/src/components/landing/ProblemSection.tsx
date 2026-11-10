"use client";
import { motion } from "framer-motion";
import { useInView } from "../../hooks/useInView";
import { useCountUp } from "../../hooks/useCountUp";
import { AlertTriangle, TrendingDown, Building2 } from "lucide-react";

const STATS = [
  {
    value: 30,
    suffix: "%",
    label: "Return Rate",
    desc: "Of all e-commerce orders are returned — a hidden supply chain tax",
    icon: TrendingDown,
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
    glow: "shadow-rose-500/20",
  },
  {
    value: 1.4,
    suffix: "T",
    prefix: "₹",
    label: "Annual Industry Cost",
    desc: "Trillion rupees lost annually to reverse logistics in Indian e-commerce",
    icon: AlertTriangle,
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
    glow: "shadow-orange-500/20",
    decimals: 1,
  },
  {
    value: 68,
    suffix: "%",
    label: "Unnecessary Warehouse",
    desc: "Of returns could be rerouted without touching the central warehouse at all",
    icon: Building2,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    glow: "shadow-amber-500/20",
  },
];

function StatCard({ stat, inView, delay }: { stat: typeof STATS[0]; inView: boolean; delay: number }) {
  const count = useCountUp(stat.value, 2200, inView, stat.decimals ?? 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.7, ease: "easeOut" }}
      className={`relative rounded-2xl border ${stat.bg} p-6 shadow-2xl ${stat.glow} overflow-hidden`}
    >
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20 ${stat.bg}`} />
      <div className={`w-10 h-10 rounded-xl border ${stat.bg} flex items-center justify-center mb-4`}>
        <stat.icon className={`h-5 w-5 ${stat.color}`} />
      </div>
      <div className={`text-5xl font-black mb-2 ${stat.color}`}>
        {stat.prefix ?? ""}{count}{stat.suffix}
      </div>
      <div className="text-sm font-bold text-white mb-1">{stat.label}</div>
      <p className="text-xs text-slate-400 leading-relaxed">{stat.desc}</p>
    </motion.div>
  );
}

export function ProblemSection() {
  const [ref, inView] = useInView(0.1);

  return (
    <section ref={ref} className="relative py-28 overflow-hidden">
      {/* Red accent glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-rose-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20 mb-4">
            <AlertTriangle className="h-3.5 w-3.5" />
            The Problem
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Reverse Logistics is <span className="text-rose-400">Breaking</span> E-Commerce
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Every return that hits a warehouse costs money, time, and carbon. The industry has accepted this as inevitable. We didn't.
          </p>
        </motion.div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {STATS.map((s, i) => (
            <StatCard key={s.label} stat={s} inView={inView} delay={i * 0.15} />
          ))}
        </div>

        {/* Broken flow diagram */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="rounded-2xl border border-rose-500/10 bg-rose-950/10 p-8 text-center"
        >
          <p className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-6">The Old Way</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            {["📦 Customer Return", "🚛 Courier Pickup", "🏭 Central Warehouse", "📋 Manual Inspection", "🏷️ Repackaging", "📤 Re-listed (weeks later)"].map((step, i) => (
              <div key={step} className="flex items-center gap-4">
                <span className="px-4 py-2 rounded-full bg-slate-900/80 border border-rose-500/20 text-slate-300 font-medium whitespace-nowrap">{step}</span>
                {i < 5 && <span className="text-rose-500 font-bold">→</span>}
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-slate-500">
            <span className="px-3 py-1 bg-slate-900/50 rounded-full border border-slate-800">⏱️ 7-14 days delay</span>
            <span className="px-3 py-1 bg-slate-900/50 rounded-full border border-slate-800">💸 ₹600-1200 cost/return</span>
            <span className="px-3 py-1 bg-slate-900/50 rounded-full border border-slate-800">🌍 2× CO₂ footprint</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

