export function ThreeDPaper({ word = 'NOCTURNE', className }: { word?: string; className?: string }) {
  return (
    <canvas
      className={className}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        pointerEvents: 'none',
      }}
    />
  )
}