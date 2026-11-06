import { useCampfireStore } from '../store/useCampfireStore'

export function PageHomeLobby() {
  const profile = useCampfireStore((state) => state.profile)
  const rooms = useCampfireStore((state) => state.rooms)
  const setActivePage = useCampfireStore((state) => state.setActivePage)
  const setActiveWorkspaceView = useCampfireStore((state) => state.setActiveWorkspaceView)
  const setActiveRoom = useCampfireStore((state) => state.setActiveRoom)

  const activeRoom = rooms.find((r) => r.id === useCampfireStore.getState().activeRoomId) ?? rooms[0]

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="flex h-full">
        {/* Left Area: Clean, open negative space (zero clutter) */}
        <div className="hidden flex-1 flex-col items-center justify-center border-r border-white/[0.06] lg:flex">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02]">
            <span className="text-2xl">🔥</span>
          </div>
          <p className="mt-3 text-xs uppercase tracking-widest text-zinc-600">Campfire</p>
        </div>

        {/* Center-Right Greeting Box */}
        <div className="flex flex-1 flex-col items-center justify-center px-6">
          <div className="max-w-lg">
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
              <p className="text-sm text-zinc-500">Welcome back</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Greeting, <span className="text-white">{profile.displayName}</span>
              </h1>
              <p className="mt-2 text-sm text-zinc-500">
                You have {rooms.length} active campfire rooms burning.
              </p>
            </div>

            {/* Bottom-Right 3 Stacked Action Bars */}
            <div className="mt-6 flex flex-col items-end gap-3">
              <button
                onClick={() => {
                  setActiveRoom(activeRoom?.id ?? rooms[0].id)
                  setActiveWorkspaceView('chat')
                  setActivePage('page-chat')
                }}
                className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>──► Reply to...</span>
                <span className="ml-auto text-xs text-zinc-600">unread mentions</span>
              </button>

              <button
                onClick={() => {
                  setActiveRoom(activeRoom?.id ?? rooms[0].id)
                  setActiveWorkspaceView('workplace')
                  setActivePage('page-workplace')
                }}
                className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
              >
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                <span>──► Continue where you left</span>
                <span className="ml-auto text-xs text-zinc-600">restore last workspace</span>
              </button>

              <button
                onClick={() => {
                  // Open AI Bot drawer via global event — use a custom event to signal GlobalAIBot
                  window.dispatchEvent(new CustomEvent('campfire-ai-open'))
                }}
                className="group flex items-center gap-3 rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-3 text-sm text-violet-300 transition hover:border-violet-500/40 hover:bg-violet-500/20 hover:text-violet-200"
              >
                <span className="h-2 w-2 rounded-full bg-violet-400" />
                <span>──► Deploy Agent</span>
                <span className="ml-auto text-xs text-violet-500">open AI drawer</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}