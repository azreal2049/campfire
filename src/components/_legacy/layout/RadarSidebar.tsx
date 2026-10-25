import { Flame, Plus, Radio, Search, Settings, Mic, MicOff, Headphones, Volume2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '../../../lib/cn'
import {
  formatTimer,
  useCampfireStore,
} from '../../../store/useCampfireStore'
import type { TimerMode } from '../../../types/campfire'
import { UserSettingsModal } from '../UserSettingsModal'

const MODE_LABEL: Record<TimerMode, string> = {
  countdown: 'COUNTDOWN',
  deadman: 'DEADMAN',
  pomodoro: 'POMODORO',
}

export function RadarSidebar() {
  const rooms = useCampfireStore((s) => s.rooms)
  const activeRoomId = useCampfireStore((s) => s.activeRoomId)
  const setActiveRoom = useCampfireStore((s) => s.setActiveRoom)
  const openCreateModal = useCampfireStore((s) => s.openCreateModal)
  const profile = useCampfireStore((s) => s.profile)
  const updateProfile = useCampfireStore((s) => s.updateProfile)
  const setActiveSupplyTab = useCampfireStore((s) => s.setActiveSupplyTab)
  const [profileMenu, setProfileMenu] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [copyNotice, setCopyNotice] = useState('')

  const activeRoom = rooms.find((r) => r.id === activeRoomId) ?? null
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSwitcherOpen(false)
        setProfileMenu(false)
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSwitcherOpen(true)
      }
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'm') updateProfile({ muted: !profile.muted })
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'd') {
        const deafened = !profile.deafened
        updateProfile({ deafened, muted: deafened || profile.muted })
      }
      if ((event.ctrlKey || event.metaKey) && event.key === ',') setSettingsOpen(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [profile.muted, profile.deafened, updateProfile])

  return (
    <div className="relative flex h-full w-full min-h-0 shrink-0 flex-col">
      <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/15 bg-white/[0.06]">
          <Flame className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-wide text-white">
            CAMPFIRE
          </p>
          <p className="flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-neutral-400">
            <Radio className="h-3 w-3 text-white/70" />
            Radar live
          </p>
        </div>
      </div>

      <div className="px-3 py-3">
        <button type="button" onClick={() => setSwitcherOpen(true)} className="glass-input mb-2 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs text-neutral-400 hover:text-white">
          <Search className="h-3.5 w-3.5" /> Find or start a campfire... <kbd className="ml-auto rounded border border-white/10 px-1.5 py-0.5 text-[9px]">Ctrl K</kbd>
        </button>
        <button
          type="button"
          onClick={openCreateModal}
          className="glass-btn flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-white transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu active:scale-[0.97] hover:bg-white/[0.12] hover:border-white/25"
        >
          <Plus className="h-4 w-4" />
          Light a Campfire
        </button>
      </div>

      <div className="scrollbar-thin flex-1 space-y-1.5 overflow-y-auto px-2 pb-4">
        <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Active embers · {rooms.length}
        </p>
        {rooms.map((room) => {
          const isActive = room.id === activeRoom?.id
          const progress =
            room.initialSeconds > 0
              ? (room.remainingSeconds / room.initialSeconds) * 100
              : 0

          return (
            <button
              key={room.id}
              type="button"
              onClick={() => setActiveRoom(room.id)}
              className={cn(
                'group w-full rounded-xl px-3 py-3 text-left transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu active:scale-[0.97]',
                isActive ? 'glass-card-active' : 'glass-card border-transparent',
              )}
            >
              <div className="mb-1.5 flex items-start justify-between gap-2">
                <span
                  className={cn(
                    'line-clamp-2 text-sm font-medium leading-snug',
                    isActive ? 'text-white' : 'text-neutral-200',
                  )}
                >
                  {room.name}
                </span>
                <span
                  className={cn(
                    'mt-0.5 h-2 w-2 shrink-0 rounded-full',
                    room.isBurning
                      ? 'bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.7)] animate-pulse'
                      : 'bg-white/20',
                  )}
                />
              </div>
              <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-wider text-neutral-500">
                <span>{MODE_LABEL[room.timerMode]}</span>
                <span className="font-mono text-white/80 tabular-nums">
                  {formatTimer(room.remainingSeconds)}
                </span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-white/40 via-white to-white/70 transition-all duration-1000 shadow-[0_0_8px_rgba(255,255,255,0.25)]"
                  style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-neutral-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
                  {room.participants.length} gathered
                </span>
              </p>
            </button>
          )
        })}
      </div>
      <div className="flex h-[58px] shrink-0 items-center justify-between border-t border-white/[0.07] bg-[#08080B]/95 px-3">
        <button type="button" onClick={() => setProfileMenu((open) => !open)} className="flex min-w-0 items-center gap-2 rounded-lg p-1 text-left hover:bg-white/[0.06]">
          <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: profile.avatarColor }}>
            {profile.avatarInitials || profile.displayName.slice(0, 2).toUpperCase()}
            <span className={cn('absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#08080B]', profile.status === 'online' ? 'bg-[#22C55E]' : profile.status === 'idle' ? 'bg-[#F59E0B]' : profile.status === 'dnd' ? 'bg-[#EF4444]' : 'border-neutral-500 bg-[#08080B]')} />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-semibold leading-tight text-white">{profile.displayName}</span>
            <span className="block max-w-[110px] truncate text-[11px] text-zinc-400">{profile.customStatus || `@${profile.username}`}</span>
          </span>
        </button>
        <div className="flex shrink-0 items-center gap-0.5">
          <button aria-label={profile.muted ? 'Unmute microphone' : 'Mute microphone'} title="Toggle microphone" onClick={() => updateProfile({ muted: !profile.muted })} className={cn('rounded-md p-1.5', profile.muted ? 'text-[#EF4444]' : 'text-neutral-400 hover:text-white')}>{profile.muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}</button>
          <button aria-label={profile.deafened ? 'Undeafen' : 'Deafen'} title="Toggle deafen" onClick={() => updateProfile({ deafened: !profile.deafened, muted: !profile.deafened || profile.muted })} className={cn('rounded-md p-1.5', profile.deafened ? 'text-[#EF4444]' : 'text-neutral-400 hover:text-white')}>{profile.deafened ? <Headphones className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}</button>
          <button aria-label="User settings" title="User settings" onClick={() => setSettingsOpen(true)} className="rounded-md p-1.5 text-neutral-400 hover:rotate-45 hover:text-white"><Settings className="h-4 w-4" /></button>
        </div>
      </div>
      {profileMenu && <div className="absolute bottom-[66px] left-3 z-30 w-[244px] rounded-xl border border-white/10 bg-[#111114]/95 p-3 shadow-2xl backdrop-blur-xl">
        <div className="mb-2 flex items-center justify-between"><span className="text-xs font-semibold text-white">Set your status</span><button onClick={() => setProfileMenu(false)} aria-label="Close"><X className="h-3.5 w-3.5 text-neutral-400" /></button></div>
        {(['online', 'idle', 'dnd', 'invisible'] as const).map((status) => <button key={status} onClick={() => updateProfile({ status })} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-neutral-300 hover:bg-white/[0.07]"><span className={cn('h-2 w-2 rounded-full', status === 'online' ? 'bg-[#22C55E]' : status === 'idle' ? 'bg-[#F59E0B]' : status === 'dnd' ? 'bg-[#EF4444]' : 'border border-neutral-500')} />{status === 'online' ? '🟢 Online' : status === 'idle' ? '🌙 Idle' : status === 'dnd' ? '⛔ Do Not Disturb' : '⚪ Invisible'}</button>)}
        <div className="my-2 border-t border-white/[0.08]" />
        <div className="mb-1 flex gap-1">{['🎯', '🧪', '🎧', '🔥'].map((emoji) => <button key={emoji} onClick={() => updateProfile({ customStatus: `${emoji} ${profile.customStatus.replace(/^(🎯|🧪|🎧|🔥)\s*/, '')}`.trim() })} className="rounded px-1.5 py-1 hover:bg-white/10">{emoji}</button>)}</div>
        <input value={profile.customStatus.replace(/^(🎯|🧪|🎧|🔥)\s*/, '')} onChange={(event) => updateProfile({ customStatus: event.target.value })} placeholder="Set a custom status…" className="glass-input w-full rounded-md px-2 py-1.5 text-xs text-white outline-none" />
        <button onClick={() => updateProfile({ customStatus: '' })} className="mt-1 w-full rounded-md px-2 py-1.5 text-left text-xs text-neutral-400 hover:bg-white/[0.06]">Clear status</button>
        <button onClick={() => { setProfileMenu(false); setSettingsOpen(true) }} className="mt-1 w-full rounded-md px-2 py-1.5 text-left text-xs text-neutral-300 hover:bg-white/[0.06]">Edit Profile</button>
        <button onClick={() => { if (!navigator.clipboard) { setCopyNotice('Clipboard is unavailable.'); return } void navigator.clipboard.writeText(`@${profile.username}`).then(() => setCopyNotice('Username copied.')).catch((error: unknown) => setCopyNotice(error instanceof Error ? error.message : 'Could not copy username.')) }} className="w-full rounded-md px-2 py-1.5 text-left text-xs text-neutral-300 hover:bg-white/[0.06]">Copy @{profile.username}</button>
        {copyNotice && <p role="status" className="px-2 py-1 text-[10px] text-neutral-400">{copyNotice}</p>}
      </div>}
      {switcherOpen && <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 pt-[15vh] backdrop-blur-sm" onClick={() => setSwitcherOpen(false)}>
        <div className="glass-panel-dense w-full max-w-xl overflow-hidden rounded-2xl" onClick={(event) => event.stopPropagation()}>
          <div className="flex items-center gap-3 border-b border-white/10 p-4"><Search className="h-4 w-4 text-neutral-400" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search rooms and commands…" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none" /><button onClick={() => setSwitcherOpen(false)} aria-label="Close"><X className="h-4 w-4 text-neutral-400" /></button></div>
          <div className="max-h-80 overflow-y-auto p-2">
            {rooms.filter((room) => room.name.toLowerCase().includes(query.toLowerCase())).map((room) => <button key={room.id} onClick={() => { setActiveRoom(room.id); setSwitcherOpen(false) }} className="w-full rounded-lg px-3 py-2 text-left text-sm text-neutral-200 hover:bg-white/10">{room.name}<span className="ml-2 text-xs text-neutral-500">{room.topic}</span></button>)}
            <div className="my-2 border-t border-white/[0.08]" />
            <button onClick={() => { openCreateModal(); setSwitcherOpen(false) }} className="w-full rounded-lg px-3 py-2 text-left text-sm text-neutral-300 hover:bg-white/10">＋ Create a campfire</button>
            <p className="px-3 pb-1 pt-2 text-[9px] font-semibold uppercase tracking-wider text-neutral-600">Tools &amp; Commands</p>
            {['ide', 'dev rig', 'code'].some((value) => value.includes(query.toLowerCase()) || query.toLowerCase().includes(value)) && <button onClick={() => { setActiveSupplyTab('dev-rig'); setSwitcherOpen(false) }} className="w-full rounded-lg px-3 py-2 text-left text-sm text-neutral-300 hover:bg-white/10">IDE · Dev Rig</button>}
            {['solvely', 'solver'].some((value) => value.includes(query.toLowerCase()) || query.toLowerCase().includes(value)) && <button onClick={() => { setActiveSupplyTab('solvely'); setSwitcherOpen(false) }} className="w-full rounded-lg px-3 py-2 text-left text-sm text-neutral-300 hover:bg-white/10">🧠 Solvely AI</button>}
            {['whiteboard', 'tutor', 'teach'].some((value) => value.includes(query.toLowerCase()) || query.toLowerCase().includes(value)) && <button onClick={() => { setActiveSupplyTab('whiteboard'); setSwitcherOpen(false) }} className="w-full rounded-lg px-3 py-2 text-left text-sm text-neutral-300 hover:bg-white/10">🎨 AI Whiteboard</button>}
            {['stage', 'live'].some((value) => value.includes(query.toLowerCase()) || query.toLowerCase().includes(value)) && <button onClick={() => { setActiveSupplyTab('live-stage'); setSwitcherOpen(false) }} className="w-full rounded-lg px-3 py-2 text-left text-sm text-neutral-300 hover:bg-white/10">📡 Open Live Stage</button>}
            {['brown noise', 'noise', 'soundscape'].some((value) => value.includes(query.toLowerCase()) || query.toLowerCase().includes(value)) && <button onClick={() => { const enable = profile.noiseVolume === 0; updateProfile({ brownNoise: enable, noiseVolume: enable ? 24 : 0 }); if (enable) window.dispatchEvent(new Event('campfire:open-soundscape')); setSwitcherOpen(false) }} className="w-full rounded-lg px-3 py-2 text-left text-sm text-neutral-300 hover:bg-white/10">Toggle Brown Noise</button>}
            {['mute', 'mic', 'microphone'].some((value) => value.includes(query.toLowerCase()) || query.toLowerCase().includes(value)) && <button onClick={() => { updateProfile({ muted: !profile.muted }); setSwitcherOpen(false) }} className="w-full rounded-lg px-3 py-2 text-left text-sm text-neutral-300 hover:bg-white/10">Toggle Microphone</button>}
            {['export', 'notes', 'session'].some((value) => value.includes(query.toLowerCase()) || query.toLowerCase().includes(value)) && <button onClick={() => {
              const active = rooms.find((room) => room.id === activeRoomId)
              const text = `# ${active?.name ?? 'Campfire'} Session Notes\n\n${active?.scratchpad ?? ''}\n\n${active?.messages.filter((message) => message.pinned).map((message) => `- ${message.author}: ${message.content}`).join('\n') ?? ''}`
              const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown' }))
              const anchor = document.createElement('a')
              anchor.href = url
              anchor.download = 'campfire-notes.md'
              anchor.click()
              URL.revokeObjectURL(url)
              setSwitcherOpen(false)
            }} className="w-full rounded-lg px-3 py-2 text-left text-sm text-neutral-300 hover:bg-white/10">Export Session Notes            </button>}
          </div>
        </div>
      </div>}
      {settingsOpen && <UserSettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  )
}
