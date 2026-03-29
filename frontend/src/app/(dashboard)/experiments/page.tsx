'use client'

import { useState } from 'react'
import Topbar from '@/components/layout/Topbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { experimentsApi } from '@/lib/api'

import useSWR from 'swr'
import { Experiment } from '@/types'
import { formatDate } from '@/lib/utils'
import { CircleFadingPlus, CircleX, FlaskConicalOff } from 'lucide-react'

export default function ExperimentsPage() {
  const { data: experiments = [], mutate } = useSWR<Experiment[]>(
    'experiments',
    () => experimentsApi.list().then(r => r.data),
    { refreshInterval: 10000 }
  )
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name) return
    setSubmitting(true)
    try {
      await experimentsApi.create(form)
      await mutate()
      setShowForm(false)
      setForm({ name: '', description: '' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Topbar
        title="Experiments"
        subtitle={`${experiments.length} experiments`}
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
                New experiment
              </>
            )}

          </Button>
        }
      />

      <div style={{ padding: '28px', flex: 1 }}>
        {showForm && (
          <div style={{ border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg-surface)', padding: '24px', marginBottom: 24 }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Input label="NAME" placeholder="Experiment name" className='h-10 rounded-md' value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              <Input label="DESCRIPTION" placeholder="Optional description" className='h-10 rounded-md' value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              <div style={{ display: 'flex', gap: 10 }} className='justify-end items-end'>
                <Button type="submit" isLoading={submitting} className="bg-accent cursor-pointer rounded-md px-4 py-1">Create</Button>
                <Button type="button" className="bg-secondary text-gray-100 cursor-pointer rounded-md" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {experiments.map(exp => (
            <div key={exp.id} style={{
              border: '1px solid var(--border)',
              borderRadius: 10,
              background: 'var(--bg-surface)',
              padding: '20px',
              cursor: 'default',
              transition: 'border-color 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-focus)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6 }}>{exp.name}</div>
              {exp.description && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 12 }}>{exp.description}</div>}
              <div style={{ display: 'flex', gap: 16 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', color: 'var(--accent)', fontWeight: 500 }}>{exp.total_jobs}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>JOBS</div>
                </div>
                {exp.best_plddt && (
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', color: 'var(--emerald)', fontWeight: 500 }}>{exp.best_plddt.toFixed(1)}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>BEST pLDDT</div>
                  </div>
                )}
              </div>
              <div style={{ marginTop: 12, fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {formatDate(exp.created_at)}
              </div>
            </div>
          ))}
          {experiments.length === 0 && (
            <div style={{ gridColumn: '1/-1', padding: '48px 20px', textAlign: 'center', fontSize: '15px', color: 'var(--text-muted)' }} className='flex flex-col justify-center items-center gap-8' >
              <FlaskConicalOff className='h-20 w-20' />
              No experiments yet. Create one to group related jobs.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
