import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

// Ensure the plugin is registered
gsap.registerPlugin(SplitText);

export interface MobileNavProps {
  isOpen: boolean;
  onToggle: () => void;
  openWindow: (pageKey: string) => void;
}

const MobileNav = ({ isOpen, onToggle, openWindow }: MobileNavProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const subHeaderRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  
  // Animation Refs
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const navTextRef = useRef<HTMLDivElement>(null);
  const closeTextRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // UTC Time for the brutalist sub-header
  const [utcTime, setUtcTime] = useState("");
  
  useEffect(() => {
    const updateTime = () => setUtcTime(new Date().toISOString().substring(11, 19));
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleNavClick = (pageKey: string) => {
    openWindow(pageKey);
    onToggle(); 
  };

  // 1. MASTER TIMELINE SETUP (Runs ONCE on mount)
  useLayoutEffect(() => {
    if (!navTextRef.current || !closeTextRef.current || !overlayRef.current) return;

    let ctx = gsap.context(() => {
      // GSAP Context tracks and reverts SplitText automatically
      const splitNav = new SplitText(navTextRef.current, { type: 'chars' });
      const splitClose = new SplitText(closeTextRef.current, { type: 'chars' });

      // Reveal wrapper now that chars are hidden by GSAP
      gsap.set(closeTextRef.current, { opacity: 1 });

      const links = linksRef.current?.children;
      const footerElements = footerRef.current?.children;

      // Define Initial Explicit States
      gsap.set(splitClose.chars, { y: 15, opacity: 0 });
      gsap.set(overlayRef.current, { autoAlpha: 0 });
      gsap.set(headerRef.current, { y: -20, opacity: 0 });
      gsap.set(subHeaderRef.current, { y: -20, opacity: 0 });
      if (links) gsap.set(links, { y: 40, opacity: 0 });
      if (footerElements) gsap.set(footerElements, { y: 20, opacity: 0 });

      // Build the Master Timeline (Paused)
      const tl = gsap.timeline({ paused: true });

      // Morph Button: [SYS_NAV] out, [CLOSE] in
      tl.to(splitNav.chars, { y: -15, opacity: 0, duration: 0.3, stagger: 0.02, ease: "power3.inOut" }, 0);
      tl.to(splitClose.chars, { y: 0, opacity: 1, duration: 0.3, stagger: 0.02, ease: "power3.inOut" }, 0.15);

      // Reveal Overlay
      tl.to(overlayRef.current, { autoAlpha: 1, duration: 0.4, ease: "power2.out" }, 0);
      
      // Stagger UI Elements down into place
      tl.to(headerRef.current, { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }, 0.1);
      tl.to(subHeaderRef.current, { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }, 0.15);
      if (links) tl.to(links, { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out" }, 0.2);
      if (footerElements) tl.to(footerElements, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" }, 0.4);

      tlRef.current = tl;
    });

    // Cleanly reverts timeline and SplitText instances
    return () => ctx.revert(); 
  }, []);

  // 2. PLAY / REVERSE ON TOGGLE
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    if (isOpen) {
      tlRef.current?.play();
    } else {
      tlRef.current?.reverse();
    }
  }, [isOpen]);

  return (
    <div className="md:hidden block">
      
      {/* PERSISTENT FLOATING TRIGGER BUTTON (Bottom Center) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9000]">
        <button 
          onClick={onToggle} 
          className="w-[140px] h-12 flex items-center justify-center bg-[#010101]/80 backdrop-blur-md border border-[#FFFCF5]/15 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] font-mono text-[10px] tracking-widest hover:bg-[#FFFCF5]/5 transition-colors relative overflow-hidden"
        >
          <div ref={navTextRef} className="absolute flex gap-[1px] text-[#E1FF00]">[ SYS_NAV ]</div>
          {/* Note the opacity-0 below so it is hidden before JS fires */}
          <div ref={closeTextRef} className="absolute flex gap-[1px] text-[#FFFCF5]/50 opacity-0">[ CLOSE ]</div>
        </button>
      </div>

      {/* THE BRUTALIST FULL-SCREEN OVERLAY */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 z-[8000] bg-[#010101] invisible opacity-0 flex flex-col text-[#FFFCF5] font-mono"
      >
        
        {/* HEADER ROW (No X Button) */}
        <div ref={headerRef} className="flex justify-between items-center p-5 border-b border-[#FFFCF5]/20 text-xs tracking-widest uppercase">
          <span>The Nuanced Studio</span>
        </div>

        {/* SUB-HEADER ROW */}
        <div ref={subHeaderRef} className="flex justify-between items-center p-5 border-b border-[#FFFCF5]/10 text-[10px] tracking-widest uppercase text-[#FFFCF5]/70">
          <div className="flex gap-4 items-center">
            <span className="flex items-center gap-2 text-[#FFFCF5]">
              <span className="w-2 h-2 bg-[#E1FF00] inline-block shadow-[0_0_8px_rgba(225,255,0,0.6)] transition-colors"></span>
              ONLINE
            </span>
            <span>UTC: {utcTime}</span>
          </div>
          <span>[ // ]</span>
        </div>

        {/* MAIN NAVIGATION LINKS */}
        <nav ref={linksRef} className="flex-1 flex flex-col items-left gap-12 text-4xl sm:text-5xl tracking-widest uppercase">
          <button onClick={() => handleNavClick('solutions')} className="group flex items-center gap-4 hover:text-[#E1FF00] transition-colors pl-5 pt-8">
            <span className="text-[#FFFCF5]/30 group-hover:text-[#E1FF00] transition-colors">[</span>
            Solutions +
            <span className="text-[#FFFCF5]/30 group-hover:text-[#E1FF00] transition-colors">]</span>
          </button>
          
          <button onClick={() => handleNavClick('works')} className="group flex items-center gap-4 hover:text-[#E1FF00] transition-colors pl-5">
            <span className="text-[#FFFCF5]/30 group-hover:text-[#E1FF00] transition-colors">[</span>
            Works +
            <span className="text-[#FFFCF5]/30 group-hover:text-[#E1FF00] transition-colors">]</span>
          </button>

          <button onClick={() => handleNavClick('contact')} className="group flex items-center gap-4 hover:text-[#E1FF00] transition-colors pl-5">
            <span className="text-[#FFFCF5]/30 group-hover:text-[#E1FF00] transition-colors">[</span>
            Contact
            <span className="text-[#FFFCF5]/30 group-hover:text-[#E1FF00] transition-colors">]</span>
          </button>
        </nav>

        {/* FOOTER GRID */}
        <div ref={footerRef} className="p-5 flex flex-col gap-8 text-[10px] uppercase tracking-widest text-[#FFFCF5]/50 border-t border-[#FFFCF5]/10">
          <div className="grid grid-cols-2 gap-4">
            <div className="">
                <h2 className="text-[#FFFCF5] pb-2">SOCIALS</h2> 

                <div className=" flex gap-2 items-start">
                    <span><a href="x.com/bynuanced">X</a></span>
                    <span><a href="linkedin.com/company/the-nuanced-studio">LI</a></span>
                    <span><a href="instagram.com/thenuancedstudio">IG</a></span>
                </div>
              {/* <span>[7.404307 / N 7°24'15.504']</span> */}
              {/* <span>[3.904944 / E3°54'17.798'']</span> */}
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[#FFFCF5]">Enquiries</span>
              <span>INFO@THENUANCEDSTUDIO.COM</span>
            </div>
          </div>

          <div className="flex justify-between items-end border-t border-[#FFFCF5]/10 pt-5">
            <div className="flex flex-col gap-1 max-w-[200px] leading-relaxed">
              <span>Dev_TBS</span>
              <span>Built with grit.</span>
            </div>
            <span className="text-[#FFFCF5]">© {new Date().getFullYear()}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MobileNav;