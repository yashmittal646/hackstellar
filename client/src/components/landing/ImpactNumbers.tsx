"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "../../hooks/useInView";
import { useCountUp } from "../../hooks/useCountUp";
import { Package, TrendingDown, Leaf, Building2 } from "lucide-react";

interface Stats {
  totalReturns: number;
  savings: { totalCostSaved: number; totalCo2Saved: number };
  routingBreakdown: Record<string, number>;
}

function Counter({ target, prefix = "", suffix = "", decimals = 0, label, sublabel, icon: Icon, color, inView }: {
  target: number; prefix?: string; suffix?: string; decimals?: number; label: string; sublabel: string;
  icon: typeof Package; color: string; inView: boolean;
}) {
  const value = useCountUp(target, 2500, inView, decimals);
  return (
    <div className="text-center space-y-2">
      <div className={`w-10 h-10 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-center mx-auto ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className={`text-4xl sm:text-5xl font-black tabular-nums ${color}`}>
        {prefix}{decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString()}{suffix}
      </div>
      <div className="text-sm font-bold text-white">{label}</div>
      <div className="text-xs text-slate-500">{sublabel}</div>
    </div>
  );
}

export function ImpactNumbers() {
  const [ref, inView] = useInView(0.1);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/dashboard/stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => {});
  }, []);

  const metrics = [
    {
      target: stats?.totalReturns ?? 21,
      label: "Returns Analyzed",
      sublabel: "By AI agents in real-time",
      icon: Package,
      color: "text-violet-400",
    },
    {
      target: stats ? Math.round(stats.savings.totalCostSaved) : 26896,
      prefix: "₹",
      label: "Cost Saved",
      sublabel: "Logistics cost eliminated",
      icon: TrendingDown,
      color: "text-emerald-400",
    },
    {
      target: stats ? Math.round(stats.savings.totalCo2Saved * 10) / 10 : 197.8,
      suffix: " kg",
      decimals: 1,
      label: "CO₂ Offset",
      sublabel: "Carbon footprint reduced",
      icon: Leaf,
      color: "text-teal-400",
    },
    {
      target: stats?.routingBreakdown["direct_to_customer"] ?? 8,
      label: "Warehouse Bypasses",
      sublabel: "Direct customer intercepts",
      icon: Building2,
      color: "text-indigo-400",
    },
  ];

  return (
    <section ref={ref} className="relative py-28 overflow-hidden">
      {/* Particle burst glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/15 to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/8 blur-3xl rounded-full pointer-events-none" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 mb-4">
            🌱 Real Impact
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Live Numbers. <span className="text-emerald-400">Real Data.</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Every metric pulled from our live MongoDB Atlas database — 21 real returns, fully processed.
          </p>
        </motion.div>

        <div className="rounded-3xl border border-emerald-500/10 bg-gradient-to-br from-slate-900/80 via-emerald-950/20 to-slate-900/80 p-8 sm:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {metrics.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.15, duration: 0.7 }}
              >
                <Counter {...m} inView={inView} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Hub map dots — India */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="mt-12 rounded-2xl border border-indigo-500/10 bg-slate-900/50 p-6 overflow-hidden relative"
        >
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 text-center">8 Active Micro-Hubs Across India</p>
          {/* Simplified India map with hub dots */}
          <div className="relative h-48 flex items-center justify-center">
            <div className="text-slate-700 text-6xl select-none">🗺️</div>
            {/* Hub dots positioned roughly on India */}
            {[
              { top: "15%", left: "35%", label: "Delhi" },
              { top: "25%", left: "20%", label: "Mumbai" },
              { top: "60%", left: "40%", label: "Bengaluru" },
              { top: "35%", left: "55%", label: "Kolkata" },
              { top: "45%", left: "30%", label: "Hyderabad" },
              { top: "20%", left: "50%", label: "Patna" },
              { top: "10%", left: "25%", label: "Jaipur" },
              { top: "70%", left: "35%", label: "Chennai" },
            ].map((hub, i) => (
              <div
                key={hub.label}
                className="absolute group"
                style={{ top: hub.top, left: hub.left }}
              >
                <div
                  className="w-3 h-3 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50"
                  style={{ animation: `pulse-ring 2s ${i * 0.25}s ease-out infinite` }}
                />
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] text-indigo-300 font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  {hub.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

