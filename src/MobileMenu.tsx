import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  openWindow: (id: string) => void;
}

export default function MobileMenu({ isOpen, onClose, openWindow }: MobileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Live UTC Clock for the sub-header
  const [utcTime, setUtcTime] = useState<string>('00:00:00');
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setUtcTime(now.toISOString().substring(11, 19));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // The GSAP Drop-down sequence
  useEffect(() => {
    if (!menuRef.current) return;

    if (isOpen) {
      gsap.fromTo(
        menuRef.current,
        { y: '-100%' },
        { y: '0%', duration: 0.6, ease: 'expo.out' }
      );
      gsap.fromTo(
        '.menu-link',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, delay: 0.2, ease: 'power3.out' }
      );
    } else {
      gsap.to(menuRef.current, { y: '-100%', duration: 0.5, ease: 'expo.inOut' });
    }
  }, [isOpen]);

  const handleLinkClick = (id: string) => {
    openWindow(id);
    onClose(); 
  };

  return (
    <div 
      ref={menuRef} 
      className="fixed inset-0 z-[200] bg-[#FFFCF5] text-[#010101] flex flex-col font-mono uppercase translate-y-[-100%] overflow-hidden"
    >
      {/* 1. Header */}
      <div className="flex justify-between items-center px-4 py-4">
        <div className="text-sm font-bold tracking-widest flex items-center gap-3">
          <span className="w-2 h-2 bg-[#e1ff00]"></span>
          THE NUANCED STUDIO
        </div>
        <button 
          onClick={onClose}
          className="p-2 -mr-2 hover:text-[#e1ff00] transition-colors"
        >
          {/* Brutalist X Icon */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* 2. Sub-header Data Ribbon */}
      <div className="flex justify-between items-center px-4 py-2 border-y border-[#010101]/20 text-xs">
        <div className="flex items-center gap-4">
          <span className="border border-[#010101] px-2 py-0.5 font-bold">SYS_ACTIVE</span>
          <span>UTC: {utcTime}</span>
        </div>
        <div className="px-2 py-0.5 font-bold text-[#010101]/50">
          [ TNS_OS ]
        </div>
      </div>

      {/* 3. Main Navigation Links */}
      <div className="flex-grow flex flex-col justify-center px-6 space-y-8">
        <button 
          onClick={() => handleLinkClick('solutions')}
          className="menu-link text-left text-5xl md:text-6xl font-bold tracking-tighter hover:text-[#010101]/40 transition-colors"
        >
          [ SOLUTIONS ]
        </button>
        <button 
          onClick={() => handleLinkClick('works')}
          className="menu-link text-left text-5xl md:text-6xl font-bold tracking-tighter hover:text-[#010101]/40 transition-colors"
        >
          [ WORKS ]
        </button>
        <button 
          onClick={() => handleLinkClick('contact')}
          className="menu-link text-left text-5xl md:text-6xl font-bold tracking-tighter hover:text-[#010101]/40 transition-colors"
        >
          [ CONTACT ]
        </button>
      </div>

      {/* 4. Footer Grid (TNS Specific Data) */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-12 px-4 pb-6 text-[10px] leading-relaxed">
        
        {/* Top Left */}
        <div>
          <div className="text-[#010101]/50 mb-2">SYSTEM STATUS</div>
          <div>[ SECURE UPLINK ]</div>
        </div>

        {/* Top Right */}
        <div>
          <div className="text-[#010101]/50 mb-2">TARGET NODE</div>
          <a href="mailto:thenuancedstudio@gmail.com" className="hover:bg-[#e1ff00] hover:text-[#010101] transition-colors px-1 -mx-1">
            thenuancedstudio@gmail.com
          </a>
        </div>

        {/* Bottom Left */}
        <div className="col-span-1 flex items-end">
          <div className="max-w-[200px] text-[#010101]/70">
            FIRST-PRINCIPLES ARCHITECTURE. BUILT FOR COMPLEX CONDITIONS.
          </div>
        </div>

        {/* Bottom Right */}
        <div className="col-span-1 flex justify-end items-end font-bold">
          TNS © {new Date().getFullYear()}
        </div>

      </div>
    </div>
  );
}