import { useCampfireStore } from '../store/useCampfireStore'
import { Folder, Search, ArrowUpRight, Code, BookOpen, Sparkles, Trash2 } from 'lucide-react'

export function PageVault() {
  const vaultItems = useCampfireStore((state) => state.vaultItems)

  return (
    <div className="min-h-[calc(100vh-48px)] bg-[#070709] p-8 text-white select-none">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-orange-400">
              <Folder className="h-4 w-4" />
              Personal Vault
            </div>
            <h1 className="mt-1 text-2xl font-bold">Captured Workspaces & Notes</h1>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search vault..."
              className="w-64 rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
            />
            <Search className="absolute right-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vaultItems.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-white/10 bg-[#111115] p-5 shadow-lg transition hover:border-white/20"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  {item.category}
                </span>
                <span className="text-[11px] text-zinc-500">{item.date}</span>
              </div>
              <h3 className="mt-3 text-base font-semibold text-white">{item.title}</h3>
              {item.snippet && (
                <p className="mt-2 rounded-lg bg-black/50 p-3 text-xs font-mono text-zinc-400 line-clamp-2">
                  {item.snippet}
                </p>
              )}
              <div className="mt-4 flex items-center justify-between pt-2 border-t border-white/[0.06]">
                <button className="flex items-center gap-1.5 text-xs font-medium text-orange-400 hover:text-orange-300">
                  <span>Re-open in Workplace</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}