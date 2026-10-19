import { useEffect, useRef, useState } from 'react'
import './App.css'
import type { Conversation, Message } from './types'

function uid() {
  return Date.now() + Math.random()
}

function App() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null)

  // Stores whatever the user currently types
  const [messageInput, setMessageInput] = useState('')

  const messagesEndRef = useRef<HTMLDivElement | null>(null)

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({
    behavior: 'smooth',
    block: 'end',
  })
}, [conversations, activeConversationId])

  function handleSend(): void {
    // 1. Read the current input and remove extra whitespace
    const text = messageInput.trim()

    // 2. Don't send an empty message
    if (!text) return
    const now = new Date().toISOString()
    const conversationId = activeConversationId ?? uid()

    // 3. Create a message using the input value
    const message: Message = {
      id: uid(),
      text,
      datetime: now,
      sender: { name: 'user' },
    }

    const assistantMessage: Message = {
      id: uid(),
      text: 'This is a placeholder response from the assistant.',
      datetime: now,
      sender: { name: 'assistant' },
    }


    // 4. Update the conversation history
    setConversations((prev) => {
      const existingConversation = prev.find(
        (conversations) => conversations.id === conversationId,
      )

      if (existingConversation) {
        return prev.map((conversations) =>
          conversations.id === conversationId
            ? {
              ...conversations,
              messages: [...conversations.messages, message, assistantMessage],
              last_update: now,
            }
            : conversations,
        )
      }

      return [
        ...prev,
        {
          id: conversationId,
          title: text.slice(0, 30),
          messages: [message, assistantMessage],
          last_update: now,
        },
      ]
    })

    // 5. Select the conversation we just created or updated
    setActiveConversationId(conversationId)

    // 6. Clear the textarea
    setMessageInput('')
  }



  return (
    <>
      <div className="app">
        <aside className="sidebar">
          <h1 className="sidebar-title">Chat App</h1>
          <button className="new-chat-button" onClick={() => {
            setActiveConversationId(null)
          }}>
            Add new Chat
          </button>
          <p className="conversation-list-title">Conversations</p>
          <ul className="conversation-list">
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <li
                  key={conversation.id}
                  className={`conversation-item ${conversation.id === activeConversationId ? 'active' : ''}`}
                  onClick={() => setActiveConversationId(conversation.id)}
                >{conversation.title}</li>



              ))
            ) : (
              <li className="empty-history">no conversations yet</li>
            )}
          </ul>
        </aside>
        <main className="main-content">
          {activeConversationId === null ? (
    <section className="welcome-screen">
      <h1 className="welcome-title">Your Creative Teacher</h1>

      <p className="welcome-description">
        Discover hobbies, creative activities, and new ways to enjoy
        your free time.
      </p>

      <div className="prompt-buttons">
        {[
          'Suggest a creative hobby for me',
          'What can I do in my free time?',
          'Give me a fun weekend activity',
        ].map((prompt) => (
          <button
            key={prompt}
            className="prompt-button"
            onClick={() => setMessageInput(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>
    </section>
  ) : (
    <section className="messages">
      {conversations
        .find((conversation) => conversation.id === activeConversationId)
        ?.messages.map((message) => (
          <div
            key={message.id}
            className={`message message-${message.sender.name}`}
          >
            <p>{message.text}</p>
          </div>
        ))}
          <div ref={messagesEndRef} />

    </section>
  )}
 <form
  className="chat-composer"
  onSubmit={(event) => {
    event.preventDefault()
    handleSend()
  }}
>


            <textarea
              id="message-input"
              placeholder="Type your message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        handleSend()
      }
    }}
            />

            <button onClick={handleSend}>Send</button>
        
           </form>
        </main>

      </div>
     
    </>
  )
}


export default App
