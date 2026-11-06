import { Flame, Settings, Search, Users, ShoppingBag, Folder, MessageSquare, Monitor, Sliders } from 'lucide-react'
import { useCampfireStore } from '../store/useCampfireStore'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const activePage = useCampfireStore((state) => state.activePage)
  const workspaceView = useCampfireStore((state) => state.workspaceView)
  const profile = useCampfireStore((state) => state.profile)
  const setActivePage = useCampfireStore((state) => state.setActivePage)
  const setActiveWorkspaceView = useCampfireStore((state) => state.setActiveWorkspaceView)
  const openCreateModal = useCampfireStore((state) => state.openCreateModal)

  return (
    <div className="flex min-h-screen flex-col bg-[#070709] text-white">
      {/* Top Shell Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070709]/90 backdrop-blur-xl">
        {/* Row 1: Top Brand & Utility Row */}
        <div className="flex h-11 items-center justify-between border-b border-white/[0.06] px-4">
          <button
            className="flex items-center gap-2 rounded-md px-2 py-1 text-sm font-bold tracking-tight transition hover:bg-white/[0.04]"
            onClick={() => setActivePage('page-home')}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded bg-orange-500/20 text-xs">🔥</span>
            <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">Campfire</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
              onClick={() => setActivePage('page-app-settings')}
              title="App & Audio Settings"
            >
              <Sliders className="h-4 w-4" />
            </button>
            <button
              className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
              onClick={() => setActivePage('page-user-settings')}
              title="User Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] py-0.5 pl-0.5 pr-2.5 transition hover:border-white/20"
              onClick={() => setActivePage('page-user-settings')}
            >
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                style={{ background: profile.avatarColor || '#3F3F3F' }}
              >
                {profile.displayName.slice(0, 2).toUpperCase()}
              </span>
              <span className="text-xs font-medium text-zinc-300">{profile.displayName}</span>
            </button>
          </div>
        </div>

        {/* Row 2: Locked Menu Strip & Cursor-Style Mode Switch */}
        <div className="flex h-11 items-center justify-between border-b border-white/[0.06] px-4">
          <div className="flex items-center gap-2 text-xs">
            <button
              className="flex items-center gap-1.5 rounded-md bg-orange-500/20 px-3 py-1.5 font-semibold text-orange-300 transition hover:bg-orange-500/30"
              onClick={openCreateModal}
            >
              <Flame className="h-3.5 w-3.5" />
              Lit a fire
            </button>
            <span className="h-3 w-px bg-white/10" />
            <button className="rounded px-2.5 py-1 text-zinc-400 transition hover:bg-white/[0.04] hover:text-white">File ▾</button>
            <button className="rounded px-2.5 py-1 text-zinc-400 transition hover:bg-white/[0.04] hover:text-white" onClick={openCreateModal}>Sessions ▾</button>
            <button className="rounded px-2.5 py-1 text-zinc-400 transition hover:bg-white/[0.04] hover:text-white">Help ▾</button>
          </div>

          {/* Cursor-style toggle */}
          <div className="flex items-center rounded-md border border-white/10 bg-[#111115] p-0.5 text-xs">
            <button
              className={`flex items-center gap-1.5 rounded px-3 py-1 font-medium transition ${
                workspaceView === 'chat' && (activePage === 'page-chat' || activePage === 'page-workplace')
                  ? 'bg-white text-[#070709] shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
              onClick={() => setActiveWorkspaceView('chat')}
            >
              <MessageSquare className="h-3 w-3" />
              Chat Mode
            </button>
            <button
              className={`flex items-center gap-1.5 rounded px-3 py-1 font-medium transition ${
                workspaceView === 'workplace' && (activePage === 'page-chat' || activePage === 'page-workplace')
                  ? 'bg-white text-[#070709] shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
              onClick={() => setActiveWorkspaceView('workplace')}
            >
              <Monitor className="h-3 w-3" />
              Workplace Mode
            </button>
          </div>
        </div>

        {/* Row 3: Sub-Navigation Bar */}
        <div className="flex h-10 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-[#111115] px-2.5 py-1 text-xs text-zinc-400">
              <Search className="h-3 w-3 text-zinc-500" />
              <input
                className="w-44 bg-transparent text-xs text-white outline-none placeholder:text-zinc-600"
                placeholder="Search or jump..."
              />
            </div>

            <nav className="flex items-center gap-1 text-xs">
              <button
                className={`flex items-center gap-1.5 rounded-md px-3 py-1 font-medium transition ${
                  activePage === 'page-friends'
                    ? 'border border-white/20 bg-white/10 text-white'
                    : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'
                }`}
                onClick={() => setActivePage('page-friends')}
              >
                <Users className="h-3.5 w-3.5" />
                Friends
              </button>
              <button
                className={`flex items-center gap-1.5 rounded-md px-3 py-1 font-medium transition ${
                  activePage === 'page-shop'
                    ? 'border border-white/20 bg-white/10 text-white'
                    : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'
                }`}
                onClick={() => setActivePage('page-shop')}
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                Shop
              </button>
              <button
                className={`flex items-center gap-1.5 rounded-md px-3 py-1 font-medium transition ${
                  activePage === 'page-vault'
                    ? 'border border-sky-400/40 bg-sky-500/20 text-sky-200'
                    : 'border border-sky-500/20 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20'
                }`}
                onClick={() => setActivePage('page-vault')}
              >
                <Folder className="h-3.5 w-3.5" />
                Personal Vault
              </button>
            </nav>
          </div>

          <div className="text-[11px] text-zinc-500">
            Campfire v2.4 · Cursor x Discord shell
          </div>
        </div>
      </header>

      {/* Main Page Area */}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
