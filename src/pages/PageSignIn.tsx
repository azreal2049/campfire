import { useEffect, useState, type FormEvent } from 'react'
import { ArrowRight, Flame, X } from 'lucide-react'
import homepageVideo from '../../ui videos/homepage.mp4'
import { useCampfireStore } from '../store/useCampfireStore'
import type { CampfireRole } from '../types/campfire'
import './PageSignIn.css'

const motion =
  'transform-gpu transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]'

export function PageSignIn() {
  const initialName = useCampfireStore((state) => state.profile.displayName)
  const initialUsername = useCampfireStore((state) => state.profile.username)
  const initialRole = useCampfireStore((state) => state.profile.role)
  const updateProfile = useCampfireStore((state) => state.updateProfile)
  const setActivePage = useCampfireStore((state) => state.setActivePage)
  const setActiveSupplyTab = useCampfireStore((state) => state.setActiveSupplyTab)

  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [displayName, setDisplayName] = useState(initialName === 'You' ? '' : initialName)
  const [username, setUsername] = useState(initialUsername === 'you' ? '' : initialUsername)
  const [role, setRole] = useState<CampfireRole>(initialRole)

  useEffect(() => {
    if (!isAuthOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsAuthOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAuthOpen])

  function handleEnter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = displayName.trim()
    const handle = username.trim().replace(/^@+/, '')
    if (!name || !handle) return

    updateProfile({
      displayName: name,
      username: handle,
      role,
      status: 'online',
    })
    setActiveSupplyTab(role === 'developer' ? 'dev-rig' : 'solvely')
    setIsAuthOpen(false)
    setActivePage('page-lobby')
  }

  return (
    <div className="signin-page min-h-screen overflow-hidden bg-[#070709] text-white">
      <header className="fixed inset-x-0 top-0 z-30 flex h-[76px] items-center justify-between border-b border-white/[0.06] bg-[#070709]/70 px-6 backdrop-blur-2xl md:px-16">
        <a aria-label="Campfire home" className="flex items-center gap-2.5" href="#home">
          <Flame aria-hidden="true" className="text-orange-200 drop-shadow-[0_0_12px_rgba(251,146,60,0.45)]" size={20} />
          <span className="text-lg font-bold tracking-tight text-white">Campfire</span>
        </a>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-8 rounded-full border border-white/[0.06] bg-white/[0.02] px-6 py-2 text-sm font-medium text-zinc-400 md:flex"
        >
          <a className="hover:text-white transition-colors duration-200" href="#home">Home</a>
          <a className="hover:text-white transition-colors duration-200" href="#features">Features</a>
          <a className="hover:text-white transition-colors duration-200" href="#coverage">Coverage</a>
          <a className="hover:text-white transition-colors duration-200" href="#company">Company</a>
          <a className="hover:text-white transition-colors duration-200" href="#pricing">Pricing</a>
        </nav>

        <button
          className={`rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#09090B] shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:scale-[1.02] hover:bg-zinc-200 active:scale-[0.98] ${motion}`}
          onClick={() => setIsAuthOpen(true)}
          type="button"
        >
          Get started
        </button>
      </header>

      <main>
        <section
          aria-labelledby="signin-hero-title"
          className="signin-hero relative isolate flex min-h-screen items-center justify-center overflow-hidden px-6 pb-16 pt-[76px] text-center"
          id="home"
        >
          <video
            aria-hidden="true"
            autoPlay
            className="signin-hero-video absolute inset-0 -z-30 h-full w-full object-cover"
            loop
            muted
            playsInline
            poster=""
            preload="metadata"
          >
            <source src={homepageVideo} type="video/mp4" />
          </video>
          <div aria-hidden="true" className="signin-hero-shade absolute inset-0 -z-20" />
          <div aria-hidden="true" className="signin-blue-glow absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-cyan-500/10 via-blue-600/15 to-transparent blur-[120px]" />

          <div className="signin-hero-content mx-auto max-w-4xl">
            <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-cyan-100/70">
              A calmer way to make progress
            </p>
            <h1
              className="text-4xl font-bold leading-[1.1] tracking-tight text-white md:text-6xl lg:text-7xl"
              id="signin-hero-title"
            >
              Redefining Deep Work
              <br className="hidden sm:block" />
              {' '}with{' '}
              <span className="signin-word-gradient">AI-Powered Collaborative Rooms</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base font-normal leading-relaxed text-zinc-400 md:text-lg">
              The bridge between focused work and shared momentum.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                className={`group flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-[#09090B] shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:bg-zinc-200 active:scale-[0.98] ${motion}`}
                onClick={() => setIsAuthOpen(true)}
                type="button"
              >
                Enter Campfire
                <ArrowRight aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1" size={17} />
              </button>
              <a
                className={`rounded-full border border-white/[0.1] bg-white/[0.04] px-7 py-3.5 text-white hover:border-white/[0.2] hover:bg-white/[0.08] active:scale-[0.98] ${motion}`}
                href="#features"
              >
                Explore Roadmap
              </a>
            </div>
          </div>

          <span className="sr-only" id="features">Campfire brings focused rooms, shared tools, and lightweight accountability together.</span>
          <span className="sr-only" id="coverage">Designed for developers and students working together.</span>
          <span className="sr-only" id="company">Campfire is a local-first collaborative workspace.</span>
          <span className="sr-only" id="pricing">Campfire is ready to try.</span>
        </section>
      </main>

      {isAuthOpen && (
        <div
          className="signin-modal-backdrop fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 px-5 py-8 backdrop-blur-md"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsAuthOpen(false)
          }}
        >
          <section
            aria-labelledby="auth-title"
            aria-modal="true"
            className="signin-modal w-full max-w-md rounded-3xl border border-white/[0.1] bg-[#0B0B0E]/90 p-7 shadow-[0_32px_120px_rgba(0,0,0,0.9)] backdrop-blur-2xl sm:p-8"
            role="dialog"
          >
            <div className="mb-7 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm" aria-hidden="true">🔥</p>
                <h2 className="mt-3 text-xl font-semibold tracking-tight text-white" id="auth-title">
                  Make yourself at home
                </h2>
                <p className="mt-1.5 text-sm text-zinc-400">A name, a room, and a little momentum.</p>
              </div>
              <button
                aria-label="Close sign-in"
                className={`rounded-full border border-white/[0.08] p-2 text-zinc-400 hover:bg-white/[0.06] hover:text-white ${motion}`}
                onClick={() => setIsAuthOpen(false)}
                type="button"
              >
                <X aria-hidden="true" size={16} />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleEnter}>
              <label className="block">
                <span className="mb-2 block text-xs font-medium text-zinc-300">Display name</span>
                <input
                  autoComplete="name"
                  autoFocus
                  className="min-h-12 w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-white/[0.25] focus:bg-white/[0.05]"
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="What should we call you?"
                  required
                  value={displayName}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-medium text-zinc-300">Username</span>
                <div className="flex min-h-12 items-center rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 focus-within:border-white/[0.25] focus-within:bg-white/[0.05]">
                  <span className="mr-1 text-sm text-zinc-500">@</span>
                  <input
                    autoCapitalize="none"
                    autoComplete="username"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
                    onChange={(event) => setUsername(event.target.value.replace(/^@+/, '').replace(/\s/g, '').toLowerCase())}
                    placeholder="yourhandle"
                    required
                    value={username}
                  />
                </div>
              </label>

              <fieldset className="pt-1">
                <legend className="mb-2 text-xs font-medium text-zinc-300">Choose your workspace</legend>
                <div className="grid grid-cols-2 gap-2">
                  {(['developer', 'student'] as const).map((value) => (
                    <button
                      aria-pressed={role === value}
                      className={`min-h-11 rounded-xl border px-3 text-sm ${motion} ${
                        role === value
                          ? 'border-white/[0.24] bg-white/[0.08] text-white'
                          : 'border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:border-white/[0.16]'
                      }`}
                      key={value}
                      onClick={() => setRole(value)}
                      type="button"
                    >
                      {value === 'developer' ? '💻 Developer' : '🧬 Student'}
                    </button>
                  ))}
                </div>
              </fieldset>

              <button
                className={`mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#09090B] hover:bg-zinc-200 active:scale-[0.98] ${motion}`}
                type="submit"
              >
                Enter Campfire Session <ArrowRight aria-hidden="true" size={16} />
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
