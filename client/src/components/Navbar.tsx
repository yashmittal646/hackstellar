"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Compass, 
  LayoutDashboard, 
  RotateCcw, 
  ShieldAlert, 
  Truck, 
  Sparkles, 
  TrendingUp, 
  Play,
  ScanLine,
  Bike,
  Zap,
  Layers
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Overview", icon: Layers },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, live: true },
    { href: "/agent-lab", label: "Agent Lab", icon: Sparkles, highlight: true },
    { href: "/scanner", label: "Doorstep Scanner", icon: ScanLine },
    { href: "/rider", label: "Rider Tasks", icon: Bike },
    { href: "/map", label: "Live Map", icon: Compass },
    { href: "/fraud", label: "Fraud Radar", icon: ShieldAlert },
    { href: "/impact", label: "Impact Ledger", icon: TrendingUp },
    { href: "/demo", label: "Judge Guide", icon: Play, demo: true },
  ];

  const linkClass = (item: (typeof navItems)[number]) => {
    const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
    
    if (isActive) {
      if ((item as any).demo) {
        return "bg-white text-neutral-950 font-semibold shadow-sm";
      }
      if ((item as any).highlight) {
        return "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold";
      }
      return "bg-white/[0.1] text-white border border-white/[0.14] font-semibold";
    }

    if ((item as any).demo) {
      return "bg-white text-neutral-950 hover:bg-neutral-200 font-semibold text-xs";
    }
    if ((item as any).highlight) {
      return "bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/20";
    }
    return "text-neutral-400 hover:text-white hover:bg-white/[0.04]";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#07090e]/85 backdrop-blur-xl">
      {/* ── Desktop Row ─────────────────────────────────────────── */}
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-neutral-950 shadow-[0_0_20px_rgba(255,255,255,0.2)] group-hover:scale-105 transition-transform">
            <Truck className="h-4.5 w-4.5 text-neutral-950" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-lg tracking-tight">
                OrbitReturn
              </span>
              <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/[0.08] text-neutral-300 border border-white/[0.1] tracking-widest hidden sm:inline">
                PS-16
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-widest mt-0.5">
              AUTONOMOUS REVERSE LOGISTICS
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${linkClass(item)}`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{item.label}</span>
                {(item as any).live && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Status Badge */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">AI ENGINE LIVE</span>
            <span className="sm:hidden">LIVE</span>
          </span>
          <Link
            href="/agent-lab"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-neutral-950 font-bold text-xs hover:opacity-95 transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)]"
          >
            <Zap className="w-3.5 h-3.5 fill-neutral-950" />
            <span>Simulate</span>
          </Link>
        </div>
      </div>

      {/* ── Mobile Scrollable Nav Row ────────────────────────────── */}
      <div className="lg:hidden border-t border-white/[0.06] bg-[#07090e]/95">
        <div className="flex overflow-x-auto gap-1 px-3 py-2 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? "bg-white/[0.1] text-white font-semibold border border-white/[0.12]"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
