import { ArrowRight, Flame } from 'lucide-react'
import { useCampfireStore } from '../store/useCampfireStore'
import './PageLanding.css'

const navLinks = ['Home', 'Features', 'Coverage', 'Company', 'Pricing'] as const

function NeuralFigure() {
  return (
    <svg
      aria-hidden="true"
      className="landing-neural-figure"
      fill="none"
      viewBox="0 0 560 640"
    >
      <defs>
        <radialGradient id="neuralCore">
          <stop offset="0" stopColor="#1478c9" stopOpacity="0" />
          <stop offset=".72" stopColor="#1689db" stopOpacity=".015" />
          <stop offset="1" stopColor="#48c5ff" stopOpacity=".28" />
        </radialGradient>
        <linearGradient id="neuralEdge" x1="78" x2="482" y1="98" y2="574" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4abaff" stopOpacity=".12" />
          <stop offset=".46" stopColor="#67d4ff" stopOpacity=".92" />
          <stop offset="1" stopColor="#218de1" stopOpacity=".18" />
        </linearGradient>
        <filter id="neuralGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <pattern id="neuralDots" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.25" fill="#65caff" fillOpacity=".46" />
          <circle cx="10" cy="8" r=".7" fill="#9adeff" fillOpacity=".3" />
        </pattern>
        <clipPath id="headShape">
          <path d="M280 50C180 50 110 118 99 224L81 368C76 423 106 467 143 492L159 548C165 573 189 590 218 592H342C371 590 395 573 401 548L417 492C454 467 484 423 479 368L461 224C450 118 380 50 280 50Z" />
        </clipPath>
      </defs>
      <g className="neural-orbit neural-orbit-one">
        <ellipse cx="280" cy="320" rx="218" ry="122" stroke="#36a7f5" strokeOpacity=".28" />
      </g>
      <g className="neural-orbit neural-orbit-two">
        <ellipse cx="280" cy="320" rx="198" ry="112" stroke="#5bc9ff" strokeOpacity=".2" />
      </g>
      <g clipPath="url(#headShape)">
        <rect x="70" y="40" width="420" height="570" fill="url(#neuralCore)" />
        <rect x="70" y="40" width="420" height="570" fill="url(#neuralDots)" opacity=".26" />
        <path
          d="M280 50C180 50 110 118 99 224L81 368C76 423 106 467 143 492L159 548C165 573 189 590 218 592H342C371 590 395 573 401 548L417 492C454 467 484 423 479 368L461 224C450 118 380 50 280 50Z"
          stroke="url(#neuralEdge)"
          strokeWidth="3"
          filter="url(#neuralGlow)"
        />
        <path d="M165 212Q201 185 237 212M323 212Q359 185 395 212" stroke="#63caff" strokeOpacity=".42" strokeWidth="2" />
        <path d="M190 271Q211 257 232 271M328 271Q349 257 370 271" stroke="#77d6ff" strokeOpacity=".65" strokeWidth="2" />
        <path d="M280 252L263 338L285 350" stroke="#54b9fb" strokeOpacity=".42" strokeWidth="2" />
        <path d="M224 405Q280 438 336 405" stroke="#54b9fb" strokeOpacity=".42" strokeWidth="2" />
        <path d="M190 466Q280 508 370 466" stroke="#3a9eea" strokeOpacity=".35" />
      </g>
      <g className="neural-pulse" filter="url(#neuralGlow)">
        <circle cx="142" cy="194" r="2.5" fill="#a4e5ff" />
        <circle cx="422" cy="241" r="2" fill="#a4e5ff" />
        <circle cx="158" cy="418" r="2.5" fill="#8bdcff" />
        <circle cx="390" cy="455" r="2" fill="#a4e5ff" />
        <circle cx="280" cy="106" r="2.5" fill="#d4f4ff" />
        <circle cx="282" cy="563" r="2" fill="#a4e5ff" />
      </g>
    </svg>
  )
}

export function PageLanding() {
  const setActivePage = useCampfireStore((state) => state.setActivePage)

  return (
    <div className="landing-page min-h-screen overflow-hidden bg-[#050608] text-white">
      <header className="landing-nav fixed inset-x-0 top-0 z-20 flex h-[76px] items-center justify-between border-b border-white/[0.06] bg-[#070709]/70 px-6 backdrop-blur-2xl md:px-16">
        <a
          aria-label="Campfire home"
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight"
          href="#home"
        >
          <Flame aria-hidden="true" className="text-orange-200 drop-shadow-[0_0_12px_rgba(251,146,60,0.55)]" size={21} />
          <span>Campfire</span>
        </a>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-8 rounded-full border border-white/[0.06] bg-white/[0.02] px-6 py-2 text-sm font-medium text-zinc-400 md:flex"
        >
          {navLinks.map((link) => (
            <a
              className="transition-colors duration-200 hover:text-white"
              href={`#${link.toLowerCase()}`}
              key={link}
            >
              {link}
            </a>
          ))}
        </nav>

        <button
          className="landing-action rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#09090B] shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:scale-[1.02] hover:bg-zinc-200 active:scale-[0.98]"
          onClick={() => setActivePage('page-signin')}
          type="button"
        >
          Get started
        </button>
      </header>

      <main>
        <section
          aria-labelledby="landing-title"
          className="landing-hero relative isolate flex min-h-screen items-center justify-center overflow-hidden px-6 py-[76px] text-center"
          id="home"
        >
          <div aria-hidden="true" className="landing-starfield absolute inset-0 -z-30" />
          <div aria-hidden="true" className="landing-ambient absolute left-1/2 top-[46%] -z-20" />
          <NeuralFigure />
          <div className="landing-copy mx-auto max-w-[880px]">
            <p className="mb-6 text-[11px] font-medium uppercase tracking-[0.2em] text-sky-100/65">
              Focus feels better together
            </p>
            <h1
              className="text-[clamp(2.5rem,6.2vw,5rem)] font-semibold leading-[1.08] tracking-[-0.055em] text-[#F5F7FA]"
              id="landing-title"
            >
              Redefining Deep Work
              <br />
              with <span className="landing-heading-accent">Collaborative Rooms</span>
            </h1>
            <p className="mx-auto mt-5 max-w-[560px] text-sm leading-6 text-zinc-400 sm:text-base sm:leading-7">
              A focused space to study, build, and make meaningful progress — together.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                className="landing-action group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#09090B] shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:bg-zinc-200 active:scale-[0.98]"
                onClick={() => setActivePage('page-signin')}
                type="button"
              >
                Enter Campfire
                <ArrowRight
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-x-1"
                  size={16}
                />
              </button>
              <a
                className="landing-action inline-flex min-h-12 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04] px-7 py-3.5 text-sm text-white hover:border-white/[0.2] hover:bg-white/[0.08] active:scale-[0.98]"
                href="#features"
              >
                Explore Roadmap
              </a>
            </div>
          </div>
        </section>

        <section
          aria-label="Campfire features"
          className="landing-features mx-auto grid max-w-5xl scroll-mt-28 grid-cols-1 gap-8 px-6 pb-20 sm:grid-cols-3"
          id="features"
        >
          <article id="coverage">
            <span>01 / FOCUS</span>
            <h2>Find your rhythm.</h2>
            <p>Timers and quiet accountability help make deep work easier to begin.</p>
          </article>
          <article id="company">
            <span>02 / TOGETHER</span>
            <h2>Make it shared.</h2>
            <p>Join a small room, bring your tools, and work alongside other people.</p>
          </article>
          <article id="pricing">
            <span>03 / MOMENTUM</span>
            <h2>Keep going gently.</h2>
            <p>Track small wins without turning focus into another noisy feed.</p>
          </article>
        </section>
      </main>
    </div>
  )
}
