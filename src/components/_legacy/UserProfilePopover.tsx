import { useEffect, useState } from 'react'
import { useCampfireStore } from '../../store/useCampfireStore'

export function UserProfilePopover({ name, color, onClose }: { name: string; color: string; onClose: () => void }) {
  const rooms = useCampfireStore((state) => state.rooms)
  const activeRoomId = useCampfireStore((state) => state.activeRoomId)
  const profile = useCampfireStore((state) => state.profile)
  const updateProfile = useCampfireStore((state) => state.updateProfile)
  const sendMessage = useCampfireStore((state) => state.sendMessage)
  const [volume, setVolume] = useState(100)
  const [muted, setMuted] = useState(false)
  const room = rooms.find((item) => item.id === activeRoomId)
  const isSelf = name === profile.displayName || name === 'You'
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [onClose])

  return (
    <div className="fixed bottom-[72px] right-[326px] z-[45] w-[280px] overflow-hidden rounded-xl border border-white/10 bg-[#111114]/95 shadow-2xl backdrop-blur-xl">
      <div className="h-16" style={{ background: `linear-gradient(120deg, ${color}, #111114)` }} />
      <button onClick={onClose} aria-label="Close profile" className="absolute right-2 top-2 rounded bg-black/30 px-2 py-1 text-xs text-white">×</button>
      <div className="-mt-7 px-4">
        <span className="relative flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#111114] text-sm font-semibold text-white" style={{ backgroundColor: color }}>{name.slice(0, 2).toUpperCase()}{isSelf && <span className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#111114] ${profile.status === 'online' ? 'bg-[#22C55E]' : profile.status === 'idle' ? 'bg-[#F59E0B]' : profile.status === 'dnd' ? 'bg-[#EF4444]' : 'bg-[#71717A]'}`} />}</span>
        <p className="mt-2 text-sm font-semibold text-white">{name}</p>
        <p className="text-xs text-neutral-500">@{isSelf ? profile.username : name.toLowerCase().replace(/\s+/g, '')}</p>
        {isSelf && profile.pronouns && <p className="mt-1 text-[10px] text-neutral-500">{profile.pronouns}</p>}
        {isSelf && profile.bio && <p className="mt-2 text-xs leading-relaxed text-neutral-300">{profile.bio}</p>}
        {isSelf && profile.customStatus && <p className="mt-2 rounded-md bg-white/[0.05] p-2 text-xs text-neutral-300">{profile.customStatus}</p>}
        <div className="mt-3 border-t border-white/[0.08] py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Live Activity</p>
          <p className="mt-1 text-xs text-neutral-300">Currently in #{room?.name ?? 'no campfire'}</p>
        </div>
        {!isSelf && <div className="space-y-3 border-t border-white/[0.08] py-3">
          <label className="block text-xs text-neutral-400">Member Volume · {volume}%<input type="range" min="0" max="200" value={volume} onChange={(event) => setVolume(Number(event.target.value))} className="mt-2 w-full accent-white" /></label>
          <button onClick={() => setMuted((value) => !value)} className="w-full rounded-md border border-white/10 px-3 py-2 text-left text-xs text-neutral-300 hover:bg-white/[0.06]">{muted ? 'Unmute User' : 'Mute User'}</button>
        </div>}
        <button onClick={() => { sendMessage(`@${name} `); onClose() }} className="mb-4 w-full rounded-md bg-white px-3 py-2 text-xs font-semibold text-black hover:bg-neutral-200">@Mention in Chat</button>
        {isSelf && <button onClick={() => updateProfile({ muted: !profile.muted })} className="mb-4 ml-2 rounded-md border border-white/10 px-3 py-2 text-xs text-neutral-300">{profile.muted ? 'Unmute' : 'Mute'} microphone</button>}
      </div>
    </div>
  )
}
