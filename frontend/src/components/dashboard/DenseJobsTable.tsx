'use client'

import { useRouter } from 'next/navigation'
import { Job } from '@/types'
import { StatusBadge } from '@/components/ui/badge'
import { formatDate, truncate } from '@/lib/utils'
import { Sparkline } from '../shared/Sparkline'

interface Props {
  jobs:      Job[]
  isLoading: boolean
}

export function DenseJobsTable({ jobs, isLoading }: Props) {
  const router = useRouter()

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: 8,
      background: 'var(--bg-surface)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '10px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>
          Recent jobs
        </span>
        <button
          onClick={() => router.push('/jobs')}
          style={{
            fontSize: '11px', fontFamily: 'var(--font-mono)',
            color: 'var(--accent)', background: 'none',
            border: 'none', cursor: 'pointer', padding: 0,
          }}
        >
          view all →
        </button>
      </div>

      {isLoading ? (
        <div style={{ padding: '32px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
            Loading...
          </div>
        </div>
      ) : jobs.length === 0 ? (
        <div style={{ padding: '32px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
            No jobs yet
          </div>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Job', 'Status', 'pLDDT', 'Energy', 'Trend', 'Updated'].map(h => (
                <th key={h} style={{
                  padding: '7px 14px',
                  textAlign: 'left',
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.06em',
                  fontWeight: 400,
                  whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {jobs.slice(0, 10).map((job, i) => (
              <tr
                key={job.id}
                style={{
                  borderBottom: i < Math.min(jobs.length, 10) - 1 ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                onClick={() => router.push(`/jobs/${job.id}`)}
              >
                <td style={{ padding: '8px 14px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {truncate(job.name, 24)}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>
                    {truncate(job.sequence, 16)}
                  </div>
                </td>
                <td style={{ padding: '8px 14px' }}>
                  <StatusBadge status={job.status} />
                </td>
                <td style={{ padding: '8px 14px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent)' }}>
                  {job.plddt_score ? job.plddt_score.toFixed(1) : '—'}
                </td>
                <td style={{ padding: '8px 14px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--cyan)' }}>
                  {job.rosetta_energy ? job.rosetta_energy.toFixed(1) : '—'}
                </td>
                <td style={{ padding: '8px 14px' }}>
                  {job.reward_history && job.reward_history.length > 1 ? (
                    <Sparkline
                      data={job.reward_history}
                      width={56}
                      height={20}
                      color={job.status === 'completed' ? '#10b981' : 'var(--accent)'}
                    />
                  ) : (
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>—</span>
                  )}
                </td>
                <td style={{ padding: '8px 14px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                  {formatDate(job.updated_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
