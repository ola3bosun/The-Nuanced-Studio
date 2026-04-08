import { useState, useEffect, type ReactNode } from 'react';
import CustomCursor from './components/global/CustomCursor';
import SystemDock from './components/navigation/SystemDock';
import Taskbar from './components/navigation/TaskBar';
import MobileNav from './components/navigation/MobileNav';
import SolutionsContent from './components/windows/SolutionsContent';
import WorksContent from './components/windows/WorksContent';
import ContactContent from './components/windows/ContactContent';
import WindowPopup from './components/windows/WindowPopup';
import BackgroundCanvas from './components/layout/BackgroundCanvas';
import HeroContent from './components/layout/HeroContent';
import BootSequence from './components/layout/BootSequence';

export type PageKey = 'solutions' | 'works' | 'contact';

export default function App() {
  const [openWindows, setOpenWindows] = useState<(any & { zIndex: number })[]>([]);
  const [highestZ, setHighestZ] = useState(10);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // NATIVE AUDIO ENGINE
  const playSystemSound = (type: 'open' | 'close') => {
    const sound = new Audio(`/sounds/${type}.m4a`);
    sound.volume = 0.5;
    sound.play().catch(() => {});
  };

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

  const pages: Record<PageKey, any> = {
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
        return [...prevWins, { ...page, zIndex: nextZ }];
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
      
      <BootSequence />
      <HeroContent />
      <BackgroundCanvas />

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

      {/* ui-layer class is targeted by BootSequence to fade in */}
      <div className="invisible opacity-0 ui-layer">
        <div className="hidden md:block">
          <SystemDock 
            availablePages={Object.values(pages).map((p: any) => ({ id: p.id, title: p.title }))}
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

        <MobileNav 
          isOpen={isMobileMenuOpen} 
          onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          openWindow={openWindow} 
        />
      </div>
    </div>
  );
}