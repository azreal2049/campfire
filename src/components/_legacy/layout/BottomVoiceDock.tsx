import {
  Headphones,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  ScreenShare,
  Volume2,
  Waves,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '../../../lib/cn'
import { useCampfireStore } from '../../../store/useCampfireStore'
import { UserProfilePopover } from '../UserProfilePopover'
import { SoundscapeMixer } from './SoundscapeMixer'

export function BottomVoiceDock() {
  const rooms = useCampfireStore((state) => state.rooms)
  const activeRoomId = useCampfireStore((state) => state.activeRoomId)
  const profile = useCampfireStore((state) => state.profile)
  const updateProfile = useCampfireStore((state) => state.updateProfile)
  const setActiveSupplyTab = useCampfireStore((state) => state.setActiveSupplyTab)
  const room = rooms.find((item) => item.id === activeRoomId) ?? null
  const muted = profile.muted
  const deafened = profile.deafened
  const [inVoice, setInVoice] = useState(true)
  const noiseOn = profile.brownNoise
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null)
  const [screenError, setScreenError] = useState('')
  const [mixerOpen, setMixerOpen] = useState(false)
  const [profileCard, setProfileCard] = useState<{ name: string; color: string } | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)
  const previewRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const openMixer = () => setMixerOpen(true)
    window.addEventListener('campfire:open-soundscape', openMixer)
    return () => window.removeEventListener('campfire:open-soundscape', openMixer)
  }, [])

  useEffect(() => {
    if (previewRef.current) previewRef.current.srcObject = screenStream
  }, [screenStream])

  useEffect(
    () => () => {
      screenStreamRef.current?.getTracks().forEach((track) => track.stop())
    },
    [],
  )

  const toggleScreenShare = async () => {
    setScreenError('')
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop())
      screenStreamRef.current = null
      setScreenStream(null)
      updateProfile({ screenSharing: false, screenStream: null })
      return
    }

    if (!navigator.mediaDevices?.getDisplayMedia) {
      setScreenError('Screen sharing is not supported by this browser.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      })
      screenStreamRef.current = stream
      stream.getVideoTracks()[0].addEventListener(
        'ended',
        () => {
          screenStreamRef.current = null
          setScreenStream(null)
          updateProfile({ screenSharing: false, screenStream: null })
        },
        { once: true },
      )
      setScreenStream(stream)
      updateProfile({ screenSharing: true, screenStream: stream })
      setActiveSupplyTab('live-stage')
    } catch (error) {
      setScreenError(
        error instanceof Error
          ? error.message
          : 'Could not start screen sharing.',
      )
    }
  }

  return (
    <div className="flex h-full w-full items-center gap-0">
      <div className="flex min-w-0 flex-1 basis-0 items-center justify-between gap-3 border-r border-white/[0.1] pr-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            {inVoice && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22C55E] opacity-60" />
            )}
            <span
              className={cn(
                'relative inline-flex h-2.5 w-2.5 rounded-full',
                inVoice ? 'bg-[#22C55E]' : 'bg-neutral-600',
              )}
            />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-white">
              {inVoice && room ? `Voice · ${room.name}` : 'Voice disconnected'}
            </p>
            <p className="text-[10px] text-neutral-500">
              {inVoice ? '14ms · Connected locally' : 'Voice is off'}
            </p>
          </div>
        </div>

        <div className="hidden min-w-0 items-center justify-end gap-1.5 sm:flex">
          {room?.participants.slice(0, 5).map((participant) => (
            <button
              type="button"
              onClick={() => setProfileCard({ name: participant.name, color: participant.avatarColor })}
              key={participant.id}
              title={participant.name}
              className={cn(
                'relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-[9px] font-semibold text-white',
                participant.isSpeaking &&
                  inVoice &&
                  !deafened &&
                  'ring-2 ring-[#22C55E]/70',
              )}
              style={{ backgroundColor: participant.avatarColor }}
            >
              {participant.name.slice(0, 2).toUpperCase()}
              <span className={cn('absolute -bottom-0.5 -left-0.5 h-2 w-2 rounded-full border border-[#0B0B0E]', participant.status === 'idle' ? 'bg-[#F59E0B]' : participant.status === 'dnd' ? 'bg-[#EF4444]' : participant.status === 'invisible' ? 'bg-[#71717A]' : 'bg-[#22C55E]')} />
              {(participant.isMuted || (participant.id === 'you' && muted)) && (
                <MicOff className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-[#0B0B0E] p-0.5 text-neutral-300" />
              )}
            </button>
          ))}
          {screenStream && (
            <video
              ref={previewRef}
              autoPlay
              muted
              playsInline
              aria-label="Screen share preview"
              className="ml-2 h-8 w-14 rounded-md border border-white/15 bg-black object-cover"
            />
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 basis-0 items-center justify-end gap-1.5 pl-4">
        <button
          type="button"
          title="Open Soundscape Studio"
          aria-label="Open Soundscape Studio"
          aria-pressed={mixerOpen}
          onClick={() => setMixerOpen((value) => !value)}
          className={cn(
            'rounded-lg border p-2 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu active:scale-[0.97]',
            mixerOpen || noiseOn || profile.rainVolume > 0 || profile.crackleVolume > 0 || profile.binauralVolume > 0
              ? 'border-amber-300/30 bg-amber-300/10 text-amber-200'
              : 'border-transparent text-neutral-400 hover:bg-white/[0.06] hover:text-white',
          )}
        >
          <Waves className="h-4 w-4" />
        </button>
        <button
          type="button"
          title={muted ? 'Unmute microphone' : 'Mute microphone'}
          aria-label={muted ? 'Unmute microphone' : 'Mute microphone'}
          aria-pressed={muted}
          disabled={!inVoice || deafened}
          onClick={() => updateProfile({ muted: !muted })}
          className={cn(
            'rounded-lg border p-2 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50',
            muted
              ? 'border-[#EF4444]/35 bg-[#EF4444]/15 text-[#EF4444] shadow-[0_0_12px_rgba(239,68,68,0.18)]'
              : 'border-white bg-white text-[#09090B] shadow-[0_0_15px_rgba(255,255,255,0.2)]',
          )}
        >
          {muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>
        <button
          type="button"
          title={deafened ? 'Undeafen' : 'Deafen'}
          aria-label={deafened ? 'Undeafen' : 'Deafen'}
          aria-pressed={deafened}
          disabled={!inVoice}
          onClick={() => {
            const next = !deafened
            updateProfile({ deafened: next, muted: next || muted })
          }}
          className={cn(
            'rounded-lg border p-2 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50',
            deafened
              ? 'border-[#EF4444]/35 bg-[#EF4444]/15 text-[#EF4444]'
              : 'border-transparent text-neutral-400 hover:bg-white/[0.06] hover:text-white',
          )}
        >
          {deafened ? (
            <Headphones className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </button>
        <button
          type="button"
          title={screenStream ? 'Stop screen share' : 'Share screen'}
          aria-label={screenStream ? 'Stop screen share' : 'Share screen'}
          aria-pressed={Boolean(screenStream)}
          onClick={() => void toggleScreenShare()}
          className={cn(
            'relative rounded-lg border p-2 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu active:scale-[0.97]',
            screenStream
              ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300'
              : 'border-transparent text-neutral-400 hover:bg-white/[0.06] hover:text-white',
          )}
        >
          <ScreenShare className="h-4 w-4" />
          {screenStream && <span className="absolute -right-2 -top-1 rounded bg-red-500 px-1 text-[7px] font-bold leading-3 text-white">LIVE</span>}
        </button>
        <button
          type="button"
          title={inVoice ? 'Disconnect voice' : 'Connect voice'}
          aria-label={inVoice ? 'Disconnect voice' : 'Connect voice'}
          onClick={() => {
            const next = !inVoice
            setInVoice(next)
            if (!next) {
              updateProfile({ muted: true, deafened: false })
            }
          }}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu active:scale-[0.97]',
            inVoice
              ? 'bg-[#EF4444]/15 text-[#EF4444] hover:bg-[#EF4444]/25'
              : 'bg-[#22C55E]/15 text-[#22C55E] hover:bg-[#22C55E]/25',
          )}
        >
          {inVoice ? (
            <PhoneOff className="h-3.5 w-3.5" />
          ) : (
            <Phone className="h-3.5 w-3.5" />
          )}
          <span className="hidden sm:inline">{inVoice ? 'Leave' : 'Join'}</span>
        </button>
        {screenError && (
          <p
            className="max-w-24 truncate text-[10px] text-red-400"
            title={screenError}
            role="status"
            aria-live="polite"
          >
            {screenError}
          </p>
        )}
          <SoundscapeMixer open={mixerOpen} onClose={() => setMixerOpen(false)} />
        {profileCard && <UserProfilePopover name={profileCard.name} color={profileCard.color} onClose={() => setProfileCard(null)} />}
      </div>
    </div>
  )
}
