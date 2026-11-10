import { useCampfireStore } from './store/useCampfireStore'
import { DevPageSwitcher } from './components/DevPageSwitcher'
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
    <div className="min-h-screen bg-[#070709] text-white">
      {renderPage()}
      <DevPageSwitcher />
    </div>
  )
}