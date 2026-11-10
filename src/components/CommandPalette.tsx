import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowUp,
  Command,
  CornerDownLeft,
  Search,
  X,
} from 'lucide-react'
import type { AgentKind, CampfireSessionType } from '../bridge/rustBridge'
import { useCampfireStore } from '../store/useCampfireStore'

interface PaletteCommand {
  id: string
  label: string
  detail: string
  group: string
  run: () => void
}

const navigation = [
  { page: 'page-home', label: 'Home' },
  { page: 'page-chat', label: 'Chat' },
  { page: 'page-workplace', label: 'Workplace' },
  { page: 'page-vault', label: 'Personal Vault' },
  { page: 'page-friends', label: 'Friends' },
  { page: 'page-settings', label: 'Settings' },
]

const sessionModes: Array<{ mode: CampfireSessionType; label: string }> = [
  { mode: 'study-group', label: '(I) Study Group' },
  { mode: 'coders-developers', label: '(II) Coders x Developers' },
  { mode: 'fun-friends', label: '(III) Fun with Friends' },
  { mode: 'musicians', label: '(IV) Musicians' },
  { mode: 'content-creators', label: '(V) Content Creators' },
  { mode: 'editors-vfx', label: '(VI) Editors x VFX' },
  { mode: 'official-works', label: '(VII) Official Works' },
  { mode: 'silent-coworking', label: '(VIII) Silent Co-working' },
]

const agentKinds: Array<{ kind: AgentKind; label: string }> = [
  { kind: 'study', label: 'Deploy Study & Flashcard Agent' },
  { kind: 'code-audit', label: 'Deploy Code Audit & Test Agent' },
  { kind: 'creator', label: 'Deploy Creator Hook & Storyboard Agent' },
]

function fuzzyMatch(query: string, value: string) {
  const search = query.toLowerCase().trim()
  if (!search) return true
  let index = 0
  const candidate = value.toLowerCase()
  for (const character of search) {
    index = candidate.indexOf(character, index)
    if (index === -1) return false
    index += 1
  }
  return true
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const setActivePage = useCampfireStore((state) => state.setActivePage)
  const setSessionType = useCampfireStore((state) => state.setSessionType)
  const stokeFuel = useCampfireStore((state) => state.stokeFuel)
  const saveWorkspaceSnapshot = useCampfireStore((state) => state.saveWorkspaceSnapshot)
  const saveToVault = useCampfireStore((state) => state.saveToVault)
  const toggleFocusSoundscape = useCampfireStore((state) => state.toggleFocusSoundscape)
  const setBlueprintMode = useCampfireStore((state) => state.setBlueprintMode)
  const dispatchAgent = useCampfireStore((state) => state.dispatchAgent)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const closePalette = useCallback(() => {
    setQuery('')
    setSelectedIndex(0)
    onClose()
  }, [onClose])

  const commands = useMemo<PaletteCommand[]>(() => [
    ...navigation.map((item) => ({
      id: item.page,
      label: `Go to ${item.label}`,
      detail: 'Navigation',
      group: 'Navigation',
      run: () => setActivePage(item.page),
    })),
    ...sessionModes.map((item) => ({
      id: item.mode,
      label: `Switch mode ${item.label}`,
      detail: 'Campfire session',
      group: 'Session modes',
      run: () => setSessionType(item.mode),
    })),
    {
      id: 'stoke',
      label: '🔥 Stoke Room Timer (+5m)',
      detail: 'Add 300 seconds of fuel',
      group: 'Quick commands',
      run: stokeFuel,
    },
    ...agentKinds.map((item) => ({
      id: `agent-${item.kind}`,
      label: `⚡ ${item.label}`,
      detail: 'Runs locally with offline fallback',
      group: 'Quick commands',
      run: () => { void dispatchAgent(item.kind) },
    })),
    {
      id: 'snapshot',
      label: '📸 Save Workspace Snapshot to Vault',
      detail: 'Create a named checkpoint',
      group: 'Quick commands',
      run: () => {
        saveWorkspaceSnapshot('Quick checkpoint')
        const state = useCampfireStore.getState()
        saveToVault({
          title: 'Workspace Snapshot — Quick checkpoint',
          category: 'Recent Items',
          snippet: `Mode: ${state.activeSessionType}\nNote: ${state.noteContent}\n\n${state.ideCode}`,
          format: 'md',
        })
      },
    },
    {
      id: 'soundscape',
      label: '🔊 Toggle Brown Noise / 40Hz Gamma Focus',
      detail: 'Switch focus sound preset',
      group: 'Quick commands',
      run: toggleFocusSoundscape,
    },
    {
      id: 'blueprint',
      label: '📐 Toggle Blueprint Inspector Mode',
      detail: 'Open or close the measurement inspector',
      group: 'Quick commands',
      run: () => setBlueprintMode(!useCampfireStore.getState().blueprintMode),
    },
  ], [dispatchAgent, saveToVault, saveWorkspaceSnapshot, setActivePage, setBlueprintMode, setSessionType, stokeFuel, toggleFocusSoundscape])

  const filtered = commands.filter((command) =>
    fuzzyMatch(query, `${command.label} ${command.group} ${command.detail}`),
  )

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePalette()
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setSelectedIndex((index) => Math.min(index + 1, filtered.length - 1))
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setSelectedIndex((index) => Math.max(index - 1, 0))
      }
      if (event.key === 'Enter' && filtered[selectedIndex]) {
        filtered[selectedIndex].run()
        closePalette()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [closePalette, filtered, open, selectedIndex])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/65 px-4 pt-[18vh] backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closePalette()
      }}
    >
      <section role="dialog" aria-modal="true" aria-label="Command palette" className="w-full max-w-xl overflow-hidden rounded-xl border border-white/[0.12] bg-[#111113] shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
        <div className="flex items-center gap-3 border-b border-white/[0.08] px-4">
          <Search className="h-4 w-4 shrink-0 text-zinc-500" />
          <input
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setSelectedIndex(0)
            }}
            placeholder="Search pages, modes, and commands..."
            aria-label="Search commands"
            className="h-12 flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-zinc-600"
          />
          <button type="button" onClick={closePalette} aria-label="Close command palette" className="rounded border border-white/[0.1] p-1 text-zinc-500 hover:text-white">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="max-h-[55vh] overflow-y-auto p-2">
          {filtered.map((command, index) => (
            <button
              type="button"
              key={command.id}
              onMouseEnter={() => setSelectedIndex(index)}
              onClick={() => {
                command.run()
                closePalette()
              }}
              className={`flex w-full items-center justify-between gap-4 rounded-md px-3 py-2.5 text-left ${index === selectedIndex ? 'bg-white/[0.09] text-white' : 'text-zinc-300 hover:bg-white/[0.05]'}`}
            >
              <span className="min-w-0">
                <span className="block truncate text-[13px]">{command.label}</span>
                <span className="mt-0.5 block text-[11px] text-zinc-600">{command.detail}</span>
              </span>
              <span className="shrink-0 text-[10px] text-zinc-600">{command.group}</span>
            </button>
          ))}
          {filtered.length === 0 && <p className="px-3 py-8 text-center text-[13px] text-zinc-500">No matching commands.</p>}
        </div>
        <div className="flex items-center gap-4 border-t border-white/[0.08] px-4 py-2 text-[10px] text-zinc-600">
          <span className="flex items-center gap-1"><ArrowUp className="h-3 w-3" /> Navigate</span>
          <span className="flex items-center gap-1"><CornerDownLeft className="h-3 w-3" /> Run</span>
          <span className="ml-auto flex items-center gap-1"><Command className="h-3 w-3" /> K to open</span>
        </div>
      </section>
    </div>
  )
}
