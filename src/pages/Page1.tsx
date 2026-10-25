import { useState, type FormEvent } from 'react'

export function Page1() {
  const [notice, setNotice] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice('Sign in is not connected yet.')
  }

  return (
    <section className="flex min-h-screen w-full items-center justify-center px-6 py-16">
      <div className="w-full max-w-[360px]">
        <header className="mb-12 flex flex-col items-center text-center">
          <svg
            aria-hidden="true"
            className="mb-5 h-8 w-8 text-[#e9e5dc]"
            fill="none"
            viewBox="0 0 32 32"
          >
            <circle cx="16" cy="16" r="13.25" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M9 16h2.5l2-4 4.5 9 2.5-5H23"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#e9e5dc]/65">
            Auralis
          </p>
          <h1 className="mt-7 text-[28px] font-normal tracking-[-0.04em] text-[#e9e5dc]">
            Log In
          </h1>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="border-y border-[#e9e5dc]/15">
            <label className="block py-4">
              <span className="mb-2 block text-[11px] tracking-wide text-[#e9e5dc]/50">
                Email address
              </span>
              <input
                autoComplete="email"
                className="w-full border-0 bg-transparent p-0 text-sm text-[#e9e5dc] outline-none placeholder:text-[#e9e5dc]/30 focus:ring-0"
                name="email"
                placeholder="you@example.com"
                required
                type="email"
              />
            </label>
            <div className="h-px bg-[#e9e5dc]/15" />
            <label className="block py-4">
              <span className="mb-2 block text-[11px] tracking-wide text-[#e9e5dc]/50">
                Password
              </span>
              <input
                autoComplete="current-password"
                className="w-full border-0 bg-transparent p-0 text-sm text-[#e9e5dc] outline-none placeholder:text-[#e9e5dc]/30 focus:ring-0"
                name="password"
                placeholder="Enter your password"
                required
                type="password"
              />
            </label>
          </div>

          <button
            className="mt-7 w-full bg-[#e9e5dc] px-5 py-3.5 text-[13px] font-medium text-[#151513] transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e9e5dc]"
            type="submit"
          >
            Log In
          </button>

          <div className="mt-6 text-center">
            <button
              className="text-xs text-[#e9e5dc]/55 underline decoration-[#e9e5dc]/25 underline-offset-4 transition-colors hover:text-[#e9e5dc]"
              onClick={() => setNotice('Password recovery is not configured yet.')}
              type="button"
            >
              Forgot your password?
            </button>
          </div>

          <p aria-live="polite" className="mt-5 min-h-5 text-center text-xs text-[#e9e5dc]/60">
            {notice}
          </p>
        </form>
      </div>
    </section>
  )
}
