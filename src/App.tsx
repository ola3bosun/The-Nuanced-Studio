import { useState, useRef, useEffect, useLayoutEffect, type ReactNode } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/all';
// @ts-ignore
import canvasSketch from 'canvas-sketch';
import CustomCursor from './CustomCursor';
import SystemDock from './SystemDock';
// import Navbar from './Navbar';
import Taskbar from './TaskBar';
import SolutionsContent from './SolutionsContent';
import WorksContent from './WorksContent';
import ContactContent from './ContactContent';

gsap.registerPlugin(Draggable);

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
  const numAgents = 120;
  const connectDist = 150;

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
  index: number;         // NEW: Tracks its position in the array
  totalWindows: number;  // NEW: Tracks how many windows are open globally
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

  //  ENTRANCE ANIMATION 
  useLayoutEffect(() => {
    if (!windowRef.current || !dragHandleRef.current) return;

    let ctx = gsap.context(() => {
      // Slides in from the right (x: 20 to x: 0)
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

  //  DYNAMIC SLIDE (THE PUSH/PULL ENGINE) 
  useLayoutEffect(() => {
    const prevTotal = prevTotalRef.current;
    
    // If a NEW window opened, and this is an OLDER window, push it left to make room
    if (totalWindows > prevTotal && index < totalWindows - 1) {
      gsap.to(windowRef.current, { x: "-=40", duration: 0.6, ease: "power3.out" });
    } 
    // If a window CLOSED, pull the remaining windows back to the right
    else if (totalWindows < prevTotal) {
      gsap.to(windowRef.current, { x: "+=40", duration: 0.6, ease: "power3.out" });
    }
    
    prevTotalRef.current = totalWindows;
  }, [totalWindows, index]);

  //  EXIT ANIMATION 
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const draggables = Draggable.get(windowRef.current);
    if (draggables) draggables.kill();

    // Fade out and slide relative to its right ("+=40") so it doesn't teleport if dragged
    gsap.to(windowRef.current, {
      opacity: 0,
      scale: 0.98,
      x: "+=40",
      duration: 0.3,
      ease: "power3.in",
      onComplete: () => onClose(id),
    });
  };

  // start responsivness from here

  // // Detect if on a mobile device (roughly < 768px wide)
  // const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // // If mobile, ignore the custom top/left props and center it.
  // const mobilePosition = { top: '5%', left: '5%' };
  // const appliedPosition = isMobile ? mobilePosition : defaultPosition;

  return (
    <div
      ref={windowRef}
      onMouseDown={() => onFocus(id)}
      style={{ zIndex, position: 'absolute', top: defaultPosition.top, left: defaultPosition.left }}
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

// THE MAIN APP
export type PageKey = 'solutions' | 'works' | 'contact';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [openWindows, setOpenWindows] = useState<(WindowProps & { zIndex: number })[]>([]);
  const [highestZ, setHighestZ] = useState(10);

  // NATIVE AUDIO ENGINE - i avoided npm i use-sound, to be safe... i think
  const playSystemSound = (type: 'open' | 'close') => {
    const sound = new Audio(`/sounds/${type}.m4a`);
    sound.volume = 0.5;
    sound.play().catch(() => {});
  };

  //  BOOT SEQUENCE REFS 
  const bootScreenRef = useRef<HTMLDivElement>(null);
  const bootLogoPathRef = useRef<SVGPathElement>(null);
  const bootLineRef = useRef<SVGLineElement>(null);
  const bootTextRef = useRef<HTMLDivElement>(null);
  const termLine1 = useRef<HTMLParagraphElement>(null);
  const termLine2 = useRef<HTMLParagraphElement>(null);
  const termLine3 = useRef<HTMLParagraphElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  //  BOOT SEQUENCE ANIMATION 
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          if (bootScreenRef.current) bootScreenRef.current.style.display = 'none';
        }
      });

      // Phase 1: Draw the SVG Logo 
      tl.to(bootLogoPathRef.current, { strokeDashoffset: 0, duration: 2, ease: "power1.inOut" });

      // Phase 2: Draw Horizon Line 
      tl.to(bootLineRef.current, { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut" }, 2.0);

      // Phase 3: Terminal Typing
      tl.to(termLine1.current, { opacity: 1, duration: 0.25 }, "+=0.2");
      tl.to(termLine2.current, { opacity: 1, duration: 0.15 }, "+=0.4");
      tl.to(termLine3.current, { opacity: 1, duration: 1 }, "+=0.4");

      // Phase 4: The Snap
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
      defaultPosition: { top: '40%', left: '25%' }
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
      playSystemSound('open'); // Play open sound on click
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
    playSystemSound('close'); // Play close sound on click
    setOpenWindows((prevWins) => prevWins.filter((w) => w.id !== id));
  };

  return (
    <div className="relative w-full h-screen bg-[#010101] overflow-hidden font-sans text-[#FFFCF5] flex flex-col">

      <CustomCursor />

      {/* THE PERMANENT HORIZON LINE */}
      <div className="absolute top-[50vh] left-0 w-full h-[1px] z-[15] pointer-events-none">
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
            className="[stroke-dasharray:100] [stroke-dashoffset:100]"
          />
        </svg>
      </div>
      
      {/* THE BOOT SCREEN OVERLAY  */}
      <div ref={bootScreenRef} className="fixed inset-0 z-50 bg-[#010101] pointer-events-none flex flex-col">
        
        {/* Exact structural clone of the padding/grid to ensure pixel-perfect SVG alignment */}
        <div className="h-[50vh] flex flex-col relative px-6 md:px-8 pt-12">
          <nav className="grid grid-cols-12 gap-4 w-full items-center">
            <div className="col-span-4 md:col-span-6 flex justify-start">
              {/* SVG wrapped in the identical h-6 container to match the real PNG */}
              <div className="h-6 flex items-center justify-start">
                <svg viewBox="0 0 130 100" className="h-full w-auto overflow-visible">
                  <path
                    ref={bootLogoPathRef}
                    // Adjusted path to precisely match the pinched bowtie shape
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

        {/* Phase 3: The Terminal Text positioned above the horizontal line */}
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
        
        {/* Render Extracted Navbar Component */}
        {/* <Navbar openWindow={openWindow} /> */}

        {/* HERO COPY (12-Column Grid) */}
        <div className="grid grid-cols-12 gap-4 flex-1 items-center pb-12">
          
          {/* Left Subtext */}
          <div className="col-span-12 md:col-span-5 flex flex-col justify-center">
            <div className="text-[16px] text-[#FFFCF5]/70 tracking-wide leading-relaxed space-y-3">
              <p>Built on certainty</p>
              <p>Connecting you to your goals</p>
              <p className="font-mono text-[#E1FF00] tracking-widest pt-2">[ TNS ]</p>
            </div>
          </div>

          {/* Right Main Text */}
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

      {/* THE TACTICAL SYSTEM DOCK (Now at top of viewport) */}
      <SystemDock 
        availablePages={Object.values(pages)} 
        openWindows={openWindows} 
        openWindow={openWindow} 
      />
      <Taskbar 
      openWindow={openWindow} 
      openWindows={openWindows}
      />

    </div>
  );
}