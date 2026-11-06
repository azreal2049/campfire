import { ArrowLeft, FileCode2, FolderKanban, MonitorPlay, Sparkles, TerminalSquare, Wand2 } from 'lucide-react'
import { useCampfireStore } from '../store/useCampfireStore'

const campfireTools = [
  {
    hub: 'Technical Hub',
    title: 'Study Group',
    blurb: 'Whiteboard + notes + focus timer + solver.',
  },
  {
    hub: 'Technical Hub',
    title: 'Coders x Developers',
    blurb: 'IDE, browser preview, test runner, terminal layer.',
  },
  {
    hub: 'Social Hub',
    title: 'Office Hours',
    blurb: 'Pair study, quick reviews, pin important context.',
  },
  {
    hub: 'Social Hub',
    title: 'Community Desk',
    blurb: 'Shared Q&A and team feedback loops.',
  },
  {
    hub: 'Creative Hub',
    title: 'Creators',
    blurb: 'Scripts, hooks, concept boards, and edits.',
  },
  {
    hub: 'Creative Hub',
    title: 'Editors',
    blurb: 'Cuts, drafts, outlines, and creative review.',
  },
  {
    hub: 'Focus Hub',
    title: 'Deep Work',
    blurb: 'Pomodoro blocks, prompts, and structured sessions.',
  },
  {
    hub: 'Focus Hub',
    title: 'Reset Room',
    blurb: 'Recenter, journal, and reset focus state.',
  },
] as const

export function PageWorkplace() {
  const setActivePage = useCampfireStore((state) => state.setActivePage)

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#050505]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-white/[0.04] hover:text-white"
              onClick={() => setActivePage('page-lobby')}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h1 className="text-sm font-medium">Workplace</h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            8 toolsets active
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats Row */}
        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <FolderKanban className="h-3.5 w-3.5" />
              Workspace
            </div>
            <p className="mt-2 text-xl font-semibold">8</p>
            <p className="mt-1 text-xs text-neutral-500">Campfire toolsets active</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <MonitorPlay className="h-3.5 w-3.5" />
              Preview
            </div>
            <p className="mt-2 text-xl font-semibold">Live</p>
            <p className="mt-1 text-xs text-neutral-500">Browser preview ready</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <TerminalSquare className="h-3.5 w-3.5" />
              Runtime
            </div>
            <p className="mt-2 text-xl font-semibold">Piston</p>
            <p className="mt-1 text-xs text-neutral-500">Local code execution</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <Sparkles className="h-3.5 w-3.5" />
              AI
            </div>
            <p className="mt-2 text-xl font-semibold">Local</p>
            <p className="mt-1 text-xs text-neutral-500">Fallback-ready offline</p>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="mb-4">
          <h2 className="text-sm font-medium text-neutral-300">Toolsets</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {campfireTools.map((tool) => (
            <div
              key={`${tool.hub}-${tool.title}`}
              className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-neutral-500">{tool.hub}</span>
                <Wand2 className="h-3.5 w-3.5 text-neutral-600 transition-colors group-hover:text-white" />
              </div>
              <h3 className="text-sm font-medium">{tool.title}</h3>
              <p className="mt-1.5 text-xs leading-5 text-neutral-500">{tool.blurb}</p>
              <div className="mt-4 flex items-center gap-2">
                <button className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-xs text-neutral-300 transition-colors hover:border-white/[0.15] hover:text-white">
                  <FileCode2 className="h-3 w-3" />
                  Open
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
