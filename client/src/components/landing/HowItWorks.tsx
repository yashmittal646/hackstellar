"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "../../hooks/useInView";
import { Eye, ShieldAlert, Truck, Package } from "lucide-react";

const NODES = [
  {
    icon: Package,
    title: "Pickup Scan",
    desc: "Courier scans item at customer door. Metadata + photo uploaded to OrbitReturn in real-time.",
    color: "text-slate-300",
    bg: "bg-slate-800 border-slate-600",
    glow: "rgba(148,163,184,0.4)",
  },
  {
    icon: Eye,
    title: "Vision Agent",
    desc: "AI analyzes photo for damage, tampering, completeness. Outputs quality grade from PRISTINE to DEFECTIVE.",
    color: "text-indigo-400",
    bg: "bg-indigo-900/40 border-indigo-500/40",
    glow: "rgba(99,102,241,0.5)",
  },
  {
    icon: ShieldAlert,
    title: "Fraud Sentinel",
    desc: "Pattern analysis against historical fraud signals. Flags swap fraud, repeat abuse, and high-risk clusters.",
    color: "text-rose-400",
    bg: "bg-rose-900/30 border-rose-500/30",
    glow: "rgba(239,68,68,0.4)",
  },
  {
    icon: Truck,
    title: "Dispatch",
    desc: "Scores all routing options by proximity, demand, margin. Routes to nearest buyer or micro-hub. Warehouse bypassed.",
    color: "text-emerald-400",
    bg: "bg-emerald-900/30 border-emerald-500/30",
    glow: "rgba(52,211,153,0.4)",
  },
];

export function HowItWorks() {
  const [ref, inView] = useInView(0.1);
  const [activeNode, setActiveNode] = useState(-1);

  useEffect(() => {
    if (!inView) return;
    let idx = 0;
    const interval = setInterval(() => {
      if (idx <= NODES.length) {
        setActiveNode(idx - 1);
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 450);
    return () => clearInterval(interval);
  }, [inView]);

  return (
    <section ref={ref} className="relative py-28 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/20 to-transparent pointer-events-none" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 mb-4">
            ⚡ How It Works
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            From Pickup to <span className="gradient-text">Perfect Route</span>
            <br />in Under 3 Seconds
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Three autonomous AI agents fire in sequence. No human in the loop. No delays.
          </p>
        </motion.div>

        {/* Pipeline nodes */}
        <div className="relative">
          {/* Connecting line SVG */}
          <div className="hidden lg:block absolute top-16 left-0 right-0 h-0.5 mx-32">
            <svg className="w-full h-2" preserveAspectRatio="none">
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(99,102,241,0.6)" />
                  <stop offset="100%" stopColor="rgba(52,211,153,0.6)" />
                </linearGradient>
              </defs>
              <line
                x1="0" y1="4" x2="100%" y2="4"
                stroke="url(#lineGrad)" strokeWidth="2" strokeDasharray="8 4"
                style={{
                  strokeDashoffset: inView ? 0 : 1000,
                  transition: "stroke-dashoffset 1.5s ease 0.3s",
                }}
              />
            </svg>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {NODES.map((node, i) => {
              const isActive = activeNode >= i;
              return (
                <motion.div
                  key={node.title}
                  initial={{ opacity: 0, y: 50 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.15, duration: 0.6, ease: "easeOut" }}
                  className="relative group"
                >
                  {/* Step number */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-black text-sm transition-all duration-700 ${
                        isActive
                          ? `${node.bg} ${node.color} shadow-lg`
                          : "bg-slate-900 border-slate-700 text-slate-600"
                      }`}
                      style={isActive ? { boxShadow: `0 0 20px ${node.glow}` } : {}}
                    >
                      {i + 1}
                    </div>
                    <div className={`h-0.5 flex-1 transition-all duration-700 delay-300 lg:hidden ${isActive ? "bg-gradient-to-r from-indigo-500 to-emerald-500" : "bg-slate-800"}`} />
                  </div>

                  {/* Card */}
                  <div
                    className={`rounded-2xl border p-5 transition-all duration-700 ${
                      isActive ? `${node.bg} shadow-2xl` : "bg-slate-900/40 border-slate-800"
                    }`}
                    style={isActive ? { boxShadow: `0 10px 40px ${node.glow}` } : {}}
                  >
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3 transition-all duration-700 ${isActive ? `${node.bg}` : "bg-slate-800 border-slate-700"}`}>
                      <node.icon className={`h-5 w-5 transition-colors duration-700 ${isActive ? node.color : "text-slate-600"}`} />
                    </div>
                    <h3 className={`font-black mb-2 transition-colors duration-700 ${isActive ? "text-white" : "text-slate-600"}`}>
                      {node.title}
                    </h3>
                    <p className={`text-xs leading-relaxed transition-colors duration-700 ${isActive ? "text-slate-300" : "text-slate-700"}`}>
                      {node.desc}
                    </p>
                  </div>

                  {/* Arrow between nodes */}
                  {i < NODES.length - 1 && (
                    <div className="hidden lg:block absolute top-16 -right-4 z-10">
                      <div className={`w-8 h-8 flex items-center justify-center transition-all duration-700 delay-500 ${isActive ? "text-indigo-400" : "text-slate-700"}`}>
                        →
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Result callout */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.7 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-500/20">
            <span className="text-2xl">🎯</span>
            <span className="text-sm font-bold text-emerald-300">Result: 68% of returns never see the warehouse · avg ₹1,280 saved per return</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

