import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  generateLocalAgentOutput,
  runLocalAgent,
  type AgentKind,
  type AgentTask,
  type BurnTimerState,
  type CampfireSessionType,
  type VaultItem,
  type WorkspaceSnapshot,
} from '../bridge/rustBridge'

export type { VaultItem } from '../bridge/rustBridge'

export interface VaultDraft {
  title: string
  category: string
  snippet?: string
  content?: string
  fileName?: string
  format?: string
}

interface ConnectedAccount {
  id: string
  name: string
  subtitle: string
  status: string
  active: boolean
  details: string
  expanded: boolean
}

interface AppIntegration {
  id: string
  name: string
  description: string
  installed: boolean
}

export interface SettingsPreferences {
  defaultMode: 'countdown' | 'deadman' | 'pomodoro'
  burnTimerMinutes: number
  soundscape: 'off' | 'rain' | 'fire' | 'cafe'
  unreadMentionAlerts: boolean
  peerRadarVisible: boolean
  vaultAutoSave: boolean
  ipcTelemetry: boolean
}

interface CampfireStore {
  activePage: string
  isAuthenticated: boolean
  workspaceView: 'chat' | 'workplace'
  isAssistantOpen: boolean
  vaultItems: VaultItem[]
  toastMessage: string | null
  // Settings
  displayName: string
  email: string
  handle: string
  avatarUrl: string | null
  preferences: SettingsPreferences
  accounts: ConnectedAccount[]
  apps: AppIntegration[]
  activeSessionType: CampfireSessionType
  burnTimer: BurnTimerState
  ideCode: string
  ideFileName: string
  editedCodeFiles: string[]
  noteContent: string
  whiteboardText: string
  solvedDoubts: string[]
  pendingWorkplaceTool: 'ide' | 'study' | null
  blueprintMode: boolean
  openWorkplaceCards: string[]
  workspaceSnapshots: WorkspaceSnapshot[]
  agentTasks: AgentTask[]
  squadActivity: string
  soundscapePreset: 'campfire' | 'brown' | 'rain' | 'gamma'
  soundscapeVolume: number
  stokePulse: boolean
  setActivePage: (page: string) => void
  setActiveWorkspaceView: (view: 'chat' | 'workplace') => void
  setAssistantOpen: (open: boolean) => void
  openLitAFire: () => void
  saveToVault: (item: VaultDraft) => void
  restoreVaultItem: (id: string) => void
  clearToast: () => void
  setDisplayName: (name: string) => void
  setEmail: (email: string) => void
  setHandle: (handle: string) => void
  setAvatarUrl: (avatarUrl: string | null) => void
  setPreference: <K extends keyof SettingsPreferences>(key: K, value: SettingsPreferences[K]) => void
  toggleAccount: (id: string) => void
  toggleAccountExpanded: (id: string) => void
  refreshAccount: (id: string) => void
  removeAccount: (id: string) => void
  addAccount: (account: Omit<ConnectedAccount, 'id' | 'active' | 'expanded'>) => void
  toggleApp: (id: string) => void
  showToast: (message: string) => void
  logOut: () => void
  setSessionType: (sessionType: CampfireSessionType) => void
  setBurnMode: (mode: BurnTimerState['mode']) => void
  setBurnTimerRunning: (running: boolean) => void
  tickBurnTimer: () => void
  registerActivity: () => void
  stokeFuel: () => void
  updateIdeCode: (code: string) => void
  pipeToIde: (content: string, fileName?: string) => void
  pipeToStudy: (content: string) => void
  solveDoubt: (content: string) => void
  setNoteContent: (content: string) => void
  setBlueprintMode: (active: boolean) => void
  setPendingWorkplaceTool: (tool: 'ide' | 'study' | null) => void
  saveWorkspaceSnapshot: (name: string) => void
  restoreWorkspaceSnapshot: (id: string) => void
  continueLastSession: () => void
  dispatchAgent: (kind: AgentKind) => Promise<void>
  markAgentRead: (id: string) => void
  saveAgentOutput: (id: string) => void
  endAndArchiveSession: () => void
  setSoundscape: (preset: CampfireStore['soundscapePreset']) => void
  setSoundscapeVolume: (volume: number) => void
  syncSquadView: (member: string) => void
}

export const useCampfireStore = create<CampfireStore>()(persist((set) => ({
  activePage: 'page-home',
  isAuthenticated: true,
  workspaceView: 'chat',
  isAssistantOpen: false,
  vaultItems: [
    {
      id: 'v1',
      title: 'Sliding Window Deque O(n) Solution',
      category: 'Code & Dev',
      snippet: 'def max_sliding_window(nums, k): ...',
      date: 'Today at 10:45 AM',
    },
    {
      id: 'v2',
      title: 'SN1/SN2 Reaction Energy Diagram Notes',
      category: 'Study Notes',
      snippet: 'Two-step carbocation intermediate vs one-step backside attack.',
      date: 'Yesterday at 4:12 PM',
    },
  ],
  toastMessage: null,

  displayName: 'You',
  email: 'you@campfire.dev',
  handle: '@you',
  avatarUrl: null,
  preferences: {
    defaultMode: 'countdown',
    burnTimerMinutes: 25,
    soundscape: 'off',
    unreadMentionAlerts: true,
    peerRadarVisible: true,
    vaultAutoSave: true,
    ipcTelemetry: false,
  },

  accounts: [
    {
      id: 'freellm',
      name: 'Local FreeLLM & Workspace Engine',
      subtitle: 'Updated about 21 hours ago via Campfire Bridge',
      status: 'ACTIVE · 0ms',
      active: true,
      details: 'Auto Model Route (127.0.0.1:31415)',
      expanded: true,
    },
    {
      id: 'piston',
      name: 'Piston Runner',
      subtitle: 'Code execution engine',
      status: 'READY · 0ms',
      active: true,
      details: 'Run code in an isolated Piston environment',
      expanded: false,
    },
    {
      id: 'github-sync',
      name: 'GitHub Sync',
      subtitle: 'Repository and workspace connection',
      status: '196,435 tokens',
      active: true,
      details: 'Personal Vault Auto-Sync',
      expanded: false,
    },
  ],

  apps: [
    { id: 'github', name: 'GitHub', description: 'Sync repos, commits, and PRs directly into your Campfire workspace.', installed: true },
    { id: 'vscode', name: 'VS Code / Cursor', description: 'Open live IDE sessions inside Campfire with full multi-tab sync.', installed: true },
    { id: 'brave', name: 'Brave Browser Preview', description: 'Embedded browser canvas for testing apps, websites, and WebGL previews.', installed: true },
    { id: 'solvely', name: 'Solvely AI', description: 'Step-by-step AI solver and Socratic doubt tutor integration.', installed: true },
    { id: 'discord', name: 'Discord Rich Presence', description: 'Show your active study/coding campfire on your Discord status.', installed: false },
    { id: 'obsidian', name: 'Obsidian / Notion Vault', description: 'Auto-sync notes, mindmaps, and vault exports to your local Obsidian vault.', installed: false },
  ],
  activeSessionType: 'study-group',
  burnTimer: {
    mode: 'pomodoro',
    secondsRemaining: 25 * 60,
    elapsedSeconds: 0,
    running: false,
    warning: false,
    lastActivityAt: Date.now(),
    focusMinutes: 25,
    breakMinutes: 5,
    phase: 'focus',
  },
  ideCode: `// Campfire workspace
export function solve(input: number[]) {
  return input
}`,
  ideFileName: 'main.ts',
  editedCodeFiles: [],
  noteContent: 'Leave a little room for the unexpected.',
  whiteboardText: '',
  solvedDoubts: [],
  pendingWorkplaceTool: null,
  blueprintMode: false,
  openWorkplaceCards: ['focus-timer', 'inbox-agents', 'quick-note', 'music-deck', 'session-sprint', 'mood-board', 'up-next', 'live-stage', 'activity-chart', 'code-rig', 'study-pod', 'radar-weather'],
  workspaceSnapshots: [],
  agentTasks: [],
  squadActivity: '',
  soundscapePreset: 'campfire',
  soundscapeVolume: 0.18,
  stokePulse: false,

  setActivePage: (page) => set({
    activePage: page,
    ...(page === 'page-chat' ? { workspaceView: 'chat' as const } : {}),
    ...(page === 'page-workplace' ? { workspaceView: 'workplace' as const } : {}),
  }),
  setActiveWorkspaceView: (view) => set({ workspaceView: view, activePage: view === 'chat' ? 'page-chat' : 'page-workplace' }),
  setAssistantOpen: (open) => set({ isAssistantOpen: open }),
  openLitAFire: () => {
    console.log('Lit a fire modal opened')
  },
  saveToVault: (item) => {
    const newItem: VaultItem = {
      id: String(Date.now()),
      title: item.title,
      category: item.category,
      snippet: item.snippet ?? item.content ?? '',
      content: item.content ?? item.snippet ?? '',
      fileName: item.fileName ?? `${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.${item.format ?? 'md'}`,
      format: item.format ?? 'md',
      date: 'Just now',
      ...item,
    }
    set((state) => ({
      vaultItems: [newItem, ...state.vaultItems],
      toastMessage: `📌 Saved "${item.title}" to Personal Vault!`,
    }))
    useCampfireStore.getState().stokeFuel()
    setTimeout(() => {
      set({ toastMessage: null })
    }, 3000)
  },
  restoreVaultItem: (id) => {
    const item = useCampfireStore.getState().vaultItems.find((saved) => saved.id === id)
    if (!item) return
    const isCode = /code|project/i.test(item.category) || /\.(ts|tsx|js|py|rs|go|c|cpp)$/i.test(item.fileName)
    const isDoubt = /doubt/i.test(item.category)
    set((state) => ({
      activePage: 'page-workplace',
      workspaceView: 'workplace',
      ideCode: isCode ? item.content : state.ideCode,
      ideFileName: isCode ? item.fileName : state.ideFileName,
      noteContent: isCode ? state.noteContent : item.content,
      whiteboardText: isDoubt ? item.content : state.whiteboardText,
      pendingWorkplaceTool: isCode ? 'ide' : 'study',
      activeSessionType: isCode ? 'coders-developers' : 'study-group',
      toastMessage: `Restored ${item.title} in Workplace`,
    }))
  },
  clearToast: () => set({ toastMessage: null }),
  setDisplayName: (name) => {
    set({ displayName: name })
    useCampfireStore.getState().showToast('Settings saved')
  },
  setEmail: (email) => {
    set({ email })
    useCampfireStore.getState().showToast('Settings saved')
  },
  setHandle: (handle) => {
    set({ handle })
    useCampfireStore.getState().showToast('Settings saved')
  },
  setAvatarUrl: (avatarUrl) => {
    set({ avatarUrl })
    useCampfireStore.getState().showToast('Settings saved')
  },
  setPreference: (key, value) => {
    set((state) => ({ preferences: { ...state.preferences, [key]: value } }))
    useCampfireStore.getState().showToast('Settings saved')
  },
  toggleAccount: (id) => {
    set((state) => ({
      accounts: state.accounts.map((a) =>
        a.id === id ? { ...a, active: !a.active } : a
      ),
    }))
    useCampfireStore.getState().showToast('Settings saved')
  },
  toggleAccountExpanded: (id) => {
    set((state) => ({
      accounts: state.accounts.map((a) =>
        a.id === id ? { ...a, expanded: !a.expanded } : a
      ),
    }))
  },
  refreshAccount: (id) => {
    set((state) => ({
      accounts: state.accounts.map((a) =>
        a.id === id
          ? { ...a, subtitle: 'Updated just now' }
          : a
      ),
    }))
    useCampfireStore.getState().showToast('Connection refreshed')
  },
  removeAccount: (id) => {
    set((state) => ({ accounts: state.accounts.filter((account) => account.id !== id) }))
    useCampfireStore.getState().showToast('Connection removed')
  },
  addAccount: (account) => {
    set((state) => ({
      accounts: [
        ...state.accounts,
        { ...account, id: `connection-${Date.now()}`, active: true, expanded: true },
      ],
    }))
    useCampfireStore.getState().showToast('Connection added')
  },
  toggleApp: (id) => {
    set((state) => ({
      apps: state.apps.map((a) =>
        a.id === id ? { ...a, installed: !a.installed } : a
      ),
    }))
    useCampfireStore.getState().showToast('Settings saved')
  },
  showToast: (message) => {
    set({ toastMessage: message })
    setTimeout(() => {
      if (useCampfireStore.getState().toastMessage === message) {
        set({ toastMessage: null })
      }
    }, 2500)
  },
  logOut: () => {
    set({ isAuthenticated: false, activePage: 'page-home' })
    useCampfireStore.getState().showToast('Logged out')
  },
  setSessionType: (activeSessionType) => set({ activeSessionType }),
  setBurnMode: (mode) => set((state) => ({
    burnTimer: {
      ...state.burnTimer,
      mode,
      secondsRemaining: mode === 'pomodoro' ? state.burnTimer.focusMinutes * 60 : Math.max(state.burnTimer.secondsRemaining, 1),
      phase: 'focus',
      warning: false,
    },
  })),
  setBurnTimerRunning: (running) => set((state) => ({
    burnTimer: { ...state.burnTimer, running, lastActivityAt: Date.now() },
  })),
  tickBurnTimer: () => set((state) => {
    if (!state.burnTimer.running) return state
    const remaining = Math.max(0, state.burnTimer.secondsRemaining - 1)
    if (remaining === 0 && state.burnTimer.mode === 'pomodoro') {
      const onBreak = state.burnTimer.phase === 'focus'
      return {
        burnTimer: {
          ...state.burnTimer,
          phase: onBreak ? 'break' : 'focus',
          secondsRemaining: (onBreak ? state.burnTimer.breakMinutes : state.burnTimer.focusMinutes) * 60,
          elapsedSeconds: state.burnTimer.elapsedSeconds + 1,
          warning: false,
        },
        toastMessage: onBreak ? 'Focus block started' : 'Focus block complete — take a break',
      }
    }
    return {
      burnTimer: {
        ...state.burnTimer,
        secondsRemaining: remaining,
        elapsedSeconds: state.burnTimer.elapsedSeconds + 1,
        warning: state.burnTimer.mode === 'deadman' && Date.now() - state.burnTimer.lastActivityAt > 60_000,
        running: remaining > 0 || state.burnTimer.mode === 'deadman',
      },
    }
  }),
  registerActivity: () => set((state) => ({
    burnTimer: { ...state.burnTimer, lastActivityAt: Date.now(), warning: false },
  })),
  stokeFuel: () => {
    set((state) => ({
      burnTimer: {
        ...state.burnTimer,
        secondsRemaining: state.burnTimer.secondsRemaining + 300,
        lastActivityAt: Date.now(),
        warning: false,
      },
      stokePulse: true,
    }))
    window.setTimeout(() => set({ stokePulse: false }), 700)
  },
  updateIdeCode: (ideCode) => set((state) => ({
    ideCode,
    editedCodeFiles: state.editedCodeFiles.includes(state.ideFileName)
      ? state.editedCodeFiles
      : [...state.editedCodeFiles, state.ideFileName],
  })),
  pipeToIde: (content, fileName = 'chat-snippet.ts') => {
    set((state) => ({
      ideCode: content,
      ideFileName: fileName,
      editedCodeFiles: state.editedCodeFiles.includes(fileName) ? state.editedCodeFiles : [...state.editedCodeFiles, fileName],
      activePage: 'page-workplace',
      workspaceView: 'workplace',
      pendingWorkplaceTool: 'ide',
    }))
  },
  pipeToStudy: (content) => set((state) => ({
    whiteboardText: content,
    activePage: 'page-workplace',
    workspaceView: 'workplace',
    pendingWorkplaceTool: 'study',
    activeSessionType: 'study-group',
  })),
  solveDoubt: (content) => {
    set((state) => ({
      solvedDoubts: [...state.solvedDoubts, content],
      whiteboardText: `${state.whiteboardText}\n\nSolved doubt: ${content}`.trim(),
    }))
    useCampfireStore.getState().stokeFuel()
  },
  setNoteContent: (noteContent) => set({ noteContent }),
  setBlueprintMode: (blueprintMode) => set({ blueprintMode }),
  setPendingWorkplaceTool: (pendingWorkplaceTool) => set({ pendingWorkplaceTool }),
  saveWorkspaceSnapshot: (name) => {
    const state = useCampfireStore.getState()
    const snapshot: WorkspaceSnapshot = {
      id: String(Date.now()),
      name: name.trim() || `Checkpoint ${state.workspaceSnapshots.length + 1}`,
      createdAt: new Date().toLocaleString(),
      sessionType: state.activeSessionType,
      openCards: state.openWorkplaceCards.join(','),
      ideCode: state.ideCode,
      noteText: state.noteContent,
      whiteboardText: state.whiteboardText,
      blueprintMode: state.blueprintMode,
      timerSeconds: state.burnTimer.secondsRemaining,
      elapsedSeconds: state.burnTimer.elapsedSeconds,
    }
    set((current) => ({ workspaceSnapshots: [snapshot, ...current.workspaceSnapshots], toastMessage: 'Workspace snapshot saved' }))
  },
  restoreWorkspaceSnapshot: (id) => {
    const snapshot = useCampfireStore.getState().workspaceSnapshots.find((item) => item.id === id)
    if (!snapshot) return
    set((state) => ({
      activePage: 'page-workplace',
      workspaceView: 'workplace',
      activeSessionType: snapshot.sessionType,
      openWorkplaceCards: snapshot.openCards.split(',').filter(Boolean),
      ideCode: snapshot.ideCode,
      noteContent: snapshot.noteText,
      whiteboardText: snapshot.whiteboardText,
      blueprintMode: snapshot.blueprintMode,
      burnTimer: { ...state.burnTimer, secondsRemaining: snapshot.timerSeconds, elapsedSeconds: snapshot.elapsedSeconds },
      toastMessage: `Restored ${snapshot.name}`,
    }))
  },
  continueLastSession: () => {
    const state = useCampfireStore.getState()
    const latest = state.workspaceSnapshots[0]
    if (latest) state.restoreWorkspaceSnapshot(latest.id)
    else set({ activePage: 'page-workplace', workspaceView: 'workplace' })
  },
  dispatchAgent: async (kind) => {
    const current = useCampfireStore.getState()
    const context = [current.noteContent, current.whiteboardText, current.ideCode].filter(Boolean).join('\n\n')
    const titles: Record<AgentKind, string> = {
      study: 'Study & Flashcard Agent',
      'code-audit': 'Code Audit & Test Agent',
      creator: 'Creator Hook & Storyboard Agent',
    }
    const task: AgentTask = {
      id: String(Date.now()),
      kind,
      title: titles[kind],
      prompt: context.slice(0, 4000),
      output: '',
      status: 'running',
      createdAt: new Date().toLocaleTimeString(),
      read: false,
    }
    set((state) => ({ agentTasks: [task, ...state.agentTasks] }))
    try {
      const output = await runLocalAgent({ kind, context })
      set((state) => ({
        agentTasks: state.agentTasks.map((item) => item.id === task.id ? { ...item, output, status: 'complete' } : item),
      }))
    } catch (error) {
      const output = generateLocalAgentOutput({ kind, context })
      set((state) => ({
        agentTasks: state.agentTasks.map((item) => item.id === task.id ? { ...item, output, status: 'complete' } : item),
        toastMessage: error instanceof Error ? `Local agent unavailable; used offline generator` : 'Local agent unavailable; used offline generator',
      }))
    }
    useCampfireStore.getState().setActivePage('page-workplace')
    useCampfireStore.getState().setAssistantOpen(false)
  },
  markAgentRead: (id) => set((state) => ({
    agentTasks: state.agentTasks.map((task) => task.id === id ? { ...task, read: true } : task),
  })),
  saveAgentOutput: (id) => {
    const task = useCampfireStore.getState().agentTasks.find((item) => item.id === id)
    if (task?.output) useCampfireStore.getState().saveToVault({ title: task.title, category: 'Agent Outputs', snippet: task.output, format: 'md' })
  },
  endAndArchiveSession: () => {
    const state = useCampfireStore.getState()
    const elapsed = Math.floor(state.burnTimer.elapsedSeconds / 60)
    const digest = `# Campfire session digest

- Duration: ${elapsed} minutes
- Active mode: ${state.activeSessionType}
- Code files edited: ${state.editedCodeFiles.join(', ') || 'None'}
- Notes written: ${state.noteContent.trim() ? 1 : 0}
- Doubts solved: ${state.solvedDoubts.length}

## Session note
${state.noteContent || 'No notes recorded.'}

## Whiteboard
${state.whiteboardText || 'No whiteboard notes recorded.'}`
    state.saveToVault({ title: 'Ash Digest — Campfire Session', category: 'Recent Items', snippet: digest, format: 'md' })
    set((current) => ({
      burnTimer: { ...current.burnTimer, running: false },
      activePage: 'page-vault',
    }))
  },
  setSoundscape: (soundscapePreset) => set({ soundscapePreset }),
  setSoundscapeVolume: (soundscapeVolume) => set({ soundscapeVolume }),
  syncSquadView: (member) => {
    const target = member === 'Nova' ? 'coders-developers' : member === 'Kai' ? 'study-group' : 'silent-coworking'
    set({
      activeSessionType: target,
      activePage: 'page-workplace',
      workspaceView: 'workplace',
      pendingWorkplaceTool: member === 'Nova' ? 'ide' : member === 'Kai' ? 'study' : null,
    })
  },
}), {
  name: 'campfire-settings',
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({
    displayName: state.displayName,
    email: state.email,
    handle: state.handle,
    avatarUrl: state.avatarUrl,
    preferences: state.preferences,
    accounts: state.accounts,
    apps: state.apps,
    activeSessionType: state.activeSessionType,
    burnTimer: state.burnTimer,
    ideCode: state.ideCode,
    ideFileName: state.ideFileName,
    editedCodeFiles: state.editedCodeFiles,
    noteContent: state.noteContent,
    whiteboardText: state.whiteboardText,
    solvedDoubts: state.solvedDoubts,
    blueprintMode: state.blueprintMode,
    openWorkplaceCards: state.openWorkplaceCards,
    workspaceSnapshots: state.workspaceSnapshots,
    agentTasks: state.agentTasks,
    soundscapePreset: state.soundscapePreset,
    soundscapeVolume: state.soundscapeVolume,
  }),
}))