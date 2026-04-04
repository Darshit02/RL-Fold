'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Topbar from '@/components/layout/Topbar'
import { StatusBadge } from '@/components/ui/badge'

import { FilterBar } from '@/components/jobs/FilterBar'
import { SortHeader } from '@/components/jobs/SortHeader'
import { CompareSelector } from '@/components/jobs/CompareSelector'
import { JobSubmitDialog } from '@/components/jobs/JobSubmitDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { useJobs } from '@/hooks/useJobs'
import { useJobFilters, SortKey } from '@/hooks/useJobFilters'
import { jobsApi } from '@/lib/api'
import { formatDate, truncate } from '@/lib/utils'
import { Sparkline } from '@/components/shared/Sparkline'
import { CircleFadingPlus, Trash2Icon } from 'lucide-react'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'

export default function JobsV2Page() {
  const router = useRouter()
  const { jobs, isLoading, mutate } = useJobs()
  const { filters, filtered, update, reset, toggleSort } = useJobFilters(jobs)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [jobToDelete, setJobToDelete] = useState<string | null>(null)

  const toggleSelect = useCallback((id: string) => {
    setSelected(s =>
      s.includes(id)
        ? s.filter(x => x !== id)
        : s.length < 4 ? [...s, id] : s
    )
  }, [])

  async function handleDeleteClick(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    setJobToDelete(id)
    setDeleteConfirmOpen(true)
  }

  async function handleConfirmDelete() {
    if (!jobToDelete) return
    const id = jobToDelete
    setDeleting(id)
    try {
      await jobsApi.delete(id)
      await mutate()
      setSelected(s => s.filter(x => x !== id))
    } finally {
      setDeleting(null)
      setJobToDelete(null)
    }
  }

  const STATIC_HEADERS: { label: string; key?: SortKey }[] = [
    { label: '' },
    { label: 'NAME', key: 'name' },
    { label: 'STATUS' },
    { label: 'TARGET' },
    { label: 'pLDDT', key: 'plddt_score' },
    { label: 'ENERGY', key: 'rosetta_energy' },
    { label: 'TREND' },
    { label: 'CREATED', key: 'created_at' },
    { label: '' },
  ]

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Topbar
        title="Design jobs"
        subtitle={`${jobs.length} total · ${jobs.filter(j => j.status === 'running').length} running`}
        actions={
          <Button size="sm" onClick={() => setDialogOpen(true)} className="p-4 cursor-pointer flex justify-center items-center">
            <CircleFadingPlus className='h-4 w-4' />
            New job
          </Button>
        }
      />

      <FilterBar
        filters={filters}
        onUpdate={update}
        onReset={reset}
        totalCount={jobs.length}
        filteredCount={filtered.length}
      />

      <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{
          border: '1px solid var(--border)',
          borderRadius: 8,
          background: 'var(--bg-surface)',
          overflow: 'hidden',
        }}>
          {isLoading ? (
            <div style={{ padding: '48px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
              Loading jobs...
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title={jobs.length === 0 ? 'No jobs yet' : 'No jobs match filters'}
              description={jobs.length === 0
                ? 'Submit your first protein design job to start the RL optimization loop.'
                : 'Try adjusting your search or filter criteria.'
              }
              action={jobs.length === 0
                ? { label: 'Submit first job', onClick: () => setDialogOpen(true) }
                : { label: 'Reset filters', onClick: reset }
              }
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              }
            />
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '9px 14px', width: 36 }}>
                    <input
                      type="checkbox"
                      checked={selected.length === filtered.length && filtered.length > 0}
                      onChange={e => setSelected(e.target.checked ? filtered.map(j => j.id) : [])}
                      style={{ cursor: 'pointer', accentColor: 'var(--accent)' }}
                    />
                  </th>
                  {STATIC_HEADERS.slice(1).map((h, i) => (
                    h.key ? (
                      <SortHeader
                        key={h.label}
                        label={h.label}
                        sortKey={h.key}
                        current={filters.sortKey}
                        dir={filters.sortDir}
                        onClick={toggleSort}
                      />
                    ) : (
                      <th key={i} style={{
                        padding: '9px 14px',
                        textAlign: 'left',
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-muted)',
                        letterSpacing: '0.06em',
                        fontWeight: 400,
                      }}>
                        {h.label}
                      </th>
                    )
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((job, i) => {
                  const isSelected = selected.includes(job.id)
                  return (
                    <tr
                      key={job.id}
                      style={{
                        borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                        cursor: 'pointer',
                        transition: 'background 0.1s',
                        background: isSelected ? 'var(--accent-dim)' : 'transparent',
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-elevated)' }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                      onClick={() => router.push(`/jobs/${job.id}`)}
                    >

                      <td style={{ padding: '10px 14px' }} onClick={e => { e.stopPropagation(); toggleSelect(job.id) }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(job.id)}
                          style={{ cursor: 'pointer', accentColor: 'var(--accent)' }}
                        />
                      </td>


                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>
                          {truncate(job.name, 26)}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                          {truncate(job.sequence, 20)}
                        </div>
                      </td>

                      <td style={{ padding: '10px 14px' }}>
                        <StatusBadge status={job.status} />
                      </td>

                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                          {job.target_property ?? '—'}
                        </span>
                      </td>


                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontSize: '12px',
                          color: job.plddt_score
                            ? job.plddt_score >= 70 ? 'var(--accent)' : 'var(--amber)'
                            : 'var(--text-muted)',
                        }}>
                          {job.plddt_score ? job.plddt_score.toFixed(1) : '—'}
                        </span>
                      </td>

                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--cyan)' }}>
                          {job.rosetta_energy ? job.rosetta_energy.toFixed(1) : '—'}
                        </span>
                      </td>


                      <td style={{ padding: '10px 14px' }}>
                        {job.reward_history && job.reward_history.length > 1 ? (
                          <Sparkline
                            data={job.reward_history}
                            width={60} height={20}
                            color={job.status === 'completed' ? '#10b981' : 'var(--accent)'}
                          />
                        ) : (
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>—</span>
                        )}
                      </td>

                      <td style={{ padding: '10px 14px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                        {formatDate(job.created_at)}
                      </td>

                      <td style={{ padding: '10px 14px' }} onClick={e => e.stopPropagation()}>
                        <button
                          onClick={e => handleDeleteClick(job.id, e)}
                          disabled={deleting === job.id}
                          style={{
                            background: 'none', border: 'none',
                            color: 'var(--text-muted)', cursor: 'pointer',
                            padding: 4, borderRadius: 4,
                            transition: 'color 0.15s',
                            opacity: deleting === job.id ? 0.4 : 1,
                          }}
                          onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                        >
                          <Trash2Icon className='h-4 w-4' />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <CompareSelector
        selected={selected}
        jobs={jobs}
        onToggle={toggleSelect}
        onClear={() => setSelected([])}
      />

      <JobSubmitDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={() => mutate()}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleConfirmDelete}
        title="Delete design job"
        description="This will permanently delete the job and all associated structures. This action cannot be undone."
        confirmText="Delete job"
        variant="destructive"
      />
    </div>
  )
}
