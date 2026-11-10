"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { StarField } from "../StarField";
import { AuroraBackground } from "../AuroraBackground";
import { useTypewriter } from "../../hooks/useTypewriter";
import {
  ArrowRight, Zap, Eye, ShieldAlert, Truck, TrendingDown, Leaf, Package, ChevronDown,
} from "lucide-react";

const PHRASES = [
  "Reroute Returns. Skip the Warehouse.",
  "AI Agents Working at the Speed of Logistics.",
  "Eliminate Reverse Logistics Waste. Forever.",
  "Real-Time Intelligence. Zero Unnecessary Miles.",
];

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } },
};

interface Stats {
  totalReturns: number;
  savings: { totalCostSaved: number; totalCo2Saved: number };
  routingBreakdown: Record<string, number>;
}

export function HeroSection() {
  const tagline = useTypewriter(PHRASES, 55, 30, 2500);
  const [stats, setStats] = useState<Stats | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/dashboard/stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const agents = [
    { icon: Eye, label: "Vision Agent", desc: "Grades condition in real-time", color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
    { icon: ShieldAlert, label: "Fraud Sentinel", desc: "Detects manipulation & swap fraud", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
    { icon: Truck, label: "Dispatcher", desc: "Routes to nearest demand point", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  ];

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Fixed starfield */}
      <StarField />

      {/* Aurora blobs */}
      <AuroraBackground />

      {/* Perspective grid */}
      <div
        className="absolute inset-0 perspective-grid pointer-events-none"
        style={{ zIndex: 2 }}
      />

      {/* Content */}
      <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 pt-24 pb-16" style={{ zIndex: 10 }}>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Badge */}
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                Hackstellar 2026 · Problem Statement 16
              </span>
            </motion.div>

            {/* Main headline */}
            <motion.div variants={fadeUp} className="space-y-3">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight">
                <span className="text-white">Returns</span>
                <br />
                <span className="shimmer-text">That Never</span>
                <br />
                <span className="text-white">Go Home</span>
              </h1>
              <div className="h-14">
                <p className="text-lg sm:text-xl text-slate-400 cursor-blink">
                  {tagline}
                </p>
              </div>
            </motion.div>

            {/* Description */}
            <motion.p variants={fadeUp} className="text-slate-400 text-base leading-relaxed max-w-lg">
              OrbitReturn's autonomous AI pipeline intercepts e-commerce returns in real-time —
              grading condition, detecting fraud, and routing to the nearest demand point before
              the warehouse ever sees it.
            </motion.p>

            {/* Live stats pills */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              {[
                { icon: Package, label: `${stats?.totalReturns ?? "21"} Returns AI-Analyzed`, color: "text-violet-300 bg-violet-500/10 border-violet-500/20" },
                { icon: TrendingDown, label: `₹${stats ? Math.round(stats.savings.totalCostSaved).toLocaleString() : "26,896"} Saved`, color: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20" },
                { icon: Leaf, label: `${stats ? Math.round(stats.savings.totalCo2Saved * 10) / 10 : "1,978"} kg CO₂ Offset`, color: "text-teal-300 bg-teal-500/10 border-teal-500/20" },
              ].map((s) => (
                <span key={s.label} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${s.color} backdrop-blur-sm`}>
                  <s.icon className="h-3.5 w-3.5" />
                  {s.label}
                </span>
              ))}
            </motion.div>

            {/* CTA buttons */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/agent-lab"
                className="group flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold shadow-xl shadow-indigo-500/30 transition-all duration-300 hover:scale-105 hover:shadow-indigo-500/50"
              >
                <Zap className="h-4 w-4" />
                Try Live Agent Lab
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/demo"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-600 bg-slate-900/60 hover:bg-slate-800/80 text-slate-200 font-semibold backdrop-blur-sm transition-all duration-300"
              >
                Judge Demo Guide
              </Link>
            </motion.div>
          </motion.div>

          {/* Right column — Interactive mockup card */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="float-anim"
          >
            <div className="relative">
              {/* Glow behind card */}
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-emerald-500/20 rounded-3xl blur-2xl" />

              {/* Main mockup card */}
              <div className="relative rounded-2xl border border-indigo-500/20 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl overflow-hidden glow-indigo">
                {/* Scan bar animation */}
                <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                  <div className="scan-bar" />
                </div>

                {/* Card header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Live Pipeline</span>
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Active
                      </span>
                    </div>
                    <h3 className="text-white font-black text-lg">iPhone 15 Pro Max</h3>
                    <p className="text-xs text-slate-400">Order #ORB-2847 · Mumbai → Delhi</p>
                  </div>
                  <div className="relative w-16 h-16">
                    {/* Score ring */}
                    <svg className="absolute inset-0 w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth="6" />
                      <circle
                        cx="32" cy="32" r="26" fill="none"
                        stroke="url(#scoreGrad)" strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={`${0.97 * 2 * Math.PI * 26} ${2 * Math.PI * 26}`}
                      />
                      <defs>
                        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#818cf8" />
                          <stop offset="100%" stopColor="#34d399" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-black text-white">97</span>
                    </div>
                  </div>
                </div>

                {/* Agent pipeline steps */}
                <div className="space-y-3 mb-5">
                  {agents.map((a, i) => (
                    <motion.div
                      key={a.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.3, duration: 0.5 }}
                      className={`flex items-center gap-3 p-3 rounded-xl border ${a.bg}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${a.bg}`}>
                        <a.icon className={`h-4 w-4 ${a.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-bold ${a.color}`}>{a.label}</div>
                        <div className="text-[11px] text-slate-400">{a.desc}</div>
                      </div>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.2 + i * 0.3 }}
                        className="text-emerald-400"
                      >
                        ✓
                      </motion.div>
                    </motion.div>
                  ))}
                </div>

                {/* Result */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.0, duration: 0.5 }}
                  className="rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-3 flex items-center gap-3"
                >
                  <span className="text-2xl">✨</span>
                  <div>
                    <div className="text-xs font-black text-emerald-400">PRISTINE · Rerouted</div>
                    <div className="text-[11px] text-slate-400">→ Nearby Customer · ₹4,500 saved · Warehouse bypassed</div>
                  </div>
                </motion.div>
              </div>

              {/* Floating PRISTINE badge */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 2.2, duration: 0.5 }}
                className="absolute -top-3 -right-3 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-500/40"
              >
                PRISTINE ✨
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll chevron */}
      <div
        className="absolute bottom-8 left-1/2 transition-opacity duration-500"
        style={{ zIndex: 10, opacity: scrolled ? 0 : 1, animation: "bounce-chevron 2s ease-in-out infinite" }}
      >
        <ChevronDown className="h-6 w-6 text-slate-500" />
      </div>
    </section>
  );
}

