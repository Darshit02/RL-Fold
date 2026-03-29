'use client'

import { use } from 'react'
import { useJob } from '@/hooks/useJobs'
import { useJobMetrics } from '@/hooks/useWebSocket'
import { resultsApi } from '@/lib/api'
import Topbar from '@/components/layout/Topbar'
import { StatusBadge } from '@/components/shared/Badge'
import { StatCard } from '@/components/shared/StatCard'
import { Button } from '@/components/ui/button'
import { formatDate, truncate } from '@/lib/utils'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { job, isLoading } = useJob(id)
  const metrics = useJobMetrics(job?.status === 'running' ? id : null)

  const chartData = metrics.map(m => ({
    step: m.step,
    reward: +(m.reward * 100).toFixed(1),
    plddt: +m.plddt.toFixed(1),
    energy: +Math.abs(m.energy).toFixed(1),
  }))

  if (isLoading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
        Loading job...
      </span>
    </div>
  )

  if (!job) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--red)' }}>
        Job not found
      </span>
    </div>
  )

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Topbar
        title={job.name}
        subtitle={`Job ID: ${job.id}`}
        actions={
          job.status === 'completed' && (
            <a href={resultsApi.downloadUrl(job.id)} download>
              <Button size="sm" variant="ghost">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M12 15V3M7 10l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 21h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Download PDB
              </Button>
            </a>
          )
        }
      />

      <div style={{ padding: '28px', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Status + meta */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '16px 20px',
          borderRadius: 10,
          border: '1px solid var(--border)',
          background: 'var(--bg-surface)',
        }}>
          <StatusBadge status={job.status} />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Target: {job.target_property ?? 'general'}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Created: {formatDate(job.created_at)}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>
            Updated: {formatDate(job.updated_at)}
          </span>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <StatCard
            label="pLDDT score"
            value={job.plddt_score ? job.plddt_score.toFixed(1) : metrics.length ? metrics[metrics.length - 1].plddt.toFixed(1) : '—'}
            sub="Structure confidence"
            accent
          />
          <StatCard
            label="Rosetta energy"
            value={job.rosetta_energy ? job.rosetta_energy.toFixed(1) : metrics.length ? metrics[metrics.length - 1].energy.toFixed(1) : '—'}
            sub="REU (lower = better)"
          />
          <StatCard
            label="Episodes"
            value={metrics.length > 0 ? `${metrics[metrics.length - 1].step + 1}/50` : job.status === 'completed' ? '50/50' : '0/50'}
            sub="RL training steps"
          />
          <StatCard
            label="Best reward"
            value={metrics.length ? (Math.max(...metrics.map(m => m.reward)) * 100).toFixed(1) + '%' : '—'}
            sub="Composite reward"
            accent
          />
        </div>

        {/* Live reward chart */}
        <div style={{
          border: '1px solid var(--border)',
          borderRadius: 10,
          background: 'var(--bg-surface)',
          padding: '20px',
          flex: 1,
          minHeight: 320,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                Live training metrics
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 3 }}>
                {job.status === 'running' ? 'Streaming via WebSocket...' : job.status === 'completed' ? 'Training complete' : 'Waiting for agent to start...'}
              </div>
            </div>
            {job.status === 'running' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', animation: 'pulse-dot 1s infinite' }} />
                Live
              </div>
            )}
          </div>

          {chartData.length === 0 ? (
            <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
                {job.status === 'pending' ? 'Job queued — waiting for worker...' : 'No metrics yet'}
              </span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="step"
                  tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                  tickLine={false}
                  label={{ value: 'Episode', position: 'insideBottom', offset: -2, fill: 'var(--text-muted)', fontSize: 11 }}
                />
                <YAxis
                  tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                  tickLine={false}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    color: 'var(--text-primary)',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}
                />
                <Line type="monotone" dataKey="plddt" stroke="var(--accent)" strokeWidth={2} dot={false} name="pLDDT" />
                <Line type="monotone" dataKey="reward" stroke="#22d3ee" strokeWidth={2} dot={false} name="Reward %" />
                <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="|Energy|" strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Sequence viewer */}
        <div style={{
          border: '1px solid var(--border)',
          borderRadius: 10,
          background: 'var(--bg-surface)',
          padding: '20px',
        }}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 12 }}>
            Amino acid sequence
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            letterSpacing: '0.12em',
            lineHeight: 2,
            wordBreak: 'break-all',
            padding: '12px 16px',
            borderRadius: 8,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
          }}>
            {job.sequence}
          </div>
          <div style={{ marginTop: 8, fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {job.sequence.length} residues
          </div>
        </div>
      </div>
    </div>
  )
}
