import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { ref, onValue, set } from 'firebase/database';

export default function SecretWall() {
  const location = useLocation();
  const navigate = useNavigate();
  // If they arrived via routing state from winning, they bypass the password
  // but they are NOT password-authorized, so they cannot edit.
  const bypassedByWin = location.state?.authorized || false;
  
  const [isAuthorized, setIsAuthorized] = useState(bypassedByWin);
  const [isPasswordAuthorized, setIsPasswordAuthorized] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');

  // Firebase state
  const [message, setMessage] = useState('Loading the ancient texts...');
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const CORRECT_PASSWORD = 'ti_amo_terra';

  // Fetch from Firebase
  useEffect(() => {
    if (!isAuthorized) return;
    
    if (!db) {
      setMessage("The database connection is severed. The ancients are silent.");
      return;
    }

    const messageRef = ref(db, 'secret/message');
    const unsubscribe = onValue(messageRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setMessage(data);
      } else {
        setMessage("The wall is empty. Awaiting the first scribe...");
      }
    });

    return () => unsubscribe();
  }, [isAuthorized]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === CORRECT_PASSWORD) {
      setIsAuthorized(true);
      setIsPasswordAuthorized(true); // Grants edit rights
      setError('');
    } else {
      setError('Incorrect password. The ancients reject you.');
      setPasswordInput('');
    }
  };

  const handleSave = async () => {
    if (!db) return;
    setIsSaving(true);
    try {
      await set(ref(db, 'secret/message'), editDraft);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('Failed to carve into the stone. Check connection.');
    } finally {
      setIsSaving(false);
    }
  };

  const startEditing = () => {
    setEditDraft(message === "The wall is empty. Awaiting the first scribe..." ? '' : message);
    setIsEditing(true);
  };

  if (!isAuthorized) {
    return (
      <div className="secret-password-container">
        <button onClick={() => navigate('/')} className="back-btn">← Back</button>
        <div className="password-box">
          <h1 className="password-title">The Ancient Vault</h1>
          <p className="password-subtitle">Only those who hold the key, or have proven their worth in battle, may enter.</p>
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              placeholder="Speak the words..."
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="password-input"
            />
            {error && <div className="password-error">{error}</div>}
            <button type="submit" className="btn btn-primary password-submit-btn">Unlock</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="secret-wall-container">
      <button onClick={() => navigate('/')} className="back-btn wall-back-btn">← Return to the Mortal Realm</button>
      
      {isPasswordAuthorized && !isEditing && (
        <button onClick={startEditing} className="btn btn-primary edit-wall-btn">
          ✎ Carve New Message
        </button>
      )}

      <div className="ancient-wall">
        <div className="carved-text">
          <h1 className="wall-title">The Chronicles of the Great Board</h1>
          
          {isEditing ? (
            <div className="edit-container">
              <textarea
                className="wall-textarea"
                value={editDraft}
                onChange={(e) => setEditDraft(e.target.value)}
                placeholder="Carve your message into the stone..."
                disabled={isSaving}
              />
              <div className="edit-actions">
                <button 
                  className="btn btn-primary" 
                  onClick={handleSave} 
                  disabled={isSaving}
                >
                  {isSaving ? 'Carving...' : 'Save Inscription'}
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setIsEditing(false)} 
                  disabled={isSaving}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            message.split('\n').map((paragraph, idx) => (
              <p key={idx} className="wall-paragraph">
                {paragraph || '\u00A0'}
              </p>
            ))
          )}
          
        </div>
      </div>
    </div>
  );
}
