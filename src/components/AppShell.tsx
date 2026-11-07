import { useCampfireStore } from '../store/useCampfireStore'
import { LiquidGlassModeSwitcher } from './LiquidGlassModeSwitcher'
import { AnimatePresence, motion } from 'framer-motion'
import { Flame, Settings, Users, ShoppingBag, Folder } from 'lucide-react'

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
      {/* Shell Header matching wireframe */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-black/40 backdrop-blur-xl">
        {/* Row 1: Menu Strip */}
        <div className="flex h-12 items-center justify-between border-b border-white/[0.06] px-6">
          <div className="flex items-center gap-3 text-xs">
            <button
              className="flex items-center gap-1.5 rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 font-semibold text-orange-300 transition hover:bg-orange-500/20"
              onClick={openCreateModal}
            >
              <Flame className="h-3.5 w-3.5 text-orange-400" />
              Lit a fire
            </button>
            <span className="h-3 w-px bg-white/10" />
            <button
              className="rounded px-2.5 py-1 text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
              onClick={openCreateModal}
            >
              File ▾
            </button>
            <button
              className="rounded px-2.5 py-1 text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
              onClick={openCreateModal}
            >
              Sessions ▾
            </button>
            <button className="rounded px-2.5 py-1 text-zinc-400 transition hover:bg-white/[0.04] hover:text-white">
              Help ▾
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-zinc-400 transition hover:border-white/20 hover:text-white"
              onClick={() => setActivePage('page-user-settings')}
              title="User Settings"
            >
              <Settings className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Row 2: Left-Margined LiquidGlass Mode Switcher + Navigation Pills */}
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-6">
            {/* LiquidGlassModeSwitcher placed on left side with margin */}
            <div className="ml-2">
              <LiquidGlassModeSwitcher
                activeMode={workspaceView}
                onChange={handleModeChange}
              />
            </div>

            {/* Friends, Shop, Personal Vault buttons */}
            <nav className="flex items-center gap-2 text-xs">
              <button
                className={`flex items-center gap-2 rounded-xl px-4 py-2 font-medium transition ${
                  activePage === 'page-friends'
                    ? 'border border-white/20 bg-white/10 text-white'
                    : 'border border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:text-white'
                }`}
                onClick={() => setActivePage('page-friends')}
              >
                <Users className="h-3.5 w-3.5" />
                Friends
              </button>
              <button
                className={`flex items-center gap-2 rounded-xl px-4 py-2 font-medium transition ${
                  activePage === 'page-shop'
                    ? 'border border-white/20 bg-white/10 text-white'
                    : 'border border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:text-white'
                }`}
                onClick={() => setActivePage('page-shop')}
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                Shop
              </button>
              <button
                className={`flex items-center gap-2 rounded-xl px-4 py-2 font-medium transition ${
                  activePage === 'page-vault'
                    ? 'border border-blue-400/40 bg-blue-500/20 text-blue-200 shadow-[0_0_12px_rgba(59,130,246,0.2)]'
                    : 'border border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20'
                }`}
                onClick={() => setActivePage('page-vault')}
              >
                <Folder className="h-3.5 w-3.5" />
                Personal Vault
              </button>
            </nav>
          </div>

          <div className="text-xs text-zinc-500 font-mono">
            Campfire
          </div>
        </div>
      </header>

      {/* Main Page Area */}
      <main className="flex-1 overflow-auto relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{
              opacity: 0,
              x: workspaceView === 'chat' ? -30 : 30,
              filter: 'blur(6px)',
              scale: 0.99,
            }}
            animate={{
              opacity: 1,
              x: 0,
              filter: 'blur(0px)',
              scale: 1,
            }}
            exit={{
              opacity: 0,
              x: workspaceView === 'chat' ? 30 : -30,
              filter: 'blur(6px)',
              scale: 0.99,
            }}
            transition={{
              type: 'spring',
              stiffness: 240,
              damping: 24,
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