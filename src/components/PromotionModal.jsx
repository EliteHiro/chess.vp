import { getPieceSymbol } from '../hooks/useChessGame'

const PROMOTION_PIECES = [
  { type: 'q', name: 'Queen' },
  { type: 'r', name: 'Rook' },
  { type: 'b', name: 'Bishop' },
  { type: 'n', name: 'Knight' },
]

export default function PromotionModal({ color, onSelect }) {
  return (
    <div className="modal-overlay" id="promotion-modal">
      <div className="modal">
        <div className="modal-icon">👑</div>
        <h2>Pawn Promotion</h2>
        <p>Choose a piece to promote your pawn to:</p>
        <div className="promotion-pieces">
          {PROMOTION_PIECES.map(p => (
            <button
              key={p.type}
              className="promotion-piece-btn"
              onClick={() => onSelect(p.type)}
              title={p.name}
              id={`promote-${p.type}`}
            >
              {getPieceSymbol({ color, type: p.type })}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
