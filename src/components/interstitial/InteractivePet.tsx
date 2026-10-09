import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const MOODS = [
  'OBSERVING',
  'CONTEMPLATING',
  'REBUILDING',
  'HIBERNATING',
  'SCHEMING',
  'PONDERING',
  'TRANSCENDING',
  'CALCULATING',
  'WATCHING',
  'RESTING',
];

const getHourlyMood = () => {
  const threeHourBlock = Math.floor(Date.now() / (1000 * 60 * 60 * 3));
  const pseudoHash = Math.abs((threeHourBlock * 9301 + 49297) % 233280);
  return MOODS[pseudoHash % MOODS.length];
};

export default function InteractivePet() {
  const petRef = useRef<HTMLDivElement>(null);
  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);
  const leftPupilRef = useRef<HTMLDivElement>(null);
  const rightPupilRef = useRef<HTMLDivElement>(null);
  const mouthRef = useRef<HTMLDivElement>(null);
  const nozzleRef = useRef<HTMLDivElement>(null);

  const [isBlinking, setIsBlinking] = useState(false);
  const [currentMood, setCurrentMood] = useState(getHourlyMood);
  const [isBlowing, setIsBlowing] = useState(false);
  const [isExhausted, setIsExhausted] = useState(false);
  const [blowAngle, setBlowAngle] = useState(0);

  // Ref tracking continuous blow duration for 15s rebreather mechanic
  const blowStartTimeRef = useRef<number | null>(null);
  const exhaustionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Periodically refresh 3-hour mood
  useEffect(() => {
    const moodInterval = setInterval(() => {
      setCurrentMood(getHourlyMood());
    }, 60000);
    return () => clearInterval(moodInterval);
  }, []);

  // Cursor tracking & Wind resistance physics
  useEffect(() => {
    let animationFrameId: number;
    let targetLeftX = 0;
    let targetLeftY = 0;
    let targetRightX = 0;
    let targetRightY = 0;

    let currentWindX = 0;
    let currentWindY = 0;
    let targetWindX = 0;
    let targetWindY = 0;

    const maxDistance = 16;

    const handleMouseMove = (e: MouseEvent) => {
      if (!leftEyeRef.current || !rightEyeRef.current || !mouthRef.current || !petRef.current) return;

      const petRect = petRef.current.getBoundingClientRect();
      const leftRect = leftEyeRef.current.getBoundingClientRect();
      const rightRect = rightEyeRef.current.getBoundingClientRect();
      const mouthTarget = nozzleRef.current || mouthRef.current;
      const mouthRect = mouthTarget.getBoundingClientRect();

      const mouthCenterX = mouthRect.left + mouthRect.width / 2;
      const mouthCenterY = mouthRect.top + mouthRect.height / 2;

      // Distance and angle from mouth to cursor
      const distToMouth = Math.hypot(e.clientX - mouthCenterX, e.clientY - mouthCenterY);
      const angle = Math.atan2(e.clientY - mouthCenterY, e.clientX - mouthCenterX);

      // Check if mouse is near face OR hovering over the blob bounding box
      const isInsideBlob = (
        e.clientX >= petRect.left - 20 &&
        e.clientX <= petRect.right + 20 &&
        e.clientY >= petRect.top - 20 &&
        e.clientY <= petRect.bottom + 20
      );

      const isNearFace = (distToMouth < 340 && e.clientX > mouthCenterX - 60) || isInsideBlob;

      if (isNearFace && !isExhausted) {
        setIsBlowing(true);
        setBlowAngle(angle);

        // Track continuous blowing time (15s rebreather limit)
        if (blowStartTimeRef.current === null) {
          blowStartTimeRef.current = Date.now();
        } else if (Date.now() - blowStartTimeRef.current >= 15000) {
          // Trigger 15-second rebreather exhaustion
          setIsExhausted(true);
          setIsBlowing(false);
          targetWindX = 0;
          targetWindY = 0;
          blowStartTimeRef.current = null;

          if (exhaustionTimerRef.current) clearTimeout(exhaustionTimerRef.current);
          exhaustionTimerRef.current = setTimeout(() => {
            setIsExhausted(false);
          }, 3800); // 3.8s recovery gasp
          return;
        }

        // Tactile backward push:
        // Guarantee that the visual cursor is repelled OUT of the boundaries of the blob
        const baseRepulsion = Math.max(70, (340 - distToMouth) * 0.75);
        
        // Clearance needed to push visual cursor outside the blob's right border
        const requiredXPushToClearBlob = Math.max(0, (petRect.right + 40) - e.clientX);
        
        let calculatedWindX = Math.cos(angle) * baseRepulsion;
        let calculatedWindY = Math.sin(angle) * baseRepulsion;

        // Forceful boundary ejection: if resulting position would still be inside the blob, push further
        if (e.clientX + calculatedWindX < petRect.right + 35) {
          calculatedWindX = requiredXPushToClearBlob;
          if (angle < 0) {
            calculatedWindY = Math.min(-30, calculatedWindY);
          }
        }

        targetWindX = calculatedWindX;
        targetWindY = calculatedWindY;
      } else {
        setIsBlowing(false);
        targetWindX = 0;
        targetWindY = 0;
        if (!isExhausted) {
          blowStartTimeRef.current = null;
        }
      }

      // Pupil gaze tracking (only when eyes are open and not blowing)
      const leftCenterX = leftRect.left + leftRect.width / 2;
      const leftCenterY = leftRect.top + leftRect.height / 2;
      const leftDx = e.clientX - leftCenterX;
      const leftDy = e.clientY - leftCenterY;
      const leftAngle = Math.atan2(leftDy, leftDx);
      const leftDist = Math.min(maxDistance, Math.hypot(leftDx, leftDy) / 30);
      targetLeftX = Math.cos(leftAngle) * leftDist;
      targetLeftY = Math.sin(leftAngle) * leftDist;

      const rightCenterX = rightRect.left + rightRect.width / 2;
      const rightCenterY = rightRect.top + rightRect.height / 2;
      const rightDx = e.clientX - rightCenterX;
      const rightDy = e.clientY - rightCenterY;
      const rightAngle = Math.atan2(rightDy, rightDx);
      const rightDist = Math.min(maxDistance, Math.hypot(rightDx, rightDy) / 30);
      targetRightX = Math.cos(rightAngle) * rightDist;
      targetRightY = Math.sin(rightAngle) * rightDist;
    };

    const physicsLoop = () => {
      // Smoothly interpolate wind force vector
      currentWindX += (targetWindX - currentWindX) * 0.18;
      currentWindY += (targetWindY - currentWindY) * 0.18;

      // Dispatch wind vector to CustomCursor for physical repulsion
      if (Math.abs(currentWindX) > 0.1 || Math.abs(currentWindY) > 0.1) {
        window.dispatchEvent(
          new CustomEvent('tns-cursor-wind', {
            detail: { x: currentWindX, y: currentWindY },
          })
        );
      } else {
        window.dispatchEvent(
          new CustomEvent('tns-cursor-wind', {
            detail: { x: 0, y: 0 },
          })
        );
      }

      // Smooth pupil motion
      if (leftPupilRef.current && rightPupilRef.current) {
        gsap.to(leftPupilRef.current, {
          x: targetLeftX,
          y: targetLeftY,
          duration: 0.18,
          overwrite: 'auto',
        });
        gsap.to(rightPupilRef.current, {
          x: targetRightX,
          y: targetRightY,
          duration: 0.18,
          overwrite: 'auto',
        });
      }

      animationFrameId = requestAnimationFrame(physicsLoop);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animationFrameId = requestAnimationFrame(physicsLoop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      if (exhaustionTimerRef.current) clearTimeout(exhaustionTimerRef.current);
    };
  }, [isExhausted]);

  // Periodic natural blinking (when not blowing and not exhausted)
  useEffect(() => {
    if (isBlowing || isExhausted) return;
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 140);
    }, 4500);

    return () => clearInterval(blinkInterval);
  }, [isBlowing, isExhausted]);

  // Click squish reaction
  const handlePoke = () => {
    try {
      const audio = new Audio('/sounds/open.m4a');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch {
      // Audio fallback
    }

    if (petRef.current) {
      gsap.timeline()
        .to(petRef.current, {
          scaleX: 1.15,
          scaleY: 0.85,
          y: 12,
          duration: 0.12,
          ease: 'power2.out',
        })
        .to(petRef.current, {
          scaleX: 0.92,
          scaleY: 1.1,
          y: -16,
          duration: 0.22,
          ease: 'power2.out',
        })
        .to(petRef.current, {
          scaleX: 1,
          scaleY: 1,
          y: 0,
          duration: 0.4,
          ease: 'elastic.out(1, 0.4)',
        });
    }
  };

  // Render dynamic mouth state
  const renderMouth = () => {
    if (isExhausted) {
      // Deep inhalation rebreather gasp
      return (
        <div className="flex flex-col items-center">
          <div className="w-6 sm:w-8 h-8 sm:h-11 rounded-full border-2 border-[#FFFCF5] bg-[#020202] shadow-inner animate-pulse" />
          <span className="text-[8px] font-mono text-[#FFFCF5]/50 mt-1 uppercase tracking-widest">[ DEEP BREATH ]</span>
        </div>
      );
    }

    if (isBlowing) {
      // Pouting nozzle with wind stream anchored strictly at its center
      return (
        <div
          ref={nozzleRef}
          className="relative w-6 h-6 flex items-center justify-center flex-shrink-0"
        >
          {/* Pouted lip spout — strictly matte, no glow */}
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-[#FFFCF5] bg-[#020202] z-10 flex-shrink-0" />

          {/* Dynamic Traveling Wind Stream — anchored exactly at the nozzle center (left-1/2 top-1/2) and rotated around (0 0) */}
          <div
            className="absolute left-1/2 top-1/2 pointer-events-none z-20 flex items-center overflow-visible"
            style={{
              transform: `rotate(${blowAngle}rad)`,
              transformOrigin: '0px 0px',
            }}
          >
            <div className="relative w-[340px] h-[120px] -translate-y-1/2 flex items-center overflow-visible pointer-events-none">
              
              {/* Traveling curved air shockwave arcs */}
              {[
                { delay: '0s', size: 'w-7 sm:w-9 h-14 sm:h-18' },
                { delay: '0.19s', size: 'w-8 sm:w-10 h-16 sm:h-20' },
                { delay: '0.38s', size: 'w-8 sm:w-10 h-16 sm:h-20' },
                { delay: '0.57s', size: 'w-9 sm:w-11 h-18 sm:h-22' },
              ].map((arc, i) => (
                <div
                  key={`arc-${i}`}
                  className="absolute left-0 top-1/2 -translate-y-1/2"
                >
                  <div
                    className={`${arc.size} border-r-2 border-[#FFFCF5] rounded-r-full`}
                    style={{
                      animation: 'wind-gust-travel 0.75s cubic-bezier(0.15, 0.85, 0.35, 1) infinite',
                      animationDelay: arc.delay,
                    }}
                  />
                </div>
              ))}

              {/* High-speed darting wind streamline streaks at varying heights */}
              {[
                { top: '50%', width: 'w-28 sm:w-36', height: 'h-[2px]', delay: '0.04s', opacity: 'bg-[#FFFCF5]' },
                { top: '34%', width: 'w-24 sm:w-30', height: 'h-[1.5px]', delay: '0.2s', opacity: 'bg-[#FFFCF5]' },
                { top: '66%', width: 'w-24 sm:w-30', height: 'h-[1.5px]', delay: '0.34s', opacity: 'bg-[#FFFCF5]' },
                { top: '20%', width: 'w-16 sm:w-22', height: 'h-[1px]', delay: '0.12s', opacity: 'bg-[#FFFCF5]/75' },
                { top: '80%', width: 'w-16 sm:w-22', height: 'h-[1px]', delay: '0.4s', opacity: 'bg-[#FFFCF5]/75' },
              ].map((streak, i) => (
                <div
                  key={`streak-${i}`}
                  className="absolute left-0 -translate-y-1/2"
                  style={{ top: streak.top }}
                >
                  <div
                    className={`${streak.width} ${streak.height} ${streak.opacity} rounded-full`}
                    style={{
                      animation: 'wind-streak-travel 0.45s ease-out infinite',
                      animationDelay: streak.delay,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    switch (currentMood) {
      case 'SCHEMING':
        return <div className="w-6 sm:w-8 h-2 border-b-2 border-[#FFFCF5]/70 rounded-br-full rotate-6" />;
      case 'CONTEMPLATING':
      case 'PONDERING':
        return <div className="w-5 sm:w-7 h-1.5 border-b-2 border-[#FFFCF5]/60 rounded-full -rotate-3" />;
      case 'TRANSCENDING':
        return <div className="w-7 sm:w-9 h-2.5 border-b-2 border-[#FFFCF5]/80 rounded-full" />;
      case 'HIBERNATING':
      case 'RESTING':
        return <div className="w-5 sm:w-7 h-1 border-b border-[#FFFCF5]/40 rounded-full" />;
      default:
        return <div className="w-6 sm:w-8 h-1.5 border-b-2 border-[#FFFCF5]/50 rounded-full" />;
    }
  };

  return (
    <div className="relative select-none pointer-events-auto">
      
      {/* MASSIVE ORGANIC BLOB BODY */}
      <div
        ref={petRef}
        onClick={handlePoke}
        className={`relative w-[280px] h-[230px] sm:w-[360px] sm:h-[290px] md:w-[440px] md:h-[350px] lg:w-[520px] lg:h-[410px] rounded-[48%_52%_55%_45%/54%_46%_54%_46%] cursor-pointer flex flex-col items-center justify-center transition-all duration-300 ${
          isBlowing
            ? 'bg-[#080808] border border-[#262626] shadow-[0_20px_50px_rgba(0,0,0,0.98)] scale-x-[1.08] scale-y-[0.93]'
            : isExhausted
            ? 'bg-[#090909] border border-[#FFFCF5]/30 shadow-[0_24px_64px_rgba(0,0,0,0.95)] animate-pulse scale-y-[1.1] scale-x-[0.94]'
            : 'bg-[#090909] border border-[#FFFCF5]/20 shadow-[0_24px_64px_rgba(0,0,0,0.95),inset_0_2px_8px_rgba(255,252,245,0.06)] hover:border-[#FFFCF5]/40'
        }`}
        title={`Mood: ${currentMood}`}
      >
        {/* Specular curved sheen — strictly hidden while blowing */}
        <div
          className={`absolute top-4 sm:top-6 w-32 sm:w-48 h-4 sm:h-6 bg-[#FFFCF5]/5 rounded-full blur-[2px] transition-opacity duration-200 ${
            isBlowing ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* STRAINING MARKS ON HEAD (EXERTION TICKS & SWEAT DROP DURING BLOW) */}
        {isBlowing && !isExhausted && (
          <div className="absolute top-5 sm:top-7 md:top-8 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center">
            {/* Forehead tension ticks */}
            <svg width="44" height="24" viewBox="0 0 44 24" className="animate-pulse">
              <path d="M 10 18 L 15 5" stroke="#FFFCF5" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 22 21 L 22 4" stroke="#FFFCF5" strokeWidth="3" strokeLinecap="round" />
              <path d="M 34 18 L 29 5" stroke="#FFFCF5" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            
            {/* Straining sweat droplet */}
            <div className="absolute -right-10 top-1">
              <div className="w-2 h-3.5 bg-[#FFFCF5]/80 rounded-full border border-[#010101] animate-bounce" />
            </div>
          </div>
        )}

        {/* EYES CONTAINER */}
        <div className="flex items-center gap-6 sm:gap-8 md:gap-11 lg:gap-14 mt-4 sm:mt-6">
          
          {/* Left Eye */}
          <div
            ref={leftEyeRef}
            className={`relative w-11 h-16 sm:w-14 sm:h-20 md:w-18 md:h-26 lg:w-22 lg:h-30 bg-[#FFFCF5] rounded-full overflow-hidden flex items-center justify-center shadow-inner transition-transform duration-150 ${
              isBlowing
                ? 'scale-y-[0.08] -rotate-6'
                : isExhausted
                ? 'scale-y-[1.12] scale-x-[1.05]'
                : isBlinking
                ? 'scale-y-[0.1]'
                : 'scale-y-100'
            }`}
          >
            {/* Left Pupil (hidden when eyes squeezed shut during blow) */}
            <div
              ref={leftPupilRef}
              className={`w-7 h-9 sm:w-9 sm:h-12 md:w-11 md:h-15 lg:w-13 lg:h-17 bg-[#010101] rounded-full relative transition-opacity duration-100 ${
                isBlowing ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <div className="absolute top-1 right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#FFFCF5] rounded-full" />
            </div>
          </div>

          {/* Right Eye */}
          <div
            ref={rightEyeRef}
            className={`relative w-11 h-16 sm:w-14 sm:h-20 md:w-18 md:h-26 lg:w-22 lg:h-30 bg-[#FFFCF5] rounded-full overflow-hidden flex items-center justify-center shadow-inner transition-transform duration-150 ${
              isBlowing
                ? 'scale-y-[0.08] rotate-6'
                : isExhausted
                ? 'scale-y-[1.12] scale-x-[1.05]'
                : isBlinking
                ? 'scale-y-[0.1]'
                : 'scale-y-100'
            }`}
          >
            {/* Right Pupil (hidden when eyes squeezed shut during blow) */}
            <div
              ref={rightPupilRef}
              className={`w-7 h-9 sm:w-9 sm:h-12 md:w-11 md:h-15 lg:w-13 lg:h-17 bg-[#010101] rounded-full relative transition-opacity duration-100 ${
                isBlowing ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <div className="absolute top-1 right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#FFFCF5] rounded-full" />
            </div>
          </div>

        </div>

        {/* DYNAMIC MOUTH: POUTING & DIRECTIONAL BLOWING / REBREATHER / MOOD-EXPRESSIVE */}
        <div ref={mouthRef} className="mt-4 sm:mt-6 transition-all duration-200">
          {renderMouth()}
        </div>

        {/* SINGLE PERSISTENT MOOD TAG */}
        <div className="absolute bottom-6 sm:bottom-8 font-mono text-[9px] sm:text-[10px] md:text-[11px] tracking-[0.25em] uppercase text-[#FFFCF5]/40 flex items-center gap-2">
          <span
            className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
              isBlowing
                ? 'bg-[#FFFCF5]/30'
                : isExhausted
                ? 'bg-[#FFFCF5]/80 animate-ping'
                : 'bg-[#E1FF00] shadow-[0_0_8px_#E1FF00]'
            }`}
          />
          <span>
            [ {isExhausted ? 'REBREATHER // DEEP BREATH' : isBlowing ? 'EXERTION // BLOWING AIR' : `MOOD // ${currentMood}`} ]
          </span>
        </div>
      </div>

    </div>
  );
}
