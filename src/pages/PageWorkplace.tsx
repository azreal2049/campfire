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
import type { CampfireSessionType } from '../bridge/rustBridge'
import { SoundscapeControls } from '../components/SoundscapeControls'

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

const MODE_TO_SESSION: Partial<Record<SessionMode, CampfireSessionType>> = {
  'I. Study Group': 'study-group',
  'II. Coders x Devs': 'coders-developers',
  'III. Fun with Friends': 'fun-friends',
  'IV. Musicians': 'musicians',
  'V. Content Creators': 'content-creators',
  'VI. Editors x VFX': 'editors-vfx',
  'VII. Official Works': 'official-works',
  'VIII. Silent Co-working': 'silent-coworking',
}

const SESSION_TO_MODE: Record<CampfireSessionType, SessionMode> = {
  'study-group': 'I. Study Group',
  'coders-developers': 'II. Coders x Devs',
  'fun-friends': 'III. Fun with Friends',
  musicians: 'IV. Musicians',
  'content-creators': 'V. Content Creators',
  'editors-vfx': 'VI. Editors x VFX',
  'official-works': 'VII. Official Works',
  'silent-coworking': 'VIII. Silent Co-working',
}

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
  const activeSessionType = useCampfireStore((state) => state.activeSessionType)
  const setSessionType = useCampfireStore((state) => state.setSessionType)
  const burnTimer = useCampfireStore((state) => state.burnTimer)
  const setBurnMode = useCampfireStore((state) => state.setBurnMode)
  const setPomodoroCycle = useCampfireStore((state) => state.setPomodoroCycle)
  const setBurnTimerRunning = useCampfireStore((state) => state.setBurnTimerRunning)
  const setBurnTimerSeconds = useCampfireStore((state) => state.setBurnTimerSeconds)
  const stokeFuel = useCampfireStore((state) => state.stokeFuel)
  const ideCode = useCampfireStore((state) => state.ideCode)
  const ideFileName = useCampfireStore((state) => state.ideFileName)
  const updateIdeCode = useCampfireStore((state) => state.updateIdeCode)
  const noteContent = useCampfireStore((state) => state.noteContent)
  const updateNoteContent = useCampfireStore((state) => state.setNoteContent)
  const agentTasks = useCampfireStore((state) => state.agentTasks)
  const dispatchAgent = useCampfireStore((state) => state.dispatchAgent)
  const markAgentRead = useCampfireStore((state) => state.markAgentRead)
  const saveAgentOutput = useCampfireStore((state) => state.saveAgentOutput)
  const pendingWorkplaceTool = useCampfireStore((state) => state.pendingWorkplaceTool)
  const setPendingWorkplaceTool = useCampfireStore((state) => state.setPendingWorkplaceTool)
  const snapshots = useCampfireStore((state) => state.workspaceSnapshots)
  const saveWorkspaceSnapshot = useCampfireStore((state) => state.saveWorkspaceSnapshot)
  const restoreWorkspaceSnapshot = useCampfireStore((state) => state.restoreWorkspaceSnapshot)
  const endAndArchiveSession = useCampfireStore((state) => state.endAndArchiveSession)
  const blueprintActive = useCampfireStore((state) => state.blueprintMode)
  const setBlueprintMode = useCampfireStore((state) => state.setBlueprintMode)
  const whiteboardText = useCampfireStore((state) => state.whiteboardText)
  const setWhiteboardText = useCampfireStore((state) => state.setWhiteboardText)
  const solveDoubt = useCampfireStore((state) => state.solveDoubt)
  const setAssistantOpen = useCampfireStore((state) => state.setAssistantOpen)
  const activePage = useCampfireStore((state) => state.activePage)
  const stokePulse = useCampfireStore((state) => state.stokePulse)

  // ── States ──
  const [canvasTheme, setCanvasTheme] = useState<'obsidian' | 'daylight'>('obsidian')
  const [selectedMode, setSelectedMode] = useState<SessionMode>(SESSION_TO_MODE[activeSessionType])
  const [inspectedIndex, setInspectedIndex] = useState<number>(0)
  const [fullDevRigOpen, setFullDevRigOpen] = useState(false)
  const [fullStudyPodOpen, setFullStudyPodOpen] = useState(false)

  const timerSeconds = burnTimer.secondsRemaining
  const isTimerRunning = burnTimer.running
  const setTimerSeconds = (value: number | ((seconds: number) => number)) => {
    setBurnTimerSeconds(typeof value === 'function' ? value(useCampfireStore.getState().burnTimer.secondsRemaining) : value)
  }
  const setIsTimerRunning = setBurnTimerRunning

  // 2. Quick Note State
  const setNoteContent = updateNoteContent

  // 4. Sprint State
  const [sprintStep, setSprintStep] = useState(1) // 0: Start, 1: Draft, 2: Review, 3: Ship

  // 5. Activity Chart Hover State
  const [selectedDay, setSelectedDay] = useState<number>(4) // Friday

  // Filtered widgets
  const visibleWidgets = WIDGET_DEFS.filter(
    (w) => selectedMode === 'All Widgets' || w.mode === selectedMode
  )

  useEffect(() => {
    setSelectedMode(SESSION_TO_MODE[activeSessionType])
  }, [activeSessionType])

  useEffect(() => {
    if (activePage !== 'page-workplace' || !pendingWorkplaceTool) return
    if (pendingWorkplaceTool === 'ide') setFullDevRigOpen(true)
    if (pendingWorkplaceTool === 'study') setFullStudyPodOpen(true)
    setPendingWorkplaceTool(null)
  }, [activePage, pendingWorkplaceTool, setPendingWorkplaceTool])

  // Handle keyboard navigation in Blueprint mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!blueprintActive) return
      if (e.key === 'ArrowLeft') {
        setInspectedIndex((idx) => (idx > 0 ? idx - 1 : visibleWidgets.length - 1))
      } else if (e.key === 'ArrowRight') {
        setInspectedIndex((idx) => (idx < visibleWidgets.length - 1 ? idx + 1 : 0))
      } else if (e.key === 'Escape') {
        setBlueprintMode(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [blueprintActive, setBlueprintMode, visibleWidgets.length])

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
                const sessionType = MODE_TO_SESSION[mode]
                if (sessionType) setSessionType(sessionType)
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
            onClick={() => setBlueprintMode(!blueprintActive)}
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
            type="button"
            onClick={() => saveWorkspaceSnapshot(window.prompt('Name this workspace snapshot') ?? '')}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-white/[0.08]"
          >
            🕒 Snapshots · Save
          </button>
          {snapshots.length > 0 && (
            <select
              aria-label="Restore workspace snapshot"
              defaultValue=""
              onChange={(event) => {
                if (event.target.value) restoreWorkspaceSnapshot(event.target.value)
                event.target.value = ''
              }}
              className="max-w-40 rounded-xl border border-white/10 bg-[#111115] px-2 py-1.5 text-[11px] text-zinc-300"
            >
              <option value="">Rewind…</option>
              {snapshots.map((snapshot) => <option key={snapshot.id} value={snapshot.id}>{snapshot.name} · {snapshot.createdAt}</option>)}
            </select>
          )}

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
                    setBlueprintMode(true)
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
                    timerMode: burnTimer.mode,
                    burnTimer,
                    timerTotalSeconds: burnTimer.mode === 'pomodoro' ? burnTimer.focusMinutes * 60 : 25 * 60,
                    setTimerMode: setBurnMode,
                    setPomodoroCycle,
                    stokeFuel,
                    stokePulse,
                    endAndArchiveSession,
                    noteContent,
                    setNoteContent,
                    sprintStep,
                    setSprintStep,
                    selectedDay,
                    setSelectedDay,
                    saveToVault,
                    ideCode,
                    ideFileName,
                    updateIdeCode,
                    agentTasks,
                    dispatchAgent,
                    markAgentRead,
                    saveAgentOutput,
                    whiteboardText,
                    setWhiteboardText,
                    solveDoubt,
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
                    timerMode: burnTimer.mode,
                    burnTimer,
                    timerTotalSeconds: burnTimer.mode === 'pomodoro' ? burnTimer.focusMinutes * 60 : 25 * 60,
                    setTimerMode: setBurnMode,
                    setPomodoroCycle,
                    stokeFuel,
                    stokePulse,
                    endAndArchiveSession,
                    noteContent,
                    setNoteContent,
                    sprintStep,
                    setSprintStep,
                    selectedDay,
                    setSelectedDay,
                    saveToVault,
                    ideCode,
                    ideFileName,
                    updateIdeCode,
                    agentTasks,
                    dispatchAgent,
                    markAgentRead,
                    saveAgentOutput,
                    whiteboardText,
                    setWhiteboardText,
                    solveDoubt,
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
                <button type="button" onClick={endAndArchiveSession} className="mr-3 border border-white/10 px-3 py-1.5 text-[11px] text-zinc-300 hover:bg-white/[0.05]">
                  File ▾ · End &amp; Archive Ash
                </button>
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
                        {ideFileName}
                      </span>
                      <span className="text-zinc-600">shader.glsl</span>
                      <span className="text-zinc-600">app.tsx</span>
                    </div>
                    <button
                      onClick={() =>
                        saveToVault({
                          title: `Code Project (${ideFileName})`,
                          category: 'Code & Dev',
                          snippet: ideCode,
                          fileName: ideFileName,
                          format: ideFileName.split('.').pop() || 'txt',
                        })
                      }
                      className="flex items-center gap-1 rounded bg-orange-500/20 px-2.5 py-1 text-orange-300 hover:bg-orange-500/30 transition text-[11px]"
                    >
                      <Bookmark className="h-3 w-3" /> Save to Vault
                    </button>
                  </div>
                  <textarea
                    value={ideCode}
                    onChange={(event) => updateIdeCode(event.target.value)}
                    className="flex-1 w-full bg-transparent text-emerald-400 focus:outline-none resize-none font-mono text-xs leading-relaxed"
                  />
                  <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-2">
                    <span className="text-zinc-500">Local editor · UTF-8 · edits persist</span>
                    <button onClick={stokeFuel} className="rounded bg-emerald-500 px-4 py-1.5 font-bold text-black hover:bg-emerald-400 transition">
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
                      <p className="text-sm font-semibold text-white">App Testing Window</p>
                      <p className="text-xs text-zinc-500 mt-1">
                          Run Code adds timer fuel. Review agent-generated assertions below.
                      </p>
                      {agentTasks.filter((task) => task.kind === 'code-audit').map((task) => (
                        <pre key={task.id} className="mt-4 max-h-40 w-full overflow-auto whitespace-pre-wrap rounded border border-white/10 bg-black/40 p-3 text-left text-[10px] text-zinc-300">{task.output || 'Audit running…'}</pre>
                      ))}
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

                  <div className="my-auto space-y-3">
                  <p className="text-center text-lg font-mono text-amber-300">Shared Study Whiteboard</p>
                  <textarea
                    value={whiteboardText}
                    onChange={(event) => setWhiteboardText(event.target.value)}
                    placeholder="Paste a question, doubt, or study note here…"
                    className="min-h-32 w-full resize-y rounded-xl border border-white/10 bg-black/40 p-4 text-xs leading-relaxed text-zinc-300 outline-none focus:border-white/20"
                  />
                  {agentTasks.filter((task) => task.kind === 'study').slice(0, 1).map((task) => (
                    <pre key={task.id} className="max-h-40 overflow-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-black/40 p-3 text-[10px] leading-relaxed text-zinc-300">{task.output || 'Generating study deck…'}</pre>
                  ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 pt-3">
                    <button
                      onClick={() =>
                        saveToVault({
                          title: 'Organic Chemistry SN1/SN2 Mindmap',
                          category: 'Study Notes',
                          snippet: whiteboardText,
                        })
                      }
                      className="flex items-center gap-1.5 rounded-xl border border-orange-500/30 bg-orange-500/20 px-4 py-2 text-xs font-semibold text-orange-200 hover:bg-orange-500/30 transition"
                    >
                      <Sparkles className="h-4 w-4 text-orange-400" />
                      🧠 1-Click AI Mindmap &amp; Export to Vault
                    </button>
                    <button
                      type="button"
                      onClick={() => void dispatchAgent('study')}
                      className="rounded-xl border border-white/10 px-3 py-2 text-[11px] text-zinc-300 hover:bg-white/[0.05]"
                    >
                      Generate flashcards
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
                      <p className="whitespace-pre-wrap text-zinc-300">{whiteboardText || 'Enter a question below to work through it step-by-step.'}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={whiteboardText}
                        onChange={(event) => setWhiteboardText(event.target.value)}
                        placeholder="Ask Socratic Doubt Tutor..."
                        className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
                      />
                      <button type="button" onClick={() => solveDoubt(whiteboardText)} className="rounded-lg bg-white px-3 py-2 text-[10px] font-semibold text-black">Solve</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── GLOBAL AI ASSISTANT ENTRY ── */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setAssistantOpen(true)}
          className="flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-600/90 px-4 py-2.5 text-xs font-semibold text-white shadow-2xl backdrop-blur-md transition hover:bg-violet-500 active:scale-95"
        >
          <Bot className="h-4 w-4" />
          <span>🤖 AI Bot</span>
        </button>
      </div>
    </div>
  )
}

function AgentInbox(props: any) {
  const unreadCount = props.agentTasks.filter((task: { read: boolean }) => !task.read).length
  const taskKinds = [
    { kind: 'study', label: '🧬 Study & Flashcards' },
    { kind: 'code-audit', label: '💻 Code Audit & Tests' },
    { kind: 'creator', label: '🎬 Creator Storyboard' },
  ]

  return (
    <div className="flex h-full flex-col p-5">
      <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">Inbox</span>
          <span className="rounded-full border border-orange-500/40 bg-orange-500/20 px-2 py-0.5 text-[10px] font-bold text-orange-300">{unreadCount} unread</span>
        </div>
        <span className="text-[10px] text-zinc-500">Local agents</span>
      </div>
      <div className="mb-3 flex flex-wrap gap-1">
        {taskKinds.map((task) => (
          <button key={task.kind} type="button" onClick={() => void props.dispatchAgent(task.kind)} className="rounded border border-white/10 px-2 py-1 text-[9px] text-zinc-300 hover:bg-white/[0.05]">
            {task.label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-auto text-xs">
        {props.agentTasks.length === 0 && <p className="rounded border border-white/[0.08] p-3 text-zinc-500">Agent results and study packs appear here.</p>}
        {props.agentTasks.slice(0, 3).map((task: { id: string; title: string; createdAt: string; status: string; output: string; read: boolean }) => (
          <article key={task.id} onClick={() => props.markAgentRead(task.id)} className={`rounded-xl border p-2.5 ${task.read ? 'border-white/[0.08] bg-white/[0.02]' : 'border-sky-500/20 bg-sky-500/[0.04]'}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-zinc-200">{task.title}</span>
              <span className="shrink-0 text-[9px] text-zinc-600">{task.status} · {task.createdAt}</span>
            </div>
            {task.output ? <pre className="mt-2 max-h-20 overflow-auto whitespace-pre-wrap text-[10px] leading-relaxed text-zinc-400">{task.output}</pre> : <p className="mt-1 text-zinc-500">Generating locally…</p>}
            {task.output && <button type="button" onClick={(event) => { event.stopPropagation(); props.saveAgentOutput(task.id) }} className="mt-2 text-[10px] text-orange-300 hover:text-orange-200">📌 Save Output to Personal Vault</button>}
          </article>
        ))}
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
  switch (id) {
    // 1. Focus Timer
    case 'focus-timer':
      return (
        <div className={`h-full bg-gradient-to-br from-[#111827] via-[#0F172A] to-[#090D16] p-6 text-white ${props.stokePulse ? 'shadow-[inset_0_0_42px_rgba(251,146,60,0.42)]' : ''} ${props.burnTimer.warning ? 'opacity-75' : ''} flex flex-col justify-between`}>
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-zinc-400 uppercase tracking-wider">{props.timerMode} · {props.burnTimer.phase}</span>
            <select
              value={props.timerMode}
              onChange={(event) => props.setTimerMode(event.target.value)}
              className="rounded-full border border-white/10 bg-[#15171c] px-2 py-1 text-[10px] text-zinc-300"
              aria-label="Burn timer mode"
            >
              <option value="pomodoro">Pomodoro 25/5</option>
              <option value="countdown">Countdown</option>
              <option value="deadman">Deadman</option>
            </select>
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
                const active = i < Math.floor((props.timerSeconds / Math.max(1, props.timerTotalSeconds)) * 60)
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={props.burnTimer.warning && active ? '#f97316' : active ? '#38BDF8' : '#334155'}
                    strokeWidth={props.stokePulse && active ? '2.5' : '1.5'}
                  />
                )
              })}
            </svg>
            <span className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
              {props.formatTime(props.timerSeconds)}
            </span>
            {props.burnTimer.warning && <span className="absolute -bottom-3 text-[9px] uppercase tracking-wider text-orange-300">Ember fading · activity to keep the timer alive</span>}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2 pt-1 border-t border-white/10">
            {props.timerMode === 'pomodoro' && (
              <select
                value={props.burnTimer.focusMinutes}
                onChange={(event) => {
                  const minutes = Number(event.target.value)
                  props.setPomodoroCycle(minutes, minutes === 50 ? 10 : 5)
                }}
                aria-label="Pomodoro cycle length"
                className="rounded-full border border-white/10 bg-[#15171c] px-2 py-1 text-[10px] text-zinc-300"
              >
                <option value="25">25 / 5</option>
                <option value="50">50 / 10</option>
              </select>
            )}
            <button
              onClick={() => props.setTimerSeconds(props.burnTimer.mode === 'pomodoro' ? props.burnTimer.focusMinutes * 60 : 25 * 60)}
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
              onClick={props.stokeFuel}
              className="rounded-full border border-amber-500/40 bg-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/30"
            >
              🔥 Stoke (+5m)
            </button>
          </div>
          <button type="button" onClick={props.endAndArchiveSession} className="mt-2 border-t border-white/10 pt-2 text-[10px] text-zinc-500 transition-colors hover:text-orange-200">
            ⚱️ End Session &amp; Save Digest
          </button>
        </div>
      )

    // 2. Inbox Multi-Agent Feed
    case 'inbox-agents':
      return <AgentInbox {...props} />

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
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-orange-300/20 bg-orange-500/10 text-lg">🎵</div>
            <div className="truncate">
              <p className="truncate text-sm font-semibold">Procedural Bio-Focus</p>
              <p className="text-xs text-zinc-500">Web Audio · local only</p>
            </div>
          </div>
          <SoundscapeControls />
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