import { useCampfireStore } from '../store/useCampfireStore'
import { Flame, MessageSquare, LayoutGrid } from 'lucide-react'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const workspaceView = useCampfireStore((state) => state.workspaceView)
  const setActiveWorkspaceView = useCampfireStore((state) => state.setActiveWorkspaceView)
  const openLitAFire = useCampfireStore((state) => state.openLitAFire)

  return (
    <div className="flex min-h-screen flex-col bg-[#070709] text-white">
      {/* ── Top Bar ── */}
      <header className="flex h-12 items-center justify-between border-b border-white/[0.08] bg-[#0a0a0d]/80 px-4 backdrop-blur-md">
        <span className="text-sm font-semibold tracking-tight">🔥 Campfire</span>
      </header>

      {/* ── Body: Left Sidebar + Main Content ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="flex w-56 flex-col border-r border-white/[0.08] bg-[#0a0a0d]/60 p-3">
          {/* 🔥 Lit a fire */}
          <button
            onClick={openLitAFire}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-sm font-semibold text-orange-300 transition hover:bg-orange-500/20"
          >
            <Flame className="h-4 w-4 text-orange-400" />
            Lit a fire
          </button>

          {/* Chat / Workplace Toggle */}
          <div className="mt-2 flex w-full items-center rounded-lg border border-white/10 bg-black/40 p-0.5">
            <button
              onClick={() => setActiveWorkspaceView('chat')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition ${
                workspaceView === 'chat'
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Chat
            </button>
            <button
              onClick={() => setActiveWorkspaceView('workplace')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition ${
                workspaceView === 'workplace'
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Workplace
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-[#070709]">
          {children}
        </main>
      </div>
    </div>
  )
}