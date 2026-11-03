import { Download, Folder, Search, Sparkles } from 'lucide-react'
import { useState } from 'react'

const vaultFolders = [
  { name: 'Code Projects', count: 12 },
  { name: 'Study Notes & Mindmaps', count: 8 },
  { name: 'Solved Doubts', count: 14 },
  { name: 'Creator Scripts & Cuts', count: 5 },
] as const

export function PageVault() {
  const [query, setQuery] = useState('')

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
    <main className="min-h-screen bg-[#070709] text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Personal vault</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Saved projects and AI notes</h1>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-3 py-2">
            <Search className="h-4 w-4 text-zinc-500" />
            <input
              className="w-64 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search vault..."
              value={query}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {filtered.map((folder) => (
            <article className="rounded-3xl border border-white/10 bg-[#111115] p-4" key={folder.name}>
              <div className="mb-4 flex items-center justify-between">
                <Folder className="h-8 w-8 text-orange-200" />
                <span className="rounded-full border border-white/10 bg-white/[0.02] px-2 py-1 text-xs text-zinc-300">{folder.count}</span>
              </div>
              <h2 className="text-lg font-semibold">{folder.name}</h2>
              <p className="mt-2 text-sm text-zinc-400">Structured notes, exports, and snapshots saved from your rooms.</p>
              <button className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-[#09090B]" type="button" onClick={() => downloadItem(folder.name)}>
                <Download className="h-4 w-4" /> Download</button>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-[#111115] p-4">
          <div className="mb-4 flex items-center gap-2 text-sm text-zinc-300">
            <Sparkles className="h-4 w-4 text-orange-200" />
            Recent items
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {['Project briefing.md', 'Chem summary.json', 'AI summary.txt'].map((item) => (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3 text-sm" key={item}>
                <p className="font-medium text-zinc-100">{item}</p>
                <p className="mt-1 text-xs text-zinc-500">Updated today</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
