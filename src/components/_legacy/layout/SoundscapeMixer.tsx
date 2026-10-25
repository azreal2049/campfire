import { useCallback, useEffect, useRef, useState } from 'react'
import { useCampfireStore } from '../../../store/useCampfireStore'

type Track = 'noiseVolume' | 'rainVolume' | 'crackleVolume' | 'binauralVolume'
type AudioContextWithSinkId = AudioContext & { setSinkId?: (deviceId: string) => Promise<void> }
const TRACKS: { key: Track; label: string; description: string }[] = [
  { key: 'noiseVolume', label: '🌊 Deep Brown Noise', description: 'Low-passed procedural noise' },
  { key: 'rainVolume', label: '🌧️ Warm Midnight Rain', description: 'Soft filtered pink noise' },
  { key: 'crackleVolume', label: '🔥 Campfire Hearth Crackle', description: 'Gentle filtered ember texture' },
  { key: 'binauralVolume', label: '🎧 Binaural 40Hz Gamma Focus Pulse', description: '200Hz / 240Hz stereo tone' },
]

function makeNoiseBuffer(context: AudioContext, track: Track): AudioBuffer {
  const buffer = context.createBuffer(1, context.sampleRate * 4, context.sampleRate)
  const channel = buffer.getChannelData(0)
  let previous = 0
  for (let index = 0; index < channel.length; index += 1) {
    const white = Math.random() * 2 - 1
    previous = track === 'noiseVolume' ? (previous + 0.025 * white) / 1.025 : track === 'rainVolume' ? (previous + white) * 0.5 : Math.random() > 0.997 ? white : previous * 0.94
    channel[index] = previous * (track === 'crackleVolume' && Math.abs(previous) > 0.4 ? 3 : 0.7)
  }
  return buffer
}

export function SoundscapeMixer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const profile = useCampfireStore((state) => state.profile)
  const updateProfile = useCampfireStore((state) => state.updateProfile)
  const contextRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const gainRef = useRef<Partial<Record<Track, GainNode>>>({})
  const cleanupsRef = useRef<Partial<Record<Track, () => void>>>({})
  const profileRef = useRef(profile)
  const [audioError, setAudioError] = useState('')
  const noiseVolume = profile.noiseVolume
  const rainVolume = profile.rainVolume
  const crackleVolume = profile.crackleVolume
  const binauralVolume = profile.binauralVolume

  useEffect(() => {
    profileRef.current = profile
  }, [profile])

  useEffect(() => {
    const context = contextRef.current
    if (masterGainRef.current && context) {
      masterGainRef.current.gain.setTargetAtTime(profile.outputVolume / 100, context.currentTime, 0.06)
    }
    if (context) for (const track of TRACKS) {
      const value = track.key === 'noiseVolume' ? noiseVolume : track.key === 'rainVolume' ? rainVolume : track.key === 'crackleVolume' ? crackleVolume : binauralVolume
      const gain = gainRef.current[track.key]
      if (value === 0 && cleanupsRef.current[track.key]) {
        cleanupsRef.current[track.key]?.()
        delete cleanupsRef.current[track.key]
        delete gainRef.current[track.key]
      } else if (gain) gain.gain.setTargetAtTime(value / 100 * 0.18, context.currentTime, 0.06)
    }
  }, [noiseVolume, rainVolume, crackleVolume, binauralVolume, profile.outputVolume])

  useEffect(() => {
    const context = contextRef.current as AudioContextWithSinkId | null
    if (!context) return
    if (!context.setSinkId) return
    void context.setSinkId(profile.outputDeviceId).then(() => setAudioError('')).catch((error: unknown) => {
      setAudioError(error instanceof Error ? error.message : 'Could not select the audio output device.')
    })
  }, [profile.outputDeviceId])

  useEffect(() => () => {
    for (const cleanup of Object.values(cleanupsRef.current)) cleanup?.()
    void contextRef.current?.close()
  }, [])

  const startTrack = useCallback(async (track: Track) => {
    if (!contextRef.current) {
      const context = new AudioContext()
      const masterGain = context.createGain()
      masterGain.gain.value = profileRef.current.outputVolume / 100
      masterGain.connect(context.destination)
      contextRef.current = context
      masterGainRef.current = masterGain
    }
    const context = contextRef.current
    const outputDeviceId = profileRef.current.outputDeviceId
    const sinkContext = context as AudioContextWithSinkId
    if (sinkContext.setSinkId) await sinkContext.setSinkId(outputDeviceId)
    else if (outputDeviceId) throw new Error('This browser does not support selecting an audio output device.')
    if (context.state === 'suspended') await context.resume()
    if (cleanupsRef.current[track]) return
    const gain = context.createGain()
    gain.gain.value = profileRef.current[track] / 100 * 0.18
    gain.connect(masterGainRef.current ?? context.destination)
    gainRef.current[track] = gain
    if (track === 'binauralVolume') {
      const left = context.createOscillator()
      const right = context.createOscillator()
      const leftPan = context.createStereoPanner()
      const rightPan = context.createStereoPanner()
      left.frequency.value = 200
      right.frequency.value = 240
      leftPan.pan.value = -1
      rightPan.pan.value = 1
      left.connect(leftPan).connect(gain)
      right.connect(rightPan).connect(gain)
      left.start()
      right.start()
      cleanupsRef.current[track] = () => { left.stop(); right.stop(); gain.disconnect() }
      return
    }
    const buffer = makeNoiseBuffer(context, track)
    const source = context.createBufferSource()
    source.buffer = buffer
    source.loop = true
    if (track === 'noiseVolume') {
      const filter = context.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = 360
      source.connect(filter).connect(gain)
    } else if (track === 'rainVolume') {
      const filter = context.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.value = 1400
      filter.Q.value = 0.45
      source.connect(filter).connect(gain)
    } else {
      const filter = context.createBiquadFilter()
      filter.type = 'highpass'
      filter.frequency.value = 550
      source.connect(filter).connect(gain)
    }
    source.start()
    cleanupsRef.current[track] = () => { source.stop(); gain.disconnect() }
  }, [])

  const setVolume = (track: Track, value: number) => {
    updateProfile({ [track]: value, ...(track === 'noiseVolume' ? { brownNoise: value > 0 } : {}) })
    if (value > 0) void startTrack(track).catch((error: unknown) => setAudioError(error instanceof Error ? error.message : 'Audio track could not start.'))
    else {
      cleanupsRef.current[track]?.()
      delete cleanupsRef.current[track]
      delete gainRef.current[track]
    }
  }
  useEffect(() => {
    if (!open) return
    for (const track of TRACKS) {
      const value = track.key === 'noiseVolume' ? noiseVolume : track.key === 'rainVolume' ? rainVolume : track.key === 'crackleVolume' ? crackleVolume : binauralVolume
      if (value > 0) void startTrack(track.key).catch((error: unknown) => setAudioError(error instanceof Error ? error.message : 'Audio track could not start.'))
    }
  }, [open, noiseVolume, rainVolume, crackleVolume, binauralVolume, startTrack])

  if (!open) return null

  return <div className="absolute bottom-[66px] right-24 z-40 w-[290px] rounded-xl border border-white/10 bg-[#111114]/95 p-3 shadow-2xl backdrop-blur-xl">
    <header className="mb-3 flex items-center justify-between"><div><h3 className="text-xs font-semibold text-white">Soundscape Studio</h3><p className="text-[9px] text-neutral-500">Procedural Web Audio · no external audio</p></div><button onClick={onClose} aria-label="Close soundscape" className="text-neutral-500">×</button></header>
    <div className="space-y-3">{TRACKS.map((track) => <label key={track.key} className="block rounded-lg border border-white/[0.06] p-2"><span className="flex justify-between text-[10px] text-neutral-200"><span>{track.label}</span><span>{profile[track.key]}%</span></span><span className="mt-0.5 block text-[9px] text-neutral-600">{track.description}</span><input type="range" min="0" max="100" value={profile[track.key]} onChange={(event) => setVolume(track.key, Number(event.target.value))} className="mt-1 w-full accent-white" /></label>)}</div>
    {audioError && <p role="alert" className="mt-2 text-[10px] text-red-300">{audioError}</p>}
    <button onClick={() => { for (const item of TRACKS) setVolume(item.key, 0) }} className="mt-3 w-full rounded-lg border border-white/10 py-1.5 text-[10px] text-neutral-400 hover:bg-white/[0.05]">Stop all tracks</button>
  </div>
}
