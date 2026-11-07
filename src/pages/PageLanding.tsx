import { DevGrid } from '../components/DevGrid'

export function PageLanding() {
  return (
    <div className="relative min-h-screen bg-[#050505] text-white">
      <DevGrid cellSize={12} majorEvery={5} className="absolute inset-0" />
      <div className="relative z-10">
        {/* Design area — elements go here */}
      </div>
    </div>
  )
}