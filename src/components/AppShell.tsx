import { LiquidGlassModeSwitcher } from './LiquidGlassModeSwitcher'
import { useCampfireStore } from '../store/useCampfireStore'
import { AnimatePresence, motion } from 'framer-motion'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const workspaceView = useCampfireStore((state) => state.workspaceView)
  const setActiveWorkspaceView = useCampfireStore((state) => state.setActiveWorkspaceView)

  const handleModeChange = (mode: 'chat' | 'workplace') => {
    setActiveWorkspaceView(mode)
  }

  return (
    <div className="flex min-h-screen flex-col text-white">
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-black/40 backdrop-blur-xl">
        <div className="flex h-16 items-center px-6">
          <LiquidGlassModeSwitcher
            activeMode={workspaceView}
            onChange={handleModeChange}
          />
        </div>
      </header>

      <main className="flex-1 overflow-auto relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={workspaceView}
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