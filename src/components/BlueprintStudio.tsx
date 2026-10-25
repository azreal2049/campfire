import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'

type Trigger = 'On Click' | 'On Hover' | 'On Timer 00:00' | 'On Keypress'
type Action = 'Navigate to Screen' | 'Open Popup Modal' | 'Close Modal' | 'Switch Supply Tab' | 'Trigger State Action'
type ElementKind = 'Button' | 'Sidebar Panel' | 'Header Bar' | 'Input Box' | 'Card Grid' | 'Tabs' | 'Custom Component' | 'UI Block' | 'Popup'
type BlueprintElement = {
  id: string
  label: string
  kind: ElementKind
  x: number
  y: number
  width: number
  height: number
  accent: string
  notes: string
}
type BlueprintScreen = {
  id: string
  title: string
  route: string
  x: number
  y: number
  width: number
  height: number
  items: BlueprintElement[]
}
type Flow = {
  id: string
  fromId: string
  toId: string
  trigger: Trigger
  action: Action
}
type BlueprintData = { version: 1; screens: BlueprintScreen[]; flows: Flow[] }
type Selection = { type: 'screen' | 'element' | 'flow'; id: string } | null
type DragInfo = { id: string; type: 'screen' | 'element' | 'resize'; startX: number; startY: number; initialX: number; initialY: number; initialWidth: number; initialHeight: number; parentId?: string; parentX?: number; parentY?: number }

const STORAGE_KEY = 'campfire_ui_blueprint_v1'
const CYAN = '#38BDF8'
const triggers: Trigger[] = ['On Click', 'On Hover', 'On Timer 00:00', 'On Keypress']
const actions: Action[] = ['Navigate to Screen', 'Open Popup Modal', 'Close Modal', 'Switch Supply Tab', 'Trigger State Action']

const makeElement = (screenId: string, label: string, x: number, y: number, width: number, height: number, kind: ElementKind = 'UI Block'): BlueprintElement => ({
  id: `${screenId}-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  label, kind, x, y, width, height, accent: '#38BDF8', notes: '',
})

function createInitialData(): BlueprintData {
  const login = {
    id: 'login', title: 'Login / Auth Gate', route: '/login', x: 340, y: 120, width: 520, height: 700,
    items: [
      makeElement('login', 'Campfire Logo & Hero', 34, 52, 430, 92, 'Header Bar'),
      makeElement('login', 'Username / Handle Input', 54, 176, 392, 58, 'Input Box'),
      makeElement('login', 'Role Selector (💻 Developer | 🧬 Student)', 54, 250, 392, 68, 'Tabs'),
      makeElement('login', 'Continue with GitHub Button', 54, 344, 392, 58, 'Button'),
      makeElement('login', 'Enter as Guest Button', 54, 420, 392, 58, 'Button'),
    ],
  }
  const lobby = {
    id: 'lobby', title: 'Radar Home Lobby', route: '/lobby', x: 960, y: 120, width: 520, height: 700,
    items: [
      makeElement('lobby', 'Top Search & Quick Switcher (Ctrl+K)', 24, 30, 472, 56, 'Input Box'),
      makeElement('lobby', '+ Light a Campfire CTA Button', 24, 104, 472, 64, 'Button'),
      makeElement('lobby', 'Live Embers Grid (Active Rooms)', 24, 190, 472, 180, 'Card Grid'),
      makeElement('lobby', 'Solo Study/Code Pod Button', 24, 390, 225, 74, 'Button'),
      makeElement('lobby', 'Online Team Roster', 264, 390, 232, 150, 'Sidebar Panel'),
      makeElement('lobby', 'Bottom-Left User Status Pod', 24, 566, 472, 76, 'Custom Component'),
    ],
  }
  const room = {
    id: 'room', title: 'Active Campfire Workspace', route: '/room', x: 1580, y: 120, width: 620, height: 700,
    items: [
      makeElement('room', 'RadarSidebar (260px)', 0, 62, 116, 558, 'Sidebar Panel'),
      makeElement('room', 'UserPod (Bottom-Left)', 10, 550, 96, 62, 'Custom Component'),
      makeElement('room', 'TopBurnHeader (Room Title, Timer, Stoke +15m, Invite, Room Settings)', 120, 0, 500, 54, 'Header Bar'),
      makeElement('room', 'SupplyDock Tab Bar (Dev Rig, Solvely AI, AI Whiteboard, Scratchpad, Pins, Live Stage)', 120, 62, 500, 54, 'Tabs'),
      makeElement('room', 'IDE File Explorer', 120, 124, 106, 330, 'Sidebar Panel'),
      makeElement('room', 'Main Stage (Code Editor / Solvely / Whiteboard Canvas)', 234, 124, 386, 330, 'Custom Component'),
      makeElement('room', 'Terminal & AI Audit Drawer', 120, 464, 500, 112, 'Custom Component'),
      makeElement('room', 'BottomVoiceDock (Soundscape, Mic, Deafen, Screen Share, Leave)', 120, 584, 500, 36, 'Header Bar'),
      makeElement('room', 'RightChatSidebar (Chat Stream, Member Roster, Pins, Chat Input)', 0, 62, 116, 478, 'Sidebar Panel'),
    ],
  }
  const modals = {
    id: 'modals', title: 'Popups & Modals Dock', route: '/modals', x: 2300, y: 120, width: 520, height: 700,
    items: [
      makeElement('modals', 'Create Campfire Modal', 30, 48, 460, 90, 'Popup'),
      makeElement('modals', 'Full-Screen User Settings Modal', 30, 160, 460, 90, 'Popup'),
      makeElement('modals', 'Room Settings Modal', 30, 272, 460, 90, 'Popup'),
      makeElement('modals', 'Invite Friends Popup', 30, 384, 460, 90, 'Popup'),
      makeElement('modals', 'Burnout / Session Summary Modal', 30, 496, 460, 90, 'Popup'),
    ],
  }
  return { version: 1, screens: [login, lobby, room, modals], flows: [] }
}

function loadData(): BlueprintData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed: unknown = JSON.parse(saved)
      if (parsed && typeof parsed === 'object' && 'screens' in parsed && Array.isArray(parsed.screens) && 'flows' in parsed && Array.isArray(parsed.flows)) {
        return parsed as BlueprintData
      }
    }
  } catch (error) {
    console.error('Could not load the saved UI blueprint.', error)
  }
  return createInitialData()
}

const inputStyle: CSSProperties = {
  width: '100%', background: '#111318', color: 'white', border: '1px solid #272a33',
  borderRadius: 7, padding: '8px 9px', outline: 'none', fontSize: 12,
}

export function BlueprintStudio() {
  const [data, setData] = useState<BlueprintData>(loadData)
  const [selection, setSelection] = useState<Selection>(null)
  const [wireMode, setWireMode] = useState(false)
  const [prototype, setPrototype] = useState(false)
  const [prototypeScreen, setPrototypeScreen] = useState('login')
  const [zoom, setZoom] = useState(0.78)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [message, setMessage] = useState('')
  const [wireDraft, setWireDraft] = useState<{ fromId: string; x: number; y: number } | null>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragInfo | null>(null)
  const panRef = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null)
  const wireRef = useRef<string | null>(null)
  const timerFlowsRun = useRef(new Set<string>())

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Could not auto-save the UI blueprint.', error)
    }
  }, [data])

  const selectedScreen = selection?.type === 'screen' ? data.screens.find((screen) => screen.id === selection.id) : undefined
  const selectedElement = selection?.type === 'element'
    ? data.screens.flatMap((screen) => screen.items.map((item) => ({ item, screen }))).find(({ item }) => item.id === selection.id)
    : undefined
  const selectedFlow = selection?.type === 'flow' ? data.flows.find((flow) => flow.id === selection.id) : undefined
  const selectedEntity = selectedScreen ?? selectedElement?.item

  const worldPoint = useCallback((clientX: number, clientY: number) => {
    const rect = viewportRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return { x: (clientX - rect.left - pan.x) / zoom, y: (clientY - rect.top - pan.y) / zoom }
  }, [pan.x, pan.y, zoom])

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      if (dragRef.current) {
        const drag = dragRef.current
        const point = worldPoint(event.clientX, event.clientY)
        const dx = point.x - drag.startX
        const dy = point.y - drag.startY
        setData((current) => {
          if (drag.type === 'screen') {
            return { ...current, screens: current.screens.map((screen) => screen.id === drag.id ? { ...screen, x: drag.initialX + dx, y: drag.initialY + dy } : screen) }
          }
          if (drag.type === 'resize') {
            if (selection?.type === 'screen') return { ...current, screens: current.screens.map((screen) => screen.id === drag.id ? { ...screen, width: Math.max(320, drag.initialWidth + dx), height: Math.max(240, drag.initialHeight + dy) } : screen) }
            return { ...current, screens: current.screens.map((screen) => ({ ...screen, items: screen.items.map((item) => item.id === drag.id ? { ...item, width: Math.max(60, drag.initialWidth + dx), height: Math.max(36, drag.initialHeight + dy) } : item) })) }
          }
          const targetScreen = current.screens.find((screen) => screen.id !== drag.parentId && point.x >= screen.x && point.x <= screen.x + screen.width && point.y >= screen.y && point.y <= screen.y + screen.height)
          const destinationId = targetScreen?.id ?? drag.parentId
          const destination = current.screens.find((screen) => screen.id === destinationId)
          const itemX = (drag.parentX ?? 0) + drag.initialX + dx - (destination?.x ?? 0)
          const itemY = (drag.parentY ?? 0) + drag.initialY + dy - (destination?.y ?? 0)
          let moved: BlueprintElement | undefined
          const screens = current.screens.map((screen) => {
            const index = screen.items.findIndex((item) => item.id === drag.id)
            if (index < 0) return screen
            moved = { ...screen.items[index], x: itemX, y: itemY }
            return { ...screen, items: screen.items.filter((item) => item.id !== drag.id) }
          })
          if (moved && destinationId) {
            return { ...current, screens: screens.map((screen) => screen.id === destinationId ? { ...screen, items: [...screen.items, moved!] } : screen) }
          }
          return current
        })
      } else if (panRef.current) {
        const start = panRef.current
        setPan({ x: start.x + event.clientX - start.startX, y: start.y + event.clientY - start.startY })
      } else if (wireRef.current) {
        const point = worldPoint(event.clientX, event.clientY)
        setWireDraft({ fromId: wireRef.current, x: point.x, y: point.y })
      }
    }
    const onPointerUp = (event: PointerEvent) => {
      dragRef.current = null
      panRef.current = null
      if (wireRef.current) {
        const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-target-screen]')
        const targetId = target?.dataset.targetScreen
        if (targetId && targetId !== wireRef.current) {
          setData((current) => ({ ...current, flows: [...current.flows, { id: `flow-${Date.now()}`, fromId: wireRef.current!, toId: targetId, trigger: 'On Click', action: 'Navigate to Screen' }] }))
          setMessage('Flow connection added')
        }
      }
      wireRef.current = null
      setWireDraft(null)
    }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [selection, worldPoint])

  const updateScreen = (id: string, patch: Partial<BlueprintScreen>) => {
    setData((current) => ({ ...current, screens: current.screens.map((screen) => screen.id === id ? { ...screen, ...patch } : screen) }))
  }
  const updateElement = (id: string, patch: Partial<BlueprintElement>) => {
    setData((current) => ({ ...current, screens: current.screens.map((screen) => ({ ...screen, items: screen.items.map((item) => item.id === id ? { ...item, ...patch } : item) })) }))
  }
  const updateFlow = (id: string, patch: Partial<Flow>) => {
    setData((current) => ({ ...current, flows: current.flows.map((flow) => flow.id === id ? { ...flow, ...patch } : flow) }))
  }

  const beginDrag = (event: ReactPointerEvent, info: Omit<DragInfo, 'startX' | 'startY'>) => {
    event.stopPropagation()
    const point = worldPoint(event.clientX, event.clientY)
    dragRef.current = {
      ...info,
      startX: point.x,
      startY: point.y,
      ...(info.type === 'element' && info.parentId
        ? { parentX: data.screens.find((screen) => screen.id === info.parentId)?.x ?? 0, parentY: data.screens.find((screen) => screen.id === info.parentId)?.y ?? 0 }
        : {}),
    }
    setSelection({ type: info.type === 'screen' ? 'screen' : 'element', id: info.id })
  }

  const addScreen = (popup = false) => {
    const id = `screen-${Date.now()}`
    const screen: BlueprintScreen = { id, title: popup ? 'New Popup Modal' : 'New Screen Frame', route: popup ? '/modal' : '/screen', x: 330 + data.screens.length * 100, y: 900, width: 520, height: 540, items: popup ? [makeElement(id, 'New Popup Content', 24, 56, 472, 180, 'Popup')] : [] }
    setData((current) => ({ ...current, screens: [...current.screens, screen] }))
    setSelection({ type: 'screen', id })
  }
  const addElement = (kind: ElementKind) => {
    const screen = selectedScreen ?? selectedElement?.screen ?? data.screens[0]
    if (!screen) return
    const item = makeElement(screen.id, `New ${kind}`, 24, 24 + screen.items.length * 52, 220, 48, kind)
    setData((current) => ({ ...current, screens: current.screens.map((entry) => entry.id === screen.id ? { ...entry, items: [...entry.items, item] } : entry) }))
    setSelection({ type: 'element', id: item.id })
  }
  const deleteSelection = () => {
    if (!selection) return
    if (selection.type === 'screen') {
      setData((current) => ({ ...current, screens: current.screens.filter((screen) => screen.id !== selection.id), flows: current.flows.filter((flow) => flow.toId !== selection.id) }))
    } else if (selection.type === 'element') {
      setData((current) => ({ ...current, screens: current.screens.map((screen) => ({ ...screen, items: screen.items.filter((item) => item.id !== selection.id) })), flows: current.flows.filter((flow) => flow.fromId !== selection.id) }))
    } else {
      setData((current) => ({ ...current, flows: current.flows.filter((flow) => flow.id !== selection.id) }))
    }
    setSelection(null)
  }

  const elementCenters = useMemo(() => new Map(data.screens.flatMap((screen) => screen.items.map((item) => [item.id, { x: screen.x + item.x + item.width / 2, y: screen.y + item.y + item.height / 2 }] as const))), [data.screens])
  const flowLabel = (flow: Flow) => {
    const source = data.screens.flatMap((screen) => screen.items).find((item) => item.id === flow.fromId)?.label ?? 'Element'
    const target = data.screens.find((screen) => screen.id === flow.toId)?.title ?? 'Target'
    return `${flow.trigger.replace('On ', '')} "${source}" ➔ ${flow.action === 'Open Popup Modal' ? 'Open' : flow.action === 'Navigate to Screen' ? 'Go to' : flow.action} ${target}`
  }
  const beginWire = (event: ReactPointerEvent, itemId: string) => {
    event.stopPropagation()
    wireRef.current = itemId
    const point = worldPoint(event.clientX, event.clientY)
    setWireDraft({ fromId: itemId, x: point.x, y: point.y })
    setSelection({ type: 'element', id: itemId })
  }
  const runPrototype = (itemId: string, trigger: Trigger = 'On Click') => {
    const flow = data.flows.find((entry) => entry.fromId === itemId && entry.trigger === trigger)
    if (!flow) {
      setMessage('No On Click flow connected')
      return
    }
    setPrototypeScreen(flow.toId)
    setMessage(`${flow.action}: ${data.screens.find((screen) => screen.id === flow.toId)?.title ?? 'destination'}`)
  }

  useEffect(() => {
    if (!prototype) return
    const activeScreen = data.screens.find((screen) => screen.id === prototypeScreen)
    if (!activeScreen) return
    const activeElementIds = new Set(activeScreen.items.map((item) => item.id))
    const timerFlow = data.flows.find((flow) => activeElementIds.has(flow.fromId) && flow.trigger === 'On Timer 00:00' && !timerFlowsRun.current.has(flow.id))
    let timer: number | undefined
    if (timerFlow) {
      timerFlowsRun.current.add(timerFlow.id)
      timer = window.setTimeout(() => {
        setPrototypeScreen(timerFlow.toId)
        setMessage(`${timerFlow.action}: ${data.screens.find((screen) => screen.id === timerFlow.toId)?.title ?? 'destination'}`)
      }, 1000)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.length !== 1 && event.key !== 'Enter' && event.key !== ' ') return
      const flow = data.flows.find((entry) => activeElementIds.has(entry.fromId) && entry.trigger === 'On Keypress')
      if (flow) {
        setPrototypeScreen(flow.toId)
        setMessage(`${flow.action}: ${data.screens.find((screen) => screen.id === flow.toId)?.title ?? 'destination'}`)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      if (timer !== undefined) window.clearTimeout(timer)
    }
  }, [data.flows, data.screens, prototype, prototypeScreen])
  const saveToRepo = async () => {
    try {
      const response = await fetch('/__save-blueprint', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data, null, 2) })
      if (!response.ok) throw new Error(`Save endpoint returned ${response.status}`)
      setMessage('Saved to ui-blueprint.json')
    } catch (error) {
      console.error('Could not save the UI blueprint to the project.', error)
      setMessage('Repo save failed — run the Vite dev server')
    }
  }
  const copyPrompt = async () => {
    const prompt = `Apply this UI blueprint specification to the Campfire project. Use the saved screen geometry, component labels, notes, and flow connections as the source of truth. Preserve the existing architecture and behavior where not specified.\n\n${JSON.stringify(data, null, 2)}`
    try {
      await navigator.clipboard.writeText(prompt)
      setMessage('Agent prompt copied')
    } catch (error) {
      console.error('Could not copy the agent prompt.', error)
      setMessage('Clipboard access failed')
    }
  }

  const btn = 'rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] text-white/80 hover:bg-white/10'
  const selectStyle: CSSProperties = { ...inputStyle, padding: '7px 8px' }
  return (
    <div className="fixed inset-0 z-[100] flex select-none flex-col bg-[#050507] text-white">
      <div className="z-20 flex h-[54px] shrink-0 items-center justify-between border-b border-white/10 bg-[#0b0c10] px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-sky-400/30 bg-sky-400/10 text-sky-300">✳</div>
          <div><div className="text-xs font-semibold tracking-wide">BLUEPRINT STUDIO</div><div className="text-[9px] text-white/40">Interactive UI &amp; Flowchart Architect</div></div>
          <span className="ml-2 rounded-full border border-white/10 px-2 py-1 text-[9px] text-white/40">PRIVATE · DEV ONLY</span>
        </div>
        <div className="flex items-center gap-2">
          <button className={`${btn} ${wireMode ? 'border-sky-400/60 bg-sky-400/15 text-sky-200' : ''}`} onClick={() => { setWireMode(!wireMode); setPrototype(false) }}>🔗 {wireMode ? 'Exit Wire Mode' : 'Wire Flow Mode'}</button>
          <button className={`${btn} ${prototype ? 'border-emerald-400/60 bg-emerald-400/15 text-emerald-200' : ''}`} onClick={() => { if (!prototype) timerFlowsRun.current.clear(); setPrototype(!prototype); setWireMode(false); setPrototypeScreen('login') }}>▶ {prototype ? 'Stop Prototype' : 'Play Flow Prototype'}</button>
          <span className="mx-1 h-5 border-l border-white/10" />
          <button className={btn} onClick={saveToRepo}>💾 Save Blueprint to Repo</button>
          <button className={btn} onClick={copyPrompt}>📋 Copy Agent Prompt</button>
          <button className={btn} onClick={() => { window.location.hash = '' }}>🔙 Back to Live App</button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className="z-10 flex w-[240px] shrink-0 flex-col gap-4 overflow-y-auto border-r border-white/10 bg-[#0b0c10] p-3">
          <div><div className="mb-2 text-[10px] font-semibold uppercase tracking-[.16em] text-white/45">Canvas</div><div className="flex items-center gap-2"><button className={btn} onClick={() => setZoom((value) => Math.min(1.5, value + .1))}>＋</button><span className="w-12 text-center font-mono text-[10px] text-white/60">{Math.round(zoom * 100)}%</span><button className={btn} onClick={() => setZoom((value) => Math.max(.3, value - .1))}>−</button><button className={btn} onClick={() => { setZoom(.78); setPan({ x: 0, y: 0 }) }}>Reset</button></div></div>
          <div><div className="mb-2 text-[10px] font-semibold uppercase tracking-[.16em] text-white/45">Add to canvas</div><div className="grid gap-1.5"><button className={`${btn} text-left`} onClick={() => addScreen()}>＋ Add New Screen Frame</button><button className={`${btn} text-left`} onClick={() => addScreen(true)}>＋ Add Popup Modal</button></div></div>
          <div><div className="mb-2 text-[10px] font-semibold uppercase tracking-[.16em] text-white/45">UI blocks</div><div className="grid grid-cols-2 gap-1.5">{(['Button', 'Sidebar Panel', 'Header Bar', 'Input Box', 'Card Grid', 'Tabs', 'Custom Component'] as ElementKind[]).map((kind) => <button key={kind} className={`${btn} text-left`} onClick={() => addElement(kind)}>＋ {kind}</button>)}</div><p className="mt-2 text-[10px] leading-relaxed text-white/30">Select a screen, then add a block. Drag blocks between frames to change their screen.</p></div>
          <div className="mt-auto rounded-lg border border-white/[.08] bg-white/[.025] p-2.5 text-[10px] leading-relaxed text-white/40"><div className="mb-1 font-semibold text-white/60">Shortcuts</div>Ctrl + Shift + B · toggle studio<br />Drag background · pan canvas<br />Scroll wheel · zoom canvas</div>
        </aside>

        <div ref={viewportRef} className="relative min-w-0 flex-1 overflow-hidden" style={{ backgroundColor: '#07080b', backgroundImage: 'radial-gradient(#343842 0.75px, transparent 0.75px)', backgroundSize: '22px 22px', cursor: wireMode ? 'crosshair' : 'grab' }}
          onPointerDown={(event) => { if (event.target === event.currentTarget) panRef.current = { x: pan.x, y: pan.y, startX: event.clientX, startY: event.clientY } }}
          onWheel={(event) => { event.preventDefault(); setZoom((value) => Math.max(.3, Math.min(1.5, value - event.deltaY * .001))) }}
        >
          <div className="absolute left-0 top-0 h-[3000px] w-[5000px]" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0' }}>
            <svg className="pointer-events-none absolute inset-0 overflow-visible" width="5000" height="3000">
              <defs><marker id="blueprint-arrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill={CYAN} /></marker></defs>
              {data.flows.map((flow) => {
                const from = elementCenters.get(flow.fromId)
                const target = data.screens.find((screen) => screen.id === flow.toId)
                if (!from || !target) return null
                const to = { x: target.x + target.width / 2, y: target.y + target.height / 2 }
                const middleX = (from.x + to.x) / 2
                const path = `M ${from.x} ${from.y} C ${middleX} ${from.y}, ${middleX} ${to.y}, ${to.x} ${to.y}`
                return <g key={flow.id} onClick={(event) => { event.stopPropagation(); setSelection({ type: 'flow', id: flow.id }) }} style={{ pointerEvents: 'auto', cursor: 'pointer' }}>
                  <path d={path} fill="none" stroke="transparent" strokeWidth="18" />
                  <path d={path} fill="none" stroke={selection?.id === flow.id ? '#fff' : CYAN} strokeWidth="2.5" strokeDasharray="7 5" markerEnd="url(#blueprint-arrow)" className="animate-[dash_1.2s_linear_infinite]" />
                  <foreignObject x={middleX - 90} y={(from.y + to.y) / 2 - 14} width="180" height="28"><div className="truncate rounded-full border border-sky-400/40 bg-[#07121b] px-2 py-1 text-center text-[8px] text-sky-200">{flowLabel(flow)}</div></foreignObject>
                </g>
              })}
              {wireDraft && elementCenters.get(wireDraft.fromId) && <path d={`M ${elementCenters.get(wireDraft.fromId)?.x} ${elementCenters.get(wireDraft.fromId)?.y} C ${(elementCenters.get(wireDraft.fromId)?.x ?? 0) + 100} ${(elementCenters.get(wireDraft.fromId)?.y ?? 0)}, ${wireDraft.x - 80} ${wireDraft.y}, ${wireDraft.x} ${wireDraft.y}`} fill="none" stroke={CYAN} strokeWidth="2" strokeDasharray="5 5" />}
            </svg>
            {data.screens.map((screen) => {
              const isSelected = selection?.type === 'screen' && selection.id === screen.id
              const isActivePrototype = prototype && prototypeScreen === screen.id
              return <div key={screen.id} data-target-screen={screen.id} onPointerDown={(event) => { if (!prototype) beginDrag(event, { id: screen.id, type: 'screen', initialX: screen.x, initialY: screen.y, initialWidth: screen.width, initialHeight: screen.height }) }}
                onClick={(event) => { event.stopPropagation(); if (!wireMode && !prototype) setSelection({ type: 'screen', id: screen.id }) }}
                className={`absolute overflow-hidden rounded-xl border bg-[#111318] shadow-[0_16px_60px_rgba(0,0,0,.5)] ${isSelected || isActivePrototype ? 'border-sky-400 ring-1 ring-sky-400/50' : 'border-white/15'}`}
                style={{ left: screen.x, top: screen.y, width: screen.width, height: screen.height, opacity: prototype && !isActivePrototype ? .22 : 1, pointerEvents: prototype && !isActivePrototype ? 'none' : 'auto' }}
              >
                <div className="flex h-[42px] items-center justify-between border-b border-white/10 bg-[#191b22] px-3">
                  <div className="min-w-0"><div className="truncate text-[11px] font-semibold">{screen.title}</div><div className="font-mono text-[9px] text-white/35">{screen.route}</div></div>
                  <span className="font-mono text-[8px] text-white/30">{Math.round(screen.width)}×{Math.round(screen.height)}</span>
                </div>
                {screen.items.map((item) => {
                  const chosen = selection?.type === 'element' && selection.id === item.id
                  return <div key={item.id} onPointerDown={(event) => { if (prototype && item.kind === 'Button') return; beginDrag(event, { id: item.id, type: 'element', parentId: screen.id, initialX: item.x, initialY: item.y, initialWidth: item.width, initialHeight: item.height }) }}
                    onClick={(event) => { event.stopPropagation(); if (prototype && item.kind === 'Button') { runPrototype(item.id); return } if (!wireMode) setSelection({ type: 'element', id: item.id }) }}
                    onMouseEnter={() => { if (prototype && item.kind === 'Button' && data.flows.some((flow) => flow.fromId === item.id && flow.trigger === 'On Hover')) runPrototype(item.id, 'On Hover') }}
                    className={`group absolute flex items-center justify-center overflow-visible rounded-md border px-2 text-center text-[10px] leading-tight shadow-sm ${item.kind === 'Button' ? 'bg-sky-500/15 text-sky-100' : item.kind === 'Popup' ? 'bg-violet-500/10 text-violet-100' : 'bg-[#20232b] text-white/75'} ${chosen ? 'z-10 border-sky-300 ring-2 ring-sky-400/25' : 'border-white/10'} ${prototype && item.kind === 'Button' ? 'cursor-pointer hover:border-emerald-300 hover:bg-emerald-400/20' : 'cursor-move'}`}
                    style={{ left: item.x, top: item.y, width: item.width, height: item.height, borderColor: chosen ? CYAN : `${item.accent}55` }}
                    title={item.notes || item.label}
                  >
                    <span className="pointer-events-none line-clamp-3">{item.label}</span>
                    {wireMode && <button aria-label={`Wire ${item.label}`} title="Drag port to a screen/modal" onPointerDown={(event) => beginWire(event, item.id)} className="absolute -right-2.5 top-1/2 z-20 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-sky-300 bg-[#06121a] shadow-[0_0_12px_#38bdf880]"><span className="sr-only">Connection port</span></button>}
                    {chosen && !prototype && <><div className="pointer-events-none absolute -top-5 left-0 whitespace-nowrap rounded bg-sky-400 px-1.5 py-0.5 font-mono text-[8px] text-black">{Math.round(item.x)}, {Math.round(item.y)} · {Math.round(item.width)}×{Math.round(item.height)} px</div><button aria-label="Resize element" onPointerDown={(event) => beginDrag(event, { id: item.id, type: 'resize', initialX: item.x, initialY: item.y, initialWidth: item.width, initialHeight: item.height })} className="absolute -bottom-1.5 -right-1.5 h-3.5 w-3.5 cursor-nwse-resize rounded-sm border border-white bg-sky-400" /></>}
                  </div>
                })}
                {isSelected && !prototype && <button aria-label="Resize screen" onPointerDown={(event) => { event.stopPropagation(); const point = worldPoint(event.clientX, event.clientY); dragRef.current = { id: screen.id, type: 'resize', startX: point.x, startY: point.y, initialX: screen.x, initialY: screen.y, initialWidth: screen.width, initialHeight: screen.height }; setSelection({ type: 'screen', id: screen.id }) }} className="absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize rounded-tl-md border-l border-t border-sky-300 bg-sky-400" />}
              </div>
            })}
          </div>
          <div className="absolute bottom-3 left-3 rounded-md border border-white/10 bg-black/60 px-2 py-1 text-[9px] text-white/45">{prototype ? `Prototype · ${data.screens.find((screen) => screen.id === prototypeScreen)?.title ?? 'Screen'}` : wireMode ? 'Wire mode · drag a port onto a screen frame' : 'Infinite canvas · select and drag blocks'}</div>
          {message && <div className="absolute bottom-3 right-3 rounded-md border border-white/10 bg-black/75 px-3 py-1.5 text-[10px] text-white/75">{message}</div>}
        </div>

        <aside className="z-10 flex w-[280px] shrink-0 flex-col gap-3 overflow-y-auto border-l border-white/10 bg-[#0b0c10] p-3">
          <div className="flex items-center justify-between"><div className="text-[10px] font-semibold uppercase tracking-[.16em] text-white/45">Inspector</div>{selection && <button className="text-[10px] text-red-300 hover:text-red-200" onClick={deleteSelection}>🗑 Delete</button>}</div>
          {selectedFlow && <div className="space-y-3"><div className="rounded-lg border border-sky-400/20 bg-sky-400/[.06] p-2 text-[10px] leading-relaxed text-sky-100">{flowLabel(selectedFlow)}</div><label className="block text-[10px] text-white/45">Trigger<select style={selectStyle} value={selectedFlow.trigger} onChange={(event) => updateFlow(selectedFlow.id, { trigger: event.target.value as Trigger })}>{triggers.map((trigger) => <option key={trigger}>{trigger}</option>)}</select></label><label className="block text-[10px] text-white/45">Action<select style={selectStyle} value={selectedFlow.action} onChange={(event) => updateFlow(selectedFlow.id, { action: event.target.value as Action })}>{actions.map((action) => <option key={action}>{action}</option>)}</select></label><label className="block text-[10px] text-white/45">Destination<select style={selectStyle} value={selectedFlow.toId} onChange={(event) => updateFlow(selectedFlow.id, { toId: event.target.value })}>{data.screens.map((screen) => <option key={screen.id} value={screen.id}>{screen.title}</option>)}</select></label></div>}
          {selectedEntity && <div className="space-y-3">
            <label className="block text-[10px] text-white/45">Label / Title<input style={inputStyle} value={selectedScreen?.title ?? selectedElement?.item.label ?? ''} onChange={(event) => { if (selectedScreen) updateScreen(selectedScreen.id, { title: event.target.value }); else if (selectedElement) updateElement(selectedElement.item.id, { label: event.target.value }) }} /></label>
            {selectedScreen && <label className="block text-[10px] text-white/45">Route<input style={inputStyle} value={selectedScreen.route} onChange={(event) => updateScreen(selectedScreen.id, { route: event.target.value })} /></label>}
            {selectedElement && <label className="block text-[10px] text-white/45">Component Type<select style={selectStyle} value={selectedElement.item.kind} onChange={(event) => updateElement(selectedElement.item.id, { kind: event.target.value as ElementKind })}>{(['Button', 'Sidebar Panel', 'Header Bar', 'Input Box', 'Card Grid', 'Tabs', 'Custom Component', 'Popup', 'UI Block'] as ElementKind[]).map((kind) => <option key={kind}>{kind}</option>)}</select></label>}
            <div className="grid grid-cols-2 gap-2">{(['width', 'height'] as const).map((dimension) => <label key={dimension} className="text-[10px] capitalize text-white/45">{dimension} (px)<input type="number" style={inputStyle} value={Math.round(selectedEntity[dimension])} onChange={(event) => { const value = Math.max(36, Number(event.target.value) || 36); if (selectedScreen) updateScreen(selectedScreen.id, { [dimension]: value }); else if (selectedElement) updateElement(selectedElement.item.id, { [dimension]: value }) }} /></label>)}</div>
            {selectedElement && <label className="block text-[10px] text-white/45">Color / Accent<input type="color" value={selectedElement.item.accent} onChange={(event) => updateElement(selectedElement.item.id, { accent: event.target.value })} className="mt-1 h-9 w-full rounded border border-white/10 bg-[#111318] p-1" /></label>}
            {selectedElement && <label className="block text-[10px] text-white/45">Notes / Instructions for AI Agent<textarea style={{ ...inputStyle, minHeight: 94, resize: 'vertical' }} placeholder="Show red mic when muted, slide open at 60Hz..." value={selectedElement.item.notes} onChange={(event) => updateElement(selectedElement.item.id, { notes: event.target.value })} /></label>}
            <div className="rounded-md border border-white/[.07] bg-white/[.025] p-2 font-mono text-[9px] text-white/35">X {Math.round(selectedEntity.x)} · Y {Math.round(selectedEntity.y)} · W {Math.round(selectedEntity.width)} · H {Math.round(selectedEntity.height)} px</div>
            {selectedElement && <div className="text-[9px] text-white/35">Flow links: {data.flows.filter((flow) => flow.fromId === selectedElement.item.id).length} · {wireMode ? 'drag the port to a destination frame' : 'enable Wire Flow Mode to connect'}</div>}
          </div>}
          {!selection && <div className="rounded-lg border border-dashed border-white/10 p-4 text-center text-[10px] leading-relaxed text-white/35">Select a screen, UI block, or flow arrow to edit its properties.</div>}
          {selectedElement && <div className="mt-auto rounded-lg border border-white/[.08] bg-white/[.025] p-2 text-[9px] leading-relaxed text-white/35">The project saver is available from the top toolbar while running the Vite development server.</div>}
        </aside>
      </div>
    </div>
  )
}
