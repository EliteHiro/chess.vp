import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { ref, set, get, child } from 'firebase/database';

export default function Lobby() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If not logged in, redirect home
  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const handleCreateMatch = async () => {
    setLoading(true);
    setError('');
    try {
      if (!db) throw new Error("Firebase Database is not initialized.");
      // Generate a random 5-character alphanumeric code
      const matchId = Math.random().toString(36).substring(2, 7).toUpperCase();
      
      const matchRef = ref(db, `matches/${matchId}`);
      await set(matchRef, {
        status: 'waiting',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // starting position
        players: {
          w: currentUser.uid,
          b: null // waiting for opponent
        },
        createdBy: currentUser.uid,
        createdAt: Date.now()
      });

      navigate(`/online/${matchId}`);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create match');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMatch = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    setLoading(true);
    setError('');
    try {
      if (!db) throw new Error("Firebase Database is not initialized.");
      const code = joinCode.trim().toUpperCase();
      const matchRef = ref(db, `matches/${code}`);
      const snapshot = await get(matchRef);
      
      if (!snapshot.exists()) {
        setError('Match not found. Please check the code.');
        setLoading(false);
        return;
      }

      const matchData = snapshot.val();
      
      // If the match is waiting for an opponent and we aren't the creator
      if (matchData.status === 'waiting' && matchData.players.w !== currentUser.uid) {
        // We will claim the black spot inside the game hook or here. Let's redirect and let the hook handle it or do it here.
        // It's safer to do it here so another joiner doesn't sneak in.
        if (!matchData.players.b) {
          await set(ref(db, `matches/${code}/players/b`), currentUser.uid);
          await set(ref(db, `matches/${code}/status`), 'playing');
        } else if (matchData.players.b !== currentUser.uid) {
           setError('Match is already full.');
           setLoading(false);
           return;
        }
      } else if (matchData.players.w !== currentUser.uid && matchData.players.b !== currentUser.uid) {
        setError('Match is already full.');
        setLoading(false);
        return;
      }
      
      navigate(`/online/${code}`);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to join match');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lobby-container" style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '2rem',
      background: 'radial-gradient(circle at center, #1a1a1a 0%, #0a0a0a 100%)'
    }}>
      <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem', fontSize: '3rem' }}>
        Lobby
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>
        Welcome, {currentUser.displayName || currentUser.email}!
      </p>

      <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        
        {/* Create Game Section */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)', padding: '2rem', borderRadius: 'var(--radius-lg)',
          width: '300px', border: '1px solid #333', display: 'flex', flexDirection: 'column', gap: '1.5rem',
          textAlign: 'center'
        }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Create Match</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Generate a new code to share with a friend.</p>
          </div>
          
          {error && <div style={{ color: '#ff6b6b', fontSize: '0.9rem' }}>{error}</div>}

          <button 
            className="btn btn-primary" 
            onClick={handleCreateMatch}
            disabled={loading}
            style={{ width: '100%', padding: '1rem' }}
          >
            {loading ? 'Creating...' : 'Create New Game'}
          </button>
        </div>

        {/* Join Game Section */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)', padding: '2rem', borderRadius: 'var(--radius-lg)',
          width: '300px', border: '1px solid #333', display: 'flex', flexDirection: 'column', gap: '1.5rem',
          textAlign: 'center'
        }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Join Match</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Enter a match code to join a friend's game.</p>
          </div>
          
          <form onSubmit={handleJoinMatch} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="text" 
              placeholder="Enter Code (e.g. A1B2C)" 
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              required
              maxLength={5}
              style={{
                width: '100%', padding: '1rem', borderRadius: 'var(--radius-sm)',
                border: '1px solid #444', backgroundColor: 'var(--bg-primary)',
                color: 'white', fontFamily: 'var(--font-display)', fontSize: '1.2rem',
                textAlign: 'center', letterSpacing: '4px', textTransform: 'uppercase'
              }}
            />
            <button 
              type="submit" 
              className="btn btn-secondary" 
              disabled={loading || !joinCode}
              style={{ width: '100%', padding: '1rem' }}
            >
              {loading ? 'Joining...' : 'Join Game'}
            </button>
          </form>
        </div>

      </div>

      <div style={{ marginTop: '4rem' }}>
        <button 
          onClick={() => navigate('/')}
          className="btn"
          style={{ background: 'transparent', border: '1px solid #444', color: 'white' }}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
