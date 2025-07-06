'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

interface ChatCardProps {
  path?: string
  content?: string
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
}

type Message = { sender: 'user' | 'assistant'; text: string }

export default function ChatBox({ path, content, messages, setMessages }: ChatCardProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim()) return
    const usermessage = input.trim()
    setMessages((m) => [...m, { sender: 'user', text: usermessage }])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, path, question: usermessage }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || response.statusText)
      setMessages((m) => [...m, { sender: 'assistant', text: data.answer }])
    } catch (e: unknown) {
      console.error('Ask failed', e)
      if (e instanceof Error) {
        setError(e.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col max-h-[70vh] border border-[#2a2a2a] rounded bg-[#1f1f24] text-gray-200">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={m.sender === 'user' ? 'text-right' : 'text-left'}>
            <div
              className={`inline-block px-4 py-2 rounded-lg max-w-[85%] text-sm ${
                m.sender === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-[#2a2a2a] text-gray-200'
              }`}
            >
              <ReactMarkdown>{m.text}</ReactMarkdown>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Error display */}
      {error && (
        <p className="text-red-400 text-sm px-4 pb-1">Error: {error}</p>
      )}

      {/* Input field */}
      <div className="flex p-4 border-t border-[#2a2a2a] gap-2">
        <textarea
          className="flex-1 bg-[#2e2e33] text-sm text-gray-200 rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
          rows={2}
          placeholder="Ask a question about this file…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
          onClick={send}
          disabled={loading || !input.trim()}
        >
          {loading ? '…' : 'Send'}
        </button>
      </div>
    </div>
  )
}
