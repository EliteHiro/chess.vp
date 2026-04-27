import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function HeroSection() {
  const { currentUser } = useAuth()
  
  return (
    <section className="hero" id="hero-section">
      <div className="hero-background">
        <img src="/bh6_hero_bg.png" alt="San Fransokyo City" aria-hidden="true" />
      </div>
      <div className="hero-overlay"></div>

      <div className="hero-content" id="hero-content-card">
        {/* Tech badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(0, 212, 255, 0.08)',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          borderRadius: '9999px',
          padding: '0.4rem 1.2rem',
          marginBottom: '1.5rem',
          fontSize: '0.7rem',
          fontFamily: 'var(--font-display)',
          fontWeight: '800',
          color: '#00d4ff',
          letterSpacing: '3px',
          textTransform: 'uppercase',
        }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: '#00d4ff',
            boxShadow: '0 0 8px #00d4ff',
            animation: 'neonFlicker 3s ease infinite'
          }}/>
          ONLINE CHESS PLATFORM
        </div>

        <h1 className="hero-title">
          CHESS<span className="logo-dot">.</span>VP
        </h1>

        <p className="hero-subtitle">
          Fist bump activated. The game board is your city — navigate it with precision, 
          outsmart your opponent, and be the last hero standing.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/local" className="btn btn-primary" id="hero-play-btn" style={{ textDecoration: 'none' }}>
            ⚡ Play Local
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

        {/* Holographic decorative dots */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '2rem'
        }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: i === 0 ? '#00d4ff' : 'rgba(0,212,255,0.3)',
              boxShadow: i === 0 ? '0 0 8px #00d4ff' : 'none',
              transition: 'all 0.3s ease'
            }}/>
          ))}
        </div>
      </div>
    </section>
  )
}
