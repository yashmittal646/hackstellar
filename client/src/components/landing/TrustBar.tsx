"use client";

import { Database, Cpu, Layers, GitBranch, MapPin, ShieldCheck, Terminal, Zap } from "lucide-react";

const ARCHITECTURE_STACK = [
  { label: "MongoDB Atlas Geospatial Indexing", icon: Database },
  { label: "Next.js 16 Webpack Architecture", icon: Cpu },
  { label: "Autonomous Vision Grading Engine", icon: Layers },
  { label: "Behavioral Fraud Sentinel", icon: ShieldCheck },
  { label: "KD-Tree Proximity Dispatcher", icon: GitBranch },
  { label: "Leaflet Spatial Coordinates", icon: MapPin },
  { label: "Sub-300ms Multi-Factor Reroute", icon: Zap },
  { label: "Hackstellar 2026 Problem 16 Core", icon: Terminal },
];

export function TrustBar() {
  const doubled = [...ARCHITECTURE_STACK, ...ARCHITECTURE_STACK];

  return (
    <div className="relative py-4 overflow-hidden border-y border-white/[0.06] bg-[#07090e]/80 backdrop-blur-md">
      {/* Left/Right Vignette Masks */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#07090e] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#07090e] to-transparent z-10 pointer-events-none" />

      <div className="marquee-smooth flex items-center gap-10 w-max select-none">
        {doubled.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className="flex items-center gap-2.5 text-xs font-mono text-neutral-400 tracking-wider uppercase whitespace-nowrap hover:text-neutral-200 transition-colors"
            >
              <Icon className="w-3.5 h-3.5 text-cyan-400/80 shrink-0" />
              <span>{item.label}</span>
              <span className="w-1 h-1 rounded-full bg-white/20 ml-6" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
