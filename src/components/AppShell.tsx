import { useEffect, useState } from 'react'
import { useCampfireStore } from '../store/useCampfireStore'
import { Flame, MessageSquare, LayoutGrid, X, Sparkles, Search, Store } from 'lucide-react'
import { FloatingCapsuleNav } from './FloatingCapsuleNav'
import { CommandPalette } from './CommandPalette'
import { WhisperAction } from './WhisperAction'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const workspaceView = useCampfireStore((state) => state.workspaceView)
  const setActiveWorkspaceView = useCampfireStore((state) => state.setActiveWorkspaceView)
  const setActivePage = useCampfireStore((state) => state.setActivePage)
  const isAssistantOpen = useCampfireStore((state) => state.isAssistantOpen)
  const setAssistantOpen = useCampfireStore((state) => state.setAssistantOpen)
  const agentTasks = useCampfireStore((state) => state.agentTasks)
  const dispatchAgent = useCampfireStore((state) => state.dispatchAgent)
  const saveAgentOutput = useCampfireStore((state) => state.saveAgentOutput)
  const tickBurnTimer = useCampfireStore((state) => state.tickBurnTimer)
  const registerActivity = useCampfireStore((state) => state.registerActivity)
  const openLitAFire = useCampfireStore((state) => state.openLitAFire)
  const sparkBalance = useCampfireStore((state) => state.sparkBalance)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setCommandPaletteOpen((open) => !open)
      }
      if (event.altKey && event.code === 'Space') {
        event.preventDefault()
        setAssistantOpen(true)
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [setAssistantOpen])

  useEffect(() => {
    const timerId = window.setInterval(tickBurnTimer, 1000)
    const noteActivity = () => registerActivity()
    window.addEventListener('keydown', noteActivity)
    window.addEventListener('pointerdown', noteActivity)
    return () => {
      window.clearInterval(timerId)
      window.removeEventListener('keydown', noteActivity)
      window.removeEventListener('pointerdown', noteActivity)
    }
  }, [registerActivity, tickBurnTimer])

  return (
    <div className="flex min-h-screen flex-col bg-[#070709] text-white">
      {/* ── Top Bar ── */}
      <header className="flex h-12 items-center justify-between border-b border-white/[0.08] bg-[#0a0a0d]/80 px-4 backdrop-blur-md">
        <span className="text-sm font-semibold tracking-tight">🔥 Campfire</span>
        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          aria-label="Open command palette"
          className="flex h-8 items-center gap-2 border border-white/[0.09] bg-white/[0.03] px-2.5 text-zinc-500 transition-colors hover:border-white/20 hover:text-white"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden text-[11px] sm:inline">Commands</span>
          <kbd className="hidden border border-white/[0.08] px-1 text-[10px] sm:inline">Ctrl K</kbd>
        </button>
      </header>
      <FloatingCapsuleNav />

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
          <button
            type="button"
            onClick={() => setActivePage('page-shop')}
            className="mt-4 flex w-full items-center justify-between border border-white/[0.08] px-3 py-2 text-[12px] text-zinc-400 transition-colors hover:border-white/20 hover:text-white"
          >
            <span className="flex items-center gap-2"><Store className="h-3.5 w-3.5" /> Shop</span>
            <span className="text-[10px] text-amber-300">{sparkBalance} ✦</span>
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-[#070709]">
          {children}
        </main>
      </div>
      {isAssistantOpen && (
        <div className="fixed inset-0 z-[70] bg-black/35" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setAssistantOpen(false)
        }}>
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="assistant-title"
            className="absolute bottom-0 right-0 top-0 flex w-full max-w-[400px] flex-col border-l border-white/[0.09] bg-[#0C0C0C] p-6 text-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-zinc-300" />
                <h2 id="assistant-title" className="text-sm font-medium">Campfire AI Assistant</h2>
              </div>
              <button type="button" onClick={() => setAssistantOpen(false)} aria-label="Close AI assistant" className="text-zinc-500 transition-colors hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6 border border-white/[0.08] bg-white/[0.02] p-4">
              <p className="text-[13px] leading-relaxed text-zinc-300">Connect an AI engine to start a conversation with your Campfire assistant.</p>
              <p className="mt-2 text-[12px] leading-relaxed text-zinc-500">Your local services and model endpoints can be managed in Connections &amp; AI.</p>
              <button
                type="button"
                onClick={() => {
                  setAssistantOpen(false)
                  setActivePage('page-settings')
                }}
                className="mt-4 border border-white/[0.12] px-3 py-2 text-[12px] text-white transition-colors hover:bg-white/[0.05]"
              >
                Open connection settings
              </button>
            </div>
            <div className="mt-6">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">Dispatch an agent</p>
              <div className="grid gap-2">
                <button type="button" onClick={() => void dispatchAgent('study')} className="border border-white/[0.1] px-3 py-2 text-left text-[12px] text-zinc-300 hover:bg-white/[0.05]">🧬 Study &amp; Flashcard Agent</button>
                <button type="button" onClick={() => void dispatchAgent('code-audit')} className="border border-white/[0.1] px-3 py-2 text-left text-[12px] text-zinc-300 hover:bg-white/[0.05]">💻 Code Audit &amp; Test Agent</button>
                <button type="button" onClick={() => void dispatchAgent('creator')} className="border border-white/[0.1] px-3 py-2 text-left text-[12px] text-zinc-300 hover:bg-white/[0.05]">🎬 Creator Hook &amp; Storyboard Agent</button>
              </div>
            </div>
            <WhisperAction />
            {agentTasks.length > 0 && (
              <div className="mt-6 min-h-0 flex-1 overflow-y-auto border-t border-white/[0.08] pt-4">
                <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500">Recent runs</p>
                <div className="space-y-3">
                  {agentTasks.map((task) => (
                    <article key={task.id} className="border border-white/[0.08] bg-white/[0.02] p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[12px] font-medium text-zinc-200">{task.title}</p>
                        <span className="text-[10px] text-zinc-600">{task.status}</span>
                      </div>
                      {task.output && (
                        <>
                          <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap text-[11px] leading-relaxed text-zinc-400">{task.output}</pre>
                          <button type="button" onClick={() => saveAgentOutput(task.id)} className="mt-2 text-[10px] text-orange-300 hover:text-orange-200">📌 Save Output to Personal Vault</button>
                        </>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
      <CommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
    </div>
  )
}