import { ArrowUp, MessageSquareText, Mic, TimerReset, Users2 } from 'lucide-react'
import { useCampfireStore } from '../store/useCampfireStore'
import { formatTimer } from '../store/useCampfireStore'

export function PageChat() {
  const rooms = useCampfireStore((state) => state.rooms)
  const activeRoomId = useCampfireStore((state) => state.activeRoomId)
  const setActivePage = useCampfireStore((state) => state.setActivePage)
  const sendReply = useCampfireStore((state) => state.sendReply)

  const room = rooms.find((item) => item.id === activeRoomId) ?? rooms[0]

  return (
    <main className="min-h-screen bg-[#070709] text-white">
      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-6">
        <section className="flex-1 rounded-3xl border border-white/10 bg-[#0d0d11] p-4">
          <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Live room</p>
              <h1 className="mt-2 text-2xl font-semibold">{room?.name ?? 'Campfire'}</h1>
            </div>
            <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-zinc-300">
              {room ? formatTimer(room.remainingSeconds) : '00:00'}
            </div>
          </div>

          <div className="space-y-4">
            {(room?.messages ?? []).map((message) => (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3" key={message.id}>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold" style={{ background: message.avatarColor }}>
                      {message.author.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="text-sm font-medium text-zinc-100">{message.author}</span>
                  </div>
                  <button className="text-xs text-zinc-400 hover:text-white" type="button">📌 Save to Vault</button>
                </div>
                <p className="text-sm leading-6 text-zinc-200">{message.content}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-[#111115] p-3">
            <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-zinc-500">
              <MessageSquareText className="h-3.5 w-3.5" />
              Quick reply
            </div>
            <div className="flex items-center gap-2">
              <input
                className="flex-1 rounded-xl border border-white/10 bg-transparent px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-500"
                placeholder="Reply to the room..."
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    const value = (event.target as HTMLInputElement).value.trim()
                    if (value) {
                      sendReply(value)
                      ;(event.target as HTMLInputElement).value = ''
                    }
                  }
                }}
              />
              <button className="rounded-xl bg-white p-2.5 text-[#09090B]" type="button">
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        <aside className="w-[260px] rounded-3xl border border-white/10 bg-[#0d0d11] p-4">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <Users2 className="h-4 w-4" />
              Members
            </div>
            <button className="rounded-full border border-white/10 px-2 py-1 text-xs text-zinc-300" type="button">
              <Mic className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {(room?.participants ?? []).map((participant) => (
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] px-3 py-2" key={participant.id}>
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold" style={{ background: participant.avatarColor }}>
                    {participant.name.slice(0, 1).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{participant.name}</p>
                    <p className="text-[11px] text-zinc-500">{participant.isMuted ? 'Muted' : 'Live'}</p>
                  </div>
                </div>
                <div className={`h-2 w-2 rounded-full ${participant.isSpeaking ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-3">
            <div className="mb-2 flex items-center gap-2 text-sm text-zinc-300">
              <TimerReset className="h-4 w-4" />
              Room timer
            </div>
            <p className="text-xl font-semibold">{room ? formatTimer(room.remainingSeconds) : '00:00'}</p>
          </div>

          <button
            className="mt-6 w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-zinc-200 hover:bg-white/[0.05]"
            onClick={() => setActivePage('page-lobby')}
            type="button"
          >
            Back to Lobby
          </button>
        </aside>
      </div>
    </main>
  )
}
