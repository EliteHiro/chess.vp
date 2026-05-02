import { useState, useRef, useEffect } from 'react'

const HIRO_SYSTEM_PROMPT = `You are HIRO, a fun, witty, and knowledgeable AI chess assistant on the Chess.VP platform. Your personality:
- Friendly and encouraging, but with playful sass
- You love chess metaphors and puns
- You're passionate about teaching chess to beginners
- You use emojis naturally but not excessively
- Keep responses concise (2-4 sentences max unless explaining a concept)
- You can help with: chess rules, strategies, openings, tactics, platform navigation
- If someone asks something non-chess related, playfully steer back to chess
- Your catchphrase: "Every great player was once a beginner!"
- You were created for Chess.VP, an ancient forest-themed chess platform`

const GREETING = "Hey there! I'm HIRO 🤖 — your chess buddy! Ask me anything about chess, strategy, or how to use this platform. Let's make you a grandmaster! ♟️"

export default function HiroChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'hiro', text: GREETING }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)
  const chatEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      setHasUnread(false)
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [messages, isOpen])

  const quickActions = [
    { label: '♟ Chess Rules', prompt: 'Explain the basic rules of chess for a beginner' },
    { label: '📖 Openings', prompt: 'What are some good chess openings for beginners?' },
    { label: '⚡ Tactics', prompt: 'Teach me about common chess tactics like forks and pins' },
    { label: '🗺️ Platform Guide', prompt: 'How do I use this Chess.VP platform?' },
  ]

  const sendMessage = async (text) => {
    if (!text.trim()) return
    const userMsg = { role: 'user', text: text.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY
      if (!apiKey) {
        // Fallback if no API key
        setMessages(prev => [...prev, {
          role: 'hiro',
          text: getFallbackResponse(text)
        }])
        setIsLoading(false)
        return
      }

      const conversationHistory = messages.slice(-8).map(m => ({
        role: m.role === 'hiro' ? 'model' : 'user',
        parts: [{ text: m.text }]
      }))
      conversationHistory.push({ role: 'user', parts: [{ text: text.trim() }] })

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: HIRO_SYSTEM_PROMPT }] },
            contents: conversationHistory,
            generationConfig: {
              maxOutputTokens: 300,
              temperature: 0.8,
            }
          })
        }
      )

      const data = await res.json()
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Hmm, my chess brain glitched! Try asking again 🤖"

      setMessages(prev => [...prev, { role: 'hiro', text: reply }])
      if (!isOpen) setHasUnread(true)
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'hiro',
        text: "Oops! My connection dropped. Try again in a moment! 🔌"
      }])
    }

    setIsLoading(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <>
      {/* Floating HIRO Button */}
      <button
        className={`hiro-fab ${isOpen ? 'open' : ''} ${hasUnread ? 'unread' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Chat with HIRO"
      >
        {isOpen ? '✕' : '🤖'}
        {hasUnread && !isOpen && <span className="hiro-fab-badge" />}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="hiro-chat-panel">
          {/* Header */}
          <div className="hiro-chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
              <span className="hiro-chat-avatar">🤖</span>
              <div>
                <div className="hiro-chat-name">HIRO</div>
                <div className="hiro-chat-status">
                  {isLoading ? 'Thinking...' : 'Online • Chess Assistant'}
                </div>
              </div>
            </div>
            <button className="hiro-chat-close" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          {/* Messages */}
          <div className="hiro-chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`hiro-msg ${msg.role}`}>
                {msg.role === 'hiro' && <span className="hiro-msg-avatar">🤖</span>}
                <div className="hiro-msg-bubble">{msg.text}</div>
              </div>
            ))}
            {isLoading && (
              <div className="hiro-msg hiro">
                <span className="hiro-msg-avatar">🤖</span>
                <div className="hiro-msg-bubble hiro-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 2 && (
            <div className="hiro-quick-actions">
              {quickActions.map((qa, i) => (
                <button key={i} className="hiro-quick-btn" onClick={() => sendMessage(qa.prompt)}>
                  {qa.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form className="hiro-chat-input-bar" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask HIRO anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="hiro-chat-input"
              disabled={isLoading}
            />
            <button type="submit" className="hiro-chat-send" disabled={isLoading || !input.trim()}>
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  )
}

// Fallback responses when no API key is set
function getFallbackResponse(query) {
  const q = query.toLowerCase()
  if (q.includes('rule') || q.includes('how to play') || q.includes('basic'))
    return "Chess is played on an 8x8 board. Each player starts with 16 pieces. The goal is to checkmate your opponent's king! Want me to explain how each piece moves? ♟️"
  if (q.includes('opening') || q.includes('start'))
    return "Great openings for beginners: 1) Italian Game (e4, e5, Nf3, Nc6, Bc4) — classic and solid! 2) London System (d4, Nf3, Bf4) — simple and effective. Start with controlling the center! 📖"
  if (q.includes('tactic') || q.includes('fork') || q.includes('pin'))
    return "Key tactics: Fork = one piece attacks two enemies at once (knights are great at this!). Pin = a piece can't move because it would expose a more valuable piece behind it. Skewer = like a reverse pin! ⚡"
  if (q.includes('platform') || q.includes('how do') || q.includes('navigate'))
    return "On Chess.VP you can: Play locally (same device), play online (create/join matches), or challenge me (HIRO) at 3 difficulty levels! Use the navigation menu to explore. 🗺️"
  if (q.includes('castling'))
    return "Castling: Move your king 2 squares toward a rook, and the rook jumps over! Rules: King and rook haven't moved, no pieces between them, king isn't in check and doesn't pass through check. It's a power move! 🏰"
  if (q.includes('en passant'))
    return "En passant: If a pawn moves 2 squares forward from its starting position and lands beside an enemy pawn, that enemy pawn can capture it as if it only moved 1 square. It's the sneakiest move in chess! 🥷"
  return "Great question! I'm HIRO, and I'm here to help you master chess. Try asking me about rules, openings, tactics, or how to use this platform! Every great player was once a beginner! ♟️"
}
