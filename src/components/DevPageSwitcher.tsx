import { useState } from 'react'
import { Wrench, ChevronUp, ChevronDown } from 'lucide-react'
import { useCampfireStore } from '../store/useCampfireStore'
import type { PageSlot } from '../types/campfire'

const pages: { id: PageSlot; label: string }[] = [
  { id: 'page-home', label: 'Home / Lobby' },
  { id: 'page-chat', label: 'Chat' },
  { id: 'page-workplace', label: 'Workplace' },
  { id: 'page-friends', label: 'Friends' },
  { id: 'page-vault', label: 'Personal Vault' },
  { id: 'page-shop', label: 'Shop' },
  { id: 'page-user-settings', label: 'User Settings' },
  { id: 'page-app-settings', label: 'App Settings' },
  { id: 'page-signin', label: 'Sign In Page' },
]

export function DevPageSwitcher() {
  const [collapsed, setCollapsed] = useState(false)
  const activePage = useCampfireStore((state) => state.activePage)
  const setActivePage = useCampfireStore((state) => state.setActivePage)

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col items-start gap-1 rounded-xl border border-white/10 bg-[#0d0d11]/95 p-2 shadow-2xl backdrop-blur-xl">
      <div className="flex w-full items-center justify-between gap-3 text-[11px] font-semibold text-zinc-400">
        <span className="flex items-center gap-1.5">
          <Wrench className="h-3 w-3 text-orange-400" />
          Dev Page Switcher
        </span>
        <button
          className="rounded p-0.5 hover:bg-white/10 hover:text-white"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {!collapsed && (
        <div className="mt-1 flex flex-wrap gap-1 max-w-sm">
          {pages.map((p) => {
            const active = activePage === p.id
            return (
              <button
                key={p.id}
                onClick={() => setActivePage(p.id)}
                className={`rounded px-2 py-1 text-[10px] font-medium transition ${
                  active
                    ? 'bg-white text-black font-semibold'
                    : 'border border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
