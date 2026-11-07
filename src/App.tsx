import { useCampfireStore } from './store/useCampfireStore'
import { AppShell } from './components/AppShell'
import { GlobalAIBot } from './components/GlobalAIBot'
import { DevPageSwitcher } from './components/DevPageSwitcher'
import { LitACampfireModal } from './components/LitACampfireModal'
import { ProfoundBackground } from './components/ProfoundBackground'

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

  if (!isAuthenticated) {
    return (
      <>
        <ProfoundBackground />
        <PageLanding />
      </>
    )
  }

  if (activePage === 'page-signin') {
    return (
      <>
        <ProfoundBackground />
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
      {renderPage()}
      <GlobalAIBot />
      <LitACampfireModal />
      <DevPageSwitcher />
    </AppShell>
  )
}