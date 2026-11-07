interface DevGridProps {
  cellSize?: number
  majorEvery?: number
  color?: string
  majorColor?: string
  className?: string
  children?: React.ReactNode
}

export function DevGrid({
  cellSize = 12,
  majorEvery = 5,
  color = 'rgba(255,255,255,0.05)',
  majorColor = 'rgba(255,255,255,0.10)',
  className,
  children,
}: DevGridProps) {
  const minorSize = cellSize
  const majorSize = cellSize * majorEvery

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#0a0a0a',
        backgroundImage: [
          `linear-gradient(to right, ${color} 1px, transparent 1px)`,
          `linear-gradient(to bottom, ${color} 1px, transparent 1px)`,
          `linear-gradient(to right, ${majorColor} 1px, transparent 1px)`,
          `linear-gradient(to bottom, ${majorColor} 1px, transparent 1px)`,
        ].join(','),
        backgroundSize: `
          ${minorSize}px ${minorSize}px,
          ${minorSize}px ${minorSize}px,
          ${majorSize}px ${majorSize}px,
          ${majorSize}px ${majorSize}px
        `,
        backgroundPosition: '0 0, 0 0, 0 0, 0 0',
      }}
    >
      {children}
    </div>
  )
}