import { useState, useCallback, useMemo } from 'react'
import { Chess } from 'chess.js'

// Unicode chess piece symbols
const PIECE_SYMBOLS = {
  wk: '♔', wq: '♕', wr: '♖', wb: '♗', wn: '♘', wp: '♙',
  bk: '♚', bq: '♛', br: '♜', bb: '♝', bn: '♞', bp: '♟',
}

export function getPieceSymbol(piece) {
  if (!piece) return null
  const key = piece.color + piece.type
  return PIECE_SYMBOLS[key] || null
}

export default function useChessGame() {
  const [game, setGame] = useState(new Chess())
  const [selectedSquare, setSelectedSquare] = useState(null)
  const [moveHistory, setMoveHistory] = useState([])
  const [lastMove, setLastMove] = useState(null)
  const [pendingPromotion, setPendingPromotion] = useState(null)

  const board = useMemo(() => game.board(), [game, moveHistory])
  const turn = game.turn() // 'w' or 'b'
  const inCheck = game.inCheck()
  const isCheckmate = game.isCheckmate()
  const isStalemate = game.isStalemate()
  const isDraw = game.isDraw()
  const isGameOver = game.isGameOver()

  // Find the king's position if in check
  const kingInCheckSquare = useMemo(() => {
    if (!inCheck) return null
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c]
        if (piece && piece.type === 'k' && piece.color === turn) {
          return piece.square
        }
      }
    }
    return null
  }, [inCheck, board, turn])

  // Get valid moves for a square
  const getValidMoves = useCallback((square) => {
    return game.moves({ square, verbose: true })
  }, [game, moveHistory])

  // Captured pieces
  const capturedPieces = useMemo(() => {
    const white = []
    const black = []
    for (const move of moveHistory) {
      if (move.captured) {
        // move.color is the color that made the capture
        if (move.color === 'w') {
          black.push({ type: move.captured, color: 'b' })
        } else {
          white.push({ type: move.captured, color: 'w' })
        }
      }
    }
    return { white, black }
  }, [moveHistory])

  // Handle square click
  const handleSquareClick = useCallback((square) => {
    if (isGameOver) return
    if (pendingPromotion) return

    const piece = game.get(square)

    // If a piece is already selected
    if (selectedSquare) {
      // Check if clicking the same square — deselect
      if (selectedSquare === square) {
        setSelectedSquare(null)
        return
      }

      // Check if clicking another own piece — reselect
      if (piece && piece.color === turn) {
        setSelectedSquare(square)
        return
      }

      // Try to make the move
      const validMoves = game.moves({ square: selectedSquare, verbose: true })
      const targetMove = validMoves.find(m => m.to === square)

      if (targetMove) {
        // Check if it's a promotion move
        if (targetMove.flags.includes('p') || (targetMove.piece === 'p' && (square[1] === '8' || square[1] === '1'))) {
          setPendingPromotion({ from: selectedSquare, to: square })
          setSelectedSquare(null)
          return
        }

        // Make the move
        const move = game.move({ from: selectedSquare, to: square })
        if (move) {
          setMoveHistory(prev => [...prev, move])
          setLastMove({ from: selectedSquare, to: square })
          setSelectedSquare(null)
          setGame(new Chess(game.fen()))
          return
        }
      }

      // Invalid move — deselect
      setSelectedSquare(null)
      return
    }

    // No piece selected yet — select if it's the current player's piece
    if (piece && piece.color === turn) {
      setSelectedSquare(square)
    }
  }, [game, selectedSquare, turn, isGameOver, pendingPromotion, moveHistory])

  // Handle promotion
  const handlePromotion = useCallback((promotionPiece) => {
    if (!pendingPromotion) return

    const move = game.move({
      from: pendingPromotion.from,
      to: pendingPromotion.to,
      promotion: promotionPiece,
    })

    if (move) {
      setMoveHistory(prev => [...prev, move])
      setLastMove({ from: pendingPromotion.from, to: pendingPromotion.to })
      setGame(new Chess(game.fen()))
    }

    setPendingPromotion(null)
  }, [game, pendingPromotion])

  // Undo move
  const undo = useCallback(() => {
    const move = game.undo()
    if (move) {
      setMoveHistory(prev => prev.slice(0, -1))
      setSelectedSquare(null)
      setLastMove(null)
      setGame(new Chess(game.fen()))
    }
  }, [game])

  // Reset game
  const reset = useCallback(() => {
    const newGame = new Chess()
    setGame(newGame)
    setSelectedSquare(null)
    setMoveHistory([])
    setLastMove(null)
    setPendingPromotion(null)
  }, [])

  return {
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
  }
}
