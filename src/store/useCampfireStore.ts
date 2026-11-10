import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface VaultItem {
  id: string
  title: string
  category: string
  snippet?: string
  date: string
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
  setActivePage: (page: string) => void
  setActiveWorkspaceView: (view: 'chat' | 'workplace') => void
  openLitAFire: () => void
  saveToVault: (item: Omit<VaultItem, 'id' | 'date'>) => void
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
}

export const useCampfireStore = create<CampfireStore>()(persist((set) => ({
  activePage: 'page-home',
  isAuthenticated: true,
  workspaceView: 'chat',
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

  setActivePage: (page) => set({ activePage: page }),
  setActiveWorkspaceView: (view) => set({ workspaceView: view, activePage: view === 'chat' ? 'page-chat' : 'page-workplace' }),
  openLitAFire: () => {
    console.log('Lit a fire modal opened')
  },
  saveToVault: (item) => {
    const newItem: VaultItem = {
      ...item,
      id: String(Date.now()),
      date: 'Just now',
    }
    set((state) => ({
      vaultItems: [newItem, ...state.vaultItems],
      toastMessage: `📌 Saved "${item.title}" to Personal Vault!`,
    }))
    setTimeout(() => {
      set({ toastMessage: null })
    }, 3000)
  },
  clearToast: () => set({ toastMessage: null }),
  setDisplayName: (name) => {
    set({ displayName: name })
    set({ toastMessage: 'Settings saved' })
    setTimeout(() => set({ toastMessage: null }), 2500)
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
  }),
}))