import { ArrowUpRight, BookOpen, FileText } from 'lucide-react'
import { useCampfireStore } from '../store/useCampfireStore'

export function PageNotes() {
  const vaultItems = useCampfireStore((state) => state.vaultItems)
  const setActivePage = useCampfireStore((state) => state.setActivePage)

  return (
    <div className="min-h-[calc(100vh-48px)] px-6 py-12 text-white md:px-10">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6 border-b border-white/[0.08] pb-5">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-zinc-500">
            <BookOpen className="h-4 w-4" />
            Notes / Journal
          </div>
          <h1 className="mt-2 text-2xl font-semibold">Your notes</h1>
          <p className="mt-1 text-[13px] text-zinc-500">A journal of work captured in your Campfire.</p>
        </div>
        {vaultItems.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {vaultItems.map((item) => (
              <article key={item.id} className="border border-white/[0.08] bg-[#0B0B0E] p-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-zinc-500">
                    <FileText className="h-3.5 w-3.5" />
                    {item.category}
                  </span>
                  <time className="text-[11px] text-zinc-600">{item.date}</time>
                </div>
                <h2 className="mt-3 text-[15px] font-medium">{item.title}</h2>
                {item.snippet && <p className="mt-2 line-clamp-3 text-[12px] leading-relaxed text-zinc-500">{item.snippet}</p>}
                <button
                  type="button"
                  onClick={() => setActivePage('page-vault')}
                  className="mt-5 flex items-center gap-1.5 text-[12px] text-zinc-400 transition-colors hover:text-white"
                >
                  Open in Personal Vault <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </article>
            ))}
          </div>
        ) : (
          <p className="border border-white/[0.08] bg-[#0B0B0E] p-6 text-[13px] text-zinc-500">Your journal is empty. Save a note to your Personal Vault to see it here.</p>
        )}
      </div>
    </div>
  )
}
