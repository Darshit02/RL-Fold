'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Topbar from '@/components/layout/Topbar'
import { StatCard } from '@/components/shared/StatCard'
import { StatusBadge } from '@/components/shared/Badge'
import { Button } from '@/components/ui/button'
import { useJobs } from '@/hooks/useJobs'
import { formatDate, truncate } from '@/lib/utils'
import { Job } from '@/types'
import { CircleFadingPlus, FilePlusCorner } from 'lucide-react'

export default function DashboardPage() {
  const { jobs, isLoading } = useJobs()

  const stats = {
    total: jobs?.length || 0,
    running: jobs?.filter(j => j.status === 'running')?.length || 0,
    completed: jobs?.filter(j => j.status === 'completed')?.length || 0,
    avgPlddt: jobs?.filter(j => j.plddt_score)?.length
      ? (jobs.filter(j => j.plddt_score).reduce((a, b) => a + (b.plddt_score ?? 0), 0) / jobs.filter(j => j.plddt_score).length).toFixed(1)
      : '—',
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Topbar
        title="Dashboard"
        subtitle="Protein design overview"
        actions={
          <Link href="/jobs">
            <Button size="lg" className="cursor-pointer">
              <CircleFadingPlus className='h-14 w-14' />
              New job
            </Button>
          </Link>
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
          <StatCard label="Total jobs" value={stats.total} sub="All time" />
          <StatCard label="Running" value={stats.running} sub="Active now" accent={stats.running > 0} />
          <StatCard label="Completed" value={stats.completed} sub="Successfully finished" />
          <StatCard label="Avg pLDDT" value={stats.avgPlddt} sub="Structure confidence" accent />
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
            <Link href="/jobs" style={{ fontSize: '10px', color: 'var(--accent)', textDecoration: 'none' }}>
              <Button className='cursor-pointer font-normal rounded-md bg-secondary text-white '>
                View all
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
                Loading jobs...
              </div>
            </div>
          ) : jobs?.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: 16 }}>
                No design jobs yet
              </div>
              <Link href="/jobs">
                <Button size="sm">Submit your first job</Button>
              </Link>
            </div>
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
                      borderBottom: i < Math.min(jobs?.length, 8) - 1 ? '1px solid var(--border)' : 'none',
                      cursor: 'pointer',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => window.location.href = `/jobs/${job.id}`}
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
    </div>
  )
}
