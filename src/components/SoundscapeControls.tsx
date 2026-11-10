import { useEffect } from 'react'
import { Pause, Play, Volume2 } from 'lucide-react'
import { useCampfireStore } from '../store/useCampfireStore'
import { setSoundscapeVolume, startSoundscape, stopSoundscape } from '../utils/soundscapeEngine'

const presets = [
  { id: 'campfire', label: '🔥 Campfire Crackle' },
  { id: 'brown', label: '🌊 Deep Brown Noise' },
  { id: 'rain', label: '🌧️ Midnight Rain' },
  { id: 'gamma', label: '🧠 40Hz Gamma Focus' },
] as const

export function SoundscapeControls() {
  const preset = useCampfireStore((state) => state.soundscapePreset)
  const volume = useCampfireStore((state) => state.soundscapeVolume)
  const playing = useCampfireStore((state) => state.soundscapePlaying)
  const setPreset = useCampfireStore((state) => state.setSoundscape)
  const setVolume = useCampfireStore((state) => state.setSoundscapeVolume)
  const setPlaying = useCampfireStore((state) => state.setSoundscapePlaying)
  const showToast = useCampfireStore((state) => state.showToast)

  useEffect(() => {
    if (!playing) {
      stopSoundscape()
      return
    }
    void startSoundscape(preset, useCampfireStore.getState().soundscapeVolume).catch((error: unknown) => {
      setPlaying(false)
      showToast(error instanceof Error ? `Audio unavailable: ${error.message}` : 'Audio unavailable')
    })
    return stopSoundscape
  }, [playing, preset, setPlaying, showToast])

  useEffect(() => {
    setSoundscapeVolume(volume)
  }, [volume])

  return (
    <div className="space-y-3">
      <label className="sr-only" htmlFor="campfire-soundscape">Soundscape preset</label>
      <select
        id="campfire-soundscape"
        value={preset}
        onChange={(event) => setPreset(event.target.value as typeof preset)}
        className="w-full rounded-lg border border-white/10 bg-black/40 px-2.5 py-2 text-[11px] text-zinc-300 outline-none focus:border-white/25"
      >
        {presets.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
      </select>

      <div className="flex h-7 items-center gap-1" aria-hidden="true">
        {Array.from({ length: 28 }, (_, index) => (
          <span
            key={index}
            className={`flex-1 rounded-full bg-orange-300/80 ${playing ? 'animate-pulse' : ''}`}
            style={{
              height: `${5 + ((index * 17) % 18)}px`,
              animationDelay: `${(index % 7) * 70}ms`,
              animationDuration: `${450 + (index % 5) * 100}ms`,
              opacity: playing ? 0.75 : 0.3,
            }}
          />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setPlaying(!playing)}
          aria-label={playing ? 'Pause soundscape' : 'Play soundscape'}
          className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-black hover:bg-zinc-200"
        >
          <span className="flex items-center gap-1">{playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}{playing ? 'Pause' : 'Play'}</span>
        </button>
        <Volume2 className="h-3.5 w-3.5 text-zinc-500" />
        <input
          type="range"
          min="0"
          max="0.5"
          step="0.01"
          value={volume}
          aria-label="Soundscape volume"
          onChange={(event) => setVolume(Number(event.target.value))}
          className="h-1 flex-1 accent-orange-400"
        />
      </div>
    </div>
  )
}
