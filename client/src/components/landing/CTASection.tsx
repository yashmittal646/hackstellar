"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "../../hooks/useInView";
import { AuroraBackground } from "../AuroraBackground";
import { ArrowRight, Zap, PlayCircle } from "lucide-react";

export function CTASection() {
  const [ref, inView] = useInView(0.1);

  return (
    <section ref={ref} className="relative py-32 overflow-hidden">
      {/* Deep gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-violet-950 to-slate-950" />
      <AuroraBackground />

      {/* Grid overlay */}
      <div className="absolute inset-0 perspective-grid opacity-40" />

      <div className="relative container mx-auto max-w-4xl px-4 sm:px-6 text-center" style={{ zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-white/10 text-white/70 border border-white/20 backdrop-blur-sm">
            🏆 Hackstellar 2026 · Problem Statement 16
          </span>

          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05]">
            See the Future of
            <br />
            <span className="shimmer-text">Reverse Logistics</span>
            <br />
            Live.
          </h2>

          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Run a full AI pipeline on a real return in under 60 seconds.
            Watch VisionAgent grade, FraudSentinel flag, and Dispatcher reroute — all autonomous.
          </p>

          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Link
              href="/agent-lab"
              className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-lg shadow-2xl shadow-indigo-500/40 transition-all duration-300 hover:scale-105 hover:shadow-indigo-500/60"
            >
              <Zap className="h-5 w-5" />
              Launch Agent Lab
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/demo"
              className="flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-lg backdrop-blur-sm transition-all duration-300"
            >
              <PlayCircle className="h-5 w-5" />
              Judge Walkthrough
            </Link>
          </div>

          {/* Tech badges */}
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            {["MongoDB Atlas", "Next.js 16", "Framer Motion", "TypeScript", "Autonomous AI"].map((t) => (
              <span key={t} className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-white/50">
                {t}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

