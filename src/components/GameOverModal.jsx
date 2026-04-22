export default function GameOverModal({ isCheckmate, isStalemate, isDraw, turn, onNewGame, onGoHome }) {
  let icon = '🤝'
  let title = 'Draw'
  let message = 'The game ended in a draw.'

  if (isCheckmate) {
    icon = '🏆'
    title = 'Checkmate!'
    message = `${turn === 'w' ? 'Black' : 'White'} wins the game!`
  } else if (isStalemate) {
    icon = '⚖️'
    title = 'Stalemate'
    message = 'No legal moves available. The game is a draw.'
  }

  return (
    <div className="modal-overlay" id="game-over-modal">
      <div className="modal">
        <div className="modal-icon">{icon}</div>
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="modal-buttons">
          <button className="btn btn-primary" onClick={onNewGame} id="modal-new-game">
            New Game
          </button>
          <button className="btn btn-secondary" onClick={onGoHome} id="modal-go-home">
            Home
          </button>
        </div>
      </div>
    </div>
  )
}
