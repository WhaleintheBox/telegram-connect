import { useState, useEffect } from 'react';

export const Banner = () => {
  const [glitchIndex, setGlitchIndex] = useState(0);
  
  const message = "🎯 AI-POWERED DECENTRALIZED SPORTS BETTING 🤖          🌐 ZERO FEES × ZERO TAX × PURE P2P 💫          ⚡ JOIN OUR TELEGRAM FOR PREMIUM ACCESS ⚡          ";

  useEffect(() => {
    const glitch = () => {
      setGlitchIndex((prev) => (prev + 1) % 3);
    };
    const glitchEffect = setInterval(glitch, 2000);
    return () => clearInterval(glitchEffect);
  }, []);

  const glitchColors = ['#00ff9d', '#ff00ff', '#00ffff'];
  const shadowColors = ['rgba(0, 255, 157, 0.7)', 'rgba(255, 0, 255, 0.7)', 'rgba(0, 255, 255, 0.7)'];

  return (
    <>
      <style>
        {`
          .ticker-wrap {
            position: fixed;
            top: 0;
            width: 100%;
            height: 2.5rem;
            background: black;
            overflow: hidden;
            box-sizing: content-box;
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
          }

          .ticker-item {
            display: inline-block;
            padding: 0;
            height: 2.5rem;
            line-height: 2.5rem;
          }

          @-webkit-keyframes ticker {
            0% {
              -webkit-transform: translate3d(100%, 0, 0);
              transform: translate3d(100%, 0, 0);
              visibility: visible;
            }
            100% {
              -webkit-transform: translate3d(-100%, 0, 0);
              transform: translate3d(-100%, 0, 0);
            }
          }

          @keyframes ticker {
            0% {
              -webkit-transform: translate3d(100%, 0, 0);
              transform: translate3d(100%, 0, 0);
              visibility: visible;
            }
            100% {
              -webkit-transform: translate3d(-100%, 0, 0);
              transform: translate3d(-100%, 0, 0);
            }
          }

          @media (max-width: 768px) {
            .ticker {
              animation-duration: 20s;
            }
          }

          @media (max-width: 480px) {
            .ticker {
              animation-duration: 15s;
            }
          }
        `}
      </style>
      <div className="ticker-wrap">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)'
          }}
        />
        
        <div className="absolute inset-0 opacity-50">
          <div 
            className="absolute inset-0 border-t border-b"
            style={{
              borderColor: glitchColors[glitchIndex],
              boxShadow: `0 0 10px ${shadowColors[glitchIndex]}`,
            }}
          />
        </div>

        <div className="ticker">
          <div 
            className="ticker-item font-mono tracking-wider"
            style={{
              color: glitchColors[glitchIndex],
              textShadow: `0 0 5px ${shadowColors[glitchIndex]}`,
            }}
          >
            {message}
            {message} {/* Duplication pour un défilement continu */}
          </div>
        </div>
      </div>
    </>
  );
};