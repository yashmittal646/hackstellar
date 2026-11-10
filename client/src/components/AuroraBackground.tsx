"use client";

export function AuroraBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
      {/* Indigo blob — top left */}
      <div
        className="aurora-blob aurora-1"
        style={{
          width: "55vw",
          height: "55vw",
          background: "radial-gradient(circle, rgba(99,102,241,0.55) 0%, transparent 70%)",
          top: "-15%",
          left: "-10%",
        }}
      />
      {/* Violet blob — top right */}
      <div
        className="aurora-blob aurora-2"
        style={{
          width: "45vw",
          height: "45vw",
          background: "radial-gradient(circle, rgba(167,139,250,0.4) 0%, transparent 70%)",
          top: "-5%",
          right: "-5%",
        }}
      />
      {/* Emerald blob — bottom center */}
      <div
        className="aurora-blob aurora-3"
        style={{
          width: "40vw",
          height: "40vw",
          background: "radial-gradient(circle, rgba(52,211,153,0.25) 0%, transparent 70%)",
          bottom: "0%",
          left: "30%",
        }}
      />
    </div>
  );
}

