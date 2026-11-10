import { useEffect, useState } from 'react'
import { useCampfireStore } from '../store/useCampfireStore'
import { Folder, Search, ArrowUpRight, Download } from 'lucide-react'
import type { VaultItem, WorkspaceRevision } from '../bridge/rustBridge'

export function PageVault() {
  const vaultItems = useCampfireStore((state) => state.vaultItems)
  const restoreVaultItem = useCampfireStore((state) => state.restoreVaultItem)
  const workspaceRevisions = useCampfireStore((state) => state.workspaceRevisions)

  const downloadItem = (title: string, fileName: string, format: string, content: string) => {
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName || `${title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.${format || 'txt'}`
    anchor.click()
    URL.revokeObjectURL(url)
  }

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
              <VaultTimelapse item={item} revisions={workspaceRevisions} />
              <div className="mt-4 flex items-center justify-between pt-2 border-t border-white/[0.06]">
                <button type="button" onClick={() => restoreVaultItem(item.id)} className="flex items-center gap-1.5 text-xs font-medium text-orange-400 hover:text-orange-300">
                  <span>↗ Restore in Workplace</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => downloadItem(item.title, item.fileName, item.format, item.content)}
                  className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download File
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function VaultTimelapse({ item, revisions }: { item: VaultItem; revisions: WorkspaceRevision[] }) {
  const isCode = /code|project/i.test(item.category) || /\.(ts|tsx|js|py|rs|go|c|cpp)$/i.test(item.fileName)
  const kind = isCode ? 'code' : /study|note|mindmap|doubt/i.test(item.category) ? 'note' : null
  const frames = revisions.filter((revision) =>
    kind !== null &&
    revision.kind === kind &&
    (!isCode || !revision.fileName || revision.fileName === item.fileName),
  )
  const timeline = frames.length > 0
    ? [{ ...frames[0], id: `${frames[0].id}-blank`, content: '' }, ...frames]
    : []
  const [frameIndex, setFrameIndex] = useState(0)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!playing || timeline.length < 2) return
    const timer = window.setInterval(() => {
      setFrameIndex((index) => {
        return index >= timeline.length - 1 ? 0 : index + 1
      })
    }, 850)
    return () => window.clearInterval(timer)
  }, [playing, timeline.length])

  if (!kind || timeline.length === 0) return null
  const frame = timeline[Math.min(frameIndex, timeline.length - 1)]
  return (
    <div className="mt-3 border border-white/[0.08] bg-black/30 p-3">
      <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={() => { setFrameIndex(0); setPlaying((current) => !current) }} className="text-[11px] text-zinc-300 hover:text-white">
          {playing ? 'Ⅱ Pause Timelapse' : '▶ Play Session Timelapse'}
        </button>
        <span className="text-[9px] text-zinc-600">{frameIndex + 1} / {timeline.length}</span>
      </div>
      <input type="range" min={0} max={timeline.length - 1} value={frameIndex} aria-label={`Scrub ${item.title} session timelapse`} onChange={(event) => { setPlaying(false); setFrameIndex(Number(event.target.value)) }} className="mt-2 w-full accent-zinc-200" />
      <pre className="mt-2 max-h-24 overflow-auto whitespace-pre-wrap break-words text-[9px] leading-relaxed text-zinc-500">{frame.content}</pre>
    </div>
  )
}