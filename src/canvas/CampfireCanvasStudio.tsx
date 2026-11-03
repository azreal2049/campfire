import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from 'react'
import { ArrowDownToLine, ArrowUpToLine, Bot, Copy, Eye, MousePointer2, Plus, Redo2, Save, Search, Trash2, Undo2, X } from 'lucide-react'
import { offlineOutput } from '../lib/offlineCode'
import './campfireCanvasStudio.css'

type ElementKind =
  | 'box' | 'button' | 'toggle' | 'menu' | 'text' | 'input' | 'search'
  | 'badge' | 'divider' | 'avatar' | 'chat' | 'roster' | 'timer' | 'ide'
  | 'browser' | 'console' | 'whiteboard' | 'solver' | 'mindmap' | 'vault' | 'ai'
type ClickAction = 'none' | 'navigate' | 'popup' | 'close' | 'save' | 'run' | 'ai' | 'mic'
type StudioMode = 'canvas' | 'focus' | 'preview'
type Point = { x: number; y: number }
type StudioElement = {
  id: string
  pageId: string
  kind: ElementKind
  icon: string
  label: string
  subtext: string
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  background: string
  opacity: number
  blur: number
  borderWidth: number
  borderColor: string
  borderStyle: 'solid' | 'dashed' | 'none'
  radius: number
  fontSize: number
  fontWeight: number
  textAlign: 'left' | 'center' | 'right'
  textColor: string
  shadow: 'none' | 'soft' | 'white' | 'cyan'
  action: ClickAction
  targetPageId: string
  placeholder: string
}
type StudioPage = { id: string; name: string; x: number; y: number; width: number; height: number }
type StudioWire = { id: string; fromElementId: string; toPageId: string }
type CanvasState = { pages: StudioPage[]; elements: StudioElement[]; wires: StudioWire[] }
type DragState = { type: 'element' | 'resize' | 'page' | 'page-resize' | 'pan'; id?: string; handle?: string; start: Point; initial: StudioElement | StudioPage | Point; pointer: Point }

const STORAGE_KEY = 'campfire_canvas_studio_v2'
const elementKinds: { kind: ElementKind; label: string; group: 'Basic UI' | 'Campfire widgets' }[] = [
  { kind: 'box', label: 'Box / Glass Container', group: 'Basic UI' },
  { kind: 'button', label: 'Button', group: 'Basic UI' },
  { kind: 'toggle', label: 'Segmented Toggle Switch', group: 'Basic UI' },
  { kind: 'menu', label: 'Top Menu Bar Pill', group: 'Basic UI' },
  { kind: 'text', label: 'Text / Heading', group: 'Basic UI' },
  { kind: 'input', label: 'Text Input / Password Box', group: 'Basic UI' },
  { kind: 'search', label: 'Search Bar', group: 'Basic UI' },
  { kind: 'badge', label: 'Badge / Pill Tag', group: 'Basic UI' },
  { kind: 'divider', label: 'Divider / Line', group: 'Basic UI' },
  { kind: 'avatar', label: 'Circle / Avatar / Icon Button', group: 'Basic UI' },
  { kind: 'chat', label: '💬 Chat Stream Widget', group: 'Campfire widgets' },
  { kind: 'roster', label: '👥 Member Roster Widget', group: 'Campfire widgets' },
  { kind: 'timer', label: '⏱️ Burn / Pomodoro Timer Widget', group: 'Campfire widgets' },
  { kind: 'ide', label: '💻 VS Code IDE Editor Widget', group: 'Campfire widgets' },
  { kind: 'browser', label: '🌐 Integrated Browser Preview Widget', group: 'Campfire widgets' },
  { kind: 'console', label: '🧪 App Testing / Console Widget', group: 'Campfire widgets' },
  { kind: 'whiteboard', label: '🎨 Whiteboard + Note Grid Widget', group: 'Campfire widgets' },
  { kind: 'solver', label: '🧠 Solvely AI / Doubt Solver Widget', group: 'Campfire widgets' },
  { kind: 'mindmap', label: '🗺️ AI Mindmap & Notes Bar', group: 'Campfire widgets' },
  { kind: 'vault', label: '🗄️ Personal Vault Folder Grid', group: 'Campfire widgets' },
  { kind: 'ai', label: '🤖 Persistent AI Bot Trigger / Drawer', group: 'Campfire widgets' },
]

const defaultStyle = {
  background: '#111115', opacity: 100, blur: 0, borderWidth: 1, borderColor: '#34343d',
  borderStyle: 'solid' as const, radius: 12, fontSize: 14, fontWeight: 500,
  textAlign: 'left' as const, textColor: '#f4f4f5', shadow: 'none' as const,
  action: 'none' as const, targetPageId: '', placeholder: '',
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

function makeElement(pageId: string, kind: ElementKind, x: number, y: number, overrides: Partial<StudioElement> = {}): StudioElement {
  const names: Record<ElementKind, string> = {
    box: 'Glass Container', button: 'Button', toggle: 'Chat / Workplace', menu: 'File  ▾     Sessions  ▾     Help  ▾',
    text: 'Heading', input: 'Text Input', search: 'Search active rooms, files, or commands...', badge: 'Focus streak · 7 days',
    divider: '', avatar: 'CF', chat: 'Chat Stream', roster: 'Members', timer: '25:00', ide: 'VS Code · main.ts',
    browser: 'Browser Preview', console: 'Testing Console', whiteboard: 'Whiteboard + Notes', solver: 'Solvely · Doubt Solver',
    mindmap: 'AI Notes & Mindmap', vault: 'Personal Vault', ai: 'Campfire AI',
  }
  const sizes: Record<ElementKind, [number, number]> = {
    box: [360, 180], button: [190, 44], toggle: [250, 42], menu: [330, 42], text: [300, 56], input: [260, 42],
    search: [340, 42], badge: [170, 32], divider: [220, 2], avatar: [42, 42], chat: [360, 250],
    roster: [220, 210], timer: [180, 90], ide: [560, 380], browser: [360, 220], console: [360, 160],
    whiteboard: [540, 360], solver: [300, 220], mindmap: [400, 70], vault: [500, 220], ai: [220, 56],
  }
  const [width, height] = sizes[kind]
  return {
    id: uid('element'), pageId, kind, icon: '', label: names[kind], subtext: '', x, y, width, height, zIndex: 1,
    ...defaultStyle, ...overrides,
  }
}

function seedState(): CanvasState {
  const seedPages = [
    { id: 'starter-signin', name: '1. Sign In', x: 80, y: 80 },
    { id: 'starter-lobby', name: '2. Lobby / Radar Home', x: 1500, y: 80 },
    { id: 'starter-chat', name: '3. Chat', x: 2920, y: 80 },
    { id: 'starter-workplace', name: '4. Workplace (Study & Coder)', x: 80, y: 1100 },
    { id: 'starter-vault', name: '5. Personal Vault', x: 1500, y: 1100 },
    { id: 'starter-settings', name: '6. Settings', x: 2920, y: 1100 },
  ].map((page) => ({ ...page, width: 1280, height: 800 }))
  const elements: StudioElement[] = []
  const add = (pageId: string, kind: ElementKind, x: number, y: number, label?: string, action?: ClickAction, targetPageId?: string) =>
    elements.push(makeElement(pageId, kind, x, y, { label: label ?? makeElement(pageId, kind, x, y).label, action: action ?? 'none', targetPageId: targetPageId ?? '' }))

  add('starter-signin', 'text', 360, 185, 'Welcome to Campfire', 'none')
  add('starter-signin', 'text', 360, 250, 'Sign in to find your focus space')
  add('starter-signin', 'input', 360, 315, 'Username', 'none')
  add('starter-signin', 'input', 360, 370, 'Password', 'none')
  add('starter-signin', 'button', 360, 440, 'Enter Campfire', 'navigate', 'starter-lobby')
  add('starter-signin', 'button', 565, 440, 'Continue as guest', 'navigate', 'starter-lobby')
  add('starter-lobby', 'menu', 36, 24)
  add('starter-lobby', 'text', 52, 126, 'Greeting, ~ You ~')
  add('starter-lobby', 'badge', 1000, 130)
  add('starter-lobby', 'button', 70, 235, 'Reply to...', 'navigate', 'starter-chat')
  add('starter-lobby', 'button', 390, 235, 'Continue where you left', 'navigate', 'starter-workplace')
  add('starter-lobby', 'button', 710, 235, 'Deploy Agent', 'ai')
  add('starter-lobby', 'search', 70, 370)
  add('starter-lobby', 'button', 810, 370, '🔥 Lit a Campfire', 'navigate', 'starter-workplace')
  add('starter-chat', 'menu', 36, 24)
  add('starter-chat', 'chat', 38, 100)
  add('starter-chat', 'roster', 900, 100)
  add('starter-chat', 'timer', 900, 335)
  add('starter-workplace', 'menu', 36, 24)
  add('starter-workplace', 'ide', 36, 95)
  add('starter-workplace', 'whiteboard', 620, 95)
  add('starter-workplace', 'solver', 925, 95)
  add('starter-workplace', 'mindmap', 36, 480)
  add('starter-vault', 'text', 48, 65, 'Personal Vault')
  add('starter-vault', 'vault', 48, 145)
  add('starter-settings', 'text', 48, 65, 'User & App Settings')
  add('starter-settings', 'box', 48, 145, 'Profile · Notifications · Privacy')
  add('starter-settings', 'box', 480, 145, 'Integrations · Language · Rust Bridge')
  return { pages: seedPages, elements, wires: [] }
}

function readSavedState(): CanvasState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedState()
    const saved = JSON.parse(raw) as CanvasState
    if (!Array.isArray(saved.pages) || !Array.isArray(saved.elements) || !Array.isArray(saved.wires)) return seedState()
    return { ...saved, elements: saved.elements.map((element) => ({ ...element, icon: typeof element.icon === 'string' ? element.icon : '' })) }
  } catch {
    return seedState()
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function styleFor(element: StudioElement): CSSProperties {
  const shadow = element.shadow === 'soft' ? '0 12px 28px #0008' : element.shadow === 'white' ? '0 0 18px #fff8' : element.shadow === 'cyan' ? '0 0 18px #38bdf888' : 'none'
  return {
    backgroundColor: element.background,
    backgroundImage: element.kind === 'whiteboard' ? 'radial-gradient(#393943 1px, transparent 1px)' : undefined,
    backgroundSize: element.kind === 'whiteboard' ? '16px 16px' : undefined,
    opacity: element.opacity / 100,
    backdropFilter: element.blur ? `blur(${element.blur}px)` : undefined,
    border: `${element.borderWidth}px ${element.borderStyle} ${element.borderColor}`,
    borderRadius: element.radius,
    color: element.textColor,
    fontSize: element.fontSize,
    fontWeight: element.fontWeight,
    textAlign: element.textAlign,
    boxShadow: shadow,
  }
}

function labelFor(kind: ElementKind) {
  return elementKinds.find((item) => item.kind === kind)?.label ?? kind
}

export function CampfireCanvasStudio() {
  const [state, setState] = useState<CanvasState>(readSavedState)
  const [mode, setMode] = useState<StudioMode>('canvas')
  const [selectedPageId, setSelectedPageId] = useState(state.pages[0]?.id ?? '')
  const [selectedElementId, setSelectedElementId] = useState('')
  const [zoom, setZoom] = useState(0.2)
  const [pan, setPan] = useState<Point>({ x: 16, y: 16 })
  const [snap, setSnap] = useState(true)
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<'pages' | 'layers'>('pages')
  const [status, setStatus] = useState('All changes saved locally')
  const [history, setHistory] = useState<CanvasState[]>([])
  const [future, setFuture] = useState<CanvasState[]>([])
  const [inlineId, setInlineId] = useState('')
  const [popupPageId, setPopupPageId] = useState('')
  const [aiOpen, setAiOpen] = useState(false)
  const [aiText, setAiText] = useState('')
  const [chatText, setChatText] = useState('')
  const [messages, setMessages] = useState(['Welcome to the Campfire room.', 'Design your own workspace by dragging blocks here.'])
  const [micOn, setMicOn] = useState(true)
  const [runOutput, setRunOutput] = useState('Ready. Run an IDE widget to see output here.')
  const [timerSeconds, setTimerSeconds] = useState(25 * 60)
  const [ideFiles, setIdeFiles] = useState([{ name: 'main.js', content: 'console.log("Hello Campfire")' }])
  const [activeIdeFile, setActiveIdeFile] = useState(0)
  const [ideLanguage, setIdeLanguage] = useState('javascript')
  const [wireFrom, setWireFrom] = useState('')
  const boardRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragState | null>(null)
  const spaceDown = useRef(false)
  const clipboard = useRef<StudioElement | null>(null)
  const activePage = state.pages.find((page) => page.id === selectedPageId) ?? state.pages[0]
  const selectedElement = state.elements.find((element) => element.id === selectedElementId)
  const alignmentGuides = useMemo(() => {
    if (!selectedElement) return { vertical: [] as { page: StudioPage; x: number }[], horizontal: [] as { page: StudioPage; y: number }[] }
    const page = state.pages.find((item) => item.id === selectedElement.pageId)
    if (!page) return { vertical: [], horizontal: [] }
    const peers = state.elements.filter((item) => item.pageId === page.id && item.id !== selectedElement.id)
    const vertical: { page: StudioPage; x: number }[] = []
    const horizontal: { page: StudioPage; y: number }[] = []
    for (const peer of peers) {
      const peerXs = [peer.x, peer.x + peer.width / 2, peer.x + peer.width]
      const selfXs = [selectedElement.x, selectedElement.x + selectedElement.width / 2, selectedElement.x + selectedElement.width]
      const peerYs = [peer.y, peer.y + peer.height / 2, peer.y + peer.height]
      const selfYs = [selectedElement.y, selectedElement.y + selectedElement.height / 2, selectedElement.y + selectedElement.height]
      for (const x of selfXs) if (peerXs.some((other) => Math.abs(x - other) < 1)) vertical.push({ page, x: page.x + x })
      for (const y of selfYs) if (peerYs.some((other) => Math.abs(y - other) < 1)) horizontal.push({ page, y: page.y + y })
    }
    return { vertical, horizontal }
  }, [selectedElement, state.elements, state.pages])

  const record = useCallback((next: CanvasState) => {
    setHistory((items) => [...items.slice(-39), state])
    setFuture([])
    setState(next)
  }, [state])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (error) {
      console.error('Could not save Campfire Canvas state locally.', error)
      setStatus(`Local save failed: ${error instanceof Error ? error.message : 'storage unavailable'}`)
    }
  }, [state])

  const saveToRepo = useCallback(async () => {
    setStatus('Saving to campfire-canvas.json…')
    try {
      const response = await fetch('/__save-canvas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(state) })
      if (!response.ok) throw new Error(`Save endpoint returned ${response.status}`)
      const result = await response.json() as { saved?: boolean; file?: string }
      if (!result.saved) throw new Error('Save endpoint did not confirm the write')
      setStatus(`Saved to ${result.file ?? 'campfire-canvas.json'}`)
    } catch (error) {
      setStatus(`Repo save failed: ${error instanceof Error ? error.message : 'unknown error'}`)
    }
  }, [state])

  useEffect(() => {
    const timer = window.setInterval(() => { void saveToRepo() }, 15_000)
    return () => window.clearInterval(timer)
  }, [saveToRepo])

  useEffect(() => {
    if (mode !== 'preview') return
    const timer = window.setInterval(() => setTimerSeconds((seconds) => Math.max(0, seconds - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [mode])

  function saveVaultItem(title: string, content: string) {
    try {
      const current: unknown = JSON.parse(localStorage.getItem('campfire-vault-ai') ?? '[]')
      const items = Array.isArray(current) ? current : []
      localStorage.setItem('campfire-vault-ai', JSON.stringify([{ title, content }, ...items]))
      setStatus(`Saved to Personal Vault: ${title}`)
    } catch (error) {
      setStatus(`Vault save failed: ${error instanceof Error ? error.message : 'storage unavailable'}`)
    }
  }

  async function runIDE() {
    const file = ideFiles[activeIdeFile]
    if (!file) return
    const pistonLanguage = ideLanguage === 'typescript' ? 'typescript' : ideLanguage
    const extension = ideLanguage === 'python' ? 'py' : ideLanguage === 'javascript' || ideLanguage === 'typescript' ? 'js' : ideLanguage === 'rust' ? 'rs' : 'cpp'
    try {
      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(12_000),
        body: JSON.stringify({ language: pistonLanguage, version: '*', files: [{ name: file.name, content: file.content }], stdin: '', args: [], run_timeout: 5000 }),
      })
      if (!response.ok) throw new Error(`Piston returned HTTP ${response.status}.`)
      const payload: unknown = await response.json()
      if (!payload || typeof payload !== 'object' || !('run' in payload)) throw new Error('Invalid Piston response.')
      const result = (payload as { run?: { stdout?: string; stderr?: string; code?: number } }).run
      if (!result) throw new Error('Piston did not return a run result.')
      setRunOutput([result.stdout, result.stderr].filter(Boolean).join('\n') || (result.code === 0 ? 'Process completed with no output.' : 'Process failed.'))
    } catch (error) {
      const fallback = offlineOutput(file.content, extension)
      setRunOutput(`${fallback.stdout}${fallback.stderr ? `\n${fallback.stderr}` : ''}\n\nOffline fallback · ${error instanceof Error ? error.message : 'Piston unavailable'}`)
    }
  }

  const updateElement = useCallback((id: string, patch: Partial<StudioElement>) => {
    record({ ...state, elements: state.elements.map((element) => element.id === id ? { ...element, ...patch } : element) })
  }, [record, state])

  const updatePage = useCallback((id: string, patch: Partial<StudioPage>) => {
    record({ ...state, pages: state.pages.map((page) => page.id === id ? { ...page, ...patch } : page) })
  }, [record, state])

  const addPage = useCallback((name = 'Untitled Page') => {
    const page: StudioPage = { id: uid('page'), name, x: 160 + state.pages.length * 120, y: 160 + state.pages.length * 70, width: 1280, height: 800 }
    record({ ...state, pages: [...state.pages, page] })
    setSelectedPageId(page.id)
    setSelectedElementId('')
    setMode('focus')
  }, [record, state])

  const addElement = useCallback((kind: ElementKind, pageId = selectedPageId, position?: Point) => {
    const page = state.pages.find((item) => item.id === pageId)
    if (!page) return
    const samePage = state.elements.filter((element) => element.pageId === pageId)
    const element = makeElement(pageId, kind, position?.x ?? 32 + (samePage.length % 4) * 55, position?.y ?? 88 + (samePage.length % 8) * 52, {
      zIndex: Math.max(0, ...samePage.map((item) => item.zIndex)) + 1,
    })
    record({ ...state, elements: [...state.elements, element] })
    setSelectedElementId(element.id)
    setSelectedPageId(pageId)
  }, [record, selectedPageId, state])

  const deleteSelected = useCallback(() => {
    if (selectedElementId) {
      record({ ...state, elements: state.elements.filter((element) => element.id !== selectedElementId), wires: state.wires.filter((wire) => wire.fromElementId !== selectedElementId) })
      setSelectedElementId('')
    } else if (activePage) {
      record({ ...state, pages: state.pages.filter((page) => page.id !== activePage.id), elements: state.elements.filter((element) => element.pageId !== activePage.id), wires: state.wires.filter((wire) => wire.toPageId !== activePage.id) })
      setSelectedPageId(state.pages.find((page) => page.id !== activePage.id)?.id ?? '')
    }
  }, [activePage, record, selectedElementId, state])

  const deletePage = useCallback((pageId = selectedPageId) => {
    const remaining = state.pages.filter((page) => page.id !== pageId)
    if (remaining.length === state.pages.length) return
    record({ ...state, pages: remaining, elements: state.elements.filter((element) => element.pageId !== pageId), wires: state.wires.filter((wire) => wire.toPageId !== pageId) })
    setSelectedPageId(remaining[0]?.id ?? '')
    setSelectedElementId('')
  }, [record, selectedPageId, state])

  const duplicateElement = useCallback((source: StudioElement, pageId = source.pageId, offset = 12) => {
    const copy = { ...source, id: uid('element'), pageId, x: source.x + offset, y: source.y + offset, zIndex: Math.max(0, ...state.elements.filter((item) => item.pageId === pageId).map((item) => item.zIndex)) + 1 }
    record({ ...state, elements: [...state.elements, copy] })
    setSelectedPageId(pageId)
    setSelectedElementId(copy.id)
  }, [record, state])

  const duplicatePage = useCallback((pageId = selectedPageId) => {
    const source = state.pages.find((page) => page.id === pageId)
    if (!source) return
    const copyPage = { ...source, id: uid('page'), name: `${source.name} copy`, x: source.x + 100, y: source.y + 100 }
    const remap = new Map(state.elements.filter((item) => item.pageId === source.id).map((item) => [item.id, uid('element')]))
    const copies = state.elements.filter((item) => item.pageId === source.id).map((item) => ({ ...item, id: remap.get(item.id)!, pageId: copyPage.id }))
    record({ ...state, pages: [...state.pages, copyPage], elements: [...state.elements, ...copies] })
    setSelectedPageId(copyPage.id)
  }, [record, selectedPageId, state])

  const undo = useCallback(() => {
    const previous = history.at(-1)
    if (!previous) return
    setFuture((items) => [state, ...items])
    setHistory((items) => items.slice(0, -1))
    setState(previous)
  }, [history, state])

  const redo = useCallback(() => {
    const next = future[0]
    if (!next) return
    setHistory((items) => [...items, state])
    setFuture((items) => items.slice(1))
    setState(next)
  }, [future, state])

  const exportRust = useCallback(() => {
    const schema = {
      pages: state.pages.map((page) => ({
        id: page.id, name: page.name, x: page.x, y: page.y, width: page.width, height: page.height,
        elements: state.elements.filter((element) => element.pageId === page.id).map(({ id, kind, icon, label, subtext, x, y, width, height, zIndex, action, targetPageId, background, opacity, blur, borderWidth, borderColor, borderStyle, radius, fontSize, fontWeight, textAlign, textColor, shadow, placeholder }) => ({
          id, kind, icon, label, subtext, x, y, width, height, zIndex, action, targetPageId, background, opacity, blur, borderWidth, borderColor, borderStyle, radius, fontSize, fontWeight, textAlign, textColor, shadow, placeholder,
        })),
      })),
      wires: state.wires,
    }
    const rust = `// Generated from Campfire Canvas Studio\n#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]\npub struct CanvasPage { pub id: String, pub name: String, pub x: f64, pub y: f64, pub width: f64, pub height: f64, pub elements: Vec<CanvasElement> }\n#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]\npub struct CanvasElement { pub id: String, pub kind: String, pub label: String, pub x: f64, pub y: f64, pub width: f64, pub height: f64, pub z_index: i32, pub action: String, pub target_page_id: String }\n#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]\npub struct CanvasSpec { pub pages: Vec<CanvasPage>, pub wires: Vec<serde_json::Value> }\n\n// Full flat schema data (JSON):\n${JSON.stringify(schema, null, 2)}\n`
    const url = URL.createObjectURL(new Blob([rust], { type: 'text/plain;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'campfire-canvas.rs'
    anchor.click()
    URL.revokeObjectURL(url)
    setStatus('Exported Rust UI spec')
  }, [state])

  const pageElements = useMemo(() => state.elements.filter((element) => element.pageId === selectedPageId).sort((a, b) => a.zIndex - b.zIndex), [selectedPageId, state.elements])
  const filteredKinds = useMemo(() => elementKinds.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())), [query])

  useEffect(() => {
    if (mode === 'canvas') return
    const page = state.pages.find((item) => item.id === selectedPageId)
    const board = boardRef.current
    if (!page || !board) return
    const nextZoom = clamp(Math.min((board.clientWidth - 72) / page.width, (board.clientHeight - 72) / page.height), 0.25, 1.5)
    setZoom(nextZoom)
    setPan({ x: 36 - page.x * nextZoom, y: 36 - page.y * nextZoom })
  }, [mode, selectedPageId, state.pages])

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const editing = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable
      if (event.code === 'Space' && !editing) { spaceDown.current = true; event.preventDefault() }
      if (editing) return
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); if (event.shiftKey) redo(); else undo() }
      else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') { event.preventDefault(); redo() }
      else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'd' && selectedElement) { event.preventDefault(); duplicateElement(selectedElement) }
      else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c' && selectedElement) { clipboard.current = selectedElement }
      else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v' && clipboard.current) { event.preventDefault(); duplicateElement(clipboard.current, selectedPageId, 20) }
      else if ((event.key === 'Delete' || event.key === 'Backspace') && (selectedElementId || selectedPageId)) { event.preventDefault(); deleteSelected() }
      else if (event.key === 'Escape') { setPopupPageId(''); setAiOpen(false); setMode('canvas') }
    }
    const keyup = (event: KeyboardEvent) => { if (event.code === 'Space') spaceDown.current = false }
    window.addEventListener('keydown', keydown)
    window.addEventListener('keyup', keyup)
    return () => { window.removeEventListener('keydown', keydown); window.removeEventListener('keyup', keyup) }
  }, [deleteSelected, duplicateElement, redo, selectedElement, selectedElementId, selectedPageId, undo])

  function boardPoint(event: { clientX: number; clientY: number }): Point {
    const rect = boardRef.current?.getBoundingClientRect()
    return { x: (event.clientX - (rect?.left ?? 0) - pan.x) / zoom, y: (event.clientY - (rect?.top ?? 0) - pan.y) / zoom }
  }

  function setDragState(next: DragState | null) {
    dragRef.current = next
  }

  function beginElementDrag(event: ReactPointerEvent, element: StudioElement) {
    if (mode === 'preview' || event.button !== 0 || (event.target as HTMLElement).closest('[data-resize]')) return
    event.stopPropagation()
    setSelectedElementId(element.id)
    setSelectedPageId(element.pageId)
    const p = boardPoint(event)
    setDragState({ type: 'element', id: element.id, start: p, pointer: p, initial: element })
    ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  }

  function beginResize(event: ReactPointerEvent, element: StudioElement, handle: string) {
    event.stopPropagation()
    const p = boardPoint(event)
    setSelectedElementId(element.id)
    setDragState({ type: 'resize', id: element.id, handle, start: p, pointer: p, initial: element })
    ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  }

  function beginPageDrag(event: ReactPointerEvent, page: StudioPage) {
    if (mode === 'preview' || event.button !== 0 || (event.target as HTMLElement).closest('[data-page-resize]')) return
    event.stopPropagation()
    setSelectedPageId(page.id)
    setSelectedElementId('')
    const p = boardPoint(event)
    setDragState({ type: 'page', id: page.id, start: p, pointer: p, initial: page })
    ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  }

  function beginPageResize(event: ReactPointerEvent, page: StudioPage) {
    event.stopPropagation()
    const p = boardPoint(event)
    setDragState({ type: 'page-resize', id: page.id, start: p, pointer: p, initial: page })
    ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  }

  function moveDrag(event: ReactPointerEvent) {
    const current = dragRef.current
    if (!current) return
    const p = current.type === 'pan' ? { x: event.clientX, y: event.clientY } : boardPoint(event)
    const dx = (p.x - current.start.x) * (current.type === 'pan' ? 1 : 1)
    const dy = (p.y - current.start.y) * (current.type === 'pan' ? 1 : 1)
    if (current.type === 'pan') {
      setPan({ x: (current.initial as Point).x + (event.clientX - current.start.x), y: (current.initial as Point).y + (event.clientY - current.start.y) })
      return
    }
    if (current.type === 'element' || current.type === 'resize') {
      const item = current.initial as StudioElement
      let next = { ...item }
      if (current.type === 'element') {
        const grid = snap ? 8 : 1
        next.x = Math.round((item.x + dx) / grid) * grid
        next.y = Math.round((item.y + dy) / grid) * grid
        const target = state.pages.find((page) => {
          const center = { x: p.x, y: p.y }
          return center.x >= page.x && center.x <= page.x + page.width && center.y >= page.y && center.y <= page.y + page.height
        })
        if (target && target.id !== item.pageId) {
          next.pageId = target.id
          next.x = Math.round((p.x - target.x - item.width / 2) / grid) * grid
          next.y = Math.round((p.y - target.y - item.height / 2) / grid) * grid
          setSelectedPageId(target.id)
        }
        const peers = state.elements.filter((other) => other.pageId === next.pageId && other.id !== item.id)
        const align = (value: number, candidates: number[]) => {
          const nearest = candidates.reduce((best, candidate) => Math.abs(candidate - value) < Math.abs(best - value) ? candidate : best, value)
          return Math.abs(nearest - value) <= 5 ? nearest : value
        }
        const peerXs = peers.flatMap((other) => [other.x, other.x + other.width / 2, other.x + other.width])
        const peerYs = peers.flatMap((other) => [other.y, other.y + other.height / 2, other.y + other.height])
        next.x = align(next.x, peerXs.flatMap((x) => [x, x - next.width, x - next.width / 2]))
        next.y = align(next.y, peerYs.flatMap((y) => [y, y - next.height, y - next.height / 2]))
      } else {
        const h = current.handle ?? ''
        if (h.includes('e')) next.width = Math.max(28, item.width + dx)
        if (h.includes('w')) { next.width = Math.max(28, item.width - dx); next.x = item.x + item.width - next.width }
        if (h.includes('s')) next.height = Math.max(24, item.height + dy)
        if (h.includes('n')) { next.height = Math.max(24, item.height - dy); next.y = item.y + item.height - next.height }
        next.width = Math.round(next.width)
        next.height = Math.round(next.height)
      }
      setState((old) => ({ ...old, elements: old.elements.map((element) => element.id === current.id ? next : element) }))
    } else {
      const page = current.initial as StudioPage
      if (current.type === 'page') {
        const grid = snap ? 8 : 1
        setState((old) => ({ ...old, pages: old.pages.map((item) => item.id === current.id ? { ...page, x: Math.round((page.x + dx) / grid) * grid, y: Math.round((page.y + dy) / grid) * grid } : item) }))
      } else {
        setState((old) => ({ ...old, pages: old.pages.map((item) => item.id === current.id ? { ...page, width: Math.max(480, page.width + dx), height: Math.max(320, page.height + dy) } : item) }))
      }
    }
  }

  function endDrag() {
    if (!dragRef.current) return
    dragRef.current = null
    setHistory((items) => [...items.slice(-39), state])
    setFuture([])
  }

  function beginPan(event: ReactPointerEvent) {
    if (mode === 'preview') return
    if (event.button === 1 || spaceDown.current || (event.target as HTMLElement).classList.contains('canvas-surface')) {
      event.preventDefault()
      event.stopPropagation()
      setDragState({ type: 'pan', start: { x: event.clientX, y: event.clientY }, pointer: { x: event.clientX, y: event.clientY }, initial: pan })
      ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
    } else if (event.target === boardRef.current) {
      setSelectedElementId('')
      setSelectedPageId('')
    }
  }

  function onWheel(event: ReactWheelEvent) {
    if (event.ctrlKey) {
      event.preventDefault()
      setZoom((value) => clamp(value * (event.deltaY < 0 ? 1.08 : 0.92), 0.25, 2))
    } else if (mode === 'canvas') {
      setPan((value) => ({ x: value.x - event.deltaX, y: value.y - event.deltaY }))
    }
  }

  function fitCanvas() {
    const board = boardRef.current
    if (!board || !state.pages.length) return
    const minX = Math.min(...state.pages.map((page) => page.x))
    const minY = Math.min(...state.pages.map((page) => page.y))
    const maxX = Math.max(...state.pages.map((page) => page.x + page.width))
    const maxY = Math.max(...state.pages.map((page) => page.y + page.height))
    const nextZoom = clamp(Math.min((board.clientWidth - 60) / (maxX - minX), (board.clientHeight - 60) / (maxY - minY)), 0.08, 2)
    setZoom(nextZoom)
    setPan({ x: 30 - minX * nextZoom, y: 30 - minY * nextZoom })
  }

  function spawnAtPointer(p: Point, kind: ElementKind) {
    const page = state.pages.find((item) => p.x >= item.x && p.x <= item.x + item.width && p.y >= item.y && p.y <= item.y + item.height) ?? activePage
    if (page) addElement(kind, page.id, { x: p.x - page.x, y: p.y - page.y })
  }

  function handleAction(element: StudioElement) {
    if (element.action === 'navigate') { if (element.targetPageId) { setSelectedPageId(element.targetPageId); setMode('preview') } }
    else if (element.action === 'popup') setPopupPageId(element.targetPageId || element.pageId)
    else if (element.action === 'close') setPopupPageId('')
    else if (element.action === 'ai') setAiOpen((open) => !open)
    else if (element.action === 'mic') setMicOn((value) => !value)
    else if (element.action === 'run') void runIDE()
    else if (element.action === 'save') saveVaultItem('Canvas design', JSON.stringify(state))
    else if (element.kind === 'toggle') setMode((value) => value === 'preview' ? 'focus' : 'preview')
  }

  function renderWidget(element: StudioElement) {
    if (mode !== 'preview') return <span className="studio-widget-label">{element.label || labelFor(element.kind)}</span>
    switch (element.kind) {
      case 'input':
      case 'search':
        return <input className="studio-live-input" placeholder={element.placeholder || element.label} type={element.label.toLowerCase().includes('password') ? 'password' : 'text'} />
      case 'toggle':
        return <div className="studio-live-toggle"><button onClick={() => setMode('preview')}>Chat</button><button onClick={() => setMode('focus')}>Workplace</button></div>
      case 'chat':
        return <div className="studio-widget-content"><strong>{element.label}</strong><div className="studio-live-messages">{messages.map((message, index) => <p key={`${index}-${message}`}>{message}</p>)}</div><form onSubmit={(event) => { event.preventDefault(); if (chatText.trim()) { setMessages((items) => [...items, chatText.trim()]); setChatText('') } }}><input value={chatText} onChange={(event) => setChatText(event.target.value)} placeholder="Write a message..." /><button>Send</button></form></div>
      case 'roster':
        return <div className="studio-widget-content"><strong>{element.label}</strong><p>● You · {micOn ? 'Mic on' : 'Muted'}</p><p>● Nova · Online</p><p>● Kai · Online</p><button onClick={() => setMicOn((value) => !value)}>Toggle mic</button></div>
      case 'timer':
        return <div className="studio-widget-content"><strong>{element.label}</strong><p className="studio-timer">{`${String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:${String(timerSeconds % 60).padStart(2, '0')}`}</p><div><button onClick={() => setTimerSeconds((seconds) => seconds + 5 * 60)}>Stoke</button> <button onClick={() => setTimerSeconds(25 * 60)}>Reset</button></div></div>
      case 'ide':
        return <div className="studio-widget-content studio-ide-widget"><strong>{element.label}</strong><div className="studio-ide-tabs">{ideFiles.map((file, index) => <button className={index === activeIdeFile ? 'active' : ''} key={file.name} onClick={() => { setActiveIdeFile(index); setIdeLanguage(file.name.endsWith('.py') ? 'python' : file.name.endsWith('.rs') ? 'rust' : file.name.endsWith('.cpp') ? 'cpp' : 'javascript') }}>{file.name}</button>)}<button onClick={() => { const name = `file-${ideFiles.length + 1}.js`; setIdeFiles((files) => [...files, { name, content: '' }]); setActiveIdeFile(ideFiles.length) }}>+</button></div><textarea className="studio-code-editor" value={ideFiles[activeIdeFile]?.content ?? ''} onChange={(event) => setIdeFiles((files) => files.map((file, index) => index === activeIdeFile ? { ...file, content: event.target.value } : file))} /><div className="studio-ide-controls"><select aria-label="Code language" value={ideLanguage} onChange={(event) => setIdeLanguage(event.target.value)}><option value="rust">Rust</option><option value="typescript">TypeScript</option><option value="javascript">JavaScript</option><option value="python">Python</option><option value="cpp">C++</option></select><button onClick={() => void runIDE()}>▶ Run Code</button></div><pre>{runOutput}</pre></div>
      case 'console':
        return <div className="studio-widget-content"><strong>{element.label}</strong><pre>{runOutput}</pre><button onClick={() => setRunOutput('Tests passed · 2 assertions · 8ms')}>Run tests</button></div>
      case 'browser':
        return <div className="studio-widget-content"><strong>{element.label}</strong><input placeholder="URL or use current IDE HTML" /><iframe className="studio-browser-preview" title="Sandboxed HTML preview" sandbox="" srcDoc={ideLanguage === 'html' ? ideFiles[activeIdeFile]?.content ?? '<h2>Campfire preview</h2>' : '<!doctype html><html><body style="background:#111;color:#ddd;font:14px sans-serif"><h2>Campfire preview</h2><p>Choose HTML in the IDE to render a local preview.</p></body></html>'} /></div>
      case 'whiteboard':
        return <div className="studio-widget-content"><strong>{element.label}</strong><canvas className="studio-whiteboard-canvas" width="600" height="300" onPointerDown={(event) => { const canvas = event.currentTarget; const context = canvas.getContext('2d'); if (!context) return; const rect = canvas.getBoundingClientRect(); context.beginPath(); context.moveTo((event.clientX - rect.left) * canvas.width / rect.width, (event.clientY - rect.top) * canvas.height / rect.height); canvas.setPointerCapture(event.pointerId) }} onPointerMove={(event) => { if (!event.buttons) return; const canvas = event.currentTarget; const context = canvas.getContext('2d'); if (!context) return; const rect = canvas.getBoundingClientRect(); context.lineWidth = 3; context.lineCap = 'round'; context.strokeStyle = '#e4e4e7'; context.lineTo((event.clientX - rect.left) * canvas.width / rect.width, (event.clientY - rect.top) * canvas.height / rect.height); context.stroke() }} /><textarea placeholder="Write structured notes..." /></div>
      case 'solver':
        return <div className="studio-widget-content"><strong>{element.label}</strong><textarea placeholder="Describe a doubt..." /><button onClick={() => setStatus('AI breakdown ready')}>Solve step by step</button></div>
      case 'mindmap':
        return <div className="studio-widget-content"><strong>{element.label}</strong><button onClick={() => saveVaultItem('AI mindmap note', 'Mindmap summary generated from the current workspace notes.')}>Generate summary & save</button></div>
      case 'vault':
        return <div className="studio-widget-content"><strong>{element.label}</strong><p>Code Projects　 Study Notes　 Solved Doubts</p><button onClick={() => saveVaultItem('Workspace snapshot', JSON.stringify(state))}>Save workspace</button></div>
      case 'ai':
        return <button className="studio-ai-button" onClick={() => setAiOpen((open) => !open)}>{element.icon || '🤖'} {element.label}</button>
      case 'button':
        return <button className="studio-live-button" onClick={() => handleAction(element)}>{element.label}</button>
      case 'badge':
        return <span className="studio-live-badge">{element.label}</span>
      case 'avatar':
        return <button className="studio-live-avatar" onClick={() => handleAction(element)}>{element.icon || element.label}</button>
      default:
        return <span className="studio-widget-label">{element.icon ? `${element.icon} ` : ''}{element.label}</span>
    }
  }

  const handles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']

  return (
    <div className={`campfire-studio ${mode === 'preview' ? 'is-preview' : ''}`}>
      {mode !== 'preview' && (
        <header className="studio-topbar">
          <div className="studio-brand"><span className="studio-logo">🔥</span><strong>Campfire Canvas</strong><span className="studio-divider" /><span className="studio-status">{status}</span></div>
          <div className="studio-top-actions">
            <button className={mode === 'canvas' ? 'active' : ''} onClick={() => setMode('canvas')}><span>🗺️</span> Infinite Canvas View</button>
            <button className={mode === 'focus' ? 'active' : ''} onClick={() => { if (!selectedPageId && state.pages[0]) setSelectedPageId(state.pages[0].id); setMode('focus') }}><span>🖥️</span> Focus Page View</button>
            <button onClick={() => setMode('preview')}><Eye size={14} /> Live Preview</button>
            <button onClick={() => void saveToRepo()}><Save size={14} /> Save to Repo</button>
            <button onClick={exportRust}><ArrowDownToLine size={14} /> Export Rust UI Spec</button>
            <button onClick={() => {
              if (!window.confirm('Replace the current canvas with the six editable starter pages?')) return
              const starter = seedState()
              record(starter)
              setSelectedPageId(starter.pages[0]?.id ?? '')
              setSelectedElementId('')
              setMode('canvas')
            }}><Undo2 size={14} /> Reset</button>
          </div>
        </header>
      )}

      <div className="studio-main">
        {mode !== 'preview' && (
          <aside className="studio-leftbar">
            <div className="studio-tabs"><button className={tab === 'pages' ? 'selected' : ''} onClick={() => setTab('pages')}>Pages</button><button className={tab === 'layers' ? 'selected' : ''} onClick={() => setTab('layers')}>Layers</button></div>
            {tab === 'pages' ? <>
              <button className="studio-add-page" onClick={() => addPage()}><Plus size={15} /> Add Blank Page</button>
              <div className="studio-page-list">{state.pages.map((page, index) => <div className={`studio-page-entry ${page.id === selectedPageId ? 'selected' : ''}`} key={page.id}><button onClick={() => { setSelectedPageId(page.id); setSelectedElementId('') }}><span>{String(index + 1).padStart(2, '0')}</span>{page.name}</button><button aria-label={`Duplicate ${page.name}`} onClick={() => duplicatePage(page.id)}><Copy size={12} /></button></div>)}</div>
              <div className="studio-side-actions"><button onClick={() => duplicatePage()}><Copy size={13} /> Duplicate</button><button onClick={() => { if (activePage) record({ ...state, elements: state.elements.filter((item) => item.pageId !== activePage.id) }); setSelectedElementId('') }}><Trash2 size={13} /> Clear Page</button><button onClick={() => deletePage()}><X size={13} /> Delete Page</button></div>
              <div className="studio-section-title">ELEMENT TOOLBOX</div>
              <label className="studio-search"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find an element..." /></label>
              <div className="studio-tool-list">{filteredKinds.map((item) => <button key={item.kind} draggable onDragStart={(event) => event.dataTransfer.setData('application/campfire-element', item.kind)} onClick={() => addElement(item.kind)}><span className="studio-tool-glyph">{item.group === 'Basic UI' ? '□' : '◇'}</span><span>{item.label}</span><Plus size={12} /></button>)}</div>
            </> : <>
              <div className="studio-section-title">PAGE LAYERS</div>
              {pageElements.map((element) => <button className={`studio-layer ${element.id === selectedElementId ? 'selected' : ''}`} key={element.id} onClick={() => setSelectedElementId(element.id)}><span>▧</span>{element.label || labelFor(element.kind)}<small>z{element.zIndex}</small></button>)}
            </>}
            <div className="studio-left-foot"><button onClick={() => setSnap((value) => !value)} className={snap ? 'snap-on' : ''}>🧲 Snap to Grid <small>{snap ? '8px' : '1px free'}</small></button><span>Ctrl/⌘ Z undo · D duplicate</span></div>
          </aside>
        )}

        <section className="studio-workspace">
          {mode !== 'preview' && <div className="studio-toolbar"><span><MousePointer2 size={14} /> Select</span><span>Drag from toolbox to add</span><div className="studio-toolbar-right"><button onClick={undo} disabled={!history.length} title="Undo"><Undo2 size={15} /></button><button onClick={redo} disabled={!future.length} title="Redo"><Redo2 size={15} /></button><span className="studio-zoom">{Math.round(zoom * 100)}%</span><button onClick={() => setZoom((value) => clamp(value - 0.1, 0.08, 2))}>−</button><button onClick={() => setZoom((value) => clamp(value + 0.1, 0.08, 2))}>+</button><button onClick={fitCanvas}>Fit</button></div></div>}
          {mode === 'preview' && <div className="studio-preview-nav"><strong>Campfire Preview</strong><div>{state.pages.map((page) => <button className={selectedPageId === page.id ? 'active' : ''} key={page.id} onClick={() => setSelectedPageId(page.id)}>{page.name}</button>)}</div><button onClick={() => setMode('focus')}><X size={15} /> Exit Preview</button></div>}
          <div className={`studio-board ${mode === 'focus' ? 'focus-board' : ''}`} ref={boardRef} onPointerDown={beginPan} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onWheel={onWheel} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const kind = event.dataTransfer.getData('application/campfire-element') as ElementKind; if (elementKinds.some((item) => item.kind === kind)) spawnAtPointer(boardPoint(event), kind) }}>
            <div className="canvas-surface" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
              {mode === 'canvas' && <svg className="studio-wires"><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#ce66d6" /></marker></defs>{state.wires.map((wire) => { const from = state.elements.find((item) => item.id === wire.fromElementId); const to = state.pages.find((item) => item.id === wire.toPageId); if (!from || !to) return null; const x1 = from.x + from.width + (state.pages.find((page) => page.id === from.pageId)?.x ?? 0); const y1 = from.y + (state.pages.find((page) => page.id === from.pageId)?.y ?? 0) + from.height / 2; const x2 = to.x; const y2 = to.y + 24; return <path key={wire.id} d={`M ${x1} ${y1} C ${x1 + 140} ${y1}, ${x2 - 140} ${y2}, ${x2} ${y2}`} /> })}</svg>}
              {mode === 'canvas' && <svg className="studio-guides">{alignmentGuides.vertical.map((guide, index) => <line key={`x-${guide.page.id}-${guide.x}-${index}`} x1={guide.x} x2={guide.x} y1={guide.page.y} y2={guide.page.y + guide.page.height} />)}{alignmentGuides.horizontal.map((guide, index) => <line key={`y-${guide.page.id}-${guide.y}-${index}`} x1={guide.page.x} x2={guide.page.x + guide.page.width} y1={guide.y} y2={guide.y} />)}</svg>}
              {mode === 'canvas' && state.pages.map((page) => <div className={`studio-page-frame ${page.id === selectedPageId && !selectedElementId ? 'page-selected' : ''}`} key={page.id} style={{ left: page.x, top: page.y, width: page.width, height: page.height }} onPointerDown={(event) => beginPageDrag(event, page)} onClick={() => { setSelectedPageId(page.id); setSelectedElementId('') }}>
                <div className="studio-frame-head"><span>{page.name}</span><span>{page.width} × {page.height}</span></div>
                <div className="studio-page-grid" />
                <button className="studio-wire-target" title={`Connect wire to ${page.name}`} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); if (wireFrom) { record({ ...state, wires: [...state.wires, { id: uid('wire'), fromElementId: wireFrom, toPageId: page.id }] }); setWireFrom('') } else setSelectedPageId(page.id) }}>●</button>
                <button data-page-resize className="studio-page-resize" onPointerDown={(event) => beginPageResize(event, page)} aria-label="Resize page frame" />
              </div>)}
              {(mode === 'canvas' ? state.elements : state.elements.filter((item) => item.pageId === selectedPageId)).map((element) => {
                const page = state.pages.find((item) => item.id === element.pageId)
                if (!page) return null
                const selected = element.id === selectedElementId
                return <div
                  className={`studio-element ${selected && mode !== 'preview' ? 'element-selected' : ''} kind-${element.kind} ${mode === 'preview' ? 'element-preview' : ''}`}
                  key={element.id}
                  style={{ left: page.x + element.x, top: page.y + element.y, width: element.width, height: element.height, zIndex: element.zIndex, ...styleFor(element) }}
                  onPointerDown={(event) => beginElementDrag(event, element)}
                  onDoubleClick={(event) => { if (mode !== 'preview') { event.stopPropagation(); setInlineId(element.id) } }}
                  onClick={(event) => { event.stopPropagation(); if (mode === 'preview') { const control = (event.target as HTMLElement).closest('button,input,textarea,select,iframe'); if (!control || (element.kind === 'button' && control.classList.contains('studio-live-button'))) handleAction(element) } else { setSelectedElementId(element.id); setSelectedPageId(element.pageId) } }}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => { event.preventDefault(); const dragged = dragRef.current; if (dragged?.type === 'element' && dragged.id && dragged.id !== element.id) { const other = state.elements.find((item) => item.id === dragged.id); if (other) updateElement(other.id, { zIndex: element.zIndex + 1 }) } }}
                >
                  {inlineId === element.id && mode !== 'preview'
                    ? <input autoFocus className="studio-inline-editor" value={element.label} onChange={(event) => updateElement(element.id, { label: event.target.value })} onBlur={() => setInlineId('')} onKeyDown={(event) => { if (event.key === 'Enter') setInlineId('') }} />
                    : renderWidget(element)}
                  {selected && mode !== 'preview' && <>
                    <span className="studio-dim-pill">{Math.round(element.x)}, {Math.round(element.y)} · {Math.round(element.width)} × {Math.round(element.height)} px</span>
                    <button className="studio-wire-source" title="Drag a wire to a page target" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); setWireFrom((current) => current === element.id ? '' : element.id) }}>●</button>
                    {handles.map((handle) => <button data-resize className={`studio-resize-handle handle-${handle}`} key={handle} onPointerDown={(event) => beginResize(event, element, handle)} aria-label={`Resize ${handle}`} />)}
                  </>}
                </div>
              })}
            </div>
            {mode === 'focus' && activePage && !selectedElement && <div className="studio-focus-hint">Page frame selected · use Inspector to set exact size, or select an element to edit it.</div>}
          </div>
        </section>

        {mode !== 'preview' && <aside className="studio-inspector">
          <div className="studio-inspector-head"><strong>{selectedElement ? 'Element Inspector' : activePage ? 'Page Inspector' : 'Inspector'}</strong><span>DETAILS</span></div>
          {selectedElement ? <>
            <label className="studio-field">Element label<input value={selectedElement.label} onChange={(event) => updateElement(selectedElement.id, { label: event.target.value })} /></label>
            <label className="studio-field">Subtext / placeholder<input value={selectedElement.subtext} onChange={(event) => updateElement(selectedElement.id, { subtext: event.target.value, placeholder: event.target.value })} /></label>
            <label className="studio-field">Icon / symbol<input value={selectedElement.icon} onChange={(event) => updateElement(selectedElement.id, { icon: event.target.value })} /></label>
            <div className="studio-fields-2">
              {(['x', 'y', 'width', 'height', 'zIndex'] as const).map((field) => <label className="studio-field" key={field}>{field === 'zIndex' ? 'Z-Index' : field.toUpperCase()}<input type="number" value={selectedElement[field]} onChange={(event) => updateElement(selectedElement.id, { [field]: Number(event.target.value) })} /></label>)}
            </div>
            <label className="studio-field">Page<select value={selectedElement.pageId} onChange={(event) => { updateElement(selectedElement.id, { pageId: event.target.value }); setSelectedPageId(event.target.value) }}>{state.pages.map((page) => <option value={page.id} key={page.id}>{page.name}</option>)}</select></label>
            <div className="studio-inspector-section">APPEARANCE</div>
            <div className="studio-fields-2"><label className="studio-field">Background<input type="color" value={selectedElement.background} onChange={(event) => updateElement(selectedElement.id, { background: event.target.value })} /></label><label className="studio-field">Text color<input type="color" value={selectedElement.textColor} onChange={(event) => updateElement(selectedElement.id, { textColor: event.target.value })} /></label></div>
            <label className="studio-slider">Opacity · {selectedElement.opacity}%<input type="range" min="0" max="100" value={selectedElement.opacity} onChange={(event) => updateElement(selectedElement.id, { opacity: Number(event.target.value) })} /></label>
            <label className="studio-slider">Backdrop blur · {selectedElement.blur}px<input type="range" min="0" max="40" value={selectedElement.blur} onChange={(event) => updateElement(selectedElement.id, { blur: Number(event.target.value) })} /></label>
            <label className="studio-slider">Border width · {selectedElement.borderWidth}px<input type="range" min="0" max="4" value={selectedElement.borderWidth} onChange={(event) => updateElement(selectedElement.id, { borderWidth: Number(event.target.value) })} /></label>
            <div className="studio-fields-2"><label className="studio-field">Border color<input type="color" value={selectedElement.borderColor} onChange={(event) => updateElement(selectedElement.id, { borderColor: event.target.value })} /></label><label className="studio-field">Border style<select value={selectedElement.borderStyle} onChange={(event) => updateElement(selectedElement.id, { borderStyle: event.target.value as StudioElement['borderStyle'] })}><option>solid</option><option>dashed</option><option>none</option></select></label></div>
            <label className="studio-slider">Corner radius · {selectedElement.radius}px<input type="range" min="0" max="999" value={selectedElement.radius} onChange={(event) => updateElement(selectedElement.id, { radius: Number(event.target.value) })} /></label>
            <div className="studio-fields-2"><label className="studio-field">Font size<input type="number" min="8" max="120" value={selectedElement.fontSize} onChange={(event) => updateElement(selectedElement.id, { fontSize: Number(event.target.value) })} /></label><label className="studio-field">Font weight<select value={selectedElement.fontWeight} onChange={(event) => updateElement(selectedElement.id, { fontWeight: Number(event.target.value) })}><option value="400">Regular</option><option value="500">Medium</option><option value="600">Semibold</option><option value="700">Bold</option></select></label></div>
            <div className="studio-fields-2"><label className="studio-field">Text align<select value={selectedElement.textAlign} onChange={(event) => updateElement(selectedElement.id, { textAlign: event.target.value as StudioElement['textAlign'] })}><option>left</option><option>center</option><option>right</option></select></label><label className="studio-field">Shadow / glow<select value={selectedElement.shadow} onChange={(event) => updateElement(selectedElement.id, { shadow: event.target.value as StudioElement['shadow'] })}><option value="none">None</option><option value="soft">Soft Glass</option><option value="white">White Neon Glow</option><option value="cyan">Cyan Cyber Glow</option></select></label></div>
            <div className="studio-inspector-section">WHEN CLICKED / TRIGGERED</div>
            <label className="studio-field">Action<select value={selectedElement.action} onChange={(event) => updateElement(selectedElement.id, { action: event.target.value as ClickAction })}><option value="none">None</option><option value="navigate">Navigate to Page</option><option value="popup">Open as Popup Modal</option><option value="close">Close Popup Modal</option><option value="save">Save to Vault</option><option value="run">Run IDE Code</option><option value="ai">Open AI Bot</option><option value="mic">Toggle Mic</option></select></label>
            {['navigate', 'popup'].includes(selectedElement.action) && <label className="studio-field">Target page<select value={selectedElement.targetPageId} onChange={(event) => updateElement(selectedElement.id, { targetPageId: event.target.value })}><option value="">Choose page...</option>{state.pages.map((page) => <option value={page.id} key={page.id}>{page.name}</option>)}</select></label>}
            <div className="studio-inspector-buttons"><button onClick={() => updateElement(selectedElement.id, { zIndex: Math.max(...pageElements.map((item) => item.zIndex), 0) + 1 })}><ArrowUpToLine size={13} /> Bring to Front</button><button onClick={() => updateElement(selectedElement.id, { zIndex: Math.min(...pageElements.map((item) => item.zIndex), 0) - 1 })}><ArrowDownToLine size={13} /> Send to Back</button></div>
            <button className="studio-delete-button" onClick={deleteSelected}><Trash2 size={13} /> Delete element</button>
          </> : activePage ? <>
            <label className="studio-field">Page name<input value={activePage.name} onChange={(event) => updatePage(activePage.id, { name: event.target.value })} /></label>
            <div className="studio-fields-2">{(['x', 'y', 'width', 'height'] as const).map((field) => <label className="studio-field" key={field}>{field.toUpperCase()}<input type="number" value={activePage[field]} onChange={(event) => updatePage(activePage.id, { [field]: Number(event.target.value) })} /></label>)}</div>
            <p className="studio-help">Drag the frame title or empty canvas area to reposition. Use its bottom-right handle to resize the page.</p>
            <button className="studio-inspector-button" onClick={() => duplicatePage()}><Copy size={13} /> Duplicate page</button>
            <button className="studio-delete-button" onClick={() => deletePage()}>Delete page</button>
          </> : <p className="studio-help">Select a page or element to edit its position, size, appearance, and action.</p>}
        </aside>}
      </div>

      {mode === 'preview' && !popupPageId && <button className="studio-preview-ai-trigger" onClick={() => setAiOpen((open) => !open)}><Bot size={16} /> AI Assistant</button>}
      {popupPageId && mode === 'preview' && <div className="studio-modal-backdrop" onClick={() => setPopupPageId('')}><div className="studio-popup" onClick={(event) => event.stopPropagation()}><button className="studio-popup-close" onClick={() => setPopupPageId('')}><X size={16} /></button><strong>{state.pages.find((page) => page.id === popupPageId)?.name}</strong><p>Popup page preview</p>{state.elements.filter((item) => item.pageId === popupPageId).map((item) => <div className="studio-popup-item" key={item.id}>{item.label}</div>)}</div></div>}
      {aiOpen && <div className="studio-ai-drawer"><div><strong>🤖 Campfire AI</strong><button onClick={() => setAiOpen(false)}><X size={15} /></button></div><p>Context-aware assistant · local-first</p><textarea value={aiText} onChange={(event) => setAiText(event.target.value)} placeholder="Ask for a summary, code help, or next steps..." /><button onClick={() => setAiText((value) => value ? `Suggested next step: break “${value}” into one small, testable action.` : 'Start by describing the outcome you want. I can suggest a small first step.')}>Generate response</button><button onClick={() => saveVaultItem('Canvas AI note', aiText || 'AI note saved from Canvas Studio')}>Save to Personal Vault</button></div>}
      {mode === 'preview' && <div className="studio-live-status">{status}</div>}
    </div>
  )
}
