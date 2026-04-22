import { useMemo } from 'react'
import { getPieceSymbol } from '../hooks/useChessGame'

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1']

export default function ChessBoard({
  board,
  turn,
  selectedSquare,
  lastMove,
  kingInCheckSquare,
  getValidMoves,
  onSquareClick,
  isGameOver,
}) {
  // Get valid move squares for the selected piece
  const validMoveSquares = useMemo(() => {
    if (!selectedSquare) return new Map()
    const moves = getValidMoves(selectedSquare)
    const map = new Map()
    for (const move of moves) {
      map.set(move.to, move.captured ? 'capture' : 'move')
    }
    return map
  }, [selectedSquare, getValidMoves])

  return (
    <div className="chess-board-container">
      <div className="board-wrapper">
        {/* Rank labels (left side) */}
        <div style={{ display: 'flex' }}>
          <div className="board-labels-rank">
            {RANKS.map(rank => (
              <div className="board-label" key={rank}>{rank}</div>
            ))}
          </div>

          {/* Chess Board */}
          <div className="chess-board" id="chess-board">
            {RANKS.map((rank, rowIndex) =>
              FILES.map((file, colIndex) => {
                const square = `${file}${rank}`
                const isLight = (rowIndex + colIndex) % 2 === 0
                const piece = board[rowIndex][colIndex]
                const isSelected = selectedSquare === square
                const moveType = validMoveSquares.get(square)
                const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square)
                const isCheckSquare = kingInCheckSquare === square

                let className = `chess-square ${isLight ? 'light' : 'dark'}`
                if (isSelected) className += ' selected'
                if (moveType === 'move') className += ' valid-move'
                if (moveType === 'capture') className += ' valid-capture'
                if (isLastMove) className += ' last-move'
                if (isCheckSquare) className += ' check-square'

                return (
                  <div
                    key={square}
                    className={className}
                    id={`square-${square}`}
                    onClick={() => onSquareClick(square)}
                  >
                    {piece && (
                      <span className="piece-symbol">
                        {getPieceSymbol(piece)}
                      </span>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* File labels (bottom) */}
        <div style={{ display: 'flex' }}>
          <div style={{ width: '22px' }}></div>
          <div className="board-labels-file" style={{ flex: 1 }}>
            {FILES.map(file => (
              <div className="board-label" key={file}>{file}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
