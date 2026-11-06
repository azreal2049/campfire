import { useEffect, useState } from 'react'
import { Bot, X, Send, Sparkles } from 'lucide-react'

export function GlobalAIBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    { sender: 'ai', text: 'Hello! I am your Campfire AI Copilot. Ask me anything about your active room, code, or study notes.' },
  ])

  useEffect(() => {
    const handler = () => setIsOpen(true)
    window.addEventListener('campfire-ai-open', handler)
    return () => window.removeEventListener('campfire-ai-open', handler)
  }, [])

  function handleSend() {
    if (!input.trim()) return
    const text = input.trim()
    setMessages((prev) => [...prev, { sender: 'user', text }])
    setInput('')
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Got it! Running context analysis for: "${text}". I can help generate notes, explain doubt steps, or scaffold code into your Vault.`,
        },
      ])
    }, 600)
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        className="fixed bottom-12 right-6 z-50 flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-600/90 px-4 py-2.5 text-xs font-semibold text-white shadow-xl backdrop-blur-md transition hover:bg-violet-500 active:scale-95"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bot className="h-4 w-4" />
        🤖 AI Bot
      </button>

      {/* Drawer / Drawer card */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[480px] w-80 flex-col rounded-2xl border border-white/10 bg-[#0d0d11] shadow-2xl backdrop-blur-xl sm:w-96">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Sparkles className="h-4 w-4 text-violet-400" />
              Campfire AI Assistant
            </div>
            <button
              className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3.5 py-2 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-violet-600 text-white'
                      : 'border border-white/10 bg-white/[0.04] text-zinc-200'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 p-3">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
              <input
                className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-zinc-600"
                placeholder="Ask AI bot..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend()
                }}
              />
              <button
                className="rounded-lg bg-violet-600 p-1.5 text-white transition hover:bg-violet-500"
                onClick={handleSend}
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
