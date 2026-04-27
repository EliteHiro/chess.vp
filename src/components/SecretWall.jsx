import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function SecretWall() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(location.state?.authorized || false);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');

  const CORRECT_PASSWORD = 'ti_amo_terra';

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === CORRECT_PASSWORD) {
      setIsAuthorized(true);
      setError('');
    } else {
      setError('Incorrect password. The ancients reject you.');
      setPasswordInput('');
    }
  };

  // 1000+ words dummy text
  const longStory = `
In the beginning, before the concept of time had fully matured in the minds of mortals, there existed only the Great Board. It was not made of wood or stone, but of the very fabric of the cosmos, woven from starlight and the deep voids of space. The Ancients, beings of pure thought and unfathomable power, stood on opposite sides of this boundless expanse. They were the architects of reality, and their conflict was not one of bloodshed or destruction, but of profound intellectual supremacy.

The First Move was said to have ignited the stars. When the White King's pawn advanced, it set the galaxies spinning, dictating the laws of motion and gravity. In response, the Black Queen's knight leapt across the cosmic ether, its path tracing the orbits of newborn planets, establishing entropy and the inevitability of decay. The game they played was a silent conversation, a debate where the arguments were celestial bodies and the conclusion was the fate of existence itself.

For eons, they played. Entire civilizations rose and fell in the span of a single turn. The mortals who eventually populated the worlds were unaware that their lives were but the trembling vibrations of a knight striking a bishop, or the desperate flight of a king cornered in a cosmic mate. The scholars who dared to study the movements of the stars occasionally caught glimpses of the Great Board. They called it astronomy, astrology, or divine providence, failing to grasp the rigid, inescapable logic of the sixty-four squares that governed them.

Legend speaks of the Golden Era, a time when the board was balanced, and the pieces moved with a harmonious grace. The White and Black armies mirrored each other perfectly, an intricate dance of light and shadow. But then came the Cataclysmic Sacrifice. The White Queen, in a move of unprecedented audacity, cast herself into the void to secure a perilous advantage. Her fall shattered a hundred constellations and plunged half the universe into an eternal twilight. The Black King, reeling from the blow, retreated into the deepest abyss, surrounded by his remaining defenders, plotting a slow, meticulous revenge.

This ancient wall upon which you read these words is a fragment of that very board. It fell from the heavens during the Great Clash, striking the earth with the force of a thousand suns. The runes carved into its surface are not the work of human hands, but the residual energy of the moves played by the Ancients. To read them is to peer into the mind of gods, to understand the brutal mathematics that dictate life and death, triumph and ruin.

As you stand here, winner of your own mortal contest, know that your victory is but an echo of the eternal struggle. You have mastered the crude wooden pieces, the limited geometry of a board bounded by earthly dimensions. But the true game continues above you, silent and unending.

The text goes on, repeating the ancient lore to ensure the sheer volume of the knowledge overwhelms the mortal mind. In the beginning, before the concept of time had fully matured in the minds of mortals, there existed only the Great Board. It was not made of wood or stone, but of the very fabric of the cosmos, woven from starlight and the deep voids of space. The Ancients, beings of pure thought and unfathomable power, stood on opposite sides of this boundless expanse. They were the architects of reality, and their conflict was not one of bloodshed or destruction, but of profound intellectual supremacy.

The First Move was said to have ignited the stars. When the White King's pawn advanced, it set the galaxies spinning, dictating the laws of motion and gravity. In response, the Black Queen's knight leapt across the cosmic ether, its path tracing the orbits of newborn planets, establishing entropy and the inevitability of decay. The game they played was a silent conversation, a debate where the arguments were celestial bodies and the conclusion was the fate of existence itself.

For eons, they played. Entire civilizations rose and fell in the span of a single turn. The mortals who eventually populated the worlds were unaware that their lives were but the trembling vibrations of a knight striking a bishop, or the desperate flight of a king cornered in a cosmic mate. The scholars who dared to study the movements of the stars occasionally caught glimpses of the Great Board. They called it astronomy, astrology, or divine providence, failing to grasp the rigid, inescapable logic of the sixty-four squares that governed them.

Legend speaks of the Golden Era, a time when the board was balanced, and the pieces moved with a harmonious grace. The White and Black armies mirrored each other perfectly, an intricate dance of light and shadow. But then came the Cataclysmic Sacrifice. The White Queen, in a move of unprecedented audacity, cast herself into the void to secure a perilous advantage. Her fall shattered a hundred constellations and plunged half the universe into an eternal twilight. The Black King, reeling from the blow, retreated into the deepest abyss, surrounded by his remaining defenders, plotting a slow, meticulous revenge.

This ancient wall upon which you read these words is a fragment of that very board. It fell from the heavens during the Great Clash, striking the earth with the force of a thousand suns. The runes carved into its surface are not the work of human hands, but the residual energy of the moves played by the Ancients. To read them is to peer into the mind of gods, to understand the brutal mathematics that dictate life and death, triumph and ruin.

As you stand here, winner of your own mortal contest, know that your victory is but an echo of the eternal struggle. You have mastered the crude wooden pieces, the limited geometry of a board bounded by earthly dimensions. But the true game continues above you, silent and unending.

(The inscriptions continue deeper into the stone...)
In the beginning, before the concept of time had fully matured in the minds of mortals, there existed only the Great Board. It was not made of wood or stone, but of the very fabric of the cosmos, woven from starlight and the deep voids of space. The Ancients, beings of pure thought and unfathomable power, stood on opposite sides of this boundless expanse. They were the architects of reality, and their conflict was not one of bloodshed or destruction, but of profound intellectual supremacy.

The First Move was said to have ignited the stars. When the White King's pawn advanced, it set the galaxies spinning, dictating the laws of motion and gravity. In response, the Black Queen's knight leapt across the cosmic ether, its path tracing the orbits of newborn planets, establishing entropy and the inevitability of decay. The game they played was a silent conversation, a debate where the arguments were celestial bodies and the conclusion was the fate of existence itself.

For eons, they played. Entire civilizations rose and fell in the span of a single turn. The mortals who eventually populated the worlds were unaware that their lives were but the trembling vibrations of a knight striking a bishop, or the desperate flight of a king cornered in a cosmic mate. The scholars who dared to study the movements of the stars occasionally caught glimpses of the Great Board. They called it astronomy, astrology, or divine providence, failing to grasp the rigid, inescapable logic of the sixty-four squares that governed them.

Legend speaks of the Golden Era, a time when the board was balanced, and the pieces moved with a harmonious grace. The White and Black armies mirrored each other perfectly, an intricate dance of light and shadow. But then came the Cataclysmic Sacrifice. The White Queen, in a move of unprecedented audacity, cast herself into the void to secure a perilous advantage. Her fall shattered a hundred constellations and plunged half the universe into an eternal twilight. The Black King, reeling from the blow, retreated into the deepest abyss, surrounded by his remaining defenders, plotting a slow, meticulous revenge.

This ancient wall upon which you read these words is a fragment of that very board. It fell from the heavens during the Great Clash, striking the earth with the force of a thousand suns. The runes carved into its surface are not the work of human hands, but the residual energy of the moves played by the Ancients. To read them is to peer into the mind of gods, to understand the brutal mathematics that dictate life and death, triumph and ruin.

As you stand here, winner of your own mortal contest, know that your victory is but an echo of the eternal struggle. You have mastered the crude wooden pieces, the limited geometry of a board bounded by earthly dimensions. But the true game continues above you, silent and unending.
  `;

  if (!isAuthorized) {
    return (
      <div className="secret-password-container">
        <button onClick={() => navigate('/')} className="back-btn">← Back</button>
        <div className="password-box">
          <h1 className="password-title">The Ancient Vault</h1>
          <p className="password-subtitle">Only those who hold the key, or have proven their worth in battle, may enter.</p>
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              placeholder="Speak the words..."
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="password-input"
            />
            {error && <div className="password-error">{error}</div>}
            <button type="submit" className="btn btn-primary password-submit-btn">Unlock</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="secret-wall-container">
      <button onClick={() => navigate('/')} className="back-btn wall-back-btn">← Return to the Mortal Realm</button>
      
      <div className="ancient-wall">
        <div className="carved-text">
          <h1 className="wall-title">The Chronicles of the Great Board</h1>
          
          {longStory.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="wall-paragraph">{paragraph}</p>
          ))}
          
        </div>
      </div>
    </div>
  );
}
