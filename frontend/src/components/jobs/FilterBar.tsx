'use client'

import { Filters } from '@/hooks/useJobFilters'
import { JobStatus } from '@/types'

interface Props {
  filters:       Filters
  onUpdate:      (patch: Partial<Filters>) => void
  onReset:       () => void
  totalCount:    number
  filteredCount: number
}

const STATUSES: { label: string; value: JobStatus | 'all' }[] = [
  { label: 'All',       value: 'all'       },
  { label: 'Pending',   value: 'pending'   },
  { label: 'Running',   value: 'running'   },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed',    value: 'failed'    },
]

export function FilterBar({ filters, onUpdate, onReset, totalCount, filteredCount }: Props) {
  const hasFilters =
    filters.search ||
    filters.status !== 'all' ||
    filters.minPlddt !== null ||
    filters.maxEnergy !== null

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 16px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-surface)',
      flexWrap: 'wrap',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '5px 10px',
        borderRadius: 6,
        border: '1px solid var(--border)',
        background: 'var(--bg-elevated)',
        flex: '1', minWidth: 180, maxWidth: 300,
        transition: 'border-color 0.15s',
      }}
        onFocusCapture={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
        onBlurCapture={e => (e.currentTarget.style.borderColor = 'var(--border)')}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <input
          placeholder="Search jobs..."
          value={filters.search}
          onChange={e => onUpdate({ search: e.target.value })}
          style={{
            border: 'none', outline: 'none',
            background: 'transparent',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            width: '100%',
          }}
        />
        {filters.search && (
          <button
            onClick={() => onUpdate({ search: '' })}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, flexShrink: 0 }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {STATUSES.map(s => (
          <button
            key={s.value}
            onClick={() => onUpdate({ status: s.value })}
            style={{
              padding: '4px 10px',
              borderRadius: 20,
              border: '1px solid',
              borderColor: filters.status === s.value ? 'var(--accent)' : 'var(--border)',
              background: filters.status === s.value ? 'var(--accent-dim)' : 'transparent',
              color: filters.status === s.value ? 'var(--accent)' : 'var(--text-muted)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        fontSize: '11px', fontFamily: 'var(--font-mono)',
        color: 'var(--text-muted)',
      }}>
        <span>pLDDT ≥</span>
        <input
          type="number"
          min="0" max="100"
          placeholder="0"
          value={filters.minPlddt ?? ''}
          onChange={e => onUpdate({ minPlddt: e.target.value ? Number(e.target.value) : null })}
          style={{
            width: 48, padding: '4px 6px',
            borderRadius: 4, border: '1px solid var(--border)',
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            outline: 'none',
          }}
        />
      </div>
      <div style={{
        marginLeft: 'auto',
        fontSize: '11px', fontFamily: 'var(--font-mono)',
        color: 'var(--text-muted)',
        whiteSpace: 'nowrap',
      }}>
        {filteredCount === totalCount
          ? `${totalCount} jobs`
          : `${filteredCount} of ${totalCount}`
        }
      </div>
      {hasFilters && (
        <button
          onClick={onReset}
          style={{
            padding: '4px 8px', borderRadius: 4,
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--text-muted)',
            fontSize: '11px', fontFamily: 'var(--font-mono)',
            cursor: 'pointer', transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          reset
        </button>
      )}
    </div>
  )
}
