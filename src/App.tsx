import { useAnnotator } from './components/Annotator'
import { Ruler } from 'lucide-react'

export default function App() {
  const { isAnnotating, toggleAnnotator } = useAnnotator()

  return (
    <div className="min-h-screen bg-black">
      {/* Floating Annotator Toggle Button (Bottom Right) */}
      <button
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border border-blue-500/40 bg-blue-600/90 px-4 py-2.5 text-xs font-semibold text-white shadow-2xl backdrop-blur-md transition hover:bg-blue-500 active:scale-95"
        onClick={toggleAnnotator}
        title="Toggle Annotator Grid (Ctrl+Shift+A)"
      >
        <Ruler className="h-4 w-4" />
        📍 Annotator
      </button>
    </div>
  )
}