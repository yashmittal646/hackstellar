"use client";

import { DashboardStats } from "../types";
import { formatCurrency } from "../lib/utils";
import { 
  TrendingUp, 
  Leaf, 
  Clock, 
  RotateCcw, 
  ShieldAlert, 
  Warehouse
} from "lucide-react";

interface KPICardsProps {
  stats: DashboardStats;
}

export function KPICards({ stats }: KPICardsProps) {
  const directCount = stats.routingBreakdown["direct_to_customer"] || 0;
  const hubCount = stats.routingBreakdown["nearby_hub"] || 0;
  const warehouseCount = stats.routingBreakdown["central_warehouse"] || 0;
  const totalRouted = directCount + hubCount + warehouseCount;
  const interceptRate = totalRouted > 0 
    ? Math.round(((directCount + hubCount) / totalRouted) * 100) 
    : 0;

  const cards = [
    {
      title: "Logistics Cost Saved",
      value: formatCurrency(stats.savings.totalCostSaved),
      subtitle: `${stats.savings.distanceSaved.toLocaleString()} km transport avoided`,
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Interception Success Rate",
      value: `${interceptRate}%`,
      subtitle: `${directCount} Direct to Customer • ${hubCount} to Regional Hub`,
      icon: RotateCcw,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10 border-indigo-500/20",
    },
    {
      title: "Carbon Offset (CO₂)",
      value: `${stats.savings.totalCo2Saved.toFixed(1)} kg`,
      subtitle: "Green logistics rerouting efficiency",
      icon: Leaf,
      color: "text-teal-400",
      bg: "bg-teal-500/10 border-teal-500/20",
    },
    {
      title: "Turnaround Time Saved",
      value: `${stats.savings.totalTimeSaved.toFixed(0)} hrs`,
      subtitle: "Faster restocking & second-life delivery",
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Fraud Blocked / Flagged",
      value: stats.totalFraudAlerts.toString(),
      subtitle: `${stats.fraudBreakdown["high"] || 0} high risk flagged for inspection`,
      icon: ShieldAlert,
      color: "text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20",
    },
    {
      title: "Avoided Warehouse Overload",
      value: `${warehouseCount} / ${totalRouted}`,
      subtitle: "Only damaged/fraud sent to main facility",
      icon: Warehouse,
      color: "text-sky-400",
      bg: "bg-sky-500/10 border-sky-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`rounded-2xl border p-5 transition-all hover:scale-[1.01] ${card.bg}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-400">{card.title}</span>
              <div className={`p-2 rounded-xl bg-slate-900/60 ${card.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold tracking-tight text-white mb-1">
              {card.value}
            </div>
            <p className="text-xs text-slate-400 font-medium">{card.subtitle}</p>
          </div>
        );
      })}
    </div>
  );
}

