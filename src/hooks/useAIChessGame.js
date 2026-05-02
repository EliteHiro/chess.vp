import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { Chess } from 'chess.js'
import { playChessSound, initAudio } from '../lib/chessSounds'
import { getAIMove, getHiroComment } from '../lib/chessAI'

export default function useAIChessGame(difficulty = 'medium') {
  const [game, setGame] = useState(new Chess())
  const [selectedSquare, setSelectedSquare] = useState(null)
  const [moveHistory, setMoveHistory] = useState([])
  const [lastMove, setLastMove] = useState(null)
  const [pendingPromotion, setPendingPromotion] = useState(null)
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [hiroMessage, setHiroMessage] = useState(null)
  const playerColor = 'w' // Human always plays white
  const aiTimeoutRef = useRef(null)

  const board = useMemo(() => game.board(), [game])
  const turn = useMemo(() => game.turn(), [game])
  const inCheck = useMemo(() => game.inCheck(), [game])
  const isCheckmate = useMemo(() => game.isCheckmate(), [game])
  const isStalemate = useMemo(() => game.isStalemate(), [game])
  const isDraw = useMemo(() => game.isDraw(), [game])
  const isGameOver = useMemo(() => game.isGameOver(), [game])

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

  const getValidMoves = useCallback((square) => {
    return game.moves({ square, verbose: true })
  }, [game, moveHistory])

  const capturedPieces = useMemo(() => {
    const white = []
    const black = []
    for (const move of moveHistory) {
      if (move.captured) {
        if (move.color === 'w') {
          black.push({ type: move.captured, color: 'b' })
        } else {
          white.push({ type: move.captured, color: 'w' })
        }
      }
    }
    return { white, black }
  }, [moveHistory])

  // AI makes a move
  const makeAIMove = useCallback(() => {
    if (game.isGameOver()) return

    setIsAIThinking(true)

    // Show thinking message
    const thinkingMessages = [
      "Hmm, let me think... 🤔",
      "Processing strategies... 💭",
      "Analyzing the board... 🧐",
      "This is interesting... 🌶️",
      "Give me a moment... ⚡",
    ]
    setHiroMessage(thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)])

    // Delay to simulate thinking (longer for harder difficulties)
    const delay = difficulty === 'easy' ? 500 : difficulty === 'medium' ? 800 : 1200

    aiTimeoutRef.current = setTimeout(() => {
      const aiMove = getAIMove(game.fen(), difficulty)
      if (!aiMove) {
        setIsAIThinking(false)
        return
      }

      const move = game.move({
        from: aiMove.from,
        to: aiMove.to,
        promotion: aiMove.promotion || undefined,
      })

      if (move) {
        playChessSound(move, game.inCheck())
        const newGame = new Chess(game.fen())
        setGame(newGame)
        setMoveHistory(prev => [...prev, move])
        setLastMove({ from: aiMove.from, to: aiMove.to })

        // HIRO comments on the game
        const comment = getHiroComment(newGame, move, difficulty)
        if (comment) {
          setHiroMessage(comment)
        } else {
          setHiroMessage(null)
        }
      }

      setIsAIThinking(false)
    }, delay)
  }, [game, difficulty])

  // Trigger AI move when it's AI's turn
  useEffect(() => {
    if (turn !== playerColor && !isGameOver && !isAIThinking) {
      makeAIMove()
    }
  }, [turn, isGameOver, isAIThinking, makeAIMove])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current)
    }
  }, [])

  // Handle square click (only allow when it's human's turn)
  const handleSquareClick = useCallback((square) => {
    if (isGameOver) return
    if (pendingPromotion) return
    if (turn !== playerColor) return // Block clicks during AI turn
    if (isAIThinking) return

    const piece = game.get(square)

    if (selectedSquare) {
      if (selectedSquare === square) {
        setSelectedSquare(null)
        return
      }

      if (piece && piece.color === turn) {
        setSelectedSquare(square)
        return
      }

      const validMoves = game.moves({ square: selectedSquare, verbose: true })
      const targetMove = validMoves.find(m => m.to === square)

      if (targetMove) {
        if (targetMove.flags.includes('p') || (targetMove.piece === 'p' && (square[1] === '8' || square[1] === '1'))) {
          setPendingPromotion({ from: selectedSquare, to: square })
          setSelectedSquare(null)
          return
        }

        const move = game.move({ from: selectedSquare, to: square })
        if (move) {
          playChessSound(move, game.inCheck())
          const newGame = new Chess(game.fen())
          setGame(newGame)
          setMoveHistory(prev => [...prev, move])
          setLastMove({ from: selectedSquare, to: square })
          setSelectedSquare(null)

          // HIRO reacts to human moves
          const comment = getHiroComment(newGame, move, difficulty)
          if (comment) setHiroMessage(comment)
          return
        }
      }

      setSelectedSquare(null)
      return
    }

    if (piece && piece.color === turn) {
      setSelectedSquare(square)
    }
  }, [game, selectedSquare, turn, isGameOver, pendingPromotion, isAIThinking, playerColor, difficulty])

  const handlePromotion = useCallback((promotionPiece) => {
    if (!pendingPromotion) return

    const move = game.move({
      from: pendingPromotion.from,
      to: pendingPromotion.to,
      promotion: promotionPiece,
    })

    if (move) {
      playChessSound(move, game.inCheck())
      const newGame = new Chess(game.fen())
      setGame(newGame)
      setMoveHistory(prev => [...prev, move])
      setLastMove({ from: pendingPromotion.from, to: pendingPromotion.to })
    }

    setPendingPromotion(null)
  }, [game, pendingPromotion])

  const undo = useCallback(() => {
    // Undo both AI move and human move
    const move1 = game.undo() // Undo AI move
    const move2 = game.undo() // Undo human move
    if (move1 || move2) {
      const newGame = new Chess(game.fen())
      setGame(newGame)
      setMoveHistory(prev => {
        const newHistory = prev.slice(0, -(move1 && move2 ? 2 : 1))
        if (newHistory.length > 0) {
          const last = newHistory[newHistory.length - 1]
          setLastMove({ from: last.from, to: last.to })
        } else {
          setLastMove(null)
        }
        return newHistory
      })
      setSelectedSquare(null)
      setHiroMessage("Taking it back? No worries, I won't judge 😉")
    }
  }, [game])

  const reset = useCallback(() => {
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current)
    const newGame = new Chess()
    setGame(newGame)
    setSelectedSquare(null)
    setMoveHistory([])
    setLastMove(null)
    setPendingPromotion(null)
    setIsAIThinking(false)
    setHiroMessage("New game! Let's go! Your move first ♟️")
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
    isAIThinking,
    hiroMessage,
    playerColor,
  }
}
