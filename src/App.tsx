import { useEffect } from 'react'
import { PageLanding } from './pages/PageLanding'
import { PageSignIn } from './pages/PageSignIn'
import { startCampfireTicker, useCampfireStore } from './store/useCampfireStore'

export default function App() {
  const activePage = useCampfireStore((state) => state.activePage)
  const displayName = useCampfireStore((state) => state.profile.displayName)
  const role = useCampfireStore((state) => state.profile.role)

  useEffect(() => {
    startCampfireTicker()
  }, [])

  return (
    <main className="min-h-screen bg-[#070709] text-[#F4F4F6]">
      {activePage === 'page-0' ? (
        <PageLanding />
      ) : activePage === 'page-signin' ? (
        <PageSignIn />
      ) : activePage === 'page-lobby' ? (
        <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-6 text-center before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(ellipse_at_50%_45%,rgba(255,255,255,0.07),transparent_52%)]">
          <div className="w-full max-w-md rounded-[28px] border border-white/[0.08] bg-[#0B0B0E]/85 p-10 shadow-[0_24px_80px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-2xl">
            <p className="text-3xl" aria-hidden="true">🔥</p>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight">Welcome to Campfire</h1>
            <p className="mt-3 text-sm text-[#71717A]">
              You’re in as {displayName} · {role === 'developer' ? 'Developer' : 'Student'}
            </p>
          </div>
        </section>
      ) : null}
    </main>
  )
}
