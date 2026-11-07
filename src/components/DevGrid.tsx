interface DevGridProps {
  columns?: number
  rows?: number
  cellSize?: number
  gap?: number
  color?: string
  showLabels?: boolean
  className?: string
  children?: React.ReactNode
}

export function DevGrid({
  columns = 12,
  rows = 8,
  cellSize = 40,
  gap = 8,
  color = 'rgba(255,255,255,0.08)',
  showLabels = false,
  className,
  children,
}: DevGridProps) {
  const cells: { x: number; y: number }[] = []
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      cells.push({ x, y })
    }
  }

  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        gap: `${gap}px`,
        padding: `${gap}px`,
        position: 'relative',
      }}
    >
      {cells.map((cell, i) => (
        <div
          key={i}
          style={{
            border: `1px solid ${color}`,
            background: 'rgba(255,255,255,0.01)',
            position: 'relative',
            boxSizing: 'border-box',
          }}
        >
          {showLabels && (
            <span
              style={{
                position: 'absolute',
                top: 2,
                left: 2,
                fontSize: 8,
                color: 'rgba(255,255,255,0.3)',
                fontFamily: 'monospace',
                lineHeight: 1,
              }}
            >
              {cell.x},{cell.y}
            </span>
          )}
        </div>
      ))}
      {children}
    </div>
  )
}