import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { ref, set, get, child, onValue, remove, onDisconnect, serverTimestamp } from 'firebase/database';

export default function Lobby() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [incomingChallenge, setIncomingChallenge] = useState(null);

  // If not logged in, redirect home and handle presence
  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    } else if (db) {
      // Presence logic
      const userRef = ref(db, `users/${currentUser.uid}`);

      // Set to online when entering lobby
      set(userRef, {
        uid: currentUser.uid,
        displayName: currentUser.displayName || currentUser.email,
        email: currentUser.email,
        lastActive: serverTimestamp(),
        status: 'online'
      });

      // Set to offline when disconnected
      onDisconnect(userRef).update({
        status: 'offline',
        lastActive: serverTimestamp()
      });
    }
  }, [currentUser, navigate]);

  // Fetch registered users (online only)
  useEffect(() => {
    if (!db || !currentUser) return;
    const usersRef = ref(db, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Filter out current user AND only show online users
        const usersList = Object.values(data).filter(user =>
          user.uid !== currentUser.uid && user.status === 'online'
        );
        setUsers(usersList);
      }
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Listen for incoming challenges
  useEffect(() => {
    if (!db || !currentUser) return;
    const challengesRef = ref(db, `challenges/${currentUser.uid}`);
    const unsubscribe = onValue(challengesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Just take the first one for now
        const challengerUid = Object.keys(data)[0];
        setIncomingChallenge({ ...data[challengerUid], challengerUid });
      } else {
        setIncomingChallenge(null);
      }
    });
    return () => unsubscribe();
  }, [currentUser]);

  if (!currentUser) return null;

  const handleCreateMatch = async () => {
    setLoading(true);
    setError('');
    try {
      if (!db) throw new Error("Firebase Database is not initialized.");
      const matchId = Math.random().toString(36).substring(2, 7).toUpperCase();

      const matchRef = ref(db, `matches/${matchId}`);
      await set(matchRef, {
        status: 'waiting',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        players: {
          w: currentUser.uid,
          b: null
        },
        createdBy: currentUser.uid,
        createdAt: Date.now()
      });

      return matchId;
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create match');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleManualCreateMatch = async () => {
    const matchId = await handleCreateMatch();
    if (matchId) navigate(`/online/${matchId}`);
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

      if (matchData.status === 'waiting' && matchData.players.w !== currentUser.uid) {
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

  const handleChallengeUser = async (targetUid) => {
    setLoading(true);
    try {
      const matchId = await handleCreateMatch();
      if (!matchId) return;

      const challengeRef = ref(db, `challenges/${targetUid}/${currentUser.uid}`);
      await set(challengeRef, {
        challengerName: currentUser.displayName || currentUser.email,
        matchId: matchId,
        timestamp: Date.now()
      });

      // Navigate to the match and wait
      navigate(`/online/${matchId}`);
    } catch (err) {
      console.error(err);
      setError('Failed to send challenge');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptChallenge = async () => {
    if (!incomingChallenge) return;
    setLoading(true);
    try {
      const { matchId, challengerUid } = incomingChallenge;

      // Claim the black spot
      await set(ref(db, `matches/${matchId}/players/b`), currentUser.uid);
      await set(ref(db, `matches/${matchId}/status`), 'playing');

      // Delete the challenge
      await remove(ref(db, `challenges/${currentUser.uid}/${challengerUid}`));

      navigate(`/online/${matchId}`);
    } catch (err) {
      console.error(err);
      setError('Failed to accept challenge');
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineChallenge = async () => {
    if (!incomingChallenge) return;
    try {
      await remove(ref(db, `challenges/${currentUser.uid}/${incomingChallenge.challengerUid}`));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="lobby-container" style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'flex-start', padding: '4rem 2rem',
      background: 'radial-gradient(circle at center, #1a1a1a 0%, #0a0a0a 100%)',
      overflowY: 'auto'
    }}>

      {/* Challenge Notification Overlay */}
      {incomingChallenge && (
        <div style={{
          position: 'fixed', top: '2rem', right: '2rem', zIndex: 1000,
          backgroundColor: 'rgba(30, 30, 30, 0.95)', padding: '1.5rem',
          borderRadius: 'var(--radius-lg)', border: '1px solid var(--accent-gold)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)', minWidth: '300px',
          backdropFilter: 'blur(10px)', animation: 'slideIn 0.3s ease-out'
        }}>
          <h3 style={{ color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>Incoming Challenge!</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            <strong>{incomingChallenge.challengerName}</strong> wants to play with you.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-primary" onClick={handleAcceptChallenge} style={{ flex: 1 }}>Accept</button>
            <button className="btn" onClick={handleDeclineChallenge} style={{ flex: 1, border: '1px solid #444' }}>Decline</button>
          </div>
        </div>
      )}

      <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem', fontSize: '3rem' }}>
        Lobby
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>
        Welcome, {currentUser.displayName || currentUser.email}!
      </p>

      <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: '1200px' }}>

        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Create Game Section */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)', padding: '2rem', borderRadius: 'var(--radius-lg)',
            border: '1px solid #333', display: 'flex', flexDirection: 'column', gap: '1.5rem',
            textAlign: 'center'
          }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Create Match</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Generate a new code to share with a friend.</p>
            </div>
            {error && <div style={{ color: '#ff6b6b', fontSize: '0.9rem' }}>{error}</div>}
            <button
              className="btn btn-primary"
              onClick={handleManualCreateMatch}
              disabled={loading}
              style={{ width: '100%', padding: '1rem' }}
            >
              {loading ? 'Creating...' : 'Create New Game'}
            </button>
          </div>

          {/* Join Game Section */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)', padding: '2rem', borderRadius: 'var(--radius-lg)',
            border: '1px solid #333', display: 'flex', flexDirection: 'column', gap: '1.5rem',
            textAlign: 'center'
          }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Join Match</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Enter a match code to join a friend's game.</p>
            </div>
            <form onSubmit={handleJoinMatch} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="text"
                placeholder="Enter Code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                required
                maxLength={5}
                style={{
                  width: '100%', padding: '1rem', borderRadius: 'var(--radius-sm)',
                  border: '1px solid #444', backgroundColor: 'var(--bg-primary)',
                  color: 'white', fontFamily: 'var(--font-display)', fontSize: '1.2rem',
                  textAlign: 'center', letterSpacing: '4px'
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

        {/* Registered Users Section */}
        <div style={{
          flex: '1 1 400px', backgroundColor: 'var(--bg-secondary)', padding: '2rem',
          borderRadius: 'var(--radius-lg)', border: '1px solid #333',
          display: 'flex', flexDirection: 'column', gap: '1.5rem'
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', textAlign: 'center' }}>Online Players</h2>
          <div style={{
            maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem',
            paddingRight: '0.5rem'
          }}>
            {users.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>No other players are online right now.</p>
            ) : (
              users.map(user => (
                <div key={user.uid} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '1rem', backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: 'var(--radius-md)', border: '1px solid #222'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#4ade80', boxShadow: '0 0 8px #4ade80' }}></div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 'bold' }}>{user.displayName || 'Anonymous'}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Online</span>
                    </div>
                  </div>
                  <button
                    className="btn"
                    onClick={() => handleChallengeUser(user.uid)}
                    disabled={loading}
                    style={{
                      fontSize: '0.75rem', padding: '0.5rem 1rem',
                      backgroundColor: 'var(--accent-gold)', color: 'black', border: 'none'
                    }}
                  >
                    Challenge
                  </button>
                </div>
              ))
            )}
          </div>
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

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
