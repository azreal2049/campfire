import { useCampfireStore } from '../store/useCampfireStore'
import { Flame, MessageSquare, LayoutGrid, Users, ShoppingBag } from 'lucide-react'

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
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold tracking-tight">
            🔥 Campfire
          </span>

          {/* Chat / Workplace Toggle */}
          <div className="flex items-center rounded-lg border border-white/10 bg-black/40 p-0.5 text-xs">
            <button
              onClick={() => setActiveWorkspaceView('chat')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 font-medium transition ${
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
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 font-medium transition ${
                workspaceView === 'workplace'
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Workplace
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-zinc-500">File ▾</span>
          <span className="text-zinc-500">Sessions ▾</span>
          <span className="text-zinc-500">Help ▾</span>
          <span className="ml-2 flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-zinc-400">
            <Users className="h-3.5 w-3.5" />
            Friends
          </span>
          <span className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-zinc-400">
            <ShoppingBag className="h-3.5 w-3.5" />
            Shop
          </span>
        </div>
      </header>

      {/* ── Body: Left Sidebar + Main Content ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="flex w-56 flex-col border-r border-white/[0.08] bg-[#0a0a0d]/60 p-3">
          <button
            onClick={openLitAFire}
            className="flex items-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-sm font-semibold text-orange-300 transition hover:bg-orange-500/20"
          >
            <Flame className="h-4 w-4 text-orange-400" />
            🔥 Lit a fire
          </button>

          <div className="mt-4 space-y-0.5">
            <p className="mb-1.5 px-2 text-[10px] font-mono uppercase tracking-wider text-zinc-600">
              Recents
            </p>
            {[
              'Study group',
              'Coders → Developers',
              'Fun with friends',
              'Musicians',
              'Content Creators',
              'Editors × VFX × VideoMakers',
              'Official works',
              'Silent co-working',
            ].map((label) => (
              <button
                key={label}
                className="w-full rounded-lg px-2.5 py-1.5 text-left text-xs text-zinc-400 transition hover:bg-white/[0.04] hover:text-zinc-200"
              >
                {label}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}