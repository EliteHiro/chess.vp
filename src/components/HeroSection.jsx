import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function HeroSection() {
  const { currentUser } = useAuth()
  
  return (
    <section className="hero" id="hero-section">
      {/* Background Image */}
      <div className="hero-background">
        <img src="/pixar_hero_bg.png" alt="Magical Chess World" aria-hidden="true" />
      </div>

      {/* Dark Overlay */}
      <div className="hero-overlay"></div>

      {/* Main Content Card */}
      <div className="hero-content" id="hero-content-card">
        <h1 className="hero-title">
          CHESS<span className="logo-dot">.</span>VP
        </h1>
        <p className="hero-subtitle">
          Luck has never once bowed to me — so let's play the only game where luck 
          kneels to nothing, and skill alone decides who survives.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/local" className="btn btn-primary" id="hero-play-btn" style={{ textDecoration: 'none' }}>
            ♟ Play Local
          </Link>
          {currentUser ? (
            <Link to="/lobby" className="btn btn-secondary" id="hero-online-btn" style={{ textDecoration: 'none' }}>
              ⚔ Play Online
            </Link>
          ) : (
            <a href="#features" className="btn btn-secondary" id="hero-learn-btn">
              ✨ Learn More
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
