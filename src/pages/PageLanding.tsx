import { ArrowRight, Search, Sparkles } from 'lucide-react'
import { useCampfireStore } from '../store/useCampfireStore'

const components = [
  { name: 'Button', category: 'Primitives', description: 'Accessible button with variants' },
  { name: 'Card', category: 'Layout', description: 'Flexible content container' },
  { name: 'Dialog', category: 'Overlay', description: 'Modal dialog with focus trap' },
  { name: 'Input', category: 'Form', description: 'Text input with validation' },
  { name: 'Select', category: 'Form', description: 'Dropdown selection menu' },
  { name: 'Table', category: 'Data', description: 'Sortable data table' },
  { name: 'Tabs', category: 'Navigation', description: 'Tabbed content panels' },
  { name: 'Toast', category: 'Feedback', description: 'Notification toasts' },
  { name: 'Tooltip', category: 'Overlay', description: 'Contextual hover info' },
  { name: 'Avatar', category: 'Display', description: 'User profile images' },
  { name: 'Badge', category: 'Display', description: 'Status indicators' },
  { name: 'Skeleton', category: 'Feedback', description: 'Loading placeholders' },
]

const categories = ['All', 'Primitives', 'Layout', 'Form', 'Overlay', 'Navigation', 'Data', 'Display', 'Feedback']

export function PageLanding() {
  const setActivePage = useCampfireStore((state) => state.setActivePage)

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#050505]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <a href="#" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white">
                <Sparkles className="h-4 w-4 text-black" />
              </div>
              <span className="text-sm font-semibold tracking-tight">Campfire</span>
            </a>
            <nav className="hidden items-center gap-6 text-sm text-neutral-400 md:flex">
              <a href="#components" className="transition-colors hover:text-white">Components</a>
              <a href="#templates" className="transition-colors hover:text-white">Templates</a>
              <a href="#docs" className="transition-colors hover:text-white">Docs</a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button className="hidden items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-neutral-400 transition-colors hover:border-white/[0.15] hover:text-white md:flex">
              <Search className="h-3.5 w-3.5" />
              Search components...
              <kbd className="ml-4 rounded border border-white/[0.1] px-1.5 py-0.5 text-[10px] text-neutral-500">⌘K</kbd>
            </button>
            <button
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90"
              onClick={() => setActivePage('page-signin')}
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.15),transparent)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 text-center md:py-32">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-xs text-neutral-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            v2.0 — New components added
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
            Build your workspace with
            <span className="bg-gradient-to-r from-white via-neutral-300 to-neutral-500 bg-clip-text text-transparent"> beautiful components</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-neutral-400 md:text-lg">
            A focused space to study, build, and make meaningful progress — together. Start your session now.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              className="group inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-black transition-all hover:opacity-90"
              onClick={() => setActivePage('page-signin')}
            >
              Enter Campfire
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-white/[0.1] bg-white/[0.03] px-6 py-3 text-sm text-white transition-colors hover:border-white/[0.2] hover:bg-white/[0.06]"
              onClick={() => setActivePage('page-signin')}
            >
              Browse Rooms
            </button>
          </div>
        </div>
      </section>

      {/* Components Grid */}
      <section className="mx-auto max-w-7xl px-6 py-16" id="components">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Components</h2>
            <p className="mt-1 text-sm text-neutral-400">Explore the building blocks of your workspace</p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat, i) => (
            <button
              key={cat}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                i === 0
                  ? 'bg-white text-black'
                  : 'border border-white/[0.08] bg-white/[0.02] text-neutral-400 hover:border-white/[0.15] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {components.map((component) => (
            <button
              key={component.name}
              className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-left transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
              onClick={() => setActivePage('page-signin')}
            >
              <div className="mb-4 flex h-24 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02]">
                <div className="h-8 w-16 rounded-md border border-white/[0.1] bg-white/[0.05]" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{component.name}</span>
                <span className="rounded-full border border-white/[0.08] px-2 py-0.5 text-[10px] text-neutral-500">
                  {component.category}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-neutral-500">{component.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Ready to focus?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-neutral-400">
            Join a room, set your timer, and work alongside others in a distraction-free environment.
          </p>
          <button
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90"
            onClick={() => setActivePage('page-signin')}
          >
            Start a Session
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 text-xs text-neutral-500">
          <span>© 2026 Campfire</span>
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-white">Privacy</a>
            <a href="#" className="transition-colors hover:text-white">Terms</a>
            <a href="#" className="transition-colors hover:text-white">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
