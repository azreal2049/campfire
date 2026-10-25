import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { useCampfireStore } from '../../../store/useCampfireStore'
import type { SolverLesson, WhiteboardMark } from '../../../types/campfire'

type Tool = WhiteboardMark['tool']
type BoardBackground = 'dot-grid' | 'graph' | 'obsidian'
const TOOLS: { id: Tool; label: string }[] = [
  { id: 'pen', label: '✏️ Pen' }, { id: 'highlighter', label: '🖍️ Highlight' },
  { id: 'line', label: '📏 Arrow' }, { id: 'rectangle', label: '⬜ Box' },
  { id: 'circle', label: '◯ Circle' }, { id: 'text', label: '🔤 Text' },
  { id: 'laser', label: '🔴 Laser' }, { id: 'eraser', label: '🧽 Erase' },
]
const COLORS = ['#FFFFFF', '#22C55E', '#38BDF8', '#F59E0B', '#F43F5E', '#A855F7']
const EMPTY_MARKS: WhiteboardMark[] = []

function drawMark(context: CanvasRenderingContext2D, mark: WhiteboardMark, width: number, height: number) {
  const first = mark.points[0]
  if (!first) return
  const last = mark.points[mark.points.length - 1] ?? first
  const x1 = first.x * width
  const y1 = first.y * height
  const x2 = last.x * width
  const y2 = last.y * height
  context.save()
  context.strokeStyle = mark.tool === 'eraser' ? '#070709' : mark.color
  context.fillStyle = mark.color
  context.lineWidth = mark.tool === 'highlighter' ? 16 : mark.tool === 'eraser' ? 22 : mark.tool === 'laser' ? 4 : 3
  context.globalAlpha = mark.tool === 'highlighter' ? 0.28 : 1
  context.lineCap = 'round'
  context.lineJoin = 'round'
  if (mark.tool === 'text') {
    context.font = '16px "SF Pro Display", sans-serif'
    context.fillText(mark.text ?? '', x1, y1)
  } else if (mark.tool === 'rectangle' || mark.tool === 'circle' || mark.tool === 'line') {
    context.beginPath()
    if (mark.tool === 'rectangle') context.rect(x1, y1, x2 - x1, y2 - y1)
    else if (mark.tool === 'circle') context.ellipse((x1 + x2) / 2, (y1 + y2) / 2, Math.abs(x2 - x1) / 2, Math.abs(y2 - y1) / 2, 0, 0, Math.PI * 2)
    else {
      context.moveTo(x1, y1)
      context.lineTo(x2, y2)
    }
    context.stroke()
    if (mark.tool === 'line') {
      const angle = Math.atan2(y2 - y1, x2 - x1)
      context.beginPath()
      context.moveTo(x2, y2)
      context.lineTo(x2 - 12 * Math.cos(angle - Math.PI / 6), y2 - 12 * Math.sin(angle - Math.PI / 6))
      context.moveTo(x2, y2)
      context.lineTo(x2 - 12 * Math.cos(angle + Math.PI / 6), y2 - 12 * Math.sin(angle + Math.PI / 6))
      context.stroke()
    }
  } else {
    context.beginPath()
    context.moveTo(x1, y1)
    for (const point of mark.points.slice(1)) context.lineTo(point.x * width, point.y * height)
    context.stroke()
  }
  context.restore()
}

export function Whiteboard() {
  const rooms = useCampfireStore((state) => state.rooms)
  const activeRoomId = useCampfireStore((state) => state.activeRoomId)
  const setWhiteboardMarks = useCampfireStore((state) => state.setWhiteboardMarks)
  const profile = useCampfireStore((state) => state.profile)
  const saveSolverLesson = useCampfireStore((state) => state.saveSolverLesson)
  const room = rooms.find((item) => item.id === activeRoomId) ?? null
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef<WhiteboardMark | null>(null)
  const [tool, setTool] = useState<Tool>('pen')
  const [color, setColor] = useState(COLORS[0])
  const [background, setBackground] = useState<BoardBackground>('dot-grid')
  const [redoStack, setRedoStack] = useState<WhiteboardMark[]>([])
  const [lessonStep, setLessonStep] = useState(0)
  const [questionDraft, setQuestionDraft] = useState<{ roomId: string | null; value: string } | null>(null)
  const [followUp, setFollowUp] = useState('')
  const [panelOpen, setPanelOpen] = useState(true)
  const [lessonOverride, setLessonOverride] = useState<SolverLesson | null>(null)
  const [tutorError, setTutorError] = useState('')
  const marks = room?.whiteboardMarks ?? EMPTY_MARKS
  const question = room && questionDraft && questionDraft.roomId === room.id ? questionDraft.value : room?.solverQuestion ?? ''
  const setQuestion = (value: string) => setQuestionDraft({ roomId: room?.id ?? null, value })

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    const bounds = canvas.getBoundingClientRect()
    const ratio = window.devicePixelRatio || 1
    canvas.width = bounds.width * ratio
    canvas.height = bounds.height * ratio
    context.scale(ratio, ratio)
    context.fillStyle = '#070709'
    context.fillRect(0, 0, bounds.width, bounds.height)
    if (background !== 'obsidian') {
      context.strokeStyle = 'rgba(255,255,255,0.08)'
      context.lineWidth = 1
      const step = background === 'dot-grid' ? 22 : 44
      for (let x = 0; x < bounds.width; x += step) for (let y = 0; y < bounds.height; y += step) {
        if (background === 'dot-grid') {
          context.beginPath(); context.arc(x, y, 1, 0, Math.PI * 2); context.fillStyle = 'rgba(255,255,255,0.18)'; context.fill()
        } else {
          context.beginPath(); context.moveTo(x, 0); context.lineTo(x, bounds.height); context.moveTo(0, y); context.lineTo(bounds.width, y); context.stroke()
        }
      }
      if (background === 'graph') {
        context.strokeStyle = 'rgba(56,189,248,0.45)'
        context.beginPath(); context.moveTo(bounds.width / 2, 0); context.lineTo(bounds.width / 2, bounds.height); context.moveTo(0, bounds.height / 2); context.lineTo(bounds.width, bounds.height / 2); context.stroke()
      }
    }
    for (const mark of marks) drawMark(context, mark, bounds.width, bounds.height)
    if (drawingRef.current) drawMark(context, drawingRef.current, bounds.width, bounds.height)
  }, [marks, background])

  if (!room) return <div className="p-5 text-sm text-neutral-500">Select a campfire to open the whiteboard.</div>
  const pointerPosition = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)), y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)) }
  }
  const pointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (tool === 'text') {
      const text = window.prompt('Text label')
      if (text) setWhiteboardMarks([...marks, { id: crypto.randomUUID(), tool, color, points: [pointerPosition(event)], text }])
      return
    }
    if (tool === 'eraser') {
      const target = pointerPosition(event)
      const erasedId = [...marks].reverse().find((mark) => mark.points.some((point) => Math.hypot(point.x - target.x, point.y - target.y) < 0.035))?.id
      if (erasedId) setWhiteboardMarks(marks.filter((mark) => mark.id !== erasedId))
      return
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    drawingRef.current = { id: crypto.randomUUID(), tool, color, points: [pointerPosition(event)] }
  }
  const pointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return
    drawingRef.current = { ...drawingRef.current, points: [...drawingRef.current.points, pointerPosition(event)] }
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (canvas && context) {
      const bounds = canvas.getBoundingClientRect()
      context.clearRect(0, 0, bounds.width, bounds.height)
      context.fillStyle = '#070709'
      context.fillRect(0, 0, bounds.width, bounds.height)
      for (const mark of marks) drawMark(context, mark, bounds.width, bounds.height)
      drawMark(context, drawingRef.current, bounds.width, bounds.height)
    }
  }
  const pointerUp = () => {
    if (!drawingRef.current) return
    const mark = drawingRef.current
    setWhiteboardMarks([...marks, mark])
    drawingRef.current = null
    setRedoStack([])
    if (mark.tool === 'laser') window.setTimeout(() => {
      const current = useCampfireStore.getState()
      if (current.activeRoomId !== room.id) return
      const activeRoom = current.rooms.find((item) => item.id === room.id)
      if (activeRoom) current.setWhiteboardMarks(activeRoom.whiteboardMarks.filter((item) => item.id !== mark.id))
    }, 900)
  }
  const lesson = lessonOverride ?? room.solverLesson
  const lessonSteps = lesson?.steps ?? [
    { title: 'Model the question', content: 'Identify the knowns, unknowns, assumptions, and governing model.', why: 'The model determines the correct equations and boundary conditions.' },
    { title: 'Draw the relationships', content: 'Represent the structure with labeled shapes and directional arrows.', why: 'A visual map exposes direction, sequence, and dependencies.' },
    { title: 'Check the result', content: 'Test units, signs, and limiting cases against the original question.', why: 'Independent checks catch common reasoning mistakes.' },
  ]
  const drawLessonStep = (index: number) => {
    const step = lessonSteps[Math.min(index, lessonSteps.length - 1)]
    const y = 0.18 + (index % 4) * 0.16
    const newMarks: WhiteboardMark[] = [
      { id: crypto.randomUUID(), tool: 'rectangle', color: '#38BDF8', points: [{ x: 0.12, y }, { x: 0.68, y: y + 0.12 }] },
      { id: crypto.randomUUID(), tool: 'text', color: '#FFFFFF', points: [{ x: 0.15, y: y + 0.07 }], text: `${index + 1}. ${step.title}` },
      { id: crypto.randomUUID(), tool: 'line', color: '#22C55E', points: [{ x: 0.28, y: y + 0.18 }, { x: 0.56, y: y + 0.18 }] },
      { id: crypto.randomUUID(), tool: 'text', color: '#F59E0B', points: [{ x: 0.15, y: y + 0.26 }], text: step.content.slice(0, 80) },
    ]
    setWhiteboardMarks([...marks, ...newMarks])
  }
  const teachNext = () => {
    if (lessonStep >= lessonSteps.length) return
    drawLessonStep(lessonStep)
    setLessonStep(lessonStep + 1)
  }
  const startLesson = async () => {
    const topic = question.trim() || lesson?.question || room.topic
    setQuestion(topic)
    setLessonStep(1)
    setTutorError('')
    let generated = lesson
    try {
      const response = await fetch(profile.aiBaseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(7000),
        body: JSON.stringify({ model: profile.aiModel || 'auto', messages: [{ role: 'system', content: 'Return JSON lesson with concept, formula, steps array of title/content/why, and finalAnswer. Keep steps visual and concise.' }, { role: 'user', content: topic }] }),
      })
      if (!response.ok) throw new Error(`Tutor endpoint returned HTTP ${response.status}.`)
      const payload: unknown = await response.json()
      const content = payload && typeof payload === 'object' && 'choices' in payload ? ((payload as { choices?: { message?: { content?: string } }[] }).choices?.[0]?.message?.content ?? '') : ''
      const parsed = JSON.parse(content) as Partial<SolverLesson>
      const steps = Array.isArray(parsed.steps) ? parsed.steps.filter((step) => typeof step.title === 'string' && typeof step.content === 'string' && typeof step.why === 'string') : []
      if (!parsed.concept || !parsed.formula || !parsed.finalAnswer || !steps.length) throw new Error('Tutor response was incomplete.')
      generated = { question: topic, concept: parsed.concept, formula: parsed.formula, steps, finalAnswer: parsed.finalAnswer, source: 'local model' }
      saveSolverLesson(generated)
      setLessonOverride(generated)
    } catch (error) {
      setTutorError(error instanceof Error ? `Using the built-in tutor guide. ${error.message}` : 'Using the built-in tutor guide.')
      if (!generated) generated = {
        question: topic,
        concept: 'Model the question, represent its relationships visually, and validate the result with boundary checks.',
        formula: 'Define known values → select governing relationship → check units and assumptions.',
        steps: [
          { title: 'Identify the model', content: `Translate “${topic}” into variables and a governing model.`, why: 'The model defines which relationships apply.' },
          { title: 'Draw relationships', content: 'Label the entities and show their direction or order with arrows.', why: 'An explicit diagram makes dependencies and direction easier to inspect.' },
          { title: 'Verify', content: 'Check units, edge cases, and the requested conclusion.', why: 'Independent checks catch assumptions and boundary errors.' },
        ],
        finalAnswer: 'Confirm the result matches the prompt and documented assumptions.',
        source: 'offline guide',
      }
      saveSolverLesson(generated)
      setLessonOverride(generated)
    }
    const first = generated.steps[0]
    const y = 0.18
    const newMarks: WhiteboardMark[] = [
      { id: crypto.randomUUID(), tool: 'rectangle', color: '#38BDF8', points: [{ x: 0.12, y }, { x: 0.68, y: y + 0.12 }] },
      { id: crypto.randomUUID(), tool: 'text', color: '#FFFFFF', points: [{ x: 0.15, y: y + 0.07 }], text: `1. ${first.title}` },
      { id: crypto.randomUUID(), tool: 'line', color: '#22C55E', points: [{ x: 0.28, y: y + 0.18 }, { x: 0.56, y: y + 0.18 }] },
      { id: crypto.randomUUID(), tool: 'text', color: '#F59E0B', points: [{ x: 0.15, y: y + 0.26 }], text: first.content.slice(0, 80) },
    ]
    newMarks.forEach((mark, index) => window.setTimeout(() => {
      const current = useCampfireStore.getState()
      if (current.activeRoomId !== room.id) return
      const currentRoom = current.rooms.find((item) => item.id === room.id)
      if (currentRoom) current.setWhiteboardMarks([...currentRoom.whiteboardMarks, mark])
    }, index * 140))
  }
  const speak = () => {
    if (!('speechSynthesis' in window)) return
    const step = lessonSteps[Math.max(0, Math.min(lessonStep - 1, lessonSteps.length - 1))]
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(`${step.title}. ${step.content} Why? ${step.why}`))
  }
  const undo = () => { if (marks.length) { setRedoStack([...redoStack, marks[marks.length - 1]]); setWhiteboardMarks(marks.slice(0, -1)) } }
  const redo = () => { if (redoStack.length) { setWhiteboardMarks([...marks, redoStack[redoStack.length - 1]]); setRedoStack(redoStack.slice(0, -1)) } }
  const exportPng = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `${room.name.replace(/[^\w-]+/g, '-')}-whiteboard.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }
  const addFollowUp = () => {
    if (!followUp.trim()) return
    setWhiteboardMarks([...marks, { id: crypto.randomUUID(), tool: 'text', color: '#F43F5E', points: [{ x: 0.1, y: 0.88 }], text: `Tutor note: ${followUp.trim()}` }])
    setFollowUp('')
  }

  return <section className="flex min-h-0 flex-1 flex-col p-3">
    <div className="mb-2 flex flex-wrap items-center gap-1 rounded-xl border border-white/10 bg-[#111114]/90 p-2 backdrop-blur-xl">
      {TOOLS.map((item) => <button key={item.id} onClick={() => setTool(item.id)} className={`rounded-md px-2 py-1.5 text-[10px] ${tool === item.id ? 'bg-white/15 text-white' : 'text-neutral-400 hover:bg-white/5'}`}>{item.label}</button>)}
      <span className="mx-1 h-5 border-l border-white/10" />
      {COLORS.map((swatch) => <button key={swatch} title={swatch} onClick={() => setColor(swatch)} className={`h-5 w-5 rounded-full border ${color === swatch ? 'border-white' : 'border-white/20'}`} style={{ backgroundColor: swatch }} />)}
      <select value={background} onChange={(event) => setBackground(event.target.value as BoardBackground)} aria-label="Board background" className="ml-auto rounded-md border border-white/10 bg-[#111114] px-2 py-1 text-[10px] text-neutral-300"><option value="dot-grid">Dot Grid</option><option value="graph">Coordinate Graph</option><option value="obsidian">Pure Obsidian</option></select>
      <button onClick={undo} disabled={!marks.length} title="Undo" className="rounded px-2 text-xs text-neutral-300 disabled:opacity-30">↩</button>
      <button onClick={redo} disabled={!redoStack.length} title="Redo" className="rounded px-2 text-xs text-neutral-300 disabled:opacity-30">↪</button>
      <button onClick={() => { setWhiteboardMarks([]); setRedoStack([]) }} title="Clear board" className="rounded px-2 text-xs text-neutral-300">🗑️</button>
      <button onClick={exportPng} title="Export board PNG" className="rounded px-2 text-xs text-neutral-300">📸</button>
    </div>
    <div className="flex min-h-0 flex-1 gap-2">
      <div className="relative min-w-0 flex-1 overflow-hidden rounded-xl border border-white/10">
        <canvas ref={canvasRef} className="h-full w-full touch-none" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} />
        <div className="absolute bottom-3 left-3 right-3 flex gap-2 rounded-xl border border-white/10 bg-[#0B0B0E]/90 p-2 backdrop-blur-xl">
          <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="🎓 Ask AI Tutor to Teach & Draw on Board..." className="min-w-0 flex-1 bg-transparent px-2 text-xs text-white outline-none" />
          <button onClick={startLesson} className="rounded-lg bg-white px-3 py-2 text-[10px] font-semibold text-black">🎓 Teach Me on Board</button>
        </div>
      </div>
      {panelOpen && <aside className="flex w-[240px] shrink-0 flex-col rounded-xl border border-white/10 bg-[#0B0B0E]/90 p-3">
        <div className="flex items-center justify-between"><h3 className="text-xs font-semibold text-white">AI Tutor Lesson</h3><button onClick={() => setPanelOpen(false)} aria-label="Collapse tutor panel" className="text-neutral-500">›</button></div>
        <div className="scrollbar-thin mt-3 flex-1 overflow-y-auto">
          {lessonSteps.map((step, index) => <button key={step.title} onClick={() => { drawLessonStep(index); setLessonStep(index + 1) }} className={`mb-2 w-full rounded-lg border p-2 text-left ${lessonStep === index + 1 ? 'border-sky-400/30 bg-sky-400/[0.06]' : 'border-white/[0.06]'}`}><span className="text-[10px] font-semibold text-neutral-200">{index + 1}. {step.title}</span><span className="mt-1 block text-[10px] leading-relaxed text-neutral-500">{step.content}</span></button>)}
        </div>
        {tutorError && <p role="status" className="my-1 text-[9px] text-amber-300">{tutorError}</p>}
        <div className="flex gap-1"><button onClick={() => setLessonStep((value) => Math.max(0, value - 1))} className="flex-1 rounded border border-white/10 py-1.5 text-[9px] text-neutral-300">◀ Prev Step</button><button onClick={teachNext} disabled={lessonStep >= lessonSteps.length} className="flex-1 rounded border border-white/10 py-1.5 text-[9px] text-neutral-300 disabled:opacity-40">▶ Next Step</button></div>
        <button onClick={speak} className="mt-1 rounded border border-white/10 py-1.5 text-[9px] text-neutral-300">🔊 Read Aloud</button>
        <div className="mt-2 flex gap-1"><input value={followUp} onChange={(event) => setFollowUp(event.target.value)} placeholder="Ask a follow-up…" className="glass-input min-w-0 flex-1 rounded px-2 text-[9px] text-white" /><button onClick={addFollowUp} className="rounded bg-white/10 px-2 text-[9px] text-white">Add</button></div>
      </aside>}
      {!panelOpen && <button onClick={() => setPanelOpen(true)} className="rounded border border-white/10 px-2 text-xs text-neutral-400">‹</button>}
    </div>
    <div className="mt-2 flex flex-wrap gap-1">{['Draw & explain Solid Sphere Gravitational Potential', 'Draw Deque Sliding Window step-by-step', 'Draw SN1 vs SN2 Reaction Mechanism', 'Draw Binary Search Tree Rotation'].map((chip) => <button key={chip} onClick={() => setQuestion(chip)} className="rounded-full border border-white/[0.07] px-2 py-1 text-[9px] text-neutral-500 hover:text-neutral-200">{chip}</button>)}</div>
  </section>
}
