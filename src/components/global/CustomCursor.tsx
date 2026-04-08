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

    const onMouseMove = (e: MouseEvent) => {
      // Offset by 16px to perfectly center the 32x32px container
      xSetter(e.clientX - 16);
      ySetter(e.clientY - 16);
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Look up the DOM tree to see if we are hovering over a trigger element
      if (target.closest('[data-cursor="drag"]')) {
        setVariant('drag');
      } else if (target.closest('[data-cursor="invert"]')) {
        setVariant('invert');
      } else if (target.closest('[data-cursor="link"]')) {
        setVariant('link');
      } else {
        setVariant('default');
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', onMouseOver);

    // Force hide the native OS cursor everywhere
    const style = document.createElement('style');
    style.innerHTML = `* { cursor: none !important; }`;
    document.head.appendChild(style);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      document.head.removeChild(style);
    };
  }, []);

  const isDrag = variant === 'drag';
  const isLink = variant === 'link';
  const isInvert = variant === 'invert';

  // Toggle color based on the invert state
  const colorClass = isInvert ? 'bg-[#010101]' : 'bg-[#E1FF00]';

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999]"
    >
      <div className={`relative w-full h-full flex items-center justify-center transition-transform duration-200 ${isLink ? 'rotate-45' : 'rotate-0'}`}>
        
        {/* State 1: Default / Link / Invert Crosshair */}
        <div className={`absolute w-full h-full flex items-center justify-center transition-all duration-300 ${isDrag ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
          <div className={`absolute w-[1px] h-2.5 -translate-y-[7px] ${colorClass} transition-colors duration-200`} />
          <div className={`absolute w-[1px] h-2.5 translate-y-[7px] ${colorClass} transition-colors duration-200`} />
          <div className={`absolute h-[1px] w-2.5 -translate-x-[7px] ${colorClass} transition-colors duration-200`} />
          <div className={`absolute h-[1px] w-2.5 translate-x-[7px] ${colorClass} transition-colors duration-200`} />
        </div>

        {/* State 2: Drag Brackets [ ] */}
        <div className={`absolute w-[18px] h-3.5 border-l-[1.5px] border-r-[1.5px] border-[#E1FF00] transition-all duration-300 ${isDrag ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.5]'}`} />
        
      </div>
    </div>
  );
}