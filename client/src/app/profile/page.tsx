"use client";

import { useEffect, useState } from "react";
import {
  fetchCurrentRider,
  updateRiderStatus,
  updateRiderProfile,
} from "../../lib/api";
import { RiderProfile } from "../../types";
import {
  User,
  Shield,
  Phone,
  Mail,
  MapPin,
  Zap,
  BatteryCharging,
  Award,
  CheckCircle2,
  Clock,
  Edit2,
  Save,
  X,
  Truck,
  RotateCw,
  PhoneCall,
  ChevronRight,
} from "lucide-react";

export default function ProfilePage() {
  const [rider, setRider] = useState<RiderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await fetchCurrentRider();
      setRider(data);
      setPhoneInput(data.phone || "");
      setEmailInput(data.email || "");
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to load rider profile from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleStatusChange = async (newStatus: "ON_DUTY" | "BREAK" | "OFF_DUTY") => {
    if (!rider || updatingStatus) return;
    try {
      setUpdatingStatus(true);
      const updated = await updateRiderStatus(rider.riderId, newStatus);
      setRider(updated);
    } catch (err: any) {
      console.error(err);
      alert("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!rider) return;
    try {
      const updated = await updateRiderProfile(rider.riderId, {
        phone: phoneInput,
        email: emailInput,
      });
      setRider(updated);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      alert("Failed to save profile changes");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] px-4 pt-8 pb-16 max-w-3xl mx-auto w-full">
        <div className="animate-pulse space-y-6">
          <div className="h-40 rounded-2xl bg-white/[0.03] border border-white/[0.06]" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-white/[0.03] border border-white/[0.06]" />
            ))}
          </div>
          <div className="h-64 rounded-2xl bg-white/[0.03] border border-white/[0.06]" />
        </div>
      </div>
    );
  }

  if (errorMsg || !rider) {
    return (
      <div className="min-h-screen bg-[#07090e] px-4 pt-12 pb-16 max-w-xl mx-auto w-full text-center">
        <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
          <Shield className="h-10 w-10 text-rose-400 mx-auto mb-3" />
          <h2 className="text-white text-lg font-bold">Profile Unavailable</h2>
          <p className="text-neutral-400 text-sm mt-1">{errorMsg || "Unable to find active rider."}</p>
          <button
            onClick={loadProfile}
            className="mt-4 px-4 py-2 rounded-xl bg-white text-neutral-950 text-xs font-semibold hover:bg-neutral-200 transition"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = {
    ON_DUTY: {
      label: "On Duty",
      badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      dotClass: "bg-emerald-400 animate-pulse",
    },
    BUSY: {
      label: "In Transit",
      badgeClass: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
      dotClass: "bg-cyan-400 animate-pulse",
    },
    BREAK: {
      label: "On Break",
      badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      dotClass: "bg-amber-400",
    },
    OFF_DUTY: {
      label: "Off Duty",
      badgeClass: "bg-neutral-500/15 text-neutral-400 border-neutral-500/30",
      dotClass: "bg-neutral-400",
    },
  }[rider.status] || {
    label: rider.status,
    badgeClass: "bg-neutral-500/15 text-neutral-400 border-neutral-500/30",
    dotClass: "bg-neutral-400",
  };

  return (
    <div className="min-h-screen bg-[#07090e] px-4 pt-6 pb-20 max-w-4xl mx-auto w-full">
      {/* ── Top Header / Hero Banner ─────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent p-6 md:p-8 backdrop-blur-xl mb-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <div className="h-20 w-20 md:h-22 md:w-22 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-neutral-900 to-emerald-500/20 border border-white/[0.15] flex items-center justify-center text-white shadow-inner shadow-cyan-500/20">
                <User className="h-10 w-10 text-cyan-300" />
              </div>
              <span className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-[#07090e] flex items-center justify-center ${statusConfig.dotClass}`} />
            </div>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  {rider.name}
                </h1>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-white/[0.08] text-cyan-300 border border-white/[0.1]">
                  {rider.riderId}
                </span>
              </div>
              <p className="text-neutral-400 text-xs md:text-sm mt-1 flex items-center gap-1.5 font-mono">
                <MapPin className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                {rider.assignedHub?.name || "Delhi NCR Hub"} • {rider.assignedHub?.city || "New Delhi"}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${statusConfig.badgeClass}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotClass}`} />
                  {statusConfig.label}
                </span>
                <span className="text-[11px] font-mono text-neutral-400 bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded-full">
                  EV Fleet Level 2
                </span>
              </div>
            </div>
          </div>

          {/* Quick Duty Toggle Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
            <div className="inline-flex rounded-xl bg-white/[0.04] p-1 border border-white/[0.08]">
              {(["ON_DUTY", "BREAK", "OFF_DUTY"] as const).map((st) => (
                <button
                  key={st}
                  disabled={updatingStatus}
                  onClick={() => handleStatusChange(st)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    rider.status === st
                      ? "bg-white text-neutral-950 shadow-md font-bold"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {st === "ON_DUTY" ? "On Duty" : st === "BREAK" ? "Break" : "Off Duty"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="mb-6 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4" />
          <span>Profile information updated successfully.</span>
        </div>
      )}

      {/* ── Key Shift Metrics (NO earningsToday, NO co2SavedKg) ───── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Today Completed</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {rider.shiftStats?.completedToday ?? 5}
          </div>
          <div className="text-[10px] text-neutral-400 font-mono mt-1">Direct & Returns</div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Active Tasks</span>
            <RotateCw className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-300 tracking-tight">
            {rider.shiftStats?.activeTasks ?? 3}
          </div>
          <div className="text-[10px] text-neutral-400 font-mono mt-1">In Queue / Transit</div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Rider Rating</span>
            <Award className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300 tracking-tight flex items-baseline gap-1">
            {rider.shiftStats?.rating?.toFixed(1) ?? "4.9"}
            <span className="text-xs text-neutral-400 font-normal">/ 5.0</span>
          </div>
          <div className="text-[10px] text-neutral-400 font-mono mt-1">Top 5% Performer</div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Total Completed</span>
            <Truck className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {rider.shiftStats?.totalDeliveries ?? 428}
          </div>
          <div className="text-[10px] text-neutral-400 font-mono mt-1">Lifetime trips</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* ── Vehicle & Hardware Card ─────────────────────────────── */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Assigned EV Vehicle</h3>
                  <p className="text-[11px] text-neutral-400">Zero-Emission Fleet Unit</p>
                </div>
              </div>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Connected
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <span className="text-xs text-neutral-400 font-medium">Model</span>
                <span className="text-xs font-semibold text-white font-mono">
                  {rider.vehicle?.model || "Ather 450X Gen 3"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <span className="text-xs text-neutral-400 font-medium">Registration Plate</span>
                <span className="text-xs font-semibold text-cyan-300 font-mono tracking-wider">
                  {rider.vehicle?.plateNumber || "DL-01-EV-4412"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <span className="text-xs text-neutral-400 font-medium">Vehicle Category</span>
                <span className="text-xs font-semibold text-white">
                  {rider.vehicle?.type === "EV_2W" ? "Electric Two-Wheeler" : "Electric Van"}
                </span>
              </div>
            </div>
          </div>

          {/* Battery Status Progress */}
          <div className="mt-5 pt-4 border-t border-white/[0.06]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-neutral-400 flex items-center gap-1.5">
                <BatteryCharging className="h-4 w-4 text-emerald-400" />
                Battery State of Charge
              </span>
              <span className="font-mono font-bold text-emerald-400">
                {rider.vehicle?.batteryLevel ?? 84}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${rider.vehicle?.batteryLevel ?? 84}%` }}
              />
            </div>
            <p className="text-[10px] text-neutral-400 font-mono mt-2">
              Estimated range remaining: ~68 km at current speed profile
            </p>
          </div>
        </div>

        {/* ── Contact & Identity Card (Editable) ───────────────────── */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Rider Credentials</h3>
                  <p className="text-[11px] text-neutral-400">Authenticated via Central Dispatch</p>
                </div>
              </div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08]"
                >
                  <Edit2 className="h-3 w-3" />
                  Edit
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-1 text-xs text-neutral-950 bg-white hover:bg-neutral-200 font-semibold px-2.5 py-1 rounded-lg transition"
                  >
                    <Save className="h-3 w-3" />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setPhoneInput(rider.phone);
                      setEmailInput(rider.email);
                    }}
                    className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white px-2 py-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <div className="text-[11px] text-neutral-400 mb-1 flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-cyan-400" />
                  Contact Phone
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full bg-neutral-900 border border-cyan-500/50 rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:outline-none"
                  />
                ) : (
                  <div className="text-xs font-mono font-semibold text-white">
                    {rider.phone || "+91 98765 43210"}
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <div className="text-[11px] text-neutral-400 mb-1 flex items-center gap-1.5">
                  <Mail className="h-3 w-3 text-emerald-400" />
                  Dispatcher Email
                </div>
                {isEditing ? (
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full bg-neutral-900 border border-emerald-500/50 rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:outline-none"
                  />
                ) : (
                  <div className="text-xs font-mono font-semibold text-white">
                    {rider.email || "vikram.del44@orbitreturn.io"}
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <div className="text-[11px] text-neutral-400 mb-1 flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-amber-400" />
                  Current Shift Window
                </div>
                <div className="text-xs font-semibold text-white">
                  09:00 AM – 06:00 PM (Standard Zone Shift)
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
            <span>Identity ID: 2901-DEL-V4</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> KYC Verified
            </span>
          </div>
        </div>
      </div>

      {/* ── Emergency & Dispatch Support ─────────────────────────── */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PhoneCall className="h-4 w-4 text-rose-400" />
              Direct Operations Helpline
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Instant voice connect to South Zone Dispatch Controller and SOS Roadside Assistance.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="tel:1800-419-7248"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-white border border-white/[0.1] transition"
            >
              <Phone className="h-3.5 w-3.5 text-cyan-400" />
              Hub Support
            </a>
            <a
              href="/flag-issue"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-xs font-semibold text-rose-300 border border-rose-500/30 transition"
            >
              Report Incident
              <ChevronRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
