"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { fetchMapData, fetchStats } from "../../lib/api";
import { Hub, ReturnItem, DashboardStats } from "../../types";
import { Compass, RefreshCw, Truck, MapPin, Warehouse, TrendingDown, Leaf, Zap, Activity } from "lucide-react";

// Dynamic import with SSR disabled for Leaflet Map
const MapComponent = dynamic(() => import("../../components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center gap-3">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      <span className="text-sm font-medium text-slate-400">Loading Geospatial Engine...</span>
    </div>
  ),
});

export default function MapPage() {
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [mapData, statsData] = await Promise.all([fetchMapData(), fetchStats()]);
      setHubs(mapData.hubs);
      setReturns(mapData.activeReturns);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to load map data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const peerCount = returns.filter((r) => r.routingDestination === "direct_to_customer").length;
  const hubCount = returns.filter((r) => r.routingDestination === "nearby_hub").length;
  const warehouseCount = returns.filter((r) => r.routingDestination === "central_warehouse").length;
  const unrouted = returns.filter((r) => !r.routingDestination).length;
  const totalRouted = peerCount + hubCount + warehouseCount;
  const interceptRate = totalRouted > 0 ? Math.round(((peerCount + hubCount) / totalRouted) * 100) : 0;

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Live Interception Radar
            </h1>
            <span className="text-xs font-bold text-slate-500 ml-1">· 2dsphere Geospatial Index</span>
          </div>
          <p className="text-xs md:text-sm text-slate-400">
            Real-time return rerouting visualization across Indian metro corridors.
            Returns diverted to nearest pending orders (25 km radius) or micro-fulfillment hubs.
          </p>
        </div>
        <button
          onClick={loadData}
          className="self-start flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* Live stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Direct Peer Matches", value: peerCount, icon: Truck, color: "text-emerald-400", bg: "border-emerald-500/20 bg-emerald-500/5" },
          { label: "Hub Staged", value: hubCount, icon: MapPin, color: "text-indigo-400", bg: "border-indigo-500/20 bg-indigo-500/5" },
          { label: "Warehouse Bound", value: warehouseCount, icon: Warehouse, color: "text-rose-400", bg: "border-rose-500/20 bg-rose-500/5" },
          { label: "Intercept Rate", value: `${interceptRate}%`, icon: Activity, color: "text-violet-400", bg: "border-violet-500/20 bg-violet-500/5" },
          {
            label: "CO₂ Avoided",
            value: stats ? `${stats.savings.totalCo2Saved.toFixed(0)} kg` : "—",
            icon: Leaf,
            color: "text-teal-400",
            bg: "border-teal-500/20 bg-teal-500/5",
          },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className={`rounded-2xl border p-3.5 flex items-center gap-3 ${s.bg}`}>
              <div className={`w-8 h-8 rounded-xl bg-slate-900/60 flex items-center justify-center flex-shrink-0 ${s.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <div className={`text-lg font-black ${s.color}`}>{loading ? "—" : s.value}</div>
                <div className="text-[10px] text-slate-500 leading-tight">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend row */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>Micro-Hub (staging depot)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span>Return pickup origin</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span>Direct peer intercept</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-rose-500" />
          <span>Central warehouse (fraud/defect)</span>
        </div>
        <div className="ml-auto text-slate-600 text-[10px]">{hubs.length} hubs · {returns.length} active returns</div>
      </div>

      {/* Map */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-3 shadow-2xl">
        <MapComponent hubs={hubs} returns={returns} />
      </div>

      {/* How the routing engine works */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
        <h3 className="text-sm font-bold text-white mb-4">How the Spatial Routing Engine Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: "1", title: "Return Initiated", desc: "Customer triggers return at pickup — GPS coordinates captured", color: "bg-slate-500" },
            { step: "2", title: "2dsphere Query", desc: "MongoDB geospatial index searches 25 km radius for pending orders with same SKU", color: "bg-indigo-500" },
            { step: "3", title: "AI Scoring", desc: "VisionAgent + FraudSentinel evaluate condition & risk. Logistics dispatcher selects optimal destination", color: "bg-violet-500" },
            { step: "4", title: "Dynamic Reroute", desc: "Courier receives real-time redirect instruction via Driver App — no warehouse detour needed", color: "bg-emerald-500" },
          ].map((s) => (
            <div key={s.step} className="flex gap-3">
              <div className={`w-6 h-6 rounded-full ${s.color} flex items-center justify-center text-[10px] font-black text-white flex-shrink-0 mt-0.5`}>{s.step}</div>
              <div>
                <div className="text-sm font-bold text-white mb-0.5">{s.title}</div>
                <div className="text-xs text-slate-400 leading-relaxed">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
