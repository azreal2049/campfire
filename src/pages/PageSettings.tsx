import { Bell, ChevronRight, Globe, ShieldCheck, SlidersHorizontal, Sparkles } from 'lucide-react'

export function PageSettings() {
  return (
    <main className="min-h-screen bg-[#070709] text-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Settings</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">User & app settings</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
          <aside className="rounded-3xl border border-white/10 bg-[#111115] p-4">
            <div className="space-y-2">
              {['Profile', 'Notifications', 'Privacy'].map((item) => (
                <button className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-left text-sm text-zinc-200" key={item} type="button">
                  {item}
                  <ChevronRight className="h-4 w-4 text-zinc-500" />
                </button>
              ))}
            </div>
          </aside>

          <section className="space-y-6 rounded-3xl border border-white/10 bg-[#111115] p-5">
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <SlidersHorizontal className="h-4 w-4 text-orange-200" />
              App settings
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-[#0b0b0d] p-4">
                <div className="mb-2 flex items-center gap-2 text-sm text-zinc-300"><Sparkles className="h-4 w-4" /> Integrations</div>
                <ul className="space-y-2 text-sm text-zinc-400">
                  <li>Local FreeLLM Proxy: http://127.0.0.1:31415/v1</li>
                  <li>Piston API: local runtime enabled</li>
                  <li>GitHub Sync: ready</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0b0b0d] p-4">
                <div className="mb-2 flex items-center gap-2 text-sm text-zinc-300"><Globe className="h-4 w-4" /> Language</div>
                <p className="text-sm text-zinc-400">English / UI defaults to system language.</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0b0b0d] p-4">
                <div className="mb-2 flex items-center gap-2 text-sm text-zinc-300"><ShieldCheck className="h-4 w-4" /> Rust bridge</div>
                <p className="text-sm text-zinc-400">Telemetry mode: local-first, no remote persistence.</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0b0b0d] p-4">
                <div className="mb-2 flex items-center gap-2 text-sm text-zinc-300"><Bell className="h-4 w-4" /> Notifications</div>
                <p className="text-sm text-zinc-400">Mentions, timer alerts, and vault exports enabled.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
