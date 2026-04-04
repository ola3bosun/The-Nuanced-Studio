import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function SolutionsContent() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".bento-item",
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
          delay: 0.1,
        },
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="p-6 flex flex-col bg-[#010101] text-[#FFFCF5] w-[90vw] max-w-[750px] min-h-[550px]"
    >
      {/* Window Header */}
      <div className="bento-item mb-8 border-b border-[#FFFCF5]/20 pb-4">
        <h2 className="text-3xl font-sans font-semibold tracking-tight uppercase">
          Core Solutions
        </h2>
        <p className="font-mono text-sm text-[#FFFCF5]/50 mt-2">
          [ DEPLOYMENT PROTOCOLS ACTIVE ]
        </p>
      </div>

      {/* The Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
        {/* Module 01: UX/UI Design */}
        <div className="bento-item group border border-[#FFFCF5]/20 p-5 hover:bg-[#FFFCF5]/5 hover:border-[#FFFCF5]/40 transition-all duration-300 flex flex-col justify-between">
          <div className="font-mono text-xs text-[#e1ff00] mb-4">
            MOD.01 // INTERFACE
          </div>
          <div>
            <h3 className="text-xl font-sans font-semibold mb-2">
              UX & Web Design
            </h3>
            <p className="text-sm text-[#FFFCF5]/60 leading-relaxed font-sans font-normal">
              First-principles interface architecture. High-fidelity,
              frictionless user experiences built for complex conditions.
            </p>
          </div>
        </div>

        {/* Module 02: Web Development */}
        <div className="bento-item group border border-[#FFFCF5]/20 p-5 hover:bg-[#FFFCF5]/5 hover:border-[#FFFCF5]/40 transition-all duration-300 flex flex-col justify-between">
          <div className="font-mono text-xs text-[#e1ff00] mb-4">
            MOD.02 // ENGINEERING
          </div>
          <div>
            <h3 className="text-xl font-sans font-semibold mb-2">
              Web Development
            </h3>
            <p className="text-sm text-[#FFFCF5]/60 leading-relaxed font-sans font-normal">
              Performant, scalable frontend systems. Clean code execution with
              zero-latency operational thresholds.
            </p>
          </div>
        </div>

        {/* Module 03: Data Analysis */}
        <div className="bento-item group border border-[#FFFCF5]/20 p-5 hover:bg-[#FFFCF5]/5 hover:border-[#FFFCF5]/40 transition-all duration-300 flex flex-col justify-between">
          <div className="font-mono text-xs text-[#e1ff00] mb-4">
            MOD.03 // TELEMETRY
          </div>
          <div>
            <h3 className="text-xl font-sans font-semibold mb-2">
              Data Analysis
            </h3>
            <p className="text-sm text-[#FFFCF5]/60 leading-relaxed font-sans font-normal">
              Raw data synthesis and pattern recognition. Translating chaotic
              metrics into actionable insights.
            </p>
          </div>
        </div>

        {/* Module 04: Video Editing */}
        <div className="bento-item group border border-[#FFFCF5]/20 p-5 hover:bg-[#FFFCF5]/5 hover:border-[#FFFCF5]/40 transition-all duration-300 flex flex-col justify-between">
          <div className="font-mono text-xs text-[#e1ff00] mb-4">
            MOD.04 // MEDIA
          </div>
          <div>
            <h3 className="text-xl font-sans font-semibold mb-2">
              Video Editing
            </h3>
            <p className="text-sm text-[#FFFCF5]/60 leading-relaxed font-sans font-normal">
              High-impact visual sequencing and narrative pacing. Precision-cut
              media deployment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
