import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/all';
// @ts-ignore
import canvasSketch from 'canvas-sketch';
import primaryLogo from './assets/primaryLogo.png';

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
  content: string;
  zIndex?: number;
  onClose: (id: string) => void;
  onFocus: (id: string) => void;
  defaultPosition: { top: string; left: string };
}

const WindowPopup = ({ id, title, content, zIndex, onClose, onFocus, defaultPosition }: WindowProps) => {
  const windowRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  const onFocusRef = useRef(onFocus);
  useLayoutEffect(() => {
    onFocusRef.current = onFocus;
  }, [onFocus]);

  useLayoutEffect(() => {
    if (!windowRef.current || !dragHandleRef.current) return;

    let ctx = gsap.context(() => {
      gsap.fromTo(windowRef.current, 
        { opacity: 0, scale: 0.95, y: 15 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );

      Draggable.create(windowRef.current, {
        type: "x,y",
        trigger: dragHandleRef.current,
        bounds: "body", 
        edgeResistance: 0.65,
        onPress: () => onFocusRef.current(id),
      });
    });

    return () => ctx.revert(); 
  }, [id]); 

  return (
    <div
      ref={windowRef}
      onMouseDown={() => onFocus(id)}
      style={{ zIndex, position: 'absolute', top: defaultPosition.top, left: defaultPosition.left }}
      className="w-full max-w-[400px] bg-[#010101]/90 backdrop-blur-xl border border-[#FFFCF5]/10 shadow-2xl rounded-sm overflow-hidden flex flex-col"
    >
      <div 
        ref={dragHandleRef}
        className="bg-[#FFFCF5]/5 border-b border-[#FFFCF5]/10 px-4 py-3 flex justify-between items-center cursor-grab active:cursor-grabbing"
      >
        <span className="text-[#FFFCF5]/80 text-[10px] tracking-[0.2em] uppercase font-medium">
          {title}
        </span>
        <button 
          onMouseDown={(e) => e.stopPropagation()} 
          onClick={(e) => { e.stopPropagation(); onClose(id); }}
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

//  NAV LINK COMPONENT 
const NavLink = ({ title, onClick }: { title: string, onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="relative group text-[#FFFCF5]/60 hover:text-[#E1FF00] transition-colors duration-300 py-1"
    >
      <span className="relative z-10">{title}</span>
      <svg
        className="absolute left-0 -bottom-1.5 w-full h-[8px] pointer-events-none opacity-80"
        viewBox="0 0 100 10"
        preserveAspectRatio="none"
      >
        <path
          d="M 2 7 Q 25 2 50 6 T 98 4"
          fill="transparent"
          vectorEffect="non-scaling-stroke"
          pathLength="100"
          className="stroke-current stroke-[2px] stroke-linecap-round [stroke-dasharray:100] [stroke-dashoffset:100] group-hover:[stroke-dashoffset:0] transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        />
      </svg>
    </button>
  );
};

// THE MAIN APP
type PageKey = 'solutions' | 'platform' | 'contact';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [openWindows, setOpenWindows] = useState<(WindowProps & { zIndex: number })[]>([]);
  const [highestZ, setHighestZ] = useState(10);

  useEffect(() => {
    const originalTitle = document.title;
    const scrollMessage = "Come back?  ";
    const handleBlur = () => { document.title = scrollMessage; };
    const handleFocus = () => { document.title = originalTitle; };
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

  const pages: Record<PageKey, Omit<WindowProps, 'onClose' | 'onFocus'>> = {
    solutions: { 
      id: 'solutions', title: 'Solutions +', 
      content: 'Strategic solutions designed from first principles to operate in complex, constrained, and continually changing conditions.',
      defaultPosition: { top: '20%', left: '10%' }
    },
    platform: { 
      id: 'platform', title: 'Platform', 
      content: 'The proprietary backbone connecting you to your goals. Built on certainty.',
      defaultPosition: { top: '30%', left: '20%' }
    },
    contact: { 
      id: 'contact', title: 'Contact', 
      content: 'Secure a partnership. Request a demo to visualize our capabilities. Email: thenuancedstudio@gmail.com',
      defaultPosition: { top: '40%', left: '30%' }
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

  const openWindow = (pageKey: PageKey) => {
    const page = pages[pageKey];
    
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
    setOpenWindows((prevWins) => prevWins.filter((w) => w.id !== id));
  };

  return (
    <div className="relative w-full h-screen bg-[#010101] overflow-hidden font-sans text-[#FFFCF5] flex flex-col">
      
      {/*  TOP HALF (50vh)  */}
      <div className="h-[50vh] flex flex-col relative z-10 px-6 md:px-8 pt-6">
        
        {/* NAVBAR ON A 12-COLUMN GRID */}
        <nav className="grid grid-cols-12 gap-4 w-full items-center">
          
          {/* Logo */}
          <div className="col-span-4 md:col-span-6 flex justify-start">
            <div className="font-bold text-[16px] tracking-tighter leading-none h-6">
              <img src={primaryLogo} alt="The Nuanced Studio logo" className="h-full w-auto object-contain" />
            </div>
          </div>
          
          {/* Links */}
          <div className="hidden md:flex col-span-4 md:col-start-7 md:col-span-4 justify-start items-center text-[12px] tracking-[0.15em] uppercase text-[#FFFCF5]/60 pt-2">
            <NavLink title="SOLUTIONS +" onClick={() => openWindow('solutions')} />
            <span className="mx-2 text-[#FFFCF5]/40">,</span>
            <NavLink title="PLATFORM" onClick={() => openWindow('platform')} />
            <span className="mx-2 text-[#FFFCF5]/40">,</span>
            <NavLink title="CONTACT" onClick={() => openWindow('contact')} />
          </div>
          
          {/* CTA Button */}
          <div className="col-span-8 md:col-start-11 md:col-span-2 flex justify-end">
            <button className="border border-[#E1FF00] text-[#FFFCF5] px-4 py-2.5 text-[14px] font-medium tracking-wide transition-colors duration-300 hover:bg-[#E1FF00] hover:text-[#010101]">
              Request a Demo
            </button>
          </div>

        </nav>

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
              <p>are complex, constrined and continually changing</p>
            </div>
          </div>
          
        </div>
      </div>

      {/* BOTTOM HALF (50vh Canvas) */}
      <div className="h-[50vh] w-full relative border-t border-[#E1FF00] z-0">
        <canvas
          ref={canvasRef}
          style={{ display: 'block', width: '100%', height: '100%' }}
        />
      </div>

      {/* RENDER ACTIVE WINDOWS */}
      {openWindows.map((win) => (
        <WindowPopup
          key={win.id}
          {...win}
          onClose={closeWindow}
          onFocus={focusWindow}
        />
      ))}
    </div>
  );
}
