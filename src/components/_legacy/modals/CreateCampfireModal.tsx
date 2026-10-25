import { Flame, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '../../../lib/cn'
import { useCampfireStore } from '../../../store/useCampfireStore'
import type { TimerMode } from '../../../types/campfire'

const MODES: { id: TimerMode; label: string; blurb: string }[] = [
  {
    id: 'countdown',
    label: 'Countdown',
    blurb: 'Fixed burn — extinguishes at 00:00',
  },
  {
    id: 'deadman',
    label: 'Deadman',
    blurb: 'Activity keeps the flame alive',
  },
  {
    id: 'pomodoro',
    label: 'Pomodoro',
    blurb: 'Focus block, then a short break',
  },
]

const PRESETS = [25, 45, 60, 90, 120]

export function CreateCampfireModal() {
  const open = useCampfireStore((s) => s.isCreateModalOpen)
  const closeCreateModal = useCampfireStore((s) => s.closeCreateModal)
  const createRoom = useCampfireStore((s) => s.createRoom)
  const setActiveSupplyTab = useCampfireStore((s) => s.setActiveSupplyTab)

  const [name, setName] = useState('')
  const [topic, setTopic] = useState('')
  const [timerMode, setTimerMode] = useState<TimerMode>('countdown')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [template, setTemplate] = useState('Dev Sprint')

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeCreateModal()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open, closeCreateModal])

  if (!open) return null

  const reset = () => {
    setName('')
    setTopic('')
    setTimerMode('countdown')
    setDurationMinutes(60)
    setTemplate('Dev Sprint')
  }

  const handleCreate = () => {
    createRoom({
      name: name || 'Untitled Campfire',
      topic: topic || 'No topic set',
      timerMode,
      durationMinutes,
    })
    if (template === 'Whiteboard Jam') setActiveSupplyTab('whiteboard')
    else if (template === 'Exam Cram') setActiveSupplyTab('solvely')
    else setActiveSupplyTab('dev-rig')
    reset()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-campfire-title"
      onClick={closeCreateModal}
    >
      <div
        className="glass-panel-dense w-full max-w-lg rounded-2xl shadow-[0_0_60px_rgba(255,255,255,0.06)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/20 bg-white/[0.08] ember-glow">
              <Flame className="h-4 w-4 text-white" />
            </div>
            <h2
              id="create-campfire-title"
              className="text-base font-semibold text-white"
            >
              Light a Campfire
            </h2>
          </div>
          <button
            type="button"
            onClick={closeCreateModal}
            className="rounded-xl p-1.5 text-neutral-500 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu active:scale-[0.97] hover:bg-white/[0.07] hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
              Room name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Midnight System Design"
              className="glass-input w-full select-text rounded-xl px-3 py-2.5 text-sm text-white outline-none placeholder:text-neutral-600"
              autoFocus
            />
          </label>

          <div className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">Preset template</span>
            <div className="grid grid-cols-3 gap-2">
              {(['Dev Sprint', 'Exam Cram', 'Whiteboard Jam'] as const).map((item) => <button key={item} type="button" onClick={() => { setTemplate(item); if (item === 'Exam Cram') { setName('Exam Cram'); setTopic('Focused exam revision and worked problems') } else if (item === 'Whiteboard Jam') { setName('Whiteboard Jam'); setTopic('Draw and explain ideas together') } else { setName('Dev Sprint'); setTopic('Build, test, and share code') } }} className={cn('rounded-lg border px-2 py-2 text-[10px]', template === item ? 'border-white/25 bg-white/10 text-white' : 'border-white/10 text-neutral-400 hover:bg-white/[0.05]')}>{item === 'Dev Sprint' ? '💻' : item === 'Exam Cram' ? '🧬' : '🎨'} {item}</button>)}
            </div>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
              Topic
            </span>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What are you grinding tonight?"
              className="glass-input w-full select-text rounded-xl px-3 py-2.5 text-sm text-white outline-none placeholder:text-neutral-600"
            />
          </label>

          <div className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
              Timer mode
            </span>
            <div className="grid gap-2 sm:grid-cols-3">
              {MODES.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setTimerMode(mode.id)}
                  className={cn(
                    'rounded-xl px-3 py-3 text-left transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu active:scale-[0.97]',
                    timerMode === mode.id
                      ? 'glass-card-active'
                      : 'glass-card border-white/10',
                  )}
                >
                  <p
                    className={cn(
                      'text-sm font-medium',
                      timerMode === mode.id ? 'text-white' : 'text-neutral-300',
                    )}
                  >
                    {mode.label}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-neutral-500">
                    {mode.blurb}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                Fuel duration
              </span>
              <span className="timer-glow font-mono text-sm text-white">
                {durationMinutes}m
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDurationMinutes(mins)}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu active:scale-[0.97]',
                    durationMinutes === mins
                      ? 'border-white/40 bg-white/[0.1] text-white'
                      : 'border-white/10 text-neutral-500 hover:border-white/25 hover:bg-white/[0.05] hover:text-white',
                  )}
                >
                  {mins}m
                </button>
              ))}
            </div>
            <input
              type="range"
              min={5}
              max={180}
              step={5}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full accent-white"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-white/10 px-5 py-4">
          <button
            type="button"
            onClick={closeCreateModal}
            className="rounded-xl px-4 py-2 text-sm text-neutral-400 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu active:scale-[0.97] hover:bg-white/[0.05] hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            className="glass-btn-primary rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu active:scale-[0.97]"
          >
            Ignite
          </button>
        </div>
      </div>
    </div>
  )
}
