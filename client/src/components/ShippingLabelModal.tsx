"use client";

import { ReturnItem } from "../types";
import { formatCurrency } from "../lib/utils";
import { X, Printer, CheckCircle, QrCode, Truck } from "lucide-react";

interface ShippingLabelModalProps {
  item: ReturnItem;
  isOpen: boolean;
  onClose: () => void;
}

export function ShippingLabelModal({ item, isOpen, onClose }: ShippingLabelModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const isPeer = item.routingDestination === "direct_to_customer";
  const destinationAddress = isPeer
    ? (item.matchedOrderId as any)?.deliveryAddress
    : (item.assignedHubId as any)?.address;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-emerald-400" />
            <h3 className="font-bold text-base text-white">Dynamic Intercept Waybill & Label</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Thermal Label Styled Box */}
        <div className="p-6 bg-white text-slate-950 rounded-2xl shadow-inner font-mono text-xs space-y-4 border-2 border-dashed border-slate-400">
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3">
            <div>
              <div className="text-xl font-black tracking-tighter">ORBITRETURN LOGISTICS</div>
              <div className="text-[10px] text-slate-600 font-bold tracking-widest uppercase">
                Autonomous Intercept Waybill
              </div>
            </div>
            <div className="px-2.5 py-1 bg-emerald-600 text-white rounded font-bold text-[10px] tracking-wider uppercase">
              WAREHOUSE BYPASS
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[11px] pb-3 border-b border-slate-300">
            <div>
              <span className="text-[9px] text-slate-500 font-bold uppercase block">ORIGIN (PICKUP):</span>
              <strong className="text-slate-900 block">{item.userId?.name}</strong>
              <div className="text-slate-700 leading-tight mt-0.5">
                {item.pickupAddress?.street}<br />
                {item.pickupAddress?.city}, {item.pickupAddress?.state} - {item.pickupAddress?.pincode}
              </div>
            </div>

            <div>
              <span className="text-[9px] text-slate-500 font-bold uppercase block">
                {isPeer ? "PEER DESTINATION (DROP):" : "REGIONAL HUB (STAGE):"}
              </span>
              <strong className="text-slate-900 block">
                {isPeer ? "Direct Customer Fulfillment" : item.assignedHubId?.name || "Regional Micro-Hub"}
              </strong>
              <div className="text-slate-700 leading-tight mt-0.5">
                {destinationAddress?.street || "Hub Depot"}<br />
                {destinationAddress?.city || item.pickupAddress?.city}, {destinationAddress?.state} - {destinationAddress?.pincode}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between py-2 bg-slate-100 px-3 rounded text-[11px]">
            <div>
              <span className="text-[9px] text-slate-500 uppercase block">SKU / ITEM:</span>
              <strong className="text-slate-900">{item.productId?.name}</strong>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-slate-500 uppercase block">CONDITION:</span>
              <strong className="text-emerald-700 uppercase">{item.conditionGrade} ({item.conditionScore}/100)</strong>
            </div>
          </div>

          {/* Barcode Mock */}
          <div className="text-center pt-2 space-y-1">
            <div className="h-10 bg-slate-900 flex items-center justify-center text-white tracking-[6px] font-bold text-xs rounded select-none">
              ||| | ||||| || |||| ||||| |||
            </div>
            <span className="text-[10px] text-slate-600 font-bold">{item.returnId}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-400">
            Waybill generated autonomously via MongoDB geospatial match.
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
          >
            <Printer className="h-3.5 w-3.5" /> Print Manifest Label
          </button>
        </div>
      </div>
    </div>
  );
}

