import { useState, useCallback, useMemo, useEffect } from 'react';
import { Chess } from 'chess.js';
import { db } from '../lib/firebase';
import { ref, onValue, set, get, push, serverTimestamp } from 'firebase/database';
import { useAuth } from '../contexts/AuthContext';

export default function useOnlineChessGame(matchId) {
  const { currentUser } = useAuth();
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [pendingPromotion, setPendingPromotion] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [playerColor, setPlayerColor] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);

  // Sync from Firebase
  useEffect(() => {
    if (!db || !matchId || !currentUser) return;
    
    const matchRef = ref(db, `matches/${matchId}`);
    const unsubscribe = onValue(matchRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      setMatchData(data);

      // Determine player color
      if (data.players?.w === currentUser.uid) setPlayerColor('w');
      else if (data.players?.b === currentUser.uid) setPlayerColor('b');
      else setPlayerColor('spectator');

      // Reconstruct game from history if provided, or FEN
      if (data.history) {
        const newGame = new Chess();
        const newHistory = [];
        data.history.forEach(moveStr => {
          const m = newGame.move(moveStr); // SAN move
          if (m) newHistory.push(m);
        });
        setGame(newGame);
        setMoveHistory(newHistory);
        if (data.lastMove) setLastMove(data.lastMove);
      } else if (data.fen && data.fen !== game.fen()) {
        setGame(new Chess(data.fen));
      }

      // Sync Chat
      if (data.chat) {
        const msgs = Object.values(data.chat).sort((a, b) => a.timestamp - b.timestamp);
        setChatMessages(msgs);
      }
    });

    return () => unsubscribe();
  }, [matchId, currentUser]);

  const board = useMemo(() => game.board(), [game]);
  const turn = game.turn();
  const inCheck = game.inCheck();
  const isCheckmate = game.isCheckmate();
  const isStalemate = game.isStalemate();
  const isDraw = game.isDraw();
  // Check both engine state and DB status to ensure game end is detected
  const isGameOver = game.isGameOver() || matchData?.status === 'finished';

  const kingInCheckSquare = useMemo(() => {
    if (!inCheck) return null;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'k' && piece.color === turn) {
          return piece.square;
        }
      }
    }
    return null;
  }, [inCheck, board, turn]);

  const getValidMoves = useCallback((square) => {
    // Only allow checking valid moves if it's our turn
    if (playerColor !== turn) return [];
    return game.moves({ square, verbose: true });
  }, [game, playerColor, turn]);

  const capturedPieces = useMemo(() => {
    const white = [];
    const black = [];
    for (const move of moveHistory) {
      if (move.captured) {
        if (move.color === 'w') {
          black.push({ type: move.captured, color: 'b' });
        } else {
          white.push({ type: move.captured, color: 'w' });
        }
      }
    }
    return { white, black };
  }, [moveHistory]);

  const syncMoveToFirebase = async (newGame, moveRecord, from, to) => {
    if (!db || !matchId) return;
    const matchRef = ref(db, `matches/${matchId}`);
    
    const snapshot = await get(matchRef);
    if (!snapshot.exists()) return;
    
    const currentData = snapshot.val();
    const currentHistory = currentData.history || [];
    currentHistory.push(moveRecord.san);

    await set(matchRef, {
      ...currentData,
      fen: newGame.fen(),
      history: currentHistory,
      lastMove: { from, to },
      status: newGame.isGameOver() ? 'finished' : 'playing'
    });
  };

  const handleSquareClick = useCallback((square) => {
    if (isGameOver) return;
    if (pendingPromotion) return;
    if (turn !== playerColor) return; // Not our turn

    const piece = game.get(square);

    if (selectedSquare) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        return;
      }

      if (piece && piece.color === turn) {
        setSelectedSquare(square);
        return;
      }

      const validMoves = game.moves({ square: selectedSquare, verbose: true });
      const targetMove = validMoves.find(m => m.to === square);

      if (targetMove) {
        if (targetMove.flags.includes('p') || (targetMove.piece === 'p' && (square[1] === '8' || square[1] === '1'))) {
          setPendingPromotion({ from: selectedSquare, to: square });
          setSelectedSquare(null);
          return;
        }

        const move = game.move({ from: selectedSquare, to: square });
        if (move) {
          const newGame = new Chess(game.fen()); // Create true clone to rerender
          setGame(newGame);
          setSelectedSquare(null);
          syncMoveToFirebase(newGame, move, selectedSquare, square);
          return;
        }
      }

      setSelectedSquare(null);
      return;
    }

    if (piece && piece.color === turn) {
      setSelectedSquare(square);
    }
  }, [game, selectedSquare, turn, isGameOver, pendingPromotion, playerColor, matchId]);

  const handlePromotion = useCallback((promotionPiece) => {
    if (!pendingPromotion) return;

    const move = game.move({
      from: pendingPromotion.from,
      to: pendingPromotion.to,
      promotion: promotionPiece,
    });

    if (move) {
      const newGame = new Chess(game.fen());
      setGame(newGame);
      syncMoveToFirebase(newGame, move, pendingPromotion.from, pendingPromotion.to);
    }

    setPendingPromotion(null);
  }, [game, pendingPromotion]);

  const sendChatMessage = async (text) => {
    if (!db || !matchId || !text.trim()) return;
    const chatRef = ref(db, `matches/${matchId}/chat`);
    const newMessageRef = push(chatRef);
    await set(newMessageRef, {
      senderId: currentUser.uid,
      senderName: currentUser.displayName || currentUser.email,
      text: text.trim(),
      timestamp: serverTimestamp()
    });
  };

  // Undo is disabled in multiplayer, unless both agree (too complex for MVP). 
  // We'll just provide a no-op to satisfy the interface.
  const undo = useCallback(() => {}, []);

  // Reset is also conceptually tricky in multiplayer, we'll provide a no-op or re-init logic.
  const reset = useCallback(async () => {
    if (!db || !matchId) return;
    const matchRef = ref(db, `matches/${matchId}`);
    
    const snapshot = await get(matchRef);
    if (!snapshot.exists()) return;
    const currentData = snapshot.val();
    
    await set(matchRef, {
      ...currentData,
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      history: [],
      lastMove: null,
      status: 'playing'
    });
  }, [matchId]);

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
    matchData,
    playerColor,
    chatMessages,
    sendChatMessage
  };
}
