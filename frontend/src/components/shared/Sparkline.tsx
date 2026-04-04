'use client'

interface SparklineProps {
  data:   number[]
  width?: number
  height?: number
  color?: string
  fill?:  boolean
}

export function Sparkline({
  data,
  width  = 80,
  height = 28,
  color  = 'var(--accent)',
  fill   = true,
}: SparklineProps) {
  if (!data || data.length < 2) return (
    <svg width={width} height={height}>
      <line x1="0" y1={height/2} x2={width} y2={height/2}
        stroke="var(--border)" strokeWidth="1" strokeDasharray="2 2"/>
    </svg>
  )

  const min  = Math.min(...data)
  const max  = Math.max(...data)
  const range = max - min || 1
  const pad   = 2

  const pts = data.map((v, i) => ({
    x: pad + (i / (data.length - 1)) * (width - pad * 2),
    y: pad + (1 - (v - min) / range) * (height - pad * 2),
  }))

  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const area = `${line} L${pts[pts.length-1].x},${height} L${pts[0].x},${height} Z`

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      {fill && (
        <path d={area} fill={color} fillOpacity="0.12"/>
      )}
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle
        cx={pts[pts.length-1].x}
        cy={pts[pts.length-1].y}
        r="2.5" fill={color}
      />
    </svg>
  )
}
