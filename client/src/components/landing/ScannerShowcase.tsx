"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "../../hooks/useInView";
import { 
  ScanLine, 
  Smartphone, 
  QrCode, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  Radio, 
  Lock, 
  AlertTriangle,
  Zap,
  Activity
} from "lucide-react";

export function ScannerShowcase() {
  const [ref, inView] = useInView(0.15);
  const [demoState, setDemoState] = useState<"clean" | "fraud" | "defect">("clean");

  return (
    <section ref={ref} className="relative py-28 border-b border-white/[0.06] bg-[#07090e] overflow-hidden">
      {/* Background Subtle Radar Ambient Glow */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Edge Hardware & Optical Verification
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              Doorstep AI Inspection. <br />
              Zero Delayed Surprises.
            </h2>
            <p className="text-neutral-400 text-base sm:text-lg mt-3 leading-relaxed">
              Delivery executives utilize the OrbitReturn camera scanner to verify package weight, barcode telemetry, and serial authenticity before the refund is released.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/scanner"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-neutral-950 font-bold text-xs uppercase tracking-wider hover:bg-neutral-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              <ScanLine className="w-4 h-4" />
              <span>Launch Live Camera Scanner</span>
            </Link>
            <Link
              href="/demo-qr"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] text-neutral-300 border border-white/[0.1] font-mono text-xs hover:bg-white/[0.08] transition-all"
            >
              <QrCode className="w-4 h-4 text-cyan-400" />
              <span>Demo Barcodes</span>
            </Link>
          </div>
        </div>

        {/* Interactive Scanner HUD & Hardware Bridge Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: Mobile Scanner Interface Mockup */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-5 flex justify-center"
          >
            <div className="relative w-full max-w-sm rounded-[32px] bg-[#0c0f17] border border-white/[0.12] p-4 shadow-2xl overflow-hidden">
              {/* Speaker / Notch bar */}
              <div className="w-28 h-4 bg-neutral-900 rounded-full mx-auto mb-4 border border-white/[0.06] flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-neutral-800" />
              </div>

              {/* Camera Scanner Viewport */}
              <div className="relative h-64 rounded-2xl bg-[#05070a] border border-white/[0.08] overflow-hidden flex flex-col justify-between p-4">
                {/* Laser scan line animation */}
                <div className="laser-beam" />

                {/* Viewfinder Target Reticle */}
                <div className="absolute inset-8 border border-cyan-400/30 rounded-xl pointer-events-none">
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
                </div>

                {/* Top Overlay */}
                <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                  <span className="flex items-center gap-1 text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    <Radio className="w-3 h-3 animate-pulse" />
                    OPTIC_LOCK: ACTIVE
                  </span>
                  <span>1080P // 60 FPS</span>
                </div>

                {/* Center Item Detection Tag */}
                <div className="relative z-10 text-center">
                  <span className="font-mono text-[11px] px-2.5 py-1 rounded bg-[#0b0e15]/90 border border-white/[0.1] text-white font-semibold shadow-lg">
                    {demoState === "clean" && "SCAN: #ORB-8839 (IPHONE 15 PRO)"}
                    {demoState === "fraud" && "ALERT: #ORB-4412 (SAMSUNG S24)"}
                    {demoState === "defect" && "CHECK: #ORB-9104 (SONY WH-1000)"}
                  </span>
                </div>

                {/* Bottom Overlay */}
                <div className="relative z-10 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-neutral-500">EXPOSURE: AUTO</span>
                  <span className="text-emerald-400 font-bold">ZXING_DECODER_READY</span>
                </div>
              </div>

              {/* Dynamic Doorstep Triage Feedback Bar */}
              <div className="mt-4 p-4 rounded-xl bg-[#07090e] border border-white/[0.08] space-y-3 font-mono text-xs">
                {demoState === "clean" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-emerald-400 font-bold">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        CONDITION CERTIFIED
                      </span>
                      <span>97.4%</span>
                    </div>
                    <div className="text-[11px] text-neutral-400 font-sans">
                      Seals intact, weight matches catalog spec (221g). Instant peer-to-peer route assigned.
                    </div>
                  </div>
                )}

                {demoState === "fraud" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-rose-400 font-bold">
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        DOORSTEP RETURN FREEZE
                      </span>
                      <span>RISK 88/100</span>
                    </div>
                    <div className="text-[11px] text-neutral-400 font-sans">
                      Weight disparity detected (-140g). Suspect item swap. Refund automatically frozen for manual audit.
                    </div>
                  </div>
                )}

                {demoState === "defect" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-amber-400 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Zap className="w-4 h-4" />
                        REFURBISHMENT ROUTE
                      </span>
                      <span>GRADE: DEFECT</span>
                    </div>
                    <div className="text-[11px] text-neutral-400 font-sans">
                      Cosmetic fracture on headband. Diverted to Pune repair micro-hub dock rather than waste landfill.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right: Technical Architecture & Interactive Simulator Buttons */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-7 space-y-6"
          >
            {/* Interactive Simulation Switcher */}
            <div className="p-6 rounded-2xl bg-[#0c0f17] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-neutral-400 uppercase tracking-widest">
                  TRY DOORSTEP AI SCENARIO
                </span>
                <span className="text-xs font-mono text-cyan-400">CLICK TO TEST</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setDemoState("clean")}
                  className={`p-3 rounded-xl border text-left font-mono text-xs transition-all ${
                    demoState === "clean"
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                      : "bg-[#07090e] border-white/[0.06] text-neutral-400 hover:border-white/[0.14]"
                  }`}
                >
                  <div className="font-bold text-white mb-0.5">Pristine Resale</div>
                  <div className="text-[10px] text-neutral-400">Direct peer reroute</div>
                </button>

                <button
                  onClick={() => setDemoState("fraud")}
                  className={`p-3 rounded-xl border text-left font-mono text-xs transition-all ${
                    demoState === "fraud"
                      ? "bg-rose-500/15 border-rose-500/40 text-rose-300"
                      : "bg-[#07090e] border-white/[0.06] text-neutral-400 hover:border-white/[0.14]"
                  }`}
                >
                  <div className="font-bold text-white mb-0.5">Fraud Freeze</div>
                  <div className="text-[10px] text-neutral-400">Serial/weight swap</div>
                </button>

                <button
                  onClick={() => setDemoState("defect")}
                  className={`p-3 rounded-xl border text-left font-mono text-xs transition-all ${
                    demoState === "defect"
                      ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                      : "bg-[#07090e] border-white/[0.06] text-neutral-400 hover:border-white/[0.14]"
                  }`}
                >
                  <div className="font-bold text-white mb-0.5">Defect Triage</div>
                  <div className="text-[10px] text-neutral-400">Micro-hub repair dock</div>
                </button>
              </div>
            </div>

            {/* 3 Core Edge Capabilities */}
            <div className="space-y-3 font-mono text-xs">
              <div className="p-4 rounded-xl bg-[#0b0e15] border border-white/[0.06] flex items-start gap-3.5">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0 mt-0.5">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm font-sans">Zero App Installation Required</div>
                  <div className="text-neutral-400 text-xs mt-1 leading-relaxed font-sans">
                    Runs directly in any standard mobile browser with hardware-accelerated WebRTC camera streams and ZXing WebAssembly barcoding.
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0b0e15] border border-white/[0.06] flex items-start gap-3.5">
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 shrink-0 mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm font-sans">Pre-Refund Quarantine Shield</div>
                  <div className="text-neutral-400 text-xs mt-1 leading-relaxed font-sans">
                    Prevents automated refund processing if serial codes don't match or weight sensors detect counterfeit substitution at the doorstep.
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0b0e15] border border-white/[0.06] flex items-start gap-3.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm font-sans">Real-Time WebSocket Relay Bridge</div>
                  <div className="text-neutral-400 text-xs mt-1 leading-relaxed font-sans">
                    Instantly syncs mobile scan telemetry with operations dispatch consoles and driver route manifests with sub-100ms latency.
                  </div>
                </div>
              </div>
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}

