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
  Lock,
  Cpu,
  Layers,
  CheckCircle2,
  ExternalLink
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
      .then((data) => setStats(data.data || data))
      .catch(() => {});
  }, []);

  const total = stats?.totalReturns ?? 21;
  const cost = stats?.savings?.totalCostSaved != null ? Math.round(stats.savings.totalCostSaved) : 26896;
  const co2 = stats?.savings?.totalCo2Saved != null ? Math.round(stats.savings.totalCo2Saved * 10) / 10 : 197.8;
  const direct = stats?.routingBreakdown?.["direct_to_customer"] ?? 8;
  const hub = stats?.routingBreakdown?.["nearby_hub"] ?? 8;

  return (
    <section ref={ref} className="relative py-28 border-b border-white/[0.06] bg-[#07090e]">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            Operations Command Center
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Full Observability Across Every Reverse Freight Mile.
          </h2>
          <p className="text-neutral-400 text-base sm:text-lg mt-3 leading-relaxed">
            Live telemetry, automated condition telemetry, spatial dispatch graphs, and fraud mitigation logs in a unified single pane of glass.
          </p>
        </div>

        {/* High-End Enterprise Console Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="rounded-2xl bg-[#0b0e15] border border-white/[0.1] shadow-2xl overflow-hidden"
        >
          {/* Top Browser Bar */}
          <div className="px-5 py-3.5 bg-[#0e121b] border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
              <span className="ml-3 font-mono text-xs text-neutral-400 hidden sm:inline">
                orbitreturn.internal/fleet-operations
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-[#07090d] border border-white/[0.06] text-xs font-mono text-neutral-400">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>TLS 1.3 // 256-BIT ENCRYPTED</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                EDGE SYNCED
              </span>
            </div>
          </div>

          {/* Console Body */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Top 4 Metrics Ledger */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#07090d] border border-white/[0.06]">
                <div className="text-[11px] font-mono text-neutral-400 uppercase">RETURNS PROCESSED</div>
                <div className="text-2xl font-bold font-mono text-white mt-1">{total}</div>
                <div className="text-[11px] font-mono text-emerald-400 mt-0.5">100% Edge Intercepted</div>
              </div>
              <div className="p-4 rounded-xl bg-[#07090d] border border-white/[0.06]">
                <div className="text-[11px] font-mono text-neutral-400 uppercase">DIRECT DISPATCHES</div>
                <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">{direct}</div>
                <div className="text-[11px] font-mono text-neutral-400 mt-0.5">Zero-warehouse hops</div>
              </div>
              <div className="p-4 rounded-xl bg-[#07090d] border border-white/[0.06]">
                <div className="text-[11px] font-mono text-neutral-400 uppercase">RECOVERED MARGIN</div>
                <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">₹{cost.toLocaleString()}</div>
                <div className="text-[11px] font-mono text-neutral-400 mt-0.5">₹1,280 avg / return</div>
              </div>
              <div className="p-4 rounded-xl bg-[#07090d] border border-white/[0.06]">
                <div className="text-[11px] font-mono text-neutral-400 uppercase">CARBON AVOIDED</div>
                <div className="text-2xl font-bold font-mono text-teal-300 mt-1">{co2} kg</div>
                <div className="text-[11px] font-mono text-neutral-400 mt-0.5">Verified logistics trace</div>
              </div>
            </div>

            {/* Middle Section: Live Stream & Dynamic Allocation */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Live Stream Panel */}
              <div className="lg:col-span-7 p-5 rounded-xl bg-[#07090d] border border-white/[0.06] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                        LIVE INTERCEPTION STREAM
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-neutral-400">LATENCY &lt; 300MS</span>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { icon: Eye, title: "Apple iPhone 15 Pro Max", status: "PRISTINE (97/100)", dest: "Direct Peer Delivery", color: "text-cyan-400 border-cyan-500/20 bg-cyan-500/10" },
                      { icon: ShieldAlert, title: "Samsung Galaxy S24 Ultra", status: "HIGH RISK (88/100)", dest: "Quarantine Staging", color: "text-rose-400 border-rose-500/20 bg-rose-500/10" },
                      { icon: Truck, title: "Sony WH-1000XM5 Headset", status: "LIKE_NEW (82/100)", dest: "Pune Micro-Hub Staging", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" },
                    ].map((entry, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-between font-mono text-xs">
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded ${entry.color}`}>
                            <entry.icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="text-white font-semibold font-sans">{entry.title}</div>
                            <div className="text-[11px] text-neutral-400">{entry.status}</div>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border hidden sm:inline ${entry.color}`}>
                          {entry.dest}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-neutral-400">
                  <span>Cross-dock nodes active: Mumbai, Delhi, Bengaluru</span>
                  <span className="text-emerald-400">All Nodes Healthy</span>
                </div>
              </div>

              {/* Dynamic Allocation Panel */}
              <div className="lg:col-span-5 p-5 rounded-xl bg-[#07090d] border border-white/[0.06] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      DYNAMIC ROUTING BREAKDOWN
                    </span>
                    <span className="text-[11px] font-mono text-cyan-400">REAL-TIME</span>
                  </div>

                  <div className="space-y-4 font-mono text-xs">
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-neutral-300">Direct Customer Intercept</span>
                        <span className="text-cyan-400 font-bold">38% ({direct} items)</span>
                      </div>
                      <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400 rounded-full" style={{ width: "38%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-neutral-300">Micro-Hub Stage</span>
                        <span className="text-emerald-400 font-bold">38% ({hub} items)</span>
                      </div>
                      <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: "38%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-neutral-300">Triage Queue</span>
                        <span className="text-neutral-400 font-bold">24% (5 items)</span>
                      </div>
                      <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                        <div className="h-full bg-neutral-600 rounded-full" style={{ width: "24%" }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-[11px] font-mono text-neutral-400">
                  <div className="text-neutral-300 font-semibold mb-0.5">DECISION FACTORS LOADED</div>
                  <div>Proximity (30%) · Margin (25%) · Quality (20%) · Demand (15%) · Risk (10%)</div>
                </div>
              </div>

            </div>

            {/* Action Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.08]">
              <span className="text-xs text-neutral-400 font-mono">
                Inspect real returns, test carrier dispatch, and simulate multi-factor routing.
              </span>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-neutral-950 font-semibold text-xs font-mono uppercase tracking-wider hover:bg-neutral-100 transition-all shrink-0"
              >
                <span>Open Operations Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
