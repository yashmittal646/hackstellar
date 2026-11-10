import { HeroSection } from "../components/landing/HeroSection";
import { TrustBar } from "../components/landing/TrustBar";
import { ProblemSection } from "../components/landing/ProblemSection";
import { HowItWorks } from "../components/landing/HowItWorks";
import { AgentCards } from "../components/landing/AgentCards";
import { DashboardPreview } from "../components/landing/DashboardPreview";
import { ImpactNumbers } from "../components/landing/ImpactNumbers";
import { CTASection } from "../components/landing/CTASection";

export const metadata = {
  title: "OrbitReturn — Autonomous Reverse Logistics & Edge Rerouting Engine",
  description: "Enterprise multi-agent AI for reverse logistics. Computer vision quality grading, behavioral fraud detection, and instant geospatial demand matching.",
};

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-[#07090e] text-neutral-100 overflow-x-hidden selection:bg-cyan-400 selection:text-neutral-950">
      {/* 1. Hero with interactive telemetry HUD & real-time live metrics */}
      <HeroSection />

      {/* 2. Architecture & Tech Specification Marquee */}
      <TrustBar />

      {/* 3. The Reverse Freight Tax & Architecture Comparison */}
      <ProblemSection />

      {/* 4. Interactive 4-Stage Autonomous Pipeline */}
      <HowItWorks />

      {/* 5. Autonomous Multi-Agent Architectural Breakdown */}
      <AgentCards />

      {/* 6. High-Precision Command Center & Operations Console */}
      <DashboardPreview />

      {/* 7. Verified Unit Economics & Regional Micro-Hub Radar */}
      <ImpactNumbers />

      {/* 8. Final Enterprise Production CTA */}
      <CTASection />

      {/* Sleek Technical Footer */}
      <footer className="border-t border-white/[0.06] bg-[#05070a] py-12 text-xs font-mono text-neutral-400">
        <div className="container mx-auto px-4 max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white text-sm">OrbitReturn</span>
            <span className="text-neutral-700">|</span>
            <span>HACKSTELLAR 2026 // PROBLEM STATEMENT 16 SPEC</span>
          </div>
          <div className="text-neutral-400">
            ENGINEERED WITH NEXT.JS 16 · MONGODB 2DSPHERE GEOSPATIAL · AUTONOMOUS NEURAL DAG
          </div>
        </div>
      </footer>
    </main>
  );
}
