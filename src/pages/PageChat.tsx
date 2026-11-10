import { useState } from 'react'
import { Hash, Send, Smile, Paperclip, Search } from 'lucide-react'

interface Message {
  id: string
  author: string
  avatar: string
  content: string
  timestamp: string
}

const MESSAGES: Message[] = [
  {
    id: '1',
    author: 'Nova',
    avatar: 'N',
    content: 'Hey everyone! Working on the sliding window algorithm. Anyone around to review?',
    timestamp: 'Today at 10:42 AM',
  },
  {
    id: '2',
    author: 'Kai',
    avatar: 'K',
    content: 'Yeah drop your O(n) deque solution in the dev-rig channel!',
    timestamp: 'Today at 10:44 AM',
  },
  {
    id: '3',
    author: 'Rhea',
    avatar: 'R',
    content: 'Brown noise is playing in my headphones. Locking in 🔥',
    timestamp: 'Today at 10:45 AM',
  },
]

export function PageChat() {
  const [messages, setMessages] = useState<Message[]>(MESSAGES)
  const [inputVal, setInputVal] = useState('')

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputVal.trim()) return
    setMessages([
      ...messages,
      {
        id: String(Date.now()),
        author: 'You',
        avatar: 'Y',
        content: inputVal.trim(),
        timestamp: 'Just now',
      },
    ])
    setInputVal('')
  }

  return (
    <div className="flex h-[calc(100vh-48px)] w-full bg-[#313338] text-[#dbdee1] overflow-hidden">
      {/* Chat Header */}
      <div className="flex h-12 items-center justify-between border-b border-[#1f2023] px-4 shadow-sm bg-[#313338]">
        <div className="flex items-center gap-2">
          <Hash className="h-5 w-5 text-[#80848e]" />
          <span className="font-semibold text-white">general-chat</span>
          <span className="text-xs text-[#949ba4] border-l border-[#404249] pl-3 ml-3 truncate">
            Welcome to the official Campfire study & dev channel.
          </span>
        </div>
        <div className="flex items-center gap-4 text-[#b5bac1]">
          <button className="hover:text-white transition"><Search className="h-5 w-5" /></button>
        </div>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <div className="border-b border-[#3f4147] pb-4 mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#404249] text-3xl mb-3">
            #
          </div>
          <h1 className="text-3xl font-bold text-white">Welcome to #general-chat!</h1>
          <p className="text-sm text-[#949ba4] mt-1">This is the start of the #general-chat channel.</p>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-4 group hover:bg-[#2e3035] -mx-4 px-4 py-1 rounded transition">
            <div className="h-10 w-10 rounded-full bg-[#5865f2] flex items-center justify-center font-bold text-white shrink-0 mt-0.5">
              {msg.avatar}
            </div>
            <div className="flex-1 leading-relaxed">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-white hover:underline cursor-pointer">
                  {msg.author}
                </span>
                <span className="text-[11px] text-[#949ba4]">{msg.timestamp}</span>
              </div>
              <p className="text-sm text-[#dbdee1]">{msg.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input Box */}
      <div className="p-4 bg-[#313338]">
        <form onSubmit={handleSend} className="relative flex items-center rounded-lg bg-[#383a40] px-4 py-2.5">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Message #general-chat"
            className="w-full bg-transparent text-sm text-[#dbdee1] placeholder-[#80848e] focus:outline-none"
          />
          <div className="absolute right-4 flex items-center gap-3 text-[#b5bac1]">
            <button type="button" className="hover:text-white transition"><Smile className="h-5 w-5" /></button>
            <button type="button" className="hover:text-white transition"><Paperclip className="h-5 w-5" /></button>
          </div>
        </form>
      </div>
    </div>
  )
}