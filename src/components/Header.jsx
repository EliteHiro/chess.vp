import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './AuthModal'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header className={`header ${scrolled ? 'scrolled' : ''}`} id="main-header">
        <Link to="/" className="header-logo" id="logo-link" style={{ textDecoration: 'none' }}>
          <span>Chess</span>
          <span className="logo-dot">.</span>
          <span>VP</span>
        </Link>

        <nav className="header-nav" id="desktop-nav" style={{ alignItems: 'center' }}>
          {currentUser ? (
            <>
              <Link to="/lobby" className="header-nav-link">Play Online</Link>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginLeft: '1rem', marginRight: '1rem' }}>
                {currentUser.displayName || currentUser.email}
              </div>
              <button className="btn" onClick={() => logout()} style={{ padding: '0.4rem 1rem', fontSize: '0.75rem', background: 'transparent', border: '1px solid #444', color: 'white' }}>
                Logout
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => setShowAuthModal(true)} style={{ padding: '0.5rem 1.5rem', fontSize: '0.75rem' }}>
              Login to Play Online
            </button>
          )}
        </nav>

        <button
          className="header-menu-btn"
          onClick={() => setMobileOpen(true)}
          id="mobile-menu-btn"
          aria-label="Open menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </header>

      {/* Mobile Navigation */}
      <div className={`mobile-nav ${mobileOpen ? 'open' : ''}`} id="mobile-nav">
        <button
          className="mobile-nav-close"
          onClick={() => setMobileOpen(false)}
          id="mobile-nav-close"
          aria-label="Close menu"
        >
          ✕
        </button>
        <Link to="/local" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Play Local</Link>
        
        {currentUser ? (
          <>
            <Link to="/lobby" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Play Online</Link>
            <button
              className="btn"
              onClick={() => { setMobileOpen(false); logout(); }}
              style={{ background: 'transparent', border: '1px solid #444', color: 'white', marginTop: '1rem' }}
            >
              Logout ({currentUser.displayName || currentUser.email})
            </button>
          </>
        ) : (
          <button
            className="btn btn-primary"
            onClick={() => { setMobileOpen(false); setShowAuthModal(true); }}
            style={{ marginTop: '1rem' }}
          >
            Login to Play Online
          </button>
        )}
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  )
}
