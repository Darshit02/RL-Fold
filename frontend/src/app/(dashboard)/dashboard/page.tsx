'use client'

import { useState } from 'react'
import Link from 'next/link'
import Topbar from '@/components/layout/Topbar'
import { StatCard } from '@/components/shared/StatCard'
import { StatCardSkeleton, TableRowSkeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { Button } from '@/components/ui/button'
import { useJobs } from '@/hooks/useJobs'
import { formatDate, truncate } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { JobSubmitDialog } from '@/components/jobs/JobSubmitDialog'

export default function DashboardPage() {
  const router = useRouter()
  const { jobs, isLoading, mutate } = useJobs()
  const [dialogOpen, setDialogOpen] = useState(false)

  const stats = {
    total: jobs.length,
    running: jobs.filter(j => j.status === 'running').length,
    completed: jobs.filter(j => j.status === 'completed').length,
    avgPlddt: jobs.filter(j => j.plddt_score).length
      ? (jobs.filter(j => j.plddt_score)
        .reduce((a, b) => a + (b.plddt_score ?? 0), 0) /
        jobs.filter(j => j.plddt_score).length
      ).toFixed(1)
      : '—',
  }

  return (
    <ErrorBoundary>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Topbar
          title="Dashboard"
          subtitle="Protein design overview"
          actions={
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              New job
            </Button>
          }
        />

        <div style={{ padding: '28px', flex: 1 }}>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 14,
            marginBottom: 28,
          }}>
            {isLoading
              ? [...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)
              : <>
                <StatCard label="Total jobs" value={stats.total} sub="All time" />
                <StatCard label="Running" value={stats.running} sub="Active now" accent={stats.running > 0} />
                <StatCard label="Completed" value={stats.completed} sub="Finished" />
                <StatCard label="Avg pLDDT" value={stats.avgPlddt} sub="Confidence" accent />
              </>
            }
          </div>

          {/* Recent jobs */}
          <div style={{
            border: '1px solid var(--border)',
            borderRadius: 10,
            background: 'var(--bg-surface)',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                Recent design jobs
              </span>
              <Link href="/jobs" style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'none' }}>
                View all jobs
              </Link>
            </div>

            {isLoading ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {[...Array(5)].map((_, i) => <TableRowSkeleton key={i} cols={5} />)}
                </tbody>
              </table>
            ) : jobs.length === 0 ? (
              <EmptyState
                title="No design jobs yet"
                description="Submit your first protein sequence to start the RL optimization loop."
                action={{ label: 'Submit first job', onClick: () => setDialogOpen(true) }}
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18"
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                }
              />
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Name', 'Status', 'pLDDT', 'Energy', 'Created'].map(h => (
                      <th key={h} style={{
                        padding: '10px 20px',
                        textAlign: 'left',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-muted)',
                        letterSpacing: '0.06em',
                        fontWeight: 400,
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {jobs.slice(0, 8).map((job, i) => (
                    <tr
                      key={job.id}
                      style={{
                        borderBottom: i < Math.min(jobs.length, 8) - 1
                          ? '1px solid var(--border)'
                          : 'none',
                        cursor: 'pointer',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      onClick={() => router.push(`/jobs/${job.id}`)}
                    >
                      <td style={{ padding: '12px 20px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                          {truncate(job.name, 28)}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                          {truncate(job.sequence, 24)}
                        </div>
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        <StatusBadge status={job.status} />
                      </td>
                      <td style={{ padding: '12px 20px', fontFamily: 'var(--font-mono)', fontSize: '13px', color: job.plddt_score ? 'var(--accent)' : 'var(--text-muted)' }}>
                        {job.plddt_score ? job.plddt_score.toFixed(1) : '—'}
                      </td>
                      <td style={{ padding: '12px 20px', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--cyan)' }}>
                        {job.rosetta_energy ? job.rosetta_energy.toFixed(1) : '—'}
                      </td>
                      <td style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {formatDate(job.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <JobSubmitDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSuccess={() => mutate()}
        />
      </div>
    </ErrorBoundary>
  )
}
