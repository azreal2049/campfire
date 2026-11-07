import { motion } from 'framer-motion'
import { cn } from '../lib/cn'

interface Orb {
  color: string
  size: number
  initialX: string
  initialY: string
  duration: number
  ease: [number, number, number, number]
  blur: string
}

interface AnimatedBackgroundProps {
  orbs?: Orb[]
  className?: string
  children?: React.ReactNode
}

const DEFAULT_ORBS: Orb[] = [
  {
    color: 'rgba(99, 102, 241, 0.35)',
    size: 520,
    initialX: '-15%',
    initialY: '-20%',
    duration: 18,
    ease: [0.4, 0.0, 0.2, 1],
    blur: 'blur-[140px]',
  },
  {
    color: 'rgba(168, 85, 247, 0.30)',
    size: 480,
    initialX: '60%',
    initialY: '-10%',
    duration: 22,
    ease: [0.4, 0.0, 0.2, 1],
    blur: 'blur-[130px]',
  },
  {
    color: 'rgba(236, 72, 153, 0.22)',
    size: 440,
    initialX: '-10%',
    initialY: '55%',
    duration: 26,
    ease: [0.4, 0.0, 0.2, 1],
    blur: 'blur-[120px]',
  },
  {
    color: 'rgba(56, 189, 248, 0.25)',
    size: 400,
    initialX: '55%',
    initialY: '65%',
    duration: 20,
    ease: [0.4, 0.0, 0.2, 1],
    blur: 'blur-[110px]',
  },
  {
    color: 'rgba(52, 211, 153, 0.18)',
    size: 360,
    initialX: '25%',
    initialY: '30%',
    duration: 24,
    ease: [0.4, 0.0, 0.2, 1],
    blur: 'blur-[100px]',
  },
]

export function AnimatedBackground({
  orbs = DEFAULT_ORBS,
  className,
  children,
}: AnimatedBackgroundProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 -z-10 overflow-hidden pointer-events-none',
        className,
      )}
    >
      {/* Base gradient */}
      <div className="absolute inset-0 bg-[#050505]" />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Ambient orbs */}
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${orb.blur}`}
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.initialX,
            top: orb.initialY,
            background: orb.color,
            filter: 'saturate(1.4) brightness(1.1)',
          }}
          animate={{
            x: [
              0,
              `${Number(orb.initialX.replace('%', '')) > 50 ? '-8%' : '8%'}`,
              0,
            ],
            y: [
              0,
              `${Number(orb.initialY.replace('%', '')) > 50 ? '-6%' : '6%'}`,
              0,
            ],
            scale: [1, 1.15, 1],
            opacity: [0.5, 0.85, 0.5],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: orb.ease,
            repeatType: 'mirror',
          }}
        />
      ))}

      {/* Vignette overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, transparent 30%, rgba(0,0,0,0.5) 80%), radial-gradient(ellipse at 50% 100%, transparent 30%, rgba(0,0,0,0.4) 80%)`,
        }}
      />

      {children}
    </div>
  )
}