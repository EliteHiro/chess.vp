import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function HeroSection() {
  const { currentUser } = useAuth()
  
  return (
    <section className="hero" id="hero-section">
      <div className="hero-background">
        <img src="/bh6_hero_bg.png" alt="Big Hero 6 Sky" aria-hidden="true" />
      </div>
      <div className="hero-overlay" />

      {/* Baymax-style floating white orbs */}
      {[
        { size: 220, top: '10%', right: '8%', opacity: 0.12, delay: '0s' },
        { size: 140, top: '60%', left: '5%',  opacity: 0.10, delay: '2s' },
        { size: 80,  top: '35%', right: '25%',opacity: 0.08, delay: '4s' },
      ].map((orb, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: orb.size, height: orb.size,
          background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.9), rgba(255,255,255,0.2))',
          borderRadius: '50%',
          top: orb.top, right: orb.right, left: orb.left,
          opacity: orb.opacity,
          zIndex: 3,
          animation: `float 6s ease-in-out infinite`,
          animationDelay: orb.delay,
          filter: 'blur(2px)'
        }}/>
      ))}

      <div className="hero-content" id="hero-content-card">

        {/* Red badge — Baymax armor red */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'var(--red)',
          borderRadius: 'var(--radius-full)',
          padding: '0.3rem 1rem',
          marginBottom: '1.5rem',
          fontSize: '0.65rem',
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          color: 'white',
          letterSpacing: '2.5px',
          textTransform: 'uppercase',
          boxShadow: '0 3px 0 var(--red-dark)',
        }}>
          CHESS PLATFORM
        </div>

        <h1 className="hero-title">
          CHESS<span className="logo-dot">.</span>VP
        </h1>

        <p className="hero-subtitle">
          Luck has never once bowed to me — so let's play the only game where 
          luck kneels to nothing, and skill alone decides who survives.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/local" className="btn btn-primary" id="hero-play-btn" style={{ textDecoration: 'none' }}>
            ♟ Play Local
          </Link>
          {currentUser ? (
            <Link to="/lobby" className="btn btn-secondary" id="hero-online-btn" style={{ textDecoration: 'none' }}>
              🌐 Play Online
            </Link>
          ) : (
            <a href="#features" className="btn btn-secondary" id="hero-learn-btn">
              ▶ Learn More
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
