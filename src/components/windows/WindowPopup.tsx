import { useRef, useLayoutEffect, type ReactNode } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/all';

gsap.registerPlugin(Draggable);

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

export default function WindowPopup({ id, title, content, zIndex, index, totalWindows, onClose, onFocus, defaultPosition }: WindowProps) {
  const windowRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const prevTotalRef = useRef(totalWindows);
  const onFocusRef = useRef(onFocus);

  useLayoutEffect(() => {
    onFocusRef.current = onFocus;
  }, [onFocus]);

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

  useLayoutEffect(() => {
    const prevTotal = prevTotalRef.current;
    if (totalWindows > prevTotal && index < totalWindows - 1) {
      gsap.to(windowRef.current, { x: "-=20", duration: 0.6, ease: "power3.out" });
    } else if (totalWindows < prevTotal) {
      gsap.to(windowRef.current, { x: "+=20", duration: 0.6, ease: "power3.out" });
    }
    prevTotalRef.current = totalWindows;
  }, [totalWindows, index]);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    const draggables = Draggable.get(windowRef.current);
    if (draggables) draggables.kill();

    gsap.to(windowRef.current, {
      opacity: 0, scale: 0.98, x: "+=40", duration: 0.3, ease: "power3.in",
      onComplete: () => onClose(id),
    });
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const appliedPosition = isMobile ? { top: '5%', left: '5%' } : defaultPosition; 

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
        <span className="text-[#FFFCF5]/80 text-[10px] tracking-[0.2em] uppercase font-medium">{title}</span>
        <button onMouseDown={(e) => e.stopPropagation()} onClick={handleClose} className="relative w-3 h-3 group cursor-pointer flex items-center justify-center">
          <span className="absolute w-full h-[1px] bg-gray-500 group-hover:bg-[#E1FF00] transition-colors duration-300 rotate-45"></span>
          <span className="absolute w-full h-[1px] bg-gray-500 group-hover:bg-[#E1FF00] transition-colors duration-300 -rotate-45"></span>
        </button>
      </div>
      <div className="p-8 text-[#FFFCF5]/80 font-light text-sm leading-relaxed">
        {content}
      </div>
    </div>
  );
}