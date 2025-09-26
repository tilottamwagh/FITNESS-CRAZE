import React, { useEffect, useRef } from 'react';

const CONFETTI_COUNT = 200;
const RAINBOW_COLORS = [
    '#FF4136', '#FF851B', '#FFDC00', '#2ECC40', '#0074D9', '#B10DC9'
];

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    color: string;
    angle: number;
    spin: number;
    opacity: number;
}

const Confetti: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');

        if (!canvas || !context) return;
        
        let animationStartTime: number | null = null;
        const animationDuration = 5000; // 5 seconds

        const setCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        
        setCanvasSize();
        window.addEventListener('resize', setCanvasSize);

        const particles: Particle[] = Array.from({ length: CONFETTI_COUNT }).map(() => ({
            x: Math.random() * canvas.width,
            y: Math.random() * -canvas.height, // Start off-screen
            vx: Math.random() * 4 - 2, // Horizontal drift
            vy: Math.random() * 2 + 2, // Downward velocity
            radius: Math.random() * 4 + 4,
            color: RAINBOW_COLORS[Math.floor(Math.random() * RAINBOW_COLORS.length)],
            angle: Math.random() * Math.PI * 2,
            spin: Math.random() * 0.1 - 0.05,
            opacity: 1,
        }));

        const draw = (time: number) => {
            if (animationStartTime === null) {
                animationStartTime = time;
            }
            
            const elapsedTime = time - animationStartTime;

            context.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.angle += p.spin;

                // Reset particle when it goes off screen
                if (p.y > canvas.height + 20) {
                    p.y = -20;
                    p.x = Math.random() * canvas.width;
                }

                // Fade out in the last second
                if (elapsedTime > animationDuration - 1000) {
                    p.opacity -= 0.02;
                }

                if (p.opacity <= 0) return;

                context.save();
                context.globalAlpha = p.opacity;
                context.translate(p.x, p.y);
                context.rotate(p.angle);
                context.fillStyle = p.color;
                context.fillRect(-p.radius, -p.radius / 2, p.radius * 2, p.radius);
                context.restore();
            });

            if (elapsedTime < animationDuration) {
                animationFrameId.current = requestAnimationFrame(draw);
            } else {
                onComplete();
            }
        };

        animationFrameId.current = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener('resize', setCanvasSize);
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [onComplete]);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="fixed inset-0 pointer-events-none z-50"
        />
    );
};

export default Confetti;