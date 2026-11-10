"use client";

const BADGES = [
  "🔮 MongoDB Atlas", "⚡ Next.js 16", "🛡️ TypeScript", "🤖 AI Pipeline",
  "🗺️ Leaflet Maps", "🧠 Autonomous Agents", "🚀 Hackstellar 2026",
  "📋 PS-16", "⚙️ Real-time Processing", "🌱 Green Logistics", "📦 Reverse Commerce",
];

export function TrustBar() {
  const doubled = [...BADGES, ...BADGES];

  return (
    <div className="relative py-6 overflow-hidden border-y border-slate-800/60 bg-slate-950/40 backdrop-blur-sm">
      {/* Left fade mask */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
      {/* Right fade mask */}
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

      <div className="marquee-track flex gap-6 w-max">
        {doubled.map((badge, i) => (
          <span
            key={i}
            className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold bg-slate-900/80 border border-slate-700/50 text-slate-400 hover:text-slate-200 hover:border-indigo-500/40 transition-colors whitespace-nowrap"
          >
            {badge}
          </span>
        ))}
      </div>
    </div>
  );
}

