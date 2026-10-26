import { useState, type FormEvent } from 'react'
import { ArrowRight, Flame } from 'lucide-react'
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
    setActivePage('page-lobby')
  }

  return (
    <main className="signin-page relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070709] px-5 py-12 text-white">
      <div aria-hidden="true" className="signin-atmosphere absolute inset-0" />
      <section className="signin-card relative w-full max-w-[420px] rounded-3xl border border-white/[0.1] bg-[#0B0B0E]/90 p-7 shadow-[0_32px_100px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl sm:p-9">
        <a
          className="mx-auto flex w-fit items-center gap-2 text-sm font-semibold tracking-tight text-white"
          href="#home"
          onClick={(event) => {
            event.preventDefault()
            setActivePage('page-0')
          }}
        >
          <Flame aria-hidden="true" className="text-orange-200" size={18} />
          Campfire
        </a>
        <h1 className="mt-8 text-center text-2xl font-semibold tracking-tight">
          Welcome to Campfire
        </h1>
        <p className="mt-2 text-center text-sm leading-6 text-zinc-400">
          Choose your name and find a place to focus.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleEnter}>
          <label className="block">
            <span className="mb-2 block text-xs font-medium text-zinc-300">Display name</span>
            <input
              autoComplete="name"
              autoFocus
              className="signin-field min-h-12 w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-white/[0.25] focus:bg-white/[0.05]"
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="What should we call you?"
              required
              value={displayName}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-medium text-zinc-300">Username</span>
            <div className="signin-field flex min-h-12 items-center rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 focus-within:border-white/[0.25] focus-within:bg-white/[0.05]">
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
                  className={`signin-field min-h-11 rounded-xl border px-3 text-sm ${
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
            className="signin-field mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#09090B] hover:bg-zinc-200"
            type="submit"
          >
            Enter Campfire <ArrowRight aria-hidden="true" size={16} />
          </button>
        </form>
      </section>
    </main>
  )
}
