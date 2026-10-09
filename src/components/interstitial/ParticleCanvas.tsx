import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  r: number;
  g: number;
  b: number;
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse tracking for aerodynamic force field
    let mouseX = -1000;
    let mouseY = -1000;
    let prevMouseX = -1000;
    let prevMouseY = -1000;
    let mouseVx = 0;
    let mouseVy = 0;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      mouseVx = mouseX - prevMouseX;
      mouseVy = mouseY - prevMouseY;
      prevMouseX = mouseX;
      prevMouseY = mouseY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // Palette: Gray, White/Ivory, Chartreuse
    const colorPalette = [
      { r: 155, g: 155, b: 155 }, // Architectural Gray
      { r: 155, g: 155, b: 155 },
      { r: 255, g: 252, b: 245 }, // Archival Ivory White
      { r: 255, g: 252, b: 245 },
      { r: 225, g: 255, b: 0 },   // Electric Chartreuse
    ];

    const particleCount = Math.min(95, Math.floor((width * height) / 16000));
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      const baseAlpha = Math.random() * 0.25 + 0.08;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35 - 0.08,
        size: Math.random() * 1.6 + 0.75,
        alpha: baseAlpha,
        baseAlpha,
        r: color.r,
        g: color.g,
        b: color.b,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Damp mouse velocity
      mouseVx *= 0.85;
      mouseVy *= 0.85;

      const forceRadius = 120;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Normal drift
        p.x += p.vx;
        p.y += p.vy;

        // Aerodynamic mouse displacement wake
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.hypot(dx, dy);

        if (dist < forceRadius && dist > 0) {
          const force = (1 - dist / forceRadius) * 2.8;
          const angle = Math.atan2(dy, dx);
          p.x += Math.cos(angle) * force + mouseVx * 0.09;
          p.y += Math.sin(angle) * force + mouseVy * 0.09;
          p.alpha = Math.min(0.65, p.baseAlpha * 2.5);
        } else {
          p.alpha += (p.baseAlpha - p.alpha) * 0.04;
        }

        // Screen wrap
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Draw particle with assigned color
        ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 w-full h-full opacity-80"
      aria-hidden="true"
    />
  );
}
