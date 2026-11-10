import { HeroSection } from "../components/landing/HeroSection";
import { TrustBar } from "../components/landing/TrustBar";
import { ProblemSection } from "../components/landing/ProblemSection";
import { HowItWorks } from "../components/landing/HowItWorks";
import { AgentCards } from "../components/landing/AgentCards";
import { DashboardPreview } from "../components/landing/DashboardPreview";
import { ImpactNumbers } from "../components/landing/ImpactNumbers";
import { CTASection } from "../components/landing/CTASection";

export const metadata = {
  title: "OrbitReturn — Autonomous Reverse Logistics & Returns Rerouting Engine",
  description: "Eliminate reverse logistics waste with multi-agent AI. Real-time condition grading, fraud protection, and instant demand rerouting.",
};

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* 1. Hero with interactive tilt mockup, canvas starfield & live stats */}
      <HeroSection />

      {/* 2. Marquee trust banner */}
      <TrustBar />

      {/* 3. The reverse logistics problem breakdown */}
      <ProblemSection />

      {/* 4. Interactive pipeline: Pickup Scan → Vision → Fraud → Dispatch */}
      <HowItWorks />

      {/* 5. 3D tilt cards for each autonomous agent */}
      <AgentCards />

      {/* 6. Realistic browser chrome live operations preview */}
      <DashboardPreview />

      {/* 7. Live counter metrics & India micro-hub distribution */}
      <ImpactNumbers />

      {/* 8. High-impact final CTA banner */}
      <CTASection />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-10 text-center text-xs text-slate-500">
        <div className="container mx-auto px-4 max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">OrbitReturn</span>
            <span>·</span>
            <span>Hackstellar 2026 Problem Statement 16 Prototype</span>
          </div>
          <div className="text-slate-500">
            Engineered with Next.js 16, MongoDB Atlas Geospatial & Autonomous Multi-Agent AI
          </div>
        </div>
      </footer>
    </main>
  );
}
