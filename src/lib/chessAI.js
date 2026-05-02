import { Chess } from 'chess.js';

// Piece values for material evaluation
const PIECE_VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

// Piece-square tables (from white's perspective, flipped for black)
const PST = {
  p: [
     0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
     5,  5, 10, 25, 25, 10,  5,  5,
     0,  0,  0, 20, 20,  0,  0,  0,
     5, -5,-10,  0,  0,-10, -5,  5,
     5, 10, 10,-20,-20, 10, 10,  5,
     0,  0,  0,  0,  0,  0,  0,  0,
  ],
  n: [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50,
  ],
  b: [
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0,  5, 10, 10,  5,  0,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -20,-10,-10,-10,-10,-10,-10,-20,
  ],
  r: [
     0,  0,  0,  0,  0,  0,  0,  0,
     5, 10, 10, 10, 10, 10, 10,  5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
     0,  0,  0,  5,  5,  0,  0,  0,
  ],
  q: [
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
     -5,  0,  5,  5,  5,  5,  0, -5,
      0,  0,  5,  5,  5,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20,
  ],
  k: [
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -10,-20,-20,-20,-20,-20,-20,-10,
     20, 20,  0,  0,  0,  0, 20, 20,
     20, 30, 10,  0,  0, 10, 30, 20,
  ],
};

// Get PST value for a piece at a position
function getPSTValue(piece, square) {
  const file = square.charCodeAt(0) - 97; // a=0, h=7
  const rank = parseInt(square[1]) - 1;   // 1=0, 8=7
  const index = piece.color === 'w'
    ? (7 - rank) * 8 + file
    : rank * 8 + file;
  return PST[piece.type]?.[index] || 0;
}

// Evaluate board position (positive = white advantage)
function evaluate(game) {
  if (game.isCheckmate()) {
    return game.turn() === 'w' ? -99999 : 99999;
  }
  if (game.isDraw() || game.isStalemate()) return 0;

  let score = 0;
  const board = game.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const value = PIECE_VALUES[piece.type] + getPSTValue(piece, piece.square);
      score += piece.color === 'w' ? value : -value;
    }
  }

  // Mobility bonus
  const moves = game.moves().length;
  score += game.turn() === 'w' ? moves * 2 : -moves * 2;

  return score;
}

// Minimax with alpha-beta pruning
function minimax(game, depth, alpha, beta, isMaximizing) {
  if (depth === 0 || game.isGameOver()) {
    return evaluate(game);
  }

  const moves = game.moves();

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const eval_ = minimax(game, depth - 1, alpha, beta, false);
      game.undo();
      maxEval = Math.max(maxEval, eval_);
      alpha = Math.max(alpha, eval_);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move);
      const eval_ = minimax(game, depth - 1, alpha, beta, true);
      game.undo();
      minEval = Math.min(minEval, eval_);
      beta = Math.min(beta, eval_);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

// Get AI move based on difficulty
export function getAIMove(fen, difficulty = 'medium') {
  const game = new Chess(fen);
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return null;

  const isWhite = game.turn() === 'w';

  switch (difficulty) {
    case 'easy': {
      // Depth 1 with 40% random chance
      if (Math.random() < 0.4) {
        return moves[Math.floor(Math.random() * moves.length)];
      }
      let bestMove = moves[0];
      let bestEval = isWhite ? -Infinity : Infinity;
      for (const move of moves) {
        game.move(move.san);
        const eval_ = evaluate(game);
        game.undo();
        if (isWhite ? eval_ > bestEval : eval_ < bestEval) {
          bestEval = eval_;
          bestMove = move;
        }
      }
      return bestMove;
    }

    case 'medium': {
      // Depth 3 minimax
      let bestMove = moves[0];
      let bestEval = isWhite ? -Infinity : Infinity;
      for (const move of moves) {
        game.move(move.san);
        const eval_ = minimax(game, 2, -Infinity, Infinity, isWhite);
        game.undo();
        if (isWhite ? eval_ > bestEval : eval_ < bestEval) {
          bestEval = eval_;
          bestMove = move;
        }
      }
      return bestMove;
    }

    case 'hard': {
      // Depth 4 minimax with alpha-beta
      let bestMove = moves[0];
      let bestEval = isWhite ? -Infinity : Infinity;
      for (const move of moves) {
        game.move(move.san);
        const eval_ = minimax(game, 3, -Infinity, Infinity, isWhite);
        game.undo();
        if (isWhite ? eval_ > bestEval : eval_ < bestEval) {
          bestEval = eval_;
          bestMove = move;
        }
      }
      return bestMove;
    }

    default:
      return moves[Math.floor(Math.random() * moves.length)];
  }
}

// HIRO personality comments based on game state
export function getHiroComment(game, lastMove, difficulty) {
  if (!game || !lastMove) return null;

  const comments = {
    checkmate_win: [
      "Checkmate! 🏆 GG, you absolute legend!",
      "CHECKMATE! You just crushed it! I'm actually impressed 👏",
      "And that's mate! You played like a grandmaster! 🎉",
    ],
    checkmate_lose: [
      "Checkmate! Better luck next time, friend! 😈",
      "And THAT'S how it's done! Don't worry, even the best lose sometimes 💪",
      "Checkmate! I may be an AI, but that felt personal 😎",
    ],
    check: [
      "Check! Watch your king! 👀",
      "Ooh, that's a check! Things are heating up 🔥",
      "Check! The pressure is ON!",
    ],
    capture: [
      "Piece taken! The board is getting lighter 😏",
      "Nice capture! Or was it? 🤔",
      "Om nom nom... piece captured! 🍽️",
    ],
    good_move: [
      "Solid move! I see you've been studying 📚",
      "Not bad at all! 👌",
      "Interesting... I didn't expect that one 🧐",
    ],
    opening: [
      "Classic opening! Let's see where this goes...",
      "Good start! The real battle begins now ⚔️",
      "Ah, I know this one! Let's dance 💃",
    ],
    thinking: [
      "Hmm, let me think about this one... 🤔",
      "Processing... just kidding, I'm thinking! 💭",
      "This position is spicy... give me a sec 🌶️",
    ],
  };

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  if (game.isCheckmate()) {
    // Determine who won based on whose turn it is (the one whose turn it is lost)
    const humanLost = game.turn() === 'w'; // AI plays black typically
    return humanLost ? pick(comments.checkmate_lose) : pick(comments.checkmate_win);
  }

  if (game.inCheck()) return pick(comments.check);
  if (lastMove?.captured) return pick(comments.capture);
  if (game.moveNumber() <= 4) return pick(comments.opening);

  // 30% chance of commenting on a regular move
  if (Math.random() < 0.3) return pick(comments.good_move);

  return null;
}
