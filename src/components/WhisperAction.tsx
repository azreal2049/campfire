import { useState } from 'react'
import { Mic, Send } from 'lucide-react'
import { useCampfireStore } from '../store/useCampfireStore'
import { runOfflineSnippet } from '../utils/offlineCodeRunner'

interface RecognitionResultEvent {
  results: ArrayLike<ArrayLike<{ transcript: string }>>
}

interface SpeechRecognizer {
  continuous: boolean
  interimResults: boolean
  onresult: ((event: RecognitionResultEvent) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognizerConstructor = new () => SpeechRecognizer
type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognizerConstructor
  webkitSpeechRecognition?: SpeechRecognizerConstructor
}

export function WhisperAction() {
  const [command, setCommand] = useState('')
  const [listening, setListening] = useState(false)
  const [voiceError, setVoiceError] = useState('')
  const setPendingWorkplaceTool = useCampfireStore((state) => state.setPendingWorkplaceTool)
  const setActivePage = useCampfireStore((state) => state.setActivePage)
  const setBurnTimerSeconds = useCampfireStore((state) => state.setBurnTimerSeconds)
  const dispatchAgent = useCampfireStore((state) => state.dispatchAgent)
  const setWhiteboardText = useCampfireStore((state) => state.setWhiteboardText)
  const showToast = useCampfireStore((state) => state.showToast)
  const ideCode = useCampfireStore((state) => state.ideCode)
  const stokeFuel = useCampfireStore((state) => state.stokeFuel)
  const verifySparkContract = useCampfireStore((state) => state.verifySparkContract)

  const executeCommand = (rawCommand: string) => {
    const text = rawCommand.trim()
    if (!text) return
    const lower = text.toLowerCase()
    const timerMatch = lower.match(/add timer\s+(\d+)\s*(minutes?|mins?|m)?/)
    if (timerMatch) {
      const minutes = Number(timerMatch[1])
      setBurnTimerSeconds(useCampfireStore.getState().burnTimer.secondsRemaining + minutes * 60)
      showToast(`Added ${minutes} minutes to the timer`)
    } else if (lower.includes('generate mindmap')) {
      void dispatchAgent('study')
      showToast('Generating a study pack and mindmap')
    } else if (lower.includes('run code')) {
      setPendingWorkplaceTool('ide')
      setActivePage('page-workplace')
      stokeFuel()
      try {
        const output = runOfflineSnippet(ideCode)
        verifySparkContract()
        showToast(`Offline run passed: ${output}`)
      } catch (error) {
        showToast(`Offline run not supported: ${error instanceof Error ? error.message : 'check the editor'}`)
      }
    } else {
      const existing = useCampfireStore.getState().whiteboardText
      setWhiteboardText(`${existing}\n\n${text}`.trim())
      setPendingWorkplaceTool('study')
      setActivePage('page-workplace')
      showToast('Whisper added to the Common Whiteboard')
    }
    setCommand('')
  }

  const startListening = () => {
    const speechWindow = window as SpeechWindow
    const Constructor = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition
    if (!Constructor) {
      setVoiceError('Speech recognition is unavailable here. Type a command instead.')
      return
    }
    const recognition = new Constructor()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? ''
      setCommand(transcript)
      setListening(false)
      setVoiceError('')
      executeCommand(transcript)
    }
    recognition.onerror = () => {
      setListening(false)
      setVoiceError('Could not recognize speech. You can type the command below.')
    }
    recognition.onend = () => setListening(false)
    setVoiceError('')
    setListening(true)
    try {
      recognition.start()
    } catch (error) {
      setListening(false)
      setVoiceError(error instanceof Error ? `Speech recognition failed: ${error.message}` : 'Speech recognition could not start.')
    }
  }

  return (
    <section className="mt-6 border border-white/[0.09] bg-white/[0.02] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-[12px] font-medium text-white">🎙️ Whisper Action</h3>
          <p className="mt-1 text-[11px] text-zinc-500">Say “Generate mindmap”, “Run code”, or “Add timer 10 minutes”.</p>
        </div>
        <button type="button" onClick={startListening} disabled={listening} aria-label="Start voice command" className="flex h-9 w-9 items-center justify-center border border-white/[0.12] text-zinc-300 transition-colors hover:bg-white/[0.06] disabled:text-amber-300">
          <Mic className={`h-4 w-4 ${listening ? 'animate-pulse text-amber-300' : ''}`} />
        </button>
      </div>
      <form onSubmit={(event) => { event.preventDefault(); executeCommand(command) }} className="flex gap-2">
        <input value={command} onChange={(event) => setCommand(event.target.value)} aria-label="Whisper command" placeholder={listening ? 'Listening…' : 'Type a voice command…'} className="h-9 min-w-0 flex-1 border border-white/[0.1] bg-[#080808] px-3 text-[12px] text-white outline-none placeholder:text-zinc-600 focus:border-white/30" />
        <button type="submit" className="flex h-9 items-center gap-1.5 border border-white/[0.12] px-3 text-[11px] text-zinc-300 hover:bg-white/[0.05]"><Send className="h-3 w-3" /> Run</button>
      </form>
      {voiceError && <p role="status" className="mt-2 text-[10px] text-amber-200">{voiceError}</p>}
    </section>
  )
}
