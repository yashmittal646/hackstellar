"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Navigation,
  ScanLine,
  MapPin,
  MessageSquare,
  ShieldAlert,
  Bike,
} from "lucide-react";

const navItems = [
  { href: "/", label: "My Tasks", icon: Navigation },
  { href: "/scanner", label: "Scan & Inspect", icon: ScanLine },
  { href: "/map", label: "Live Map", icon: MapPin },
  { href: "/feedback", label: "Feedback", icon: MessageSquare },
  { href: "/flag-issue", label: "Report Issue", icon: ShieldAlert },
];

export function Navbar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* ── Desktop Top Bar ─────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#07090e]/90 backdrop-blur-xl hidden lg:block">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:scale-105 transition-transform">
              <Bike className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-lg tracking-tight">
                  OrbitRider
                </span>
                <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 tracking-widest">
                  RIDER
                </span>
              </div>
              <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest mt-0.5">
                DELIVERY EXECUTIVE CONSOLE
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    active
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold"
                      : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              On Duty
            </span>
          </div>
        </div>
      </header>

      {/* ── Mobile Top Bar (minimal) ─────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#07090e]/90 backdrop-blur-xl lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white">
              <Bike className="h-4 w-4" />
            </div>
            <span className="text-white font-bold text-base tracking-tight">OrbitRider</span>
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            On Duty
          </span>
        </div>
      </header>

      {/* ── Mobile Bottom Navigation Bar ─────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.08] bg-[#07090e]/95 backdrop-blur-xl lg:hidden safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-lg transition-all ${
                  active
                    ? "text-emerald-400"
                    : "text-neutral-500 active:text-neutral-300"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "text-emerald-400" : ""}`} />
                <span className={`text-[10px] font-medium ${active ? "text-emerald-400" : ""}`}>
                  {item.label}
                </span>
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-emerald-400 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
