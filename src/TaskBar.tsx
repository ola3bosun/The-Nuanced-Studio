import { useState } from 'react';
import primaryLogo2 from './assets/primaryLogo2.png';

interface TaskbarProps {
  openWindow: (pageKey: string) => void;
  openWindows: any[]; // to show the macOS active dots
  onToggleMenu: () => void;
  isMenuOpen: boolean;
}

// SVG Icons for the dock
const WorksIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"></rect>
    <rect x="14" y="3" width="7" height="7" rx="1"></rect>
    <rect x="14" y="14" width="7" height="7" rx="1"></rect>
    <rect x="3" y="14" width="7" height="7" rx="1"></rect>
  </svg>
);

const ContactIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const LightningIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
);

export default function Taskbar({ openWindow, openWindows }: TaskbarProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const dockItems = [
    { id: 'solutions', label: 'Solutions +', isImage: true },
    { id: 'works', label: 'Works +', icon: <WorksIcon /> },
    { id: 'contact', label: 'Contact', icon: <ContactIcon /> },
    { id: 'divider', isDivider: true },
    { id: 'demo', label: 'Request Demo', icon: <LightningIcon />, isCta: true },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9500] select-none pointer-events-none">
      {/* The main dock container */}
      <div className="pointer-events-auto flex items-end gap-2 px-3 py-2 bg-[#010101]/60 backdrop-blur-2xl border border-[#FFFCF5]/15 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] h-[64px]">
        
        {dockItems.map((item, index) => {
          if (item.isDivider) {
            return <div key="divider" className="w-[1px] h-10 bg-[#FFFCF5]/15 mx-1 mb-1" />;
          }

          //MACOS MAGNIFICATION MATH
          let scale = 1;
          let yOffset = 0;
          
          if (hoveredIndex !== null) {
            const distance = Math.abs(hoveredIndex - index);
            if (distance === 0) {
              scale = 1.6; // The hovered item scales up massively
              yOffset = -10; // Pops up
            } else if (distance === 1) {
              scale = 1.2; // Immediate neighbors scale up slightly
              yOffset = -5;
            }
          }

          const baseSize = 45; // Base icon size in px
          const isOpen = openWindows.some((w) => w.id === (item.id === 'demo' ? 'contact' : item.id));

          return (
            <div key={item.id} className="relative flex flex-col items-center justify-end h-full ">
              
              {/* The Hover Tooltip */}
              <div 
                className={`absolute -top-12 px-3 py-1.5 bg-[#010101]/90 backdrop-blur-md border border-[#FFFCF5]/10 text-[#FFFCF5] font-mono text-[10px] uppercase tracking-widest rounded-md whitespace-nowrap transition-all duration-200 pointer-events-none
                  ${hoveredIndex === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
                `}
              >
                {item.label}
              </div>

              {/* The Interactive Icon Button */}
              <button
                data-cursor="invert"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => openWindow(item.id === 'demo' ? 'contact' : item.id)}
                className={`relative flex items-center justify-center rounded-xl transition-all duration-200 ease-out border shadow-lg
                  ${item.isCta 
                    ? 'bg-[#E1FF00] border-[#E1FF00] text-[#010101] shadow-[0_0_15px_rgba(225,255,0,0.3)]' // Special styling for the CTA
                    : 'bg-[#FFFCF5]/5 border-[#FFFCF5]/10 text-[#FFFCF5]/80 hover:bg-[#FFFCF5]/15 hover:text-[#FFFCF5] hover:border-[#FFFCF5]/20'
                  }
                `}
                style={{ 
                  width: `${baseSize * scale}px`, 
                  height: `${baseSize * scale}px`,
                  transform: `translateY(${yOffset}px)`,
                }}
              >
                {item.isImage ? (
                  <img src={primaryLogo2} alt="Logo" className="w-[60%] h-auto object-contain" />
                ) : (
                  <div style={{ transform: `scale(${scale === 1 ? 1 : 1.1})`, transition: 'transform 0.2s' }}>
                    {item.icon}
                  </div>
                )}
              </button>

              {/* The Indicator Dot */}
              <div 
                className={`absolute -bottom-2 w-1 h-1 rounded-full transition-all duration-300
                  ${isOpen ? 'bg-[#E1FF00] opacity-100 scale-100' : 'bg-transparent opacity-0 scale-0'}
                `}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}