import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer" id="site-footer">
      <div className="footer-brand">
        CHESS<span className="logo-dot">.</span>VP
      </div>
      <p className="footer-text" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <span>© {new Date().getFullYear()} CHESS.VP — All rights reserved.</span>
        <span style={{ opacity: 0.3 }}>|</span>
        <Link to="/secret" style={{ 
          color: 'var(--gold)', 
          textDecoration: 'none', 
          opacity: 0.5,
          fontFamily: 'var(--font-display)',
          fontSize: '0.8rem',
          letterSpacing: '1px',
          transition: 'opacity 0.3s'
        }}
        onMouseOver={(e) => e.currentTarget.style.opacity = 1}
        onMouseOut={(e) => e.currentTarget.style.opacity = 0.5}
        >
          Ancient Vault
        </Link>
      </p>
    </footer>
  )
}
