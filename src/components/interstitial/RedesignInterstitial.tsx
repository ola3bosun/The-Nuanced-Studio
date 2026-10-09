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

        {/* MONOCHROME CONTRA LOGO */}
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
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="transition-transform duration-300 group-hover:rotate-45 group-hover:scale-110"
            aria-hidden="true"
          >
            <path d="M12 2C12.5523 2 13 2.44772 13 3V9.58579L17.6569 4.92893C18.0474 4.53841 18.6805 4.53841 19.0711 4.92893C19.4616 5.31946 19.4616 5.95262 19.0711 6.34315L14.4142 11H21C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13H14.4142L19.0711 17.6569C19.4616 18.0474 19.4616 18.6805 19.0711 19.0711C18.6805 19.4616 18.0474 19.4616 17.6569 19.0711L13 14.4142V21C13 21.5523 12.5523 22 12 22C11.4477 22 11 21.5523 11 21V14.4142L6.34315 19.0711C5.95262 19.4616 5.31946 19.4616 4.92893 19.0711C4.53841 18.6805 4.53841 18.0474 4.92893 17.6569L9.58579 13H3C2.44772 13 2 12.5523 2 12C2 11.4477 2 12 2Z" />
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
