import { useEffect, useRef } from 'react';

export default function MouseParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      // Use parent container's height if available, else window height
      canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight;
    };

    setCanvasSize();

    const mouse = {
      x: -1000,
      y: -1000,
      radius: 180
    };

    const handleResize = () => setCanvasSize();

    // We attach mousemove to window to ensure we track it even if over other elements
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY + window.scrollY; // adjust for scroll if canvas is at top
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    class Particle {
      x: number;
      y: number;
      directionX: number;
      directionY: number;
      size: number;
      color: string;
      baseX: number;
      baseY: number;
      density: number;

      constructor(x: number, y: number, directionX: number, directionY: number, size: number, color: string) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
        this.baseX = x;
        this.baseY = y;
        this.density = (Math.random() * 30) + 1;
      }

      draw() {
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.fillStyle = this.color;
        ctx!.fill();
      }

      update() {
        if (this.x > canvas!.width || this.x < 0) {
          this.directionX = -this.directionX;
        }
        if (this.y > canvas!.height || this.y < 0) {
          this.directionY = -this.directionY;
        }

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius + this.size) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const maxDistance = mouse.radius;
          const force = (maxDistance - distance) / maxDistance;
          const directionX = forceDirectionX * force * this.density;
          const directionY = forceDirectionY * force * this.density;

          // Repel from mouse
          this.x -= directionX;
          this.y -= directionY;
        } else {
          // Normal drift
          this.x += this.directionX;
          this.y += this.directionY;
        }

        this.draw();
      }
    }

    const init = () => {
      particles = [];
      let numberOfParticles = (canvas!.height * canvas!.width) / 12000;
      // Cap max particles for performance
      numberOfParticles = Math.min(numberOfParticles, 150);

      for (let i = 0; i < numberOfParticles; i++) {
        const size = (Math.random() * 2) + 1;
        const x = (Math.random() * ((canvas!.width - size * 2) - (size * 2)) + size * 2);
        const y = (Math.random() * ((canvas!.height - size * 2) - (size * 2)) + size * 2);
        const directionX = (Math.random() * 1.5) - 0.75;
        const directionY = (Math.random() * 1.5) - 0.75;
        const color = 'rgba(59, 130, 246, 0.6)'; // Blue-600 with opacity

        particles.push(new Particle(x, y, directionX, directionY, size, color));
      }
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
      }

      connect();
    };

    const connect = () => {
      let opacityValue = 1;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          const distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x)) +
            ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));

          if (distance < (canvas!.width / 10) * (canvas!.height / 10)) {
            opacityValue = 1 - (distance / 15000);
            if (opacityValue > 0) {
              ctx!.strokeStyle = `rgba(59, 130, 246, ${opacityValue * 0.4})`; // Subtle connecting lines
              ctx!.lineWidth = 1;
              ctx!.beginPath();
              ctx!.moveTo(particles[a].x, particles[a].y);
              ctx!.lineTo(particles[b].x, particles[b].y);
              ctx!.stroke();
            }
          }
        }
      }
    };

    init();
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
