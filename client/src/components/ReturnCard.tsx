import Link from "next/link";
import { ReturnItem } from "../types";
import { formatCurrency } from "../lib/utils";
import {
  ArrowRight,
  MapPin,
  ShieldAlert,
  Sparkles,
  Truck,
  AlertTriangle,
  Zap,
} from "lucide-react";

interface ReturnCardProps {
  item: ReturnItem;
  onProcess?: (id: string) => void;
}

export function ReturnCard({ item, onProcess }: ReturnCardProps) {
  const getDestinationBadge = () => {
    switch (item.routingDestination) {
      case "direct_to_customer":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Truck className="h-3 w-3" /> Direct Peer
          </span>
        );
      case "nearby_hub":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <MapPin className="h-3 w-3" /> Hub Staged
          </span>
        );
      case "central_warehouse":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="h-3 w-3" /> Warehouse
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/25 animate-pulse">
            <Sparkles className="h-3 w-3" /> Awaiting AI
          </span>
        );
    }
  };

  const getConditionColor = () => {
    const grade = item.conditionGrade;
    if (grade === "pristine") return "text-emerald-400";
    if (grade === "good") return "text-teal-400";
    if (grade === "fair") return "text-amber-400";
    return "text-rose-400";
  };

  const getConditionLabel = () => {
    const grade = item.conditionGrade;
    if (grade === "pristine") return "Pristine";
    if (grade === "good") return "Good";
    if (grade === "fair") return "Fair";
    if (grade === "damaged") return "Damaged";
    return "Defective";
  };

  // Score ring percentage for routing score
  const score = Math.min(100, Math.max(0, item.routingScore || 0));
  const circumference = 2 * Math.PI * 14; // radius 14
  const dash = (score / 100) * circumference;

  const isUnrouted = !item.routingDestination;
  const isHighFraud = item.fraudRisk === "high";
  const conditionScore = item.conditionScore || 0;
  const conditionBarColor =
    conditionScore >= 75 ? "bg-emerald-500" : conditionScore >= 45 ? "bg-amber-500" : "bg-red-500";

  return (
    <div
      className={`rounded-2xl border p-5 transition-all hover:scale-[1.01] hover:shadow-xl shadow-sm ${
        isHighFraud
          ? "border-rose-500/30 bg-rose-950/10 hover:border-rose-500/50"
          : isUnrouted
          ? "border-violet-500/20 bg-[#0d0a1a]/60 hover:border-violet-500/40"
          : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
      }`}
    >
      {/* Top Row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-xs font-bold text-indigo-400 truncate">{item.returnId}</span>
          <span className="text-xs text-slate-500 flex-shrink-0">•</span>
          <span className="text-xs text-slate-400 flex-shrink-0">{item.pickupAddress?.city || "Unknown"}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isHighFraud && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
              <ShieldAlert className="h-2.5 w-2.5" /> FRAUD
            </span>
          )}
          {getDestinationBadge()}
        </div>
      </div>

      {/* Product + Score Row */}
      <div className="flex items-start gap-3 mb-3">
        {/* Routing score ring */}
        {!isUnrouted && (
          <div className="flex-shrink-0 relative w-10 h-10">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke={score >= 80 ? "#10b981" : score >= 55 ? "#6366f1" : "#f43f5e"}
                strokeWidth="3"
                strokeDasharray={`${dash} ${circumference}`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white">
              {score}
            </span>
          </div>
        )}
        {isUnrouted && (
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-violet-400" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-100 text-sm leading-snug truncate">
            {(item.productId as any)?.name || "Product"}
          </h4>
          <p className="text-xs text-slate-500 mt-0.5 truncate italic">"{item.reason}"</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-[10px] font-semibold ${getConditionColor()}`}>
              {getConditionLabel()}
            </span>
            {/* Condition mini-bar */}
            <div className="flex-1 h-1 rounded-full bg-slate-800 overflow-hidden max-w-[48px]">
              <div
                className={`h-full rounded-full ${conditionBarColor}`}
                style={{ width: `${conditionScore}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500">
              {formatCurrency((item.productId as any)?.price || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Savings row (only if routed) */}
      {item.routingDestination && (
        <div className="rounded-xl bg-slate-950/60 p-2.5 border border-slate-800/80 mb-3 flex items-center justify-between gap-2 text-[10px]">
          <div className="text-center">
            <span className="text-slate-500 block uppercase font-semibold">Saved</span>
            <span className="font-bold text-emerald-400">{formatCurrency(item.costSaved)}</span>
          </div>
          <div className="w-px h-6 bg-slate-800" />
          <div className="text-center">
            <span className="text-slate-500 block uppercase font-semibold">CO₂</span>
            <span className="font-bold text-teal-400">{item.co2Saved} kg</span>
          </div>
          <div className="w-px h-6 bg-slate-800" />
          <div className="text-center">
            <span className="text-slate-500 block uppercase font-semibold">Time</span>
            <span className="font-bold text-amber-400">{item.timeSaved}h</span>
          </div>
          <div className="w-px h-6 bg-slate-800" />
          <div className="text-center">
            <span className="text-slate-500 block uppercase font-semibold">Dist</span>
            <span className="font-bold text-sky-400">
              {Math.max(0, item.originalDistance - item.optimizedDistance)}km
            </span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
        <div className="text-xs text-slate-500">
          <span className="text-slate-400 font-medium">{item.userId?.name || "Customer"}</span>
        </div>

        <div className="flex items-center gap-2">
          {isUnrouted && onProcess && (
            <button
              onClick={() => onProcess(item._id)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20"
            >
              <Zap className="h-2.5 w-2.5" /> Route
            </button>
          )}
          <Link
            href={`/returns/${item._id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            View <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
