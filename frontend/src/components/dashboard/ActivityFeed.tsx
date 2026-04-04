'use client'

import { Job } from '@/types'
import { formatDate } from '@/lib/utils'
import { StatusBadge } from '@/components/ui/badge'

interface Props {
  jobs: Job[]
}

function ActivityIcon({ status }: { status: string }) {
  const colors: Record<string, string> = {
    completed: '#10b981',
    running: '#00d4aa',
    failed: '#ff4d4d',
    pending: '#888884',
  }
  const color = colors[status] ?? '#888884'

  return (
    <div style={{
      width: 28, height: 28, borderRadius: '50%',
      border: `1px solid ${color}22`,
      background: `${color}12`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {status === 'completed' && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17l-5-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {status === 'running' && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
          <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" strokeOpacity="0.3" />
          <path d="M12 2a10 10 0 0110 10" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
      {status === 'failed' && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
      {status === 'pending' && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
          <path d="M12 7v5l3 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )}
    </div>
  )
}

export function ActivityFeed({ jobs }: Props) {
  const events = jobs
    .slice(0, 12)
    .map(job => ({
      id: job.id,
      title: job.name,
      status: job.status,
      plddt: job.plddt_score,
      time: job.updated_at,
      href: `/jobs/${job.id}`,
    }))

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: 10,
      background: 'var(--bg-surface)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>
          Activity
        </span>
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          {events.length} events
        </span>
      </div>

      <div style={{ padding: '8px 0' }}>
        {events.length === 0 ? (
          <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            No activity yet
          </div>
        ) : (
          events.map((event, i) => (
            <a
              key={event.id}
              href={event.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 16px',
                textDecoration: 'none',
                transition: 'background 0.1s',
                borderBottom: i < events.length - 1 ? '1px solid var(--border)' : 'none',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <ActivityIcon status={event.status} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '12px', fontWeight: 500,
                  color: 'var(--text-primary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {event.title}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>
                  {formatDate(event.time)}
                </div>
              </div>
              {event.plddt && (
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '12px',
                  color: event.plddt >= 70 ? 'var(--accent)' : 'var(--amber)',
                  flexShrink: 0,
                }}>
                  {event.plddt.toFixed(1)}
                </div>
              )}
              <StatusBadge status={event.status as any} />
            </a>
          ))
        )}
      </div>
    </div>
  )
}
