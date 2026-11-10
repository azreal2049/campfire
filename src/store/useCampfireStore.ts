import { create } from 'zustand'

interface CampfireStore {
  activePage: string
  isAuthenticated: boolean
  workspaceView: 'chat' | 'workplace'
  setActivePage: (page: string) => void
  setActiveWorkspaceView: (view: 'chat' | 'workplace') => void
  openLitAFire: () => void
}

export const useCampfireStore = create<CampfireStore>((set) => ({
  activePage: 'page-home',
  isAuthenticated: true,
  workspaceView: 'chat',
  setActivePage: (page) => set({ activePage: page }),
  setActiveWorkspaceView: (view) => set({ workspaceView: view }),
  openLitAFire: () => {
    console.log('Lit a fire modal opened')
  },
}))