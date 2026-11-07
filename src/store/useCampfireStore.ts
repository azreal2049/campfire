import { create } from 'zustand'

interface MinimalStore {
  workspaceView: 'chat' | 'workplace'
  setActiveWorkspaceView: (view: 'chat' | 'workplace') => void
}

export const useCampfireStore = create<MinimalStore>((set) => ({
  workspaceView: 'chat',
  setActiveWorkspaceView: (view) => set({ workspaceView: view }),
}))