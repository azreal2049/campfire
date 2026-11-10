import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RotateCcw,
  Bookmark,
  Sparkles,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Bot,
  VolumeX,
  Code,
  BookOpen,
  Send,
  Compass,
  X,
} from 'lucide-react'
import { useCampfireStore } from '../store/useCampfireStore'

type SessionMode =
  | 'All Widgets'
  | 'I. Study Group'
  | 'II. Coders x Devs'
  | 'III. Fun with Friends'
  | 'IV. Musicians'
  | 'V. Content Creators'
  | 'VI. Editors x VFX'
  | 'VII. Official Works'
  | 'VIII. Silent Co-working'

const SESSION_MODES: SessionMode[] = [
  'All Widgets',
  'I. Study Group',
  'II. Coders x Devs',
  'III. Fun with Friends',
  'IV. Musicians',
  'V. Content Creators',
  'VI. Editors x VFX',
  'VII. Official Works',
  'VIII. Silent Co-working',
]

interface WidgetDef {
  id: string
  label: string
  height: number
  mode: SessionMode
}

const WIDGET_DEFS: WidgetDef[] = [
  { id: 'focus-timer', label: 'Focus timer', height: 304, mode: 'VIII. Silent Co-working' },
  { id: 'inbox-agents', label: 'Inbox — Autonomous Multi-Agent Feed', height: 340, mode: 'VII. Official Works' },
  { id: 'quick-note', label: 'Quick note', height: 246, mode: 'I. Study Group' },
  { id: 'music-deck', label: 'Music — Focus Soundscape', height: 180, mode: 'IV. Musicians' },
  { id: 'session-sprint', label: 'Session Sprint', height: 225, mode: 'VIII. Silent Co-working' },
  { id: 'mood-board', label: 'Mood board', height: 352, mode: 'V. Content Creators' },
  { id: 'up-next', label: 'Up next — Squad Sync', height: 240, mode: 'III. Fun with Friends' },
  { id: 'live-stage', label: 'Live Stage — Video Review', height: 320, mode: 'VI. Editors x VFX' },
  { id: 'activity-chart', label: 'Activity — Deep Work Output', height: 232, mode: 'VII. Official Works' },
  { id: 'code-rig', label: 'Code & Shader Lab', height: 352, mode: 'II. Coders x Devs' },
  { id: 'study-pod', label: 'Study Group Rig — Solvely AI', height: 352, mode: 'I. Study Group' },
  { id: 'radar-weather', label: 'Environment & Radar', height: 304, mode: 'III. Fun with Friends' },
]

export function PageWorkplace() {
  const saveToVault = useCampfireStore((state) => state.saveToVault)
  const toastMessage = useCampfireStore((state) => state.toastMessage)

  // ── States ──
  const [canvasTheme, setCanvasTheme] = useState<'obsidian' | 'daylight'>('obsidian')
  const [selectedMode, setSelectedMode] = useState<SessionMode>('All Widgets')
  const [blueprintActive, setBlueprintActive] = useState(false)
  const [inspectedIndex, setInspectedIndex] = useState<number>(0)
  const [fullDevRigOpen, setFullDevRigOpen] = useState(false)
  const [fullStudyPodOpen, setFullStudyPodOpen] = useState(false)
  const [aiBotDrawerOpen, setAiBotDrawerOpen] = useState(false)

  // 1. Focus Timer State
  const [timerSeconds, setTimerSeconds] = useState(13 * 60 + 41)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerPhase, setTimerPhase] = useState<'Pomodoro' | 'Deadman'>('Pomodoro')

  // Timer Tick
  useEffect(() => {
    let interval: any = null
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((sec) => (sec > 0 ? sec - 1 : 0))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning])

  // 2. Music State
  const [isPlayingMusic, setIsPlayingMusic] = useState(false)
  const [musicTrack, setMusicTrack] = useState('The Visit — Agar Agar')
  const [trackProgress, setTrackProgress] = useState(147) // seconds (2:27)

  // 3. Quick Note State
  const [noteContent, setNoteContent] = useState('Leave a little room for the unexpected.')

  // 4. Sprint State
  const [sprintStep, setSprintStep] = useState(1) // 0: Start, 1: Draft, 2: Review, 3: Ship

  // 5. Activity Chart Hover State
  const [selectedDay, setSelectedDay] = useState<number>(4) // Friday

  // Filtered widgets
  const visibleWidgets = WIDGET_DEFS.filter(
    (w) => selectedMode === 'All Widgets' || w.mode === selectedMode
  )

  // Handle keyboard navigation in Blueprint mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!blueprintActive) return
      if (e.key === 'ArrowLeft') {
        setInspectedIndex((idx) => (idx > 0 ? idx - 1 : visibleWidgets.length - 1))
      } else if (e.key === 'ArrowRight') {
        setInspectedIndex((idx) => (idx < visibleWidgets.length - 1 ? idx + 1 : 0))
      } else if (e.key === 'Escape') {
        setBlueprintActive(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [blueprintActive, visibleWidgets.length])

  // Format MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const inspectedWidget = visibleWidgets[inspectedIndex] || visibleWidgets[0]

  return (
    <div
      className={`min-h-[calc(100vh-48px)] transition-colors duration-500 font-sans select-none relative ${
        canvasTheme === 'obsidian'
          ? 'bg-[#070709] text-white'
          : 'bg-[#F8F9FA] text-[#0F172A]'
      }`}
    >
      {/* ── Toast Notification ── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-16 right-6 z-50 rounded-xl border border-orange-500/30 bg-orange-500/20 px-4 py-2.5 text-xs font-semibold text-orange-200 shadow-2xl backdrop-blur-md flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4 text-orange-400" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Workplace Top Control Bar ── */}
      <div
        className={`sticky top-0 z-30 flex flex-wrap items-center justify-between border-b px-6 py-3 backdrop-blur-xl transition-colors duration-500 ${
          canvasTheme === 'obsidian'
            ? 'border-white/[0.08] bg-[#070709]/80'
            : 'border-black/[0.08] bg-[#F8F9FA]/80'
        }`}
      >
        {/* Session Mode Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
          {SESSION_MODES.map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setSelectedMode(mode)
                setInspectedIndex(0)
              }}
              className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-all ${
                selectedMode === mode
                  ? canvasTheme === 'obsidian'
                    ? 'bg-white text-black font-semibold shadow-md'
                    : 'bg-[#0F172A] text-white font-semibold shadow-md'
                  : canvasTheme === 'obsidian'
                  ? 'border border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:text-white'
                  : 'border border-black/10 bg-black/[0.03] text-zinc-600 hover:border-black/20 hover:text-black'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Blueprint & Theme Controls */}
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <button
            onClick={() => setBlueprintActive(!blueprintActive)}
            className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition ${
              blueprintActive
                ? 'border-sky-500 bg-sky-500/20 text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                : canvasTheme === 'obsidian'
                ? 'border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.08]'
                : 'border-black/10 bg-black/[0.03] text-zinc-700 hover:bg-black/[0.08]'
            }`}
          >
            <Compass className="h-3.5 w-3.5 text-sky-400" />
            <span>{blueprintActive ? 'Exit Blueprint' : '🔍 Inspect / Blueprint Mode'}</span>
          </button>

          <button
            onClick={() => setCanvasTheme(canvasTheme === 'obsidian' ? 'daylight' : 'obsidian')}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
              canvasTheme === 'obsidian'
                ? 'border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.08]'
                : 'border-black/10 bg-black/[0.03] text-zinc-700 hover:bg-black/[0.08]'
            }`}
            title="Toggle Canvas Theme (Obsidian / Daylight Studio)"
          >
            {canvasTheme === 'obsidian' ? (
              <>
                <Sun className="h-3.5 w-3.5 text-amber-400" />
                <span>Daylight</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-indigo-400" />
                <span>Obsidian</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── MAIN BENTO GRID VIEW OR BLUEPRINT INSPECTOR ── */}
      {!blueprintActive ? (
        <div className="max-w-[1220px] mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-7 gap-y-9">
          {visibleWidgets.map((widget, index) => (
            <div key={widget.id} className="flex flex-col">
              {/* Header Label Floating Above Card */}
              <div
                className={`text-[12px] font-medium mb-2.5 px-1 flex items-center justify-between ${
                  canvasTheme === 'obsidian' ? 'text-zinc-400' : 'text-zinc-500'
                }`}
              >
                <span>{widget.label}</span>
                <button
                  onClick={() => {
                    setInspectedIndex(index)
                    setBlueprintActive(true)
                  }}
                  className="opacity-0 hover:opacity-100 transition text-[11px] font-mono text-sky-400 hover:underline"
                >
                  [ Inspect ]
                </button>
              </div>

              {/* Card Container */}
              <div
                className={`rounded-[24px] border shadow-xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden ${
                  canvasTheme === 'obsidian'
                    ? 'border-white/[0.08] bg-[#111115]'
                    : 'border-black/[0.08] bg-white'
                }`}
                style={{ minHeight: `${widget.height}px` }}
              >
                {renderWidgetContent(
                  widget.id,
                  canvasTheme,
                  {
                    timerSeconds,
                    isTimerRunning,
                    setIsTimerRunning,
                    setTimerSeconds,
                    timerPhase,
                    setTimerPhase,
                    isPlayingMusic,
                    setIsPlayingMusic,
                    musicTrack,
                    setMusicTrack,
                    trackProgress,
                    setTrackProgress,
                    noteContent,
                    setNoteContent,
                    sprintStep,
                    setSprintStep,
                    selectedDay,
                    setSelectedDay,
                    saveToVault,
                    setFullDevRigOpen,
                    setFullStudyPodOpen,
                    formatTime,
                  }
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── SINGLE-CARD FOCUS ISOLATION & BLUEPRINT MEASUREMENT GRID MODE ── */
        <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center px-6 py-10 relative">
          {/* Blueprint Navigation Bar */}
          <div className="mb-6 flex items-center gap-4">
            <button
              onClick={() =>
                setInspectedIndex((idx) => (idx > 0 ? idx - 1 : visibleWidgets.length - 1))
              }
              className={`flex items-center gap-1 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                canvasTheme === 'obsidian'
                  ? 'border-white/10 bg-white/[0.05] text-white hover:bg-white/10'
                  : 'border-black/10 bg-black/[0.05] text-black hover:bg-black/10'
              }`}
            >
              <ChevronLeft className="h-4 w-4" /> Prev Widget
            </button>

            <span className="text-xs font-mono font-bold uppercase tracking-widest text-sky-400">
              Widget {inspectedIndex + 1} of {visibleWidgets.length} — {inspectedWidget?.label}
            </span>

            <button
              onClick={() =>
                setInspectedIndex((idx) => (idx < visibleWidgets.length - 1 ? idx + 1 : 0))
              }
              className={`flex items-center gap-1 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                canvasTheme === 'obsidian'
                  ? 'border-white/10 bg-white/[0.05] text-white hover:bg-white/10'
                  : 'border-black/10 bg-black/[0.05] text-black hover:bg-black/10'
              }`}
            >
              Next Widget <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Blueprint Dual Panel Container */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full max-w-5xl">
            {/* Live Interactive Card */}
            <div className="w-full max-w-md">
              <div
                className={`text-[12px] font-medium mb-2.5 px-1 flex items-center justify-between ${
                  canvasTheme === 'obsidian' ? 'text-zinc-400' : 'text-zinc-500'
                }`}
              >
                <span>{inspectedWidget.label} (Live Interactive)</span>
                <span className="font-mono text-xs text-sky-400">ISOLATED VIEW</span>
              </div>

              <motion.div
                key={inspectedWidget.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                className={`rounded-[24px] border shadow-2xl overflow-hidden transition-all duration-500 ${
                  canvasTheme === 'obsidian'
                    ? 'border-white/[0.12] bg-[#111115]'
                    : 'border-black/[0.12] bg-white'
                }`}
                style={{ minHeight: `${inspectedWidget.height}px` }}
              >
                {renderWidgetContent(
                  inspectedWidget.id,
                  canvasTheme,
                  {
                    timerSeconds,
                    isTimerRunning,
                    setIsTimerRunning,
                    setTimerSeconds,
                    timerPhase,
                    setTimerPhase,
                    isPlayingMusic,
                    setIsPlayingMusic,
                    musicTrack,
                    setMusicTrack,
                    trackProgress,
                    setTrackProgress,
                    noteContent,
                    setNoteContent,
                    sprintStep,
                    setSprintStep,
                    selectedDay,
                    setSelectedDay,
                    saveToVault,
                    setFullDevRigOpen,
                    setFullStudyPodOpen,
                    formatTime,
                  }
                )}
              </motion.div>
            </div>

            {/* Pink & Blue Millimeter Graph-Paper Blueprint Box */}
            <div className="w-full max-w-md flex flex-col">
              <div className="text-[12px] font-mono font-medium mb-2.5 px-1 text-pink-400 flex items-center justify-between">
                <span>GRAPH-PAPER BLUEPRINT SPEC</span>
                <span>MEASUREMENT GRID</span>
              </div>

              <motion.div
                key={`blueprint-${inspectedWidget.id}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                className="relative rounded-[24px] border-2 border-dashed border-pink-500/50 bg-[#090b14] p-6 shadow-2xl flex flex-col justify-between overflow-hidden"
                style={{
                  minHeight: `${inspectedWidget.height}px`,
                  backgroundImage: `
                    linear-gradient(to right, rgba(236, 72, 153, 0.15) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(56, 189, 248, 0.15) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px',
                }}
              >
                {/* Blueprint Dimension Lines & Readouts */}
                <div className="flex items-center justify-between text-xs font-mono text-pink-300">
                  <span className="rounded bg-pink-500/20 px-2 py-0.5 border border-pink-500/40">
                    TOP SPEC: 100% W
                  </span>
                  <span className="rounded bg-sky-500/20 px-2 py-0.5 border border-sky-500/40 text-sky-300">
                    BLUEPRINT GRID
                  </span>
                </div>

                <div className="my-auto text-center space-y-2 font-mono">
                  <div className="inline-block rounded-xl border border-pink-500/40 bg-pink-950/80 px-4 py-2 shadow-xl">
                    <p className="text-xl font-bold text-pink-400">
                      HEIGHT: {inspectedWidget.height} PX
                    </p>
                    <p className="text-xs text-sky-300 mt-0.5">RADIUS: 24 PX</p>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Padded: 24px inner layout · Border: 1px crisp rim
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-sky-300">
                  <span className="rounded bg-sky-500/20 px-2 py-0.5 border border-sky-500/40">
                    CARD ID: {inspectedWidget.id}
                  </span>
                  <span className="rounded bg-pink-500/20 px-2 py-0.5 border border-pink-500/40 text-pink-300">
                    BOTTOM SPEC: 24PX R
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      )}

      {/* ── EXPANDABLE FULL DEV RIG OVERLAY ── */}
      <AnimatePresence>
        {fullDevRigOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-2xl p-6"
          >
            <div className="w-full max-w-6xl h-[85vh] rounded-3xl border border-white/20 bg-[#0c0d12] text-white flex flex-col overflow-hidden shadow-2xl">
              {/* Dev Rig Top Header */}
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-black/40">
                <div className="flex items-center gap-3">
                  <Code className="h-5 w-5 text-sky-400" />
                  <h2 className="text-lg font-bold">Code & Shader Lab — Full Dev Rig</h2>
                  <span className="rounded-full bg-sky-500/20 px-2.5 py-0.5 text-xs font-mono text-sky-300">
                    Multi-tab VS Code + Brave Preview
                  </span>
                </div>
                <button
                  onClick={() => setFullDevRigOpen(false)}
                  className="rounded-lg border border-white/10 bg-white/5 p-2 hover:bg-white/10 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Dev Rig Main Content Grid */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-6 overflow-hidden">
                {/* Left: VS Code IDE Editor */}
                <div className="rounded-2xl border border-white/10 bg-[#050508] p-4 flex flex-col font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-white/10 px-2 py-1 text-sky-300 font-semibold">
                        main.ts
                      </span>
                      <span className="text-zinc-600">shader.glsl</span>
                      <span className="text-zinc-600">app.tsx</span>
                    </div>
                    <button
                      onClick={() =>
                        saveToVault({
                          title: 'Code & Shader Module (main.ts)',
                          category: 'Code & Dev',
                          snippet: 'export function renderFluidShader() { ... }',
                        })
                      }
                      className="flex items-center gap-1 rounded bg-orange-500/20 px-2.5 py-1 text-orange-300 hover:bg-orange-500/30 transition text-[11px]"
                    >
                      <Bookmark className="h-3 w-3" /> Save to Vault
                    </button>
                  </div>
                  <textarea
                    defaultValue={`// Campfire Fluid Shader & React 19 State Engine
import { createStore } from 'zustand'

export function renderFluidShader(gl: WebGLRenderingContext) {
  const vertexShader = gl.createShader(gl.VERTEX_SHADER)
  // Prismatic chromatic aberration & spring momentum
  return { status: "compiled", fps: 60 }
}`}
                    className="flex-1 w-full bg-transparent text-emerald-400 focus:outline-none resize-none font-mono text-xs leading-relaxed"
                  />
                  <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-2">
                    <span className="text-zinc-500">TypeScript · UTF-8 · 60 FPS</span>
                    <button className="rounded bg-emerald-500 px-4 py-1.5 font-bold text-black hover:bg-emerald-400 transition">
                      ▶ Run Code
                    </button>
                  </div>
                </div>

                {/* Right: Integrated Browser (Brave) & App Testing */}
                <div className="flex flex-col gap-4">
                  <div className="flex-1 rounded-2xl border border-white/10 bg-[#111115] p-4 flex flex-col">
                    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-zinc-400 mb-3">
                      <span className="text-emerald-400">🔒 https://localhost:3000/preview</span>
                    </div>
                    <div className="flex-1 rounded-xl border border-dashed border-white/10 bg-black/60 p-6 flex flex-col items-center justify-center text-center">
                      <Sparkles className="h-8 w-8 text-sky-400 mb-2" />
                      <p className="text-sm font-semibold text-white">Live App Canvas Preview</p>
                      <p className="text-xs text-zinc-500 mt-1">
                        Hot reloading enabled. All state changes sync instantly.
                      </p>
                    </div>
                  </div>

                  {/* Command Terminal */}
                  <div className="h-28 rounded-2xl border border-white/10 bg-black p-3 font-mono text-xs text-zinc-400 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[11px] text-zinc-600 border-b border-white/10 pb-1">
                      <span>TERMINAL & AI UX COMMAND</span>
                      <span className="text-sky-400">UI Design Canvas: ON</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400 mt-1">
                      <span>&gt;</span>
                      <input
                        type="text"
                        placeholder="Connect to any AI model / type UX command..."
                        className="flex-1 bg-transparent text-white focus:outline-none text-xs placeholder-zinc-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── EXPANDABLE FULL STUDY POD OVERLAY ── */}
      <AnimatePresence>
        {fullStudyPodOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-2xl p-6"
          >
            <div className="w-full max-w-6xl h-[85vh] rounded-3xl border border-white/20 bg-[#0c0d12] text-white flex flex-col overflow-hidden shadow-2xl">
              {/* Study Pod Top Header */}
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-black/40">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-orange-400" />
                  <h2 className="text-lg font-bold">Study Group Rig — Solvely AI & Doubt Tutor</h2>
                  <span className="rounded-full bg-orange-500/20 px-2.5 py-0.5 text-xs font-mono text-orange-300">
                    Shared Grid Whiteboard + Solvely Solver
                  </span>
                </div>
                <button
                  onClick={() => setFullStudyPodOpen(false)}
                  className="rounded-lg border border-white/10 bg-white/5 p-2 hover:bg-white/10 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Study Pod Content */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-6 overflow-hidden">
                {/* Center/Left: Interactive Whiteboard */}
                <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#07080c] p-4 flex flex-col justify-between relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-mono text-zinc-400">SHARED GRID WHITEBOARD</span>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="rounded bg-orange-500/20 px-2.5 py-1 text-orange-300 font-semibold">
                        ⏱ Pomodoro: 25:00
                      </span>
                      <span className="rounded bg-white/10 px-2.5 py-1 text-zinc-300">
                        📺 Screen Share: ON
                      </span>
                    </div>
                  </div>

                  <div className="my-auto text-center space-y-3">
                    <p className="text-lg font-mono text-amber-300">
                      SN1 vs SN2 Reaction Mechanisms & Carbocation Stability
                    </p>
                    <div className="inline-block rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs font-mono text-zinc-300 text-left space-y-1">
                      <p>1. SN1: 2-Step mechanism, Tertiary &gt; Secondary carbocation</p>
                      <p>2. SN2: 1-Step backside attack, Primary &gt; Secondary substrate</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 pt-3">
                    <button
                      onClick={() =>
                        saveToVault({
                          title: 'Organic Chemistry SN1/SN2 Mindmap',
                          category: 'Study Notes',
                          snippet: '1. SN1: 2-Step mechanism ... 2. SN2: 1-Step backside attack ...',
                        })
                      }
                      className="flex items-center gap-1.5 rounded-xl border border-orange-500/30 bg-orange-500/20 px-4 py-2 text-xs font-semibold text-orange-200 hover:bg-orange-500/30 transition"
                    >
                      <Sparkles className="h-4 w-4 text-orange-400" />
                      🧠 1-Click AI Mindmap &amp; Export to Vault
                    </button>
                  </div>
                </div>

                {/* Right Stack: Solvely Step-by-Step Solver */}
                <div className="rounded-2xl border border-white/10 bg-[#111115] p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                      <span className="text-xs font-semibold text-white">Solvely AI Solver</span>
                      <span className="text-[10px] font-mono text-emerald-400">Step-by-step</span>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-xs space-y-2">
                      <p className="font-semibold text-amber-300">Question:</p>
                      <p className="text-zinc-300">
                        Find max sum sliding window of size k in O(n) time.
                      </p>
                      <p className="font-semibold text-emerald-400 pt-2 border-t border-white/10">
                        Solvely Step 1:
                      </p>
                      <p className="text-zinc-400">
                        Maintain a monotonic decreasing deque storing indices.
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10">
                    <input
                      type="text"
                      placeholder="Ask Socratic Doubt Tutor..."
                      className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── GLOBAL PERSISTENT AI BOT FLOATING BUTTON & DRAWER ── */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setAiBotDrawerOpen(!aiBotDrawerOpen)}
          className="flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-600/90 px-4 py-2.5 text-xs font-semibold text-white shadow-2xl backdrop-blur-md transition hover:bg-violet-500 active:scale-95"
        >
          <Bot className="h-4 w-4" />
          <span>🤖 AI Bot</span>
        </button>

        <AnimatePresence>
          {aiBotDrawerOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute bottom-14 right-0 w-80 rounded-2xl border border-violet-500/30 bg-[#0c0d14] p-4 shadow-2xl backdrop-blur-2xl text-white space-y-3"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
                  <Bot className="h-4 w-4 text-violet-400" />
                  Campfire AI Assistant
                </span>
                <button
                  onClick={() => setAiBotDrawerOpen(false)}
                  className="text-zinc-500 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-zinc-300 leading-relaxed">
                👋 Reading workplace context: <strong>{selectedMode}</strong> mode active. Ask me to draft notes, compile code, or solve doubts!
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="Ask AI bot anything..."
                  className="flex-1 rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none"
                />
                <button className="rounded-xl bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-500 transition">
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── RENDERER FOR THE 12 WORKPLACE WIDGETS ──
function renderWidgetContent(
  id: string,
  theme: 'obsidian' | 'daylight',
  props: any
) {
  const isDark = theme === 'obsidian'
  const textMuted = isDark ? 'text-zinc-400' : 'text-zinc-600'

  switch (id) {
    // 1. Focus Timer
    case 'focus-timer':
      return (
        <div className="h-full bg-gradient-to-br from-[#111827] via-[#0F172A] to-[#090D16] text-white p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-zinc-400 uppercase tracking-wider">Focus</span>
            <button
              onClick={() =>
                props.setTimerPhase(props.timerPhase === 'Pomodoro' ? 'Deadman' : 'Pomodoro')
              }
              className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] text-amber-300 border border-amber-500/30"
            >
              {props.timerPhase} Mode
            </button>
          </div>

          {/* SVG Dial with 60 ticks */}
          <div className="relative mx-auto h-32 w-32 flex items-center justify-center my-2">
            <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
              {Array.from({ length: 60 }).map((_, i) => {
                const angle = (i * 6) * (Math.PI / 180)
                const x1 = 50 + 40 * Math.cos(angle)
                const y1 = 50 + 40 * Math.sin(angle)
                const x2 = 50 + 45 * Math.cos(angle)
                const y2 = 50 + 45 * Math.sin(angle)
                const active = i < Math.floor((props.timerSeconds / 1500) * 60)
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={active ? '#38BDF8' : '#334155'}
                    strokeWidth="1.5"
                  />
                )
              })}
            </svg>
            <span className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
              {props.formatTime(props.timerSeconds)}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2 pt-1 border-t border-white/10">
            <button
              onClick={() => props.setTimerSeconds(1500)}
              className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-300 hover:bg-white/10"
              title="Reset Timer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => props.setIsTimerRunning(!props.isTimerRunning)}
              className="rounded-full bg-sky-500 px-4 py-1.5 text-xs font-bold text-black hover:bg-sky-400 transition"
            >
              {props.isTimerRunning ? '⏸ Pause' : '▶ Resume'}
            </button>

            <button
              onClick={() => props.setTimerSeconds((s: number) => s + 300)}
              className="rounded-full border border-amber-500/40 bg-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/30"
            >
              +5m Stoke
            </button>
          </div>
        </div>
      )

    // 2. Inbox Multi-Agent Feed
    case 'inbox-agents':
      return (
        <div className="h-full p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">Inbox</span>
                <span className="rounded-full bg-orange-500/20 border border-orange-500/40 px-2 py-0.5 text-[10px] font-bold text-orange-300">
                  3 unread
                </span>
              </div>
              <input
                type="text"
                placeholder="Search agents..."
                className="w-28 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[11px] focus:outline-none placeholder-zinc-500"
              />
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5 hover:bg-white/[0.05] transition cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    🟢 Research agent
                  </span>
                  <span className="text-[10px] text-zinc-500">2:40 PM</span>
                </div>
                <p className="mt-1 text-zinc-400 line-clamp-2">
                  Three key topic summaries and sources ready to explore.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5 hover:bg-white/[0.05] transition cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-amber-400 flex items-center gap-1">
                    🟡 Motion & UI agent
                  </span>
                  <span className="text-[10px] text-zinc-500">2:32 PM</span>
                </div>
                <p className="mt-1 text-zinc-400 line-clamp-2">
                  Custom curves and glass layout specs synced.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5 hover:bg-white/[0.05] transition cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sky-400 flex items-center gap-1">
                    🔵 Solvely & Code agent
                  </span>
                  <span className="text-[10px] text-zinc-500">2:18 PM</span>
                </div>
                <p className="mt-1 text-zinc-400 line-clamp-2">
                  Compiler check passed and doubt solution saved.
                </p>
              </div>
            </div>
          </div>

          <button className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10 transition mt-2">
            + Deploy Agent
          </button>
        </div>
      )

    // 3. Quick Note Scratchpad
    case 'quick-note':
      return (
        <div className="h-full p-5 flex flex-col justify-between">
          <textarea
            value={props.noteContent}
            onChange={(e) => props.setNoteContent(e.target.value)}
            className={`w-full h-24 bg-transparent font-serif italic text-base focus:outline-none resize-none ${
              isDark ? 'text-zinc-200' : 'text-zinc-800'
            }`}
          />

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
            <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300">
              Draft · This session
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() =>
                  props.saveToVault({
                    title: 'Quick Scratchpad Note',
                    category: 'Study Notes',
                    snippet: props.noteContent,
                  })
                }
                className="rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-medium text-zinc-300 hover:bg-white/10 transition"
              >
                📌 Save to Vault
              </button>
              <button
                onClick={() =>
                  props.saveToVault({
                    title: 'AI Generated Mindmap from Scratchpad',
                    category: 'Study Notes',
                    snippet: `Mindmap Nodes: ${props.noteContent}`,
                  })
                }
                className="rounded-lg border border-orange-500/30 bg-orange-500/20 px-2.5 py-1 text-[11px] font-semibold text-orange-200 hover:bg-orange-500/30 transition"
              >
                🧠 Mindmap
              </button>
            </div>
          </div>
        </div>
      )

    // 4. Music Track Deck
    case 'music-deck':
      return (
        <div className="h-full p-5 flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-orange-500 to-indigo-600 flex items-center justify-center font-bold text-white text-lg shadow-md shrink-0">
              🎵
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold truncate">{props.musicTrack}</p>
              <p className="text-xs text-zinc-500">Campfire Focus Deck</p>
            </div>
          </div>

          <div className="space-y-1">
            <input
              type="range"
              min="0"
              max="272"
              value={props.trackProgress}
              onChange={(e) => props.setTrackProgress(Number(e.target.value))}
              className="w-full accent-orange-500 cursor-pointer h-1"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-500">
              <span>{props.formatTime(props.trackProgress)}</span>
              <span>-1:45</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => props.setIsPlayingMusic(!props.isPlayingMusic)}
                className="rounded-full bg-white px-3 py-1 text-xs font-bold text-black hover:bg-zinc-200"
              >
                {props.isPlayingMusic ? '⏸ Pause' : '▶ Play'}
              </button>
              <button
                onClick={() =>
                  props.setMusicTrack(
                    props.musicTrack.includes('Agar Agar')
                      ? 'Campfire Crackle & Brown Noise'
                      : 'The Visit — Agar Agar'
                  )
                }
                className="text-xs text-zinc-400 hover:text-white"
              >
                ⏭ Next
              </button>
            </div>
          </div>
        </div>
      )

    // 5. Session Sprint Tracker
    case 'session-sprint':
      return (
        <div className="h-full p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400">SESSION SPRINT</span>
            <span className="text-[11px] font-mono text-emerald-400">09:40 ──✈── 18:05</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span>DRAFT (Start)</span>
              <span className="text-orange-400">──✈──</span>
              <span>SHIP (Goal)</span>
            </div>

            {/* Progress Bar */}
            <div className="relative h-3 w-full rounded-full bg-black/40 overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                style={{ width: `${(props.sprintStep / 3) * 100}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => props.setSprintStep((s: number) => (s < 3 ? s + 1 : 0))}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-1.5 text-xs font-semibold text-zinc-300 hover:bg-white/10 transition"
          >
            Advance Milestone ({props.sprintStep}/3 Complete)
          </button>
        </div>
      )

    // 6. Mood board
    case 'mood-board':
      return (
        <div className="h-full p-5 flex flex-col justify-between">
          <div className="grid grid-cols-2 gap-2">
            <div className="h-24 rounded-xl bg-gradient-to-tr from-indigo-900 to-slate-800 border border-white/10 flex items-center justify-center text-xs font-mono text-zinc-400">
              [ UI Glass ]
            </div>
            <div className="h-24 rounded-xl bg-gradient-to-tr from-orange-950 to-amber-900 border border-white/10 flex items-center justify-center text-xs font-mono text-zinc-400">
              [ 3D Flame ]
            </div>
            <div className="h-24 rounded-xl bg-gradient-to-tr from-emerald-950 to-teal-900 border border-white/10 flex items-center justify-center text-xs font-mono text-zinc-400">
              [ Code IDE ]
            </div>
            <div className="h-24 rounded-xl bg-gradient-to-tr from-purple-950 to-pink-950 border border-white/10 flex items-center justify-center text-xs font-mono text-zinc-400">
              [ Shader Mesh ]
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
            <span className="text-zinc-500">4 references pinned</span>
            <button
              onClick={() =>
                props.saveToVault({
                  title: 'Visual Moodboard Collection',
                  category: 'Design Assets',
                  snippet: '4 references pinned (UI Glass, 3D Flame, Code IDE, Shader Mesh)',
                })
              }
              className="text-orange-400 hover:underline font-medium"
            >
              + Add / Save to Vault
            </button>
          </div>
        </div>
      )

    // 7. Up Next Squad Sync
    case 'up-next':
      return (
        <div className="h-full p-5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-orange-400">
              Upcoming Lock-in
            </span>
            <h3 className="mt-1 text-base font-bold">7:30 PM — System Design Sprint</h3>
            <p className="text-xs text-zinc-500 mt-0.5">2 hours · with Hanna &amp; Squad</p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <div className="flex -space-x-2">
              <div className="h-7 w-7 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center text-[10px] font-bold">
                H
              </div>
              <div className="h-7 w-7 rounded-full bg-sky-500 border-2 border-black flex items-center justify-center text-[10px] font-bold">
                K
              </div>
              <div className="h-7 w-7 rounded-full bg-purple-500 border-2 border-black flex items-center justify-center text-[10px] font-bold">
                R
              </div>
            </div>

            <button className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold hover:bg-white/10 transition">
              ↗ Join / Share Screen
            </button>
          </div>
        </div>
      )

    // 8. Live Stage Video Review
    case 'live-stage':
      return (
        <div className="h-full p-4 flex flex-col justify-between relative bg-black/60 rounded-[20px] border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between z-10">
            <span className="rounded-full bg-red-500/20 border border-red-500/40 px-2.5 py-0.5 text-[10px] font-bold text-red-300">
              🔴 LIVE STAGE
            </span>
            <div className="flex items-center gap-2">
              <button className="rounded-lg bg-black/60 p-1.5 text-zinc-300 hover:text-white">
                <VolumeX className="h-3.5 w-3.5" />
              </button>
              <button className="rounded-lg bg-black/60 p-1.5 text-zinc-300 hover:text-white">
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="my-auto text-center z-10 space-y-1">
            <p className="text-sm font-bold text-white">Nike Running VFX Cut Review</p>
            <p className="text-xs font-mono text-zinc-400">00:42 / 02:15 · Timestamp Pinned</p>
          </div>

          <div className="z-10 pt-2 border-t border-white/10 flex justify-between text-xs text-zinc-400">
            <span>Screen Share: Kai</span>
            <span>1080p 60FPS</span>
          </div>
        </div>
      )

    // 9. Activity Chart
    case 'activity-chart':
      return (
        <div className="h-full p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold tracking-tight">3.1 hrs</p>
              <p className="text-[11px] text-zinc-500">14 problems solved today</p>
            </div>
            <span className="text-xs font-mono text-emerald-400">+18% vs last week</span>
          </div>

          {/* 7-Day Vertical Bar Chart */}
          <div className="flex items-end justify-between gap-1.5 h-20 pt-2">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
              const heights = [40, 65, 30, 85, 95, 50, 70]
              const isSelected = props.selectedDay === i
              return (
                <button
                  key={i}
                  onClick={() => props.setSelectedDay(i)}
                  className="flex-1 flex flex-col items-center gap-1 group"
                >
                  <div className="w-full bg-black/30 rounded-t-lg h-16 flex items-end overflow-hidden p-0.5">
                    <div
                      className={`w-full rounded-t transition-all ${
                        isSelected ? 'bg-[#0095FF] shadow-[0_0_10px_#0095FF]' : 'bg-white/20 group-hover:bg-white/40'
                      }`}
                      style={{ height: `${heights[i]}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-mono ${isSelected ? 'text-[#0095FF] font-bold' : 'text-zinc-500'}`}>
                    {day}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )

    // 10. Code & Shader Lab Compact View
    case 'code-rig':
      return (
        <div className="h-full p-5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-mono text-sky-400">Shader Experiments</span>
              <span className="text-[10px] font-mono text-zinc-500">3 studies active</span>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/50 p-3 font-mono text-xs space-y-1">
              <p className="text-emerald-400">// Shader preview</p>
              <p className="text-zinc-300">gl_FragColor = vec4(col, 1.0);</p>
            </div>
          </div>

          <button
            onClick={() => props.setFullDevRigOpen(true)}
            className="w-full rounded-xl border border-sky-500/40 bg-sky-500/20 py-2 text-xs font-semibold text-sky-300 hover:bg-sky-500/30 transition shadow-lg"
          >
            Expand Full Dev Rig ⛶
          </button>
        </div>
      )

    // 11. Study Group Rig Compact View
    case 'study-pod':
      return (
        <div className="h-full p-5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-semibold text-orange-400">Common Whiteboard</span>
              <span className="text-[10px] font-mono text-zinc-500">Solvely AI Active</span>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/50 p-3 text-xs space-y-1">
              <p className="font-semibold text-amber-300">SN1/SN2 Notes &amp; Mindmap</p>
              <p className="text-zinc-400">Socratic doubt tutor ready to solve step-by-step.</p>
            </div>
          </div>

          <button
            onClick={() => props.setFullStudyPodOpen(true)}
            className="w-full rounded-xl border border-orange-500/40 bg-orange-500/20 py-2 text-xs font-semibold text-orange-300 hover:bg-orange-500/30 transition shadow-lg"
          >
            Expand Study Pod ⛶
          </button>
        </div>
      )

    // 12. Environment & Radar Weather Card
    case 'radar-weather':
      return (
        <div className="h-full p-5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400">
              Campfire Radar
            </span>
            <h3 className="mt-1 text-base font-bold">Bodega Bay, CA</h3>
            <p className="text-xs text-zinc-500">58° Clear · Fog rolling in</p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs font-mono text-zinc-400">
            <span>Squad Ambient: 4 co-working</span>
            <span className="text-emerald-400">Synced</span>
          </div>
        </div>
      )

    default:
      return null
  }
}