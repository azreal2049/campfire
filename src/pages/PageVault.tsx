import { ArrowLeft, Download, Folder, Search, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useCampfireStore } from '../store/useCampfireStore'

const vaultFolders = [
  { name: 'Code Projects', count: 12 },
  { name: 'Study Notes & Mindmaps', count: 8 },
  { name: 'Solved Doubts', count: 14 },
  { name: 'Creator Scripts & Cuts', count: 5 },
] as const

export function PageVault() {
  const [query, setQuery] = useState('')
  const setActivePage = useCampfireStore((state) => state.setActivePage)

  const filtered = vaultFolders.filter((folder) => folder.name.toLowerCase().includes(query.toLowerCase()))

  const downloadItem = (title: string) => {
    const blob = new Blob([`Campfire vault export: ${title}`], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${title.toLowerCase().replace(/\s+/g, '-')}.txt`
    anchor.click()
    URL.revokeObjectURL(url)
  }

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
            <h1 className="text-sm font-medium">Personal Vault</h1>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-1.5">
            <Search className="h-3.5 w-3.5 text-neutral-500" />
            <input
              className="w-48 bg-transparent text-xs text-white outline-none placeholder:text-neutral-600"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search vault..."
              value={query}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Folders Grid */}
        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((folder) => (
            <div
              key={folder.name}
              className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
            >
              <div className="mb-4 flex items-center justify-between">
                <Folder className="h-6 w-6 text-neutral-500 transition-colors group-hover:text-white" />
                <span className="rounded-full border border-white/[0.08] px-2 py-0.5 text-[10px] text-neutral-500">
                  {folder.count}
                </span>
              </div>
              <h2 className="text-sm font-medium">{folder.name}</h2>
              <p className="mt-1.5 text-xs text-neutral-500">
                Structured notes, exports, and snapshots.
              </p>
              <button
                className="mt-4 flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-xs text-neutral-300 transition-colors hover:border-white/[0.15] hover:text-white"
                onClick={() => downloadItem(folder.name)}
              >
                <Download className="h-3 w-3" />
                Export
              </button>
            </div>
          ))}
        </div>

        {/* Recent Items */}
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-neutral-500" />
          <h2 className="text-sm font-medium text-neutral-300">Recent items</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {['Project briefing.md', 'Chem summary.json', 'AI summary.txt'].map((item) => (
            <div
              key={item}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:border-white/[0.12]"
            >
              <p className="text-sm font-medium">{item}</p>
              <p className="mt-1 text-xs text-neutral-500">Updated today</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
