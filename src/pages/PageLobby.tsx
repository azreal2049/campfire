import { Flame, Sparkles, Settings, Search } from 'lucide-react'
import { useCampfireStore } from '../store/useCampfireStore'

const actionCards = [
  {
    title: 'Reply to...',
    description: 'Jump back into unread mentions, code reviews, and team notes.',
    accent: 'from-orange-500/20 to-amber-500/10',
  },
  {
    title: 'Continue where you left',
    description: 'Restore your last workspace, notes, file set, or whiteboard in one click.',
    accent: 'from-sky-500/20 to-cyan-500/10',
  },
  {
    title: 'Deploy Agent',
    description: 'Summarize a project, generate flashcards, or scaffold into your vault.',
    accent: 'from-violet-500/20 to-fuchsia-500/10',
  },
] as const

export function PageLobby() {
  const profile = useCampfireStore((state) => state.profile)
  const setActivePage = useCampfireStore((state) => state.setActivePage)
  const setActiveWorkspaceView = useCampfireStore((state) => state.setActiveWorkspaceView)

  return (
    <main className="min-h-screen bg-[#070709] text-white">
      <header className="border-b border-white/10 bg-[#0b0b0d]/90 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-orange-300/25 bg-orange-500/10">
              <Flame className="h-4 w-4 text-orange-200" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">Campfire</p>
            </div>
          </div>

          <nav className="flex items-center gap-2 text-sm text-zinc-300">
            <button className="rounded-full border border-white/10 bg-white/3 px-3 py-2 hover:border-white/20" type="button">Friends</button>
            <button className="rounded-full border border-white/10 bg-white/3 px-3 py-2 hover:border-white/20" type="button">Shop</button>
            <button className="rounded-full border border-white/10 bg-white/3 px-3 py-2 hover:border-white/20" type="button" onClick={() => setActivePage('page-vault')}>Vault</button>
            <button className="rounded-full border border-white/10 bg-white/3 p-2.5 hover:border-white/20" type="button" aria-label="Settings" onClick={() => setActivePage('page-settings')}>
              <Settings className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3">
          <div className="flex flex-wrap gap-2 text-sm text-zinc-300">
            <button className="rounded-lg border border-white/10 px-3 py-2 hover:bg-white/[0.04]" type="button">File ▾</button>
            <button className="rounded-lg border border-white/10 px-3 py-2 hover:bg-white/[0.04]" type="button">Sessions ▾</button>
            <button className="rounded-lg border border-white/10 px-3 py-2 hover:bg-white/[0.04]" type="button">Help ▾</button>
          </div>

          <div className="inline-flex rounded-full border border-white/10 bg-[#111115] p-1 text-sm">
            <button
              className={`rounded-full px-4 py-2 ${profile.role === 'developer' ? 'bg-white text-[#070709]' : 'text-zinc-300'}`}
              onClick={() => setActiveWorkspaceView('chat')}
              type="button"
            >
              Chat
            </button>
            <button
              className={`rounded-full px-4 py-2 ${profile.role === 'student' ? 'bg-white text-[#070709]' : 'text-zinc-300'}`}
              onClick={() => setActiveWorkspaceView('workplace')}
              type="button"
            >
              Workplace
            </button>
          </div>
        </div>

        <section className="mb-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Radar home</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight">Greeting, ~ {profile.displayName} ~</h1>
            </div>
            <div className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-sm text-emerald-200">
              🔥 Focus streak 7 days
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {actionCards.map((card) => (
            <button
              className={`rounded-2xl border border-white/10 bg-gradient-to-br ${card.accent} p-4 text-left transition hover:border-white/20`}
              key={card.title}
              onClick={() => setActivePage('page-workplace')}
              type="button"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Workflow</p>
              <h2 className="mt-3 text-xl font-semibold">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-300">{card.description}</p>
            </button>
          ))}
        </section>

        <section className="mt-8 flex flex-col gap-4 rounded-3xl border border-white/10 bg-[#111115] p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-[#0b0b0d] px-4 py-3 text-zinc-300">
            <Search className="h-4 w-4 text-zinc-500" />
            <input
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
              placeholder="Search active rooms, files, or commands..."
              readOnly
              type="text"
            />
          </div>

          <button
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#09090B]"
            onClick={() => setActivePage('page-workplace')}
            type="button"
          >
            <Sparkles className="h-4 w-4" />
            Search / Lit a Campfire
          </button>
        </section>
      </div>
    </main>
  )
}
