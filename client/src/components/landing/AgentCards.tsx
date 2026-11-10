"use client";
import { motion } from "framer-motion";
import { useInView } from "../../hooks/useInView";
import { useMouseTilt } from "../../hooks/useMouseTilt";
import { Eye, ShieldAlert, Truck } from "lucide-react";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } },
};

function AgentCard({
  title, subtitle, icon: Icon, color, bg, glow, children,
}: {
  title: string; subtitle: string; icon: typeof Eye; color: string; bg: string; glow: string; children: React.ReactNode;
}) {
  const { ref, tilt, onMouseMove, onMouseLeave } = useMouseTilt(10);

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="card-3d"
      style={{
        transform: `perspective(800px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
        boxShadow: `${tilt.shadowX * 2}px ${tilt.shadowY * 2}px 50px ${glow}`,
      }}
    >
      <div className={`rounded-2xl border ${bg} p-6 h-full relative overflow-hidden`}>
        {/* Glow spotlight */}
        <div
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${tilt.glowX}% ${tilt.glowY}%, ${glow} 0%, transparent 60%)`,
          }}
        />
        <div className={`w-12 h-12 rounded-xl border ${bg} flex items-center justify-center mb-4`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <h3 className="text-white font-black text-lg mb-1">{title}</h3>
        <p className="text-xs text-slate-400 mb-5">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

export function AgentCards() {
  const [ref, inView] = useInView(0.1);

  return (
    <section ref={ref} className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/15 to-transparent pointer-events-none" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-violet-500/10 text-violet-300 border border-violet-500/20 mb-4">
            🤖 AI Agent Suite
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Three Agents. <span className="gradient-text">One Decision.</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Each agent is specialized, autonomous, and operates on real data — no hardcoded rules.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Vision Agent Card */}
          <motion.div variants={fadeUp}>
            <AgentCard
              title="VisionQualityAgent"
              subtitle="Computer vision grading pipeline"
              icon={Eye}
              color="text-indigo-400"
              bg="bg-indigo-900/30 border-indigo-500/20"
              glow="rgba(99,102,241,0.3)"
            >
              {/* Scanning bar demo */}
              <div className="relative rounded-xl bg-slate-900/80 border border-slate-800 h-28 overflow-hidden mb-4">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl">📱</span>
                </div>
                <div className="scan-bar" />
              </div>
              <div className="space-y-2">
                {["PRISTINE · 97/100", "LIKE_NEW · 78/100", "DEFECTIVE · 23/100"].map((g, i) => (
                  <div key={g} className={`text-[11px] font-semibold px-2 py-1 rounded-lg ${i === 0 ? "bg-emerald-500/10 text-emerald-400" : i === 1 ? "bg-blue-500/10 text-blue-400" : "bg-red-500/10 text-red-400"}`}>
                    {g}
                  </div>
                ))}
              </div>
            </AgentCard>
          </motion.div>

          {/* Fraud Sentinel Card */}
          <motion.div variants={fadeUp}>
            <AgentCard
              title="FraudSentinel"
              subtitle="Behavioral fraud pattern detection"
              icon={ShieldAlert}
              color="text-rose-400"
              bg="bg-rose-900/20 border-rose-500/20"
              glow="rgba(239,68,68,0.25)"
            >
              {/* Pulse rings */}
              <div className="relative h-20 flex items-center justify-center mb-4">
                <div className="relative w-16 h-16">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="absolute inset-0 rounded-full border border-rose-500/40"
                      style={{ animation: `pulse-ring 2s ${i * 0.6}s ease-out infinite` }}
                    />
                  ))}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ShieldAlert className="h-6 w-6 text-rose-400" />
                  </div>
                </div>
              </div>
              {/* Risk bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Risk Score</span>
                  <span className="text-rose-400 font-bold">Live</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="risk-bar-anim h-full rounded-full" />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>LOW</span><span>MED</span><span>HIGH</span>
                </div>
              </div>
            </AgentCard>
          </motion.div>

          {/* Dispatcher Card */}
          <motion.div variants={fadeUp}>
            <AgentCard
              title="LogisticsDispatcher"
              subtitle="Multi-factor optimal routing engine"
              icon={Truck}
              color="text-emerald-400"
              bg="bg-emerald-900/20 border-emerald-500/20"
              glow="rgba(52,211,153,0.25)"
            >
              {/* Savings counter */}
              <div className="text-center mb-4">
                <div className="text-3xl font-black text-emerald-400 tabular-nums">₹26,896</div>
                <div className="text-xs text-slate-400 mt-1">Total cost saved (live API)</div>
              </div>
              {/* Route type badges */}
              <div className="space-y-2">
                {[
                  { label: "Direct → Customer", count: "8", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
                  { label: "Nearby Hub", count: "8", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
                  { label: "Unrouted", count: "5", color: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
                ].map((r) => (
                  <div key={r.label} className={`flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs font-semibold ${r.color}`}>
                    <span>{r.label}</span>
                    <span>{r.count}</span>
                  </div>
                ))}
              </div>
            </AgentCard>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

