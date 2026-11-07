import { AppShell } from './components/AppShell'
import { useCampfireStore } from './store/useCampfireStore'

export default function App() {
  const workspaceView = useCampfireStore((state) => state.workspaceView)

  return (
    <AppShell>
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">
            {workspaceView === 'chat' ? 'Chat' : 'Workplace'}
          </h1>
          <p className="mt-2 text-zinc-500">
            Toggle the button above to switch views
          </p>
        </div>
      </div>
    </AppShell>
  )
}