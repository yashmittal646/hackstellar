"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Compass, 
  LayoutDashboard, 
  RotateCcw, 
  ShieldAlert, 
  PlusCircle,
  Truck,
  Navigation,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard, live: true },
    { href: "/agent-lab", label: "Agent Lab", icon: Sparkles, highlight: true },
    { href: "/map", label: "Live Map", icon: Compass },
    { href: "/returns", label: "Returns Fleet", icon: RotateCcw },
    { href: "/returns/new", label: "New Return", icon: PlusCircle },
    { href: "/fraud", label: "Fraud Radar", icon: ShieldAlert },
    { href: "/carrier", label: "Driver App", icon: Navigation },
    { href: "/impact", label: "Impact Report", icon: TrendingUp },
  ];

  const linkClass = (item: (typeof navItems)[number]) => {
    const isActive = pathname === item.href;
    if (isActive) {
      return (item as any).highlight
        ? "bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-sm shadow-violet-500/30"
        : "bg-primary text-primary-foreground shadow-sm";
    }
    return (item as any).highlight
      ? "bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border border-violet-500/20"
      : "text-muted-foreground hover:text-foreground hover:bg-muted/70";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* ── Desktop row ─────────────────────────────────────────── */}
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3 font-bold text-xl tracking-tight shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 text-white shadow-md shadow-indigo-500/20">
            <Truck className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-emerald-500 to-indigo-600 bg-clip-text text-transparent font-black leading-none text-xl">
                OrbitReturn
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 tracking-widest hidden sm:inline">
                PS-16
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-0.5">
              Hackstellar 2026 · AI Engine
            </span>
          </div>
        </Link>

        {/* Desktop nav — hidden on mobile */}
        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${linkClass(item)}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
                {(item as any).live && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">Live Engine Active</span>
            <span className="sm:hidden">Live</span>
          </span>
        </div>
      </div>

      {/* ── Mobile scrollable nav row ────────────────────────────── */}
      <div className="lg:hidden border-t border-border/30 bg-background/80">
        <div className="flex overflow-x-auto gap-1 px-3 py-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? (item as any).highlight
                      ? "bg-violet-600 text-white"
                      : "bg-primary text-primary-foreground"
                    : (item as any).highlight
                    ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
