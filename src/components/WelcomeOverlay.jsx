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
      background: 'radial-gradient(circle at center, #122416 0%, #08120b 100%)',
      zIndex: 9999,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      opacity: isFadingOut ? 0 : 1,
      transition: 'opacity 0.8s ease-in-out',
      padding: '2rem', textAlign: 'center',
      overflow: 'hidden',
    }}>

      {/* Floating magical fireflies */}
      {[...Array(20)].map((_, i) => {
        const size = Math.random() * 5 + 2;
        return (
          <div key={i} style={{
            position: 'absolute',
            width: size, height: size,
            background: Math.random() > 0.5 ? '#d4af37' : '#4ade80',
            borderRadius: '50%',
            top: `${Math.random() * 100}%`, 
            left: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.6 + 0.2,
            zIndex: 1,
            animation: `firefly ${Math.random() * 6 + 4}s ease-in-out infinite alternate`,
            animationDelay: `${Math.random() * 4}s`,
            boxShadow: `0 0 ${size * 3}px ${Math.random() > 0.5 ? '#d4af37' : '#4ade80'}`
          }}/>
        );
      })}

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 10,
        maxWidth: '680px',
        animation: 'popIn 1s ease-out',
      }}>

        {/* Logo */}
        <div style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 'clamp(3rem, 10vw, 5rem)',
          fontWeight: 800,
          color: '#f4f1e1',
          letterSpacing: '6px',
          textTransform: 'uppercase',
          marginBottom: '0.8rem',
          textShadow: '0 4px 20px rgba(0,0,0,0.8), 0 0 30px rgba(212,175,55,0.3)',
        }}>
          CHESS<span style={{ color: '#d4af37' }}>.</span>VP
        </div>

        {/* Gold divider */}
        <div style={{
          width: '80px', height: '2px',
          background: 'linear-gradient(90deg, transparent, #d4af37, transparent)',
          margin: '0 auto 2rem',
        }}/>

        <p style={{
          fontFamily: "'Lora', serif",
          fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
          color: '#b8ccbb',
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
            fontSize: '1.05rem',
            fontFamily: "'Cinzel', serif",
            textTransform: 'uppercase',
            letterSpacing: '3px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #aa8825, #d4af37)',
            color: '#08120b',
            border: '1px solid #ffeba1',
            borderRadius: '4px',
            cursor: 'pointer',
            opacity: showButton ? 1 : 0,
            transform: showButton ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s ease',
            boxShadow: '0 4px 0 #8c7017, 0 10px 30px rgba(0,0,0,0.5)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 0 #8c7017, 0 15px 40px rgba(212,175,55,0.4)';
            e.currentTarget.style.filter = 'brightness(1.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 0 #8c7017, 0 10px 30px rgba(0,0,0,0.5)';
            e.currentTarget.style.filter = 'brightness(1)';
          }}
        >
          ♟ Accept Challenge
        </button>
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes firefly {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.2; }
          33% { transform: translate(15px, -20px) scale(1.2); opacity: 0.8; }
          66% { transform: translate(-10px, -30px) scale(0.9); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
