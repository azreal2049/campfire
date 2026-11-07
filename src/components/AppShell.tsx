import { useCampfireStore } from '../store/useCampfireStore'
import { LiquidGlassModeSwitcher } from './LiquidGlassModeSwitcher'
import { AnimatePresence, motion } from 'framer-motion'
import { Flame, Settings, Sliders } from 'lucide-react'

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

  const handleModeChange = (mode: 'chat' | 'workplace') => {
    setActiveWorkspaceView(mode)
  }

  return (
    <div className="flex min-h-screen flex-col text-white">
      {/* Top Header with Brand, Mode Switcher, and User Controls */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          {/* Brand */}
          <div className="flex items-center gap-4">
            <button
              className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 transition hover:bg-white/[0.06]"
              onClick={() => setActivePage('page-home')}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400">
                <Flame className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                Campfire
              </span>
            </button>
            <button
              className="flex items-center gap-1.5 rounded-xl border border-orange-500/30 bg-orange-500/10 px-3.5 py-2 text-xs font-semibold text-orange-300 transition hover:bg-orange-500/20"
              onClick={openCreateModal}
            >
              <Flame className="h-3.5 w-3.5" />
              Lit a fire
            </button>
          </div>

          {/* Center Mode Switcher */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <LiquidGlassModeSwitcher
              activeMode={workspaceView}
              onChange={handleModeChange}
            />
          </div>

          {/* User Controls */}
          <div className="flex items-center gap-2.5">
            <button
              className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
              onClick={() => setActivePage('page-app-settings')}
              title="App & Audio Settings"
            >
              <Sliders className="h-4 w-4" />
            </button>
            <button
              className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
              onClick={() => setActivePage('page-user-settings')}
              title="User Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] py-1 pl-1 pr-3.5 transition hover:border-white/20"
              onClick={() => setActivePage('page-user-settings')}
            >
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white shadow-inner"
                style={{ background: profile.avatarColor || '#3F3F3F' }}
              >
                {profile.displayName.slice(0, 2).toUpperCase()}
              </span>
              <span className="text-xs font-medium text-zinc-200">{profile.displayName}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Page Area with Synchronized Liquid Blur-Slide Transition */}
      <main className="flex-1 overflow-auto relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{
              opacity: 0,
              x: workspaceView === 'chat' ? -40 : 40,
              filter: 'blur(8px)',
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              x: 0,
              filter: 'blur(0px)',
              scale: 1,
            }}
            exit={{
              opacity: 0,
              x: workspaceView === 'chat' ? 40 : -40,
              filter: 'blur(8px)',
              scale: 0.98,
            }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 26,
            }}
            className="min-h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}