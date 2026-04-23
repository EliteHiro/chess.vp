import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useChessGame, { getPieceSymbol } from '../hooks/useChessGame'
import useOnlineChessGame from '../hooks/useOnlineChessGame'
import ChessBoard from './ChessBoard'
import PromotionModal from './PromotionModal'
import GameOverModal from './GameOverModal'

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
  const chatEndRef = useRef(null);

  // Format move history into paired rows
  const moveRows = []
  for (let i = 0; i < moveHistory.length; i += 2) {
    moveRows.push({
      number: Math.floor(i / 2) + 1,
      white: moveHistory[i]?.san || '',
      black: moveHistory[i + 1]?.san || '',
    })
  }

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

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
    <div className="game-page" id="game-page">
      {/* Game Header */}
      <div className="game-header">
        <button
          className="game-header-logo"
          onClick={onBack}
          id="game-logo-btn"
          style={{ cursor: 'pointer' }}
        >
          Chess<span className="logo-dot">.</span>VP
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {onlineMatchId && (
            <span style={{ marginRight: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem', background: '#333', padding: '4px 8px', borderRadius: '4px' }}>
              Code: <strong style={{color:'white'}}>{onlineMatchId}</strong>
            </span>
          )}
          <div
            className={`turn-color-dot ${turn === 'w' ? 'white' : 'black'} active`}
            style={{ width: 14, height: 14, border: `2px solid ${turn === 'w' ? '#e8e6e3' : '#555'}` }}
          ></div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.75rem',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: 'var(--text-secondary)',
          }}>
            {turn === 'w' ? 'White' : 'Black'}'s turn
          </span>
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
            cameraPerspective={playerColor === 'b' ? 'b' : 'w'} // Optional prop support later
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

          {/* Chat Section (Online Only) */}
          {onlineMatchId && (
            <div className="sidebar-section" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
              <div className="sidebar-section-title" style={{ padding: 'var(--space-lg)', paddingBottom: '0.5rem' }}>
                Chat
              </div>
              <div className="chat-messages" style={{ 
                flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', 
                flexDirection: 'column', gap: '0.5rem', background: 'rgba(0,0,0,0.2)' 
              }}>
                {chatMessages.length === 0 ? (
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', opacity: 0.5, textAlign: 'center', marginTop: '2rem' }}>
                    Say hello to your opponent!
                  </div>
                ) : (
                  chatMessages.map((msg, i) => {
                    return (
                      <div key={i} style={{
                        padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-md)',
                        fontSize: '0.85rem', maxWidth: '85%',
                        alignSelf: 'flex-start',
                        backgroundColor: '#222', border: '1px solid #333'
                      }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--accent-gold)', marginBottom: '2px' }}>{msg.senderName}</div>
                        <div style={{ color: '#eee' }}>{msg.text}</div>
                      </div>
                    )
                  })
                )}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleSendChat} style={{ padding: '1rem', display: 'flex', gap: '0.5rem', borderTop: '1px solid #333' }}>
                <input 
                  type="text" 
                  placeholder="Type a message..." 
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

          {/* Move History */}
          <div className="sidebar-section" style={{ flex: onlineMatchId ? 0.7 : 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
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
          onNewGame={reset}
          onGoHome={onBack}
        />
      )}
    </div>
  )
}
