import { useState, type FormEvent } from 'react'
import { useCampfireStore } from '../store/useCampfireStore'
import type { CampfireRole } from '../types/campfire'

const interactiveMotion =
  'transform-gpu transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]'

export function PageSignIn() {
  const initialDisplayName = useCampfireStore((state) => state.profile.displayName)
  const initialUsername = useCampfireStore((state) => state.profile.username)
  const initialRole = useCampfireStore((state) => state.profile.role)
  const updateProfile = useCampfireStore((state) => state.updateProfile)
  const setActivePage = useCampfireStore((state) => state.setActivePage)
  const setActiveSupplyTab = useCampfireStore((state) => state.setActiveSupplyTab)

  const [displayName, setDisplayName] = useState(initialDisplayName === 'You' ? '' : initialDisplayName)
  const [username, setUsername] = useState(initialUsername === 'you' ? '' : initialUsername)
  const [workspaceCode, setWorkspaceCode] = useState('')
  const [role, setRole] = useState<CampfireRole>(initialRole)
  const [showWorkspaceCode, setShowWorkspaceCode] = useState(false)

  function enterCampfire(event?: FormEvent<HTMLFormElement>, allowGuestFallback = false) {
    event?.preventDefault()

    const trimmedName = displayName.trim() || (allowGuestFallback ? 'Guest' : '')
    const normalizedUsername =
      username.trim().replace(/^@+/, '') ||
      (allowGuestFallback ? trimmedName.toLowerCase().replace(/[^a-z0-9_]/g, '') || 'guest' : '')
    if (!trimmedName || !normalizedUsername) return

    updateProfile({
      displayName: trimmedName,
      username: normalizedUsername,
      role,
      status: 'online',
    })
    setActiveSupplyTab(role === 'developer' ? 'dev-rig' : 'solvely')
    setActivePage('page-lobby')
  }

  return (
    <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-5 py-12 before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(ellipse_at_50%_45%,rgba(255,255,255,0.07),transparent_52%)] sm:px-6">
      <div className="w-full max-w-[420px] rounded-[28px] border border-white/[0.08] bg-[#0B0B0E]/85 p-7 shadow-[0_24px_80px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-2xl sm:p-9">
        <header className="mb-8 text-center">
          <span className="text-2xl" aria-hidden="true">🔥</span>
          <h1 className="mt-4 text-[26px] font-semibold tracking-[-0.04em] text-[#F4F4F6]">
            Welcome to Campfire
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#71717A]">
            Settle in, find your focus, and get started.
          </p>
        </header>

        <form className="space-y-4" onSubmit={enterCampfire}>
          <label className="block">
            <span className="mb-2 block text-xs font-medium text-[#A1A1AA]">Display name</span>
            <div className={`group flex min-h-12 items-center rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 focus-within:border-white/[0.25] focus-within:bg-white/[0.03] ${interactiveMotion}`}>
              <input
                autoComplete="name"
                className="w-full bg-transparent text-sm text-[#F4F4F6] outline-none placeholder:text-[#52525B]"
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="What should we call you?"
                required
                value={displayName}
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-medium text-[#A1A1AA]">Username</span>
            <div className={`flex min-h-12 items-center rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 focus-within:border-white/[0.25] focus-within:bg-white/[0.03] ${interactiveMotion}`}>
              <span className="mr-1 text-sm text-[#71717A]">@</span>
              <input
                autoCapitalize="none"
                autoComplete="username"
                className="w-full bg-transparent text-sm text-[#F4F4F6] outline-none placeholder:text-[#52525B]"
                onChange={(event) => setUsername(event.target.value.replace(/^@+/, '').replace(/\s/g, '').toLowerCase())}
                placeholder="yourhandle"
                required
                value={username}
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-medium text-[#A1A1AA]">Passkey / workspace code</span>
            <div className={`flex min-h-12 items-center rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 focus-within:border-white/[0.25] focus-within:bg-white/[0.03] ${interactiveMotion}`}>
              <input
                autoComplete="off"
                className="w-full bg-transparent text-sm text-[#F4F4F6] outline-none placeholder:text-[#52525B]"
                onChange={(event) => setWorkspaceCode(event.target.value)}
                placeholder="Optional"
                type={showWorkspaceCode ? 'text' : 'password'}
                value={workspaceCode}
              />
              <button
                aria-label={showWorkspaceCode ? 'Hide workspace code' : 'Show workspace code'}
                className={`ml-2 rounded-md px-1.5 py-1 text-xs text-[#71717A] hover:text-[#F4F4F6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40 ${interactiveMotion}`}
                onClick={() => setShowWorkspaceCode((visible) => !visible)}
                type="button"
              >
                {showWorkspaceCode ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          <fieldset className="pt-1">
            <legend className="mb-2 text-xs font-medium text-[#A1A1AA]">I’m here as</legend>
            <div className="grid grid-cols-2 gap-2">
              <button
                aria-pressed={role === 'developer'}
                className={`min-h-11 rounded-xl border px-3 text-sm ${interactiveMotion} ${
                  role === 'developer'
                    ? 'border-white/[0.24] bg-white/[0.08] text-[#F4F4F6]'
                    : 'border-white/[0.08] bg-white/[0.02] text-[#A1A1AA] hover:border-white/[0.16]'
                }`}
                onClick={() => setRole('developer')}
                type="button"
              >
                💻 Developer
              </button>
              <button
                aria-pressed={role === 'student'}
                className={`min-h-11 rounded-xl border px-3 text-sm ${interactiveMotion} ${
                  role === 'student'
                    ? 'border-white/[0.24] bg-white/[0.08] text-[#F4F4F6]'
                    : 'border-white/[0.08] bg-white/[0.02] text-[#A1A1AA] hover:border-white/[0.16]'
                }`}
                onClick={() => setRole('student')}
                type="button"
              >
                🧬 Student
              </button>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-[#71717A]">
              {role === 'developer'
                ? 'Dev Rig will be ready when you arrive.'
                : 'Solvely and Whiteboard Tutor will be ready when you arrive.'}
            </p>
          </fieldset>

          <button
            className={`mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#09090B] hover:bg-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${interactiveMotion}`}
            type="submit"
          >
            Enter Campfire <span aria-hidden="true">→</span>
          </button>

          <div className="relative py-1">
            <div className="absolute inset-x-0 top-1/2 h-px bg-white/[0.08]" />
            <span className="relative mx-auto block w-fit bg-[#0B0B0E] px-3 text-[10px] uppercase tracking-[0.16em] text-[#52525B]">
              Or jump right in
            </span>
          </div>

          <button
            className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 text-sm text-[#E4E4E7] hover:bg-white/[0.07] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40 ${interactiveMotion}`}
            onClick={() => enterCampfire(undefined, true)}
            type="button"
          >
            Continue with GitHub
          </button>
          <button
            className={`flex min-h-11 w-full items-center justify-center rounded-xl border border-white/[0.08] px-4 text-sm text-[#A1A1AA] hover:border-white/[0.16] hover:text-[#F4F4F6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40 ${interactiveMotion}`}
            onClick={() => enterCampfire(undefined, true)}
            type="button"
          >
            Quick Guest Pass
          </button>
        </form>
      </div>
    </section>
  )
}
