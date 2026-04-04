'use client'

import { Sparkline } from "../shared/Sparkline"



interface Props {
  label: string
  value: string | number
  sub?: string
  data?: number[]
  color?: string
  trend?: number
  accent?: boolean
}

export function MetricSparkCard({ label, value, sub, data, color, trend, accent }: Props) {
  const trendColor = trend === undefined ? 'var(--text-muted)'
    : trend > 0 ? 'var(--emerald)'
      : trend < 0 ? 'var(--red)'
        : 'var(--text-muted)'

  const trendSymbol = trend === undefined ? ''
    : trend > 0 ? '↑'
      : trend < 0 ? '↓'
        : '→'

  return (
    <div style={{
      padding: '16px 18px',
      borderRadius: 8,
      border: '1px solid var(--border)',
      background: 'var(--bg-surface)',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      transition: 'border-color 0.15s',
      cursor: 'default',
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-focus)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontSize: '10px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          {label}
        </span>
        {data && data.length > 1 && (
          <Sparkline data={data} width={60} height={22} color={color ?? (accent ? 'var(--accent)' : '#888784')} />
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{
          fontSize: '22px',
          fontWeight: 500,
          fontFamily: 'var(--font-mono)',
          color: accent ? 'var(--accent)' : 'var(--text-primary)',
          lineHeight: 1,
        }}>
          {value}
        </span>
        {trend !== undefined && (
          <span style={{ fontSize: '11px', color: trendColor, fontFamily: 'var(--font-mono)' }}>
            {trendSymbol}{Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      {sub && (
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
          {sub}
        </div>
      )}
    </div>
  )
}
