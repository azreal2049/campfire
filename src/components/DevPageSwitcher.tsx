import { useCampfireStore } from '../store/useCampfireStore'

const pages = [
  { id: 'page-home', label: 'Home' },
  { id: 'page-chat', label: 'Chat' },
  { id: 'page-workplace', label: 'Workplace' },
  { id: 'page-vault', label: 'Vault' },
  { id: 'page-settings', label: 'Settings' },
]

export function DevPageSwitcher() {
  const activePage = useCampfireStore((state) => state.activePage)
  const setActivePage = useCampfireStore((state) => state.setActivePage)

  return (
    <div className="fixed bottom-3 left-3 z-50 flex items-center gap-1 rounded-lg border border-white/10 bg-[#0a0a0d]/95 px-2 py-1.5 backdrop-blur-md">
      <span className="mr-1 text-[10px] font-mono uppercase tracking-wider text-zinc-600">
        Pages
      </span>
      {pages.map((p) => (
        <button
          key={p.id}
          onClick={() => setActivePage(p.id)}
          className={`rounded px-2.5 py-1 text-[11px] font-medium transition ${
            activePage === p.id
              ? 'bg-white/10 text-white'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}