import { useEffect, useRef } from 'react'

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  isBadge: boolean
  accentColor?: string
}

export function ProfoundBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const mouse = { x: -1000, y: -1000, active: false }

    const accentColors = ['#ef4444', '#3b82f6', '#f97316', '#10b981', '#ffffff']

    // Handle high DPI scaling
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.scale(dpr, dpr)
    }

    resizeCanvas()

    // Create 60 nodes primarily in outer thirds
    const nodeCount = 60
    const nodes: Node[] = []

    for (let i = 0; i < nodeCount; i++) {
      const isOuter = Math.random() < 0.8
      let x: number
      if (isOuter) {
        x = Math.random() < 0.5 
          ? Math.random() * (width * 0.35) 
          : width * 0.65 + Math.random() * (width * 0.35)
      } else {
        x = width * 0.35 + Math.random() * (width * 0.3)
      }

      const y = Math.random() * height
      const vx = (Math.random() - 0.5) * 0.25
      const vy = (Math.random() - 0.5) * 0.25

      const isBadge = Math.random() < 0.25
      const radius = isBadge ? 6 : 1.2 + Math.random() * 0.8
      const accentColor = accentColors[Math.floor(Math.random() * accentColors.length)]

      nodes.push({
        x,
        y,
        vx,
        vy,
        radius,
        isBadge,
        accentColor,
      })
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      mouse.active = true
    }

    const handleMouseLeave = () => {
      mouse.active = false
      mouse.x = -1000
      mouse.y = -1000
    }

    window.addEventListener('resize', resizeCanvas)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    const drawRoundedRect = (
      x: number,
      y: number,
      w: number,
      h: number,
      r: number,
      fill: string,
      stroke: string
    ) => {
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.arcTo(x + w, y, x + w, y + h, r)
      ctx.arcTo(x + w, y + h, x, y + h, r)
      ctx.arcTo(x, y + h, x, y, r)
      ctx.arcTo(x, y, x + w, y, r)
      ctx.closePath()

      ctx.fillStyle = fill
      ctx.fill()
      ctx.strokeStyle = stroke
      ctx.lineWidth = 0.5
      ctx.stroke()
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Update positions & draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]

        node.x += node.vx
        node.y += node.vy

        if (node.x < -20) node.x = width + 20
        if (node.x > width + 20) node.x = -20
        if (node.y < -20) node.y = height + 20
        if (node.y > height + 20) node.y = -20

        if (mouse.active) {
          const dx = node.x - mouse.x
          const dy = node.y - mouse.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const maxDist = 140

          if (dist < maxDist && dist > 0) {
            const force = (1 - dist / maxDist) * 1.0
            node.x += (dx / dist) * force
            node.y += (dy / dist) * force
          }
        }
      }

      // Draw connecting lines (subtler opacity: max 0.06 instead of 0.12/0.4)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i]
          const n2 = nodes[j]

          const dx = n1.x - n2.x
          const dy = n1.y - n2.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const maxLineDist = 150

          if (dist < maxLineDist) {
            let lineAlpha = (1 - dist / maxLineDist) * 0.07

            if (mouse.active) {
              const midX = (n1.x + n2.x) / 2
              const midY = (n1.y + n2.y) / 2
              const mdx = midX - mouse.x
              const mdy = midY - mouse.y
              const mdist = Math.sqrt(mdx * mdx + mdy * mdy)
              if (mdist < 140) {
                lineAlpha += (1 - mdist / 140) * 0.12
              }
            }

            ctx.beginPath()
            ctx.moveTo(n1.x, n1.y)
            ctx.lineTo(n2.x, n2.y)
            ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(0.2, lineAlpha)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      // Draw Nodes (Dots & Badges - softer opacity)
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]

        if (node.isBadge) {
          const size = 12
          const bx = node.x - size / 2
          const by = node.y - size / 2
          drawRoundedRect(
            bx,
            by,
            size,
            size,
            2.5,
            'rgba(10, 10, 12, 0.8)',
            'rgba(255, 255, 255, 0.08)'
          )

          ctx.beginPath()
          ctx.arc(node.x, node.y, 1.5, 0, Math.PI * 2)
          ctx.fillStyle = node.accentColor || 'rgba(255,255,255,0.4)'
          ctx.fill()
        } else {
          ctx.beginPath()
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(255, 255, 255, 0.22)'
          ctx.fill()
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-black">
      {/* Layer 1: Base Canvas & Radial Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.015) 0%, transparent 65%)',
        }}
      />

      {/* Layer 2: Architectural Hairline Grid Overlay (Soothed / Subtler Opacity) */}
      <div className="relative mx-auto h-full max-w-6xl border-x border-white/[0.035] backdrop-blur-[0.5px]">
        {/* 2 internal vertical divider lines */}
        <div className="absolute inset-y-0 left-1/3 w-px bg-white/[0.02]" />
        <div className="absolute inset-y-0 left-2/3 w-px bg-white/[0.02]" />

        {/* Horizontal hairline dividers */}
        <div className="absolute top-16 inset-x-0 h-px bg-white/[0.03]" />
        <div className="absolute bottom-20 inset-x-0 h-px bg-white/[0.03]" />

        {/* Intersection '+' crosshair markers with reduced opacity */}
        <Crosshair className="absolute top-16 -left-[3.5px] -translate-y-1/2 opacity-50" />
        <Crosshair className="absolute top-16 left-1/3 -translate-x-1/2 -translate-y-1/2 opacity-50" />
        <Crosshair className="absolute top-16 left-2/3 -translate-x-1/2 -translate-y-1/2 opacity-50" />
        <Crosshair className="absolute top-16 -right-[3.5px] -translate-y-1/2 opacity-50" />

        <Crosshair className="absolute bottom-20 -left-[3.5px] translate-y-1/2 opacity-50" />
        <Crosshair className="absolute bottom-20 left-1/3 -translate-x-1/2 translate-y-1/2 opacity-50" />
        <Crosshair className="absolute bottom-20 left-2/3 -translate-x-1/2 translate-y-1/2 opacity-50" />
        <Crosshair className="absolute bottom-20 -right-[3.5px] translate-y-1/2 opacity-50" />
      </div>

      {/* Layer 3: HTML5 Canvas Constellation Node & Badge Network (Softened) */}
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full blur-[0.4px]" />
    </div>
  )
}

function Crosshair({ className }: { className?: string }) {
  return (
    <svg
      width="7"
      height="7"
      viewBox="0 0 7 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M3.5 0V7M0 3.5H7"
        stroke="rgba(255, 255, 255, 0.15)"
        strokeWidth="1"
      />
    </svg>
  )
}