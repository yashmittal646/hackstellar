"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchReturnById, processReturnRouting } from "../../../lib/api";
import { ShippingLabelModal } from "../../../components/ShippingLabelModal";
import { ReturnItem } from "../../../types";
import { formatCurrency } from "../../../lib/utils";
import { 
  ArrowLeft, 
  MapPin, 
  Truck, 
  Sparkles, 
  Clock, 
  Leaf, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  Warehouse,
  Printer
} from "lucide-react";

export default function ReturnDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [returnDoc, setReturnDoc] = useState<ReturnItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [routingInProgress, setRoutingInProgress] = useState(false);
  const [isLabelOpen, setIsLabelOpen] = useState(false);

  const loadData = async () => {
    try {
      if (!id) return;
      const data = await fetchReturnById(id);
      setReturnDoc(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleRouteNow = async () => {
    if (!id) return;
    setRoutingInProgress(true);
    try {
      await processReturnRouting(id);
      loadData();
    } catch (err) {
      alert("Error routing return");
    } finally {
      setRoutingInProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (!returnDoc) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12 text-center">
        <p className="text-slate-400">Return record not found.</p>
        <button
          onClick={() => router.push("/returns")}
          className="mt-4 px-4 py-2 bg-slate-800 rounded-xl text-xs font-semibold text-white"
        >
          Back to fleet
        </button>
      </div>
    );
  }

  const reasoning = returnDoc.routingReasoning || {
    conditionFactor: 0.8,
    demandFactor: 0.7,
    fraudFactor: 0.9,
    proximityFactor: 0.85,
    timeSavingsFactor: 0.6,
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-indigo-400">{returnDoc.returnId}</span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {returnDoc.status.replace(/_/g, " ")}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            {returnDoc.productId?.name || "Product"}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Customer: <strong className="text-slate-200">{returnDoc.userId?.name}</strong> ({returnDoc.pickupAddress?.city})
          </p>
        </div>

        <div className="flex items-center gap-3">
          {returnDoc.routingDestination && (
            <button
              onClick={() => setIsLabelOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all shadow-sm"
            >
              <Printer className="h-4 w-4" /> Print Intercept Waybill
            </button>
          )}

          {!returnDoc.routingDestination && (
            <button
              onClick={handleRouteNow}
              disabled={routingInProgress}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              {routingInProgress ? "Calculating Route..." : "Run AI Routing Decision"}
            </button>
          )}
        </div>
      </div>

      {/* Metrics Banner */}
      {returnDoc.routingDestination && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Cost Saved</span>
            <div className="text-xl font-black text-emerald-400 mt-0.5">
              {formatCurrency(returnDoc.costSaved)}
            </div>
            <span className="text-[10px] text-slate-400">vs Warehouse transport</span>
          </div>

          <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">CO₂ Offset</span>
            <div className="text-xl font-black text-teal-400 mt-0.5">
              {returnDoc.co2Saved} kg
            </div>
            <span className="text-[10px] text-slate-400">Green rerouting saving</span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Hours Saved</span>
            <div className="text-xl font-black text-amber-400 mt-0.5">
              {returnDoc.timeSaved}h
            </div>
            <span className="text-[10px] text-slate-400">Turnaround acceleration</span>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Distance Saved</span>
            <div className="text-xl font-black text-indigo-400 mt-0.5">
              {Math.max(0, returnDoc.originalDistance - returnDoc.optimizedDistance)} km
            </div>
            <span className="text-[10px] text-slate-400">{returnDoc.originalDistance}km → {returnDoc.optimizedDistance}km</span>
          </div>
        </div>
      )}

      {/* Decision Engine Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Explainable AI Factors */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" /> Explainable Routing Multi-Factor Score
            </h3>
            <span className="font-mono text-xs font-bold text-emerald-400">
              Score: {returnDoc.routingScore.toFixed(1)} / 100
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Product Condition Factor (25% weight)</span>
                <span className="text-slate-200 font-mono">{(reasoning.conditionFactor * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${reasoning.conditionFactor * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Nearby Local Demand (30% weight)</span>
                <span className="text-slate-200 font-mono">{(reasoning.demandFactor * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${reasoning.demandFactor * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Fraud Safety Inversion (20% weight)</span>
                <span className="text-slate-200 font-mono">{(reasoning.fraudFactor * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full" style={{ width: `${reasoning.fraudFactor * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Geographic Proximity (15% weight)</span>
                <span className="text-slate-200 font-mono">{(reasoning.proximityFactor * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: `${reasoning.proximityFactor * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Time & Speed Optimization (10% weight)</span>
                <span className="text-slate-200 font-mono">{(reasoning.timeSavingsFactor * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${reasoning.timeSavingsFactor * 100}%` }} />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 mt-2">
            Destination decided:{" "}
            <strong className="text-white capitalize">
              {returnDoc.routingDestination ? returnDoc.routingDestination.replace(/_/g, " ") : "Pending computation"}
            </strong>
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-400" /> Dynamic Journey Tracking
          </h3>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {returnDoc.timeline?.map((step, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-6 top-0.5 h-4 w-4 rounded-full border-2 border-slate-900 bg-indigo-500" />
                <div className="text-xs font-bold text-white capitalize">{step.status.replace(/_/g, " ")}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{step.notes || "Status logged"}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {new Date(step.timestamp).toLocaleDateString()} {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      <ShippingLabelModal
        item={returnDoc}
        isOpen={isLabelOpen}
        onClose={() => setIsLabelOpen(false)}
      />
    </div>
  );
}
