import { useEffect, useRef, useState } from 'react'
import './App.css'
import type { Conversation, Message } from './types'

function uid() {
  return Date.now() + Math.random()
}

const suggestions = [
  { icon: '✦', title: 'Find a new hobby', description: 'Creative ideas to try in your free time', prompt: 'Suggest a creative hobby for me based on my interests.' },
  { icon: '☀', title: 'Plan my weekend', description: 'Make my next two days more fun', prompt: 'Give me a fun weekend activity I can do.' },
  { icon: '↗', title: 'Get out of a rut', description: 'Fresh inspiration for an ordinary day', prompt: 'What are some interesting things I can do in my free time?' },
]

function App() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [search, setSearch] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  const activeConversation = conversations.find((conversation) => conversation.id === activeConversationId)
  const filteredConversations = conversations.filter((conversation) =>
    conversation.title.toLowerCase().includes(search.toLowerCase()),
  )

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [conversations, activeConversationId])

  function startNewChat() {
    setActiveConversationId(null)
    setMessageInput('')
    setSidebarOpen(false)
    inputRef.current?.focus()
  }

  function handleSend(textOverride?: string) {
    const text = (textOverride ?? messageInput).trim()
    if (!text) return
    const now = new Date().toISOString()
    const conversationId = activeConversationId ?? uid()
    const message: Message = { id: uid(), text, datetime: now, sender: { name: 'user' } }
    const assistantMessage: Message = {
      id: uid(),
      text: 'Let’s make some room for creativity. Start small, choose something that sounds enjoyable rather than perfect, and give it 20 minutes. You could try sketching an everyday object, taking a photo walk, learning a simple recipe, or making a playlist around a theme. The best activity is one you’re curious enough to try.',
      datetime: now,
      sender: { name: 'assistant' },
    }

    setConversations((previous) => {
      const existing = previous.find((conversation) => conversation.id === conversationId)
      if (existing) {
        return previous.map((conversation) => conversation.id === conversationId
          ? { ...conversation, messages: [...conversation.messages, message, assistantMessage], last_update: now }
          : conversation)
      }
      return [...previous, {
        id: conversationId,
        title: text.length > 34 ? `${text.slice(0, 34)}…` : text,
        messages: [message, assistantMessage],
        last_update: now,
      }]
    })
    setActiveConversationId(conversationId)
    setMessageInput('')
    setSidebarOpen(false)
  }

  function deleteConversation(id: number) {
    setConversations((previous) => previous.filter((conversation) => conversation.id !== id))
    if (activeConversationId === id) setActiveConversationId(null)
  }

  return (
    <div className="app-shell">
      {sidebarOpen && <button className="sidebar-scrim" aria-label="Close menu" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-row">
          <div className="brand-mark" aria-hidden="true"><span>✦</span></div>
          <div className="brand-copy"><span className="brand-name">ChatWeb</span><span className="brand-tagline">CREATIVE SPACE</span></div>
          <button className="icon-button sidebar-close" aria-label="Close sidebar" onClick={() => setSidebarOpen(false)}>×</button>
        </div>

        <button className="new-chat-button" onClick={startNewChat}><span className="plus-icon">＋</span> New conversation <span className="shortcut">⌘ K</span></button>

        <label className="search-box">
          <span aria-hidden="true">⌕</span>
          <input aria-label="Search conversations" placeholder="Search conversations" value={search} onChange={(event) => setSearch(event.target.value)} />
          <kbd>⌘ F</kbd>
        </label>

        <div className="history-heading"><span>YOUR CHATS</span><span className="history-count">{conversations.length}</span></div>
        <nav className="conversation-list" aria-label="Conversation history">
          {filteredConversations.length ? filteredConversations.slice().reverse().map((conversation) => (
            <div key={conversation.id} className={`conversation-item ${conversation.id === activeConversationId ? 'active' : ''}`}>
              <button className="conversation-select" onClick={() => { setActiveConversationId(conversation.id); setSidebarOpen(false) }}>
                <span className="conversation-icon">◌</span><span className="conversation-title">{conversation.title}</span>
              </button>
              <button className="delete-chat" aria-label={`Delete ${conversation.title}`} title="Delete conversation" onClick={() => deleteConversation(conversation.id)}>×</button>
            </div>
          )) : <p className="empty-history">{search ? 'No matching conversations.' : 'Your conversations will appear here.'}</p>}
        </nav>

        <div className="sidebar-bottom">
          <div className="tip-card"><span className="tip-sparkle">✧</span><p><strong>A little inspiration</strong><br />Great ideas start with curiosity.</p></div>
          <div className="profile-row"><div className="profile-avatar">A</div><div className="profile-copy"><strong>Creative explorer</strong><span>Free workspace</span></div><button className="icon-button profile-menu" aria-label="Profile options">•••</button></div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="topbar-left"><button className="icon-button mobile-menu" aria-label="Open sidebar" onClick={() => setSidebarOpen(true)}>☰</button><div><div className="eyebrow">YOUR PERSONAL CREATIVE GUIDE</div><h1>{activeConversation?.title ?? 'Your Creative Teacher'}</h1></div></div>
          <div className="topbar-actions"><span className="status-pill"><span className="status-dot" /> Ready to explore</span><button className="top-new-chat" onClick={startNewChat}>＋ <span>New chat</span></button></div>
        </header>

        {activeConversation ? (
          <section className="messages" aria-label="Conversation messages">
            <div className="conversation-intro"><span className="date-label">YOUR CONVERSATION</span><p>Every great idea begins with a question.</p></div>
            {activeConversation.messages.map((message) => (
              <article key={message.id} className={`message-row ${message.sender.name === 'user' ? 'user-row' : 'assistant-row'}`}>
                {message.sender.name === 'assistant' && <div className="assistant-avatar">✦</div>}
                <div className={`message-content ${message.sender.name === 'user' ? 'user-message' : 'assistant-message'}`}>
                  {message.sender.name === 'assistant' && <div className="message-author">CREATIVE TEACHER <span>·</span> JUST NOW</div>}
                  <p>{message.text}</p>
                </div>
                {message.sender.name === 'user' && <div className="user-avatar">A</div>}
              </article>
            ))}
            <div ref={messagesEndRef} />
          </section>
        ) : (
          <section className="welcome-screen">
            <h2>Make room for<br /><em>something wonderful.</em></h2>
            <p className="welcome-description">A little curiosity can lead somewhere amazing.<br className="desktop-break" /> What would you like to explore today?</p>
            <div className="suggestion-grid">
              {suggestions.map((suggestion) => <button className="suggestion-card" key={suggestion.title} onClick={() => { setMessageInput(suggestion.prompt); inputRef.current?.focus() }}>
                <span className="suggestion-icon">{suggestion.icon}</span><span className="suggestion-title">{suggestion.title}</span><span className="suggestion-description">{suggestion.description}</span><span className="suggestion-arrow">↗</span>
              </button>)}
            </div>
            <div className="inspiration-note"><span>✧</span> No pressure to be productive. Just follow your curiosity.</div>
          </section>
        )}

        <div className="composer-wrap">
          <form className="chat-composer" onSubmit={(event) => { event.preventDefault(); handleSend() }}>
            <textarea ref={inputRef} aria-label="Message your creative teacher" placeholder="Ask me anything, or share what's on your mind..." value={messageInput} rows={1} onChange={(event) => setMessageInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); handleSend() } }} />
            <div className="composer-footer"><span className="composer-hint"><kbd>↵</kbd> to send <span className="hint-divider">·</span> <kbd>⇧ ↵</kbd> for a new line</span><button className="send-button" type="submit" disabled={!messageInput.trim()} aria-label="Send message"><span>Send message</span><b>↗</b></button></div>
          </form>
          <p className="composer-disclaimer">Your next great idea might be one message away.</p>
        </div>
      </main>
    </div>
  )
}

export default App
