import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [variant, setVariant] = useState('default');

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    // GSAP quickSetter for true zero-latency hardware acceleration
    const xSetter = gsap.quickSetter(cursor, "x", "px");
    const ySetter = gsap.quickSetter(cursor, "y", "px");

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let windX = 0;
    let windY = 0;

    const updatePosition = () => {
      xSetter(mouseX - 16 + windX);
      ySetter(mouseY - 16 + windY);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      updatePosition();
    };

    const onMouseEnter = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      updatePosition();
    };

    const onWindOffset = (e: Event) => {
      const customEvent = e as CustomEvent<{ x: number; y: number }>;
      windX = customEvent.detail.x || 0;
      windY = customEvent.detail.y || 0;
      updatePosition();
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      if (target.closest('[data-cursor="drag"]')) {
        setVariant('drag');
      } else if (target.closest('[data-cursor="link"]')) {
        setVariant('link');
      } else {
        setVariant('default');
      }
    };

    // Immediately initialize position so cursor is visible on mount
    updatePosition();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseenter', onMouseEnter);
    window.addEventListener('mouseover', onMouseOver);
    window.addEventListener('tns-cursor-wind', onWindOffset as EventListener);

    // Force hide native OS cursor everywhere
    const style = document.createElement('style');
    style.innerHTML = `* { cursor: none !important; }`;
    document.head.appendChild(style);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseenter', onMouseEnter);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('tns-cursor-wind', onWindOffset as EventListener);
      document.head.removeChild(style);
    };
  }, []);

  const isDrag = variant === 'drag';
  const isLink = variant === 'link';

  // Always retain bright electric chartreuse, never turn black on hover
  const colorClass = 'bg-[#E1FF00]';

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999]"
    >
      <div className={`relative w-full h-full flex items-center justify-center transition-transform duration-200 ${isLink ? 'rotate-45' : 'rotate-0'}`}>
        
        {/* State 1: Default / Link Crosshair (Always chartreuse #E1FF00) */}
        <div className={`absolute w-full h-full flex items-center justify-center transition-all duration-200 ${isDrag ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
          <div className={`absolute w-[1px] h-2.5 -translate-y-[7px] ${colorClass} shadow-[0_0_6px_rgba(225,255,0,0.5)]`} />
          <div className={`absolute w-[1px] h-2.5 translate-y-[7px] ${colorClass} shadow-[0_0_6px_rgba(225,255,0,0.5)]`} />
          <div className={`absolute h-[1px] w-2.5 -translate-x-[7px] ${colorClass} shadow-[0_0_6px_rgba(225,255,0,0.5)]`} />
          <div className={`absolute h-[1px] w-2.5 translate-x-[7px] ${colorClass} shadow-[0_0_6px_rgba(225,255,0,0.5)]`} />
        </div>

        {/* State 2: Drag Brackets [ ] */}
        <div className={`absolute w-[18px] h-3.5 border-l-[1.5px] border-r-[1.5px] border-[#E1FF00] shadow-[0_0_8px_rgba(225,255,0,0.4)] transition-all duration-300 ${isDrag ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.5]'}`} />
        
      </div>
    </div>
  );
}