import { useState, useEffect } from 'react';
import { initAudio } from '../lib/chessSounds';

export default function WelcomeOverlay() {
  const [isVisible, setIsVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const hasSeen = sessionStorage.getItem('welcomeSeen');
    if (!hasSeen) setIsVisible(true);
    const t = setTimeout(() => setShowButton(true), 2000);
    return () => clearTimeout(t);
  }, []);

  const handleContinue = () => {
    initAudio();
    sessionStorage.setItem('welcomeSeen', 'true');
    setIsFadingOut(true);
    setTimeout(() => setIsVisible(false), 800);
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      /* Solid matte dark navy — no blur, no glass */
      background: '#0a1628',
      zIndex: 9999,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      opacity: isFadingOut ? 0 : 1,
      transition: 'opacity 0.8s ease-in-out',
      padding: '2rem', textAlign: 'center',
      overflow: 'hidden',
    }}>

      {/* Subtle top accent line in red */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '4px',
        background: '#c42b22',
        boxShadow: '0 3px 0 #8b1510',
      }}/>

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 10,
        maxWidth: '680px',
        animation: 'popIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>

        {/* Logo */}
        <div style={{
          fontFamily: "'Fredoka', sans-serif",
          fontSize: 'clamp(3rem, 10vw, 5rem)',
          fontWeight: 700,
          color: '#f0f8ff',
          letterSpacing: '6px',
          textTransform: 'uppercase',
          marginBottom: '0.8rem',
        }}>
          CHESS<span style={{ color: '#e63329' }}>.</span>VP
        </div>

        {/* Solid red divider */}
        <div style={{
          width: '60px', height: '4px',
          background: '#c42b22',
          borderRadius: '2px',
          margin: '0 auto 2rem',
          boxShadow: '0 3px 0 #8b1510',
        }}/>

        <p style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
          color: '#7a9ab8',
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
            background: '#c42b22',
            color: 'white',
            border: 'none',
            borderRadius: '9999px',
            cursor: 'pointer',
            opacity: showButton ? 1 : 0,
            transform: showButton ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.7s ease, transform 0.7s cubic-bezier(0.34,1.56,0.64,1), background 0.2s ease, box-shadow 0.2s ease',
            boxShadow: '0 5px 0 #8b1510',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#e63329';
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 8px 0 #8b1510';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#c42b22';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 5px 0 #8b1510';
          }}
        >
          ♟ Accept Challenge
        </button>
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.9) translateY(30px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
