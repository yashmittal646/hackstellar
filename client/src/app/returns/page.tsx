"use client";

import { useEffect, useState } from "react";
import { ReturnItem } from "../../types";
import { fetchRecentReturns, processReturnRouting } from "../../lib/api";
import { ReturnCard } from "../../components/ReturnCard";
import { RotateCcw, Filter, Search, RefreshCw } from "lucide-react";

export default function ReturnsFleetPage() {
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  const loadData = async () => {
    try {
      const data = await fetchRecentReturns();
      setReturns(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleProcess = async (id: string) => {
    try {
      await processReturnRouting(id);
      loadData();
    } catch (err) {
      alert("Error routing return");
    }
  };

  const filteredReturns = returns.filter((r) => {
    if (filter === "direct" && r.routingDestination !== "direct_to_customer") return false;
    if (filter === "hub" && r.routingDestination !== "nearby_hub") return false;
    if (filter === "warehouse" && r.routingDestination !== "central_warehouse") return false;
    if (filter === "fraud" && r.fraudRisk !== "high") return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = r.returnId?.toLowerCase().includes(q);
      const matchProd = r.productId?.name?.toLowerCase().includes(q);
      const matchUser = r.userId?.name?.toLowerCase().includes(q);
      const matchCity = r.pickupAddress?.city?.toLowerCase().includes(q);
      return matchId || matchProd || matchUser || matchCity;
    }
    return true;
  });

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Returns Fleet Directory
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Browse and inspect all intercepted returns and their autonomous routing decisions.
          </p>
        </div>

        <button
          onClick={loadData}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, product, customer or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: "all", label: "All Returns" },
            { id: "direct", label: "Direct to Peer" },
            { id: "hub", label: "Hub Staged" },
            { id: "warehouse", label: "Central Warehouse" },
            { id: "fraud", label: "High Fraud Risk" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === tab.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Returns List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
      ) : filteredReturns.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 text-slate-400 text-sm">
          No returns found matching the current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReturns.map((item) => (
            <ReturnCard key={item._id} item={item} onProcess={handleProcess} />
          ))}
        </div>
      )}
    </div>
  );
}

