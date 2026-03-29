'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Topbar from '@/components/layout/Topbar'
import { StatusBadge } from '@/components/shared/Badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useJobs } from '@/hooks/useJobs'
import { jobsApi } from '@/lib/api'
import { formatDate, truncate } from '@/lib/utils'
import { CircleFadingPlus, CircleX, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { toast } from 'sonner'

export default function JobsPage() {
  const router = useRouter()
  const { jobs, isLoading, mutate } = useJobs()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', sequence: '', target_property: 'thermostability' })
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [jobToDelete, setJobToDelete] = useState<string | null>(null)

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name) e.name = 'Job name is required'
    if (!form.sequence) e.sequence = 'Sequence is required'
    else if (!/^[ACDEFGHIKLMNPQRSTVWY]+$/i.test(form.sequence)) e.sequence = 'Invalid amino acid sequence'
    else if (form.sequence.length < 5) e.sequence = 'Sequence too short (min 5 residues)'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    try {
      const res = await jobsApi.create({
        name: form.name,
        sequence: form.sequence.toUpperCase(),
        target_property: form.target_property,
      })
      await mutate()
      toast.success('Job submitted successfully')
      setShowForm(false)
      setForm({ name: '', sequence: '', target_property: 'thermostability' })
      router.push(`/jobs/${res.data.id}`)
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to create job'
      setErrors({ submit: msg })
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    setJobToDelete(id)
    setDeleteConfirmOpen(true)
  }

  async function confirmDelete() {
    if (!jobToDelete) return
    try {
      await jobsApi.delete(jobToDelete)
      await mutate()
      toast.success('Job deleted successfully')
    } catch (err) {
      toast.error('Failed to delete job')
    } finally {
      setJobToDelete(null)
    }
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={confirmDelete}
        title="Delete Job"
        description="Are you sure you want to delete this design job? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />
      <Topbar
        title="Design Jobs"
        subtitle={`${jobs.length} total jobs`}
        actions={
          <Button size="lg" className="cursor-pointer" onClick={() => setShowForm(s => !s)}>
            {showForm ? (
              <>
                <CircleX className='h-14 w-14' />
                Cancel
              </>
            ) : (
              <>
                <CircleFadingPlus className='h-14 w-14' />
                New job
              </>
            )}
          </Button>
        }
      />

      <div style={{ padding: '28px', flex: 1 }}>

        {/* Job submission form */}
        {showForm && (
          <div style={{
            border: '1px solid var(--border)',
            borderRadius: 10,
            background: 'var(--bg-surface)',
            padding: '24px',
            marginBottom: 24,
            animation: 'fadeUp 0.2s ease',
          }}>
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 20 }}>
              Submit new protein design job
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <Input
                  label="JOB NAME"
                  placeholder="e.g. thermostable-variant-1"
                  value={form.name}
                  error={errors.name}
                  className='h-10 rounded-md'
                  onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: '' })) }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '10px', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
                    TARGET PROPERTY
                  </label>
                  <select
                    value={form.target_property}
                    onChange={e => setForm(p => ({ ...p, target_property: e.target.value }))}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      background: 'var(--bg-elevated)',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="thermostability">Thermostability</option>
                    <option value="solubility">Solubility</option>
                    <option value="binding_affinity">Binding affinity</option>
                    <option value="stability">General stability</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <Input
                  label="AMINO ACID SEQUENCE"
                  placeholder="MKTAYIAKQRQISFVKSHFSRQLEERLGLIEVQAPIL..."
                  value={form.sequence}
                  error={errors.sequence}
                  className='h-10 rounded-md'
                  onChange={e => { setForm(p => ({ ...p, sequence: e.target.value.toUpperCase() })); setErrors(p => ({ ...p, sequence: '' })) }}
                />
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                  {form.sequence.length} residues — use single-letter amino acid codes (A, C, D, E, F, G, H, I, K, L, M, N, P, Q, R, S, T, V, W, Y)
                </div>
              </div>
              {errors.submit && (
                <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(255,77,77,0.08)', border: '1px solid rgba(255,77,77,0.2)', color: 'var(--red)', fontSize: '12px', fontFamily: 'var(--font-mono)', marginBottom: 16 }}>
                  {errors.submit}
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }} className='justify-end items-end'>
                <Button type="submit" isLoading={submitting} className="bg-accent cursor-pointer rounded-md px-4 py-1">
                  {submitting ? 'Submitting...' : 'Submit job'}
                </Button>
                <Button type="button" className="bg-secondary text-gray-100 cursor-pointer rounded-md" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Jobs table */}
        <div style={{
          border: '1px solid var(--border)',
          borderRadius: 10,
          background: 'var(--bg-surface)',
          overflow: 'hidden',
        }}>
          {isLoading ? (
            <div style={{ padding: 48, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
              Loading...
            </div>
          ) : jobs.length === 0 ? (
            <div style={{ padding: '64px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: 20 }}>
                No jobs yet. Submit your first protein design job.
              </div>
              <Button size="sm" onClick={() => setShowForm(true)}>Submit first job</Button>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Name', 'Sequence', 'Target', 'Status', 'pLDDT', 'Energy', 'Created', ''].map(h => (
                    <th key={h} style={{
                      padding: '10px 16px',
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
                {jobs.map((job, i) => (
                  <tr
                    key={job.id}
                    style={{
                      borderBottom: i < jobs.length - 1 ? '1px solid var(--border)' : 'none',
                      cursor: 'pointer',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => router.push(`/jobs/${job.id}`)}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {truncate(job.name, 22)}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                        {truncate(job.sequence, 18)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {job.target_property ?? '—'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <StatusBadge status={job.status} />
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--accent)' }}>
                      {job.plddt_score ? job.plddt_score.toFixed(1) : '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--cyan)' }}>
                      {job.rosetta_energy ? job.rosetta_energy.toFixed(1) : '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {formatDate(job.created_at)}
                    </td>
                    <td style={{ padding: '12px 16px' }} onClick={e => e.stopPropagation()}>
                      <button
                        className='bg-red-200'
                        onClick={e => handleDelete(job.id, e)}
                        style={{
                          border: 'none',
                          color: 'var(--text-muted)', cursor: 'pointer',
                          padding: 4, borderRadius: 4,
                          transition: 'color 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                      >
                        <Trash2 className='h-4 w-4 text-red-500' />
                      </button>
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
