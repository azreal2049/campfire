import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, LayoutGrid } from 'lucide-react'
import { cn } from '../lib/cn'

interface LiquidGlassModeSwitcherProps {
  activeMode: 'chat' | 'workplace'
  onChange: (mode: 'chat' | 'workplace') => void
  className?: string
}

export function LiquidGlassModeSwitcher({
  activeMode,
  onChange,
  className,
}: LiquidGlassModeSwitcherProps) {
  const [isFlowing, setIsFlowing] = useState(false)
  const [direction, setDirection] = useState<'left' | 'right'>('right')
  const prevModeRef = useRef(activeMode)

  const handleSelect = (mode: 'chat' | 'workplace') => {
    if (mode === activeMode) return
    const newDir = mode === 'workplace' ? 'right' : 'left'
    setDirection(newDir)
    setIsFlowing(true)
    prevModeRef.current = mode
    onChange(mode)
    setTimeout(() => setIsFlowing(false), 550)
  }

  return (
    <div
      className={cn(
        'relative flex h-14 w-64 cursor-pointer select-none items-center rounded-full bg-[#050507] p-1.5 shadow-[inset_0_3px_10px_rgba(0,0,0,0.98),inset_0_1px_2px_rgba(255,255,255,0.1),0_16px_36px_rgba(0,0,0,0.85)] border border-white/[0.08]',
        className
      )}
      onClick={() => handleSelect(activeMode === 'chat' ? 'workplace' : 'chat')}
    >
      {/* SVG Gooey Fluid Filter Definition */}
      <svg className="absolute w-0 h-0 hidden" aria-hidden="true">
        <defs>
          <filter id="liquid-goo-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Top Specular Curved Glass Arc */}
      <div className="absolute inset-x-5 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none z-30" />

      {/* Viscous Liquid Flow Container */}
      <div className="absolute inset-1.5 z-10 pointer-events-none overflow-visible">
        {/* Sliding Liquid Droplet Base */}
        <motion.div
          className="relative h-full w-1/2 rounded-full"
          animate={{
            x: activeMode === 'chat' ? '0%' : '100%',
            scaleX: isFlowing ? 1.24 : 1,
            scaleY: isFlowing ? 0.82 : 1,
            skewX: isFlowing ? (direction === 'right' ? 8 : -8) : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 180,
            damping: 15,
            mass: 0.9,
          }}
        >
          {/* Prismatic Fluid Chromatic Rim */}
          <div className="relative h-full w-full rounded-full p-[1.75px] overflow-hidden">
            <motion.div
              className="absolute inset-[-60%] pointer-events-none opacity-90"
              style={{
                background: `conic-gradient(from 0deg, rgba(255,255,255,0.95), rgba(56,189,248,1) 45deg, rgba(255,255,255,0.2) 100deg, rgba(245,158,11,1) 170deg, rgba(255,255,255,0.95) 230deg, rgba(59,130,246,1) 290deg, rgba(255,255,255,0.9) 360deg)`,
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            />

            {/* Inner Smoked Liquid Body */}
            <div className="relative h-full w-full rounded-full bg-gradient-to-b from-[#2a2a30]/95 via-[#16161a]/98 to-[#09090b] backdrop-blur-2xl shadow-[inset_0_1.5px_3px_rgba(255,255,255,0.45),0_8px_20px_rgba(0,0,0,0.9)]" />
          </div>

          {/* Fluid Trail Droplet Particles (Spawns during motion) */}
          <AnimatePresence>
            {isFlowing && (
              <>
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white/40 blur-[1px]"
                  style={{
                    left: direction === 'right' ? '-10px' : 'calc(100% + 2px)',
                  }}
                  initial={{ opacity: 0.8, scale: 1 }}
                  animate={{ opacity: 0, scale: 0.3, x: direction === 'right' ? -18 : 18 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                />
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-sky-400/50 blur-[0.5px]"
                  style={{
                    left: direction === 'right' ? '-18px' : 'calc(100% + 10px)',
                  }}
                  initial={{ opacity: 0.9, scale: 1.2 }}
                  animate={{ opacity: 0, scale: 0.2, x: direction === 'right' ? -26 : 26 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: 0.05 }}
                />
              </>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Dual Toggle Labels */}
      <div
        className={`relative z-20 flex h-full w-1/2 items-center justify-center gap-2 text-sm font-medium tracking-tight transition-all duration-300 ${
          activeMode === 'chat'
            ? 'text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] font-semibold'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
        onClick={(e) => {
          e.stopPropagation()
          handleSelect('chat')
        }}
      >
        <MessageSquare className="h-4 w-4" />
        <span>Chat</span>
      </div>

      <div
        className={`relative z-20 flex h-full w-1/2 items-center justify-center gap-2 text-sm font-medium tracking-tight transition-all duration-300 ${
          activeMode === 'workplace'
            ? 'text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] font-semibold'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
        onClick={(e) => {
          e.stopPropagation()
          handleSelect('workplace')
        }}
      >
        <LayoutGrid className="h-4 w-4" />
        <span>Workplace</span>
      </div>
    </div>
  )
}