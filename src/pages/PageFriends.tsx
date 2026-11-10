import { MessageSquare, UserRound } from 'lucide-react'
import { useCampfireStore } from '../store/useCampfireStore'

const collaborators = [
  { name: 'Nova', context: 'Coding in IDE · main.rs', mode: 'coders-developers', tool: 'ide' },
  { name: 'Kai', context: 'Solving doubt on Whiteboard', mode: 'study-group', tool: 'study' },
  { name: 'Rhea', context: 'Silent Pomodoro · 14:20', mode: 'silent-coworking', tool: 'timer' },
]

export function PageFriends() {
  const setActivePage = useCampfireStore((state) => state.setActivePage)
  const syncSquadView = useCampfireStore((state) => state.syncSquadView)

  return (
    <div className="min-h-[calc(100vh-48px)] px-6 py-12 text-white md:px-10">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 border-b border-white/[0.08] pb-5">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-zinc-500">
            <UserRound className="h-4 w-4" />
            Friends
          </div>
          <h1 className="mt-2 text-2xl font-semibold">People around your Campfire</h1>
          <p className="mt-1 text-[13px] text-zinc-500">Recent collaborators from your shared workspace.</p>
        </div>
        <div className="divide-y divide-white/[0.07] border border-white/[0.08] bg-[#0B0B0E] px-5">
          {collaborators.map((person) => (
            <div key={person.name} className="flex items-center justify-between gap-4 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.06] text-sm font-medium">
                  {person.name.slice(0, 1)}
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium">{person.name}</p>
                  <p className="truncate text-[12px] text-zinc-500">
                    <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    {person.context}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => syncSquadView(person.name)}
                  className="border border-white/[0.12] px-3 py-1.5 text-[11px] text-zinc-300 transition-colors hover:bg-white/[0.05] hover:text-white"
                >
                  👁️ Sync View
                </button>
                <button
                  type="button"
                  onClick={() => setActivePage('page-chat')}
                  aria-label={`Message ${person.name}`}
                  className="flex h-8 w-8 items-center justify-center border border-white/[0.12] text-zinc-400 hover:bg-white/[0.05] hover:text-white"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
