import { useState, useRef, useEffect, useLayoutEffect, type ReactNode } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/all';
import { SplitText } from 'gsap/SplitText';
// @ts-ignore
import canvasSketch from 'canvas-sketch';
import CustomCursor from './CustomCursor';
import SystemDock from './SystemDock';
import Taskbar from './TaskBar';
import SolutionsContent from './SolutionsContent';
import WorksContent from './WorksContent';
import ContactContent from './ContactContent';

// Register all GSAP plugins
gsap.registerPlugin(Draggable, SplitText);

// CANVAS-SKETCH UTILITIES & CLASSES

const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

const mapRange = (value: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

class Vector {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  getDistance(v: Vector) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

class Agent {
  pos: Vector;
  vel: Vector;
  radius: number;
  constructor(x: number, y: number) {
    this.pos = new Vector(x, y);
    this.vel = new Vector(randomRange(-0.5, 0.5), randomRange(-0.5, 0.5));
    this.radius = randomRange(4, 10);
  }

  update(width: number, height: number) {
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;

    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.y > height) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = height;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FFFCF5';
    ctx.fillStyle = '#010101';
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

// CANVAS SKETCH SETUP
const settings = {
  animate: true,
  resizeCanvas: true,
};

const sketch = ({ width, height }: { width: number; height: number }) => {
  const agents: Agent[] = [];
  let numAgents = 120;
  let connectDist = 150;
  if (width < 500) {
    numAgents = 80;
    connectDist = 200;
  };

  for (let i = 0; i < numAgents; i++) {
    agents.push(new Agent(randomRange(0, width), randomRange(0, height)));
  }

  return ({ context, width, height }: { context: CanvasRenderingContext2D; width: number; height: number }) => {
    context.fillStyle = '#010101';
    context.fillRect(0, 0, width, height);

    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      for (let j = i + 1; j < agents.length; j++) {
        const other = agents[j];
        const dist = agent.pos.getDistance(other.pos);

        if (dist > connectDist) continue;

        context.lineWidth = mapRange(dist, 0, connectDist, 2, 0.1);
        context.strokeStyle = '#FFFCF5';
        context.beginPath();
        context.moveTo(agent.pos.x, agent.pos.y);
        context.lineTo(other.pos.x, other.pos.y);
        context.stroke();
      }
    }

    agents.forEach((agent) => {
      agent.update(width, height);
      agent.draw(context);
    });
  };
};

// THE WINDOW COMPONENT 

interface WindowProps {
  id: string;
  title: string;
  content: ReactNode;
  zIndex?: number;
  index: number;
  totalWindows: number;
  onClose: (id: string) => void;
  onFocus: (id: string) => void;
  defaultPosition: { top: string; left: string };
}

const WindowPopup = ({ id, title, content, zIndex, index, totalWindows, onClose, onFocus, defaultPosition }: WindowProps) => {
  const windowRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const prevTotalRef = useRef(totalWindows);
  const onFocusRef = useRef(onFocus);

  useLayoutEffect(() => {
    onFocusRef.current = onFocus;
  }, [onFocus]);

  // ENTRANCE ANIMATION 
  useLayoutEffect(() => {
    if (!windowRef.current || !dragHandleRef.current) return;

    let ctx = gsap.context(() => {
      gsap.fromTo(windowRef.current, 
        { opacity: 0, scale: 0.98, x: 20 },
        { opacity: 1, scale: 1, x: 0, duration: 0.5, ease: "power3.out" }
      );

      Draggable.create(windowRef.current, {
        type: "x,y",
        trigger: dragHandleRef.current,
        bounds: "body",
        edgeResistance: 0.85,
        onPress: () => onFocusRef.current(id),
      });
    });

    return () => ctx.revert(); 
  }, [id]); 

  // DYNAMIC SLIDE (THE PUSH/PULL ENGINE) 
  useLayoutEffect(() => {
    const prevTotal = prevTotalRef.current;
    if (totalWindows > prevTotal && index < totalWindows - 1) {
      gsap.to(windowRef.current, { x: "-=20", duration: 0.6, ease: "power3.out" });
    } else if (totalWindows < prevTotal) {
      gsap.to(windowRef.current, { x: "+=20", duration: 0.6, ease: "power3.out" });
    }
    prevTotalRef.current = totalWindows;
  }, [totalWindows, index]);

  // EXIT ANIMATION 
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    const draggables = Draggable.get(windowRef.current);
    if (draggables) draggables.kill();

    gsap.to(windowRef.current, {
      opacity: 0,
      scale: 0.98,
      x: "+=40",
      duration: 0.3,
      ease: "power3.in",
      onComplete: () => onClose(id),
    });
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const mobilePosition = { top: '5%', left: '5%' };
  const appliedPosition = isMobile ? mobilePosition : defaultPosition; 

  return (
    <div
      ref={windowRef}
      onMouseDown={() => onFocus(id)}
      style={{ zIndex, position: 'absolute', top: appliedPosition.top, left: appliedPosition.left }}
      className="w-auto max-w-[95vw] max-h-[85vh] bg-[#010101]/90 backdrop-blur-xl border border-[#FFFCF5]/10 shadow-2xl rounded-sm overflow-hidden flex flex-col"
    >
      <div 
        data-cursor="drag"
        ref={dragHandleRef}
        className="bg-[#FFFCF5]/5 border-b border-[#FFFCF5]/10 px-4 py-3 flex justify-between items-center cursor-grab active:cursor-grabbing"
      >
        <span className="text-[#FFFCF5]/80 text-[10px] tracking-[0.2em] uppercase font-medium">
          {title}
        </span>
        <button 
          onMouseDown={(e) => e.stopPropagation()} 
          onClick={handleClose}
          className="relative w-3 h-3 group cursor-pointer flex items-center justify-center"
        >
          <span className="absolute w-full h-[1px] bg-gray-500 group-hover:bg-[#E1FF00] transition-colors duration-300 rotate-45"></span>
          <span className="absolute w-full h-[1px] bg-gray-500 group-hover:bg-[#E1FF00] transition-colors duration-300 -rotate-45"></span>
        </button>
      </div>
      <div className="p-8 text-[#FFFCF5]/80 font-light text-sm leading-relaxed">
        {content}
      </div>
    </div>
  );
};

// MOBILE NAVIGATION COMPONENT

interface MobileNavProps {
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

  // UTC Time for the sub-header
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

  // TIMELINE SETUP
  useLayoutEffect(() => {
    if (!navTextRef.current || !closeTextRef.current || !overlayRef.current) return;

    let ctx = gsap.context(() => {
      const splitNav = new SplitText(navTextRef.current, { type: 'chars' });
      const splitClose = new SplitText(closeTextRef.current, { type: 'chars' });

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

      // Timeline (Paused)
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

  //PLAY / REVERSE ON TOGGLE
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
          {/* hidden until its needed (opacity-0) */}
          <div ref={closeTextRef} className="absolute flex gap-[1px] text-[#FFFCF5]/50 opacity-0">[ CLOSE ]</div>
        </button>
      </div>

      {/* THE FULL-SCREEN OVERLAY */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 z-[8000] bg-[#010101] invisible opacity-0 flex flex-col text-[#FFFCF5] font-mono"
      >
        
        {/* HEADER ROW */}
        <div ref={headerRef} className="flex justify-between items-center p-5 border-b border-[#FFFCF5]/20 text-xs tracking-widest uppercase">
          <span>The Nuanced Studio</span>
        </div>

        {/* SUB-HEADER ROW */}
        <div ref={subHeaderRef} className="flex justify-between items-center p-5 border-b border-[#FFFCF5]/10 text-[10px] tracking-widest uppercase text-[#FFFCF5]/70">
          <div className="flex gap-4 items-center">
            <span className="flex items-center gap-2 text-[#FFFCF5]">
              <span className="w-2 h-2 bg-[#E1FF00] inline-block shadow-[0_0_8px_rgba(225,255,0,0.6)] transition-colors"></span>
              SYSTEMS ONLINE
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
            <div className="flex flex-col gap-2">
              <span className="text-[#FFFCF5]">Location</span>
              <span>[7.404307 / N 7°24'15.504']</span>
              <span>[3.904944 / E3°54'17.798'']</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[#FFFCF5]">Enquiries</span>
              <span>HELLO@TNS.COM</span>
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

// THE MAIN APP

export type PageKey = 'solutions' | 'works' | 'contact';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // NEW REF: Wraps the entire navigation UI layer to hide during boot sequence
  const uiLayerRef = useRef<HTMLDivElement>(null);

  const [openWindows, setOpenWindows] = useState<(WindowProps & { zIndex: number })[]>([]);
  const [highestZ, setHighestZ] = useState(10);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // NATIVE AUDIO ENGINE
  const playSystemSound = (type: 'open' | 'close') => {
    const sound = new Audio(`/sounds/${type}.m4a`);
    sound.volume = 0.5;
    sound.play().catch(() => {});
  };

  // BOOT SEQUENCE REFS 
  const bootScreenRef = useRef<HTMLDivElement>(null);
  const bootLogoPathRef = useRef<SVGPathElement>(null);
  const bootLineRef = useRef<SVGLineElement>(null);
  const bootTextRef = useRef<HTMLDivElement>(null);
  const termLine1 = useRef<HTMLParagraphElement>(null);
  const termLine2 = useRef<HTMLParagraphElement>(null);
  const termLine3 = useRef<HTMLParagraphElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // BOOT SEQUENCE ANIMATION 
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

      tl.fromTo(heroContentRef.current, 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" }, 
        "-=0.4"
      );
      tl.fromTo(canvasContainerRef.current, 
        { opacity: 0 }, 
        { opacity: 1, duration: 1.5, ease: "power2.out" }, 
        "<"
      );

      // FADE IN THE NAVIGATION UI AFTER BOOT IS COMPLETE
      if (uiLayerRef.current) {
        tl.to(uiLayerRef.current, { autoAlpha: 1, duration: 1, ease: "power2.out" }, "<");
      }
    });

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const originalTitle = document.title;
    const scrollMessage = "Hibernating...";
    const bootMessage = "Booting...";
    const handleBlur = () => { document.title = scrollMessage; };
    const handleFocus = () => { document.title = bootMessage; setTimeout(() => { document.title = originalTitle; }, 2000) };
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.title = originalTitle; 
    };
  }, []);

  useEffect(() => {
    let manager: any;
    if (canvasRef.current) {
      canvasSketch(sketch, { ...settings, canvas: canvasRef.current }).then((m: any) => { manager = m; });
    }
    return () => { if (manager) manager.unload(); };
  }, []);

  const pages: Record<PageKey, Omit<WindowProps, 'onClose' | 'onFocus' | 'index' | 'totalWindows'>> = {
    solutions: {
      id: 'solutions', title: 'Solutions +',
      content: <SolutionsContent />,
      defaultPosition: { top: '5%', left: '5%' }
    },
    works: {
      id: 'works', title: 'Works +',
      content: <WorksContent />,
      defaultPosition: { top: '7.5%', left: '25%' }
    },
    contact: {
      id: 'contact', title: 'Contact',
      content: <ContactContent />,
      defaultPosition: { top: '10%', left: '40%' }
    }
  };

  const focusWindow = (id: string) => {
    setHighestZ((prevZ) => {
      const nextZ = prevZ + 1;
      setOpenWindows((prevWins) => 
        prevWins.map((w) => (w.id === id ? { ...w, zIndex: nextZ } : w))
      );
      return nextZ;
    });
  };

  const openWindow = (pageKey: string) => {
    playSystemSound('open');
    const page = pages[pageKey as PageKey];
    
    setOpenWindows((prevWins) => {
      if (prevWins.find((w) => w.id === page.id)) {
        focusWindow(page.id);
        return prevWins;
      } else {
        const nextZ = highestZ + 1;
        setHighestZ(nextZ);
        return [...prevWins, { ...page, zIndex: nextZ } as WindowProps & { zIndex: number }];
      }
    });
  };

  const closeWindow = (id: string) => {
    playSystemSound('close');
    setOpenWindows((prevWins) => prevWins.filter((w) => w.id !== id));
  };

  return (
    <div className="relative w-full h-screen bg-[#010101] overflow-hidden font-sans text-[#FFFCF5] flex flex-col">

      <CustomCursor />

      {/* THE PERMANENT HORIZON LINE */}
      <div className="absolute top-[50vh] left-0 w-full h-[1px] z-0 pointer-events-none">
        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <line
            ref={bootLineRef}
            x1="0"
            y1="0"
            x2="100%"
            y2="0"
            vectorEffect="non-scaling-stroke"
            stroke="#E1FF00"
            strokeWidth="1"
            pathLength="100"
            className="[stroke-dasharray:100] [stroke-dashoffset:100] zIndex-1]"
          />
        </svg>
      </div>
      
      {/* THE BOOT SCREEN OVERLAY  */}
      <div ref={bootScreenRef} className="fixed inset-0 z-50 bg-[#010101] pointer-events-none flex flex-col">
        <div className="h-[50vh] flex flex-col relative px-6 md:px-8 pt-12">
          <nav className="grid grid-cols-12 gap-4 w-full items-center">
            <div className="col-span-4 md:col-span-6 flex justify-start">
              <div className="h-6 flex items-center justify-start">
                <svg viewBox="0 0 130 100" className="h-full w-auto overflow-visible">
                  <path
                    ref={bootLogoPathRef}
                    d="M 2 2 Q 65 35 128 2 L 128 98 Q 65 65 2 98 Z"
                    fill="transparent"
                    stroke="#FFFCF5"
                    strokeWidth="5"
                    strokeLinejoin="round"
                    pathLength="100"
                    className="[stroke-dasharray:100] [stroke-dashoffset:100]"
                  />
                </svg>
              </div>
            </div>
          </nav>
        </div>

        <div 
          ref={bootTextRef} 
          className="absolute bottom-[52vh] left-6 md:left-8 flex flex-col justify-end text-[16px] md:text-[15px] text-[#FFFCF5]/70 tracking-wide font-mono space-y-2"
        >
          <p ref={termLine1} className="opacity-0">&gt; initializing nodes...</p>
          <p ref={termLine2} className="opacity-0">&gt; defining constraints...</p>
          <p ref={termLine3} className="opacity-0 text-[#E1FF00]">&gt; system initializing...</p>
        </div>
      </div>

      {/* TOP HALF (50vh)  */}
      <div ref={heroContentRef} className="h-[50vh] flex flex-col relative z-10 px-6 md:px-8 pt-6 opacity-0">
        <div className="grid grid-cols-12 gap-4 flex-1 items-center pb-12">
          <div className="col-span-12 md:col-span-5 flex flex-col justify-center">
            <div className="text-[16px] text-[#FFFCF5]/70 tracking-wide leading-relaxed space-y-3">
              <p>Built on certainty</p>
              <p>Connecting you to your goals</p>
              <p className="font-mono text-[#E1FF00] tracking-widest pt-2">[ TNS ]</p>
            </div>
          </div>
          <div className="col-span-12 md:col-start-7 md:col-span-6 flex flex-col justify-center text-left">
            <h1 className="text-5xl md:text-7xl font-medium tracking-tight leading-[1.1] mb-5">
              The Nuanced <br /> Studio
            </h1>
            <div className="text-[#FFFCF5]/70 text-[16px] leading-relaxed max-w-md">
              <p>Built from the first principles to operate where conditions</p>
              <p>are complex, constrained and continually changing</p>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM HALF (50vh Canvas) */}
      <div ref={canvasContainerRef} className="h-[50vh] w-full relative z-0 opacity-0">
        <canvas
          ref={canvasRef}
          style={{ display: 'block', width: '100%', height: '100%' }}
        />
      </div>

      {/* RENDER ACTIVE WINDOWS */}
      {openWindows.map((win, index) => (
        <WindowPopup
          key={win.id}
          {...win}
          index={index}
          totalWindows={openWindows.length}
          onClose={closeWindow}
          onFocus={focusWindow}
        />
      ))}

      {/* WRAPPER LAYER: Keeps Navigation UI hidden until boot sequence completes */}
      <div ref={uiLayerRef} className="invisible opacity-0">
        
        {/* DESKTOP ONLY: System Dock & Taskbar */}
        <div className="hidden md:block">
          <SystemDock 
            availablePages={Object.values(pages).map(p => ({ id: p.id, title: p.title }))}
            openWindow={openWindow}
            openWindows={openWindows}
          />
          <Taskbar 
            openWindow={openWindow}
            openWindows={openWindows}
            onToggleMenu={() => {}} 
            isMenuOpen={false} 
          />
        </div>

        {/* MOBILE ONLY: Self-contained Tactical Navigation */}
        <MobileNav 
          isOpen={isMobileMenuOpen} 
          onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          openWindow={openWindow} 
        />
      </div>

    </div>
  );
}