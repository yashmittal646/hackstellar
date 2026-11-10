"use client";

export function AuroraBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" style={{ zIndex: 1 }}>
      {/* Top ambient luminary flare (subtle ice-cyan & deep indigo) */}
      <div 
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] rounded-[100%] opacity-40 blur-[120px] pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(56,189,248,0.25) 0%, rgba(99,102,241,0.15) 40%, transparent 75%)"
        }}
      />
      
      {/* Precision grid mesh with center spotlight mask */}
      <div 
        className="absolute inset-0 tech-grid opacity-30 pointer-events-none"
        style={{
          maskImage: "radial-gradient(ellipse 70% 50% at 50% 20%, #000 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 50% at 50% 20%, #000 30%, transparent 100%)"
        }}
      />

      {/* Subtle vertical laser guide lines */}
      <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 pointer-events-none flex justify-between opacity-15">
        <div className="w-[1px] h-full bg-gradient-to-b from-white/20 via-white/5 to-transparent" />
        <div className="w-[1px] h-full bg-gradient-to-b from-white/20 via-white/5 to-transparent hidden sm:block" />
        <div className="w-[1px] h-full bg-gradient-to-b from-white/20 via-white/5 to-transparent hidden md:block" />
        <div className="w-[1px] h-full bg-gradient-to-b from-white/20 via-white/5 to-transparent" />
      </div>
    </div>
  );
}
