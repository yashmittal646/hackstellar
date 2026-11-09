import Link from "next/link";
import { ReturnItem } from "../types";
import { formatCurrency } from "../lib/utils";
import { 
  ArrowRight, 
  MapPin, 
  ShieldAlert, 
  Sparkles, 
  Truck, 
  CheckCircle2, 
  AlertTriangle 
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
            <Truck className="h-3 w-3" /> Direct to Customer
          </span>
        );
      case "nearby_hub":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <MapPin className="h-3 w-3" /> Nearby Hub
          </span>
        );
      case "central_warehouse":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="h-3 w-3" /> Central Warehouse
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/30">
            Awaiting Decision
          </span>
        );
    }
  };

  const getConditionBadge = () => {
    const grades = {
      pristine: { label: "Pristine", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
      good: { label: "Good", color: "text-teal-400 border-teal-500/30 bg-teal-500/10" },
      fair: { label: "Fair", color: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
      damaged: { label: "Damaged", color: "text-rose-400 border-rose-500/30 bg-rose-500/10" },
      defective: { label: "Defective", color: "text-rose-500 border-rose-600/30 bg-rose-600/10" },
    };
    const grade = grades[item.conditionGrade] || grades.good;
    return (
      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${grade.color}`}>
        {grade.label} ({item.conditionScore}/100)
      </span>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition-all hover:border-slate-700 hover:bg-slate-900/90 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-indigo-400">{item.returnId}</span>
          <span className="text-xs text-slate-500">•</span>
          <span className="text-xs text-slate-400">{item.pickupAddress?.city || "Unknown City"}</span>
        </div>
        <div className="flex items-center gap-2">
          {item.fraudRisk === "high" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
              <ShieldAlert className="h-3 w-3" /> Fraud Risk
            </span>
          )}
          {getDestinationBadge()}
        </div>
      </div>

      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h4 className="font-bold text-slate-100 text-base leading-snug">
            {item.productId?.name || "Product"}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Reason: <span className="text-slate-300 italic font-medium">"{item.reason}"</span>
          </p>
        </div>
        <div className="text-right whitespace-nowrap">
          <div className="text-sm font-bold text-slate-200">
            {formatCurrency(item.productId?.price || 0)}
          </div>
          <div className="mt-1">{getConditionBadge()}</div>
        </div>
      </div>

      {item.routingDestination && (
        <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800/80 mb-3 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Saved ₹</span>
            <span className="font-bold text-emerald-400">{formatCurrency(item.costSaved)}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">CO₂ Offset</span>
            <span className="font-bold text-teal-400">{item.co2Saved} kg</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Hours Saved</span>
            <span className="font-bold text-amber-400">{item.timeSaved}h</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
        <div className="text-xs text-slate-400">
          User: <span className="font-medium text-slate-300">{item.userId?.name || "Customer"}</span>
        </div>

        <div className="flex items-center gap-2">
          {!item.routingDestination && onProcess && (
            <button
              onClick={() => onProcess(item._id)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20"
            >
              <Sparkles className="h-3 w-3" /> Auto-Route
            </button>
          )}
          <Link
            href={`/returns/${item._id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Details <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

