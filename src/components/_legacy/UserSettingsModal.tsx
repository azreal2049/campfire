import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useCampfireStore } from '../../store/useCampfireStore'

const SECTIONS = ['My Account', 'User Profile', 'Voice & Audio', 'Soundscape Mixer', 'Appearance', 'AI Endpoint', 'Keybinds'] as const

export function UserSettingsModal({ onClose }: { onClose: () => void }) {
  const profile = useCampfireStore((state) => state.profile)
  const updateProfile = useCampfireStore((state) => state.updateProfile)
  const [section, setSection] = useState<(typeof SECTIONS)[number]>('My Account')
  const [micTesting, setMicTesting] = useState(false)
  const [micLevel, setMicLevel] = useState(0)
  const [micError, setMicError] = useState('')
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const supportsDeviceEnumeration = typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.enumerateDevices)
  const [saved, setSaved] = useState(false)
  const endpoint = useRef({ stream: null as MediaStream | null, context: null as AudioContext | null, frame: 0 })
  useEffect(() => {
    if (!navigator.mediaDevices?.enumerateDevices) return
    const refreshDevices = () => {
      void navigator.mediaDevices.enumerateDevices().then(setDevices).catch((error: unknown) => setMicError(error instanceof Error ? error.message : 'Could not enumerate audio devices.'))
    }
    refreshDevices()
    navigator.mediaDevices.addEventListener('devicechange', refreshDevices)
    return () => navigator.mediaDevices.removeEventListener('devicechange', refreshDevices)
  }, [])
  useEffect(() => {
    if (!micTesting) return
    if (!navigator.mediaDevices?.getUserMedia) return
    let active = true
    void navigator.mediaDevices.getUserMedia({ audio: {
      ...(profile.inputDeviceId ? { deviceId: { exact: profile.inputDeviceId } } : {}),
      echoCancellation: profile.echoCancellation,
      noiseSuppression: profile.noiseSuppression,
      autoGainControl: profile.autoGainControl,
    } }).then((stream) => {
      if (!active) { stream.getTracks().forEach((track) => track.stop()); return }
      const context = new AudioContext()
      const analyser = context.createAnalyser()
      analyser.fftSize = 256
      context.createMediaStreamSource(stream).connect(analyser)
      const values = new Uint8Array(analyser.frequencyBinCount)
      endpoint.current = { stream, context, frame: 0 }
      const measure = () => {
        analyser.getByteTimeDomainData(values)
        const peak = values.reduce((max, value) => Math.max(max, Math.abs(value - 128)), 0)
        setMicLevel(Math.min(100, Math.round(peak * 1.6 * profile.inputVolume / 100)))
        endpoint.current.frame = requestAnimationFrame(measure)
      }
      measure()
    }).catch((error: unknown) => {
      setMicError(error instanceof Error ? error.message : 'Microphone permission was unavailable.')
      setMicTesting(false)
    })
    return () => {
      active = false
      cancelAnimationFrame(endpoint.current.frame)
      endpoint.current.stream?.getTracks().forEach((track) => track.stop())
      void endpoint.current.context?.close()
      endpoint.current = { stream: null, context: null, frame: 0 }
    }
  }, [micTesting, profile.inputDeviceId, profile.inputVolume, profile.echoCancellation, profile.noiseSuppression, profile.autoGainControl])

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const input = (label: string, key: 'displayName' | 'username' | 'pronouns' | 'bio' | 'customStatus' | 'avatarInitials') => (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">{label}</span>
      <input value={profile[key]} onChange={(event) => updateProfile({ [key]: event.target.value })} className="glass-input w-full rounded-lg px-3 py-2 text-sm text-white outline-none" />
    </label>
  )
  const slider = (label: string, key: 'inputVolume' | 'outputVolume' | 'noiseVolume' | 'rainVolume' | 'crackleVolume' | 'binauralVolume') => (
    <label className="block space-y-2">
      <span className="flex justify-between text-xs text-neutral-300">{label}<span>{profile[key]}%</span></span>
      <input type="range" min="0" max="100" value={profile[key]} onChange={(event) => updateProfile({ [key]: Number(event.target.value) })} className="w-full accent-white" />
    </label>
  )
  const toggle = (label: string, key: 'echoCancellation' | 'noiseSuppression' | 'autoGainControl' | 'reducedMotion' | 'highContrastBorders') => (
    <label className="flex items-center justify-between border-b border-white/[0.06] py-3 text-sm text-neutral-300">
      {label}<input type="checkbox" checked={profile[key]} onChange={(event) => updateProfile({ [key]: event.target.checked })} className="accent-white" />
    </label>
  )
  const toggleMicTest = () => {
    setMicError('')
    if (!micTesting && !navigator.mediaDevices?.getUserMedia) {
      setMicError('Microphone testing is not supported by this browser.')
      return
    }
    setMicTesting((value) => !value)
  }

  return (
    <div className="fixed inset-0 z-[70] flex animate-in fade-in duration-150 bg-[#070709]/95 backdrop-blur-2xl" role="dialog" aria-modal="true" aria-label="User settings">
      <nav className="w-[220px] shrink-0 space-y-1 border-r border-white/[0.07] p-4">
        <p className="px-2 pb-2 pt-3 text-[10px] font-bold tracking-[0.16em] text-neutral-500">USER SETTINGS</p>
        {SECTIONS.slice(0, 2).map((item) => <button key={item} onClick={() => setSection(item)} className={`w-full rounded-lg px-3 py-2 text-left text-sm ${section === item ? 'bg-white/10 text-white' : 'text-neutral-400 hover:bg-white/[0.05]'}`}>{item}</button>)}
        <p className="px-2 pb-2 pt-5 text-[10px] font-bold tracking-[0.16em] text-neutral-500">APP SETTINGS</p>
        {SECTIONS.slice(2).map((item) => <button key={item} onClick={() => setSection(item)} className={`w-full rounded-lg px-3 py-2 text-left text-sm ${section === item ? 'bg-white/10 text-white' : 'text-neutral-400 hover:bg-white/[0.05]'}`}>{item}</button>)}
      </nav>
      <main className="min-w-0 flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 flex items-center justify-between border-b border-white/[0.08] pb-4">
            <h1 className="text-xl font-semibold text-white">{section}</h1>
            <button onClick={onClose} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-neutral-300 hover:bg-white/10"><X className="h-4 w-4" /> ESC</button>
          </div>
          {(section === 'My Account' || section === 'User Profile') && <div className="space-y-5">
            {input('Display Name', 'displayName')}{input('Username (@handle)', 'username')}{input('Pronouns', 'pronouns')}{input('Bio / About Me', 'bio')}{input('Custom Status', 'customStatus')}{input('Avatar Initials', 'avatarInitials')}
            <label className="block space-y-2 text-xs text-neutral-400">Avatar Accent Color<input type="color" value={profile.avatarColor} onChange={(event) => updateProfile({ avatarColor: event.target.value })} className="ml-3 h-8 w-12 rounded border-0 bg-transparent" /></label>
            <p className="text-[10px] text-neutral-500">Profile edits update locally as you type.</p><button onClick={() => { setSaved(true); window.setTimeout(() => setSaved(false), 1600) }} className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black">{saved ? 'Saved ✓' : 'Save Changes'}</button>
          </div>}
          {section === 'Voice & Audio' && <div className="space-y-6">
            <label className="block text-xs text-neutral-400">Input device<select value={profile.inputDeviceId} className="glass-input mt-2 block w-full rounded-lg p-2 text-white" onChange={(event) => updateProfile({ inputDeviceId: event.target.value })}><option value="">Default microphone</option>{devices.filter((device) => device.kind === 'audioinput').map((device) => <option key={device.deviceId} value={device.deviceId}>{device.label || `Microphone ${device.deviceId.slice(0, 6)}`}</option>)}</select></label>
            <label className="block text-xs text-neutral-400">Output device<select value={profile.outputDeviceId} className="glass-input mt-2 block w-full rounded-lg p-2 text-white" onChange={(event) => updateProfile({ outputDeviceId: event.target.value })}><option value="">Default speakers</option>{devices.filter((device) => device.kind === 'audiooutput').map((device) => <option key={device.deviceId} value={device.deviceId}>{device.label || `Speaker ${device.deviceId.slice(0, 6)}`}</option>)}</select></label>
            {!supportsDeviceEnumeration && <p role="status" className="text-[10px] text-amber-300">This browser does not support listing audio devices.</p>}
            {slider('Mic Input Volume', 'inputVolume')}{slider('Master Output Volume', 'outputVolume')}
            <div className="space-y-2 text-xs text-neutral-400">Mic Test Meter · {micLevel}%<div className="h-2 overflow-hidden rounded bg-white/10"><div className="h-full bg-emerald-500 transition-[width] duration-75" style={{ width: `${micLevel}%` }} /></div><button onClick={toggleMicTest} className="rounded border border-white/10 px-3 py-1.5 text-[10px] text-neutral-300">{micTesting ? 'Stop mic test' : 'Start mic test'}</button>{micError && <p role="status" className="text-[10px] text-amber-300">{micError}</p>}</div>
            {toggle('Echo Cancellation', 'echoCancellation')}{toggle('Noise Suppression (Krisp Mode)', 'noiseSuppression')}{toggle('Auto Gain Control', 'autoGainControl')}
          </div>}
          {section === 'Soundscape Mixer' && <div className="space-y-4">
            {slider('Deep Brown Noise', 'noiseVolume')}{slider('Warm Midnight Rain', 'rainVolume')}{slider('Campfire Crackle', 'crackleVolume')}{slider('Binaural Focus Pulse', 'binauralVolume')}
          </div>}
          {section === 'Appearance' && <div className="space-y-4">
            <label className="block text-sm text-neutral-300">Chat Message Density<select value={profile.messageDensity} onChange={(event) => updateProfile({ messageDensity: event.target.value as typeof profile.messageDensity })} className="glass-input mt-2 block w-full rounded-lg p-2 text-white"><option value="cozy">Cozy · avatars</option><option value="compact">Compact · IRC style</option></select></label>
            <label className="block text-sm text-neutral-300">Font Scale<select value={profile.fontScale} onChange={(event) => updateProfile({ fontScale: Number(event.target.value) as 12 | 13 | 14 })} className="glass-input mt-2 block w-full rounded-lg p-2 text-white"><option value="12">12px</option><option value="13">13px</option><option value="14">14px</option></select></label>
            {toggle('Reduced Motion', 'reducedMotion')}{toggle('High-Contrast Borders', 'highContrastBorders')}
          </div>}
          {section === 'AI Endpoint' && <div className="space-y-5"><label className="block space-y-1.5 text-xs text-neutral-400">Chat Completions Base URL<input value={profile.aiBaseUrl} onChange={(event) => updateProfile({ aiBaseUrl: event.target.value })} className="glass-input w-full rounded-lg px-3 py-2 text-sm text-white outline-none" /></label><label className="block space-y-1.5 text-xs text-neutral-400">Model<input value={profile.aiModel} onChange={(event) => updateProfile({ aiModel: event.target.value })} className="glass-input w-full rounded-lg px-3 py-2 text-sm text-white outline-none" /></label><p className="text-[10px] text-neutral-500">Solver requests use this local OpenAI-compatible endpoint. If it is unavailable, Campfire shows an offline study guide instead.</p></div>}
          {section === 'Keybinds' && <div className="divide-y divide-white/[0.07] text-sm">{[['Ctrl + K', 'Open Quick Switcher / Command Palette'], ['Ctrl + Shift + M', 'Toggle Microphone Mute'], ['Ctrl + Shift + D', 'Toggle Deafen'], ['Ctrl + ,', 'Open User Settings'], ['Ctrl + Enter', 'Run active IDE file'], ['Escape', 'Close Active Modal / Popover']].map(([key, value]) => <div key={key} className="flex justify-between py-4 text-neutral-300"><span>{value}</span><kbd className="rounded border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-xs">{key}</kbd></div>)}</div>}
        </div>
      </main>
    </div>
  )
}
