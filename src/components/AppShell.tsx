import { useCampfireStore } from '../store/useCampfireStore'
import { LiquidGlassModeSwitcher } from './LiquidGlassModeSwitcher'
import { AnimatePresence, motion } from 'framer-motion'
import { Flame } from 'lucide-react'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const activePage = useCampfireStore((state) => state.activePage)
  const workspaceView = useCampfireStore((state) => state.workspaceView)
  const setActivePage = useCampfireStore((state) => state.setActivePage)
  const setActiveWorkspaceView = useCampfireStore((state) => state.setActiveWorkspaceView)

  const handleModeChange = (mode: 'chat' | 'workplace') => {
    setActiveWorkspaceView(mode)
  }

  return (
    <div className="flex min-h-screen flex-col text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          {/* Brand */}
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

          {/* Center Mode Switcher - Placed cleanly in header (can also be placed anywhere via import) */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <LiquidGlassModeSwitcher
              activeMode={workspaceView}
              onChange={handleModeChange}
            />
          </div>

          <div />
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