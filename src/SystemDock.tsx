import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';

interface DockWindow {
  id: string;
  title: string;
}

interface SystemDockProps {
  availablePages: DockWindow[];
  openWindows: { id: string }[];
  openWindow: (id: string) => void;
}

const DockTab = ({ page, isOpen, openWindow }: { page: DockWindow, isOpen: boolean, openWindow: (id: string) => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isFirstRender = useRef(true);

  useLayoutEffect(() => {
    if (!containerRef.current || !buttonRef.current) return;

    const targetWidth = buttonRef.current.scrollWidth;

    let ctx = gsap.context(() => {
      if (isOpen) {
        gsap.to(containerRef.current, { width: targetWidth, duration: 0.5, ease: "power3.out" });
        gsap.fromTo(buttonRef.current, 
          { x: 20, opacity: 0 }, 
          { x: 0, opacity: 1, duration: 0.5, ease: "power3.out", delay: 0.1 }
        );
      } else {
        if (isFirstRender.current) {
          gsap.set(containerRef.current, { width: 0 });
          gsap.set(buttonRef.current, { opacity: 0, x: 20 });
        } else {
          gsap.to(buttonRef.current, { x: 20, opacity: 0, duration: 0.3, ease: "power3.in" });
          gsap.to(containerRef.current, { width: 0, duration: 0.4, ease: "power3.inOut", delay: 0.1 });
        }
      }
    });

    isFirstRender.current = false;
    return () => ctx.revert();
  }, [isOpen]);

  return (
    <div ref={containerRef} className="overflow-hidden h-full flex items-center">
      <button
        ref={buttonRef}
        onClick={() => openWindow(page.id)}
        data-cursor="invert"
        className="px-4 h-full border-l border-[#FFFCF5]/10 transition-colors flex items-center gap-2 group text-[#FFFCF5] bg-[#FFFCF5]/5 hover:bg-[#FFFCF5]/15 whitespace-nowrap flex-shrink-0"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#E1FF00] shadow-[0_0_5px_rgba(225,255,0,0.5)]"></span>
        {page.title}
      </button>
    </div>
  );
};

export default function SystemDock({ availablePages, openWindows, openWindow }: SystemDockProps) {
  const [time, setTime] = useState("");
  const [batteryStatus, setBatteryStatus] = useState("SYS: NOMINAL");

  useEffect(() => {
    const updateTime = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const nav = navigator as any;
    
    if (nav.getBattery) {
      nav.getBattery().then((battery: any) => {
        const updateBatteryStatus = () => {
          const status = `BAT: ${Math.round(battery.level * 100)}% ${battery.charging ? '[AC]' : '[DC]'}`;
          setBatteryStatus(status);
          document.documentElement.style.setProperty('--battery-status', `"${status}"`);
        };
        
        updateBatteryStatus();
        battery.addEventListener('levelchange', updateBatteryStatus);
        battery.addEventListener('chargingchange', updateBatteryStatus);
        
        return () => {
          battery.removeEventListener('levelchange', updateBatteryStatus);
          battery.removeEventListener('chargingchange', updateBatteryStatus);
        };
      });
    } else {
      setBatteryStatus("BAT: UNAVAILABLE"); 
    }
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-8 bg-[#010101]/80 backdrop-blur-md border-b border-[#FFFCF5]/10 flex items-center justify-between px-6 z-[9000] font-mono text-[10px] uppercase text-[#FFFCF5]/50 tracking-[0.15em] select-none">
      
      <div className="flex items-center h-full">
        <span className="text-[#E1FF00] mr-6 hidden md:inline-block">TNS_OS v1.35.DEV_TBS</span>
        
        <div className="flex h-full">
          {availablePages.map(page => {
            const isOpen = openWindows.some(w => w.id === page.id);
            return (
              <DockTab 
                key={`topbar-${page.id}`} 
                page={page} 
                isOpen={isOpen} 
                openWindow={openWindow} 
              />
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-6 h-full border-l border-[#FFFCF5]/10 pl-6">
        <span className="hidden sm:inline-block text-[#FFFCF5]/50" data-battery-status>{batteryStatus}</span>
        <span>{time}</span>
      </div>
      
    </div>
  );
}