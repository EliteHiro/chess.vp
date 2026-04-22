import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AuthModal({ onClose }) {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, displayName);
      }
      onClose(); // Close modal on success
      navigate('/lobby'); // Redirect to lobby
    } catch (err) {
      setError(err.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', 
      alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(5px)'
    }}>
      <div className="modal" style={{
        backgroundColor: 'var(--bg-secondary)', padding: '2rem', 
        borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '400px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '1px solid #333',
        position: 'relative'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '1rem', right: '1rem', 
          background: 'none', border: 'none', color: 'var(--text-secondary)',
          fontSize: '1.2rem', cursor: 'pointer'
        }}>✕</button>

        <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.5rem', textAlign: 'center' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>

        {error && <div style={{ 
          backgroundColor: 'rgba(255,100,100,0.1)', color: '#ff6b6b', 
          padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem',
          fontSize: '0.9rem', textAlign: 'center', border: '1px solid rgba(255,100,100,0.2)'
        }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isLogin && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Display Name</label>
              <input 
                type="text" 
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)}
                required={!isLogin}
                style={{
                  width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)',
                  border: '1px solid #444', backgroundColor: 'var(--bg-primary)',
                  color: 'white', fontFamily: 'var(--font-sans)'
                }}
              />
            </div>
          )}
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)',
                border: '1px solid #444', backgroundColor: 'var(--bg-primary)',
                color: 'white', fontFamily: 'var(--font-sans)'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)',
                border: '1px solid #444', backgroundColor: 'var(--bg-primary)',
                color: 'white', fontFamily: 'var(--font-sans)'
              }}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{ 
              background: 'none', border: 'none', color: 'var(--primary)', 
              cursor: 'pointer', fontFamily: 'inherit', padding: 0 
            }}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}
