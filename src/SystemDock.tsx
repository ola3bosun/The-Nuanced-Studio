import { useState, useEffect } from 'react';

// Minimal interfaces to keep the component decoupled
interface DockWindow {
  id: string;
  title: string;
}

interface SystemDockProps {
  availablePages: DockWindow[];
  openWindows: { id: string }[];
  openWindow: (id: string) => void;
}

export default function SystemDock({ availablePages, openWindows, openWindow }: SystemDockProps) {
  const [time, setTime] = useState("");
  const [batteryStatus, setBatteryStatus] = useState("SYS: NOMINAL");

  // Live 24-hour clock
  useEffect(() => {
    const updateTime = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Battery status (Type-cast to bypass missing Battery API types in standard TS)
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
    <div className="fixed bottom-0 left-0 w-full h-8 bg-[#010101]/80 backdrop-blur-md border-t border-[#FFFCF5]/10 flex items-center justify-between px-6 z-[9000] font-mono text-[10px] uppercase text-[#FFFCF5]/50 tracking-[0.15em] select-none">
      
      {/* LEFT: System Label & Permanent Tabs */}
      <div className="flex items-center h-full">
        <span className="text-[#E1FF00] mr-6 hidden md:inline-block">TNS_OS v1.3_TBS</span>
        
        <div className="flex h-full">
          {availablePages.map(page => {
            // Check if this specific page is currently open in the OS
            const isOpen = openWindows.some(w => w.id === page.id);

            return (
              <button
                key={`dock-${page.id}`}
                onClick={() => openWindow(page.id)}
                data-cursor="invert"
                className={`px-4 h-full border-l border-[#FFFCF5]/10 transition-colors flex items-center gap-2 group ${isOpen ? 'text-[#FFFCF5] bg-[#FFFCF5]/5' : 'hover:bg-[#FFFCF5]/10 hover:text-[#FFFCF5]'}`}
              >
                {/* The status indicator dot (Bright Chartreuse if open, dim grey if closed) */}
                <span className={`w-1.5 h-1.5 rounded-full transition-colors ${isOpen ? 'bg-[#E1FF00]' : 'bg-[#FFFCF5]/20 group-hover:bg-[#E1FF00]/50'}`}></span>
                {page.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Live Clock & Status */}
      <div className="flex items-center gap-6 h-full border-l border-[#FFFCF5]/10 pl-6">
        <span className="hidden sm:inline-block text-[#FFFCF5]/50" data-battery-status>{batteryStatus}</span>
        <span>{time}</span>
      </div>
      
    </div>
  );
}