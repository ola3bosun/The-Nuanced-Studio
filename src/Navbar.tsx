import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText'; // Requires GSAP Club membership

// Register the premium plugin
gsap.registerPlugin(SplitText);

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  openWindow: (pageKey: string) => void;
}

// -------------------------------------------------------------------
// 1. THE SPLIT-TEXT TOGGLE BUTTON (Drop this into your Taskbar.tsx)
// -------------------------------------------------------------------
export const NavToggle = ({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) => {
  const containerRef = useRef<HTMLButtonElement>(null);
  const navTextRef = useRef<HTMLDivElement>(null);
  const closeTextRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useLayoutEffect(() => {
    if (!containerRef.current || !navTextRef.current || !closeTextRef.current) return;

    // Initialize SplitText
    const splitNav = new SplitText(navTextRef.current, { type: 'chars' });
    const splitClose = new SplitText(closeTextRef.current, { type: 'chars' });

    let ctx = gsap.context(() => {
      // Setup initial states
      if (isFirstRender.current) {
        gsap.set(splitClose.chars, { y: 15, opacity: 0 });
        isFirstRender.current = false;
        return;
      }

      if (isOpen) {
        // Animate [SYS_NAV] out, [CLOSE] in
        gsap.to(splitNav.chars, { 
          y: -15, opacity: 0, duration: 0.3, stagger: 0.02, ease: "power3.in" 
        });
        gsap.fromTo(splitClose.chars,
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.3, stagger: 0.02, ease: "power3.out", delay: 0.15 }
        );
      } else {
        // Animate [CLOSE] out, [SYS_NAV] in
        gsap.to(splitClose.chars, { 
          y: -15, opacity: 0, duration: 0.3, stagger: 0.02, ease: "power3.in" 
        });
        gsap.fromTo(splitNav.chars,
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.3, stagger: 0.02, ease: "power3.out", delay: 0.15 }
        );
      }
    }, containerRef);

    return () => {
      splitNav.revert();
      splitClose.revert();
      ctx.revert();
    };
  }, [isOpen]);

  return (
    <button 
      ref={containerRef}
      onClick={onToggle} 
      className="relative w-24 h-11 flex items-center justify-center font-mono text-[10px] tracking-widest text-[#FFFCF5]/70 hover:text-[#E1FF00] transition-colors rounded-xl overflow-hidden"
    >
      <div ref={navTextRef} className="absolute flex gap-[1px]">[SYS_NAV]</div>
      <div ref={closeTextRef} className="absolute flex gap-[1px] text-[#E1FF00]">[CLOSE]</div>
    </button>
  );
};

// -------------------------------------------------------------------
// 2. THE FULL-SCREEN MOBILE OVERLAY
// -------------------------------------------------------------------
export default function MobileMenu({ isOpen, onClose, openWindow }: MobileMenuProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const sysNodeRef = useRef<HTMLDivElement>(null);

  const handleNavClick = (pageKey: string) => {
    openWindow(pageKey);
    onClose();
  };

  useLayoutEffect(() => {
    if (!overlayRef.current || !linksRef.current || !sysNodeRef.current) return;

    let ctx = gsap.context(() => {
      const linkElements = linksRef.current?.children;
      
      if (isOpen) {
        // Fade in the overlay wrapper
        gsap.to(overlayRef.current, { 
          opacity: 1, 
          pointerEvents: 'auto', 
          duration: 0.4, 
          ease: "power2.out" 
        });

        // Stagger in the menu links
        if (linkElements) {
          gsap.fromTo(linkElements, 
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out", delay: 0.2 }
          );
        }

        // Boot up the terminal string at the bottom
        gsap.fromTo(sysNodeRef.current,
          { opacity: 0, scale: 0.95 },
          { opacity: 0.7, scale: 1, duration: 0.5, ease: "power2.out", delay: 0.5 }
        );

      } else {
        // Retreat animations
        if (linkElements) {
          gsap.to(linkElements, { 
            y: -20, opacity: 0, duration: 0.3, stagger: 0.05, ease: "power3.in" 
          });
        }
        
        gsap.to(sysNodeRef.current, { opacity: 0, duration: 0.2 });

        gsap.to(overlayRef.current, { 
          opacity: 0, 
          pointerEvents: 'none', 
          duration: 0.4, 
          ease: "power2.in",
          delay: 0.2 
        });
      }
    });

    return () => ctx.revert();
  }, [isOpen]);

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-[8000] bg-[#010101]/95 backdrop-blur-xl opacity-0 pointer-events-none flex flex-col justify-center px-8 md:hidden"
    >
      {/* Decorative Matrix Grid Lines (Optional: adds to the tactical feel) */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(255,252,245,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,252,245,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />

      <nav ref={linksRef} className="flex flex-col gap-10 text-4xl tracking-tight font-light text-[#FFFCF5] relative z-10">
        <button 
          onClick={() => handleNavClick('solutions')}
          className="text-left hover:text-[#E1FF00] transition-colors origin-left hover:scale-105 duration-300"
        >
          Solutions +
        </button>
        
        <button 
          onClick={() => handleNavClick('works')}
          className="text-left hover:text-[#E1FF00] transition-colors origin-left hover:scale-105 duration-300"
        >
          Works +
        </button>

        <button 
          onClick={() => handleNavClick('contact')}
          className="text-left hover:text-[#E1FF00] transition-colors origin-left hover:scale-105 duration-300"
        >
          Contact
        </button>
      </nav>

      <div 
        ref={sysNodeRef}
        className="absolute bottom-[120px] left-8 text-[#E1FF00] font-mono text-[10px] uppercase tracking-[0.2em] opacity-0"
      >
        <span className="animate-pulse mr-2">●</span>
        TNS_MOBILE_NODE_ACTIVE
      </div>
    </div>
  );
}