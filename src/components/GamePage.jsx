import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useChessGame, { getPieceSymbol } from '../hooks/useChessGame'
import useOnlineChessGame from '../hooks/useOnlineChessGame'
import ChessBoard from './ChessBoard'
import PromotionModal from './PromotionModal'
import GameOverModal from './GameOverModal'
import { initAudio } from '../lib/chessSounds'

export default function GamePage({ mode }) {
  if (mode === 'online') {
    return <OnlineGameWrapper />
  }
  return <LocalGameWrapper />
}

function LocalGameWrapper() {
  const gameProps = useChessGame()
  const navigate = useNavigate()
  return <GameLayout {...gameProps} onBack={() => navigate('/')} />
}

function OnlineGameWrapper() {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const gameProps = useOnlineChessGame(matchId)
  
  return (
    <GameLayout 
      {...gameProps} 
      onBack={() => navigate('/lobby')} 
      onlineMatchId={matchId} 
    />
  )
}

function GameLayout({
  board,
  turn,
  inCheck,
  isCheckmate,
  isStalemate,
  isDraw,
  isGameOver,
  kingInCheckSquare,
  selectedSquare,
  lastMove,
  moveHistory,
  capturedPieces,
  pendingPromotion,
  getValidMoves,
  handleSquareClick,
  handlePromotion,
  undo,
  reset,
  onBack,
  onlineMatchId,
  matchData,
  playerColor,
  chatMessages = [],
  sendChatMessage
}) {
  const [chatInput, setChatInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const chatEndRef = useRef(null);
  const lastMessageCount = useRef(chatMessages.length);

  // Format move history into paired rows
  const moveRows = []
  for (let i = 0; i < moveHistory.length; i += 2) {
    moveRows.push({
      number: Math.floor(i / 2) + 1,
      white: moveHistory[i]?.san || '',
      black: moveHistory[i + 1]?.san || '',
    })
  }

  // Handle unread messages
  useEffect(() => {
    if (!isChatOpen && chatMessages.length > lastMessageCount.current) {
      // Check if the last message was from the opponent
      const lastMsg = chatMessages[chatMessages.length - 1];
      if (lastMsg.senderId !== matchData?.players?.[playerColor]) {
        setHasUnreadMessages(true);
      }
    }
    lastMessageCount.current = chatMessages.length;
  }, [chatMessages, isChatOpen, matchData, playerColor]);

  // Auto-scroll chat to bottom and clear unread state
  useEffect(() => {
    if (isChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setHasUnreadMessages(false);
    }
  }, [chatMessages, isChatOpen]);

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(chatInput);
    setChatInput('');
  };

  // Get game status text
  const getStatusText = () => {
    if (isCheckmate) return 'Checkmate!'
    if (isStalemate) return 'Stalemate'
    if (isDraw) return 'Draw'
    if (inCheck) return 'Check!'
    if (onlineMatchId) {
      if (matchData?.status === 'waiting') return 'Waiting for opponent...'
      if (playerColor === 'spectator') return 'Spectating'
    }
    return null
  }

  const getStatusClass = () => {
    if (isCheckmate) return 'checkmate'
    if (isStalemate || isDraw) return 'draw'
    if (inCheck) return 'check'
    if (onlineMatchId && matchData?.status === 'waiting') return 'check wait-anim'
    return ''
  }

  const statusText = getStatusText()

  return (
    <div className="game-page" id="game-page" style={{
      position: 'relative',
      backgroundImage: 'url(/ancient_forest_game_bg.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }} onClick={initAudio}>
      {/* Game Header */}
      <div className="game-header">
        <button
          className="game-header-logo"
          onClick={onBack}
          id="game-logo-btn"
          style={{ 
            cursor: 'pointer', 
            background: 'none', 
            border: 'none', 
            padding: 0,
            fontFamily: 'var(--font-display)',
            fontSize: '1.8rem',
            fontWeight: 900,
            color: 'white',
            letterSpacing: '2px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          CHESS<span className="logo-dot">.</span>VP
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {onlineMatchId && (
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', background: 'rgba(0,0,0,0.3)', padding: '4px 12px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
              CODE: <strong style={{color:'var(--gold)'}}>{onlineMatchId}</strong>
            </span>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              className={`turn-color-dot ${turn === 'w' ? 'white' : 'black'} active`}
              style={{ width: 12, height: 12, borderRadius: '50%', background: turn === 'w' ? '#fff' : '#111', border: '1px solid var(--gold)' }}
            ></div>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.7rem',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: 'var(--text-secondary)',
            }}>
              {turn === 'w' ? "White's turn" : "Black's turn"}
            </span>
          </div>
        </div>
      </div>

      {/* Game Body */}
      <div className="game-body">
        {/* Chess Board */}
        <div className="game-canvas-container">
          <ChessBoard
            board={board}
            turn={turn}
            selectedSquare={selectedSquare}
            lastMove={lastMove}
            kingInCheckSquare={kingInCheckSquare}
            getValidMoves={getValidMoves}
            onSquareClick={handleSquareClick}
            isGameOver={isGameOver}
            cameraPerspective={playerColor === 'b' ? 'b' : 'w'}
          />
        </div>

        {/* Sidebar */}
        <div className="game-sidebar" id="game-sidebar">
          {/* Turn & Status */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">Game Status</div>
            <div className="turn-indicator">
              <div className={`turn-color-dot white ${turn === 'w' ? 'active' : ''}`}></div>
              <span className="turn-text" style={{ flex: 1 }}>
                White {playerColor === 'w' && <span style={{fontSize:'0.7rem', color:'var(--primary)'}}>(You)</span>}
              </span>
            </div>
            <div className="turn-indicator" style={{ marginTop: '0.5rem' }}>
              <div className={`turn-color-dot black ${turn === 'b' ? 'active' : ''}`}></div>
              <span className="turn-text" style={{ flex: 1 }}>
                Black {playerColor === 'b' && <span style={{fontSize:'0.7rem', color:'var(--primary)'}}>(You)</span>}
              </span>
            </div>
            {statusText && (
              <div className={`game-status ${getStatusClass()}`}>
                {statusText}
              </div>
            )}
          </div>

          {/* Move History */}
          <div className="sidebar-section" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
            <div className="sidebar-section-title" style={{ padding: 'var(--space-lg)', paddingBottom: '0.5rem' }}>
              Move History
            </div>
            <div className="move-history" id="move-history">
              {moveRows.length === 0 && (
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', opacity: 0.5, textAlign: 'center', padding: '1rem 0' }}>
                  No moves yet
                </div>
              )}
              {moveRows.map((row, i) => (
                <div className="move-row" key={i}>
                  <span className="move-number">{row.number}.</span>
                  <span className={`move-notation ${i === moveRows.length - 1 && !row.black ? 'last' : ''}`}>
                    {row.white}
                  </span>
                  <span className={`move-notation ${i === moveRows.length - 1 && row.black ? 'last' : ''}`}>
                    {row.black}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Captured Pieces */}
          <div className="sidebar-section" style={{ borderBottom: 'none' }}>
            <div className="sidebar-section-title">Captured Pieces</div>
            
            <div className="captured-subsection">
              <div className="captured-label">Opponent's</div>
              <div className="captured-pieces-list">
                {capturedPieces.black.length === 0 ? (
                  <span className="no-captures">-</span>
                ) : (
                  capturedPieces.black.map((p, i) => (
                    <span key={i} className="captured-piece">{getPieceSymbol(p)}</span>
                  ))
                )}
              </div>
            </div>

            <div className="captured-subsection" style={{ marginTop: '1rem' }}>
              <div className="captured-label">Yours</div>
              <div className="captured-pieces-list">
                {capturedPieces.white.length === 0 ? (
                  <span className="no-captures">-</span>
                ) : (
                  capturedPieces.white.map((p, i) => (
                    <span key={i} className="captured-piece">{getPieceSymbol(p)}</span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Game Actions */}
          <div className="game-actions">
            {!onlineMatchId && (
              <button
                className="game-action-btn"
                onClick={undo}
                disabled={moveHistory.length === 0}
                id="undo-btn"
              >
                ↩ Undo
              </button>
            )}
            <button
              className="game-action-btn primary"
              onClick={reset}
              id="new-game-btn"
              disabled={onlineMatchId && matchData?.status === 'waiting'}
            >
              ↻ New Game
            </button>
            <button
              className="game-action-btn"
              onClick={onBack}
              id="home-btn"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      {/* Floating Chat Button (Online Only) */}
      {onlineMatchId && (
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          style={{
            position: 'fixed', bottom: '2rem', right: '2rem',
            width: '60px', height: '60px', borderRadius: '50%',
            backgroundColor: 'var(--primary)', color: 'white',
            border: 'none', cursor: 'pointer', zIndex: 1000,
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center',
            fontSize: '1.5rem', transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isChatOpen ? '✕' : '💬'}
          {hasUnreadMessages && !isChatOpen && (
            <div style={{
              position: 'absolute', top: '2px', right: '2px',
              width: '14px', height: '14px', borderRadius: '50%',
              backgroundColor: '#10b981', border: '2px solid var(--bg-primary)',
              boxShadow: '0 0 10px #10b981'
            }} />
          )}
        </button>
      )}

      {/* Chat Popup */}
      {onlineMatchId && isChatOpen && (
        <div style={{
          position: 'fixed', bottom: '6rem', right: '2rem',
          width: '320px', height: '400px',
          backgroundColor: 'rgba(15, 15, 20, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--primary-glow)',
          display: 'flex', flexDirection: 'column',
          zIndex: 1000, overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0,0,0,0.8)'
        }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>Match Chat</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Opponent: {matchData?.players?.w === playerColor ? 'Black' : 'White'}</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {chatMessages.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', opacity: 0.5, textAlign: 'center', marginTop: '2rem' }}>
                Say hello!
              </div>
            ) : (
              chatMessages.map((msg, i) => (
                <div key={i} style={{
                  padding: '0.6rem 0.9rem', borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem', maxWidth: '85%',
                  alignSelf: msg.senderId === matchData?.players?.[playerColor] ? 'flex-end' : 'flex-start',
                  backgroundColor: msg.senderId === matchData?.players?.[playerColor] ? 'rgba(126, 34, 206, 0.3)' : '#222',
                  border: msg.senderId === matchData?.players?.[playerColor] ? '1px solid var(--primary)' : '1px solid #333'
                }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--gold)', marginBottom: '2px' }}>{msg.senderName}</div>
                  <div style={{ color: '#eee' }}>{msg.text}</div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleSendChat} style={{ padding: '1rem', display: 'flex', gap: '0.5rem', borderTop: '1px solid #333' }}>
            <input 
              type="text" 
              placeholder="Message..." 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              style={{
                flex: 1, padding: '0.6rem 1rem', borderRadius: 'var(--radius-sm)',
                border: '1px solid #444', backgroundColor: 'var(--bg-primary)',
                color: 'white', fontSize: '0.85rem'
              }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1rem' }}>Send</button>
          </form>
        </div>
      )}

      {/* Promotion Modal */}
      {pendingPromotion && (
        <PromotionModal
          color={turn}
          onSelect={handlePromotion}
        />
      )}

      {/* Game Over Modal */}
      {isGameOver && (
        <GameOverModal
          isCheckmate={isCheckmate}
          isStalemate={isStalemate}
          isDraw={isDraw}
          turn={turn}
          playerColor={playerColor}
          mode={mode}
          onNewGame={reset}
          onGoHome={() => navigate('/')}
          onViewSecret={() => navigate('/secret', { state: { authorized: true } })}
        />
      )}
    </div>
  )
}
