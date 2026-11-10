import { create } from 'zustand'

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
}

interface AppIntegration {
  id: string
  name: string
  description: string
  installed: boolean
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
  accounts: ConnectedAccount[]
  apps: AppIntegration[]
  setActivePage: (page: string) => void
  setActiveWorkspaceView: (view: 'chat' | 'workplace') => void
  openLitAFire: () => void
  saveToVault: (item: Omit<VaultItem, 'id' | 'date'>) => void
  clearToast: () => void
  setDisplayName: (name: string) => void
  setEmail: (email: string) => void
  toggleAccount: (id: string) => void
  refreshAccount: (id: string) => void
  toggleApp: (id: string) => void
}

export const useCampfireStore = create<CampfireStore>((set, get) => ({
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

  accounts: [
    {
      id: 'acc-1',
      name: 'Local FreeLLM & Workspace Engine',
      subtitle: 'Updated about 21 hours ago via Campfire Bridge',
      status: 'ACTIVE · 0ms',
      active: true,
    },
    {
      id: 'acc-2',
      name: 'Auto Model Route (127.0.0.1:31415)',
      subtitle: 'Personal Vault Auto-Sync',
      status: '196,435 tokens',
      active: true,
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
    set({ toastMessage: 'Settings saved' })
    setTimeout(() => set({ toastMessage: null }), 2500)
  },
  toggleAccount: (id) => {
    set((state) => ({
      accounts: state.accounts.map((a) =>
        a.id === id ? { ...a, active: !a.active } : a
      ),
    }))
  },
  refreshAccount: (id) => {
    set((state) => ({
      accounts: state.accounts.map((a) =>
        a.id === id
          ? { ...a, subtitle: 'Updated just now', status: a.status }
          : a
      ),
    }))
  },
  toggleApp: (id) => {
    set((state) => ({
      apps: state.apps.map((a) =>
        a.id === id ? { ...a, installed: !a.installed } : a
      ),
    }))
  },
}))