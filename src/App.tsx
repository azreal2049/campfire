import { useEffect } from 'react'
import { startCampfireTicker } from './store/useCampfireStore'

export default function App() {
  useEffect(() => {
    startCampfireTicker()
  }, [])

  return <main className="min-h-screen" />
}
