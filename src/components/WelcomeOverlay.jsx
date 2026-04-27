import { useState, useEffect } from 'react';
import { initAudio } from '../lib/chessSounds';

export default function WelcomeOverlay() {
  const [isVisible, setIsVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const hasSeen = sessionStorage.getItem('welcomeSeen');
    if (!hasSeen) setIsVisible(true);

    const timer = setTimeout(() => setShowButton(true), 2000);

    // Animate progress bar
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 1;
      });
    }, 20);

    return () => { clearTimeout(timer); clearInterval(interval); };
  }, []);

  const handleContinue = () => {
    initAudio();
    sessionStorage.setItem('welcomeSeen', 'true');
    setIsFadingOut(true);
    setTimeout(() => setIsVisible(false), 1000);
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'radial-gradient(ellipse at 30% 50%, #0d2a4a 0%, #060d1a 60%)',
      zIndex: 9999,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      opacity: isFadingOut ? 0 : 1,
      transition: 'opacity 1s ease-in-out',
      padding: '2rem', textAlign: 'center',
      overflow: 'hidden'
    }}>

      {/* Animated grid background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(0,212,255,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,255,0.06) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        animation: 'gridMove 20s linear infinite'
      }}/>

      {/* Floating orbs */}
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: `${40 + i * 20}px`, height: `${40 + i * 20}px`,
          borderRadius: '50%',
          border: `1px solid ${i % 2 === 0 ? 'rgba(0,212,255,0.2)' : 'rgba(255,45,120,0.2)'}`,
          left: `${10 + i * 15}%`, top: `${20 + i * 10}%`,
          animation: `float ${3 + i}s ease-in-out infinite`,
          animationDelay: `${i * 0.5}s`
        }}/>
      ))}

      <div style={{ position: 'relative', zIndex: 10, maxWidth: '800px', animation: 'slideUp 1s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
        
        {/* Logo */}
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '3.5rem',
          fontWeight: 900,
          color: '#f0f8ff',
          letterSpacing: '8px',
          textTransform: 'uppercase',
          textShadow: '0 0 30px rgba(0,212,255,0.6), 0 0 80px rgba(0,212,255,0.2)',
          marginBottom: '0.5rem',
          animation: 'pulseTitle 3s ease-in-out infinite'
        }}>
          CHESS<span style={{ color: '#00d4ff' }}>.</span>VP
        </div>

        {/* Tagline bar */}
        <div style={{
          width: '120px', height: '2px',
          background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)',
          margin: '0 auto 2rem',
          boxShadow: '0 0 10px #00d4ff'
        }}/>

        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.1rem, 3vw, 1.6rem)',
          color: '#7bafc8',
          lineHeight: 1.7,
          marginBottom: '3rem',
          fontStyle: 'italic',
          fontWeight: 400
        }}>
          "Luck has never once bowed to me — so let's play the only game where luck kneels to nothing, and skill alone decides who survives"
        </p>

        {/* Loading bar */}
        <div style={{
          width: '200px', height: '2px',
          background: 'rgba(0,212,255,0.15)',
          borderRadius: '2px',
          margin: '0 auto 2rem',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #00d4ff, #ff2d78)',
            boxShadow: '0 0 10px #00d4ff',
            transition: 'width 0.1s linear',
            borderRadius: '2px'
          }}/>
        </div>

        <button
          onClick={handleContinue}
          style={{
            padding: '1rem 3.5rem',
            fontSize: '0.9rem',
            fontFamily: 'var(--font-display)',
            textTransform: 'uppercase',
            letterSpacing: '3px',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #00d4ff, #0099bb)',
            color: '#060d1a',
            border: 'none',
            borderRadius: '9999px',
            cursor: 'pointer',
            opacity: showButton ? 1 : 0,
            transform: showButton ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease',
            boxShadow: '0 4px 0 #006688, 0 0 30px rgba(0,212,255,0.4)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 7px 0 #006688, 0 0 50px rgba(0,212,255,0.6)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 0 #006688, 0 0 30px rgba(0,212,255,0.4)';
          }}
        >
          ⚡ Initialise System
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gridMove {
          0% { background-position: 0 0; }
          100% { background-position: 50px 50px; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        @keyframes pulseTitle {
          0%, 100% { text-shadow: 0 0 20px rgba(0,212,255,0.5), 0 0 60px rgba(0,212,255,0.2); }
          50% { text-shadow: 0 0 40px rgba(0,212,255,0.8), 0 0 100px rgba(0,212,255,0.4); }
        }
        @keyframes neonFlicker {
          0%, 95%, 100% { opacity: 1; }
          96%, 99% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
