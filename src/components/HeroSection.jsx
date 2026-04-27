import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function HeroSection() {
  const { currentUser } = useAuth()
  
  // Generate random particles
  const particles = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${60 + Math.random() * 40}%`,
      delay: `${Math.random() * 6}s`,
      duration: `${4 + Math.random() * 4}s`,
      size: `${1 + Math.random() * 3}px`,
    }))
  }, [])

  return (
    <section className="hero" id="hero-section">
      {/* Background Image */}
      <div className="hero-background">
        <img src="/jungle_theme_bg.png" alt="Ancient Woods" aria-hidden="true" />
      </div>

      {/* Dark Overlay */}
      <div className="hero-overlay"></div>

      {/* Main Content Card */}
      <div className="hero-content" id="hero-content-card">
        <h1 className="hero-title">
          CHESS<span className="logo-dot">.</span>VP
        </h1>
        <p className="hero-subtitle">
          Step into the forgotten realm. Prove your wisdom amidst the ancient ruins 
          and moss-covered paths of the hidden woods.
        </p>
        <div className="hero-buttons">
          <Link to="/local" className="btn btn-primary" id="hero-play-btn" style={{ textDecoration: 'none' }}>
            Play Local
          </Link>
          {currentUser ? (
            <Link to="/lobby" className="btn btn-secondary" id="hero-online-btn" style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.1)' }}>
              Play Online
            </Link>
          ) : (
            <a href="#features" className="btn btn-secondary" id="hero-learn-btn">
              Learn More
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
