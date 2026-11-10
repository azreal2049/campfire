import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  FolderLock,
  Home,
  LayoutGrid,
  Mail,
  MoreHorizontal,
  Pencil,
  Settings,
  Store,
  UserRound,
} from 'lucide-react'
import { useCampfireStore } from '../store/useCampfireStore'

const destinations = [
  { id: 'page-home', label: 'Home', icon: Home },
  { id: 'page-workplace', label: 'Workplace', icon: LayoutGrid },
  { id: 'page-vault', label: 'Vault', icon: FolderLock },
  { id: 'page-notes', label: 'Notes / Journal', icon: Pencil },
  { id: 'page-friends', label: 'Friends', icon: UserRound },
  { id: 'page-chat', label: 'Chat / Inbox', icon: Mail },
  { id: 'page-shop', label: 'Shop', icon: Store },
  { id: 'page-settings', label: 'Settings', icon: Settings },
]

const motionCurve = 'cubic-bezier(0.22,1,0.36,1)'

export function FloatingCapsuleNav() {
  const activePage = useCampfireStore((state) => state.activePage)
  const setActivePage = useCampfireStore((state) => state.setActivePage)
  const [expanded, setExpanded] = useState(true)
  const [capsuleWidths, setCapsuleWidths] = useState({ expanded: 0, collapsed: 0 })
  const collapseTimer = useRef<number | null>(null)
  const expandedMeasureRef = useRef<HTMLDivElement>(null)
  const collapsedMeasureRef = useRef<HTMLDivElement>(null)

  const clearCollapseTimer = () => {
    if (collapseTimer.current !== null) {
      window.clearTimeout(collapseTimer.current)
      collapseTimer.current = null
    }
  }

  const scheduleCollapse = () => {
    clearCollapseTimer()
    collapseTimer.current = window.setTimeout(() => setExpanded(false), 1800)
  }

  useEffect(() => {
    const handleScroll = () => scheduleCollapse()
    window.addEventListener('scroll', handleScroll, true)
    return () => {
      window.removeEventListener('scroll', handleScroll, true)
      clearCollapseTimer()
    }
  }, [])

  const activeDestination = destinations.find((destination) => destination.id === activePage) ?? destinations[0]
  const ActiveIcon = activeDestination.icon

  useLayoutEffect(() => {
    const measure = () => {
      const expandedWidth = expandedMeasureRef.current?.scrollWidth ?? 0
      const collapsedWidth = collapsedMeasureRef.current?.scrollWidth ?? 0
      setCapsuleWidths({
        expanded: expandedWidth + 14,
        collapsed: collapsedWidth + 14,
      })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [activePage])

  return (
    <nav
      aria-label="Main navigation"
      onPointerEnter={() => {
        clearCollapseTimer()
        setExpanded(true)
      }}
      onPointerLeave={scheduleCollapse}
      onFocus={() => {
        clearCollapseTimer()
        setExpanded(true)
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) scheduleCollapse()
      }}
      className="fixed left-1/2 top-4 z-[60] flex items-center overflow-hidden rounded-full border border-white/[0.08] bg-[#18181B]/95 p-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.65)] backdrop-blur-xl transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{
        width: expanded ? capsuleWidths.expanded || undefined : capsuleWidths.collapsed || undefined,
        transitionTimingFunction: motionCurve,
      }}
    >
      {expanded ? (
        destinations.map(({ id, label, icon: Icon }) => {
          const active = activePage === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                setActivePage(id)
                clearCollapseTimer()
                setExpanded(true)
              }}
              aria-current={active ? 'page' : undefined}
              aria-label={label}
              title={label}
              className={`flex h-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${active ? 'gap-2 bg-white/[0.14] px-4 text-[13px] font-medium text-white shadow-inner' : 'w-8 text-zinc-400 hover:bg-white/[0.08] hover:text-white'}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {active && <span className="whitespace-nowrap">{label}</span>}
            </button>
          )
        })
      ) : (
        <>
          <button
            type="button"
            onClick={() => setActivePage(activeDestination.id)}
            aria-current="page"
            className="flex h-8 shrink-0 items-center gap-2 rounded-full bg-white/[0.14] px-4 text-[13px] font-medium text-white shadow-inner transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          >
            <ActiveIcon className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">{activeDestination.label}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              clearCollapseTimer()
              setExpanded(true)
            }}
            aria-label="Expand navigation"
            title="Expand navigation"
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:text-white"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </>
      )}
      <div
        ref={expandedMeasureRef}
        aria-hidden="true"
        className="pointer-events-none absolute -left-[10000px] top-0 flex w-max items-center gap-1 opacity-0"
      >
        {destinations.map(({ id, label, icon: Icon }) => (
          <span
            key={id}
            className={`flex h-8 shrink-0 items-center justify-center rounded-full ${activePage === id ? 'gap-2 px-4 text-[13px]' : 'w-8'}`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {activePage === id && <span className="whitespace-nowrap">{label}</span>}
          </span>
        ))}
      </div>
      <div
        ref={collapsedMeasureRef}
        aria-hidden="true"
        className="pointer-events-none absolute -left-[10000px] top-0 flex w-max items-center gap-1 opacity-0"
      >
        <span className="flex h-8 shrink-0 items-center gap-2 rounded-full px-4 text-[13px]">
          <ActiveIcon className="h-4 w-4 shrink-0" />
          <span className="whitespace-nowrap">{activeDestination.label}</span>
        </span>
        <span className="h-8 w-8 shrink-0" />
      </div>
    </nav>
  )
}
