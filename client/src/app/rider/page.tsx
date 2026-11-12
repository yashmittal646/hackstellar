"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchCurrentRider,
  fetchRiderTasks,
  updateTaskStatus,
} from "../../lib/api";
import { RiderProfile, DeliveryTaskItem } from "../../types";
import { formatCurrency } from "../../lib/utils";
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
  KeyRound,
  ArrowRight,
  ShieldCheck,
  Check,
  Sparkles,
  Truck,
} from "lucide-react";

const DEMO_RIDERS = [
  {
    id: "DEMO-RIDER-01",
    name: "Vikram Sharma",
    city: "Delhi NCR",
    vehicle: "Ather 450X (EV 2W)",
  },
  {
    id: "DEMO-RIDER-02",
    name: "Ananya Patel",
    city: "Mumbai Central",
    vehicle: "Euler HiLoad (EV Van)",
  },
];

function getTaskTypeBadge(type: DeliveryTaskItem["taskType"]) {
  switch (type) {
    case "DIRECT_PEER_DELIVERY":
      return {
        label: "Peer Intercept",
        className: "bg-amber-500/15 text-amber-300 border-amber-500/30",
        icon: Zap,
      };
    case "RETURN_PICKUP":
      return {
        label: "Return Pickup",
        className: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
        icon: RotateCcw,
      };
    case "HUB_DROP":
      return {
        label: "Hub Consolidation",
        className: "bg-purple-500/15 text-purple-300 border-purple-500/30",
        icon: Package,
      };
    default:
      return {
        label: type,
        className: "bg-neutral-500/15 text-neutral-300 border-neutral-500/30",
        icon: Package,
      };
  }
}

function getStatusBadge(status: DeliveryTaskItem["status"]) {
  switch (status) {
    case "ASSIGNED":
      return "bg-slate-500/15 text-slate-300 border-slate-500/30";
    case "ACCEPTED":
      return "bg-sky-500/15 text-sky-300 border-sky-500/30";
    case "ARRIVED":
      return "bg-blue-500/15 text-blue-300 border-blue-500/30";
    case "PICKED_UP":
      return "bg-amber-500/15 text-amber-300 border-amber-500/30";
    case "IN_TRANSIT":
      return "bg-teal-500/15 text-teal-300 border-teal-500/30";
    case "DELIVERED":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    case "FAILED":
      return "bg-rose-500/15 text-rose-300 border-rose-500/30";
    default:
      return "bg-neutral-500/15 text-neutral-300 border-neutral-500/30";
  }
}

export default function RiderShiftConsole() {
  const [activeDemoId, setActiveDemoId] = useState<string>("DEMO-RIDER-01");
  const [rider, setRider] = useState<RiderProfile | null>(null);
  const [tasks, setTasks] = useState<DeliveryTaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [otpModalTask, setOtpModalTask] = useState<DeliveryTaskItem | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);

  const loadData = async (riderId?: string) => {
    try {
      setLoading(true);
      const targetId = riderId || activeDemoId;
      const riderData = await fetchCurrentRider(targetId);
      setRider(riderData);
      if (riderData?.riderId) {
        const tasksData = await fetchRiderTasks(riderData.riderId);
        setTasks(tasksData);
      }
    } catch (err) {
      console.error("Error loading rider console data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedId = typeof window !== "undefined" ? localStorage.getItem("orbit_demo_rider_id") : null;
    const initialId = savedId || "DEMO-RIDER-01";
    setActiveDemoId(initialId);
    loadData(initialId);
  }, []);

  const handleSwitchDemo = (demoId: string) => {
    setActiveDemoId(demoId);
    if (typeof window !== "undefined") {
      localStorage.setItem("orbit_demo_rider_id", demoId);
    }
    loadData(demoId);
  };

  const handleAdvanceStatus = async (task: DeliveryTaskItem, nextStatus: string) => {
    try {
      setActionLoading(task.taskId);
      const updated = await updateTaskStatus(task.taskId, nextStatus);
      setTasks((prev) => prev.map((t) => (t.taskId === updated.taskId ? updated : t)));
    } catch (err: any) {
      alert(err.message || "Failed to advance task status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpModalTask) return;
    try {
      setActionLoading(otpModalTask.taskId);
      setOtpError(null);
      const updated = await updateTaskStatus(otpModalTask.taskId, "DELIVERED", otpInput.trim());
      setTasks((prev) => prev.map((t) => (t.taskId === updated.taskId ? updated : t)));
      setOtpModalTask(null);
      setOtpInput("");
    } catch (err: any) {
      setOtpError(err.message || "Invalid OTP code.");
    } finally {
      setActionLoading(null);
    }
  };

  const completed = tasks.filter((t) => t.status === "DELIVERED").length;
  const pending = tasks.filter((t) => t.status !== "DELIVERED" && t.status !== "FAILED").length;
  const peerIntercepts = tasks.filter((t) => t.taskType === "DIRECT_PEER_DELIVERY").length;

  return (
    <div className="min-h-screen bg-[#07090e] px-4 pt-5 pb-20 max-w-2xl mx-auto w-full">
      {/* ── Demo Switcher Banner ─────────────────────────────────── */}
      <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-cyan-500/10 via-white/[0.02] to-emerald-500/10 border border-white/[0.08] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
          <span className="text-xs text-white font-semibold">Demo Persona:</span>
        </div>
        <div className="flex items-center gap-2">
          {DEMO_RIDERS.map((d) => {
            const isSelected = (rider?.riderId === d.id) || (activeDemoId === d.id);
            return (
              <button
                key={d.id}
                onClick={() => handleSwitchDemo(d.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition border ${
                  isSelected
                    ? "bg-white text-neutral-950 border-white shadow-sm font-bold"
                    : "bg-white/[0.03] text-neutral-400 hover:text-white border-white/[0.08]"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-emerald-500" : "bg-neutral-500"}`} />
                <span>{d.name.split(" ")[0]}</span>
                <span className="font-mono text-[10px] opacity-75">({d.city.split(" ")[0]})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Rider Profile Header Bar ─────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 mb-6 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
        <Link href="/profile" className="flex items-center gap-3.5 group flex-1 min-w-0">
          <div className="relative shrink-0">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500/20 via-neutral-900 to-emerald-500/20 border border-white/[0.12] flex items-center justify-center text-cyan-300 group-hover:scale-105 transition">
              {rider?.vehicle?.type === "EV_3W" ? (
                <Truck className="h-6 w-6" />
              ) : (
                <Bike className="h-6 w-6" />
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-[#07090e] animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-white font-bold text-base leading-tight truncate group-hover:text-cyan-300 transition">
                {rider?.name || "Vikram Sharma"}
              </h1>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-cyan-300 border border-white/[0.1]">
                {rider?.riderId || "DEMO-RIDER-01"}
              </span>
            </div>
            <p className="text-neutral-400 text-xs mt-0.5 flex items-center gap-1 font-mono truncate">
              <MapPin className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              {rider?.assignedHub?.name || "Delhi NCR Hub"} • {rider?.vehicle?.model || "Ather 450X"} ({rider?.vehicle?.batteryLevel ?? 85}% batt)
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/profile"
            className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center gap-1 transition"
          >
            Profile
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* ── Today's Shift Metrics (NO earningsToday, NO co2SavedKg) ─ */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[10px] text-neutral-400 font-mono uppercase">Done</span>
          </div>
          <p className="text-white font-bold text-xl">
            {completed}
            <span className="text-neutral-500 text-sm font-normal">/{tasks.length}</span>
          </p>
          <p className="text-[10px] text-neutral-400">tasks completed</p>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[10px] text-neutral-400 font-mono uppercase">Intercepts</span>
          </div>
          <p className="text-amber-300 font-bold text-xl">{peerIntercepts}</p>
          <p className="text-[10px] text-neutral-400">peer reroutes</p>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Navigation className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-[10px] text-neutral-400 font-mono uppercase">Queue</span>
          </div>
          <p className="text-cyan-300 font-bold text-xl">{pending}</p>
          <p className="text-[10px] text-neutral-400">active tasks</p>
        </div>
      </div>

      {/* ── Active Task Queue from Database ─────────────────────── */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white font-semibold text-sm flex items-center gap-2">
          <RotateCcw className="h-4 w-4 text-cyan-400" />
          Rider Task Queue (Live DB)
        </h2>
        <span className="text-[10px] font-mono text-neutral-400 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.08]">
          {tasks.length} assigned
        </span>
      </div>

      {loading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-white/[0.02] animate-pulse border border-white/[0.06]" />
          ))}
        </div>
      )}

      {!loading && tasks.length === 0 && (
        <div className="text-center py-16 rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6">
          <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
          <p className="text-white font-semibold">All tasks completed!</p>
          <p className="text-neutral-400 text-xs mt-1">
            No pending pickups or deliveries in your active route.
          </p>
        </div>
      )}

      {!loading && tasks.length > 0 && (
        <div className="space-y-3.5">
          {tasks.map((task) => {
            const isDone = task.status === "DELIVERED";
            const typeBadge = getTaskTypeBadge(task.taskType);
            const TypeIcon = typeBadge.icon;
            const isBusy = actionLoading === task.taskId;

            return (
              <div
                key={task._id || task.taskId}
                className={`relative bg-white/[0.02] border rounded-2xl p-4 transition-all ${
                  isDone
                    ? "border-white/[0.05] opacity-60"
                    : "border-white/[0.08] hover:border-cyan-500/40"
                }`}
              >
                {!isDone && (
                  <span className="absolute left-0 top-3 bottom-3 w-1 rounded-full bg-cyan-400" />
                )}

                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
                    <Package className="h-5 w-5 text-neutral-300" />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${typeBadge.className}`}>
                            <TypeIcon className="h-2.5 w-2.5" />
                            {typeBadge.label}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400">
                            #{task.taskId}
                          </span>
                        </div>
                        <p className="text-white font-bold text-sm leading-snug line-clamp-1 mt-1">
                          {task.itemDetails?.title || "Parcel Unit"}
                        </p>
                      </div>

                      <span className={`shrink-0 text-[10px] font-mono px-2 py-0.5 rounded-full border ${getStatusBadge(task.status)}`}>
                        {task.status.replace(/_/g, " ")}
                      </span>
                    </div>

                    {/* Address & Meta */}
                    <div className="mt-2 space-y-1 text-xs text-neutral-400">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="h-3 w-3 text-cyan-400 shrink-0" />
                        <span className="text-neutral-300 font-medium truncate">
                          {task.taskType === "RETURN_PICKUP"
                            ? `Pickup: ${task.pickupAddress?.street}, ${task.pickupAddress?.city}`
                            : `Deliver: ${task.deliveryAddress?.street}, ${task.deliveryAddress?.city}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-neutral-400 font-mono">
                        <span>Est: {task.estimatedMinutes} mins</span>
                        <span>•</span>
                        <span>Dist: {task.distanceKm} km</span>
                        <span>•</span>
                        <span className="text-neutral-300 font-semibold">
                          Val: {formatCurrency(task.itemDetails?.value || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Operational Action Controls */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.05] flex-wrap">
                      {task.status === "ASSIGNED" && (
                        <button
                          disabled={isBusy}
                          onClick={() => handleAdvanceStatus(task, "ACCEPTED")}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-bold transition disabled:opacity-50"
                        >
                          <Navigation className="h-3 w-3" />
                          Accept Task
                        </button>
                      )}

                      {task.status === "ACCEPTED" && (
                        <button
                          disabled={isBusy}
                          onClick={() => handleAdvanceStatus(task, "ARRIVED")}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold transition disabled:opacity-50"
                        >
                          <MapPin className="h-3 w-3" />
                          Mark Arrived
                        </button>
                      )}

                      {(task.status === "ARRIVED" || task.status === "PICKED_UP" || task.status === "IN_TRANSIT") && (
                        <>
                          <Link
                            href={`/scanner?taskId=${task.taskId}&title=${encodeURIComponent(task.itemDetails.title)}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-medium border border-white/[0.1] transition"
                          >
                            Inspect & Scan
                          </Link>
                          <button
                            disabled={isBusy}
                            onClick={() => {
                              setOtpModalTask(task);
                              setOtpInput(task.otp || "");
                              setOtpError(null);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition disabled:opacity-50"
                          >
                            <KeyRound className="h-3 w-3" />
                            Verify OTP & Complete
                          </button>
                        </>
                      )}

                      {isDone && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Completed & Logged to DB
                        </span>
                      )}

                      {task.otp && !isDone && (
                        <span className="text-[10px] font-mono text-neutral-400 ml-auto bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.06]">
                          OTP: {task.otp}
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

      {/* ── OTP Verification Modal ───────────────────────────────── */}
      {otpModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#0b0e14] border border-white/[0.12] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Customer Handover OTP</h3>
                  <p className="text-[11px] text-neutral-400">Task #{otpModalTask.taskId}</p>
                </div>
              </div>
              <button
                onClick={() => setOtpModalTask(null)}
                className="text-neutral-400 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-300 mb-4">
              Ask customer for the verification code to confirm handover:
            </p>

            <div className="space-y-3">
              <input
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                placeholder="Enter OTP"
                className="w-full text-center tracking-widest text-xl font-mono py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.15] text-white focus:outline-none focus:border-cyan-400"
              />

              {otpError && (
                <p className="text-xs text-rose-400 flex items-center gap-1 font-mono">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  {otpError}
                </p>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setOtpModalTask(null)}
                  className="flex-1 py-2 text-xs font-semibold text-neutral-400 hover:text-white rounded-xl bg-white/[0.04] transition"
                >
                  Cancel
                </button>
                <button
                  disabled={actionLoading === otpModalTask.taskId}
                  onClick={handleVerifyOtp}
                  className="flex-1 py-2 text-xs font-bold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <Check className="h-3.5 w-3.5" />
                  Confirm Handover
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Shift Info Footer ────────────────────────────────────── */}
      <div className="mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] flex items-center gap-3">
        <Clock className="h-5 w-5 text-neutral-400 shrink-0" />
        <div>
          <p className="text-xs text-neutral-300 font-medium">
            Shift active in {rider?.assignedHub?.name || "Delhi NCR"} Zone
          </p>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Deliveries and reverse pickups synchronize autonomously with the central routing engine.
          </p>
        </div>
      </div>
    </div>
  );
}
