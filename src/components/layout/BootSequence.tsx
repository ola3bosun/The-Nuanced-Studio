import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';

export default function BootSequence() {
  const bootScreenRef = useRef<HTMLDivElement>(null);
  const bootLogoPathRef = useRef<SVGPathElement>(null);
  const bootLineRef = useRef<SVGLineElement>(null);
  const bootTextRef = useRef<HTMLDivElement>(null);
  const termLine1 = useRef<HTMLParagraphElement>(null);
  const termLine2 = useRef<HTMLParagraphElement>(null);
  const termLine3 = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          if (bootScreenRef.current) bootScreenRef.current.style.display = 'none';
        }
      });

      tl.to(bootLogoPathRef.current, { strokeDashoffset: 0, duration: 2, ease: "power1.inOut" });
      tl.to(bootLineRef.current, { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut" }, 2.0);
      tl.to(termLine1.current, { opacity: 1, duration: 0.25 }, "+=0.2");
      tl.to(termLine2.current, { opacity: 1, duration: 0.15 }, "+=0.4");
      tl.to(termLine3.current, { opacity: 1, duration: 1 }, "+=0.4");

      tl.to(bootTextRef.current, { y: "-=40", opacity: 0, duration: 0.6, ease: "power3.in" }, "+=0.6");
      tl.to(bootScreenRef.current, { opacity: 0, duration: 0.5, ease: "power1.inOut" }, "<");

      // Animate sibling elements using their class names
      tl.fromTo(".hero-content", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out" }, "-=0.4");
      tl.fromTo(".canvas-container", { opacity: 0 }, { opacity: 1, duration: 1.5, ease: "power2.out" }, "<");
      tl.to(".ui-layer", { autoAlpha: 1, duration: 1, ease: "power2.out" }, "<");
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      <div className="absolute top-[50vh] left-0 w-full h-[1px] z-0 pointer-events-none">
        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <line ref={bootLineRef} x1="0" y1="0" x2="100%" y2="0" vectorEffect="non-scaling-stroke" stroke="#E1FF00" strokeWidth="1" pathLength="100" className="[stroke-dasharray:100] [stroke-dashoffset:100]" />
        </svg>
      </div>
      
      <div ref={bootScreenRef} className="fixed inset-0 z-50 bg-[#010101] pointer-events-none flex flex-col">
        <div className="h-[50vh] flex flex-col relative px-6 md:px-8 pt-12">
          <nav className="grid grid-cols-12 gap-4 w-full items-center">
            <div className="col-span-4 md:col-span-6 flex justify-start">
              <div className="h-6 flex items-center justify-start">
                <svg viewBox="0 0 130 100" className="h-full w-auto overflow-visible">
                  <path ref={bootLogoPathRef} d="M 2 2 Q 65 35 128 2 L 128 98 Q 65 65 2 98 Z" fill="transparent" stroke="#FFFCF5" strokeWidth="5" strokeLinejoin="round" pathLength="100" className="[stroke-dasharray:100] [stroke-dashoffset:100]" />
                </svg>
              </div>
            </div>
          </nav>
        </div>

        <div ref={bootTextRef} className="absolute bottom-[52vh] left-6 md:left-8 flex flex-col justify-end text-[16px] md:text-[15px] text-[#FFFCF5]/70 tracking-wide font-mono space-y-2">
          <p ref={termLine1} className="opacity-0">&gt; initializing nodes...</p>
          <p ref={termLine2} className="opacity-0">&gt; defining constraints...</p>
          <p ref={termLine3} className="opacity-0 text-[#E1FF00]">&gt; system initializing...</p>
        </div>
      </div>
    </>
  );
}