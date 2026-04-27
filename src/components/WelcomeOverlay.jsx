import { useState, useEffect } from 'react';
import { initAudio } from '../lib/chessSounds';

export default function WelcomeOverlay({ onComplete }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Check if seen in current session
    const hasSeen = sessionStorage.getItem('welcomeSeen');
    if (!hasSeen) {
      setIsVisible(true);
    }

    // Reveal the button slightly after the text
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    initAudio(); // Unlock audio on user interaction
    sessionStorage.setItem('welcomeSeen', 'true');
    setIsFadingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 1000);
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'radial-gradient(ellipse at center, #2d1b69 0%, #1a1035 50%, #0a0520 100%)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: isFadingOut ? 0 : 1,
      transition: 'opacity 1s ease-in-out',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: '800px',
        animation: 'popIn 1s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>
        {/* Decorative sparkle */}
        <div style={{
          fontSize: '3rem',
          marginBottom: '1.5rem',
          animation: 'float 3s ease-in-out infinite'
        }}>✨♟✨</div>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.6rem, 4vw, 2.8rem)',
          color: '#f0eaff',
          lineHeight: '1.5',
          marginBottom: '2.5rem',
          textShadow: '0 0 30px rgba(124, 58, 237, 0.4)',
          fontWeight: 700
        }}>
          "Luck has never once bowed to me — so let's play the only game where luck kneels to nothing, and skill alone decides who survives"
        </h1>

        <button
          onClick={handleContinue}
          style={{
            padding: '1rem 3rem',
            fontSize: '1.1rem',
            fontFamily: 'var(--font-display)',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
            color: 'white',
            border: 'none',
            borderRadius: '9999px',
            cursor: 'pointer',
            opacity: showButton ? 1 : 0,
            transform: showButton ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.9)',
            transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxShadow: '0 6px 0 #5b21b6, 0 8px 30px rgba(124, 58, 237, 0.4)',
            fontWeight: 700
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 9px 0 #5b21b6, 0 12px 40px rgba(124, 58, 237, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 6px 0 #5b21b6, 0 8px 30px rgba(124, 58, 237, 0.4)';
          }}
        >
          ⚔ Accept Challenge
        </button>
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.8) translateY(30px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
