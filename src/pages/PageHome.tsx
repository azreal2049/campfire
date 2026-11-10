import { useCampfireStore } from '../store/useCampfireStore'

export function PageHome() {
  const displayName = useCampfireStore((state) => state.displayName)
  const setActiveWorkspaceView = useCampfireStore((state) => state.setActiveWorkspaceView)
  const setAssistantOpen = useCampfireStore((state) => state.setAssistantOpen)

  return (
    <div className="flex min-h-[calc(100vh-48px)] items-center justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-4xl">
        {/* ── Center Greeting Box ── */}
        <div className="rounded-2xl border border-white/[0.07] bg-[#0B0B0E] p-10 text-center">
          <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">
            &quot;GREETING&quot;
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white">
            ~ {displayName} ~
          </h1>

          {/* ── Right Stacked Action Bars ── */}
          <div className="mt-8 flex flex-col items-end gap-3">
            <button
              onClick={() => setActiveWorkspaceView('chat')}
              className="group flex w-full max-w-md items-center justify-between rounded-xl border border-white/10 bg-black/40 px-5 py-3 text-sm text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
            >
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full border border-emerald-500 bg-emerald-500/30" />
                <span className="font-mono text-zinc-500">──►</span>
                <span className="font-medium">reply to...</span>
              </div>
              <span className="text-xs text-zinc-600 group-hover:text-zinc-500">
                unread mentions
              </span>
            </button>

            <button
              onClick={() => setActiveWorkspaceView('workplace')}
              className="group flex w-full max-w-md items-center justify-between rounded-xl border border-white/10 bg-black/40 px-5 py-3 text-sm text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
            >
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full border border-sky-500 bg-sky-500/30" />
                <span className="font-mono text-zinc-500">──►</span>
                <span className="font-medium">continue where you left...</span>
              </div>
              <span className="text-xs text-zinc-600 group-hover:text-zinc-500">
                restore last workspace
              </span>
            </button>

            <button
              onClick={() => setAssistantOpen(true)}
              className="group flex w-full max-w-md items-center justify-between rounded-xl border border-white/10 bg-black/40 px-5 py-3 text-sm text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
            >
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full border border-zinc-600 bg-zinc-600/20" />
                <span className="font-mono text-zinc-500">──►</span>
                <span className="font-medium">deploy agent</span>
              </div>
              <span className="text-xs text-zinc-600 group-hover:text-zinc-500">
                open AI drawer
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}