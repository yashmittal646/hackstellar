"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchPendingOrders, processReturnRouting } from "../../../lib/api";
import { Order } from "../../../types";
import { formatCurrency } from "../../../lib/utils";
import { 
  Sparkles, 
  UploadCloud, 
  CheckCircle, 
  ShieldCheck, 
  Truck, 
  ArrowRight,
  RotateCcw,
  AlertCircle,
  Scan,
  Box,
  Eye,
  CheckCircle2
} from "lucide-react";

const REASONS = [
  { category: "changed_mind", label: "Changed my mind / No longer needed", expected: "Pristine condition — High chance of Direct Peer Reroute" },
  { category: "size_issue", label: "Size or fit issue", expected: "Unopened / Like new — High chance of Peer or Hub Staging" },
  { category: "not_as_described", label: "Item looks different from description", expected: "Good condition — Evaluated for Hub or Resale" },
  { category: "damaged", label: "Damaged during transit / dented box", expected: "Defective score — Direct to Central Warehouse" },
  { category: "defective", label: "Product not turning on / missing parts", expected: "Defective — Mandatory Warehouse Inspection" },
];

export default function NewReturnSimulationPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [category, setCategory] = useState<string>("changed_mind");
  const [reasonText, setReasonText] = useState<string>("Customer decided to return item.");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const ords = await fetchPendingOrders();
        setOrders(ords);
        if (ords.length > 0) setSelectedOrderId(ords[0]._id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) return;
    setIsSubmitting(true);
    setResult(null);

    const selectedOrder = orders.find((o) => o._id === selectedOrderId);
    if (!selectedOrder) return;

    try {
      const formData = new FormData();
      formData.append("originalOrderId", selectedOrder._id);
      formData.append("userId", typeof selectedOrder.userId === "object" ? selectedOrder.userId._id : selectedOrder.userId);
      formData.append("productId", typeof selectedOrder.productId === "object" ? selectedOrder.productId._id : selectedOrder.productId);
      formData.append("reason", reasonText);
      formData.append("reasonCategory", category);
      formData.append("pickupAddress[street]", selectedOrder.deliveryAddress.street);
      formData.append("pickupAddress[city]", selectedOrder.deliveryAddress.city);
      formData.append("pickupAddress[state]", selectedOrder.deliveryAddress.state);
      formData.append("pickupAddress[pincode]", selectedOrder.deliveryAddress.pincode);
      formData.append("pickupAddress[coordinates][lat]", selectedOrder.deliveryAddress.coordinates.lat.toString());
      formData.append("pickupAddress[coordinates][lng]", selectedOrder.deliveryAddress.coordinates.lng.toString());

      // 1. Create return
      const res = await fetch("http://localhost:5000/api/returns", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      const returnDoc = data.data;

      // 2. Trigger automatic AI routing
      const routingRes = await processReturnRouting(returnDoc._id);
      setResult(routingRes.data);
    } catch (err) {
      alert("Failed to simulate return");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedOrder = orders.find((o) => o._id === selectedOrderId);

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
          <Sparkles className="h-3.5 w-3.5" /> Interactive Demonstration
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
          Simulate Return & Autonomous Interception
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Pick an order and return conditions to watch the multi-factor scoring engine re-route the product away from the warehouse.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Order Select */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Select Test Order & Product
              </label>
              {loading ? (
                <div className="text-xs text-slate-500">Loading demo orders...</div>
              ) : (
                <select
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {orders.map((ord) => (
                    <option key={ord._id} value={ord._id}>
                      {ord.orderId} — {typeof ord.productId === "object" ? ord.productId.name : "Product"} (
                      {ord.deliveryAddress.city})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Category Select */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Return Reason Category
              </label>
              <div className="grid grid-cols-1 gap-2">
                {REASONS.map((r) => (
                  <label
                    key={r.category}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      category === r.category
                        ? "bg-indigo-600/10 border-indigo-500/40 text-white"
                        : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="reasonCategory"
                      value={r.category}
                      checked={category === r.category}
                      onChange={() => setCategory(r.category)}
                      className="mt-1 accent-indigo-500"
                    />
                    <div>
                      <div className="text-xs font-bold">{r.label}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{r.expected}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Reason Text */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Customer Reason Notes
              </label>
              <textarea
                value={reasonText}
                onChange={(e) => setReasonText(e.target.value)}
                rows={2}
                className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Simulated Image Upload */}
            <div className="p-4 rounded-2xl border border-dashed border-slate-800 bg-slate-950/50 flex flex-col items-center justify-center text-center gap-2">
              <Scan className="h-6 w-6 text-indigo-400 animate-pulse" />
              <div className="text-xs font-semibold text-slate-300">
                AI Computer Vision Inspection
              </div>
              <p className="text-[11px] text-slate-500">
                Visual analysis examines packaging integrity, barcode presence, factory seal, and surface wear.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !selectedOrderId}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Analyzing Condition, Fraud & Nearby Orders...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Run Autonomous Routing Interception
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results / Telemetry Column */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (
            <div className="rounded-3xl border border-emerald-500/40 bg-emerald-950/20 p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-300">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle className="h-4 w-4" /> Interception Complete
                </span>
                <span className="font-mono text-xs font-bold text-slate-400">{result.return.returnId}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Assigned Route</span>
                <div className="text-2xl font-black text-white mt-0.5">
                  {result.routingResult.destination === "direct_to_customer"
                    ? "🚀 Direct Peer Match"
                    : result.routingResult.destination === "nearby_hub"
                    ? "📦 Regional Hub Staging"
                    : "🏭 Central Warehouse"}
                </div>
              </div>

              {/* Computer Vision Telemetry */}
              {result.conditionResult?.telemetry && (
                <div className="rounded-2xl bg-slate-950/80 p-3.5 border border-slate-800 space-y-2">
                  <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
                    <Eye className="h-3 w-3" /> CV Visual Telemetry
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Box Packaging</span>
                      <span className="font-semibold text-slate-200">
                        {result.conditionResult.telemetry.packagingIntegrity}% Intact
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Factory Seal</span>
                      <span className={`font-semibold ${
                        result.conditionResult.telemetry.sealAuthenticity === "VERIFIED"
                          ? "text-emerald-400"
                          : "text-amber-400"
                      }`}>
                        {result.conditionResult.telemetry.sealAuthenticity}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Closed-loop Order Update notification */}
              {result.routingResult.destination === "direct_to_customer" && (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Closed-Loop Fulfillment Complete!
                  </div>
                  <p className="text-[11px] text-emerald-200/80">
                    A pending order has been automatically matched and marked as <strong>SHIPPED</strong> without waiting for warehouse restocking.
                  </p>
                </div>
              )}

              {/* Savings Breakdown */}
              <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Logistics Cost Saved:</span>
                  <span className="font-bold text-emerald-400">{formatCurrency(result.routingResult.costSaved)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">CO₂ Avoided:</span>
                  <span className="font-bold text-teal-400">{result.routingResult.co2Saved} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Delivery Time Saved:</span>
                  <span className="font-bold text-amber-400">{result.routingResult.timeSaved} hours</span>
                </div>
              </div>

              <button
                onClick={() => router.push(`/returns/${result.return._id}`)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                Inspect Routing Breakdown <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-indigo-400" />
                Interception Architecture
              </h3>
              <ul className="text-xs text-slate-400 space-y-3">
                <li className="flex items-start gap-2.5">
                  <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 text-xs font-mono font-bold">01</div>
                  <span><strong>AI Visual Assessment:</strong> Image metadata & visual defect checks determine if item is resalable immediately.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 text-xs font-mono font-bold">02</div>
                  <span><strong>Fraud Scoring:</strong> 6 behavioral signals calculate risk score. High risk items are quarantined to warehouse.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 text-xs font-mono font-bold">03</div>
                  <span><strong>Demand Matching:</strong> MongoDB geospatial index finds pending orders for the same SKU within 25km.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 text-xs font-mono font-bold">04</div>
                  <span><strong>Closed-Loop Reroute:</strong> Diverted directly to customer or regional staging hub.</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
