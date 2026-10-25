import Editor from '@monaco-editor/react'
import {
  Check,
  Code2,
  Brain,
  Palette,
  ExternalLink,
  FileText,
  Link2,
  MonitorUp,
  Play,
  Plus,
  Share2,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { cn } from '../../../lib/cn'
import { useCampfireStore } from '../../../store/useCampfireStore'
import type { CodeLanguage, SupplyTab } from '../../../types/campfire'
import { DevRig } from './DevRig'
import { Solvely } from './Solvely'
import { Whiteboard } from './Whiteboard'

const TABS: { id: SupplyTab; label: string; icon: typeof Code2 }[] = [
  { id: 'dev-rig', label: 'Dev Rig', icon: Code2 },
  { id: 'solvely', label: 'Solvely AI', icon: Brain },
  { id: 'whiteboard', label: 'AI Whiteboard', icon: Palette },
  { id: 'scratchpad', label: 'Shared Scratchpad', icon: FileText },
  { id: 'pinned-links', label: 'Pinned Links', icon: Link2 },
  { id: 'live-stage', label: 'Live Stage', icon: MonitorUp },
]

const LANGUAGES: { id: CodeLanguage; label: string; file: string }[] = [
  { id: 'python', label: 'Python 3.12', file: 'main.py' },
  { id: 'javascript', label: 'JavaScript', file: 'main.js' },
  { id: 'typescript', label: 'TypeScript', file: 'main.ts' },
  { id: 'cpp', label: 'C++', file: 'main.cpp' },
]

interface ExecutionResult {
  stdout: string
  stderr: string
  exitCode: number
  executionMs: number
  source: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function outputText(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function exitCode(value: unknown): number {
  return typeof value === 'number' ? value : 1
}

function evaluateArithmetic(expression: string): number | null {
  const tokens = expression.match(/\d+(?:\.\d+)?|\*\*|[()+\-*/%]/g)
  if (
    !tokens ||
    tokens.join('') !== expression.replace(/\s+/g, '')
  ) {
    return null
  }

  let position = 0
  let invalid = false
  const parseExpression = (): number => {
    let result = parseTerm()
    while (tokens[position] === '+' || tokens[position] === '-') {
      const operator = tokens[position]
      position += 1
      const right = parseTerm()
      result = operator === '+' ? result + right : result - right
    }
    return result
  }
  const parseTerm = (): number => {
    let result = parsePower()
    while (
      tokens[position] === '*' ||
      tokens[position] === '/' ||
      tokens[position] === '%'
    ) {
      const operator = tokens[position]
      position += 1
      const right = parsePower()
      if (operator === '*') result *= right
      if (operator === '/') result /= right
      if (operator === '%') result %= right
    }
    return result
  }
  const parsePower = (): number => {
    const left = parsePrimary()
    if (tokens[position] !== '**') return left
    position += 1
    return left ** parsePower()
  }
  const parsePrimary = (): number => {
    const token = tokens[position]
    if (token === '+' || token === '-') {
      position += 1
      const value = parsePrimary()
      return token === '-' ? -value : value
    }
    if (token === '(') {
      position += 1
      const value = parseExpression()
      if (tokens[position] !== ')') invalid = true
      else position += 1
      return value
    }
    if (!token || !/^\d+(?:\.\d+)?$/.test(token)) {
      invalid = true
      position += 1
      return 0
    }
    position += 1
    return Number(token)
  }

  const result = parseExpression()
  return invalid || position !== tokens.length || !Number.isFinite(result)
    ? null
    : result
}

function decodeLiteral(expression: string): string | null {
  const value = expression.trim().replace(/;\s*$/, '')
  if (/^"(?:[^"\\]|\\.)*"$/.test(value)) {
    try {
      return JSON.parse(value) as string
    } catch {
      return null
    }
  }
  if (/^'(?:[^'\\]|\\.)*'$/.test(value)) {
    return value.slice(1, -1).replace(/\\(['\\])/g, '$1')
  }
  const arithmetic = evaluateArithmetic(value)
  if (arithmetic !== null) return String(arithmetic)
  if (/^(true|false|null|None|True|False)$/.test(value)) return value
  return null
}

function runLocalFallback(
  code: string,
  language: CodeLanguage,
): Pick<ExecutionResult, 'stdout' | 'stderr' | 'exitCode'> {
  const output: string[] = []
  const pattern =
    language === 'python'
      ? /^\s*print\s*\((.*)\)\s*$/
      : language === 'cpp'
        ? /^\s*std::cout\s*<<\s*(.*?)\s*;?\s*$/
        : /^\s*console\.log\s*\((.*)\)\s*;?\s*$/

  for (const line of code.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#') || line.trim().startsWith('//')) {
      continue
    }
    const match = line.match(pattern)
    if (!match) continue
    const literal = decodeLiteral(match[1])
    if (literal === null) {
      return {
        stdout: output.join('\n'),
        stderr:
          'Offline fallback supports literal print(...) and console.log(...) statements only. Reconnect to run the full program.',
        exitCode: 1,
      }
    }
    output.push(literal)
  }

  if (output.length === 0) {
    return {
      stdout: '',
      stderr:
        'Piston is unavailable. The offline fallback can evaluate literal print(...) and console.log(...) statements only.',
      exitCode: 1,
    }
  }
  return { stdout: output.join('\n'), stderr: '', exitCode: 0 }
}

async function executeWithPiston(
  code: string,
  language: CodeLanguage,
): Promise<ExecutionResult> {
  const startedAt = performance.now()
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), 12_000)
  const pistonLanguage = language === 'cpp' ? 'c++' : language
  const filename =
    LANGUAGES.find((item) => item.id === language)?.file ?? 'main.txt'

  try {
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        language: pistonLanguage,
        version: '*',
        files: [{ name: filename, content: code }],
        stdin: '',
        args: [],
        run_timeout: 5000,
      }),
    })
    if (!response.ok) {
      throw new Error(`Piston returned HTTP ${response.status}.`)
    }

    const payload: unknown = await response.json()
    if (!isRecord(payload)) {
      throw new Error('Piston returned an invalid execution result.')
    }
    const run = isRecord(payload.run) ? payload.run : null
    const compile = isRecord(payload.compile) ? payload.compile : null
    if (!run && !compile) {
      throw new Error('Piston returned no compile or run result.')
    }
    const reportedTime = run?.wall_time ?? compile?.wall_time
    return {
      stdout: outputText(run?.stdout),
      stderr: [
        outputText(compile?.stderr),
        outputText(run?.stderr),
        typeof run?.signal === 'string'
          ? `Process terminated by signal ${run.signal}.`
          : '',
      ]
        .filter(Boolean)
        .join('\n'),
      exitCode:
        run ? exitCode(run.code) : exitCode(compile?.code),
      executionMs:
        typeof reportedTime === 'number'
          ? reportedTime
          : performance.now() - startedAt,
      source: 'Piston',
    }
  } catch (error) {
    const fallback = runLocalFallback(code, language)
    const reason =
      error instanceof Error ? error.message : 'Piston could not be reached.'
    return {
      ...fallback,
      executionMs: performance.now() - startedAt,
      source: `Local fallback · ${reason}`,
    }
  } finally {
    window.clearTimeout(timeoutId)
  }
}

export function SupplyDock() {
  const rooms = useCampfireStore((state) => state.rooms)
  const activeRoomId = useCampfireStore((state) => state.activeRoomId)
  const setActiveSupplyTab = useCampfireStore(
    (state) => state.setActiveSupplyTab,
  )
  const updateCode = useCampfireStore((state) => state.updateCode)
  const setCodeLanguage = useCampfireStore((state) => state.setCodeLanguage)
  const updateScratchpad = useCampfireStore((state) => state.updateScratchpad)
  const addPinnedLink = useCampfireStore((state) => state.addPinnedLink)
  const removePinnedLink = useCampfireStore((state) => state.removePinnedLink)
  const sendMessage = useCampfireStore((state) => state.sendMessage)
  const profile = useCampfireStore((state) => state.profile)
  const updateProfile = useCampfireStore((state) => state.updateProfile)
  const room = rooms.find((item) => item.id === activeRoomId) ?? null
  const [isRunning, setIsRunning] = useState(false)
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [terminal, setTerminal] = useState<ExecutionResult | null>(null)
  const [terminalRoomId, setTerminalRoomId] = useState<string | null>(null)
  const [linkDraft, setLinkDraft] = useState('')
  const [linkError, setLinkError] = useState('')
  const screenVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (screenVideoRef.current) screenVideoRef.current.srcObject = profile.screenStream
  }, [profile.screenStream])

  const runCode = async () => {
    if (!room || isRunning) return
    setTerminalOpen(true)
    setTerminalRoomId(room.id)
    setIsRunning(true)
    if (!room.code.trim()) {
      setTerminal({
        stdout: '',
        stderr: 'Add some code before running this file.',
        exitCode: 1,
        executionMs: 0,
        source: 'Local validation',
      })
      setIsRunning(false)
      return
    }
    try {
      setTerminal(await executeWithPiston(room.code, room.codeLanguage))
    } finally {
      setIsRunning(false)
    }
  }

  const submitLink = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLinkError('')
    try {
      addPinnedLink(linkDraft)
      setLinkDraft('')
    } catch (error) {
      setLinkError(
        error instanceof Error ? error.message : 'Could not pin this link.',
      )
    }
  }

  if (!room) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-neutral-500">
        Select a campfire to open supplies.
      </div>
    )
  }

  const language =
    LANGUAGES.find((item) => item.id === room.codeLanguage) ?? LANGUAGES[0]
  const displayedTerminal = terminalRoomId === room.id ? terminal : null

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-white/[0.07] px-3 pt-2"
        role="tablist"
        aria-label="Campfire supplies"
      >
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = room.activeSupplyTab === id
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveSupplyTab(id)}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-t-lg border border-b-0 px-3 py-2 text-xs transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu active:scale-[0.97]',
                active
                  ? 'border-white/15 bg-white/[0.06] text-white'
                  : 'border-transparent text-neutral-500 hover:bg-white/[0.04] hover:text-neutral-200',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          )
        })}
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {room.activeSupplyTab === 'dev-rig' && room.workspaceFiles.length === 0 && (
          <section className="flex min-h-0 flex-1 flex-col" role="tabpanel">
            <div className="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-white/[0.07] px-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate font-mono text-xs text-neutral-400">
                  {language.file}
                </span>
                <select
                  value={room.codeLanguage}
                  onChange={(event) =>
                    setCodeLanguage(event.target.value as CodeLanguage)
                  }
                  aria-label="Programming language"
                  className="rounded-md border border-white/10 bg-[#111114] px-2 py-1 text-xs text-neutral-300 outline-none focus:border-white/25"
                >
                  {LANGUAGES.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    sendMessage(
                      `Shared ${language.file}:\n\`\`\`${room.codeLanguage}\n${room.code}\n\`\`\``,
                    )
                  }
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-neutral-300 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu active:scale-[0.97] hover:bg-white/[0.06] hover:text-white"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Share to Chat</span>
                </button>
                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => void runCode()}
                  className="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-black transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu active:scale-[0.97] hover:bg-neutral-200 disabled:cursor-wait disabled:opacity-60"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  {isRunning ? 'Running…' : 'Run Code'}
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 select-text">
              <Editor
                height="100%"
                language={room.codeLanguage}
                value={room.code}
                onChange={(value) => updateCode(value ?? '')}
                theme="vs-dark"
                options={{
                  automaticLayout: true,
                  fontFamily: '"SF Mono", "JetBrains Mono", monospace',
                  fontSize: 13,
                  lineHeight: 21,
                  lineNumbers: 'on',
                  minimap: { enabled: false },
                  padding: { top: 16, bottom: 16 },
                  scrollBeyondLastLine: false,
                  tabSize: 4,
                  wordWrap: 'on',
                }}
              />
            </div>

            <section
              className={cn(
                'flex shrink-0 flex-col overflow-hidden border-t border-white/[0.1] bg-[#09090B] transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
                terminalOpen
                  ? 'max-h-52 opacity-100'
                  : 'pointer-events-none max-h-0 border-t-0 opacity-0',
              )}
              aria-label="Terminal output"
              aria-hidden={!terminalOpen}
            >
                <div className="flex h-9 shrink-0 items-center justify-between border-b border-white/[0.07] px-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                      Terminal
                    </span>
                    {displayedTerminal && (
                      <>
                        <span
                          className={cn(
                            'rounded px-1.5 py-0.5 text-[9px] font-semibold',
                            displayedTerminal.exitCode === 0
                              ? 'bg-[#22C55E]/15 text-[#22C55E]'
                              : 'bg-[#EF4444]/15 text-[#EF4444]',
                          )}
                        >
                          {displayedTerminal.exitCode === 0
                            ? 'EXIT 0'
                            : `EXIT ${displayedTerminal.exitCode}`}
                        </span>
                        <span className="font-mono text-[10px] tabular-nums text-neutral-500">
                          {displayedTerminal.executionMs.toFixed(1)} ms
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setTerminal(null)}
                      className="rounded-md px-2 py-1 text-[10px] text-neutral-400 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu active:scale-[0.97] hover:bg-white/[0.06] hover:text-white"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => setTerminalOpen(false)}
                      aria-label="Close terminal"
                      className="rounded-md p-1 text-neutral-500 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu active:scale-[0.97] hover:bg-white/[0.06] hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <pre className="scrollbar-thin min-h-12 overflow-auto whitespace-pre-wrap px-3 py-2 font-mono text-xs leading-relaxed text-neutral-300">
                  {displayedTerminal ? (
                    <>
                      {displayedTerminal.stdout && (
                        <span className="text-neutral-200">
                          {displayedTerminal.stdout}
                          {'\n'}
                        </span>
                      )}
                      {displayedTerminal.stderr && (
                        <span className="text-red-300">
                          {displayedTerminal.stderr}
                          {'\n'}
                        </span>
                      )}
                      <span className="text-neutral-600">
                        {displayedTerminal.source}
                      </span>
                    </>
                  ) : (
                    <span className="text-neutral-500">
                      Run your program to see its output.
                    </span>
                  )}
                </pre>
            </section>
          </section>
        )}

        {room.activeSupplyTab === 'scratchpad' && (
          <section className="flex min-h-0 flex-1 flex-col p-4" role="tabpanel">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-white">
                  Shared Scratchpad
                </h2>
                <p className="mt-0.5 text-xs text-neutral-500">
                  Notes stay with this campfire.
                </p>
              </div>
              <Check className="h-4 w-4 text-[#22C55E]" aria-label="Saved" />
            </div>
            <textarea
              value={room.scratchpad}
              onChange={(event) => updateScratchpad(event.target.value)}
              placeholder="Jot down ideas, links, and next steps…"
              aria-label="Shared scratchpad notes"
              className="glass-input min-h-0 flex-1 resize-none rounded-xl p-4 font-mono text-sm leading-6 text-neutral-200 outline-none placeholder:text-neutral-600"
            />
          </section>
        )}

        {room.activeSupplyTab === 'pinned-links' && (
          <section
            className="flex min-h-0 flex-1 flex-col p-4"
            role="tabpanel"
          >
            <div className="mb-4">
              <h2 className="text-sm font-medium text-white">Pinned Links</h2>
              <p className="mt-0.5 text-xs text-neutral-500">
                Useful references shared with this room.
              </p>
            </div>
            <form onSubmit={submitLink} className="mb-3 flex gap-2">
              <input
                type="url"
                required
                value={linkDraft}
                onChange={(event) => setLinkDraft(event.target.value)}
                placeholder="https://example.com"
                aria-label="Link to pin"
                className="glass-input min-w-0 flex-1 rounded-lg px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-600"
              />
              <button
                type="submit"
                className="glass-btn-primary flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu active:scale-[0.97]"
              >
                <Plus className="h-3.5 w-3.5" />
                Pin
              </button>
            </form>
            {linkError && (
              <p className="mb-2 text-xs text-red-400" role="alert">
                {linkError}
              </p>
            )}

            <div className="scrollbar-thin min-h-0 flex-1 space-y-2 overflow-y-auto">
              {room.pinnedLinks.length === 0 ? (
                <div className="flex h-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 text-center">
                  <Link2 className="h-5 w-5 text-neutral-600" />
                  <p className="text-xs text-neutral-500">
                    No pinned links yet.
                  </p>
                </div>
              ) : (
                room.pinnedLinks.map((link) => (
                  <article
                    key={link.id}
                    className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-3"
                  >
                    <Link2 className="h-4 w-4 shrink-0 text-neutral-400" />
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="min-w-0 flex-1"
                    >
                      <span className="block truncate text-sm font-medium text-neutral-200 hover:text-white">
                        {link.title}
                      </span>
                      <span className="block truncate text-xs text-neutral-500">
                        {link.url}
                      </span>
                    </a>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open ${link.title}`}
                      className="rounded-md p-1.5 text-neutral-500 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu active:scale-[0.97] hover:bg-white/[0.06] hover:text-white"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => removePinnedLink(link.id)}
                      aria-label={`Remove ${link.title}`}
                      className="rounded-md p-1.5 text-neutral-500 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu active:scale-[0.97] hover:bg-[#EF4444]/10 hover:text-[#EF4444]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </article>
                ))
              )}

            </div>
          </section>
        )}

        {room.activeSupplyTab === 'live-stage' && (
          <section className="flex min-h-0 flex-1 flex-col p-5" role="tabpanel">
            <div className="mb-4 flex items-center justify-between">
              <div><h2 className="text-sm font-semibold text-white">Live Workspace Stream</h2><p className="mt-1 text-xs text-neutral-500">Share your screen or preview the room stage.</p></div>
              <button onClick={() => updateProfile({ simulatedStream: !profile.simulatedStream })} className={cn('rounded-lg px-3 py-2 text-xs font-semibold', profile.simulatedStream ? 'bg-emerald-500 text-black' : 'glass-btn text-white')}>{profile.simulatedStream ? 'Stop simulated stream' : 'Start simulated stream'}</button>
            </div>
            <p className="mb-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs text-neutral-400">{profile.screenSharing ? 'Browser capture is live. Stop it from the voice dock.' : profile.simulatedStream ? 'Simulated stream is live.' : 'The simulated participant stage remains available. Use the voice dock to capture a real display.'}</p>
            <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-2">
              <div className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-black/40">
                <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2 text-[11px] text-neutral-400"><span className="h-2 w-2 rounded-full bg-emerald-400" />Shared workspace · {room.name}</div>
                {profile.screenStream ? <video ref={screenVideoRef} autoPlay muted playsInline className="min-h-0 flex-1 bg-black object-contain" aria-label="Live shared screen" /> : <pre className="scrollbar-thin flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-neutral-300">{room.code || '// Your shared code will appear here.'}</pre>}
              </div>
              <div className="grid content-start gap-3 sm:grid-cols-2">
                {room.participants.map((participant) => <div key={participant.id} className={cn('rounded-xl border border-white/10 bg-white/[0.03] p-4', participant.isSpeaking && 'ring-2 ring-emerald-500/60')}>
                  <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold" style={{ backgroundColor: participant.avatarColor }}>{participant.name.slice(0, 2).toUpperCase()}</span><span className="text-sm text-white">{participant.name}</span></div>
                  <p className="mt-3 text-[10px] uppercase tracking-wider text-neutral-500">{participant.isSpeaking ? 'Speaking' : 'In the stage'}</p>
                </div>)}
              </div>
            </div>
          </section>
        )}

        {room.activeSupplyTab === 'dev-rig' && room.workspaceFiles.length > 0 && <DevRig />}
        {room.activeSupplyTab === 'solvely' && <Solvely onWhiteboard={() => {
          const currentRoom = useCampfireStore.getState().rooms.find((item) => item.id === room.id)
          if (currentRoom?.solverLesson) {
            useCampfireStore.getState().setWhiteboardMarks([
              ...currentRoom.whiteboardMarks,
              { id: crypto.randomUUID(), tool: 'text', color: '#FFFFFF', points: [{ x: 0.12, y: 0.16 }], text: currentRoom.solverLesson.question.slice(0, 72) },
              { id: crypto.randomUUID(), tool: 'rectangle', color: '#38BDF8', points: [{ x: 0.1, y: 0.2 }, { x: 0.75, y: 0.34 }] },
              { id: crypto.randomUUID(), tool: 'text', color: '#22C55E', points: [{ x: 0.13, y: 0.29 }], text: currentRoom.solverLesson.concept.slice(0, 74) },
            ])
          }
          setActiveSupplyTab('whiteboard')
        }} />}
        {room.activeSupplyTab === 'whiteboard' && <Whiteboard />}
      </div>
    </div>
  )
}
