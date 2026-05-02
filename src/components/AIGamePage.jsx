import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAIChessGame from '../hooks/useAIChessGame'
import ChessBoard from './ChessBoard'
import PromotionModal from './PromotionModal'
import GameOverModal from './GameOverModal'
import { getPieceSymbol } from '../hooks/useChessGame'
import { initAudio } from '../lib/chessSounds'

const DIFFICULTIES = [
  {
    key: 'easy',
    name: 'Rookie',
    icon: '🌱',
    description: 'Just learning the ropes. HIRO plays casually and makes mistakes.',
    color: '#4ade80',
  },
  {
    key: 'medium',
    name: 'Strategist',
    icon: '⚔️',
    description: 'A solid opponent. HIRO thinks ahead and plays with purpose.',
    color: '#d4af37',
  },
  {
    key: 'hard',
    name: 'Grandmaster',
    icon: '👑',
    description: 'No mercy. HIRO calculates deep and punishes every mistake.',
    color: '#ef4444',
  },
]

export default function AIGamePage() {
  const [difficulty, setDifficulty] = useState(null)
  const navigate = useNavigate()

  if (!difficulty) {
    return <DifficultySelector onSelect={setDifficulty} onBack={() => navigate('/')} />
  }

  return <AIGameWrapper difficulty={difficulty} onChangeDifficulty={() => setDifficulty(null)} />
}

function DifficultySelector({ onSelect, onBack }) {
  return (
    <div className="ai-select-page" onClick={initAudio}>
      <button className="back-btn" onClick={onBack} style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 10 }}>
        ← Back
      </button>

      <div className="ai-select-container">
        <div className="ai-select-header">
          <div className="ai-hiro-avatar">🤖</div>
          <h1 className="ai-select-title">Challenge HIRO</h1>
          <p className="ai-select-subtitle">Choose your difficulty. I'll adapt my playstyle accordingly.</p>
        </div>

        <div className="ai-difficulty-grid">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.key}
              className="ai-difficulty-card"
              onClick={() => onSelect(d.key)}
              style={{ '--accent': d.color }}
            >
              <span className="ai-diff-icon">{d.icon}</span>
              <h3 className="ai-diff-name">{d.name}</h3>
              <p className="ai-diff-desc">{d.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function AIGameWrapper({ difficulty, onChangeDifficulty }) {
  const navigate = useNavigate()
  const gameProps = useAIChessGame(difficulty)

  const { hiroMessage, isAIThinking } = gameProps

  // Format move history
  const moveRows = []
  for (let i = 0; i < gameProps.moveHistory.length; i += 2) {
    moveRows.push({
      number: Math.floor(i / 2) + 1,
      white: gameProps.moveHistory[i]?.san || '',
      black: gameProps.moveHistory[i + 1]?.san || '',
    })
  }

  const diffInfo = DIFFICULTIES.find(d => d.key === difficulty)

  return (
    <div className="game-page" id="ai-game-page" style={{
      position: 'relative',
      backgroundImage: 'url(/ancient_forest_game_bg.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }} onClick={initAudio}>
      {/* Header */}
      <div className="game-header">
        <button
          className="game-header-logo"
          onClick={() => navigate('/')}
          style={{
            cursor: 'pointer', background: 'none', border: 'none', padding: 0,
            fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 900,
            color: 'white', letterSpacing: '2px', display: 'flex', alignItems: 'center'
          }}
        >
          CHESS<span className="logo-dot">.</span>VP
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{
            color: 'var(--text-secondary)', fontSize: '0.8rem',
            background: 'rgba(0,0,0,0.3)', padding: '4px 12px',
            borderRadius: '4px', border: `1px solid ${diffInfo?.color || 'var(--gold)'}`,
            color: diffInfo?.color || 'var(--gold)',
          }}>
            {diffInfo?.icon} vs HIRO ({diffInfo?.name})
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 12, height: 12, borderRadius: '50%',
              background: gameProps.turn === 'w' ? '#fff' : '#111',
              border: '1px solid var(--gold)'
            }} />
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: '0.7rem',
              letterSpacing: '1px', textTransform: 'uppercase',
              color: 'var(--text-secondary)',
            }}>
              {gameProps.turn === 'w' ? "Your turn" : "HIRO's turn"}
            </span>
          </div>
        </div>
      </div>

      {/* HIRO Message Bubble */}
      {hiroMessage && (
        <div className="hiro-game-bubble">
          <span className="hiro-bubble-avatar">🤖</span>
          <span className="hiro-bubble-text">{hiroMessage}</span>
        </div>
      )}

      {/* AI Thinking Indicator */}
      {isAIThinking && (
        <div className="hiro-thinking-bar">
          <div className="hiro-thinking-dots">
            <span /><span /><span />
          </div>
          <span>HIRO is thinking...</span>
        </div>
      )}

      {/* Game Body */}
      <div className="game-body">
        <div className="game-canvas-container">
          <ChessBoard
            board={gameProps.board}
            turn={gameProps.turn}
            selectedSquare={gameProps.selectedSquare}
            lastMove={gameProps.lastMove}
            kingInCheckSquare={gameProps.kingInCheckSquare}
            getValidMoves={gameProps.getValidMoves}
            onSquareClick={gameProps.handleSquareClick}
            isGameOver={gameProps.isGameOver}
            cameraPerspective="w"
          />
        </div>

        {/* Sidebar */}
        <div className="game-sidebar" id="game-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-section-title">Game Status</div>
            <div className="turn-indicator">
              <div className={`turn-color-dot white ${gameProps.turn === 'w' ? 'active' : ''}`} />
              <span className="turn-text" style={{ flex: 1 }}>
                You (White)
              </span>
            </div>
            <div className="turn-indicator" style={{ marginTop: '0.5rem' }}>
              <div className={`turn-color-dot black ${gameProps.turn === 'b' ? 'active' : ''}`} />
              <span className="turn-text" style={{ flex: 1 }}>
                🤖 HIRO (Black)
              </span>
            </div>
            {gameProps.isCheckmate && (
              <div className="game-status checkmate">Checkmate!</div>
            )}
            {gameProps.inCheck && !gameProps.isCheckmate && (
              <div className="game-status check">Check!</div>
            )}
            {(gameProps.isStalemate || gameProps.isDraw) && (
              <div className="game-status draw">Draw</div>
            )}
          </div>

          {/* Move History */}
          <div className="sidebar-section" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
            <div className="sidebar-section-title" style={{ padding: 'var(--space-lg, 1.2rem)', paddingBottom: '0.5rem' }}>
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
              <div className="captured-label">HIRO's pieces you captured</div>
              <div className="captured-pieces-list">
                {gameProps.capturedPieces.black.length === 0 ? (
                  <span className="no-captures">-</span>
                ) : (
                  gameProps.capturedPieces.black.map((p, i) => (
                    <span key={i} className="captured-piece">{getPieceSymbol(p)}</span>
                  ))
                )}
              </div>
            </div>
            <div className="captured-subsection" style={{ marginTop: '1rem' }}>
              <div className="captured-label">Your pieces HIRO captured</div>
              <div className="captured-pieces-list">
                {gameProps.capturedPieces.white.length === 0 ? (
                  <span className="no-captures">-</span>
                ) : (
                  gameProps.capturedPieces.white.map((p, i) => (
                    <span key={i} className="captured-piece">{getPieceSymbol(p)}</span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Game Actions */}
          <div className="game-actions">
            <button className="game-action-btn" onClick={gameProps.undo} disabled={gameProps.moveHistory.length === 0 || isAIThinking}>
              ↩ Undo
            </button>
            <button className="game-action-btn primary" onClick={gameProps.reset}>
              ↻ New Game
            </button>
            <button className="game-action-btn" onClick={onChangeDifficulty}>
              🎯 Difficulty
            </button>
          </div>
        </div>
      </div>

      {/* Promotion Modal */}
      {gameProps.pendingPromotion && (
        <PromotionModal
          color={gameProps.turn}
          onSelect={gameProps.handlePromotion}
        />
      )}

      {/* Game Over Modal */}
      {gameProps.isGameOver && (
        <GameOverModal
          isCheckmate={gameProps.isCheckmate}
          isStalemate={gameProps.isStalemate}
          isDraw={gameProps.isDraw}
          turn={gameProps.turn}
          playerColor="w"
          mode="ai"
          onNewGame={gameProps.reset}
          onGoHome={() => navigate('/')}
        />
      )}
    </div>
  )
}
