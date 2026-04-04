'use client'

import { useRouter } from 'next/navigation'
import { Job } from '@/types'

interface Props {
  selected: string[]
  jobs:     Job[]
  onToggle: (id: string) => void
  onClear:  () => void
}

export function CompareSelector({ selected, jobs, onToggle, onClear }: Props) {
  const router  = useRouter()
  const canCompare = selected.length >= 2

  if (selected.length === 0) return null

  const names = selected.map(id => jobs.find(j => j.id === id)?.name ?? id)

  return (
    <div style={{
      position: 'sticky',
      bottom: 16,
      margin: '0 24px',
      padding: '12px 16px',
      borderRadius: 10,
      border: '1px solid var(--accent)',
      background: 'var(--bg-elevated)',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      zIndex: 20,
    }}>
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: 'var(--accent)',
        animation: 'pulse-dot 1.5s infinite',
        flexShrink: 0,
      }}/>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>
          {selected.length} job{selected.length > 1 ? 's' : ''} selected for comparison
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
          {names.join(' · ')}
        </div>
      </div>
      <button
        onClick={onClear}
        style={{
          padding: '5px 10px', borderRadius: 6,
          border: '1px solid var(--border)',
          background: 'transparent',
          color: 'var(--text-muted)',
          fontSize: '11px', fontFamily: 'var(--font-mono)',
          cursor: 'pointer',
        }}
      >
        Clear
      </button>
      <button
        disabled={!canCompare}
        onClick={() => router.push(`/jobs/compare?ids=${selected.join(',')}`)}
        style={{
          padding: '5px 14px', borderRadius: 6,
          border: 'none',
          background: canCompare ? 'var(--accent)' : 'var(--bg-hover)',
          color: canCompare ? '#0a0a0a' : 'var(--text-muted)',
          fontSize: '11px', fontFamily: 'var(--font-mono)',
          fontWeight: 500,
          cursor: canCompare ? 'pointer' : 'not-allowed',
          transition: 'all 0.15s',
        }}
      >
        Compare {selected.length >= 2 ? `(${selected.length})` : '— select 2+'}
      </button>
    </div>
  )
}
