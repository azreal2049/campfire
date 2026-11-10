import { create } from 'zustand'

export interface VaultItem {
  id: string
  title: string
  category: string
  snippet?: string
  date: string
}

interface CampfireStore {
  activePage: string
  isAuthenticated: boolean
  workspaceView: 'chat' | 'workplace'
  vaultItems: VaultItem[]
  toastMessage: string | null
  setActivePage: (page: string) => void
  setActiveWorkspaceView: (view: 'chat' | 'workplace') => void
  openLitAFire: () => void
  saveToVault: (item: Omit<VaultItem, 'id' | 'date'>) => void
  clearToast: () => void
}

export const useCampfireStore = create<CampfireStore>((set) => ({
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
}))