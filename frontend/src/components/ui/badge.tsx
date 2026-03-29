import { JobStatus } from '@/types'

const config: Record<JobStatus, { label: string; dot: string; bg: string; text: string }> = {
  pending:   { label: 'Pending',   dot: '#888884', bg: 'rgba(136,136,132,0.1)', text: '#888884' },
  running:   { label: 'Running',   dot: '#00d4aa', bg: 'rgba(0,212,170,0.1)',   text: '#00d4aa' },
  completed: { label: 'Completed', dot: '#10b981', bg: 'rgba(16,185,129,0.1)',  text: '#10b981' },
  failed:    { label: 'Failed',    dot: '#ff4d4d', bg: 'rgba(255,77,77,0.1)',   text: '#ff4d4d' },
}

export function StatusBadge({ status }: { status: JobStatus }) {
  const c = config[status]
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '3px 8px',
      borderRadius: 20,
      background: c.bg,
      fontSize: '11px',
      fontFamily: 'var(--font-mono)',
      color: c.text,
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: '50%',
        background: c.dot,
        display: 'inline-block',
        animation: status === 'running' ? 'pulse-dot 1s infinite' : 'none',
      }}/>
      {c.label}
    </span>
  )
}
