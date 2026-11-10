import { AnimatePresence, motion } from 'framer-motion'
import { AppShell } from './components/AppShell'
import { useCampfireStore } from './store/useCampfireStore'
import { PageHome } from './pages/PageHome'
import { PageChat } from './pages/PageChat'
import { PageWorkplace } from './pages/PageWorkplace'
import { PageVault } from './pages/PageVault'
import { PageSettings } from './pages/PageSettings'
import { PageNotes } from './pages/PageNotes'
import { PageFriends } from './pages/PageFriends'
import { PageShop } from './pages/PageShop'

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
      case 'page-notes':
        return <PageNotes />
      case 'page-friends':
        return <PageFriends />
      case 'page-settings':
        return <PageSettings />
      case 'page-shop':
        return <PageShop />
      default:
        return <PageHome />
    }
  }

  return (
    <AppShell>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activePage}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="min-h-full"
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
    </AppShell>
  )
}