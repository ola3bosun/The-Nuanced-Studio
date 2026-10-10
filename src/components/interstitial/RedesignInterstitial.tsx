import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import CustomCursor from '../global/CustomCursor';
import InteractivePet from './InteractivePet';
import ParticleCanvas from './ParticleCanvas';
import LogModal from './LogModal';

export default function RedesignInterstitial() {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoPathRef = useRef<SVGPathElement>(null);

  // Active modal log ('design' | 'dev' | null)
  const [activeLog, setActiveLog] = useState<'design' | 'dev' | null>(null);

  // Initialize with real-time West Africa Time (WAT) — Lagos, Nigeria (UTC+1)
  const [watTime, setWatTime] = useState(() => {
    return new Date().toLocaleTimeString('en-GB', {
      timeZone: 'Africa/Lagos',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  });

  // 1. Live WAT clock interval (ticks every second)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-GB', {
        timeZone: 'Africa/Lagos',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      setWatTime(timeString);
    };

    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Dynamic document title behavior
  useEffect(() => {
    const originalTitle = document.title;
    const pageTitle = "The Nuanced Studio — We're Rebuilding";
    document.title = pageTitle;

    const handleBlur = () => {
      document.title = 'TNS — [ Redesigning ]';
    };
    const handleFocus = () => {
      document.title = pageTitle;
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.title = originalTitle;
    };
  }, []);

  // 3. Strictly Keyboard-Driven Hotkeys ('D' for Design Log, 'T' for Dev Log)
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'd' || e.key === 'D') {
        setActiveLog((prev) => (prev === 'design' ? null : 'design'));
      } else if (e.key === 't' || e.key === 'T') {
        setActiveLog((prev) => (prev === 'dev' ? null : 'dev'));
      }
    };

    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  // 4. GSAP Entrance Animations with prefers-reduced-motion support
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      if (logoPathRef.current) {
        logoPathRef.current.style.strokeDashoffset = '0';
      }
      gsap.set('.wireframe-reveal', { opacity: 1, y: 0, scale: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
      });

      // Animate chartreuse logo SVG draw (outline only, no fill)
      if (logoPathRef.current) {
        tl.fromTo(
          logoPathRef.current,
          { strokeDashoffset: 100 },
          { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' }
        );
      }

      // Top header reveal
      tl.fromTo(
        '.wireframe-header',
        { opacity: 0, y: -14 },
        { opacity: 1, y: 0, duration: 0.8 },
        '-=0.8'
      );

      // Line 1: WE'RE
      tl.fromTo(
        '.wireframe-line-1',
        { opacity: 0, y: 36 },
        { opacity: 1, y: 0, duration: 0.9 },
        '-=0.5'
      );

      // Massive Blob in bottom left
      tl.fromTo(
        '.wireframe-pet',
        { opacity: 0, scale: 0.85, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 1.1 },
        '-=0.7'
      );

      // Line 2: - REDESIGNING (aligned right)
      tl.fromTo(
        '.wireframe-line-2',
        { opacity: 0, y: 36 },
        { opacity: 1, y: 0, duration: 0.9 },
        '-=0.8'
      );

      // Bottom center time reveal
      tl.fromTo(
        '.wireframe-time-center',
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.8 },
        '-=0.5'
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-screen max-h-screen w-full bg-[#010101] text-[#FFFCF5] font-['Clash_Grotesk'] selection:bg-[#FFFCF5] selection:text-[#010101] overflow-hidden flex flex-col justify-between p-5 sm:p-6 md:p-8 lg:p-10 relative select-none"
    >
      <CustomCursor />

      {/* CONCRETE DUST MOTES (GRAY -> WHITE -> CHARTREUSE) */}
      <ParticleCanvas />

      {/* TOP HEADER ROW: STANDALONE LOGO WITHOUT FILL (Left) + MONOCHROME CONTRA LOGO (Right) */}
      <header className="wireframe-header wireframe-reveal w-full flex items-center justify-between z-30 flex-shrink-0">
        
        {/* STANDALONE CHARTREUSE LOGO (Outline only, NO FILL) */}
        <a
          href="/"
          className="group flex items-center focus-visible:outline-none"
          aria-label="The Nuanced Studio"
        >
          <div className="h-8 sm:h-9 w-auto flex items-center transition-transform duration-300 group-hover:scale-105">
            <svg
              viewBox="0 0 130 100"
              className="h-8 sm:h-9 w-auto overflow-visible"
              aria-label="TNS Emblem"
            >
              <path
                ref={logoPathRef}
                d="M 2 2 Q 65 35 128 2 L 128 98 Q 65 65 2 98 Z"
                fill="transparent"
                stroke="#E1FF00"
                strokeWidth="4"
                strokeLinejoin="round"
                pathLength="100"
                className="[stroke-dasharray:100] [stroke-dashoffset:100] drop-shadow-[0_0_12px_rgba(225,255,0,0.3)] transition-all duration-300 group-hover:drop-shadow-[0_0_20px_rgba(225,255,0,0.6)]"
              />
            </svg>
          </div>
        </a>

        {/* MONOCHROME CONTRA LOGO (OFFICIAL EMBLEM, BRAND-COMPLIANT MONOCHROME) */}
        <a
          href="https://contra.com/WorkWithSokio"
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="link"
          className="group flex items-center justify-center p-2 text-[#FFFCF5]/70 hover:text-[#FFFCF5] transition-colors duration-300 focus-visible:outline-none"
          aria-label="Work with Sokio on Contra"
          title="Work with Sokio on Contra"
        >
          <svg
            viewBox="0 0 40 40"
            className="w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-300 group-hover:scale-105"
            fill="none"
            aria-hidden="true"
          >
            <g clipPath="url(#contra-brand-clip)">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.5837 6.53229C12.606 9.54834 10.017 12.1283 6.98663 14.0969C4.84665 15.5601 2.50067 16.75 0 17.611V18.3014H18.8041V-0.51245H18.1423C17.276 2.00859 16.0718 4.3757 14.5837 6.53229ZM22.2193 -0.51245V18.3822H41.0256V17.6917C38.5257 16.8308 36.1812 15.6408 34.0391 14.1776C31.0116 12.209 28.4204 9.62908 26.4427 6.61303C24.9388 4.43381 23.7239 2.03954 22.8554 -0.51245H22.2193ZM41.0256 21.6178H22.2193V40.5124H22.8554C23.7239 37.9612 24.938 35.5662 26.4427 33.387C28.4204 30.3709 31.0124 27.791 34.0391 25.8224C36.1812 24.3585 38.5257 23.1692 41.0256 22.3083V21.6178ZM18.8048 40.5124V21.6986H0.000754578V22.389C2.50067 23.25 4.84741 24.4399 6.98739 25.9031C10.017 27.8717 12.606 30.4525 14.5845 33.4677C16.0725 35.6243 17.2768 37.9906 18.1439 40.5117L18.8048 40.5124Z"
                fill="currentColor"
              />
            </g>
            <defs>
              <clipPath id="contra-brand-clip">
                <rect width="40" height="40" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </a>
      </header>

      {/* MASSIVE BLOB IN BOTTOM LEFT (OVERLAPPING LAYER) */}
      <div className="wireframe-pet wireframe-reveal absolute -bottom-10 sm:-bottom-14 md:-bottom-18 -left-6 sm:-left-10 md:-left-14 z-10 pointer-events-auto">
        <InteractivePet />
      </div>

      {/* MAIN VIEWPORT COMPOSITION: MONUMENTAL TNS CLASH GROTESK DISPLAY (Z-20 LAYER) */}
      <main className="w-full flex-1 flex flex-col justify-center my-auto z-20 pointer-events-none select-none">
        
        {/* ROW 1: "WE'RE" (FLUSH LEFT) */}
        <div className="w-full overflow-hidden text-left pointer-events-auto">
          <h1
            className="wireframe-line-1 wireframe-reveal text-[clamp(3.5rem,12vw,14rem)] font-semibold tracking-tight leading-[0.85] uppercase text-[#FFFCF5] whitespace-nowrap"
          >
            WE'RE
          </h1>
        </div>

        {/* ROW 2: "- REDESIGNING" (ALIGNED HARD RIGHT) */}
        <div className="w-full overflow-hidden flex justify-end text-right pointer-events-auto mt-2 sm:mt-6 md:mt-10">
          <h2
            className="wireframe-line-2 wireframe-reveal text-[clamp(2.5rem,10.2vw,12rem)] font-semibold tracking-tight leading-[0.85] uppercase text-[#FFFCF5] whitespace-nowrap"
          >
            - REDESIGNING
          </h2>
        </div>

      </main>

      {/* EXACT BOTTOM CENTER TIME (WAT) — PERFECTLY CENTERED */}
      <div className="wireframe-time-center wireframe-reveal fixed bottom-4 sm:bottom-5 md:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center select-none pointer-events-auto font-mono text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-[#FFFCF5]/50">
        <div className="flex items-center gap-2 whitespace-nowrap px-3 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FFFCF5]/60 animate-pulse" />
          <span>WAT — [{watTime}]</span>
        </div>
      </div>

      {/* LOG MODAL OVERLAY (KEYBOARD-DRIVEN, ESC TO CLOSE) */}
      <LogModal type={activeLog} onClose={() => setActiveLog(null)} />
    </div>
  );
}
