import { Flame, Search, Settings, Sparkles, ChevronRight, Zap, Clock, Users } from 'lucide-react'
import { useCampfireStore } from '../store/useCampfireStore'

const actionCards = [
  {
    title: 'Reply to...',
    description: 'Jump back into unread mentions, code reviews, and team notes.',
    icon: Zap,
  },
  {
    title: 'Continue where you left',
    description: 'Restore your last workspace, notes, file set, or whiteboard in one click.',
    icon: Clock,
  },
  {
    title: 'Deploy Agent',
    description: 'Summarize a project, generate flashcards, or scaffold into your vault.',
    icon: Sparkles,
  },
] as const

export function PageLobby() {
  const profile = useCampfireStore((state) => state.profile)
  const rooms = useCampfireStore((state) => state.rooms)
  const setActivePage = useCampfireStore((state) => state.setActivePage)
  const setActiveRoom = useCampfireStore((state) => state.setActiveRoom)
  const setActiveWorkspaceView = useCampfireStore((state) => state.setActiveWorkspaceView)

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#050505]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2" onClick={() => setActivePage('page-0')}>
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white">
                <Flame className="h-3.5 w-3.5 text-black" />
              </div>
              <span className="text-sm font-semibold">Campfire</span>
            </button>
            <nav className="hidden items-center gap-4 text-sm text-neutral-400 md:flex">
              <button className="transition-colors hover:text-white" onClick={() => setActivePage('page-chat')}>Rooms</button>
              <button className="transition-colors hover:text-white" onClick={() => setActivePage('page-vault')}>Vault</button>
              <button className="transition-colors hover:text-white" onClick={() => setActivePage('page-workplace')}>Workplace</button>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="hidden items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:border-white/[0.15] hover:text-white md:flex"
            >
              <Search className="h-3 w-3" />
              Search...
            </button>
            <button
              className="rounded-lg border border-white/[0.08] p-2 text-neutral-400 transition-colors hover:border-white/[0.15] hover:text-white"
              onClick={() => setActivePage('page-settings')}
            >
              <Settings className="h-4 w-4" />
            </button>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.08] text-xs font-medium">
              {profile.avatarInitials.slice(0, 2)}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Greeting */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-neutral-500">Radar Home</p>
          <div className="mt-2 flex items-center justify-between">
            <h1 className="text-3xl font-semibold tracking-tight">
              Greeting, {profile.displayName}
            </h1>
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-1.5 text-xs text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Focus streak · 7 days
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="mb-8 grid gap-3 md:grid-cols-3">
          {actionCards.map((card) => (
            <button
              key={card.title}
              className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-left transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
              onClick={() => setActivePage('page-workplace')}
            >
              <card.icon className="mb-3 h-5 w-5 text-neutral-400 transition-colors group-hover:text-white" />
              <h2 className="text-sm font-medium">{card.title}</h2>
              <p className="mt-1.5 text-xs leading-5 text-neutral-500">{card.description}</p>
            </button>
          ))}
        </div>

        {/* Search + CTA */}
        <div className="mb-8 flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2.5">
            <Search className="h-4 w-4 text-neutral-500" />
            <input
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-neutral-600"
              placeholder="Search active rooms, files, or commands..."
              readOnly
            />
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
            onClick={() => setActivePage('page-workplace')}
          >
            <Flame className="h-4 w-4" />
            Lit a Campfire
          </button>
        </div>

        {/* Active Rooms */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-300">Active Rooms</h2>
          <span className="text-xs text-neutral-500">{rooms.length} rooms burning</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <button
              key={room.id}
              className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-left transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
              onClick={() => {
                setActiveRoom(room.id)
                setActiveWorkspaceView('chat')
                setActivePage('page-chat')
              }}
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-white/[0.08] px-2 py-0.5 text-[10px] text-neutral-500">
                  {room.category}
                </span>
                <span className={`h-1.5 w-1.5 rounded-full ${room.isBurning ? 'bg-emerald-400' : 'bg-neutral-600'}`} />
              </div>
              <h3 className="mt-3 text-sm font-medium">{room.name}</h3>
              <p className="mt-1 text-xs text-neutral-500">{room.topic}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {room.participants.length}
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-neutral-600 transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}
