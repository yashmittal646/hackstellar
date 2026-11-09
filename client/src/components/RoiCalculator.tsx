"use client";

import { useState } from "react";
import { formatCurrency } from "../lib/utils";
import { Calculator, TrendingUp, Leaf, Clock, Sparkles } from "lucide-react";

export function RoiCalculator() {
  const [dailyReturns, setDailyReturns] = useState<number>(2500);

  // Based on OrbitReturn benchmark metrics:
  // Avg freight saved per peer/hub intercepted return: ₹1,250
  // Interception success rate: 80%
  // CO2 saved per intercepted return: 95 kg (avoided interstate roundtrip)
  // Delivery speedup: 3.5 days (84 hours)
  const interceptionRate = 0.8;
  const annualReturns = dailyReturns * 365;
  const annualIntercepted = Math.round(annualReturns * interceptionRate);
  const annualCostSaved = annualIntercepted * 1250;
  const annualCo2SavedTons = Math.round((annualIntercepted * 95) / 1000);
  const annualHoursSavedMillions = ((annualIntercepted * 84) / 1000000).toFixed(1);

  return (
    <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-slate-950 p-6 md:p-8 space-y-6 relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
            <Calculator className="h-3.5 w-3.5" /> Enterprise Scale Simulator
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
            Projected Enterprise ROI Calculator
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">
            Simulate how OrbitReturn scales for national e-commerce logistics fleets (e.g. Flipkart, Amazon India).
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
            Annual Logistics Savings
          </span>
          <div className="text-2xl md:text-3xl font-black text-emerald-400 tracking-tight">
            ₹{(annualCostSaved / 10000000).toFixed(2)} Cr / yr
          </div>
        </div>
      </div>

      {/* Slider Control */}
      <div className="space-y-3 bg-slate-950/70 p-5 rounded-2xl border border-slate-800">
        <div className="flex justify-between items-center text-sm font-semibold">
          <span className="text-slate-300">Daily Return Volume in Network:</span>
          <span className="font-mono text-indigo-400 text-base font-bold">
            {dailyReturns.toLocaleString()} returns / day
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
          <span>500/day (Mid-tier Retailer)</span>
          <span>10,000/day (National Marketplace)</span>
          <span>20,000/day (Peak Mega-Festive)</span>
        </div>
      </div>

      {/* Projected Impact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <TrendingUp className="h-4 w-4" /> Freight Capital Retained
          </div>
          <div className="text-2xl font-black text-white">
            {formatCurrency(annualCostSaved)}
          </div>
          <p className="text-[11px] text-slate-400">
            Eliminates {annualIntercepted.toLocaleString()} redundant round-trip highway haul journeys.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 space-y-1">
          <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider">
            <Leaf className="h-4 w-4" /> Net Carbon Avoidance
          </div>
          <div className="text-2xl font-black text-white">
            {annualCo2SavedTons.toLocaleString()} Metric Tons
          </div>
          <p className="text-[11px] text-slate-400">
            Equivalent to planting {Math.round(annualCo2SavedTons * 45).toLocaleString()} trees annually across India.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Clock className="h-4 w-4" /> Transit Hours Eliminated
          </div>
          <div className="text-2xl font-black text-white">
            {annualHoursSavedMillions} Million Hrs
          </div>
          <p className="text-[11px] text-slate-400">
            Average customer delivery cycle compressed from 6.2 days down to 1.8 days.
          </p>
        </div>
      </div>
    </div>
  );
}
