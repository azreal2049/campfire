import { useState } from 'react'
import { Hash, Plus, Settings, Headphones, Mic, Smile, Send, Paperclip, Search, Bell, Pin, Users, Gift, Image, Sparkles } from 'lucide-react'

interface Server {
  id: string
  name: string
  icon: string
  unread: boolean
}

interface Channel {
  id: string
  name: string
  unread: boolean
}

interface Message {
  id: string
  author: string
  avatar: string
  content: string
  timestamp: string
}

const SERVERS: Server[] = [
  { id: '1', name: 'Campfire HQ', icon: '🔥', unread: false },
  { id: '2', name: 'Python & DSA', icon: '🐍', unread: true },
  { id: '3', name: 'Organic Chem', icon: '🧪', unread: false },
  { id: '4', name: 'Lo-Fi Lab', icon: '🎧', unread: true },
]

const CHANNELS: Channel[] = [
  { id: 'general', name: 'general-chat', unread: false },
  { id: 'dev-rig', name: 'dev-rig-code', unread: true },
  { id: 'whiteboard', name: 'whiteboard-notes', unread: false },
  { id: 'voice-lounge', name: 'voice-lounge', unread: false },
]

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
  const [selectedServer, setSelectedServer] = useState('1')
  const [selectedChannel, setSelectedChannel] = useState('general')
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
    <div className="flex h-[calc(100vh-48px)] w-full bg-[#313338] text-[#dbdee1] overflow-hidden select-none font-sans">
      {/* ── 1. Server Sidebar (Far Left) ── */}
      <nav className="flex w-[72px] flex-col items-center py-3 bg-[#1e1f22] shrink-0 gap-2">
        {/* Direct Messages / Home */}
        <button className="relative group flex h-12 w-12 items-center justify-center rounded-[24px] hover:rounded-[16px] bg-[#313338] text-white transition-all duration-200">
          <span className="text-xl">🔥</span>
          <div className="absolute left-0 w-1 h-5 bg-white rounded-r-full -ml-3 scale-y-0 group-hover:scale-y-100 transition-transform" />
        </button>

        <div className="w-8 h-[2px] bg-[#35363c] rounded my-1" />

        {/* Server List */}
        {SERVERS.map((server) => (
          <button
            key={server.id}
            onClick={() => setSelectedServer(server.id)}
            className={`relative group flex h-12 w-12 items-center justify-center rounded-[24px] hover:rounded-[16px] transition-all duration-200 text-white font-semibold ${
              selectedServer === server.id
                ? 'rounded-[16px] bg-[#5865f2]'
                : 'bg-[#313338] hover:bg-[#5865f2]'
            }`}
          >
            {server.icon}
            {server.unread && selectedServer !== server.id && (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-white border-2 border-[#1e1f22]" />
            )}
          </button>
        ))}

        {/* Add Server Button */}
        <button className="flex h-12 w-12 items-center justify-center rounded-[24px] hover:rounded-[16px] bg-[#313338] text-[#23a55a] hover:bg-[#23a55a] hover:text-white transition-all duration-200">
          <Plus className="h-5 w-5" />
        </button>
      </nav>

      {/* ── 2. Channels Sidebar (Second Left) ── */}
      <div className="flex w-60 flex-col bg-[#2b2d31] shrink-0">
        {/* Server Header */}
        <div className="flex h-12 items-center justify-between px-4 border-b border-[#1f2023] font-semibold text-white shadow-sm cursor-pointer hover:bg-[#35373c] transition">
          <span className="truncate">Campfire Workspace</span>
          <span className="text-xs">▼</span>
        </div>

        {/* Channel Categories & List */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          <div>
            <div className="flex items-center justify-between px-2 mb-1 text-[12px] font-bold text-[#949ba4] uppercase tracking-wider hover:text-[#dbdee1] cursor-pointer">
              <span>▼ Text Channels</span>
              <Plus className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              {CHANNELS.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChannel(ch.id)}
                  className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium transition ${
                    selectedChannel === ch.id
                      ? 'bg-[#404249] text-white'
                      : 'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]'
                  }`}
                >
                  <Hash className="h-4 w-4 text-[#80848e]" />
                  <span className="truncate">{ch.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User Profile Bar (Bottom Left) */}
        <div className="flex h-[52px] items-center justify-between bg-[#232428] px-2">
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8 rounded-full bg-[#5865f2] flex items-center justify-center font-bold text-white text-xs">
              Y
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-[#23a55a] border-2 border-[#232428]" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-white">You</p>
              <p className="text-[11px] text-[#949ba4]">#online</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[#b5bac1]">
            <button className="p-1.5 rounded hover:bg-[#35373c] hover:text-white transition">
              <Mic className="h-4 w-4" />
            </button>
            <button className="p-1.5 rounded hover:bg-[#35373c] hover:text-white transition">
              <Headphones className="h-4 w-4" />
            </button>
            <button className="p-1.5 rounded hover:bg-[#35373c] hover:text-white transition">
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. Main Chat Area ── */}
      <div className="flex flex-1 flex-col bg-[#313338] min-w-0">
        {/* Chat Header */}
        <div className="flex h-12 items-center justify-between border-b border-[#1f2023] px-4 shadow-sm bg-[#313338]">
          <div className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-[#80848e]" />
            <span className="font-semibold text-white">{selectedChannel}</span>
            <span className="text-xs text-[#949ba4] border-l border-[#404249] pl-3 ml-3 truncate">
              Welcome to the official Campfire study & dev channel.
            </span>
          </div>

          <div className="flex items-center gap-4 text-[#b5bac1]">
            <button className="hover:text-white transition"><Bell className="h-5 w-5" /></button>
            <button className="hover:text-white transition"><Pin className="h-5 w-5" /></button>
            <button className="hover:text-white transition"><Users className="h-5 w-5" /></button>
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="h-7 w-36 rounded bg-[#1e1f22] px-2 text-xs text-[#dbdee1] placeholder-[#949ba4] focus:w-60 transition-all focus:outline-none"
              />
              <Search className="absolute right-2 top-1.5 h-4 w-4 text-[#949ba4]" />
            </div>
          </div>
        </div>

        {/* Message History */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          <div className="border-b border-[#3f4147] pb-4 mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#404249] text-3xl mb-3">
              #
            </div>
            <h1 className="text-3xl font-bold text-white">Welcome to #{selectedChannel}!</h1>
            <p className="text-sm text-[#949ba4] mt-1">This is the start of the #{selectedChannel} channel.</p>
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
            <button type="button" className="absolute left-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#4e5058] text-[#dbdee1] hover:bg-white hover:text-[#313338] transition">
              <Plus className="h-4 w-4" />
            </button>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={`Message #${selectedChannel}`}
              className="w-full bg-transparent pl-10 pr-12 text-sm text-[#dbdee1] placeholder-[#80848e] focus:outline-none"
            />
            <div className="absolute right-4 flex items-center gap-3 text-[#b5bac1]">
              <button type="button" className="hover:text-white transition"><Gift className="h-5 w-5" /></button>
              <button type="button" className="hover:text-white transition"><Image className="h-5 w-5" /></button>
              <button type="button" className="hover:text-white transition"><Smile className="h-5 w-5" /></button>
            </div>
          </form>
        </div>
      </div>

      {/* ── 4. Member List (Far Right) ── */}
      <div className="flex w-60 flex-col bg-[#2b2d31] p-4 shrink-0 overflow-y-auto">
        <h3 className="text-xs font-bold text-[#949ba4] uppercase tracking-wider mb-2">
          Online — 3
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-[#35373c] cursor-pointer transition">
            <div className="relative h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white text-xs">
              N
              <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#23a55a] border-2 border-[#2b2d31]" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Nova</p>
              <p className="text-[11px] text-[#949ba4]">Grinding LeetCode</p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-[#35373c] cursor-pointer transition">
            <div className="relative h-8 w-8 rounded-full bg-sky-500 flex items-center justify-center font-bold text-white text-xs">
              K
              <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#23a55a] border-2 border-[#2b2d31]" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Kai</p>
              <p className="text-[11px] text-[#949ba4]">Building React 19 app</p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-[#35373c] cursor-pointer transition">
            <div className="relative h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center font-bold text-white text-xs">
              R
              <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#f0b232] border-2 border-[#2b2d31]" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Rhea</p>
              <p className="text-[11px] text-[#949ba4]">Idle</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}