import { useEffect, useRef } from 'react'

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  isBadge: boolean
  badgeColor?: string
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

    // Create 65 nodes primarily in outer thirds (x < 0.38*width or x > 0.62*width)
    const nodeCount = 65
    const nodes: Node[] = []

    for (let i = 0; i < nodeCount; i++) {
      // 70% left/right, 30% center safe-zone
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
      const vx = (Math.random() - 0.5) * 0.36
      const vy = (Math.random() - 0.5) * 0.36

      const isBadge = Math.random() < 0.3
      const radius = isBadge ? 7 : 1.5 + Math.random() * 1
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
      ctx.lineWidth = 1
      ctx.stroke()
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Update positions & draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]

        // Move node
        node.x += node.vx
        node.y += node.vy

        // Wrap around bounds
        if (node.x < -20) node.x = width + 20
        if (node.x > width + 20) node.x = -20
        if (node.y < -20) node.y = height + 20
        if (node.y > height + 20) node.y = -20

        // Mouse repulsion & interaction
        if (mouse.active) {
          const dx = node.x - mouse.x
          const dy = node.y - mouse.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const maxDist = 140

          if (dist < maxDist && dist > 0) {
            const force = (1 - dist / maxDist) * 1.5
            node.x += (dx / dist) * force
            node.y += (dy / dist) * force
          }
        }
      }

      // Draw connecting lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i]
          const n2 = nodes[j]

          const dx = n1.x - n2.x
          const dy = n1.y - n2.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const maxLineDist = 160

          if (dist < maxLineDist) {
            let lineAlpha = (1 - dist / maxLineDist) * 0.12

            // Check if line is close to mouse cursor to brighten line
            if (mouse.active) {
              const midX = (n1.x + n2.x) / 2
              const midY = (n1.y + n2.y) / 2
              const mdx = midX - mouse.x
              const mdy = midY - mouse.y
              const mdist = Math.sqrt(mdx * mdx + mdy * mdy)
              if (mdist < 140) {
                lineAlpha += (1 - mdist / 140) * 0.25
              }
            }

            ctx.beginPath()
            ctx.moveTo(n1.x, n1.y)
            ctx.lineTo(n2.x, n2.y)
            ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(0.4, lineAlpha)})`
            ctx.lineWidth = 0.75
            ctx.stroke()
          }
        }
      }

      // Draw Nodes (Dots & Badges)
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]

        if (node.isBadge) {
          // Draw 14x14 micro-badge
          const size = 14
          const bx = node.x - size / 2
          const by = node.y - size / 2
          drawRoundedRect(
            bx,
            by,
            size,
            size,
            3,
            'rgba(18, 18, 22, 0.95)',
            'rgba(255, 255, 255, 0.15)'
          )

          // Center accent dot
          ctx.beginPath()
          ctx.arc(node.x, node.y, 2, 0, Math.PI * 2)
          ctx.fillStyle = node.accentColor || '#ffffff'
          ctx.fill()
        } else {
          // Draw simple glowing dot
          ctx.beginPath()
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'
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
            'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.03) 0%, transparent 70%)',
        }}
      />

      {/* Layer 2: Architectural Hairline Grid Overlay */}
      {/* Full-viewport vertical structural lines container */}
      <div className="relative mx-auto h-full max-w-6xl border-x border-white/[0.07]">
        {/* 2 internal vertical divider lines */}
        <div className="absolute inset-y-0 left-1/3 w-px bg-white/[0.04]" />
        <div className="absolute inset-y-0 left-2/3 w-px bg-white/[0.04]" />

        {/* Horizontal hairline dividers (top boundary & bottom boundary) */}
        <div className="absolute top-16 inset-x-0 h-px bg-white/[0.06]" />
        <div className="absolute bottom-20 inset-x-0 h-px bg-white/[0.06]" />

        {/* Intersection '+' crosshair markers */}
        {/* Top boundary crosshairs: left, 1/3, 2/3, right */}
        <Crosshair className="absolute top-16 -left-[3.5px] -translate-y-1/2" />
        <Crosshair className="absolute top-16 left-1/3 -translate-x-1/2 -translate-y-1/2" />
        <Crosshair className="absolute top-16 left-2/3 -translate-x-1/2 -translate-y-1/2" />
        <Crosshair className="absolute top-16 -right-[3.5px] -translate-y-1/2" />

        {/* Bottom boundary crosshairs: left, 1/3, 2/3, right */}
        <Crosshair className="absolute bottom-20 -left-[3.5px] translate-y-1/2" />
        <Crosshair className="absolute bottom-20 left-1/3 -translate-x-1/2 translate-y-1/2" />
        <Crosshair className="absolute bottom-20 left-2/3 -translate-x-1/2 translate-y-1/2" />
        <Crosshair className="absolute bottom-20 -right-[3.5px] translate-y-1/2" />
      </div>

      {/* Layer 3: HTML5 Canvas Constellation Node & Badge Network */}
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
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
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth="1"
      />
    </svg>
  )
}