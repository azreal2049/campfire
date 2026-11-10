import { AppShell } from './components/AppShell'
import { DevPageSwitcher } from './components/DevPageSwitcher'
import { useCampfireStore } from './store/useCampfireStore'
import { PageHome } from './pages/PageHome'
import { PageChat } from './pages/PageChat'
import { PageWorkplace } from './pages/PageWorkplace'
import { PageVault } from './pages/PageVault'

export default function App() {
  const activePage = useCampfireStore((state) => state.activePage)

  function renderPage() {
    switch (activePage) {
      case 'page-chat':
        return <PageChat />
      case 'page-workplace':
        return <PageWorkplace />
      case 'page-vault':
        return <PageVault />
      default:
        return <PageHome />
    }
  }

  return (
    <AppShell>
      {renderPage()}
      <DevPageSwitcher />
    </AppShell>
  )
}