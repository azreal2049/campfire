import { ArrowRight, Flame } from 'lucide-react'
import { useCampfireStore } from '../store/useCampfireStore'
import './PageLanding.css'

export function PageLanding() {
  const setActivePage = useCampfireStore((state) => state.setActivePage)

  return (
    <div className="landing-page min-h-screen overflow-hidden bg-[#070709] text-[#F4F4F6]">
      <header className="landing-nav mx-auto flex h-[76px] w-full max-w-[1120px] items-center justify-between px-6 lg:px-10">
        <a
          aria-label="Campfire home"
          className="landing-brand flex items-center gap-2.5 text-sm font-semibold tracking-tight"
          href="#home"
        >
          <Flame aria-hidden="true" className="text-[#e7edf7]" size={19} strokeWidth={1.7} />
          <span>campfire</span>
        </a>

        <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
          <a className="landing-nav-link" href="#home">Home</a>
          <a className="landing-nav-link" href="#rooms">Rooms</a>
          <a className="landing-nav-link" href="#focus">How it works</a>
        </nav>

        <button
          className="landing-cta landing-motion rounded-full bg-[#F4F4F6] px-5 py-2.5 text-xs font-semibold text-[#09090B] hover:bg-white"
          onClick={() => setActivePage('page-signin')}
          type="button"
        >
          Get started
        </button>
      </header>

      <main>
        <section
          aria-labelledby="landing-title"
          className="landing-hero relative isolate flex min-h-[calc(100svh-76px)] items-center justify-center px-6 pb-24 pt-8 text-center"
          id="home"
        >
          <div aria-hidden="true" className="landing-starfield absolute inset-0 -z-20" />
          <div aria-hidden="true" className="landing-particle-sphere absolute left-1/2 top-[47%] -z-10" />
          <div className="landing-copy mx-auto -mt-7 max-w-[790px]">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.035] px-3.5 py-1.5 text-[11px] tracking-wide text-[#B8C5D8]">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-sky-300 shadow-[0_0_12px_rgba(125,211,252,0.9)]" />
              A little more focus, together
            </p>
            <h1
              className="text-[clamp(2.55rem,6.2vw,5rem)] font-medium leading-[1.04] tracking-[-0.065em] text-[#F4F4F6]"
              id="landing-title"
            >
              Find your focus.
              <br />
              <span className="landing-title-glow">Build momentum together.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-[510px] text-sm leading-6 text-[#9A9DA7] sm:text-base sm:leading-7">
              A calm shared space for focused work, thoughtful study, and small wins that add up.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                className="landing-motion inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#F4F4F6] px-6 text-sm font-semibold text-[#09090B] hover:bg-white"
                onClick={() => setActivePage('page-signin')}
                type="button"
              >
                Start a session <ArrowRight aria-hidden="true" size={16} />
              </button>
              <a
                className="landing-motion inline-flex min-h-12 items-center justify-center rounded-full border border-white/[0.14] bg-white/[0.035] px-6 text-sm text-[#D4D7DF] hover:border-white/25 hover:bg-white/[0.07]"
                href="#rooms"
              >
                Explore Campfire
              </a>
            </div>
            <p className="mt-7 text-[11px] tracking-wide text-[#717784]">
              No noise. Just room to get things done.
            </p>
          </div>
          <a
            aria-label="Scroll to Campfire spaces"
            className="landing-scroll-cue absolute bottom-8 left-1/2 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-white/[0.12] text-[#9AA8BA]"
            href="#rooms"
          >
            <span aria-hidden="true">↓</span>
          </a>
        </section>

        <section
          aria-label="Campfire spaces"
          className="mx-auto grid w-full max-w-[1000px] scroll-mt-8 grid-cols-1 gap-4 px-6 pb-20 sm:grid-cols-3 lg:px-10"
          id="rooms"
        >
          <article className="landing-feature" id="focus">
            <span className="landing-feature-index">01 / FOCUS</span>
            <h2>Show up for the work.</h2>
            <p>Set a gentle timer and let a shared room make starting feel easier.</p>
          </article>
          <article className="landing-feature">
            <span className="landing-feature-index">02 / BUILD</span>
            <h2>Make progress together.</h2>
            <p>Bring your code, notes, and ideas into one calm workspace.</p>
          </article>
          <article className="landing-feature">
            <span className="landing-feature-index">03 / RESET</span>
            <h2>Keep a human pace.</h2>
            <p>Take a breath, share a small win, then return when you’re ready.</p>
          </article>
        </section>
      </main>
    </div>
  )
}
