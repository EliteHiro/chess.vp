import { useState, useEffect } from 'react';

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
    sessionStorage.setItem('welcomeSeen', 'true');
    setIsFadingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 1000); // Wait for fade out animation
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#050505',
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
        animation: 'fadeIn 2s ease-in-out'
      }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.8rem, 4vw, 3.2rem)',
          color: 'var(--text-primary)',
          lineHeight: '1.4',
          marginBottom: '3rem',
          textShadow: '0 0 20px rgba(255, 255, 255, 0.1)'
        }}>
          "Luck has never once bowed to me - so let's play the only game where luck kneels to nothing, and skill alone decide who survives"
        </h1>

        <button
          onClick={handleContinue}
          style={{
            padding: '1rem 3rem',
            fontSize: '1.2rem',
            fontFamily: 'var(--font-display)',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            background: 'transparent',
            color: 'white',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '4px',
            cursor: 'pointer',
            opacity: showButton ? 1 : 0,
            transform: showButton ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s ease-out',
            boxShadow: '0 0 15px rgba(255, 255, 255, 0.05)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.8)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.05)';
          }}
        >
          Accept Challenge
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
