"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchRecentReturns } from "../lib/api";
import { ReturnItem } from "../types";
import { formatCurrency } from "../lib/utils";
import {
  Navigation,
  Package,
  MapPin,
  CheckCircle2,
  Clock,
  Bike,
  User,
  ChevronRight,
  Zap,
  RotateCcw,
  AlertCircle,
} from "lucide-react";

function statusColor(status: string) {
  const map: Record<string, string> = {
    initiated: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    picked_up: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    in_transit: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    condition_check: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    routed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    out_for_delivery: "bg-teal-500/15 text-teal-400 border-teal-500/30",
    delivered: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  };
  return map[status] ?? "bg-slate-500/15 text-slate-400 border-slate-500/30";
}

function statusLabel(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function RiderShiftConsole() {
  const [tasks, setTasks] = useState<ReturnItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentReturns()
      .then(setTasks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pending = tasks.filter((t) => t.status === "initiated" || t.status === "picked_up" || t.status === "in_transit").length;
  const completed = tasks.filter((t) => t.status === "delivered" || t.status === "routed").length;
  const intercepts = tasks.filter((t) => t.routingDestination === "direct_to_customer").length;

  return (
    <div className="min-h-screen bg-[#07090e] px-4 pt-5 pb-8 max-w-2xl mx-auto w-full">
      {/* ── Rider Profile Header ───────────────────────────────── */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative shrink-0">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Bike className="h-7 w-7 text-white" />
          </div>
          <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-400 border-2 border-[#07090e] animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-white font-bold text-lg leading-tight">Vikram Sharma</h1>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              EV-44
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1.5">
            <MapPin className="h-3 w-3 text-emerald-400 shrink-0" />
            Delhi NCR Hub
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            On Duty
          </span>
        </div>
      </div>

      {/* ── Today's Stats ──────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[10px] text-slate-500 font-mono uppercase">Done</span>
          </div>
          <p className="text-white font-bold text-xl">
            {completed}
            <span className="text-slate-500 text-sm font-normal">/{tasks.length}</span>
          </p>
          <p className="text-[10px] text-slate-500">tasks</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[10px] text-slate-500 font-mono uppercase">Intercepts</span>
          </div>
          <p className="text-white font-bold text-xl">{intercepts}</p>
          <p className="text-[10px] text-slate-500">peer reroutes</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Navigation className="h-3.5 w-3.5 text-sky-400" />
            <span className="text-[10px] text-slate-500 font-mono uppercase">Pending</span>
          </div>
          <p className="text-white font-bold text-xl">{pending}</p>
          <p className="text-[10px] text-slate-500">active tasks</p>
        </div>
      </div>

      {/* ── Active Task Queue ──────────────────────────────────── */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white font-semibold text-sm flex items-center gap-2">
          <RotateCcw className="h-4 w-4 text-emerald-400" />
          Return Pickup Tasks
        </h2>
        <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
          {tasks.length} assigned
        </span>
      </div>

      {loading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-slate-800/50 animate-pulse border border-slate-800" />
          ))}
        </div>
      )}

      {!loading && tasks.length === 0 && (
        <div className="text-center py-16">
          <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
          <p className="text-white font-semibold">All tasks complete!</p>
          <p className="text-slate-500 text-sm mt-1">Great work today, Vikram.</p>
        </div>
      )}

      {!loading && tasks.length > 0 && (
        <div className="space-y-3">
          {tasks.map((task) => {
            const product =
              typeof task.productId === "object" ? task.productId : null;
            const user =
              typeof task.userId === "object" ? task.userId : null;
            const isDone =
              task.status === "delivered" || task.status === "routed";

            return (
              <div
                key={task._id}
                className={`relative bg-slate-900/60 border rounded-xl p-4 transition-all ${
                  isDone
                    ? "border-slate-800 opacity-60"
                    : "border-slate-700 hover:border-emerald-500/40"
                }`}
              >
                {/* Priority stripe */}
                {!isDone && (
                  <span className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-emerald-500 ml-0" />
                )}

                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                    <Package className="h-5 w-5 text-slate-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-white font-semibold text-sm leading-snug line-clamp-1">
                        {product?.name ?? "Unknown Product"}
                      </p>
                      <span
                        className={`shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded-full border ${statusColor(task.status)}`}
                      >
                        {statusLabel(task.status)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {user && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <User className="h-3 w-3" />
                          {user.name}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <MapPin className="h-3 w-3" />
                        {task.pickupAddress?.city}
                      </span>
                      {product?.price && (
                        <span className="text-[11px] text-slate-500">
                          {formatCurrency(product.price)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      {!isDone ? (
                        <Link
                          href={`/scanner?returnId=${task._id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold transition-colors"
                        >
                          <Navigation className="h-3 w-3" />
                          Start Pickup
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Completed
                        </span>
                      )}

                      {task.routingDestination === "direct_to_customer" && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <Zap className="h-2.5 w-2.5" />
                          INTERCEPT
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Shift Banner ───────────────────────────────────────── */}
      <div className="mt-6 p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center gap-3">
        <Clock className="h-5 w-5 text-slate-500 shrink-0" />
        <div>
          <p className="text-xs text-slate-400 font-medium">Shift started at 09:00 AM</p>
          <p className="text-[11px] text-slate-600 mt-0.5">
            Scan a package at a customer doorstep to trigger the AI routing engine.
          </p>
        </div>
      </div>
    </div>
  );
}
