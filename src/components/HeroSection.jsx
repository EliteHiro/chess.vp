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
        <img src="/hero-bg.png" alt="" aria-hidden="true" />
      </div>

      {/* Dark Overlay */}
      <div className="hero-overlay"></div>

      {/* Floating Particles */}
      <div className="hero-particles" aria-hidden="true">
        {particles.map(p => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: p.left,
              top: p.top,
              animationDelay: p.delay,
              animationDuration: p.duration,
              width: p.size,
              height: p.size,
            }}
          />
        ))}
      </div>

      {/* Main Content Card */}
      <div className="hero-content" id="hero-content-card">
        <h1 className="hero-title">
          Chess<span className="title-dot">.</span>VP
        </h1>
        <p className="hero-subtitle">
          Step into a new dimension of chess mastery. Challenge a friend to a thrilling
          two-player duel on a beautifully crafted board, and prove who truly rules the board.
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
