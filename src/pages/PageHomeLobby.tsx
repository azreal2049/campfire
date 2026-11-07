import { DevGrid } from '../components/DevGrid'

export function PageHomeLobby() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <DevGrid columns={12} rows={8} cellSize={50} gap={8} showLabels className="p-8">
        <div style={{ gridArea: '1 / 1 / 3 / 5' }} className="flex items-center justify-center rounded border border-emerald-500/30 bg-emerald-500/10 p-4">
          <span className="text-sm text-emerald-300">Element A — drop here</span>
        </div>
        <div style={{ gridArea: '1 / 5 / 3 / 9' }} className="flex items-center justify-center rounded border border-sky-500/30 bg-sky-500/10 p-4">
          <span className="text-sm text-sky-300">Element B</span>
        </div>
        <div style={{ gridArea: '1 / 9 / 3 / 13' }} className="flex items-center justify-center rounded border border-violet-500/30 bg-violet-500/10 p-4">
          <span className="text-sm text-violet-300">Element C</span>
        </div>
        <div style={{ gridArea: '3 / 1 / 5 / 7' }} className="flex items-center justify-center rounded border border-amber-500/30 bg-amber-500/10 p-4">
          <span className="text-sm text-amber-300">Element D</span>
        </div>
        <div style={{ gridArea: '3 / 7 / 5 / 13' }} className="flex items-center justify-center rounded border border-pink-500/30 bg-pink-500/10 p-4">
          <span className="text-sm text-pink-300">Element E</span>
        </div>
        <div style={{ gridArea: '5 / 1 / 8 / 5' }} className="flex items-center justify-center rounded border border-cyan-500/30 bg-cyan-500/10 p-4">
          <span className="text-sm text-cyan-300">Element F</span>
        </div>
        <div style={{ gridArea: '5 / 5 / 8 / 9' }} className="flex items-center justify-center rounded border border-rose-500/30 bg-rose-500/10 p-4">
          <span className="text-sm text-rose-300">Element G</span>
        </div>
        <div style={{ gridArea: '5 / 9 / 8 / 13' }} className="flex items-center justify-center rounded border border-lime-500/30 bg-lime-500/10 p-4">
          <span className="text-sm text-lime-300">Element H</span>
        </div>
      </DevGrid>
    </div>
  )
}