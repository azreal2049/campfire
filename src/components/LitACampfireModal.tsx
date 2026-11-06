import { useState } from 'react'
import { Flame, X, Code, BookOpen, Music, Video, Zap, Shield, Sparkles } from 'lucide-react'
import { useCampfireStore } from '../store/useCampfireStore'
import type { TimerMode } from '../types/campfire'

const hubs = [
  {
    name: 'Technical Hub',
    sessions: [
      { id: 'study-group', title: 'Study Group', icon: BookOpen, blurb: 'Whiteboard + notes + focus timer + AI solver.' },
      { id: 'coders', title: 'Coders x Developers', icon: Code, blurb: 'IDE, browser preview, test runner, terminal.' },
    ],
  },
  {
    name: 'Social Hub',
    sessions: [
      { id: 'office-hours', title: 'Office Hours', icon: Zap, blurb: 'Pair study, quick reviews, pin context.' },
      { id: 'community', title: 'Community Desk', icon: Shield, blurb: 'Shared Q&A and feedback loops.' },
    ],
  },
  {
    name: 'Creative Hub',
    sessions: [
      { id: 'creators', title: 'Creators', icon: Music, blurb: 'Scripts, hooks, concept boards, edit review.' },
      { id: 'editors', title: 'Editors & VFX', icon: Video, blurb: 'Cuts, drafts, outlines, creative sync.' },
    ],
  },
  {
    name: 'Focus Hub',
    sessions: [
      { id: 'deep-work', title: 'Deep Work', icon: Sparkles, blurb: 'Pomodoro blocks, prompts, structured sessions.' },
      { id: 'reset', title: 'Reset Room', icon: Flame, blurb: 'Recenter, journal, and reset focus state.' },
    ],
  },
]

export function LitACampfireModal() {
  const isOpen = useCampfireStore((state) => state.isCreateModalOpen)
  const closeModal = useCampfireStore((state) => state.closeCreateModal)
  const createRoom = useCampfireStore((state) => state.createRoom)

  const [name, setName] = useState('')
  const [topic, setTopic] = useState('')
  const [timerMode, setTimerMode] = useState<TimerMode>('countdown')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [selectedSession, setSelectedSession] = useState('study-group')

  if (!isOpen) return null

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    createRoom({
      name: name || 'New Campfire Session',
      topic: topic || 'Collaborative focus session',
      timerMode,
      durationMinutes,
    })
    closeModal()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0b0b0e] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-white">
            <Flame className="h-5 w-5 text-orange-400" />
            Lit a Campfire Session
          </div>
          <button
            className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
            onClick={closeModal}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400">Choose Session Type (4 Hubs)</label>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {hubs.map((hub) =>
                hub.sessions.map((sess) => {
                  const Icon = sess.icon
                  const active = selectedSession === sess.id
                  return (
                    <button
                      key={sess.id}
                      type="button"
                      onClick={() => setSelectedSession(sess.id)}
                      className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                        active
                          ? 'border-orange-500/50 bg-orange-500/10 text-white'
                          : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                      }`}
                    >
                      <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-orange-400' : 'text-zinc-500'}`} />
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{hub.name}</div>
                        <div className="text-sm font-medium text-white">{sess.title}</div>
                        <div className="mt-0.5 text-xs leading-4 text-zinc-500">{sess.blurb}</div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-zinc-400">Campfire Room Name</label>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#111115] px-3 py-2 text-sm text-white outline-none focus:border-white/25"
                placeholder="e.g. Late Night DSA Grind"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400">Topic / Agenda</label>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#111115] px-3 py-2 text-sm text-white outline-none focus:border-white/25"
                placeholder="e.g. Solving sliding window mediums"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-zinc-400">Timer Mode</label>
              <div className="mt-1 flex gap-2">
                {(['countdown', 'deadman', 'pomodoro'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setTimerMode(mode)}
                    className={`flex-1 rounded-lg border py-2 text-xs font-medium capitalize transition ${
                      timerMode === mode
                        ? 'border-white/30 bg-white/10 text-white'
                        : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400">Duration (Minutes)</label>
              <input
                type="number"
                min="5"
                max="360"
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#111115] px-3 py-2 text-sm text-white outline-none focus:border-white/25"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-zinc-400 hover:bg-white/5 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-white px-5 py-2 text-xs font-semibold text-black hover:bg-zinc-200"
            >
              <Flame className="h-3.5 w-3.5" />
              Lit Campfire Now
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
