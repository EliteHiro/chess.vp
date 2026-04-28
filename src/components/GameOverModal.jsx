export default function GameOverModal({ isCheckmate, isStalemate, isDraw, turn, onNewGame, onGoHome, playerColor, mode, opponentName, onViewSecret }) {
  let icon = '🤝'
  let title = 'Draw'
  let message = 'The game ended in a draw.'
  let canShowSecret = false;

  if (isCheckmate) {
    const winnerColor = turn === 'w' ? 'b' : 'w';
    const won = playerColor === winnerColor;
    
    icon = won ? '🎉' : '💀'
    title = won ? 'You Won!' : 'You Lost!'
    message = won 
      ? `Congratulations! You defeated your opponent by checkmate.`
      : `Better luck next time. Your opponent won by checkmate.`
      
    const isOpponentHimanshu = opponentName && opponentName.toLowerCase().includes('himanshu');
    canShowSecret = won && mode === 'online' && isOpponentHimanshu;

    if (!playerColor || playerColor === 'spectator') {
      icon = '🏆'
      title = 'Checkmate!'
      message = `${winnerColor === 'w' ? 'White' : 'Black'} wins the game!`
    }
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
          {canShowSecret && (
            <button className="btn btn-primary" onClick={onViewSecret} style={{ background: 'linear-gradient(135deg, #aa8825, #d4af37)', color: '#08120b', borderColor: '#ffeba1' }}>
              View Secret Message
            </button>
          )}
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
