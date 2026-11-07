import { useState, useEffect, useCallback } from 'react'
import { Ruler, X, Move, Grid3x3, MousePointer } from 'lucide-react'

interface AnnotatorProps {
  active: boolean
  onToggle: (val: boolean) => void
  onPositionChange: (x: number, y: number) => void
  cellSize?: number
}

export function Annotator({
  active,
  onToggle,
  onPositionChange,
  cellSize = 40,
}: AnnotatorProps) {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const [selectedCell, setSelectedCell] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!active) return
    const handleMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY })
      setSelectedCell({
        x: Math.floor(e.clientX / cellSize),
        y: Math.floor(e.clientY / cellSize),
      })
    }
    const handleClick = (e: MouseEvent) => {
      const x = Math.floor(e.clientX / cellSize)
      const y = Math.floor(e.clientY / cellSize)
      setSelectedCell({ x, y })
      onPositionChange(x * cellSize, y * cellSize)
    }
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('click', handleClick)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('click', handleClick)
    }
  }, [active, cellSize, onPositionChange])

  if (!active) return null

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Grid Overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: [
            `linear-gradient(to right, rgba(59,130,246,0.3) 1px, transparent 1px)`,
            `linear-gradient(to bottom, rgba(59,130,246,0.3) 1px, transparent 1px)`,
          ].join(','),
          backgroundSize: `${cellSize}px ${cellSize}px`,
          backgroundPosition: '0 0',
        }}
      />

      {/* Major Grid Lines every 5 cells */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: [
            `linear-gradient(to right, rgba(245,158,11,0.5) 1px, transparent 1px)`,
            `linear-gradient(to bottom, rgba(245,158,11,0.5) 1px, transparent 1px)`,
          ].join(','),
          backgroundSize: `${cellSize * 5}px ${cellSize * 5}px`,
          backgroundPosition: '0 0',
        }}
      />

      {/* Selected Cell Highlight */}
      <div
        className="absolute border-2 border-amber-400 bg-amber-400/10 transition-all duration-75"
        style={{
          left: `${selectedCell.x * cellSize}px`,
          top: `${selectedCell.y * cellSize}px`,
          width: `${cellSize}px`,
          height: `${cellSize}px`,
        }}
      />

      {/* Coordinate HUD */}
      <div className="fixed top-4 left-4 z-[10000] pointer-events-auto">
        <div className="flex items-center gap-2 rounded-xl border border-blue-500/40 bg-black/90 backdrop-blur-xl px-4 py-2.5 shadow-2xl">
          <Ruler className="h-4 w-4 text-blue-400" />
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">Annotator Active</span>
            <div className="flex items-center gap-3 text-xs font-mono text-white">
              <span>X: <span className="text-blue-300">{cursorPos.x}</span></span>
              <span>Y: <span className="text-blue-300">{cursorPos.y}</span></span>
              <span>Cell: <span className="text-amber-300">{selectedCell.x},{selectedCell.y}</span></span>
            </div>
          </div>
          <button
            className="ml-2 rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white"
            onClick={() => onToggle(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[10000] pointer-events-none">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/80 backdrop-blur-xl px-4 py-2 text-xs text-zinc-300 shadow-xl">
          <MousePointer className="h-3.5 w-3.5 text-blue-400" />
          <span>Click anywhere to snap element to grid cell</span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-500">Press <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px]">ESC</kbd> to exit</span>
        </div>
      </div>
    </div>
  )
}

interface UseAnnotatorReturn {
  AnnotatorUI: React.FC<AnnotatorProps>
  isAnnotating: boolean
  toggleAnnotator: () => void
  position: { x: number; y: number }
}

export function useAnnotator(): UseAnnotatorReturn {
  const [isAnnotating, setIsAnnotating] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const toggleAnnotator = useCallback(() => {
    setIsAnnotating((prev) => !prev)
  }, [])

  const handlePositionChange = useCallback((x: number, y: number) => {
    setPosition({ x, y })
  }, [])

  useEffect(() => {
    if (!isAnnotating) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsAnnotating(false)
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isAnnotating])

  const AnnotatorUI: React.FC<AnnotatorProps> = (props) => (
    <Annotator
      active={isAnnotating}
      onToggle={setIsAnnotating}
      onPositionChange={handlePositionChange}
      {...props}
    />
  )

  return {
    AnnotatorUI,
    isAnnotating,
    toggleAnnotator,
    position,
  }
}