"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "../../hooks/useInView";
import { 
  LayoutDashboard, 
  ArrowRight, 
  TrendingDown, 
  Leaf, 
  RotateCcw, 
  Activity, 
  Eye, 
  ShieldAlert, 
  Truck, 
  CheckCircle2, 
  ExternalLink,
  Lock,
  Sparkles
} from "lucide-react";

interface MiniStats {
  totalReturns: number;
  savings: {
    totalCostSaved: number;
    totalCo2Saved: number;
  };
  routingBreakdown: Record<string, number>;
}

export function DashboardPreview() {
  const [ref, inView] = useInView(0.15);
  const [stats, setStats] = useState<MiniStats | null>(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/dashboard/stats")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => {});
  }, []);

  const total = stats?.totalReturns ?? 21;
  const cost = stats ? Math.round(stats.savings.totalCostSaved) : 26896;
  const co2 = stats ? Math.round(stats.savings.totalCo2Saved * 10) / 10 : 197.8;
  const direct = stats?.routingBreakdown["direct_to_customer"] ?? 8;
  const hub = stats?.routingBreakdown["nearby_hub"] ?? 8;

  return (
    <section ref={ref} className="relative py-28 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 mb-4">
            <LayoutDashboard className="h-3.5 w-3.5" />
            Operations Command Center
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Mission Control for <span className="shimmer-text">Zero-Warehouse</span> Returns
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Full visibility into autonomous return decisions, geospatial matching, CO₂ offsets, and fleet movements.
          </p>
        </motion.div>

        {/* Browser Chrome Container */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.98 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="rounded-3xl border border-slate-700/60 bg-slate-950/90 shadow-2xl overflow-hidden backdrop-blur-xl relative"
        >
          {/* Top Browser Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-3 text-xs font-medium text-slate-400 hidden sm:inline">OrbitReturn Live Fleet Operations</span>
            </div>

            {/* Mock URL pill */}
            <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-xs text-slate-300 max-w-xs w-full justify-center">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span className="text-slate-500">https://</span>
              <span className="font-semibold text-white">orbitreturn.ai</span>
              <span className="text-slate-400">/dashboard</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync
              </span>
            </div>
          </div>

          {/* Inner Dashboard Preview Body */}
          <div className="p-6 sm:p-8 space-y-6 bg-gradient-to-b from-slate-900/60 to-slate-950/80">
            {/* Mini KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Processed Returns</span>
                  <RotateCcw className="w-4 h-4 text-violet-400" />
                </div>
                <div className="text-2xl font-black text-white">{total}</div>
                <div className="text-[11px] text-emerald-400 mt-1 font-semibold">100% Autonomous</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Direct Customer Matches</span>
                  <Truck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-emerald-400">{direct}</div>
                <div className="text-[11px] text-slate-400 mt-1">Zero warehouse touch</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Total Capital Saved</span>
                  <TrendingDown className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-black text-indigo-300">₹{cost.toLocaleString()}</div>
                <div className="text-[11px] text-indigo-400 mt-1 font-semibold">Avg ₹1,280 / item</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Carbon Offset</span>
                  <Leaf className="w-4 h-4 text-teal-400" />
                </div>
                <div className="text-2xl font-black text-teal-300">{co2} kg</div>
                <div className="text-[11px] text-teal-400 mt-1 font-semibold">Verified reverse log</div>
              </div>
            </div>

            {/* Middle split: Live activity vs Dynamic Routing breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Live pipeline feed */}
              <div className="lg:col-span-7 rounded-2xl bg-slate-900/80 border border-slate-800 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-violet-400" />
                      <span className="text-sm font-bold text-white">Live Interception Stream</span>
                    </div>
                    <span className="text-xs text-slate-500">Autonomous Triaging</span>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { icon: Eye, agent: "VisionQualityAgent", item: "iPhone 15 Pro Max", outcome: "PRISTINE · 97/100 · Sealed", tag: "Direct Peer Dispatch", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" },
                      { icon: ShieldAlert, agent: "FraudSentinel", item: "Samsung Galaxy S24", outcome: "HIGH RISK · Score 88/100 · Flagged", tag: "Quarantine Staging", color: "text-rose-400 border-rose-500/20 bg-rose-500/10" },
                      { icon: Truck, agent: "LogisticsDispatcher", item: "Sony WH-1000XM5", outcome: "Rerouted to Pune Hub · ₹1,200 saved", tag: "Micro-Hub Hold", color: "text-blue-400 border-blue-500/20 bg-blue-500/10" },
                    ].map((entry, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${entry.color}`}>
                            <entry.icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-white">{entry.item}</div>
                            <div className="text-[11px] text-slate-400">{entry.outcome}</div>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border hidden sm:inline ${entry.color}`}>
                          {entry.tag}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/70 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Real-time dispatch engine matching Mumbai, Delhi, Bengaluru</span>
                  <span className="text-emerald-400 font-semibold">Sub-300ms latency</span>
                </div>
              </div>

              {/* Dynamic routing allocation summary */}
              <div className="lg:col-span-5 rounded-2xl bg-slate-900/80 border border-slate-800 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-white">Dynamic Reroute Share</span>
                    <span className="text-xs text-indigo-400 font-semibold">Live Weights</span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-300 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          Direct-to-Customer Peer Route
                        </span>
                        <span className="font-bold text-emerald-400">38% ({direct} units)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: "38%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-300 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-400" />
                          Regional Micro-Fulfillment Hub
                        </span>
                        <span className="font-bold text-indigo-400">38% ({hub} units)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" style={{ width: "38%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-300 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                          Unrouted / Triage Queue
                        </span>
                        <span className="font-bold text-amber-400">24% (5 units)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: "24%" }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-xs text-indigo-200">
                  <div className="font-semibold flex items-center gap-1.5 mb-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    AI Factor Scoring Applied
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Proximity (30%), Margin (25%), Quality (20%), Demand (15%), Fraud Risk (10%)
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Call to Action strip */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/80">
              <div className="text-xs text-slate-400 text-center sm:text-left">
                Ready to inspect individual return manifests, simulate rerouting, and test carrier routes?
              </div>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all group shrink-0"
              >
                <span>Launch Full Operations Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
