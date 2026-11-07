import { useCampfireStore } from './store/useCampfireStore'
import { AppShell } from './components/AppShell'
import { GlobalAIBot } from './components/GlobalAIBot'
import { DevPageSwitcher } from './components/DevPageSwitcher'
import { LitACampfireModal } from './components/LitACampfireModal'
import { ProfoundBackground } from './components/ProfoundBackground'
import { useAnnotator } from './components/Annotator'
import { Ruler } from 'lucide-react'

import { PageLanding } from './pages/PageLanding'
import { PageHomeLobby } from './pages/PageHomeLobby'
import { PageChat } from './pages/PageChat'
import { PageWorkplace } from './pages/PageWorkplace'
import { PageFriends } from './pages/PageFriends'
import { PageVault } from './pages/PageVault'
import { PageShop } from './pages/PageShop'
import { PageUserSettings } from './pages/PageUserSettings'
import { PageAppSettings } from './pages/PageAppSettings'
import { PageSignIn } from './pages/PageSignIn'

export default function App() {
  const activePage = useCampfireStore((state) => state.activePage)
  const isAuthenticated = useCampfireStore((state) => state.isAuthenticated)

  const { AnnotatorUI, isAnnotating, toggleAnnotator, position } = useAnnotator()

  if (!isAuthenticated) {
    return (
      <>
        <ProfoundBackground />
        <AnnotatorUI />
        <PageLanding />
      </>
    )
  }

  if (activePage === 'page-signin') {
    return (
      <>
        <ProfoundBackground />
        <AnnotatorUI />
        <PageSignIn />
      </>
    )
  }

  function renderPage() {
    switch (activePage) {
      case 'page-home': return <PageHomeLobby />
      case 'page-chat': return <PageChat />
      case 'page-workplace': return <PageWorkplace />
      case 'page-friends': return <PageFriends />
      case 'page-vault': return <PageVault />
      case 'page-shop': return <PageShop />
      case 'page-user-settings': return <PageUserSettings />
      case 'page-app-settings': return <PageAppSettings />
      default: return <PageHomeLobby />
    }
  }

  return (
    <AppShell>
      <ProfoundBackground />
      <AnnotatorUI />
      {renderPage()}
      <GlobalAIBot />
      <LitACampfireModal />
      <DevPageSwitcher />

      {/* Floating Annotator Toggle Button (Bottom Right) */}
      <button
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border border-blue-500/40 bg-blue-600/90 px-4 py-2.5 text-xs font-semibold text-white shadow-2xl backdrop-blur-md transition hover:bg-blue-500 active:scale-95"
        onClick={toggleAnnotator}
        title="Toggle Annotator Grid (Ctrl+Shift+A)"
      >
        <Ruler className="h-4 w-4" />
        📍 Annotator
      </button>
    </AppShell>
  )
}