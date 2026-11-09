"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { KPICards } from "../components/KPICards";
import { RoutingChart } from "../components/RoutingChart";
import { ReturnCard } from "../components/ReturnCard";
import { RoiCalculator } from "../components/RoiCalculator";
import { DashboardStats, ReturnItem } from "../types";
import { fetchStats, fetchRecentReturns, processReturnRouting } from "../lib/api";
import { 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  Compass, 
  RefreshCw, 
  Zap, 
  TrendingDown, 
  Building2,
  Eye,
  ShieldAlert,
  Truck,
  Bot,
  CheckCircle2,
  Activity,
} from "lucide-react";

// Mock live agent activity feed (auto-generated based on seeded returns)
const AGENT_FEED = [
  { agent: "VisionQualityAgent", product: "iPhone 15 Pro Max", result: "PRISTINE · 94/100", badge: "text-emerald-400 bg-emerald-500/10", icon: Eye, time: "12s ago" },
  { agent: "FraudSentinel", product: "Samsung Galaxy S24", result: "HIGH RISK · Score 88/100", badge: "text-red-400 bg-red-500/10", icon: ShieldAlert, time: "1m ago" },
  { agent: "LogisticsDispatcher", product: "Sony WH-1000XM5", result: "→ Pune Micro Hub · ₹1,200 saved", badge: "text-blue-400 bg-blue-500/10", icon: Truck, time: "2m ago" },
  { agent: "VisionQualityAgent", product: "Zara Blazer", result: "GOOD · 78/100 · Tags intact", badge: "text-blue-400 bg-blue-500/10", icon: Eye, time: "4m ago" },
  { agent: "LogisticsDispatcher", product: "MacBook Air M3", result: "→ Direct Peer · ₹4,500 saved", badge: "text-emerald-400 bg-emerald-500/10", icon: Truck, time: "7m ago" },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentReturns, setRecentReturns] = useState<ReturnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [s, r] = await Promise.all([fetchStats(), fetchRecentReturns()]);
      setStats(s);
      setRecentReturns(r);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleProcessRouting = async (id: string) => {
    try {
      await processReturnRouting(id);
      loadData();
    } catch (err) {
      alert("Error routing return");
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-400">Loading OrbitReturn Intelligence Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-slate-950 p-6 md:p-8 border border-indigo-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Sparkles className="h-3.5 w-3.5" /> Hackathon Prototype — PS-16
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Returns That Never Go Home
          </h1>
          <p className="text-sm md:text-base text-slate-400 max-w-2xl">
            Autonomous multi-factor rerouting engine. Intercepts returns in real time to eliminate unnecessary warehouse roundtrips and match nearby customer demand.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <Link
            href="/returns/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all"
          >
            <Zap className="h-4 w-4" /> Simulate Return
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      {stats && <KPICards stats={stats} />}

      {/* AI Agent Lab Promo Banner */}
      <div className="rounded-3xl border border-violet-500/20 bg-gradient-to-r from-violet-950/40 via-purple-950/30 to-slate-950 p-6 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-violet-600/10 to-transparent" />
        </div>
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center flex-shrink-0 shadow-xl shadow-violet-500/30">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1 relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">New</span>
            <span className="text-xs text-white/30">&middot;</span>
            <span className="text-xs text-white/40">Multi-Agent AI Pipeline</span>
          </div>
          <h3 className="text-lg font-black text-white">Agent Lab — Autonomous Return Intelligence</h3>
          <p className="text-sm text-white/50 mt-0.5">3 AI agents work in parallel: VisionQualityAgent analyzes item condition, FraudSentinel scores risk, LogisticsDispatcher finds optimal route. All in one click.</p>
        </div>
        <div className="flex gap-3 flex-shrink-0 relative z-10">
          <Link
            href="/agent-lab"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white text-sm font-bold shadow-lg shadow-violet-500/30 transition-all"
          >
            <Sparkles className="w-4 h-4" /> Open Agent Lab
          </Link>
        </div>
      </div>

      {/* Live Agent Activity Feed */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-violet-400" />
            <h3 className="text-base font-bold text-white">Live Agent Activity</h3>
            <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>
          <Link href="/agent-lab" className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1">
            Run inspection <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="space-y-2">
          {AGENT_FEED.map((entry, i) => {
            const Icon = entry.icon;
            return (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/10 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${entry.badge}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white/80">{entry.agent}</span>
                    <span className="text-xs text-white/30">&middot;</span>
                    <span className="text-xs text-white/50 truncate">{entry.product}</span>
                  </div>
                  <p className={`text-xs font-medium ${entry.badge.split(" ")[0]}`}>{entry.result}</p>
                </div>
                <span className="text-[10px] text-white/25 flex-shrink-0">{entry.time}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Analytics & Quick Reroute Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Routing Breakdown Chart */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-white">Dynamic Routing Allocation</h3>
              <span className="text-xs text-indigo-400 font-semibold">Real-time</span>
            </div>
            <p className="text-xs text-slate-400">
              Breakdown of autonomous destination choices by the scoring algorithm.
            </p>
          </div>

          {stats && <RoutingChart stats={stats} />}

          <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Peer Interception</span>
              <span className="font-bold text-emerald-400 text-sm">
                {stats?.routingBreakdown["direct_to_customer"] || 0} direct
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Hub Staging</span>
              <span className="font-bold text-indigo-400 text-sm">
                {stats?.routingBreakdown["nearby_hub"] || 0} staged
              </span>
            </div>
          </div>
        </div>

        {/* Live Map Preview Teaser */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/90 to-slate-950 p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="text-base font-bold text-white">Live Interception Visualizer</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Visualizing spatial supply-demand intercepts across 15+ Indian metropolitan regions.
              </p>
            </div>
            <Link
              href="/map"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/50 transition-all"
            >
              Open Full Screen Map <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="my-6 p-6 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
            <div className="p-3 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
              <Compass className="h-8 w-8 animate-pulse" />
            </div>
            <h4 className="font-bold text-slate-200 text-sm">Dynamic Geographic Interception Ready</h4>
            <p className="text-xs text-slate-400 max-w-md">
              Returns are diverted to pending orders within a 25 km radius or held in micro-fulfillment hubs, bypassing Delhi central warehouse.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold pt-2 text-slate-300">
              <span>📍 8 Regional Hubs</span>
              <span>•</span>
              <span>⚡ 25km Customer Intercept Radius</span>
              <span>•</span>
              <span>🌱 0.21 kg/km CO₂ Reduction</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
            <span>Powered by MongoDB 2dsphere Geospatial Indexing</span>
            <Link href="/map" className="text-indigo-400 hover:underline font-semibold">
              Explore Live Intercepts →
            </Link>
          </div>
        </div>
      </div>

      {/* Enterprise ROI & Scale Simulator */}
      <RoiCalculator />

      {/* Recent Returns Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Active Returns Fleet</h2>
            <p className="text-xs text-slate-400">
              Real-time returns currently traversing through condition grading, fraud scoring, and intelligent rerouting.
            </p>
          </div>
          <Link
            href="/returns"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            View all returns <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentReturns.slice(0, 6).map((item) => (
            <ReturnCard
              key={item._id}
              item={item}
              onProcess={handleProcessRouting}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
