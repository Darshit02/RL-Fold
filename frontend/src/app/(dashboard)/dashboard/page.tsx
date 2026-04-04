'use client'

import { useEffect, useState, useCallback } from 'react'
import Topbar from '@/components/layout/Topbar'
import { MetricSparkCard } from '@/components/dashboard/MetricSparkCard'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { DenseJobsTable } from '@/components/dashboard/DenseJobsTable'
import { JobSubmitDialog } from '@/components/jobs/JobSubmitDialog'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { useJobs } from '@/hooks/useJobs'
import { Button } from '@/components/ui/button'
import { CommandPalette } from '@/components/shared/CommandPalette'
import { CircleFadingPlus, CommandIcon } from 'lucide-react'

export default function DashboardV2Page() {
  const { jobs, isLoading, mutate } = useJobs()
  const [cmdOpen, setCmdOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const completed = jobs.filter(j => j.status === 'completed')
  const running = jobs.filter(j => j.status === 'running')
  const failed = jobs.filter(j => j.status === 'failed')

  const avgPlddt = completed.length
    ? completed.reduce((a, b) => a + (b.plddt_score ?? 0), 0) / completed.length
    : 0

  const avgEnergy = completed.length
    ? completed.reduce((a, b) => a + (b.rosetta_energy ?? 0), 0) / completed.length
    : 0

  const plddtHistory = completed.slice(-12).map(j => j.plddt_score ?? 0)
  const energyHistory = completed.slice(-12).map(j => Math.abs(j.rosetta_energy ?? 0))

  const successRate = jobs.length
    ? (completed.length / jobs.length) * 100
    : 0

  // Global keyboard shortcut: ⌘K
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setCmdOpen(o => !o)
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
      e.preventDefault()
      setDialogOpen(true)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <ErrorBoundary>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Topbar
          title="Dashboard"
          subtitle={`${jobs.length} total jobs · ${running.length} running`}
          actions={
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                onClick={() => setCmdOpen(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 10px', borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-focus)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Search
                <kbd
                  className='flex justify-center items-center gap-0.5'
                  style={{
                    background: 'var(--bg-hover)', border: '1px solid var(--border)',
                    borderRadius: 3, padding: '1px 4px', fontSize: '10px',
                  }}>
                  <CommandIcon className='h-3 w-3' />
                  K</kbd>
              </button>
              <Button size="sm" onClick={() => setDialogOpen(true)} className="p-4 cursor-pointer">
                <CircleFadingPlus className='h-4 w-4' />
                New job
                <kbd
                  className='flex justify-center items-center gap-0.5'
                  style={{
                    background: 'rgba(0,0,0,0.2)', borderRadius: 3,
                    padding: '1px 4px', fontSize: '10px', fontFamily: 'var(--font-mono)',
                    color: 'rgba(0,0,0,0.7)',
                  }}>
                  <CommandIcon className='h-3 w-3' />
                  N</kbd>
              </Button>
            </div>
          }
        />

        <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 10,
          }}>
            <MetricSparkCard
              label="Total jobs"
              value={jobs.length}
              sub={`${failed.length} failed`}
              data={jobs.map((_, i) => i + 1)}
            />
            <MetricSparkCard
              label="Running"
              value={running.length}
              sub="active now"
              accent={running.length > 0}
              color="var(--accent)"
            />
            <MetricSparkCard
              label="Avg pLDDT"
              value={avgPlddt ? avgPlddt.toFixed(1) : '—'}
              sub="structure confidence"
              data={plddtHistory}
              accent
              trend={plddtHistory.length > 1
                ? ((plddtHistory[plddtHistory.length - 1] - plddtHistory[0]) / plddtHistory[0]) * 100
                : undefined}
            />
            <MetricSparkCard
              label="Avg energy"
              value={avgEnergy ? avgEnergy.toFixed(0) : '—'}
              sub="REU (abs value)"
              data={energyHistory}
              color="#22d3ee"
            />
            <MetricSparkCard
              label="Success rate"
              value={successRate ? successRate.toFixed(0) + '%' : '—'}
              sub={`${completed.length} completed`}
              data={jobs.map((j, i) => j.status === 'completed' ? 1 : 0)}
              color="#10b981"
              accent={successRate > 80}
            />
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 280px',
            gap: 14,
            flex: 1,
            minHeight: 0,
          }}>

            <DenseJobsTable jobs={jobs} isLoading={isLoading} />
            <ActivityFeed jobs={jobs} />
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            padding: '10px 16px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--bg-surface)',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
          }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              RL-Fold V2
            </span>
            <span>·</span>
            <span>{jobs.filter(j => j.status === 'completed').length} structures generated</span>
            <span>·</span>
            <span>
              Best pLDDT:{' '}
              <span style={{ color: 'var(--accent)' }}>
                {completed.length
                  ? Math.max(...completed.map(j => j.plddt_score ?? 0)).toFixed(1)
                  : '—'
                }
              </span>
            </span>
            <span>·</span>
            <span>
              Best energy:{' '}
              <span style={{ color: 'var(--cyan)' }}>
                {completed.length
                  ? Math.min(...completed.map(j => j.rosetta_energy ?? 0)).toFixed(1)
                  : '—'
                }
              </span>
            </span>
            <span style={{ marginLeft: 'auto' }}>
              press{' '}
              <kbd style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 3, padding: '1px 5px',
                fontSize: '10px', color: 'var(--text-secondary)',
              }}>⌘K</kbd>
              {' '}for commands
            </span>
          </div>
        </div>

        <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
        <JobSubmitDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSuccess={() => mutate()}
        />
      </div>
    </ErrorBoundary>
  )
}
