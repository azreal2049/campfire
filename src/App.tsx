import { useCampfireStore } from './store/useCampfireStore'
import { PageLanding } from './pages/PageLanding'
import { PageSignIn } from './pages/PageSignIn'
import { PageLobby } from './pages/PageLobby'
import { PageChat } from './pages/PageChat'
import { PageWorkplace } from './pages/PageWorkplace'
import { PageVault } from './pages/PageVault'
import { PageSettings } from './pages/PageSettings'

export default function App() {
  const activePage = useCampfireStore((state) => state.activePage)

  switch (activePage) {
    case 'page-0':
      return <PageLanding />
    case 'page-signin':
      return <PageSignIn />
    case 'page-lobby':
      return <PageLobby />
    case 'page-chat':
      return <PageChat />
    case 'page-workplace':
      return <PageWorkplace />
    case 'page-vault':
      return <PageVault />
    case 'page-settings':
      return <PageSettings />
    default:
      return <PageLanding />
  }
}
