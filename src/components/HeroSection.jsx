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

      <div className="hero-content" id="hero-content-card">

        {/* Matte red badge */}
        <div style={{
          display: 'inline-block',
          background: '#c42b22',
          borderRadius: '9999px',
          padding: '0.3rem 1.2rem',
          marginBottom: '1.5rem',
          fontSize: '0.65rem',
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          color: 'white',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          boxShadow: '0 3px 0 #8b1510',
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
