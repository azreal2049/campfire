import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
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
  const [isTransitioning, setIsTransitioning] = useState(false)
  const prevModeRef = useRef(activeMode)

  const handleSelect = (mode: 'chat' | 'workplace') => {
    if (mode === activeMode) return
    if (prevModeRef.current !== mode) {
      setIsTransitioning(true)
      prevModeRef.current = mode
      setTimeout(() => setIsTransitioning(false), 400)
    }
    onChange(mode)
  }

  return (
    <div
      className={cn(
        'relative flex h-14 w-64 cursor-pointer select-none items-center rounded-full bg-[#060606] p-1.5 shadow-[inset_0_3px_8px_rgba(0,0,0,0.95),inset_0_1px_2px_rgba(255,255,255,0.08),0_12px_28px_rgba(0,0,0,0.75)] border border-white/[0.07]',
        className
      )}
      onClick={() => handleSelect(activeMode === 'chat' ? 'workplace' : 'chat')}
    >
      {/* Top Specular Gloss Arc */}
      <div className="absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none z-25" />

      {/* Sliding Liquid-Glass Thumb with Viscous Flow Physics */}
      <motion.div
        className="absolute top-1.5 bottom-1.5 w-1/2 rounded-full overflow-hidden p-[1.75px] z-10"
        style={{ left: activeMode === 'chat' ? '6px' : 'calc(50% - 6px)' }}
        animate={{
          scaleX: isTransitioning ? 1.14 : 1,
          scaleY: isTransitioning ? 0.88 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 220,
          damping: 18,
          mass: 0.7,
        }}
      >
        {/* Animated Rotating Prismatic Border Layer (Chromatic Aberration) */}
        <motion.div
          className="absolute inset-[-50%] pointer-events-none"
          style={{
            background: `conic-gradient(from 0deg, rgba(255,255,255,0.9), rgba(56,189,248,1) 45deg, rgba(255,255,255,0.2) 95deg, rgba(245,158,11,1) 165deg, rgba(255,255,255,0.95) 220deg, rgba(59,130,246,0.95) 285deg, rgba(255,255,255,0.9) 360deg)`,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        />

        {/* Inner Thumb Glass Body */}
        <div className="relative h-full w-full rounded-full bg-gradient-to-b from-[#242428]/95 via-[#141417]/98 to-[#0a0a0c] backdrop-blur-2xl shadow-[inset_0_1px_3px_rgba(255,255,255,0.4),0_6px_16px_rgba(0,0,0,0.85)]" />
      </motion.div>

      {/* Dual Toggle Labels */}
      <div
        className={`relative z-20 flex h-full w-1/2 items-center justify-center gap-2 text-sm font-medium tracking-tight transition-colors duration-300 ${
          activeMode === 'chat'
            ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.45)]'
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
        className={`relative z-20 flex h-full w-1/2 items-center justify-center gap-2 text-sm font-medium tracking-tight transition-colors duration-300 ${
          activeMode === 'workplace'
            ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.45)]'
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