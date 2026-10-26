import { useEffect, useState, type FormEvent } from 'react'
import homepageVideo from '../../ui videos/homepage.mp4'
import { useCampfireStore } from '../store/useCampfireStore'
import type { CampfireRole } from '../types/campfire'
import './PageSignIn.css'

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

    updateProfile({ displayName: name, username: handle, role, status: 'online' })
    setActiveSupplyTab(role === 'developer' ? 'dev-rig' : 'solvely')
    setIsAuthOpen(false)
    setActivePage('page-lobby')
  }

  return (
    <main className="video-signin min-h-screen bg-black">
      <div className="video-signin-frame">
        <video
          aria-label="Campfire landing page animation"
          autoPlay
          className="video-signin-media"
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src={homepageVideo} type="video/mp4" />
        </video>

        <button
          aria-label="Get started"
          className="video-signin-hotspot video-signin-hotspot-nav"
          onClick={() => setIsAuthOpen(true)}
          type="button"
        />
        <button
          aria-label="Enter Campfire"
          className="video-signin-hotspot video-signin-hotspot-primary"
          onClick={() => setIsAuthOpen(true)}
          type="button"
        />
        <button
          aria-label="Explore roadmap"
          className="video-signin-hotspot video-signin-hotspot-secondary"
          onClick={() => setIsAuthOpen(true)}
          type="button"
        />
      </div>

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
            className="signin-modal w-full max-w-md rounded-3xl border border-white/[0.1] bg-[#0B0B0E]/90 p-7 text-white shadow-[0_32px_120px_rgba(0,0,0,0.9)] backdrop-blur-2xl sm:p-8"
            role="dialog"
          >
            <div className="mb-7 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm" aria-hidden="true">🔥</p>
                <h1 className="mt-3 text-xl font-semibold tracking-tight" id="auth-title">
                  Make yourself at home
                </h1>
                <p className="mt-1.5 text-sm text-zinc-400">A name, a room, and a little momentum.</p>
              </div>
              <button
                aria-label="Close sign-in"
                className="rounded-full border border-white/[0.08] p-2 text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white"
                onClick={() => setIsAuthOpen(false)}
                type="button"
              >
                <span aria-hidden="true">×</span>
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
                    onChange={(event) =>
                      setUsername(event.target.value.replace(/^@+/, '').replace(/\s/g, '').toLowerCase())
                    }
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
                      className={`min-h-11 rounded-xl border px-3 text-sm transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] ${
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
                className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#09090B] transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-zinc-200 active:scale-[0.98]"
                type="submit"
              >
                Enter Campfire Session <span aria-hidden="true">→</span>
              </button>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}
