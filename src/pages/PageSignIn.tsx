export function PageSignIn() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6">
          <h1 className="text-lg font-semibold text-white">Welcome back</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Choose your name and find a place to focus.
          </p>
          <form className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-300">
                Display name
              </label>
              <input
                className="h-10 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-sm text-white outline-none placeholder:text-neutral-600"
                placeholder="What should we call you?"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-300">
                Username
              </label>
              <div className="flex h-10 items-center rounded-lg border border-white/[0.08] bg-white/[0.03] px-3">
                <span className="mr-1 text-sm text-neutral-500">@</span>
                <input
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-neutral-600"
                  placeholder="yourhandle"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-2 flex h-10 w-full items-center justify-center rounded-lg bg-white text-sm font-medium text-black"
            >
              Enter Campfire
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}