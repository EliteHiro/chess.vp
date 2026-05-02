import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function HeroSection() {
  const { currentUser } = useAuth()
  
  return (
    <section className="hero" id="hero-section">
      <div className="hero-background">
        <img src="/ancient_forest_hero.png" alt="Ancient Magical Forest" aria-hidden="true" />
      </div>
      <div className="hero-overlay" />

      {/* Floating magical fireflies */}
      {[...Array(15)].map((_, i) => {
        const size = Math.random() * 6 + 2;
        return (
          <div key={i} style={{
            position: 'absolute',
            width: size, height: size,
            background: Math.random() > 0.5 ? '#d4af37' : '#4ade80', // Gold or Green
            borderRadius: '50%',
            top: `${Math.random() * 100}%`, 
            left: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.5 + 0.3,
            zIndex: 3,
            animation: `firefly ${Math.random() * 8 + 6}s ease-in-out infinite alternate`,
            animationDelay: `${Math.random() * 5}s`,
            boxShadow: `0 0 ${size * 2}px ${Math.random() > 0.5 ? '#d4af37' : '#4ade80'}`
          }}/>
        );
      })}

      <div className="hero-content" id="hero-content-card">

        {/* Gold badge */}
        <div style={{
          display: 'inline-block',
          background: 'rgba(212, 175, 55, 0.15)',
          border: '1px solid var(--gold)',
          borderRadius: '4px',
          padding: '0.4rem 1.2rem',
          marginBottom: '1.5rem',
          fontSize: '0.7rem',
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          color: 'var(--gold)',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          boxShadow: 'inset 0 0 10px rgba(212,175,55,0.2)',
        }}>
          ANCIENT CHESS REALM
        </div>

        <h1 className="hero-title">
          CHESS<span className="logo-dot">.</span>VP
        </h1>

        <p className="hero-subtitle">
          Luck has never once bowed to me — so let's play the only game where 
          luck kneels to nothing, and skill alone decides who survives.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/local" className="btn btn-primary" id="hero-play-btn">
            ♟ Enter Realm
          </Link>
          <Link to="/ai" className="btn btn-secondary" id="hero-ai-btn" style={{ borderColor: '#4ade80', color: '#4ade80' }}>
            🤖 Play vs HIRO
          </Link>
          {currentUser ? (
            <Link to="/lobby" className="btn btn-secondary" id="hero-online-btn">
              🌐 Multiplayer
            </Link>
          ) : (
            <a href="#features" className="btn btn-secondary" id="hero-learn-btn">
              ▶ Lore
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
