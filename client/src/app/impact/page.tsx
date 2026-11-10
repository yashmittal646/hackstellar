"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { fetchStats, fetchRecentReturns } from "../../lib/api";
import { DashboardStats, ReturnItem } from "../../types";
import { formatCurrency } from "../../lib/utils";
import {
  TrendingUp,
  Leaf,
  Target,
  Warehouse,
  Star,
  Scan,
  Brain,
  Navigation,
  Server,
  Code2,
  Cpu,
  Map,
  ArrowRight,
  ExternalLink,
  Zap,
  Clock,
} from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Counts up from 0 to `target` over `duration`ms with ease-out cubic */
function useCountUp(target: number, duration = 1600, start = false): number {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!start || target === 0) return;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration, start]);

  return value;
}

function conditionColor(grade: string): string {
  switch (grade) {
    case "pristine": return "text-emerald-400";
    case "good":     return "text-green-400";
    case "fair":     return "text-yellow-400";
    case "damaged":  return "text-orange-400";
    case "defective":return "text-red-400";
    default:         return "text-zinc-400";
  }
}

function fraudColor(risk: string): string {
  switch (risk) {
    case "low":    return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30";
    case "medium": return "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30";
    case "high":   return "bg-red-500/15 text-red-400 border border-red-500/30";
    default:       return "bg-zinc-500/15 text-zinc-400";
  }
}

function routeLabel(dest: string | undefined): string {
  switch (dest) {
    case "direct_to_customer": return "Direct Peer";
    case "nearby_hub":         return "Hub Staged";
    case "central_warehouse":  return "Warehouse";
    default:                   return "Pending";
  }
}

function routeColor(dest: string | undefined): string {
  switch (dest) {
    case "direct_to_customer": return "text-violet-400";
    case "nearby_hub":         return "text-indigo-400";
    case "central_warehouse":  return "text-sky-400";
    default:                   return "text-zinc-500";
  }
}

// ─── SVG Donut ──────────────────────────────────────────────────────────────

interface DonutSegment {
  label: string;
  value: number;
  color: string;
  fill: string;
}

function DonutChart({ breakdown }: { breakdown: Record<string, number> }) {
  const direct    = breakdown["direct_to_customer"] ?? 0;
  const hub       = breakdown["nearby_hub"] ?? 0;
  const warehouse = breakdown["central_warehouse"] ?? 0;
  const total     = direct + hub + warehouse || 1;

  const segments: DonutSegment[] = [
    { label: "Direct Peer",  value: direct,    color: "#8b5cf6", fill: "bg-violet-500" },
    { label: "Hub Staged",   value: hub,       color: "#6366f1", fill: "bg-indigo-500" },
    { label: "Warehouse",    value: warehouse, color: "#0ea5e9", fill: "bg-sky-500" },
  ];

  const cx = 80, cy = 80, r = 60, strokeW = 22;
  const circumference = 2 * Math.PI * r;

  let cumulativePct = 0;
  const slices = segments.map((seg) => {
    const pct = seg.value / total;
    const dash = pct * circumference;
    const gap  = circumference - dash;
    const offset = circumference - cumulativePct * circumference;
    cumulativePct += pct;
    return { ...seg, pct, dash, gap, offset };
  });

  return (
    <div className="flex flex-col items-center gap-6 md:flex-row md:items-center">
      <svg width={160} height={160} viewBox="0 0 160 160" className="shrink-0">
        {/* track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth={strokeW} />
        {slices.map((s, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={strokeW}
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={s.offset}
            strokeLinecap="butt"
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition: "stroke-dasharray 0.6s ease" }}
          />
        ))}
        <text x={cx} y={cy - 6}  textAnchor="middle" fill="#f1f5f9" fontSize="20" fontWeight="800">{total}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#94a3b8" fontSize="9">total</text>
      </svg>
      <div className="flex flex-col gap-3 w-full">
        {slices.map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            <span className={`h-3 w-3 rounded-full shrink-0 ${s.fill}`} />
            <span className="text-sm text-zinc-300 flex-1">{s.label}</span>
            <span className="text-sm font-bold text-white">{s.value}</span>
            <span className="text-xs text-zinc-500 w-10 text-right">{Math.round(s.pct * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ImpactPage() {
  const [stats, setStats]   = useState<DashboardStats | null>(null);
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow]       = useState<string>("");

  useEffect(() => {
    setNow(new Date().toLocaleString("en-IN", {
      dateStyle: "long",
      timeStyle: "short",
    }));

    Promise.all([fetchStats(), fetchRecentReturns()])
      .then(([s, r]) => { setStats(s); setReturns(r.slice(0, 5)); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const interceptionRate =
    stats && stats.totalReturns > 0
      ? Math.round(
          ((stats.routingBreakdown["direct_to_customer"] ?? 0) /
            stats.totalReturns) *
            100
        )
      : 0;

  const warehouseBypasses =
    stats
      ? (stats.routingBreakdown["direct_to_customer"] ?? 0) +
        (stats.routingBreakdown["nearby_hub"] ?? 0)
      : 0;

  // ── Impact Numbers ──────────────────────────────────────────────────────
  const impactCards = [
    {
      icon: TrendingUp,
      label: "Total Cost Saved",
      value: stats ? formatCurrency(stats.savings.totalCostSaved) : "—",
      accent: "from-emerald-500 to-teal-400",
      glow:   "shadow-emerald-500/20",
      border: "border-emerald-500/20",
    },
    {
      icon: Leaf,
      label: "CO₂ Offset",
      value: stats ? `${Math.round(stats.savings.totalCo2Saved)} kg` : "—",
      accent: "from-green-400 to-lime-400",
      glow:   "shadow-green-500/20",
      border: "border-green-500/20",
    },
    {
      icon: Target,
      label: "Interception Rate",
      value: stats ? `${interceptionRate}%` : "—",
      accent: "from-violet-500 to-purple-400",
      glow:   "shadow-violet-500/20",
      border: "border-violet-500/20",
    },
    {
      icon: Warehouse,
      label: "Warehouse Bypasses",
      value: stats ? `${warehouseBypasses}` : "—",
      accent: "from-indigo-500 to-sky-400",
      glow:   "shadow-indigo-500/20",
      border: "border-indigo-500/20",
    },
    {
      icon: Star,
      label: "Avg Return Score",
      value: stats
        ? `${Math.round(stats.savings.avgConditionScore)}/100`
        : "—",
      accent: "from-amber-400 to-orange-400",
      glow:   "shadow-amber-500/20",
      border: "border-amber-500/20",
    },
  ];

  // ── How It Works ────────────────────────────────────────────────────────
  const steps = [
    {
      icon: Scan,
      title: "Pickup Scan",
      desc: "Driver scans the parcel at pickup. VisionQualityAgent grades condition via image analysis — pristine to defective in <2 s.",
      color: "text-emerald-400",
      ring: "ring-emerald-500/30",
    },
    {
      icon: Brain,
      title: "3-Agent AI Pipeline",
      desc: "FraudSentinel cross-checks 11 behavioural signals. LogisticsDispatcher computes optimal routing using geospatial demand + hub proximity.",
      color: "text-violet-400",
      ring: "ring-violet-500/30",
    },
    {
      icon: Navigation,
      title: "Optimal Dispatch",
      desc: "Return routed to nearest peer buyer, staging hub, or warehouse. Driver gets live map. Cost & CO₂ savings logged in real-time.",
      color: "text-indigo-400",
      ring: "ring-indigo-500/30",
    },
  ];

  // ── Tech Stack ───────────────────────────────────────────────────────────
  const techRows = [
    {
      icon: Server,
      layer: "Backend",
      stack: "Node.js / Express",
      details: "MongoDB Atlas · Mongoose · REST API",
    },
    {
      icon: Code2,
      layer: "Frontend",
      stack: "Next.js 16 / TypeScript",
      details: "Tailwind CSS · shadcn/ui · Lucide icons",
    },
    {
      icon: Cpu,
      layer: "AI Engine",
      stack: "3 Autonomous Agents",
      details:
        "VisionQualityAgent · FraudSentinel · LogisticsDispatcher",
    },
    {
      icon: Map,
      layer: "Maps & Geo",
      stack: "Leaflet + 2dsphere",
      details: "MongoDB Geospatial Index · $near queries",
    },
  ];

  return (
    <div className="min-h-screen bg-[#060a0f] text-white">
      {/* ── Background Grid ─────────────────────────────────────────────── */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#8b5cf6 1px, transparent 1px), linear-gradient(90deg, #8b5cf6 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6">
        {/* ═══════════════════════════════════════════════════════════════
            HERO HEADER
        ════════════════════════════════════════════════════════════════ */}
        <section className="mb-16 text-center">
          {/* Badge row */}
          <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300 uppercase tracking-widest">
              PS-16
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Live Data
            </span>
            {now && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800/60 px-3 py-1 text-xs text-zinc-400">
                <Clock className="h-3 w-3" />
                {now}
              </span>
            )}
          </div>

          <h1 className="bg-gradient-to-r from-violet-400 via-indigo-300 to-emerald-400 bg-clip-text text-5xl font-black tracking-tight text-transparent sm:text-6xl md:text-7xl">
            OrbitReturn
            <br />
            Impact Report
          </h1>
          <p className="mt-5 text-lg text-zinc-400 font-medium">
            Returns That Never Go Home — a fully autonomous AI rerouting engine
            built for Hackstellar 2026.
          </p>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            5 BIG IMPACT NUMBERS
        ════════════════════════════════════════════════════════════════ */}
        <section className="mb-16">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Live Impact Metrics
          </h2>
          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-36 rounded-2xl border border-zinc-800 bg-zinc-900/50 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              {impactCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.label}
                    className={`relative overflow-hidden rounded-2xl border ${card.border} bg-zinc-900/60 p-5 shadow-xl ${card.glow} backdrop-blur-sm`}
                  >
                    <div
                      className={`mb-3 inline-flex items-center justify-center rounded-xl bg-gradient-to-br ${card.accent} p-2.5 shadow-lg`}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                      {card.label}
                    </p>
                    <p className="mt-1 text-2xl font-black leading-tight text-white">
                      {card.value}
                    </p>
                    {/* subtle glow blot */}
                    <div
                      className={`pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-gradient-to-br ${card.accent} opacity-10 blur-2xl`}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            HOW IT WORKS
        ════════════════════════════════════════════════════════════════ */}
        <section className="mb-16">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-zinc-500">
            How It Works
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="relative flex flex-col gap-4">
                  <div
                    className={`rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 ring-1 ${step.ring} backdrop-blur-sm`}
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-black text-zinc-400">
                        {i + 1}
                      </span>
                      <Icon className={`h-5 w-5 ${step.color}`} />
                    </div>
                    <h3 className="mb-2 text-base font-black text-white">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-zinc-400">
                      {step.desc}
                    </p>
                  </div>
                  {/* Arrow between steps */}
                  {i < steps.length - 1 && (
                    <div className="absolute -right-5 top-1/2 z-10 hidden -translate-y-1/2 md:block">
                      <ArrowRight className="h-5 w-5 text-zinc-600" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            TECH STACK TABLE
        ════════════════════════════════════════════════════════════════ */}
        <section className="mb-16">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Tech Stack
          </h2>
          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/80">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    Layer
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    Technology
                  </th>
                  <th className="hidden px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-widest text-zinc-500 sm:table-cell">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {techRows.map((row, i) => {
                  const Icon = row.icon;
                  return (
                    <tr
                      key={row.layer}
                      className={`border-b border-zinc-800/50 transition-colors hover:bg-zinc-800/30 ${
                        i === techRows.length - 1 ? "border-0" : ""
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <Icon className="h-4 w-4 text-indigo-400 shrink-0" />
                          <span className="font-semibold text-zinc-200">
                            {row.layer}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-bold text-white">
                        {row.stack}
                      </td>
                      <td className="hidden px-5 py-4 text-zinc-500 sm:table-cell">
                        {row.details}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            TOP 5 RECENT RETURNS TABLE + DONUT (side-by-side on lg)
        ════════════════════════════════════════════════════════════════ */}
        <section className="mb-16 grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* Returns table */}
          <div>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Top 5 Recent Returns
            </h2>
            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm">
              {loading ? (
                <div className="p-8 text-center text-zinc-600 text-sm">
                  Loading returns…
                </div>
              ) : returns.length === 0 ? (
                <div className="p-8 text-center text-zinc-600 text-sm">
                  No returns found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-900/80">
                        {["Return ID", "Product", "Grade", "Fraud", "Routing", "Saved"].map((h) => (
                          <th
                            key={h}
                            className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-widest text-zinc-500"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {returns.map((r, i) => (
                        <tr
                          key={r._id}
                          className={`border-b border-zinc-800/50 transition-colors hover:bg-zinc-800/30 ${
                            i === returns.length - 1 ? "border-0" : ""
                          }`}
                        >
                          <td className="px-4 py-3.5 font-mono text-xs text-zinc-400">
                            {r.returnId?.slice(0, 10)}…
                          </td>
                          <td className="max-w-[140px] truncate px-4 py-3.5 font-semibold text-white">
                            {r.productId?.name ?? "—"}
                          </td>
                          <td className={`px-4 py-3.5 font-bold capitalize ${conditionColor(r.conditionGrade)}`}>
                            {r.conditionGrade}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${fraudColor(r.fraudRisk)}`}>
                              {r.fraudRisk}
                            </span>
                          </td>
                          <td className={`px-4 py-3.5 font-semibold ${routeColor(r.routingDestination)}`}>
                            {routeLabel(r.routingDestination)}
                          </td>
                          <td className="px-4 py-3.5 font-bold text-emerald-400">
                            {formatCurrency(r.costSaved)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Donut chart */}
          <div>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Routing Breakdown
            </h2>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm h-fit">
              {loading || !stats ? (
                <div className="h-40 animate-pulse rounded-xl bg-zinc-800/50" />
              ) : (
                <DonutChart breakdown={stats.routingBreakdown} />
              )}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            BOTTOM CTA
        ════════════════════════════════════════════════════════════════ */}
        <section className="mb-10">
          <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-950/60 via-indigo-950/40 to-zinc-900/60 p-10 text-center shadow-2xl shadow-violet-900/20">
            {/* glow blobs */}
            <div className="pointer-events-none absolute -left-10 -top-10 h-48 w-48 rounded-full bg-violet-600/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-indigo-600/10 blur-3xl" />

            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm font-semibold text-violet-300">
                <Zap className="h-4 w-4" />
                Try the Live Demo
              </div>
              <h2 className="mb-3 text-3xl font-black text-white sm:text-4xl">
                See It in Action
              </h2>
              <p className="mb-6 text-zinc-400">
                Live demo running at{" "}
                <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-sm text-violet-300">
                  http://localhost:3000
                </code>
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/agent-lab"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-700/30 transition-all hover:scale-105 hover:shadow-violet-700/50"
                >
                  Open Agent Lab
                  <ExternalLink className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/60 px-6 py-3 text-sm font-bold text-zinc-200 hover:bg-zinc-700 transition-all"
                >
                  🖨️ Export PDF
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            FOOTER
        ════════════════════════════════════════════════════════════════ */}
        <footer className="text-center text-xs text-zinc-600 pb-4">
          Built for{" "}
          <span className="font-semibold text-zinc-400">Hackstellar 2026</span>
          {" · "}
          <span className="text-violet-500 font-semibold">PS-16</span>
        </footer>
      </div>
    </div>
  );
}
