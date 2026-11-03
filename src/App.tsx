import { useEffect } from 'react'
import { PageChat } from './pages/PageChat'
import { PageLobby } from './pages/PageLobby'
import { PageSettings } from './pages/PageSettings'
import { PageSignIn } from './pages/PageSignIn'
import { PageVault } from './pages/PageVault'
import { PageWorkplace } from './pages/PageWorkplace'
import { GlobalAIBot } from './components/GlobalAIBot'
import { startCampfireTicker, useCampfireStore } from './store/useCampfireStore'

export default function App() {
  const activePage = useCampfireStore((state) => state.activePage)

  useEffect(() => {
    startCampfireTicker()
  }, [])

  let page = <PageSignIn />

  switch (activePage) {
    case 'page-lobby':
      page = <PageLobby />
      break
    case 'page-chat':
      page = <PageChat />
      break
    case 'page-workplace':
      page = <PageWorkplace />
      break
    case 'page-vault':
      page = <PageVault />
      break
    case 'page-settings':
      page = <PageSettings />
      break
    case 'page-signin':
    default:
      page = <PageSignIn />
      break
  }

  return (
    <>
      {page}
      <GlobalAIBot />
    </>
  )
}
