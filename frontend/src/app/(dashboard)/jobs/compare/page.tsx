'use client'

import { use, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useJob } from '@/hooks/useJobs'
import Topbar from '@/components/layout/Topbar'
import { StatusBadge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis,
    ResponsiveContainer, Tooltip, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'
import { Sparkline } from '@/components/shared/Sparkline'

const COLORS = ['#00d4aa', '#22d3ee', '#f59e0b', '#a78bfa']

function JobColumn({ id, color }: { id: string; color: string }) {
    const { job, isLoading } = useJob(id)

    if (isLoading) return (
        <div style={{ flex: 1, padding: 20, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                Loading...
            </div>
        </div>
    )

    if (!job) return (
        <div style={{ flex: 1, padding: 20, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--red)' }}>
                Job not found
            </div>
        </div>
    )

    const metrics = [
        { label: 'pLDDT', value: job.plddt_score?.toFixed(1) ?? '—', accent: true },
        { label: 'Rosetta energy', value: job.rosetta_energy?.toFixed(1) ?? '—', accent: false },
        { label: 'Status', value: null, accent: false },
        { label: 'Target', value: job.target_property ?? '—', accent: false },
        { label: 'Residues', value: job.sequence.length, accent: false },
        { label: 'Created', value: formatDate(job.created_at), accent: false },
    ]

    return (
        <div style={{
            flex: 1,
            borderRight: '1px solid var(--border)',
            padding: '16px 20px',
            minWidth: 0,
        }}>
            <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                marginBottom: 16, paddingBottom: 12,
                borderBottom: '1px solid var(--border)',
            }}>
                <div style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: color, flexShrink: 0,
                }} />
                <div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {job.name}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                        {job.id.slice(0, 8)}...
                    </div>
                </div>
            </div>

            {metrics.map(m => (
                <div key={m.label} style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', padding: '8px 0',
                    borderBottom: '1px solid var(--border)',
                    fontSize: '12px',
                }}>
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                        {m.label}
                    </span>
                    {m.label === 'Status' ? (
                        <StatusBadge status={job.status} />
                    ) : (
                        <span style={{
                            color: m.accent ? color : 'var(--text-primary)',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: m.accent ? 500 : 400,
                        }}>
                            {m.value}
                        </span>
                    )}
                </div>
            ))}

            {job.reward_history && job.reward_history.length > 1 && (
                <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 8, letterSpacing: '0.06em' }}>
                        REWARD TREND
                    </div>
                    <Sparkline
                        data={job.reward_history}
                        width={160} height={40}
                        color={color}
                    />
                </div>
            )}

            {/* Sequence */}
            <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 6, letterSpacing: '0.06em' }}>
                    SEQUENCE
                </div>
                <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '10px',
                    color: 'var(--text-secondary)', letterSpacing: '0.1em',
                    lineHeight: 1.8, wordBreak: 'break-all',
                    padding: '8px 10px', borderRadius: 6,
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                }}>
                    {job.sequence}
                </div>
            </div>
        </div>
    )
}

function CompareCharts({ ids }: { ids: string[] }) {
    const jobs = ids.map(id => useJob(id).job).filter(Boolean)

    if (jobs.length < 2) return null

    const maxLen = Math.max(...jobs.map(j => j!.reward_history?.length ?? 0))

    const lineData = Array.from({ length: maxLen }, (_, i) => {
        const point: Record<string, any> = { step: i }
        jobs.forEach((job, ji) => {
            if (job?.reward_history?.[i] !== undefined) {
                point[`job${ji}`] = +(job.reward_history[i] * 100).toFixed(1)
            }
        })
        return point
    })

    const radarData = [
        { metric: 'pLDDT', ...Object.fromEntries(jobs.map((j, i) => [`job${i}`, j?.plddt_score ?? 0])) },
        { metric: 'Stability', ...Object.fromEntries(jobs.map((j, i) => [`job${i}`, Math.min(100, Math.abs((j?.rosetta_energy ?? 0) / 2))])) },
        { metric: 'Length', ...Object.fromEntries(jobs.map((j, i) => [`job${i}`, Math.min(100, (j?.sequence.length ?? 0) / 2)])) },
    ]

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: '20px 24px' }}>

            {/* Reward curves */}
            {lineData.length > 0 && (
                <div style={{
                    border: '1px solid var(--border)', borderRadius: 8,
                    background: 'var(--bg-surface)', padding: 16,
                }}>
                    <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: 12, letterSpacing: '0.06em' }}>
                        REWARD CURVES
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={lineData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="step" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
                            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} width={32} />
                            <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11, fontFamily: 'var(--font-mono)' }} />
                            {jobs.map((_, i) => (
                                <Line key={i} type="monotone" dataKey={`job${i}`} stroke={COLORS[i]} strokeWidth={1.5} dot={false} name={jobs[i]?.name ?? `Job ${i + 1}`} />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
            <div style={{
                border: '1px solid var(--border)', borderRadius: 8,
                background: 'var(--bg-surface)', padding: 16,
            }}>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: 12, letterSpacing: '0.06em' }}>
                    METRIC COMPARISON
                </div>
                <ResponsiveContainer width="100%" height={180}>
                    <RadarChart data={radarData}>
                        <PolarGrid stroke="var(--border)" />
                        <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }} />
                        {jobs.map((job, i) => (
                            <Radar key={i} name={job?.name ?? `Job ${i + 1}`} dataKey={`job${i}`} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.1} />
                        ))}
                        <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11, fontFamily: 'var(--font-mono)' }} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

function ComparePageInner() {
    const params = useSearchParams()
    const ids = (params.get('ids') ?? '').split(',').filter(Boolean).slice(0, 4)

    if (ids.length < 2) return (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: 8 }}>
                    Select at least 2 jobs to compare
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Go to Jobs → check boxes → click Compare
                </div>
            </div>
        </div>
    )

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Topbar
                title="Compare jobs"
                subtitle={`Comparing ${ids.length} jobs`}
            />

            <CompareCharts ids={ids} />
            <div style={{
                display: 'flex',
                flex: 1,
                borderTop: '1px solid var(--border)',
                overflow: 'auto',
            }}>
                {ids.map((id, i) => (
                    <JobColumn key={id} id={id} color={COLORS[i]} />
                ))}
            </div>
        </div>
    )
}

export default function ComparePage() {
    return (
        <Suspense fallback={
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
                    Loading...
                </span>
            </div>
        }>
            <ComparePageInner />
        </Suspense>
    )
}
