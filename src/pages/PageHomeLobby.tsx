import { useCampfireStore } from '../store/useCampfireStore'

export function PageHomeLobby() {
  const profile = useCampfireStore((state) => state.profile)
  const rooms = useCampfireStore((state) => state.rooms)
  const setActivePage = useCampfireStore((state) => state.setActivePage)
  const setActiveWorkspaceView = useCampfireStore((state) => state.setActiveWorkspaceView)
  const setActiveRoom = useCampfireStore((state) => state.setActiveRoom)

  const activeRoom = rooms.find((r) => r.id === useCampfireStore.getState().activeRoomId) ?? rooms[0]

  return (
    <div className="relative flex min-h-[calc(100vh-112px)] flex-col justify-center px-6 py-12 text-white">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        {/* Center Greeting Box */}
        <div className="rounded-3xl border border-dashed border-white/20 bg-white/[0.02] p-12 text-center backdrop-blur-md shadow-2xl">
          <p className="text-sm uppercase tracking-widest text-zinc-500 font-mono">Welcome back</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            "Greeting" ~ <span className="text-white font-bold">{profile.displayName}</span> ~
          </h1>
          <p className="mt-3 text-sm text-zinc-400">
            {rooms.length} active campfire rooms burning in background.
          </p>
        </div>

        {/* Right Stacked Action Bars */}
        <div className="flex flex-col items-end gap-3.5">
          <button
            onClick={() => {
              setActiveRoom(activeRoom?.id ?? rooms[0]?.id)
              setActiveWorkspaceView('chat')
              setActivePage('page-chat')
            }}
            className="group flex w-full max-w-md items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4 text-sm text-zinc-300 backdrop-blur-md transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white shadow-lg"
          >
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full border border-emerald-400 bg-emerald-400/30" />
              <span className="font-mono text-zinc-400">──►</span>
              <span className="font-medium">Reply to...</span>
            </div>
            <span className="text-xs text-zinc-500 group-hover:text-zinc-400">unread mentions</span>
          </button>

          <button
            onClick={() => {
              setActiveRoom(activeRoom?.id ?? rooms[0]?.id)
              setActiveWorkspaceView('workplace')
              setActivePage('page-workplace')
            }}
            className="group flex w-full max-w-md items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4 text-sm text-zinc-300 backdrop-blur-md transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white shadow-lg"
          >
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full border border-sky-400 bg-sky-400/30" />
              <span className="font-mono text-zinc-400">──►</span>
              <span className="font-medium">Continue where you left</span>
            </div>
            <span className="text-xs text-zinc-500 group-hover:text-zinc-400">restore last workspace</span>
          </button>

          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('campfire-ai-open'))
            }}
            className="group flex w-full max-w-md items-center justify-between rounded-2xl border border-violet-500/30 bg-violet-500/10 px-6 py-4 text-sm text-violet-200 backdrop-blur-md transition hover:border-violet-500/50 hover:bg-violet-500/20 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full border border-violet-400 bg-violet-400/40" />
              <span className="font-mono text-violet-400">──►</span>
              <span className="font-medium">Deploy Agent</span>
            </div>
            <span className="text-xs text-violet-400 group-hover:text-violet-300">open AI drawer</span>
          </button>
        </div>
      </div>
    </div>
  )
}