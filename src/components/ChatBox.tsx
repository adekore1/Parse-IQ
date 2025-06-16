// src/components/ChatBox.tsx
'use client'

import { Assistant } from 'openai/resources/beta/assistants.mjs'
import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

interface ChatCardProps{ 
  path?:string , 
  content? : string,
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}
type Message = {sender: 'user' | 'assistant'; text: string}

export default function ChatBox({path, content, messages, setMessages}: ChatCardProps) {
    //  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]   = useState<string | null>(null)
  const [input, setInput]   = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  // scroll to bottom on new message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async() => {
    if(!input.trim()){return}
    const usermessage = input.trim();
    setMessages(m => [...m, {sender: 'user', text: usermessage}])
    setInput('')
    setLoading(true)
    setError(null)

    try{
    const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({content,path, question: usermessage}),
    })

    const data = await response.json()
    if (!response.ok){ throw new Error(data.error || response.statusText)}
    setMessages(m => [...m, {sender: 'assistant', text: data.answer}])

    } catch(e:any) {
        console.error('Ask failed', e)
        setError(e.message)
    } finally {
        setLoading(false)
    }

  }



  return (
    <div className="flex flex-col max-h-80 border rounded bg-white">
      {/* Chat messages (scrollable) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.sender === 'user'? 'text-right': 'text-left'}
          >
            <div
              className={
                (m.sender === 'user'
                  ? 'inline-block bg-blue-100 text-blue-900'
                  : 'inline-block bg-gray-100 text-gray-900') +
                ' px-3 py-2 rounded'
              }
            >
              <ReactMarkdown>
                {m.text}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Error message (optional) */}
      {error && (
        <p className="text-red-500 text-sm px-4 pb-1">Error: {error}</p>
      )}

      {/* Input area (fixed at bottom) */}
      <div className="flex p-4 border-t space-x-2">
        <textarea
          className="flex-1 border rounded p-2 resize-none"
          rows={2}
          placeholder="Ask a question about this file…"
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          onClick={send}
          disabled={loading || !input.trim()}
        >
          {loading ? '…' : 'Send'}
        </button>
      </div>
    </div>
  )
}