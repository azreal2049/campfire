import Editor from '@monaco-editor/react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useCampfireStore } from '../../../store/useCampfireStore'

type DrawerTab = 'terminal' | 'problems' | 'snapshots' | 'preview'
function monotonicNow() { return performance.now() }

function codeLanguage(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase()
  if (extension === 'py') return 'python'
  if (extension === 'js') return 'javascript'
  if (extension === 'ts') return 'typescript'
  if (extension === 'cpp') return 'cpp'
  if (extension === 'html') return 'html'
  if (extension === 'css') return 'css'
  if (extension === 'json') return 'json'
  return 'markdown'
}

function offlineOutput(source: string, extension: string): { stdout: string; stderr: string; exitCode: number } {
  const outputs: string[] = []
  const pattern = extension === 'py' ? /^\s*print\((.*)\)\s*$/ : /^\s*console\.log\((.*)\)\s*;?\s*$/
  for (const line of source.split(/\r?\n/)) {
    const match = line.match(pattern)
    if (!match) continue
    const value = match[1].trim()
    if (/^(['"]).*\1$/.test(value)) outputs.push(value.slice(1, -1))
    else if (/^-?\d+(?:\.\d+)?\s*[+\-*/]\s*-?\d+(?:\.\d+)?$/.test(value)) {
      const [, left, operator, right] = value.match(/^(-?\d+(?:\.\d+)?)\s*([+\-*/])\s*(-?\d+(?:\.\d+)?)$/) ?? []
      const a = Number(left)
      const b = Number(right)
      if (operator === '/' && b === 0) return { stdout: outputs.join('\n'), stderr: 'Division by zero in offline evaluator.', exitCode: 1 }
      const result = operator === '+' ? a + b : operator === '-' ? a - b : operator === '*' ? a * b : a / b
      outputs.push(String(result))
    } else {
      return { stdout: outputs.join('\n'), stderr: 'Offline evaluator supports literal print/console.log and basic arithmetic only.', exitCode: 1 }
    }
  }
  return outputs.length
    ? { stdout: outputs.join('\n'), stderr: '', exitCode: 0 }
    : { stdout: '', stderr: 'No supported output statements found by the offline evaluator.', exitCode: 1 }
}

export function DevRig() {
  const rooms = useCampfireStore((state) => state.rooms)
  const activeRoomId = useCampfireStore((state) => state.activeRoomId)
  const updateWorkspaceFile = useCampfireStore((state) => state.updateWorkspaceFile)
  const addWorkspaceFile = useCampfireStore((state) => state.addWorkspaceFile)
  const deleteWorkspaceFile = useCampfireStore((state) => state.deleteWorkspaceFile)
  const closeWorkspaceFile = useCampfireStore((state) => state.closeWorkspaceFile)
  const setActiveFile = useCampfireStore((state) => state.setActiveFile)
  const saveSnapshot = useCampfireStore((state) => state.saveSnapshot)
  const restoreSnapshot = useCampfireStore((state) => state.restoreSnapshot)
  const sendMessage = useCampfireStore((state) => state.sendMessage)
  const room = rooms.find((item) => item.id === activeRoomId) ?? null
  const [drawerTab, setDrawerTab] = useState<DrawerTab>('terminal')
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [terminal, setTerminal] = useState('Ready. Type help for commands.')
  const [command, setCommand] = useState('')
  const [snapshotMessage, setSnapshotMessage] = useState('')
  const [audit, setAudit] = useState<string[]>([])
  const [followCursor, setFollowCursor] = useState(false)
  const [activePeers, setActivePeers] = useState(true)
  const [running, setRunning] = useState(false)
  const [runningTime, setRunningTime] = useState<number | null>(null)
  const [exitCode, setExitCode] = useState<number | null>(null)
  const [fileError, setFileError] = useState('')
  const activeFile = room?.workspaceFiles.find((file) => file.id === room.activeFileId) ?? room?.workspaceFiles[0]
  const openFiles = room?.workspaceFiles.filter((file) => room.openFileIds.includes(file.id)) ?? []
  const runRef = useRef<() => void>(() => undefined)
  useEffect(() => {
    runRef.current = () => { void run() }
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'Enter') {
        event.preventDefault()
        runRef.current()
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  if (!room || !activeFile) return <div className="flex flex-1 items-center justify-center text-sm text-neutral-500">Select a campfire to open the IDE.</div>

  async function run() {
    if (!room || !activeFile) return
    setRunning(true)
    setDrawerTab('terminal')
    setDrawerOpen(true)
    setTerminal('Running…')
    setExitCode(null)
    const started = monotonicNow()
    const extension = activeFile.name.split('.').pop()?.toLowerCase() ?? ''
    const supported = extension === 'py' ? 'python' : extension === 'js' ? 'javascript' : extension === 'ts' ? 'typescript' : extension === 'cpp' ? 'c++' : null
    if (!supported) {
      setTerminal(`Cannot execute .${extension || 'unknown'} files. Run a Python, JavaScript, TypeScript, or C++ file.`)
      setExitCode(1)
      setRunningTime(monotonicNow() - started)
      setRunning(false)
      return
    }
    try {
      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(12000),
        body: JSON.stringify({ language: supported, version: '*', files: [{ name: activeFile.name, content: activeFile.content }], stdin: '', args: [], run_timeout: 5000 }),
      })
      if (!response.ok) throw new Error(`Piston returned HTTP ${response.status}.`)
      const payload: unknown = await response.json()
      if (!payload || typeof payload !== 'object' || !('run' in payload)) throw new Error('Invalid Piston response.')
      const runResult = (payload as { run?: { stdout?: string; stderr?: string; code?: number } }).run
      if (!runResult) throw new Error('Piston did not return a run result.')
      const code = typeof runResult.code === 'number' ? runResult.code : 1
      setExitCode(code)
      setTerminal([runResult.stdout, runResult.stderr].filter(Boolean).join('\n') || (code === 0 ? 'Process completed with no output.' : 'Process failed.'))
      setRunningTime(monotonicNow() - started)
    } catch (error) {
      const output = offlineOutput(activeFile.content, extension)
      setExitCode(output.exitCode)
      setTerminal(`${output.stdout}${output.stderr ? `\n${output.stderr}` : ''}\n\nOffline fallback · ${error instanceof Error ? error.message : 'Piston unavailable'}`)
      setRunningTime(monotonicNow() - started)
    } finally {
      setRunning(false)
    }
  }

  const format = () => {
    const formatted = activeFile.content.split('\n').map((line) => line.replace(/[ \t]+$/g, '')).join('\n').replace(/\n*$/, '\n')
    updateWorkspaceFile(activeFile.id, formatted)
  }
  const runAudit = () => {
    const lines = activeFile.content.split('\n')
    const findings = [
      `Complexity hint: ${/for\s+.+\s+in|for\s*\(/.test(activeFile.content) ? 'at least O(n) from iteration; inspect nested loops for O(n²).' : 'no obvious loop; likely O(1) or input-dependent library work.'}`,
      ...(activeFile.content.includes('TODO') ? [`TODO marker at line ${lines.findIndex((line) => line.includes('TODO')) + 1}.`] : []),
      ...(activeFile.content.includes('while') && !activeFile.content.includes('break') ? ['Review loop termination; no explicit break was found.'] : []),
      ...(lines.length < 3 ? ['Very short file: add edge-case coverage and input validation.'] : ['Check empty input, boundary values, and duplicate values in tests.']),
    ]
    setAudit(findings)
    setDrawerTab('problems')
    setDrawerOpen(true)
  }
  const runCommand = (event: FormEvent) => {
    event.preventDefault()
    const value = command.trim()
    if (!value) return
    if (value === 'help') setTerminal('Commands: help · clear · python main.py · git status')
    else if (value === 'clear') setTerminal('')
    else if (value === 'git status') setTerminal(`On local room workspace\n${room.workspaceFiles.length} tracked files · ${room.snapshots.length} snapshots`)
    else if (/^(python|python3|node)\s+/.test(value)) void run()
    else setTerminal(`Unknown command: ${value}. Type help for supported commands.`)
    setCommand('')
  }
  const saveCommit = (event: FormEvent) => {
    event.preventDefault()
    if (!snapshotMessage.trim()) return
    saveSnapshot(snapshotMessage)
    setTerminal(`Snapshot saved: ${snapshotMessage.trim()}`)
    setSnapshotMessage('')
  }
  const promptNewFile = () => {
    const name = window.prompt('New file name (e.g. notes.py)')
    if (!name) return
    if (!/^[\w.-]+\.(py|js|ts|cpp|html|css|json|md)$/.test(name.trim())) {
      setFileError('Use a valid filename ending in .py, .js, .ts, .cpp, .html, .css, .json, or .md.')
      return
    }
    setFileError('')
    addWorkspaceFile(name.trim())
  }
  const showDiff = (snapshotId: string) => {
    const snapshot = room.snapshots.find((item) => item.id === snapshotId)
    if (!snapshot) return
    const changed = snapshot.files.flatMap((file) => {
      const current = room.workspaceFiles.find((item) => item.id === file.id)
      return current && current.content !== file.content ? [`--- ${file.name} (snapshot)`, `+++ ${file.name} (current)`, ...file.content.split('\n').map((line) => `- ${line}`), ...current.content.split('\n').map((line) => `+ ${line}`)] : []
    })
    setTerminal(changed.join('\n') || 'No file changes since this snapshot.')
    setDrawerTab('terminal')
    setDrawerOpen(true)
  }
  const html = room.workspaceFiles.find((file) => file.name.endsWith('.html'))?.content ?? '<!doctype html><html><head></head><body style="background:#111;color:white;font-family:sans-serif"><h2>Campfire preview</h2><p>Add an index.html to preview.</p></body></html>'
  const css = room.workspaceFiles.find((file) => file.name.endsWith('.css'))?.content ?? ''
  const js = activeFile.name.endsWith('.js') ? activeFile.content : room.workspaceFiles.find((file) => file.name.endsWith('.js'))?.content ?? ''
  const previewHtml = html.replace('</head>', `<style>${css}</style></head>`).replace('</body>', `<script>${js.replace(/<\/script/gi, '<\\/script')}</script></body>`)

  return <section className="flex min-h-0 flex-1 flex-col overflow-hidden" aria-label="Collaborative Dev Rig">
    <div className="flex min-h-0 flex-1">
      <aside className="hidden w-[190px] shrink-0 flex-col border-r border-white/[0.07] bg-[#09090B] sm:flex">
        <div className="flex items-center justify-between px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500"><span>Explorer</span><button onClick={promptNewFile} aria-label="Create file" title="New file">＋</button></div>
        {fileError && <p role="alert" className="px-2 text-[9px] text-red-300">{fileError}</p>}
        <div className="scrollbar-thin flex-1 overflow-y-auto">
          {room.workspaceFiles.map((file) => <div key={file.id} className={`group flex items-center gap-1 px-2 py-1 ${file.id === activeFile.id ? 'bg-white/[0.08]' : 'hover:bg-white/[0.04]'}`}>
            <button onClick={() => setActiveFile(file.id)} className="min-w-0 flex-1 truncate text-left text-[11px] text-neutral-300">{file.name}</button>
                  {room.workspaceFiles.length > 1 && <button onClick={() => deleteWorkspaceFile(file.id)} aria-label={`Delete ${file.name}`} className="hidden text-neutral-600 hover:text-red-400 group-hover:block">×</button>}
          </div>)}
        </div>
        <button onClick={promptNewFile} className="border-t border-white/[0.07] p-2 text-left text-[10px] text-neutral-400 hover:text-white">＋ New File</button>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex min-h-9 items-center justify-between border-b border-white/[0.07]">
          <div className="scrollbar-thin flex min-w-0 flex-1 overflow-x-auto">{openFiles.map((file) => <div key={file.id} className={`flex shrink-0 items-center gap-2 border-r border-white/[0.06] px-3 py-2 text-[11px] ${activeFile.id === file.id ? 'bg-white/[0.06] text-white' : 'text-neutral-500'}`}><button onClick={() => setActiveFile(file.id)} className="flex items-center gap-2"><span>{codeLanguage(file.name)}</span>{file.name}</button><button onClick={() => closeWorkspaceFile(file.id)} aria-label={`Close ${file.name}`} className="text-neutral-500 hover:text-white">×</button></div>)}</div>
          <div className="flex shrink-0 items-center gap-1 px-2">
            <button onClick={() => setActivePeers((value) => !value)} className={`rounded px-2 py-1 text-[10px] ${activePeers ? 'text-emerald-300' : 'text-neutral-500'}`}>👥 Collab {activePeers ? 'Live' : 'Off'}</button>
            <button onClick={() => setFollowCursor((value) => !value)} title={followCursor ? 'Stop following teammate cursor' : 'Follow teammate cursor'} className="rounded px-2 py-1 text-[10px] text-neutral-400">{followCursor ? 'Following' : 'Follow'}</button>
          </div>
        </div>
        {activePeers && <div className="flex h-7 shrink-0 items-center gap-2 border-b border-white/[0.05] px-3 text-[9px] text-neutral-500"><span className="rounded bg-violet-400/15 px-1.5 text-violet-300">Nova · L12</span><span className="rounded bg-sky-400/15 px-1.5 text-sky-300">Kai · L24</span>{followCursor && <span>Following Nova's cursor</span>}</div>}
        <div className="flex h-10 shrink-0 items-center justify-between border-b border-white/[0.07] px-2">
          <span className="truncate font-mono text-[10px] text-neutral-500">{activeFile.name}</span>
          <div className="flex gap-1">
            <button onClick={format} className="rounded px-2 py-1 text-[10px] text-neutral-300 hover:bg-white/10">⚡ Format</button>
            <button onClick={() => sendMessage(`Shared ${activeFile.name}:\n\`\`\`\n${activeFile.content}\n\`\`\``)} className="rounded px-2 py-1 text-[10px] text-neutral-300 hover:bg-white/10">🔗 Share Diff to Chat</button>
            <button onClick={() => void run()} disabled={running} className="rounded bg-white px-2 py-1 text-[10px] font-semibold text-black disabled:opacity-50">▶ {running ? 'Running…' : 'Run Code'}</button>
          </div>
        </div>
        <div className="min-h-0 flex-1">
          <Editor height="100%" language={codeLanguage(activeFile.name)} value={activeFile.content} onChange={(value) => updateWorkspaceFile(activeFile.id, value ?? '')} theme="vs-dark" options={{ automaticLayout: true, fontFamily: '"SF Mono", monospace', fontSize: 13, minimap: { enabled: false }, padding: { top: 12 }, scrollBeyondLastLine: false, wordWrap: 'on' }} />
        </div>
      </div>
    </div>
    {drawerOpen && <div className="h-[175px] shrink-0 border-t border-white/[0.08] bg-[#050507]">
      <div className="flex h-9 items-center justify-between border-b border-white/[0.07] px-2">
        <div className="flex gap-1">{([['terminal', 'Terminal Output'], ['problems', 'Problems / AI Code Review'], ['snapshots', 'Git Snapshots'], ['preview', 'Live HTML/JS Preview']] as [DrawerTab, string][]).map(([id, label]) => <button key={id} onClick={() => setDrawerTab(id)} className={`rounded px-2 py-1 text-[10px] ${drawerTab === id ? 'bg-white/10 text-white' : 'text-neutral-500'}`}>{label}</button>)}</div>
        <button onClick={() => setDrawerOpen(false)} aria-label="Close workbench" className="text-neutral-500">×</button>
      </div>
      {drawerTab === 'terminal' && <div className="flex h-[136px] flex-col p-2"><div className="flex items-center gap-2 text-[10px]"><span className={exitCode === 0 ? 'text-emerald-400' : exitCode === 1 ? 'text-red-400' : 'text-neutral-500'}>{exitCode === null ? 'READY' : `EXIT ${exitCode}`}</span>{runningTime !== null && <span className="font-mono text-neutral-500">{runningTime.toFixed(1)} ms</span>}</div><pre className="scrollbar-thin flex-1 overflow-auto whitespace-pre-wrap font-mono text-[10px] text-neutral-300">{terminal}</pre><form onSubmit={runCommand} className="flex gap-2"><span className="text-emerald-400">&gt;</span><input value={command} onChange={(event) => setCommand(event.target.value)} placeholder="help · clear · python main.py · git status" className="min-w-0 flex-1 bg-transparent font-mono text-[10px] text-white outline-none" /></form></div>}
      {drawerTab === 'problems' && <div className="scrollbar-thin h-[136px] overflow-y-auto p-2"><button onClick={runAudit} className="mb-2 rounded bg-white/10 px-2 py-1 text-[10px] text-white">🔍 Run AI Code Audit</button>{audit.map((item, index) => <button key={item} onClick={() => { const line = item.match(/line (\d+)/)?.[1]; if (line) document.querySelector('.monaco-editor textarea')?.scrollIntoView() }} className="block w-full border-t border-white/[0.06] py-1.5 text-left text-[10px] text-amber-200">⚠ {index + 1}. {item}</button>)}</div>}
      {drawerTab === 'snapshots' && <div className="flex h-[136px] gap-3 p-2"><form onSubmit={saveCommit} className="flex w-64 shrink-0 gap-1"><input value={snapshotMessage} onChange={(event) => setSnapshotMessage(event.target.value)} placeholder="Commit message" className="glass-input min-w-0 flex-1 rounded px-2 text-[10px] text-white" /><button className="rounded bg-white px-2 text-[10px] text-black">Commit Snapshot</button></form><div className="scrollbar-thin flex-1 space-y-1 overflow-y-auto">{room.snapshots.map((snapshot) => <div key={snapshot.id} className="flex items-center justify-between rounded border border-white/[0.07] px-2 py-1 text-[10px] text-neutral-300"><span>{snapshot.message} · {new Date(snapshot.createdAt).toLocaleTimeString()}</span><div className="flex gap-2"><button onClick={() => showDiff(snapshot.id)} className="text-neutral-300">Diff</button><button onClick={() => restoreSnapshot(snapshot.id)} className="text-sky-300">Restore</button></div></div>)}</div></div>}
      {drawerTab === 'preview' && <iframe title="Live HTML preview" sandbox="allow-scripts" srcDoc={previewHtml} className="h-[136px] w-full bg-white" />}
    </div>}
    {!drawerOpen && <button onClick={() => setDrawerOpen(true)} className="h-7 border-t border-white/10 text-[10px] text-neutral-400">Open Workbench</button>}
  </section>
}
