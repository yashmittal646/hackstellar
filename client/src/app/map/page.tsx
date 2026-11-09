"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { fetchMapData } from "../../lib/api";
import { Hub, ReturnItem } from "../../types";
import { Compass, RefreshCw, Layers } from "lucide-react";

// Dynamic import with SSR disabled for Leaflet Map
const MapComponent = dynamic(() => import("../../components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="h-[750px] w-full rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center gap-3">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      <span className="text-sm font-medium text-slate-400">Loading Geospatial Engine...</span>
    </div>
  ),
});

export default function MapPage() {
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const data = await fetchMapData();
      setHubs(data.hubs);
      setReturns(data.activeReturns);
    } catch (err) {
      console.error("Failed to load map data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Live Return Interception Radar
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Real-time geospatial visualization of active returns being rerouted to nearby orders or micro-hubs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> {returns.filter(r => r.routingDestination === "direct_to_customer").length} Peer Matches
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-semibold text-indigo-400">
              <span className="h-2 w-2 rounded-full bg-indigo-400" /> {returns.filter(r => r.routingDestination === "nearby_hub").length} Hub Staged
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-semibold text-rose-400">
              <span className="h-2 w-2 rounded-full bg-rose-400" /> {returns.filter(r => r.routingDestination === "central_warehouse").length} Warehouse
            </span>
          </div>

          <button
            onClick={loadData}
            className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-all"
            title="Refresh Map Data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-3 shadow-2xl">
        <MapComponent hubs={hubs} returns={returns} />
      </div>
    </div>
  );
}

