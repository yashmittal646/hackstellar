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
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/agent-lab", label: "Agent Lab", icon: Sparkles, highlight: true },
    { href: "/map", label: "Live Map", icon: Compass },
    { href: "/returns", label: "Returns Fleet", icon: RotateCcw },
    { href: "/returns/new", label: "New Return", icon: PlusCircle },
    { href: "/fraud", label: "Fraud Radar", icon: ShieldAlert },
    { href: "/carrier", label: "Driver App", icon: Navigation },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3 font-bold text-xl tracking-tight">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 text-white shadow-md shadow-indigo-500/20">
            <Truck className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="bg-gradient-to-r from-emerald-500 to-indigo-600 bg-clip-text text-transparent font-black leading-none text-xl">
              OrbitReturn
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-1">
              Smart Rerouting Engine
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? (item as any).highlight ? "bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-sm shadow-violet-500/30" : "bg-primary text-primary-foreground shadow-sm"
                    : (item as any).highlight
                    ? "bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border border-violet-500/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Engine Active
          </span>
        </div>
      </div>
    </header>
  );
}
