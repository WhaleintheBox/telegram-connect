import { useState, useEffect } from 'react';

export const Banner = () => {
  const [position, setPosition] = useState(0);
  const [glitchIndex, setGlitchIndex] = useState(0);
  
  // Messages adaptés pour mobile (plus courts)
  const messages = [
    "🎯 AI-POWERED BETTING 🤖",
    "🌐 ZERO FEES × P2P 💫",
    "⚡ JOIN TELEGRAM ⚡"
  ];

  // Messages pour desktop
  const desktopMessages = [
    "🎯 AI-POWERED DECENTRALIZED SPORTS BETTING 🤖",
    "🌐 ZERO FEES × ZERO TAX × PURE P2P 💫",
    "⚡ JOIN OUR TELEGRAM FOR PREMIUM ACCESS ⚡"
  ];

  // Détecter la largeur d'écran
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const animate = () => {
      setPosition((prev) => (prev <= -100 ? 0 : prev - 0.08));
    };

    const glitch = () => {
      setGlitchIndex((prev) => (prev + 1) % 3);
    };

    const animation = setInterval(animate, 20);
    const glitchEffect = setInterval(glitch, 2000);

    return () => {
      clearInterval(animation);
      clearInterval(glitchEffect);
    };
  }, []);

  const glitchColors = ['#00ff9d', '#ff00ff', '#00ffff'];
  const shadowColors = ['rgba(0, 255, 157, 0.7)', 'rgba(255, 0, 255, 0.7)', 'rgba(0, 255, 255, 0.7)'];

  return (
    <>
      <style>
        {`
          @keyframes sparkle {
            0% { opacity: 0; transform: translateY(0) scale(1); }
            50% { opacity: 1; transform: translateY(-10px) scale(1.5); }
            100% { opacity: 0; transform: translateY(-20px) scale(1); }
          }

          @media (max-width: 768px) {
            .cyber-banner {
              height: 2.5rem !important;
            }
            .banner-text {
              font-size: 0.75rem !important;
            }
            .banner-particles {
              display: none;
            }
          }

          @media (min-width: 769px) {
            .cyber-banner {
              height: 2rem !important;
            }
            .banner-text {
              font-size: 0.875rem !important;
            }
          }
        `}
      </style>
      <div className="relative w-full bg-black overflow-hidden cyber-banner">
        {/* Fond avec lignes */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)'
          }}
        />
        
        {/* Bordures brillantes */}
        <div className="absolute inset-0 opacity-50">
          <div 
            className="absolute inset-0 border-t border-b"
            style={{
              borderColor: glitchColors[glitchIndex],
              boxShadow: `0 0 10px ${shadowColors[glitchIndex]}`,
            }}
          />
        </div>

        {/* Texte défilant */}
        <div 
          className="h-full flex items-center whitespace-nowrap font-mono tracking-wider banner-text"
          style={{
            transform: `translateX(${position}%)`,
            transition: 'transform 0.1s linear',
            color: glitchColors[glitchIndex],
            textShadow: `0 0 5px ${shadowColors[glitchIndex]}`,
          }}
        >
          {(isMobile ? messages : desktopMessages).join('          ')}
        </div>

        {/* Particules (masquées sur mobile) */}
        <div className="absolute inset-0 overflow-hidden opacity-20 banner-particles">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-px h-px bg-white"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `sparkle ${1 + Math.random() * 2}s linear infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
};