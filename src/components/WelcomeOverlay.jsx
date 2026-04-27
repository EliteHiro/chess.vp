import { useState, useEffect } from 'react';
import { initAudio } from '../lib/chessSounds';

export default function WelcomeOverlay() {
  const [isVisible, setIsVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const hasSeen = sessionStorage.getItem('welcomeSeen');
    if (!hasSeen) setIsVisible(true);
    const t = setTimeout(() => setShowButton(true), 2200);
    return () => clearTimeout(t);
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
      background: 'linear-gradient(180deg, #1a4a7a 0%, #3a7ab8 40%, #7ab8d8 75%, #b8d8ec 100%)',
      zIndex: 9999,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      opacity: isFadingOut ? 0 : 1,
      transition: 'opacity 1s ease-in-out',
      padding: '2rem', textAlign: 'center',
      overflow: 'hidden',
    }}>

      {/* Baymax-style floating white orbs background */}
      {[
        { size: 340, top: '-80px',  right: '-60px',  opacity: 0.12 },
        { size: 180, bottom: '10%', left: '-40px',   opacity: 0.10 },
        { size: 100, top: '30%',    right: '15%',    opacity: 0.08 },
        { size: 60,  bottom: '20%', right: '30%',    opacity: 0.07 },
      ].map((orb, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: orb.size, height: orb.size,
          background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.95), rgba(255,255,255,0.1))',
          borderRadius: '50%',
          top: orb.top, bottom: orb.bottom,
          right: orb.right, left: orb.left,
          opacity: orb.opacity,
          animation: `float ${5 + i}s ease-in-out infinite`,
          animationDelay: `${i * 0.8}s`,
          filter: 'blur(1px)'
        }}/>
      ))}

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 10,
        maxWidth: '780px',
        animation: 'popIn 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>

        {/* Logo */}
        <div style={{
          fontFamily: "'Fredoka', sans-serif",
          fontSize: 'clamp(3rem, 10vw, 5rem)',
          fontWeight: 700,
          color: 'white',
          letterSpacing: '6px',
          textTransform: 'uppercase',
          textShadow: '0 4px 20px rgba(26,74,122,0.4), 0 8px 40px rgba(26,74,122,0.2)',
          marginBottom: '0.8rem',
        }}>
          CHESS<span style={{ color: '#e63329', textShadow: '0 4px 10px rgba(230,51,41,0.5)' }}>.</span>VP
        </div>

        {/* Red divider — Baymax armor style */}
        <div style={{
          width: '80px', height: '4px',
          background: '#e63329',
          borderRadius: '4px',
          margin: '0 auto 2rem',
          boxShadow: '0 3px 0 #b51f17, 0 0 15px rgba(230,51,41,0.4)',
        }}/>

        <p style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
          color: 'rgba(255,255,255,0.88)',
          lineHeight: 1.8,
          marginBottom: '3rem',
          fontStyle: 'italic',
          fontWeight: 400,
        }}>
          "Luck has never once bowed to me — so let's play the only game where luck kneels to nothing, and skill alone decides who survives"
        </p>

        <button
          onClick={handleContinue}
          style={{
            padding: '1rem 3.5rem',
            fontSize: '1rem',
            fontFamily: "'Fredoka', sans-serif",
            textTransform: 'uppercase',
            letterSpacing: '2px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #ff5a4f, #e63329)',
            color: 'white',
            border: 'none',
            borderRadius: '9999px',
            cursor: 'pointer',
            opacity: showButton ? 1 : 0,
            transform: showButton ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.9)',
            transition: 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.34,1.56,0.64,1)',
            boxShadow: '0 5px 0 #b51f17, 0 8px 25px rgba(230,51,41,0.35)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-4px) scale(1.04)';
            e.currentTarget.style.boxShadow = '0 9px 0 #b51f17, 0 12px 35px rgba(230,51,41,0.5)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 5px 0 #b51f17, 0 8px 25px rgba(230,51,41,0.35)';
          }}
        >
          ♟ Accept Challenge
        </button>
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.85) translateY(30px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50%       { transform: translateY(-18px) scale(1.03); }
        }
      `}</style>
    </div>
  );
}
