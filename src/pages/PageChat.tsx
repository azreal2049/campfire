import { useState } from 'react'
import { ArrowUp, ArrowLeft, Mic, MicOff, Pin, Timer } from 'lucide-react'
import { useCampfireStore, formatTimer } from '../store/useCampfireStore'

export function PageChat() {
  const rooms = useCampfireStore((state) => state.rooms)
  const activeRoomId = useCampfireStore((state) => state.activeRoomId)
  const setActivePage = useCampfireStore((state) => state.setActivePage)
  const sendReply = useCampfireStore((state) => state.sendReply)
  const profile = useCampfireStore((state) => state.profile)
  const [message, setMessage] = useState('')

  const room = rooms.find((item) => item.id === activeRoomId) ?? rooms[0]

  function handleSend() {
    if (!message.trim()) return
    sendReply(message.trim())
    setMessage('')
  }

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-14 items-center justify-between border-b border-white/[0.06] px-6">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-white/[0.04] hover:text-white"
              onClick={() => setActivePage('page-lobby')}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-sm font-medium">{room?.name ?? 'Campfire'}</h1>
              <p className="text-xs text-neutral-500">{room?.topic}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full border border-white/[0.08] px-3 py-1.5 text-xs text-neutral-300">
              <Timer className="h-3 w-3" />
              {room ? formatTimer(room.remainingSeconds) : '00:00'}
            </div>
            <button
              className="rounded-lg border border-white/[0.08] p-2 text-neutral-400 transition-colors hover:text-white"
              onClick={() => useCampfireStore.getState().updateProfile({ muted: !profile.muted })}
            >
              {profile.muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="mx-auto max-w-2xl space-y-1">
            {(room?.messages ?? []).map((msg) => (
              <div key={msg.id} className="group rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.02]">
                <div className="flex items-start gap-3">
                  <div
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold"
                    style={{ background: msg.avatarColor }}
                  >
                    {msg.author.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{msg.author}</span>
                      <span className="text-[10px] text-neutral-600">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm leading-relaxed text-neutral-300">{msg.content}</p>
                  </div>
                  <button className="opacity-0 transition-opacity group-hover:opacity-100">
                    <Pin className="h-3.5 w-3.5 text-neutral-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-white/[0.06] px-6 py-4">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 transition-colors focus-within:border-white/[0.15]">
              <input
                className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-neutral-600"
                placeholder="Reply to the room..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
              />
              <button
                className="rounded-lg bg-white p-2 text-black transition-opacity hover:opacity-90 disabled:opacity-30"
                onClick={handleSend}
                disabled={!message.trim()}
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Members Sidebar */}
      <aside className="hidden w-64 border-l border-white/[0.06] p-4 lg:block">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-neutral-500">
          Members — {room?.participants.length ?? 0}
        </h2>
        <div className="space-y-1">
          {(room?.participants ?? []).map((participant) => (
            <div
              key={participant.id}
              className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-white/[0.02]"
            >
              <div className="relative">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold"
                  style={{ background: participant.avatarColor }}
                >
                  {participant.name.slice(0, 1).toUpperCase()}
                </div>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#050505] ${
                    participant.isSpeaking ? 'bg-emerald-400' : 'bg-neutral-600'
                  }`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{participant.name}</p>
                <p className="text-[10px] text-neutral-500">
                  {participant.isMuted ? 'Muted' : participant.isSpeaking ? 'Speaking' : 'Online'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}
