"use client";

import { DashboardStats } from "../types";
import { formatCurrency } from "../lib/utils";
import { useEffect, useState, useRef } from "react";
import {
  TrendingUp,
  Leaf,
  Clock,
  RotateCcw,
  ShieldAlert,
  Warehouse,
} from "lucide-react";

interface KPICardsProps {
  stats: DashboardStats;
}

export function KPICardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-5 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-3.5 w-32 bg-slate-800 rounded" />
        <div className="w-9 h-9 bg-slate-800 rounded-xl" />
      </div>
      <div className="h-8 w-24 bg-slate-800 rounded mb-2" />
      <div className="h-3 w-40 bg-slate-800/60 rounded" />
    </div>
  );
}

/** Animated counter hook — counts from 0 to target over ~800ms */
function useCountUp(target: number, duration = 800) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) { setCurrent(0); return; }
    startRef.current = null;
    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const pct = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - pct, 3);
      setCurrent(Math.round(eased * target));
      if (pct < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return current;
}

export function KPICards({ stats }: KPICardsProps) {
  const directCount = stats.routingBreakdown["direct_to_customer"] || 0;
  const hubCount = stats.routingBreakdown["nearby_hub"] || 0;
  const warehouseCount = stats.routingBreakdown["central_warehouse"] || 0;
  const totalRouted = directCount + hubCount + warehouseCount;
  const interceptRate =
    totalRouted > 0
      ? Math.round(((directCount + hubCount) / totalRouted) * 100)
      : 0;

  // Animated counters
  const animCost = useCountUp(Math.round(stats.savings.totalCostSaved));
  const animIntercept = useCountUp(interceptRate);
  const animCo2 = useCountUp(Math.round(stats.savings.totalCo2Saved * 10));
  const animTime = useCountUp(Math.round(stats.savings.totalTimeSaved));
  const animFraud = useCountUp(stats.totalFraudAlerts);
  const animBypass = useCountUp(
    totalRouted > 0 ? Math.round(((directCount + hubCount) / totalRouted) * 100) : 0
  );

  const cards = [
    {
      title: "Logistics Cost Saved",
      value: `₹${animCost.toLocaleString()}`,
      subtitle: `${stats.savings.distanceSaved.toLocaleString()} km transport avoided`,
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/8 border-emerald-500/20",
      glow: "shadow-emerald-500/10",
    },
    {
      title: "Interception Success Rate",
      value: `${animIntercept}%`,
      subtitle: `${directCount} Direct Peer · ${hubCount} Hub Staged`,
      icon: RotateCcw,
      color: "text-indigo-400",
      bg: "bg-indigo-500/8 border-indigo-500/20",
      glow: "shadow-indigo-500/10",
    },
    {
      title: "Carbon Offset (CO₂)",
      value: `${(animCo2 / 10).toFixed(1)} kg`,
      subtitle: "Green logistics rerouting efficiency",
      icon: Leaf,
      color: "text-teal-400",
      bg: "bg-teal-500/8 border-teal-500/20",
      glow: "shadow-teal-500/10",
    },
    {
      title: "Turnaround Time Saved",
      value: `${animTime} hrs`,
      subtitle: "Faster restocking & second-life delivery",
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/8 border-amber-500/20",
      glow: "shadow-amber-500/10",
    },
    {
      title: "Fraud Blocked / Flagged",
      value: animFraud.toString(),
      subtitle: `${stats.fraudBreakdown["high"] || 0} high risk sent to quarantine`,
      icon: ShieldAlert,
      color: "text-rose-400",
      bg: "bg-rose-500/8 border-rose-500/20",
      glow: "shadow-rose-500/10",
    },
    {
      title: "Warehouse Bypass Rate",
      value: `${animBypass}%`,
      subtitle: `Only ${warehouseCount} of ${totalRouted} sent to main facility`,
      icon: Warehouse,
      color: "text-sky-400",
      bg: "bg-sky-500/8 border-sky-500/20",
      glow: "shadow-sky-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`rounded-2xl border p-5 transition-all hover:scale-[1.01] hover:shadow-lg ${card.bg} ${card.glow}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-400">{card.title}</span>
              <div className={`p-2 rounded-xl bg-slate-900/60 ${card.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-black tracking-tight text-white mb-1">
              {card.value}
            </div>
            <p className="text-xs text-slate-400 font-medium">{card.subtitle}</p>
          </div>
        );
      })}
    </div>
  );
}
