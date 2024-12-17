import { useState, useEffect, useRef } from 'react';

interface Confetti {
  x: number;
  y: number;
  color: string;
  radius: number;
  speed: number;
  angle: number;
  rotation: number;
  rotationSpeed: number;
}

export const Banner = () => {
  const [glitchIndex, setGlitchIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confettiRef = useRef<Confetti[]>([]);

  const message = `
    *"Football is a simple game: 22 men chase a ball for 90 minutes, and at the end, the Germans win."* - Gary Lineker          
    *"Float like a butterfly, sting like a bee."* - Muhammad Ali          
    *"You miss 100% of the shots you don’t take."* - Wayne Gretzky          
    *"If you no longer go for a gap that exists, you’re no longer a racing driver."* - Ayrton Senna          
    *"Winning isn’t everything, it’s the only thing."* - Vince Lombardi          
    *"Everyone has a plan until they get punched in the mouth."* - Mike Tyson          
    *"I think, therefore I play."* - Andrea Pirlo          
    *"Hard work beats talent when talent doesn’t work hard."* - Tim Tebow          
    *"Leave me alone, I know what I’m doing!"* - Kimi Räikkönen          
    *"Talent wins games, but teamwork and intelligence win championships."* - Michael Jordan          
  `;

  const glitchColors = ['#00875A', '#B800B8', '#0088CC'];
  const shadowColors = ['rgba(0, 135, 90, 0.3)', 'rgba(184, 0, 184, 0.3)', 'rgba(0, 136, 204, 0.3)'];
  const confettiColors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const createConfetti = () => {
      const confetti: Confetti = {
        x: Math.random() * canvas.width,
        y: -10,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        radius: Math.random() * 3 + 1,
        speed: Math.random() * 2 + 1,
        angle: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2
      };
      return confetti;
    };

    confettiRef.current = Array(30).fill(null).map(createConfetti);

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let animationFrame: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      confettiRef.current.forEach((confetti, index) => {
        confetti.y += confetti.speed;
        confetti.x += Math.sin(confetti.angle) * 0.5;
        confetti.rotation += confetti.rotationSpeed;

        if (confetti.y > canvas.height) {
          confettiRef.current[index] = createConfetti();
        }

        ctx.save();
        ctx.translate(confetti.x, confetti.y);
        ctx.rotate(confetti.rotation);
        ctx.fillStyle = confetti.color;
        ctx.globalAlpha = 0.6;
        ctx.fillRect(-confetti.radius, -confetti.radius, 
                    confetti.radius * 2, confetti.radius * 2);
        ctx.restore();
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  useEffect(() => {
    const glitch = () => {
      setGlitchIndex((prev) => (prev + 1) % 3);
    };
    const glitchEffect = setInterval(glitch, 2000);
    return () => clearInterval(glitchEffect);
  }, []);

  return (
    <>
      <style>
        {`
          .ticker-wrap {
            position: fixed;
            top: 0;
            width: 100%;
            height: 2.5rem;
            background: white;
            overflow: hidden;
            box-sizing: content-box;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          }

          .confetti-canvas {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
          }

          .ticker {
            display: inline-block;
            height: 2.5rem;
            white-space: nowrap;
            padding-right: 100%;
            box-sizing: content-box;
            -webkit-animation-iteration-count: infinite;
            animation-iteration-count: infinite;
            -webkit-animation-timing-function: linear;
            animation-timing-function: linear;
            -webkit-animation-name: ticker;
            animation-name: ticker;
            -webkit-animation-duration: 30s;
            animation-duration: 30s;
            font-style: italic; /* Ajout pour italique */
          }

          .ticker-item {
            display: inline-block;
            padding: 0;
            height: 2.5rem;
            line-height: 2.5rem;
            position: fixed; top
            z-index: 1;
          }

          @keyframes ticker {
            0% { transform: translate3d(100%, 0, 0); }
            100% { transform: translate3d(-100%, 0, 0); }
          }

          @media (max-width: 768px) {
            .ticker {
              animation-duration: 45s;
            }
            .ticker-item {
              font-size: 0.9rem;
            }
          }

          @media (max-width: 480px) {
            .ticker {
              animation-duration: 60s;
            }
            .ticker-item {
              font-size: 0.85rem;
            }
          }
        `}
      </style>
      <div className="ticker-wrap">
        <canvas ref={canvasRef} className="confetti-canvas" />
        
        <div className="ticker">
          <div 
            className="ticker-item font-mono tracking-wider font-medium"
            style={{
              color: glitchColors[glitchIndex],
              textShadow: `0 0 1px ${shadowColors[glitchIndex]}`,
            }}
          >
            {message}
          </div>
        </div>
      </div>
    </>
  );
};
