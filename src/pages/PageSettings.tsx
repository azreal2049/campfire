import { ArrowLeft, Bell, ChevronRight, Globe, ShieldCheck, SlidersHorizontal, Sparkles } from 'lucide-react'
import { useCampfireStore } from '../store/useCampfireStore'

export function PageSettings() {
  const setActivePage = useCampfireStore((state) => state.setActivePage)

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#050505]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-6">
          <button
                        className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-white/[0.04] hover:text-white"
                        onClick={() => setActivePage('page-home')}
                      >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-sm font-medium">Settings</h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* Sidebar Nav */}
          <aside>
            <nav className="space-y-1">
              {['Profile', 'Notifications', 'Privacy', 'Integrations', 'Language'].map((item, i) => (
                <button
                  key={item}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    i === 0
                      ? 'bg-white/[0.06] text-white'
                      : 'text-neutral-400 hover:bg-white/[0.03] hover:text-white'
                  }`}
                >
                  {item}
                  <ChevronRight className="h-3.5 w-3.5 text-neutral-600" />
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-neutral-300">
              <SlidersHorizontal className="h-4 w-4" />
              App settings
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="mb-3 flex items-center gap-2 text-xs text-neutral-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  Integrations
                </div>
                <ul className="space-y-2 text-xs text-neutral-500">
                  <li className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-emerald-400" />
                    Local FreeLLM Proxy: http://127.0.0.1:31415/v1
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-emerald-400" />
                    Piston API: local runtime enabled
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-neutral-600" />
                    GitHub Sync: ready
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="mb-3 flex items-center gap-2 text-xs text-neutral-400">
                  <Globe className="h-3.5 w-3.5" />
                  Language
                </div>
                <p className="text-xs text-neutral-500">English / UI defaults to system language.</p>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="mb-3 flex items-center gap-2 text-xs text-neutral-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Rust bridge
                </div>
                <p className="text-xs text-neutral-500">Telemetry mode: local-first, no remote persistence.</p>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="mb-3 flex items-center gap-2 text-xs text-neutral-400">
                  <Bell className="h-3.5 w-3.5" />
                  Notifications
                </div>
                <p className="text-xs text-neutral-500">Mentions, timer alerts, and vault exports enabled.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
