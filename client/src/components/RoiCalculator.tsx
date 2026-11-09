"use client";

import { useState } from "react";
import { formatCurrency } from "../lib/utils";
import { Calculator, TrendingUp, Leaf, Clock, Sparkles, Building2, Zap } from "lucide-react";

function getTier(daily: number) {
  if (daily <= 2000) return { label: "Mid-Tier Retailer", icon: "🏪", color: "text-blue-400", example: "e.g. Nykaa, Boat, Lenskart" };
  if (daily <= 7000) return { label: "Large Marketplace", icon: "🏬", color: "text-indigo-400", example: "e.g. Meesho, Myntra, Snapdeal" };
  if (daily <= 14000) return { label: "National Platform", icon: "🏢", color: "text-violet-400", example: "e.g. Flipkart, Amazon India" };
  return { label: "Peak Mega-Festive", icon: "🚀", color: "text-orange-400", example: "e.g. Big Billion Days / Great Indian Festival" };
}

export function RoiCalculator() {
  const [dailyReturns, setDailyReturns] = useState<number>(2500);

  // OrbitReturn benchmark metrics:
  // Avg freight saved per intercepted return: ₹1,250
  // Interception success rate: 80%
  // CO2 saved per intercepted return: 95 kg
  // Delivery speedup: 3.5 days (84 hours)
  const interceptionRate = 0.8;
  const annualReturns = dailyReturns * 365;
  const annualIntercepted = Math.round(annualReturns * interceptionRate);
  const annualCostSaved = annualIntercepted * 1250;
  const annualCo2SavedTons = Math.round((annualIntercepted * 95) / 1000);
  const annualHoursSavedMillions = ((annualIntercepted * 84) / 1_000_000).toFixed(1);
  const annualCrore = (annualCostSaved / 10_000_000).toFixed(1);
  const monthlyROI = Math.round(annualCostSaved / 12);

  const tier = getTier(dailyReturns);

  return (
    <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-slate-950 p-6 md:p-8 space-y-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/8 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
            <Calculator className="h-3.5 w-3.5" /> Enterprise Scale Simulator
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
            Projected Enterprise ROI Calculator
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">
            Simulate how OrbitReturn scales for national e-commerce logistics fleets.
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
            Annual Logistics Savings
          </span>
          <div className="text-3xl md:text-4xl font-black text-emerald-400 tracking-tight">
            ₹{annualCrore} Cr
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            ₹{Math.round(monthlyROI / 100000).toLocaleString()} L / month
          </div>
        </div>
      </div>

      {/* Tier badge */}
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-700 text-xs font-semibold ${tier.color}`}>
        <span>{tier.icon}</span>
        <span>{tier.label}</span>
        <span className="text-slate-500 font-normal">— {tier.example}</span>
      </div>

      {/* Slider Control */}
      <div className="space-y-3 bg-slate-950/70 p-5 rounded-2xl border border-slate-800">
        <div className="flex justify-between items-center text-sm font-semibold">
          <span className="text-slate-300">Daily Return Volume in Network:</span>
          <span className="font-mono text-indigo-400 text-base font-bold">
            {dailyReturns.toLocaleString()} / day
          </span>
        </div>
        <input
          type="range"
          min={500}
          max={20000}
          step={500}
          value={dailyReturns}
          onChange={(e) => setDailyReturns(Number(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
        <div className="flex justify-between text-[11px] text-slate-500 font-mono">
          <span>500 (Startup)</span>
          <span>7,500 (Scale)</span>
          <span>20,000 (Peak)</span>
        </div>
      </div>

      {/* Projected Impact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <TrendingUp className="h-4 w-4" /> Freight Capital Retained
          </div>
          <div className="text-2xl font-black text-white">
            {formatCurrency(annualCostSaved)}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Eliminates <strong className="text-slate-300">{annualIntercepted.toLocaleString()}</strong> redundant round-trip highway haul journeys per year.
          </p>
          <div className="pt-1 border-t border-emerald-500/10">
            <span className="text-[10px] text-emerald-400 font-semibold">
              {Math.round(interceptionRate * 100)}% interception rate · ₹1,250 avg per intercept
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-teal-500/10 border border-teal-500/20 space-y-2">
          <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider">
            <Leaf className="h-4 w-4" /> Net Carbon Avoidance
          </div>
          <div className="text-2xl font-black text-white">
            {annualCo2SavedTons.toLocaleString()} MT
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Equivalent to planting <strong className="text-slate-300">{Math.round(annualCo2SavedTons * 45).toLocaleString()}</strong> trees annually across India.
          </p>
          <div className="pt-1 border-t border-teal-500/10">
            <span className="text-[10px] text-teal-400 font-semibold">
              95 kg CO₂ avoided per intercepted return
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Clock className="h-4 w-4" /> Transit Hours Eliminated
          </div>
          <div className="text-2xl font-black text-white">
            {annualHoursSavedMillions}M Hrs
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Average customer delivery cycle compressed from <strong className="text-slate-300">6.2 days</strong> down to <strong className="text-slate-300">1.8 days</strong>.
          </p>
          <div className="pt-1 border-t border-amber-500/10">
            <span className="text-[10px] text-amber-400 font-semibold">
              84 hrs average turnaround saved per intercept
            </span>
          </div>
        </div>
      </div>

      {/* AI insight strip */}
      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-violet-500/5 border border-violet-500/15">
        <Sparkles className="w-4 h-4 text-violet-400 flex-shrink-0" />
        <p className="text-xs text-slate-400 leading-relaxed">
          <strong className="text-white">AI ROI Insight:</strong>{" "}
          At <strong className="text-indigo-300">{dailyReturns.toLocaleString()} returns/day</strong>, OrbitReturn's autonomous
          routing agents would process{" "}
          <strong className="text-violet-300">{annualIntercepted.toLocaleString()} intercepts/year</strong> —
          equivalent to saving <strong className="text-emerald-300">₹{annualCrore} Cr</strong> that would otherwise be lost to unnecessary warehouse roundtrips.
        </p>
      </div>
    </div>
  );
}
