import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Sparkles, ChevronRight, Hash, Shield, Zap } from 'lucide-react'

interface Room {
  id: string
  name: string
  topic: string
  unreadCount: number
}

const DUMMY_ROOMS: Room[] = [
  { id: '1', name: 'Late Night Python & DSA', topic: 'Grind LeetCode mediums', unreadCount: 3 },
  { id: '2', name: 'Organic Chem Cram', topic: 'SN1/SN2 mechanisms', unreadCount: 0 },
  { id: '3', name: 'Lo-Fi Beat Lab', topic: 'Sample flips & DAW share', unreadCount: 5 },
  { id: '4', name: 'AI Agents & LLMs', topic: 'RAG pipelines & local models', unreadCount: 1 },
]

export function PageChat() {
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null)
  const activeRoom = DUMMY_ROOMS.find((r) => r.id === activeRoomId)

  return (
    <div className="flex h-[calc(100vh-48px)] w-full overflow-hidden">
      {/* ── Left Column: Room Circles / List ── */}
      <div className="w-80 border-r border-white/[0.08] bg-[#0a0a0d]/60 p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-500">
            Chat Channels / Rooms
          </h2>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
            {DUMMY_ROOMS.length}
          </span>
        </div>

        {/* Top 4 Circular Avatars / Badges as sketched */}
        <div className="flex items-center justify-between mb-6 px-2">
          {DUMMY_ROOMS.map((room, i) => (
            <button
              key={room.id}
              onClick={() => setActiveRoomId(room.id)}
              className={`relative flex h-12 w-12 items-center justify-center rounded-full border transition hover:scale-105 ${
                activeRoomId === room.id
                  ? 'border-orange-500 bg-orange-500/20 text-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                  : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:text-white'
              }`}
              title={room.name}
            >
              <Hash className="h-5 w-5" />
              {room.unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white">
                  {room.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Room List below */}
        <div className="flex-1 space-y-1 overflow-y-auto">
          {DUMMY_ROOMS.map((room) => (
            <button
              key={room.id}
              onClick={() => setActiveRoomId(room.id)}
              className={`w-full flex items-center justify-between rounded-xl p-3 text-left transition ${
                activeRoomId === room.id
                  ? 'border border-white/20 bg-white/[0.08] text-white'
                  : 'border border-transparent bg-white/[0.02] text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200'
              }`}
            >
              <div>
                <p className="text-xs font-semibold text-white">{room.name}</p>
                <p className="text-[11px] text-zinc-500 truncate max-w-[190px]">
                  {room.topic}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-zinc-600" />
            </button>
          ))}
        </div>

        {/* Note on WebGL background */}
        <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.01] p-3 text-[11px] text-zinc-600 font-mono">
          💡 Live Interactive Background on WebGL (Later when UI is upgraded)
        </div>
      </div>

      {/* ── Right Column: Chat Bubble Area (Pops out when opened, pops back when closed) ── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#070709] relative overflow-hidden">
        <AnimatePresence mode="wait">
          {!activeRoom ? (
            <motion.div
              key="none"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-zinc-600 mb-4">
                <MessageSquare className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-300">CHAT PAGE (none chat opened)</h3>
              <p className="mt-1 text-xs text-zinc-600">
                Click any room circle or list item on the left to open the chat bubble.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={activeRoom.id}
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              className="relative w-full max-w-2xl rounded-3xl border border-white/25 bg-[#111115] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
            >
              {/* Chat Bubble Tail / Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-orange-400">
                    Active Room
                  </span>
                  <h2 className="text-xl font-bold text-white">{activeRoom.name}</h2>
                  <p className="text-xs text-zinc-500">{activeRoom.topic}</p>
                </div>
                <button
                  onClick={() => setActiveRoomId(null)}
                  className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-400 hover:bg-white/10 hover:text-white transition"
                >
                  Close Chat ✕
                </button>
              </div>

              {/* Chat Bubble Mock Messages */}
              <div className="space-y-4 my-6">
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300">
                    N
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4 max-w-md">
                    <p className="text-xs font-semibold text-zinc-300 mb-1">Nova</p>
                    <p className="text-sm text-zinc-200">
                      Stuck on the sliding window variant — anyone free to review?
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4 max-w-md">
                    <p className="text-xs font-semibold text-orange-300 mb-1">You</p>
                    <p className="text-sm text-orange-100">
                      Dropping my O(n) deque solution into the dev rig now!
                    </p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-orange-500/20 flex items-center justify-center text-xs font-bold text-orange-300">
                    Y
                  </div>
                </div>
              </div>

              {/* Message Input Footer */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <input
                  type="text"
                  placeholder="Type message..."
                  className="flex-1 rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/30"
                />
                <button className="rounded-xl border border-white/25 bg-white text-black px-5 py-2.5 text-sm font-semibold hover:bg-zinc-200 transition">
                  Send
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}