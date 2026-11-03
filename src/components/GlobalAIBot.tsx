import { useEffect, useMemo, useState } from 'react'
import { Bot, Sparkles, X } from 'lucide-react'
import { useCampfireStore } from '../store/useCampfireStore'

const DEFAULT_ASSISTANT = `I can help you organize the room, summarize the current workspace, and turn any idea into actionable next steps.`

function localFallbackAnswer(prompt: string, page: string) {
  const trimmed = prompt.trim()
  const lower = trimmed.toLowerCase()

  if (!trimmed) {
    return DEFAULT_ASSISTANT
  }

  if (lower.includes('code') || lower.includes('debug') || lower.includes('refactor')) {
    return `I can help with the code path. Start by naming the file, the failing behavior, and the expected result. I’ll turn that into a compact fix plan and test cases.`
  }

  if (lower.includes('flashcard') || lower.includes('study') || lower.includes('mindmap')) {
    return `Create a 5-card review set: 1) key concept, 2) key formula, 3) worked example, 4) common trap, 5) one-sentence summary. I can also turn it into a quick mindmap.`
  }

  if (lower.includes('script') || lower.includes('hook') || lower.includes('meeting')) {
    return `Use a 3-part structure: opener, core point, call to action. I can draft a tighter script or compress a meeting recap into action items.`
  }

  return `I’m in ${page}. The first step is to identify the specific outcome, then I’ll break it down into a small action plan and a polished output you can use immediately.`
}

export function GlobalAIBot() {
  const [open, setOpen] = useState(false)
  const [prompt, setPrompt] = useState('Summarize the current room and suggest the next best step.')
  const [response, setResponse] = useState(DEFAULT_ASSISTANT)
  const [isThinking, setIsThinking] = useState(false)

  const activePage = useCampfireStore((state) => state.activePage)
  const profile = useCampfireStore((state) => state.profile)

  useEffect(() => {
    const onKeydown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'j') {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }

    window.addEventListener('keydown', onKeydown)
    return () => window.removeEventListener('keydown', onKeydown)
  }, [])

  const pageLabel = useMemo(() => {
    switch (activePage) {
      case 'page-chat':
        return 'Chat'
      case 'page-workplace':
        return 'Workplace'
      case 'page-vault':
        return 'Vault'
      case 'page-settings':
        return 'Settings'
      case 'page-lobby':
        return 'Lobby'
      default:
        return 'Sign in'
    }
  }, [activePage])

  async function handleAsk() {
    setIsThinking(true)

    try {
      const endpoint = profile.aiBaseUrl || 'http://127.0.0.1:31415/v1/chat/completions'
      const payload = {
        model: profile.aiModel || 'auto',
        messages: [
          {
            role: 'system',
            content: `You are Campfire AI. Stay context-aware to the current page: ${pageLabel}.`,
          },
          { role: 'user', content: prompt },
        ],
      }

      const responseFromApi = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (responseFromApi.ok) {
        const data = await responseFromApi.json()
        const text = data?.choices?.[0]?.message?.content ?? localFallbackAnswer(prompt, pageLabel)
        setResponse(text)
        return
      }
    } catch {
      // offline fallback is intentional and explicit below.
    }

    setResponse(localFallbackAnswer(prompt, pageLabel))
    setIsThinking(false)
  }

  async function saveToVault() {
    const safeText = response.trim() || DEFAULT_ASSISTANT
    const saved = {
      id: `ai-${Date.now()}`,
      title: `AI note · ${pageLabel}`,
      kind: 'note',
      content: safeText,
      savedAt: new Date().toISOString(),
    }

    const existing = JSON.parse(localStorage.getItem('campfire-vault-ai') ?? '[]') as Record<string, unknown>[]
    localStorage.setItem('campfire-vault-ai', JSON.stringify([saved, ...existing]))
    setResponse(`Saved to Personal Vault: ${saved.title}`)
  }

  return (
    <>
      {!open ? (
        <button
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full border border-white/15 bg-[#111115] px-4 py-2.5 text-sm font-medium text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition hover:border-white/25"
          onClick={() => setOpen(true)}
          type="button"
        >
          <Bot className="h-4 w-4 text-orange-200" />
          AI Bot
        </button>
      ) : null}

      {open ? (
        <div className="fixed bottom-5 right-5 z-50 w-[360px] overflow-hidden rounded-2xl border border-white/10 bg-[#09090c]/95 text-white shadow-[0_30px_80px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-orange-200" />
              <span className="text-sm font-semibold">Campfire AI</span>
            </div>
            <button className="rounded-full p-1 text-zinc-400 hover:bg-white/5 hover:text-white" onClick={() => setOpen(false)} type="button" aria-label="Close AI bot">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3 p-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-zinc-400">
              Context: <span className="font-medium text-zinc-200">{pageLabel}</span>
            </div>

            <textarea
              className="min-h-[90px] w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-white/20"
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Ask Campfire AI to summarize, refactor, or scaffold..."
              value={prompt}
            />

            <div className="flex gap-2">
              <button
                className="flex-1 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-[#09090B] hover:bg-zinc-200"
                onClick={handleAsk}
                type="button"
                disabled={isThinking}
              >
                {isThinking ? 'Thinking…' : 'Ask AI'}
              </button>
              <button
                className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-white/[0.06]"
                onClick={saveToVault}
                type="button"
              >
                Save to Vault
              </button>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0f1014] p-3">
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">AI output</p>
              <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-200">{response}</p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
