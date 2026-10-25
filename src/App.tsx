import { useEffect } from 'react'
import { Page1 } from './pages/Page1'
import { startCampfireTicker, useCampfireStore } from './store/useCampfireStore'
import type { PageSlot } from './types/campfire'

const PAGE_SLOTS: readonly PageSlot[] = ['page-1']

export default function App() {
  const activePage = useCampfireStore((state) => state.activePage)
  const setActivePage = useCampfireStore((state) => state.setActivePage)

  useEffect(() => {
    startCampfireTicker()
  }, [])

  const selectedPage = PAGE_SLOTS.find((page) => page === activePage)

  return (
    <main className="relative flex min-h-full items-center justify-center bg-[#0b0b0c] px-6 text-center text-white">
      {selectedPage === 'page-1' ? (
        <Page1 />
      ) : (
        <p className="text-sm text-white/60">{activePage} is not available yet.</p>
      )}

      <label className="fixed bottom-5 right-5 flex items-center gap-2 rounded-full border border-white/10 bg-black/80 px-3 py-2 text-xs text-white/70 shadow-lg backdrop-blur">
        <span>Page</span>
        <select
          aria-label="Active page"
          className="cursor-pointer bg-transparent text-white outline-none"
          value={activePage}
          onChange={(event) => {
            const page = PAGE_SLOTS.find((slot) => slot === event.target.value)
            if (page) setActivePage(page)
          }}
        >
          {PAGE_SLOTS.map((page) => (
            <option key={page} value={page} className="bg-[#0b0b0c]">
              {page.replace('-', ' ')}
            </option>
          ))}
        </select>
      </label>
    </main>
  )
}
