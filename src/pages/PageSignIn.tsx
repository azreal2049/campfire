import { useState, type FormEvent } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useCampfireStore } from '../store/useCampfireStore'
import type { CampfireRole } from '../types/campfire'

export function PageSignIn() {
  const initialName = useCampfireStore((state) => state.profile.displayName)
  const initialUsername = useCampfireStore((state) => state.profile.username)
  const initialRole = useCampfireStore((state) => state.profile.role)
  const updateProfile = useCampfireStore((state) => state.updateProfile)
  const setActivePage = useCampfireStore((state) => state.setActivePage)
  const setActiveSupplyTab = useCampfireStore((state) => state.setActiveSupplyTab)
  const [displayName, setDisplayName] = useState(initialName === 'You' ? '' : initialName)
  const [username, setUsername] = useState(initialUsername === 'you' ? '' : initialUsername)
  const [role, setRole] = useState<CampfireRole>(initialRole)

  function handleEnter(event: FormEvent<HTMLFormElement>) {
      event.preventDefault()
      const name = displayName.trim()
      const handle = username.trim().replace(/^@+/, '')
      if (!name || !handle) return
  
      updateProfile({ displayName: name, username: handle, role, status: 'online' })
      setActiveSupplyTab(role === 'developer' ? 'dev-rig' : 'solvely')
      useCampfireStore.getState().setAuthenticated(true)
    }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <button
                  className="mx-auto mb-8 flex items-center gap-2"
                  onClick={() => setActivePage('page-home')}
                >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
            <Sparkles className="h-4 w-4 text-black" />
          </div>
          <span className="text-sm font-semibold text-white">Campfire</span>
        </button>

        {/* Card */}
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6">
          <h1 className="text-lg font-semibold text-white">Welcome back</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Choose your name and find a place to focus.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleEnter}>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-300">
                Display name
              </label>
              <input
                autoComplete="name"
                autoFocus
                className="h-10 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-sm text-white outline-none placeholder:text-neutral-600 transition-colors focus:border-white/[0.2] focus:bg-white/[0.05]"
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="What should we call you?"
                required
                value={displayName}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-300">
                Username
              </label>
              <div className="flex h-10 items-center rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 transition-colors focus-within:border-white/[0.2] focus-within:bg-white/[0.05]">
                <span className="mr-1 text-sm text-neutral-500">@</span>
                <input
                  autoCapitalize="none"
                  autoComplete="username"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-neutral-600"
                  onChange={(event) =>
                    setUsername(event.target.value.replace(/^@+/, '').replace(/\s/g, '').toLowerCase())
                  }
                  placeholder="yourhandle"
                  required
                  value={username}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-300">
                Workspace
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['developer', 'student'] as const).map((value) => (
                  <button
                    aria-pressed={role === value}
                    className={`h-10 rounded-lg border text-sm transition-colors ${
                      role === value
                        ? 'border-white/[0.2] bg-white/[0.08] text-white'
                        : 'border-white/[0.06] bg-white/[0.02] text-neutral-400 hover:border-white/[0.12]'
                    }`}
                    key={value}
                    onClick={() => setRole(value)}
                    type="button"
                  >
                    {value === 'developer' ? '💻 Developer' : '🧬 Student'}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-white text-sm font-medium text-black transition-opacity hover:opacity-90"
              type="submit"
            >
              Enter Campfire
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-neutral-500">
          By continuing, you agree to our terms of service.
        </p>
      </div>
    </div>
  )
}
