import { Download, FileCode2, FolderKanban, MonitorPlay, Sparkles, TerminalSquare, Wand2 } from 'lucide-react'
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
  const setActiveWorkspaceView = useCampfireStore((state) => state.setActiveWorkspaceView)

  return (
    <main className="min-h-screen bg-[#070709] text-white">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3">
          <div className="flex flex-wrap gap-2 text-sm text-zinc-300">
            <button className="rounded-lg border border-white/10 px-3 py-2 hover:bg-white/[0.04]" type="button">File ▾</button>
            <button className="rounded-lg border border-white/10 px-3 py-2 hover:bg-white/[0.04]" type="button">Sessions ▾</button>
            <button className="rounded-lg border border-white/10 px-3 py-2 hover:bg-white/[0.04]" type="button">Help ▾</button>
          </div>

          <div className="inline-flex rounded-full border border-white/10 bg-[#111115] p-1 text-sm">
            <button className="rounded-full px-4 py-2 text-zinc-300" onClick={() => setActiveWorkspaceView('chat')} type="button">Chat</button>
            <button className="rounded-full bg-white px-4 py-2 text-[#070709]" onClick={() => setActiveWorkspaceView('workplace')} type="button">Workplace</button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm text-zinc-300"><FolderKanban className="h-4 w-4" /> Workspace</div>
            <p className="text-2xl font-semibold">8</p>
            <p className="mt-2 text-sm text-zinc-500">Campfire toolsets active</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm text-zinc-300"><MonitorPlay className="h-4 w-4" /> Preview</div>
            <p className="text-2xl font-semibold">Live</p>
            <p className="mt-2 text-sm text-zinc-500">Browser preview ready</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm text-zinc-300"><TerminalSquare className="h-4 w-4" /> Runtime</div>
            <p className="text-2xl font-semibold">Piston</p>
            <p className="mt-2 text-sm text-zinc-500">Local code execution</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm text-zinc-300"><Sparkles className="h-4 w-4" /> AI</div>
            <p className="text-2xl font-semibold">Local</p>
            <p className="mt-2 text-sm text-zinc-500">Fallback-ready offline</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {campfireTools.map((tool) => (
            <article className="rounded-3xl border border-white/10 bg-[#111115] p-4" key={`${tool.hub}-${tool.title}`}>
              <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-zinc-500">
                <span>{tool.hub}</span>
                <Wand2 className="h-3.5 w-3.5 text-orange-200" />
              </div>
              <h2 className="text-xl font-semibold">{tool.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-300">{tool.blurb}</p>
              <div className="mt-5 flex items-center justify-between gap-2">
                <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-zinc-200" type="button">
                  <FileCode2 className="h-4 w-4" /> Open
                </button>
                <button className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-[#09090B]" type="button">
                  <Download className="h-4 w-4" /> Save
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5 text-sm text-zinc-200" onClick={() => setActivePage('page-lobby')} type="button">Return to Lobby</button>
          <button className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5 text-sm text-zinc-200" onClick={() => setActivePage('page-vault')} type="button">Open Vault</button>
        </div>
      </div>
    </main>
  )
}
