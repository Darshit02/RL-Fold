"use client"

import { useEffect, useRef, useState } from 'react'

interface PDBViewerProps {
    jobId: String
    plddt?: number | null
}


type Style = "cartoon" | 'surface' | 'stick' | 'sphere'

const STYLES: { label: string; value: Style }[] = [
    { label: 'Cartoon', value: 'cartoon' },
    { label: 'Surface', value: 'surface' },
    { label: 'Stick', value: 'stick' },
    { label: 'Sphere', value: 'sphere' },
]
// pLDDT color scheme — same as AlphaFold
// Blue = very high (>90), Cyan = confident (70-90)
// Yellow = low (50-70), Orange = very low (<50)

function plddtColorscheme() {
    return {
        prop: 'b',  // B-factor column stores pLDDT in ESMFold output
        gradient: 'roygb',
        min: 0,
        max: 100,
    }
}

export default function PDBViewer({ jobId, plddt }: PDBViewerProps) {
    const viewerRef = useRef<HTMLDivElement>(null)
    const viewer3d = useRef<any>(null)
    const [style, setStyle] = useState<Style>('cartoon')
    const [spin, setSpin] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [colorMode, setColorMode] = useState<'plddt' | 'chain' | 'spectrum'>('plddt')

    useEffect(() => {
        if (typeof window === 'undefined') return

        const init = async () => {
            try {
                setLoading(true)
                setError('')
                const $3Dmol = await import('3dmol')
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/results/${jobId}/download`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
                        },
                    }
                )
                if (!res.ok) throw new Error('Structure not ready yet')
                const pdbData = await res.text()
                if (!viewerRef.current) return
                if (viewer3d.current) {
                    viewer3d.current.clear()
                }
                const viewer = $3Dmol.createViewer(viewerRef.current, {
                    antialias: true,
                    id: `viewer-${jobId}`,
                })
                viewer.setBackgroundColor(0xffffff, 0)

                viewer3d.current = viewer
                viewer.addModel(pdbData, 'pdb')
                applyStyle(viewer, 'cartoon', 'plddt')

                viewer.zoomTo()
                viewer.render()
                viewer.zoom(0.85)

                setLoading(false)
            } catch (err: any) {
                setError(err.message || 'Failed to load structure')
                setLoading(false)
            }
        }

        init()

        return () => {
            if (viewer3d.current) {
                try { viewer3d.current.clear() } catch { }
            }
        }
    }, [jobId])

    function applyStyle(viewer: any, s: Style, c: typeof colorMode) {
        viewer.setStyle({}, {})

        const colorSpec = c === 'plddt'
            ? { colorscheme: plddtColorscheme() }
            : c === 'chain'
                ? { colorscheme: 'chain' }
                : { colorscheme: 'spectrum' }

        switch (s) {
            case 'cartoon':
                viewer.setStyle({}, { cartoon: colorSpec })
                break
            case 'surface':
                viewer.setStyle({}, { cartoon: { ...colorSpec, opacity: 0.3 } })
                viewer.addSurface('VDW', { opacity: 0.7, ...colorSpec })
                break
            case 'stick':
                viewer.setStyle({}, { stick: colorSpec })
                break
            case 'sphere':
                viewer.setStyle({}, { sphere: { ...colorSpec, scale: 0.4 } })
                break
        }
        viewer.render()
    }

    function handleStyle(s: Style) {
        setStyle(s)
        if (viewer3d.current) applyStyle(viewer3d.current, s, colorMode)
    }

    function handleColor(c: typeof colorMode) {
        setColorMode(c)
        if (viewer3d.current) applyStyle(viewer3d.current, style, c)
    }

    function handleSpin() {
        setSpin(prev => {
            const next = !prev
            if (viewer3d.current) {
                if (next) viewer3d.current.spin('y', 1)
                else viewer3d.current.spin(false)
            }
            return next
        })
    }

    function handleReset() {
        if (!viewer3d.current) return
        viewer3d.current.zoomTo()
        viewer3d.current.zoom(0.85)
        viewer3d.current.render()
    }

    function handleScreenshot() {
        if (!viewer3d.current) return
        const img = viewer3d.current.pngURI()
        const a = document.createElement('a')
        a.href = img
        a.download = `rlfold-structure-${jobId}.png`
        a.click()
    }

    return (
        <div style={{
            border: '1px solid var(--border)',
            borderRadius: 10,
            background: 'var(--bg-surface)',
            overflow: 'hidden',
        }}>

            {/* Header */}
            <div style={{
                padding: '14px 20px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 10,
            }}>
                <div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        3D Structure Viewer
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                        {loading ? 'Loading structure...' : error ? 'Structure unavailable' : 'Drag to rotate · Scroll to zoom · Right-click to pan'}
                    </div>
                </div>
                {!loading && !error && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <div style={{
                            display: 'flex',
                            borderRadius: 6,
                            border: '1px solid var(--border)',
                            overflow: 'hidden',
                        }}>
                            {STYLES.map(s => (
                                <button
                                    key={s.value}
                                    onClick={() => handleStyle(s.value)}
                                    style={{
                                        padding: '5px 10px',
                                        fontSize: '11px',
                                        fontFamily: 'var(--font-mono)',
                                        border: 'none',
                                        borderRight: '1px solid var(--border)',
                                        background: style === s.value ? 'var(--accent-dim)' : 'transparent',
                                        color: style === s.value ? 'var(--accent)' : 'var(--text-muted)',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                        <div style={{
                            display: 'flex',
                            borderRadius: 6,
                            border: '1px solid var(--border)',
                            overflow: 'hidden',
                        }}>
                            {[
                                { label: 'pLDDT', value: 'plddt' as const },
                                { label: 'Chain', value: 'chain' as const },
                                { label: 'Rainbow', value: 'spectrum' as const },
                            ].map(c => (
                                <button
                                    key={c.value}
                                    onClick={() => handleColor(c.value)}
                                    style={{
                                        padding: '5px 10px',
                                        fontSize: '11px',
                                        fontFamily: 'var(--font-mono)',
                                        border: 'none',
                                        borderRight: '1px solid var(--border)',
                                        background: colorMode === c.value ? 'var(--accent-dim)' : 'transparent',
                                        color: colorMode === c.value ? 'var(--accent)' : 'var(--text-muted)',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    {c.label}
                                </button>
                            ))}
                        </div>
                        {[
                            {
                                label: spin ? 'Stop' : 'Spin',
                                onClick: handleSpin,
                                active: spin,
                                icon: (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                        <path d="M21 12a9 9 0 11-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        <path d="M21 3v9h-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                ),
                            },
                            {
                                label: 'Reset',
                                onClick: handleReset,
                                active: false,
                                icon: (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                        <path d="M3 12a9 9 0 109-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        <path d="M3 3v9h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                ),
                            },
                            {
                                label: 'PNG',
                                onClick: handleScreenshot,
                                active: false,
                                icon: (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                ),
                            },
                        ].map(btn => (
                            <button
                                key={btn.label}
                                onClick={btn.onClick}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 5,
                                    padding: '5px 10px',
                                    fontSize: '11px',
                                    fontFamily: 'var(--font-mono)',
                                    borderRadius: 6,
                                    border: '1px solid var(--border)',
                                    background: btn.active ? 'var(--accent-dim)' : 'transparent',
                                    color: btn.active ? 'var(--accent)' : 'var(--text-muted)',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                }}
                                onMouseEnter={e => {
                                    if (!btn.active) e.currentTarget.style.borderColor = 'var(--border-focus)'
                                }}
                                onMouseLeave={e => {
                                    if (!btn.active) e.currentTarget.style.borderColor = 'var(--border)'
                                }}
                            >
                                {btn.icon}
                                {btn.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <div style={{ position: 'relative', height: 420, background: 'var(--bg-base)' }}>
                <div
                    ref={viewerRef}
                    style={{
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        inset: 0,
                    }}
                />
                {loading && (
                    <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        background: 'var(--bg-base)',
                        gap: 12,
                    }}>
                        <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="var(--border)" strokeWidth="3" />
                            <path d="M12 2a10 10 0 0110 10" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
                            Loading 3D structure...
                        </span>
                    </div>
                )}
                {error && !loading && (
                    <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        gap: 12,
                    }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: '50%',
                            background: 'rgba(255,77,77,0.08)',
                            border: '1px solid rgba(255,77,77,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="#ff4d4d" strokeWidth="1.5" />
                                <path d="M12 8v4M12 16h.01" stroke="#ff4d4d" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 4 }}>
                                Structure not available
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                {error}
                            </div>
                        </div>
                    </div>
                )}
                {!loading && !error && colorMode === 'plddt' && (
                    <div style={{
                        position: 'absolute',
                        bottom: 16, left: 16,
                        background: 'rgba(10,10,10,0.75)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        padding: '10px 14px',
                        fontFamily: 'var(--font-mono)',
                    }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.08em' }}>
                            pLDDT CONFIDENCE
                        </div>
                        {[
                            { color: '#0053D6', label: 'Very high (>90)' },
                            { color: '#65CBF3', label: 'Confident (70-90)' },
                            { color: '#FFDB13', label: 'Low (50-70)' },
                            { color: '#FF7D45', label: 'Very low (<50)' },
                        ].map(item => (
                            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <div style={{ width: 10, height: 10, borderRadius: 2, background: item.color, flexShrink: 0 }} />
                                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{item.label}</span>
                            </div>
                        ))}
                    </div>
                )}
                {!loading && !error && plddt && (
                    <div style={{
                        position: 'absolute',
                        top: 16, right: 16,
                        background: 'rgba(10,10,10,0.75)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        padding: '10px 14px',
                        fontFamily: 'var(--font-mono)',
                        textAlign: 'center',
                    }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 4 }}>
                            MEAN pLDDT
                        </div>
                        <div style={{
                            fontSize: '22px',
                            fontWeight: 500,
                            color: plddt >= 70 ? 'var(--accent)' : plddt >= 50 ? 'var(--amber)' : 'var(--red)',
                        }}>
                            {plddt.toFixed(1)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}