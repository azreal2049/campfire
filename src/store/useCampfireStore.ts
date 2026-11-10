import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  generateLocalAgentOutput,
  runLocalAgent,
  type AgentKind,
  type AgentTask,
  type BurnTimerState,
  type CampfireSessionType,
  type PortalDrop,
  type ShopItem,
  type SparkContract,
  type VaultItem,
  type WorkspaceRevision,
  type WorkspaceRevisionKind,
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

let momentumResetTimer: number | null = null

function scheduleMomentumReset(readMomentum: () => CampfireStore['momentum'], reset: () => void) {
  if (momentumResetTimer !== null) window.clearTimeout(momentumResetTimer)
  momentumResetTimer = window.setTimeout(() => {
    if (readMomentum() === 'typing') reset()
    momentumResetTimer = null
  }, 1800)
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
  soundscapePlaying: boolean
  stokePulse: boolean
  portalDrops: PortalDrop[]
  portalToastActionId: string | null
  sparkBalance: number
  sparkContract: SparkContract | null
  shopItems: ShopItem[]
  activeGlassTheme: string
  activeSoundscapePack: string
  activeAgentPreset: string
  workspaceRevisions: WorkspaceRevision[]
  momentum: 'idle' | 'typing' | 'success'
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
  setPomodoroCycle: (focusMinutes: number, breakMinutes: number) => void
  setBurnTimerRunning: (running: boolean) => void
  setBurnTimerSeconds: (seconds: number) => void
  tickBurnTimer: () => void
  registerActivity: () => void
  stokeFuel: () => void
  updateIdeCode: (code: string) => void
  pipeToIde: (content: string, fileName?: string) => void
  pipeToStudy: (content: string) => void
  setWhiteboardText: (content: string) => void
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
  toggleFocusSoundscape: () => void
  setSoundscapePlaying: (playing: boolean) => void
  setSoundscapeVolume: (volume: number) => void
  syncSquadView: (member: string) => void
  addPortalDrop: (kind: WorkspaceRevisionKind | 'reference', content: string, source: string) => void
  insertPortalDrop: (id: string, target: 'ide' | 'whiteboard') => void
  startSparkContract: (goal: string) => boolean
  verifySparkContract: () => void
  purchaseShopItem: (id: string) => void
  equipShopItem: (id: string) => void
  recordWorkspaceRevision: (kind: WorkspaceRevisionKind, content: string, fileName?: string) => void
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
      content: 'def max_sliding_window(nums, k): ...',
      fileName: 'sliding-window.py',
      format: 'py',
      date: 'Today at 10:45 AM',
    },
    {
      id: 'v2',
      title: 'SN1/SN2 Reaction Energy Diagram Notes',
      category: 'Study Notes',
      snippet: 'Two-step carbocation intermediate vs one-step backside attack.',
      content: 'Two-step carbocation intermediate vs one-step backside attack.',
      fileName: 'sn1-sn2-notes.md',
      format: 'md',
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
  soundscapePlaying: false,
  stokePulse: false,
  portalDrops: [],
  portalToastActionId: null,
  sparkBalance: 150,
  sparkContract: null,
  shopItems: [
    { id: 'glass-ember', name: 'Ember Glass', description: 'Warm, translucent card surfaces with a restrained amber edge.', kind: 'theme', price: 50, owned: false },
    { id: 'glass-frost', name: 'Frosted Cyan', description: 'Cool glass surfaces tuned for quiet reading sessions.', kind: 'theme', price: 50, owned: false },
    { id: 'sound-rain-plus', name: 'Rainfall Pack', description: 'A focused set of rain and low-noise soundscapes.', kind: 'soundscape', price: 35, owned: false },
    { id: 'sound-fire-plus', name: 'Hearth Pack', description: 'Additional warm crackle and ember soundscape presets.', kind: 'soundscape', price: 35, owned: false },
    { id: 'agent-study-pro', name: 'Study Coach Preset', description: 'A study-first agent tone for summaries and recall prompts.', kind: 'agent', price: 40, owned: false },
    { id: 'agent-code-review', name: 'Code Clarity Preset', description: 'A concise agent tone for code review and test ideas.', kind: 'agent', price: 40, owned: false },
  ],
  activeGlassTheme: 'default',
  activeSoundscapePack: 'default',
  activeAgentPreset: 'default',
  workspaceRevisions: [],
  momentum: 'idle',

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
    }
    set((state) => ({ vaultItems: [newItem, ...state.vaultItems] }))
    useCampfireStore.getState().showToast(`📌 Saved "${item.title}" to Personal Vault!`)
    useCampfireStore.getState().stokeFuel()
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
  clearToast: () => set({ toastMessage: null, portalToastActionId: null }),
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
    set({ toastMessage: message, portalToastActionId: null })
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
  setPomodoroCycle: (focusMinutes, breakMinutes) => set((state) => ({
    burnTimer: {
      ...state.burnTimer,
      focusMinutes,
      breakMinutes,
      ...(state.burnTimer.mode === 'pomodoro' && state.burnTimer.phase === 'focus'
        ? { secondsRemaining: focusMinutes * 60 }
        : {}),
    },
  })),
  setBurnTimerRunning: (running) => set((state) => ({
    burnTimer: { ...state.burnTimer, running, lastActivityAt: Date.now() },
  })),
  setBurnTimerSeconds: (secondsRemaining) => set((state) => ({
    burnTimer: { ...state.burnTimer, secondsRemaining: Math.max(0, secondsRemaining) },
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
        ...(onBreak && state.sparkContract?.status === 'active'
          ? {
              sparkBalance: state.sparkBalance + state.sparkContract.reward,
              sparkContract: { ...state.sparkContract, status: 'verified' as const },
              toastMessage: `Focus complete — +${state.sparkContract.reward} Ember Sparks`,
            }
          : { toastMessage: onBreak ? 'Focus block started' : 'Focus block complete — take a break' }),
      }
    }
    return {
      burnTimer: {
        ...state.burnTimer,
        secondsRemaining: remaining,
        elapsedSeconds: state.burnTimer.elapsedSeconds + 1,
        warning: state.burnTimer.mode === 'deadman' && Date.now() - state.burnTimer.lastActivityAt > 60_000,
        running: remaining > 0,
      },
      ...(remaining === 0 && state.sparkContract?.status === 'active'
        ? {
            sparkBalance: state.sparkBalance + state.sparkContract.reward,
            sparkContract: { ...state.sparkContract, status: 'verified' as const },
            momentum: 'success' as const,
            toastMessage: `Timer complete — Spark Contract verified · +${state.sparkContract.reward}`,
          }
        : {}),
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
  updateIdeCode: (ideCode) => {
    set((state) => ({
      ideCode,
      momentum: 'typing',
      editedCodeFiles: state.editedCodeFiles.includes(state.ideFileName)
        ? state.editedCodeFiles
        : [...state.editedCodeFiles, state.ideFileName],
    }))
    scheduleMomentumReset(
      () => useCampfireStore.getState().momentum,
      () => set({ momentum: 'idle' }),
    )
  },
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
  pipeToStudy: (content) => set({
    whiteboardText: content,
    activePage: 'page-workplace',
    workspaceView: 'workplace',
    pendingWorkplaceTool: 'study',
    activeSessionType: 'study-group',
  }),
  setWhiteboardText: (whiteboardText) => {
    set({ whiteboardText, momentum: 'typing' })
    scheduleMomentumReset(
      () => useCampfireStore.getState().momentum,
      () => set({ momentum: 'idle' }),
    )
  },
  solveDoubt: (content) => {
    set((state) => ({
      solvedDoubts: [...state.solvedDoubts, content],
      whiteboardText: `${state.whiteboardText}\n\nSolved doubt: ${content}`.trim(),
      momentum: 'success',
      ...(state.sparkContract?.status === 'active'
        ? {
            sparkBalance: state.sparkBalance + state.sparkContract.reward,
            sparkContract: { ...state.sparkContract, status: 'verified' as const },
            toastMessage: `Doubt solved — Spark Contract verified · +${state.sparkContract.reward}`,
          }
        : {}),
    }))
    window.setTimeout(() => {
      if (useCampfireStore.getState().momentum === 'success') set({ momentum: 'idle' })
    }, 1400)
    useCampfireStore.getState().stokeFuel()
  },
  setNoteContent: (noteContent) => {
    set({ noteContent, momentum: 'typing' })
    scheduleMomentumReset(
      () => useCampfireStore.getState().momentum,
      () => set({ momentum: 'idle' }),
    )
  },
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
    const presetContext = current.activeAgentPreset === 'agent-study-pro'
      ? 'Use the Study Coach style: prioritize concise explanations and active recall.'
      : current.activeAgentPreset === 'agent-code-review'
        ? 'Use the Code Clarity style: prioritize concrete, concise review suggestions.'
        : ''
    const context = [presetContext, current.noteContent, current.whiteboardText, current.ideCode].filter(Boolean).join('\n\n')
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
      output: generateLocalAgentOutput({ kind, context }),
      status: 'complete',
      createdAt: new Date().toLocaleTimeString(),
      read: false,
    }
    set((state) => ({
      agentTasks: [task, ...state.agentTasks],
      activePage: 'page-workplace',
      workspaceView: 'workplace',
      pendingWorkplaceTool: kind === 'study' ? 'study' : kind === 'code-audit' ? 'ide' : null,
    }))
    useCampfireStore.getState().setAssistantOpen(false)
    void runLocalAgent({ kind, context }).then((output) => {
      set((state) => ({
        agentTasks: state.agentTasks.map((item) => item.id === task.id ? { ...item, output } : item),
      }))
    })
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
  toggleFocusSoundscape: () => set((state) => ({
    soundscapePreset: state.soundscapePreset === 'gamma' ? 'brown' : 'gamma',
    soundscapePlaying: true,
  })),
  setSoundscapePlaying: (soundscapePlaying) => set({ soundscapePlaying }),
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
  addPortalDrop: (kind, content, source) => {
    const trimmed = content.trim()
    if (!trimmed) return
    const drop: PortalDrop = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      kind,
      content: trimmed.slice(0, 12000),
      source,
      createdAt: new Date().toLocaleTimeString(),
      inserted: false,
    }
    set((state) => ({
      portalDrops: [drop, ...state.portalDrops].slice(0, 30),
      portalToastActionId: drop.id,
      toastMessage: '🌀 Added to your Campfire Portal',
    }))
    window.setTimeout(() => {
      if (useCampfireStore.getState().portalToastActionId === drop.id) {
        set({ portalToastActionId: null, toastMessage: null })
      }
    }, 3500)
  },
  insertPortalDrop: (id, target) => {
    const drop = useCampfireStore.getState().portalDrops.find((item) => item.id === id)
    if (!drop) return
    set((state) => ({
      portalDrops: state.portalDrops.map((item) => item.id === id ? { ...item, inserted: true } : item),
      portalToastActionId: null,
      ...(target === 'ide'
        ? {
            ideCode: `// Portal drop · ${drop.source}\n${drop.content}`,
            ideFileName: 'portal-reference.txt',
            editedCodeFiles: state.editedCodeFiles.includes('portal-reference.txt')
              ? state.editedCodeFiles
              : [...state.editedCodeFiles, 'portal-reference.txt'],
            pendingWorkplaceTool: 'ide' as const,
          }
        : {
            whiteboardText: `${state.whiteboardText}\n\n${drop.content}\n\nSource: ${drop.source}`.trim(),
            pendingWorkplaceTool: 'study' as const,
          }),
      activePage: 'page-workplace',
      workspaceView: 'workplace',
      toastMessage: `⚡ Inserted portal drop into ${target === 'ide' ? 'IDE' : 'Whiteboard'}`,
    }))
  },
  startSparkContract: (goal) => {
    const state = useCampfireStore.getState()
    const cleanGoal = goal.trim().slice(0, 120)
    if (!cleanGoal) {
      state.showToast('Add a one-line session goal first')
      return false
    }
    if (state.sparkBalance < 25) {
      state.showToast('You need 25 Sparks to stake a contract')
      return false
    }
    set((current) => ({
      sparkBalance: current.sparkBalance - 25,
      sparkContract: { goal: cleanGoal, status: 'active', startedAt: Date.now(), stake: 25, reward: 50 },
      burnTimer: {
        ...current.burnTimer,
        running: true,
        lastActivityAt: Date.now(),
        phase: 'focus',
        secondsRemaining: current.burnTimer.secondsRemaining > 0
          ? current.burnTimer.secondsRemaining
          : current.burnTimer.mode === 'pomodoro' ? current.burnTimer.focusMinutes * 60 : 25 * 60,
      },
      toastMessage: 'Spark Contract started · 25 Sparks staked',
    }))
    return true
  },
  verifySparkContract: () => {
    set((state) => {
      if (!state.sparkContract || state.sparkContract.status !== 'active') {
        return { momentum: 'success', toastMessage: 'Quick code check passed' }
      }
      return {
        sparkBalance: state.sparkBalance + state.sparkContract.reward,
        sparkContract: { ...state.sparkContract, status: 'verified' },
        momentum: 'success',
        toastMessage: `Spark Contract verified · +${state.sparkContract.reward} Ember Sparks`,
      }
    })
    window.setTimeout(() => {
      if (useCampfireStore.getState().momentum === 'success') set({ momentum: 'idle' })
    }, 1400)
  },
  purchaseShopItem: (id) => {
    set((state) => {
      const item = state.shopItems.find((candidate) => candidate.id === id)
      if (!item || item.owned) return state
      if (state.sparkBalance < item.price) {
        return { ...state, toastMessage: 'Not enough Ember Sparks for this item' }
      }
      return {
        sparkBalance: state.sparkBalance - item.price,
        shopItems: state.shopItems.map((candidate) => candidate.id === id ? { ...candidate, owned: true } : candidate),
        toastMessage: `${item.name} unlocked`,
      }
    })
  },
  equipShopItem: (id) => {
    set((state) => {
      const item = state.shopItems.find((candidate) => candidate.id === id)
      if (!item?.owned) return state
      if (item.kind === 'theme') return { activeGlassTheme: item.id, toastMessage: `${item.name} applied` }
      if (item.kind === 'soundscape') return {
        activeSoundscapePack: item.id,
        soundscapePreset: item.id === 'sound-rain-plus' ? 'rain' : 'campfire',
        toastMessage: `${item.name} applied`,
      }
      return { activeAgentPreset: item.id, toastMessage: `${item.name} applied` }
    })
  },
  recordWorkspaceRevision: (kind, content, fileName = '') => {
    if (!content.trim()) return
    const revision: WorkspaceRevision = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      kind,
      fileName,
      content: content.slice(0, 30000),
      createdAt: Date.now(),
    }
    set((state) => ({ workspaceRevisions: [...state.workspaceRevisions, revision].slice(-100) }))
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
    vaultItems: state.vaultItems,
    portalDrops: state.portalDrops,
    sparkBalance: state.sparkBalance,
    sparkContract: state.sparkContract,
    shopItems: state.shopItems,
    activeGlassTheme: state.activeGlassTheme,
    activeSoundscapePack: state.activeSoundscapePack,
    activeAgentPreset: state.activeAgentPreset,
    workspaceRevisions: state.workspaceRevisions,
  }),
}))