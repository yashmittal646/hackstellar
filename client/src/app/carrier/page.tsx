"use client";

import { useEffect, useState } from "react";
import { fetchRecentReturns } from "../../lib/api";
import { ReturnItem } from "../../types";
import { formatCurrency } from "../../lib/utils";
import { 
  Scan, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  ArrowRight, 
  Truck, 
  AlertTriangle,
  Smartphone,
  Sparkles,
  Phone,
  Compass
} from "lucide-react";

export default function CarrierAppPage() {
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState<ReturnItem | null>(null);
  const [stage, setStage] = useState<"pickup" | "scanning" | "intercepted" | "delivered">("pickup");
  const [scanCountdown, setScanCountdown] = useState(3);

  const loadData = async () => {
    try {
      const data = await fetchRecentReturns();
      const peerOrHubReturns = data.filter((r) => r.routingDestination);
      setReturns(peerOrHubReturns);
      if (peerOrHubReturns.length > 0 && !selectedReturn) {
        setSelectedReturn(peerOrHubReturns[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleScan = () => {
    setScanCountdown(3);
    setStage("scanning");
    // Countdown: 3 → 2 → 1 → AI processing → result
    const tick = (n: number) => {
      if (n > 0) {
        setScanCountdown(n);
        setTimeout(() => tick(n - 1), 900);
      } else {
        // 0 = "Analyzing..." phase then intercept
        setScanCountdown(0);
        setTimeout(() => setStage("intercepted"), 1400);
      }
    };
    setTimeout(() => tick(2), 900);
  };

  const handleDeliver = async () => {
    if (!selectedReturn) return;
    try {
      await fetch(`http://localhost:5000/api/returns/${selectedReturn._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "delivered",
          notes: "Peer hand-off completed by delivery partner. Verified with OTP.",
          location: selectedReturn.pickupAddress.city,
        }),
      });
      setStage("delivered");
    } catch (err) {
      alert("Error updating status");
    }
  };

  const resetFlow = (ret: ReturnItem) => {
    setSelectedReturn(ret);
    setStage("pickup");
    setScanCountdown(3);
  };

  const isPeer = selectedReturn?.routingDestination === "direct_to_customer";
  const dropAddress = isPeer
    ? (selectedReturn?.matchedOrderId as any)?.deliveryAddress
    : (selectedReturn?.assignedHubId as any)?.address;

  return (
    <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
            <Smartphone className="h-3.5 w-3.5" /> Courier Field Operations
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Last-Mile Driver App Simulator
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Experience how delivery executives (Delhivery, Shadowfax, Bluedart) receive real-time rerouting instructions at the customer's doorstep.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Package Selector (Left 5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Truck className="h-4 w-4 text-indigo-400" /> Active Pickups in Driver Manifest
            </h3>
            <span className="text-xs text-slate-400">{returns.length} assigned</span>
          </div>

          <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
            {returns.map((ret) => (
              <div
                key={ret._id}
                onClick={() => resetFlow(ret)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  selectedReturn?._id === ret._id
                    ? "bg-indigo-600/15 border-indigo-500 text-white shadow-md shadow-indigo-600/10"
                    : "bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono font-bold text-indigo-400">{ret.returnId}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    ret.routingDestination === "direct_to_customer"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-indigo-500/20 text-indigo-300"
                  }`}>
                    {ret.routingDestination === "direct_to_customer" ? "Peer Match" : "Hub Staging"}
                  </span>
                </div>
                <div className="font-bold text-sm text-slate-100">{ret.productId?.name}</div>
                <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                  <span>Pickup: {ret.pickupAddress.city}</span>
                  <span className="text-emerald-400 font-semibold">Avoids {ret.originalDistance}km</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Smartphone Simulator Frame (Right 7 Cols) */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="w-full max-w-sm rounded-[42px] border-4 border-slate-700 bg-slate-950 p-3 shadow-2xl shadow-indigo-500/10 ring-1 ring-slate-800">
            {/* Phone Screen */}
            <div className="rounded-[32px] bg-slate-900 border border-slate-800 overflow-hidden flex flex-col min-h-[580px]">
              {/* Phone Status Bar */}
              <div className="px-6 pt-3 pb-2 flex justify-between items-center text-[11px] text-slate-400 border-b border-slate-800/60 bg-slate-950">
                <span className="font-semibold text-slate-300">09:41 AM</span>
                <div className="flex items-center gap-1.5 font-bold">
                  <span>5G</span>
                  <span className="text-emerald-400">100%</span>
                </div>
              </div>

              {/* App Header */}
              <div className="p-4 bg-gradient-to-r from-indigo-900/90 to-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">
                    ORBITRETURN COURIER v2.4
                  </div>
                  <div className="text-xs font-bold text-white">Route #DEL-904 • Executive: Vikram S.</div>
                </div>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              {/* Dynamic Flow States */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                {stage === "pickup" && selectedReturn && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        STEP 1: ARRIVE AT PICKUP
                      </span>
                      <strong className="text-white text-sm block">{selectedReturn.userId?.name}</strong>
                      <div className="text-xs text-slate-400">
                        {selectedReturn.pickupAddress.street}, {selectedReturn.pickupAddress.city}
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        PACKAGE TO COLLECT
                      </span>
                      <strong className="text-slate-200 text-xs block">{selectedReturn.productId?.name}</strong>
                      <div className="text-[11px] text-slate-400">
                        Return Reason: <span className="text-indigo-300 italic font-medium">"{selectedReturn.reason}"</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 flex flex-col items-center text-center space-y-2">
                      <Scan className="h-10 w-10 text-indigo-400 animate-pulse" />
                      <div className="text-xs font-bold text-white">Doorstep Barcode Handover</div>
                      <p className="text-[10px] text-slate-400">
                        Scan package label upon receipt from customer to verify identity.
                      </p>
                    </div>

                    <button
                      onClick={handleScan}
                      className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
                    >
                      <Scan className="h-4 w-4" /> Scan Package Barcode
                    </button>
                  </div>
                )}

                {stage === "scanning" && (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-5 py-10 animate-in fade-in">
                    {/* Scan laser animation */}
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      {/* Pulsing rings */}
                      <div className="absolute inset-0 rounded-full border-2 border-indigo-500/40 animate-ping" />
                      <div className="absolute inset-4 rounded-full border-2 border-indigo-400/30 animate-ping" style={{ animationDelay: "0.3s" }} />
                      {/* Inner circle with countdown */}
                      <div className="relative z-10 h-20 w-20 rounded-full bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-2xl shadow-indigo-500/50">
                        {scanCountdown > 0 ? (
                          <span className="text-4xl font-black text-white animate-in zoom-in-50 duration-300" key={scanCountdown}>
                            {scanCountdown}
                          </span>
                        ) : (
                          <Scan className="h-8 w-8 text-white animate-pulse" />
                        )}
                      </div>
                    </div>

                    <div className="text-center space-y-1">
                      <div className="text-sm font-black text-white">
                        {scanCountdown > 0 ? "Hold barcode steady..." : "Consulting AI Routing Engine..."}
                      </div>
                      <div className="text-xs text-slate-400">
                        {scanCountdown > 0
                          ? `Scanning in ${scanCountdown}...`
                          : "Evaluating 25km demand · condition gate · fraud check"}
                      </div>
                    </div>

                    {/* Agent pipeline mini-status */}
                    {scanCountdown === 0 && (
                      <div className="w-full space-y-1.5 animate-in fade-in">
                        {["VisionQualityAgent", "FraudSentinel", "LogisticsDispatcher"].map((agent, i) => (
                          <div key={agent} className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800">
                            <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                            <span className="text-[10px] font-mono text-indigo-300">{agent}</span>
                            <span className="ml-auto text-[10px] text-slate-500">processing...</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {stage === "intercepted" && selectedReturn && (
                  <div className="space-y-4 animate-in zoom-in-95 duration-200">
                    {/* The Intercept Alert Banner */}
                    <div className="p-4 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/50 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-wide">
                        <Sparkles className="h-4 w-4 animate-bounce" />
                        DO NOT RETURN TO WAREHOUSE!
                      </div>
                      <div className="text-sm font-black text-white">
                        {isPeer ? "⚡ DIRECT PEER INTERCEPT MATCH" : "📦 MICRO-HUB STAGING REDIRECT"}
                      </div>
                      <p className="text-[11px] text-emerald-200/90 leading-tight">
                        {isPeer
                          ? `A customer ${selectedReturn.optimizedDistance} km away ordered this SKU. Deliver directly to fulfill order!`
                          : `Local demand detected. Divert to ${selectedReturn.assignedHubId?.name || "Regional Hub"} (${selectedReturn.optimizedDistance} km).`}
                      </p>
                    </div>

                    {/* Routing Savings Pill */}
                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Warehouse Trip</span>
                        <span className="line-through text-rose-400 font-bold">{selectedReturn.originalDistance} km</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Rerouted Path</span>
                        <span className="text-emerald-400 font-bold">{selectedReturn.optimizedDistance} km</span>
                      </div>
                    </div>

                    {/* New Destination */}
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-indigo-400 block flex items-center gap-1">
                        <Navigation className="h-3 w-3" /> NEXT STOP: {isPeer ? "CUSTOMER B DROP-OFF" : "HUB DROP-OFF"}
                      </span>
                      <strong className="text-white text-xs block">
                        {isPeer ? "Pending Customer Order Match" : selectedReturn.assignedHubId?.name}
                      </strong>
                      <div className="text-[11px] text-slate-400">
                        {dropAddress?.street || "Local Avenue"}, {dropAddress?.city || selectedReturn.pickupAddress.city}
                      </div>
                    </div>

                    <button
                      onClick={handleDeliver}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Confirm Hand-off & Complete Reroute
                    </button>
                  </div>
                )}

                {stage === "delivered" && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-12 animate-in zoom-in-95 duration-200">
                    {/* Burst ring animation */}
                    <div className="relative flex items-center justify-center">
                      <div className="absolute h-24 w-24 rounded-full bg-emerald-500/10 animate-ping" />
                      <div className="absolute h-20 w-20 rounded-full bg-emerald-500/15 animate-ping" style={{ animationDelay: "0.15s" }} />
                      <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white border-2 border-emerald-400/50 flex items-center justify-center shadow-2xl shadow-emerald-500/40">
                        <CheckCircle2 className="h-8 w-8" />
                      </div>
                    </div>
                    <div>
                      <div className="text-base font-black text-white">Return Cycle Intercepted! 🎉</div>
                      <p className="text-xs text-slate-400 max-w-[240px] mt-1">
                        Package successfully delivered to new recipient. Warehouse roundtrip eliminated completely.
                      </p>
                    </div>
                    {/* Impact strip */}
                    <div className="grid grid-cols-2 gap-2 w-full text-center text-xs">
                      <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5">
                        <div className="text-emerald-400 font-black text-sm">{formatCurrency(selectedReturn?.costSaved || 1200)}</div>
                        <div className="text-emerald-500/60 text-[10px]">Cost Saved</div>
                      </div>
                      <div className="rounded-xl bg-teal-500/10 border border-teal-500/20 p-2.5">
                        <div className="text-teal-400 font-black text-sm">{selectedReturn?.co2Saved || 85} kg</div>
                        <div className="text-teal-500/60 text-[10px]">CO₂ Avoided</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setStage("pickup")}
                      className="mt-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                    >
                      Process Next Pickup →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

