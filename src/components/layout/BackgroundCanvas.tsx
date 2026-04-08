import { useRef, useEffect } from 'react';
// @ts-ignore
import canvasSketch from 'canvas-sketch';

const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

const mapRange = (value: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

class Vector {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  getDistance(v: Vector) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

class Agent {
  pos: Vector;
  vel: Vector;
  radius: number;
  constructor(x: number, y: number) {
    this.pos = new Vector(x, y);
    this.vel = new Vector(randomRange(-0.5, 0.5), randomRange(-0.5, 0.5));
    this.radius = randomRange(4, 10);
  }

  update(width: number, height: number) {
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;

    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.y > height) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = height;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FFFCF5';
    ctx.fillStyle = '#010101';
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

const settings = {
  animate: true,
  resizeCanvas: true,
};

const sketch = ({ width, height }: { width: number; height: number }) => {
  const agents: Agent[] = [];
  let numAgents = 120;
  let connectDist = 150;
  if (width < 500) {
    numAgents = 65;
    connectDist = 100;
  };

  for (let i = 0; i < numAgents; i++) {
    agents.push(new Agent(randomRange(0, width), randomRange(0, height)));
  }

  return ({ context, width, height }: { context: CanvasRenderingContext2D; width: number; height: number }) => {
    context.fillStyle = '#010101';
    context.fillRect(0, 0, width, height);

    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      for (let j = i + 1; j < agents.length; j++) {
        const other = agents[j];
        const dist = agent.pos.getDistance(other.pos);

        if (dist > connectDist) continue;

        context.lineWidth = mapRange(dist, 0, connectDist, 2, 0.1);
        context.strokeStyle = '#FFFCF5';
        context.beginPath();
        context.moveTo(agent.pos.x, agent.pos.y);
        context.lineTo(other.pos.x, other.pos.y);
        context.stroke();
      }
    }

    agents.forEach((agent) => {
      agent.update(width, height);
      agent.draw(context);
    });
  };
};

export default function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let manager: any;
    if (canvasRef.current) {
      canvasSketch(sketch, { ...settings, canvas: canvasRef.current }).then((m: any) => { manager = m; });
    }
    return () => { if (manager) manager.unload(); };
  }, []);

  return (
    <div className="h-[50vh] w-full relative z-0 opacity-0 canvas-container">
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  );
}