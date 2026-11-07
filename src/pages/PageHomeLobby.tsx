import { DevGrid } from '../components/DevGrid'

export function PageHomeLobby() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <DevGrid cellSize={20} majorEvery={5} className="absolute inset-0">
        {/* Place elements here using absolute positioning or grid area */}
      </DevGrid>
    </div>
  )
}