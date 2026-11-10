"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "../../hooks/useInView";
import { ArrowRight, Zap, Play, Terminal, Cpu } from "lucide-react";

export function CTASection() {
  const [ref, inView] = useInView(0.15);

  return (
    <section ref={ref} className="relative py-32 overflow-hidden bg-[#07090e]">
      {/* Subtle top light flare */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] opacity-30 blur-[100px] pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(56,189,248,0.2) 0%, rgba(16,185,129,0.1) 40%, transparent 70%)"
        }}
      />

      <div className="relative container mx-auto max-w-5xl px-4 sm:px-6 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="p-10 sm:p-16 rounded-3xl bg-[#0b0e15] border border-white/[0.1] shadow-2xl relative overflow-hidden"
        >
          {/* Background grid */}
          <div className="absolute inset-0 tech-grid opacity-20 pointer-events-none" />

          {/* System spec badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-neutral-300 font-mono text-xs uppercase tracking-wider mb-6">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            Hackstellar 2026 // Problem Statement 16
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Deploy Autonomous Rerouting <br />
            <span className="cyan-gradient font-extrabold">Across Your Reverse Supply Chain.</span>
          </h2>

          <p className="text-neutral-400 text-base sm:text-lg max-w-2xl mx-auto mt-4 leading-relaxed font-normal">
            Test the live 3-agent pipeline against real returns. Experience doorstep computer vision grading, fraud risk indexing, and spatial peer-to-peer rerouting in real-time.
          </p>

          {/* Action triggers */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-8">
            <Link
              href="/agent-lab"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-neutral-950 font-semibold text-sm hover:bg-neutral-100 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_16px_rgba(255,255,255,0.15)] group"
            >
              <Zap className="w-4 h-4 text-neutral-950 fill-neutral-950" />
              <span>Launch Live Agent Lab</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/demo"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-neutral-200 border border-white/[0.1] font-medium text-sm transition-all"
            >
              <Play className="w-3.5 h-3.5 text-neutral-400 fill-neutral-400" />
              <span>Judge Walkthrough Guide</span>
            </Link>
          </div>

          {/* Tech specification markers */}
          <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-neutral-400">
            <span>MONGODB ATLAS 2DSPHERE</span>
            <span>·</span>
            <span>NEXT.JS 16 ENTERPRISE SPEC</span>
            <span>·</span>
            <span>HEURISTIC AI SAFETY FALLBACK</span>
            <span>·</span>
            <span>SUB-400MS ROUTING DAG</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
