export default function FeaturesSection() {
  const features = [
    {
      icon: '♟️',
      title: 'Classic Chess',
      description: 'Full implementation of standard chess rules including castling, en passant, and pawn promotion. Every move validated in real-time.',
    },
    {
      icon: '⚔️',
      title: 'Two-Player Duels',
      description: 'Challenge a friend on the same screen. Take turns, strategize, and discover who is the ultimate chess master.',
    },
    {
      icon: '🎨',
      title: 'Elegant Design',
      description: 'A stunning visual experience with smooth animations, premium aesthetics, and an immersive dark theme crafted for focus.',
    },
    {
      icon: '📜',
      title: 'Move History',
      description: 'Track every move with algebraic notation. Review the game flow and learn from each strategic decision.',
    },
    {
      icon: '⚡',
      title: 'Instant Play',
      description: 'No sign-up required. No downloads needed. Jump straight into a game and start playing within seconds.',
    },
    {
      icon: '🤖',
      title: 'HIRO AI',
      description: 'Meet HIRO — your AI chess buddy! Play against three difficulty levels and chat with HIRO to learn chess strategies.',
    },
  ]

  return (
    <section className="features-section" id="features">
      <h2 className="section-title">
        Why <span className="title-accent">Chess.VP</span>
      </h2>
      <div className="features-grid">
        {features.map((feature, i) => (
          <div className="feature-card" key={i} id={`feature-card-${i}`}>
            <span className="feature-icon">{feature.icon}</span>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
