import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Pin, Reply, Send, Trash2, Users } from 'lucide-react'
import { useCampfireStore } from '../../../store/useCampfireStore'
import { UserProfilePopover } from '../UserProfilePopover'

type SidebarTab = 'chat' | 'members' | 'pins'
const QUICK_REACTIONS = ['🔥', '💯', '🚀', '🧠']

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
}

function formatMessage(content: string): ReactNode[] {
  return content.split(/(```[\s\S]*?```|`[^`\n]+`)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith('```')) {
      const source = part.slice(3, -3)
      const newline = source.indexOf('\n')
      return <pre key={index} className="scrollbar-thin my-1 overflow-x-auto rounded-lg border border-white/[0.08] bg-black/40 p-2 font-mono text-[11px] leading-relaxed text-neutral-300"><code>{newline < 0 ? source : source.slice(newline + 1)}</code></pre>
    }
    if (part.startsWith('`')) return <code key={index} className="rounded bg-white/[0.08] px-1 py-0.5 font-mono text-[11px] text-neutral-200">{part.slice(1, -1)}</code>
    return <span key={index} className="whitespace-pre-wrap">{part}</span>
  })
}

export function RightChatSidebar() {
  const rooms = useCampfireStore((state) => state.rooms)
  const activeRoomId = useCampfireStore((state) => state.activeRoomId)
  const sendMessage = useCampfireStore((state) => state.sendMessage)
  const sendReply = useCampfireStore((state) => state.sendReply)
  const toggleReaction = useCampfireStore((state) => state.toggleReaction)
  const toggleMessagePin = useCampfireStore((state) => state.toggleMessagePin)
  const deleteMessage = useCampfireStore((state) => state.deleteMessage)
  const clearMessages = useCampfireStore((state) => state.clearMessages)
  const addFuel = useCampfireStore((state) => state.addFuel)
  const resetTimer = useCampfireStore((state) => state.resetTimer)
  const updateRoom = useCampfireStore((state) => state.updateRoom)
  const setSolverQuestion = useCampfireStore((state) => state.setSolverQuestion)
  const setActiveSupplyTab = useCampfireStore((state) => state.setActiveSupplyTab)
  const profile = useCampfireStore((state) => state.profile)
  const [tab, setTab] = useState<SidebarTab>('chat')
  const [draft, setDraft] = useState('')
  const [replyTo, setReplyTo] = useState<{ author: string; content: string } | null>(null)
  const [profileCard, setProfileCard] = useState<{ name: string; color: string } | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const room = rooms.find((item) => item.id === activeRoomId) ?? null
  const pinnedMessages = room?.messages.filter((message) => message.pinned) ?? []
  const slashCommands = ['/stoke', '/solve', '/teach', '/pomodoro', '/shrug', '/code', '/clear']
  const showCommands = draft.startsWith('/') && !draft.includes(' ')

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [room?.id, room?.messages, tab])

  const submit = () => {
    const text = draft.trim()
    if (!text || !room) return
    if (text === '/stoke') {
      addFuel()
      sendMessage('🔥 Stoke! +15 minutes added to this campfire.')
    } else if (text === '/pomodoro') {
      updateRoom({ timerMode: 'pomodoro' })
      resetTimer()
      sendMessage('🍅 Pomodoro sprint started · 25:00 focus.')
    } else if (text.startsWith('/shrug')) {
      const rest = text.slice('/shrug'.length).trim()
      sendReply(`${rest ? `${rest} ` : ''}¯\\_(ツ)_/¯`, replyTo ?? undefined)
    } else if (text === '/code') {
      sendMessage(`Shared code snippet:\n\`\`\`${room.codeLanguage}\n${room.code}\n\`\`\``)
    } else if (text.startsWith('/solve ')) {
      setSolverQuestion(text.slice('/solve '.length))
      setActiveSupplyTab('solvely')
    } else if (text.startsWith('/teach ')) {
      setSolverQuestion(text.slice('/teach '.length))
      setActiveSupplyTab('whiteboard')
    } else if (text === '/solve') {
      setActiveSupplyTab('solvely')
    } else if (text === '/teach') {
      setActiveSupplyTab('whiteboard')
    } else if (text === '/clear') {
      clearMessages()
    } else if (replyTo) {
      sendReply(text, replyTo)
    } else {
      sendMessage(text)
    }
    setDraft('')
    setReplyTo(null)
  }
  const runCommand = (command: string) => { setDraft(command); if (command === '/clear') { clearMessages(); setDraft('') } }

  return (
    <div className="flex h-full w-full min-h-0 shrink-0 flex-col">
      <div className="flex h-[52px] shrink-0 items-center justify-between border-b border-white/[0.07] px-3">
        <div className="flex min-w-0 items-center gap-1">
          {([
            ['chat', `💬 Chat`],
            ['members', `👥 Members (${room?.participants.length ?? 0})`],
            ['pins', `📌 Pins (${pinnedMessages.length})`],
          ] as const).map(([id, label]) => <button key={id} onClick={() => setTab(id)} className={`rounded-md px-2 py-1.5 text-[10px] font-medium ${tab === id ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-neutral-200'}`}>{label}</button>)}
        </div>
        {tab === 'chat' && <span className="hidden items-center gap-1 text-[10px] text-neutral-500 sm:flex"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#22C55E]" />{room?.participants.length ?? 0}</span>}
      </div>

      {tab === 'chat' && <>
        <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto px-3 py-3" aria-live="polite" aria-label="Chat messages">
          {room?.messages.map((message) => <article key={message.id} className="group relative flex gap-2">
            <button type="button" onClick={() => setProfileCard({ name: message.author, color: message.avatarColor })} className={`mt-0.5 h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 text-[9px] font-semibold text-white ${profile.messageDensity === 'compact' ? 'hidden' : 'flex'}`} style={{ backgroundColor: message.avatarColor }}>{message.author.slice(0, 2).toUpperCase()}</button>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1.5"><button onClick={() => setProfileCard({ name: message.author, color: message.avatarColor })} className="text-[11px] font-semibold text-neutral-200">{message.author}</button><time dateTime={new Date(message.timestamp).toISOString()} className="font-mono text-[9px] tabular-nums text-neutral-600">{formatTime(message.timestamp)}</time></div>
              {message.replyTo && <div className="mt-1 border-l-2 border-white/20 pl-2 text-[10px] text-neutral-500">↩ {message.replyTo.author}: {message.replyTo.content.slice(0, 90)}</div>}
              <div style={{ fontSize: `${profile.fontScale}px` }} className="mt-0.5 break-words leading-relaxed text-neutral-400">{formatMessage(message.content)}</div>
              {!!message.reactions?.length && <div className="mt-1 flex flex-wrap gap-1">{message.reactions.map((reaction) => <button key={reaction.emoji} onClick={() => toggleReaction(message.id, reaction.emoji)} className={`rounded-full border px-1.5 py-0.5 text-[10px] ${reaction.reacted ? 'border-white/30 bg-white/10' : 'border-white/10 bg-white/[0.03]'}`}>{reaction.emoji} {reaction.count}</button>)}</div>}
            </div>
            <div className="absolute right-0 top-0 hidden items-center gap-0.5 rounded-lg border border-white/10 bg-[#17171B] p-1 shadow-xl group-hover:flex group-focus-within:flex">
              {QUICK_REACTIONS.map((emoji) => <button key={emoji} title={`React ${emoji}`} onClick={() => toggleReaction(message.id, emoji)} className="rounded px-1 text-xs hover:bg-white/10">{emoji}</button>)}
              <button title="Reply" onClick={() => setReplyTo({ author: message.author, content: message.content })} className="rounded p-1 text-neutral-300 hover:bg-white/10"><Reply className="h-3 w-3" /></button>
              <button title={message.pinned ? 'Unpin' : 'Pin'} onClick={() => toggleMessagePin(message.id)} className={`rounded p-1 hover:bg-white/10 ${message.pinned ? 'text-amber-300' : 'text-neutral-300'}`}><Pin className="h-3 w-3" /></button>
              {message.author === profile.displayName && <button title="Delete" onClick={() => deleteMessage(message.id)} className="rounded p-1 text-neutral-300 hover:bg-red-500/20 hover:text-red-400"><Trash2 className="h-3 w-3" /></button>}
            </div>
          </article>)}
          {room && room.messages.length === 0 && <p className="py-8 text-center text-xs text-neutral-600">Start the conversation.</p>}
          <div ref={bottomRef} />
        </div>
        <form className="relative shrink-0 border-t border-white/[0.07] p-3" onSubmit={(event) => { event.preventDefault(); submit() }}>
          {replyTo && <div className="mb-2 flex items-center justify-between rounded-lg bg-white/[0.05] px-2 py-1.5 text-[10px] text-neutral-400"><span>Replying to @{replyTo.author}</span><button type="button" onClick={() => setReplyTo(null)}>×</button></div>}
          {showCommands && <div className="absolute bottom-[calc(100%-4px)] left-3 right-3 rounded-xl border border-white/10 bg-[#111114] p-1 shadow-2xl">{slashCommands.filter((command) => command.startsWith(draft)).map((command) => <button key={command} type="button" onClick={() => runCommand(command)} className="block w-full rounded-md px-3 py-2 text-left font-mono text-xs text-neutral-200 hover:bg-white/10">{command}</button>)}</div>}
          <div className="glass-input flex items-center gap-2 rounded-xl px-2 py-1.5"><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={room ? 'Message this campfire…' : 'Select a campfire'} aria-label="Chat message" disabled={!room} className="min-w-0 flex-1 select-text bg-transparent px-1 py-1 text-sm text-white outline-none placeholder:text-neutral-600 disabled:cursor-not-allowed" /><button type="submit" disabled={!room || !draft.trim()} className="rounded-lg border border-white/10 bg-white/[0.08] p-1.5 text-white hover:bg-white/[0.15] disabled:opacity-30" aria-label="Send message"><Send className="h-3.5 w-3.5" /></button></div>
          {room?.timerMode === 'deadman' && <p className="mt-1.5 text-[10px] text-neutral-600">Chat activity adds 5m fuel.</p>}
        </form>
      </>}
      {tab === 'members' && <div className="scrollbar-thin flex-1 overflow-y-auto p-3">
        <p className="mb-2 px-1 text-[10px] font-bold tracking-wider text-neutral-500">👑 FLAME KEEPER (HOST) — 1</p>
        {room?.participants.slice(0, 1).map((person) => <Member key={person.id} name={person.name} color={person.avatarColor} status={person.status} activity="Hosting this campfire" role="Host" onSelect={() => setProfileCard({ name: person.name, color: person.avatarColor })} />)}
        {room && <Roster roomId={room.id} participants={room.participants} onSelect={(person) => setProfileCard({ name: person.name, color: person.avatarColor })} />}
      </div>}
      {tab === 'pins' && <div className="scrollbar-thin flex-1 space-y-2 overflow-y-auto p-3">{pinnedMessages.length ? pinnedMessages.map((message) => <div key={message.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-3"><p className="mb-1 text-[10px] font-semibold text-neutral-300">{message.author}</p><p className="whitespace-pre-wrap break-words text-xs text-neutral-400">{message.content}</p></div>) : <p className="py-8 text-center text-xs text-neutral-600"><Users className="mx-auto mb-2 h-4 w-4" />No pinned messages yet.</p>}</div>}
      {profileCard && <UserProfilePopover name={profileCard.name} color={profileCard.color} onClose={() => setProfileCard(null)} />}
    </div>
  )
}

function Member({ name, color, activity, role, status, onSelect }: { name: string; color: string; activity: string; role: string; status?: 'online' | 'idle' | 'dnd' | 'invisible'; onSelect: () => void }) {
  const dot = status === 'idle' ? 'bg-[#F59E0B]' : status === 'dnd' ? 'bg-[#EF4444]' : status === 'invisible' ? 'bg-[#71717A]' : 'bg-[#22C55E]'
  return <button onClick={onSelect} className="flex w-full items-center gap-2 rounded-lg px-1 py-2 text-left hover:bg-white/[0.04]"><span className="relative flex h-8 w-8 items-center justify-center rounded-full text-[9px] font-semibold text-white" style={{ backgroundColor: color }}>{name.slice(0, 2).toUpperCase()}<span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#0B0B0E] ${dot}`} /></span><span className="min-w-0 flex-1"><span className="block truncate text-xs text-neutral-200">{name} <span className="text-[9px] text-neutral-500">{role}</span></span><span className="block truncate text-[10px] text-neutral-500">{activity}</span></span></button>
}

function Roster({ roomId, participants, onSelect }: { roomId: string; participants: { id: string; name: string; avatarColor: string; status?: 'online' | 'idle' | 'dnd' | 'invisible'; isSpeaking: boolean; isMuted: boolean }[]; onSelect: (person: { name: string; avatarColor: string }) => void }) {
  const others = participants.slice(1)
  const online = others.filter((person) => !person.status || person.status === 'online' || person.status === 'dnd')
  const idle = others.filter((person) => person.status === 'idle' || person.status === 'invisible')
  const render = (list: typeof others) => list.map((person, index) => <Member key={`${roomId}-${person.id}`} name={person.name} color={person.avatarColor} status={person.status} activity={person.isMuted ? 'Voice · Muted' : person.isSpeaking ? 'In Voice · Speaking' : index % 2 ? 'Editing main.py' : 'In Voice · Brown Noise'} role={index % 2 ? 'Dev' : 'Scholar'} onSelect={() => onSelect(person)} />)
  return <>
    <p className="mb-2 mt-4 px-1 text-[10px] font-bold tracking-wider text-neutral-500">🟢 LOCKED IN — {online.length}</p>{render(online)}
    <p className="mb-2 mt-4 px-1 text-[10px] font-bold tracking-wider text-neutral-500">🌙 IDLE / AFK — {idle.length}</p>{render(idle)}
  </>
}
