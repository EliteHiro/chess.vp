export default function HowToPlay() {
  const steps = [
    {
      number: '01',
      title: 'Open the Board',
      description: 'Click "Play Now" to instantly launch a fresh chess board. No accounts, no waiting — just pure strategy.',
    },
    {
      number: '02',
      title: 'Share the Screen',
      description: 'Sit with a friend or rival. White moves first. Click a piece to see its valid moves highlighted on the board.',
    },
    {
      number: '03',
      title: 'Make Your Move',
      description: 'Click a highlighted square to move your piece. The board tracks every move, capture, and check automatically.',
    },
    {
      number: '04',
      title: 'Claim Victory',
      description: 'Deliver checkmate to win the game. Or use undo and new game options to keep the battles going.',
    },
  ]

  return (
    <section className="how-to-play" id="how-to-play">
      <h2 className="section-title">
        How to <span className="title-accent">Play</span>
      </h2>
      <div className="steps-container">
        {steps.map((step, i) => (
          <div className="step-item" key={i} id={`step-${i}`}>
            <div className="step-number">{step.number}</div>
            <div className="step-content">
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
