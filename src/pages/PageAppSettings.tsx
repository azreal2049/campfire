import { useState } from 'react'
import { ArrowLeft, Mic, Cpu } from 'lucide-react'
import { useCampfireStore } from '../store/useCampfireStore'

export function PageAppSettings() {
  const profile = useCampfireStore((state) => state.profile)
  const updateProfile = useCampfireStore((state) => state.updateProfile)
  const setActivePage = useCampfireStore((state) => state.setActivePage)

  const [aiEndpoint, setAiEndpoint] = useState(profile.aiBaseUrl || 'http://127.0.0.1:31415/v1')
  const [aiModel, setAiModel] = useState(profile.aiModel || 'auto')

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
              onClick={() => setActivePage('page-home')}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h1 className="text-2xl font-semibold tracking-tight">App & Audio Settings</h1>
          </div>
        </div>

        <div className="space-y-6">
          {/* Audio & Voice */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
              <Mic className="h-4 w-4 text-orange-400" />
              Audio & Microphone
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-zinc-400">Input Volume</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={profile.inputVolume}
                  onChange={(e) => updateProfile({ inputVolume: Number(e.target.value) })}
                  className="mt-2 w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400">Output Volume</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={profile.outputVolume}
                  onChange={(e) => updateProfile({ outputVolume: Number(e.target.value) })}
                  className="mt-2 w-full"
                />
              </div>
            </div>
          </div>

          {/* AI Model Settings */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
              <Cpu className="h-4 w-4 text-violet-400" />
              AI Copilot & LLM Proxy
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400">Local FreeLLM Base URL Endpoint</label>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#111115] px-3 py-2 text-sm text-white outline-none focus:border-white/25"
                value={aiEndpoint}
                onChange={(e) => {
                  setAiEndpoint(e.target.value)
                  updateProfile({ aiBaseUrl: e.target.value })
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400">Model Selection</label>
              <select
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#111115] px-3 py-2 text-sm text-white outline-none focus:border-white/25"
                value={aiModel}
                onChange={(e) => {
                  setAiModel(e.target.value)
                  updateProfile({ aiModel: e.target.value })
                }}
              >
                <option value="auto">Auto (Local Ollama / LMStudio Proxy)</option>
                <option value="gpt-4o">GPT-4o (via API Key)</option>
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                <option value="deepseek-r1">DeepSeek R1 (Local)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}