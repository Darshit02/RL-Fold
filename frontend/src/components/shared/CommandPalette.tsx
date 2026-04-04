'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Command {
  id:       string
  label:    string
  shortcut?: string
  category: string
  action:   () => void
}

interface Props {
  open:    boolean
  onClose: () => void
}

export function CommandPalette({ open, onClose }: Props) {
  const router  = useRouter()
  const [query, setQuery]   = useState('')
  const [cursor, setCursor] = useState(0)

  const commands: Command[] = [
    { id: 'dashboard',    label: 'Go to dashboard',        category: 'Navigate', action: () => router.push('/dashboard') },
    { id: 'jobs',         label: 'Go to jobs',             category: 'Navigate', action: () => router.push('/jobs') },
    { id: 'experiments',  label: 'Go to experiments',      category: 'Navigate', action: () => router.push('/experiments') },
    { id: 'settings',     label: 'Go to settings',         category: 'Navigate', action: () => router.push('/settings') },
    { id: 'new-job',      label: 'Submit new design job',  category: 'Actions',  shortcut: '⌘N', action: () => { router.push('/jobs'); onClose() } },
    { id: 'compare',      label: 'Compare jobs',           category: 'Actions',  action: () => router.push('/jobs/compare') },
    { id: 'templates',    label: 'Browse templates',       category: 'Actions',  action: () => router.push('/templates') },
    { id: 'docs',         label: 'Open documentation',     category: 'Help',     action: () => window.open('/docs', '_blank') },
  ]

  const filtered = query.trim()
    ? commands.filter(c =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase())
      )
    : commands

  useEffect(() => { setCursor(0) }, [query])

  useEffect(() => {
    if (!open) { setQuery(''); setCursor(0) }
  }, [open])

  const run = useCallback((cmd: Command) => {
    cmd.action()
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, filtered.length - 1)) }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)) }
      if (e.key === 'Enter')     { e.preventDefault(); if (filtered[cursor]) run(filtered[cursor]) }
      if (e.key === 'Escape')    { onClose() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, cursor, filtered, run, onClose])

  if (!open) return null

  const groups = ['Navigate', 'Actions', 'Help']

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'center', paddingTop: 120,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 520,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search commands..."
            style={{
              flex: 1, border: 'none', outline: 'none',
              background: 'transparent',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
            }}
          />
          <kbd style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px',
            color: 'var(--text-muted)',
            background: 'var(--bg-hover)',
            border: '1px solid var(--border)',
            borderRadius: 4, padding: '2px 6px',
          }}>
            ESC
          </kbd>
        </div>

        <div style={{ maxHeight: 360, overflowY: 'auto', padding: '6px 0' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              No commands found
            </div>
          ) : (
            groups.map(group => {
              const items = filtered.filter(c => c.category === group)
              if (!items.length) return null
              return (
                <div key={group}>
                  <div style={{
                    padding: '6px 16px 4px',
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-muted)',
                    letterSpacing: '0.08em',
                  }}>
                    {group.toUpperCase()}
                  </div>
                  {items.map((cmd, i) => {
                    const globalIdx = filtered.indexOf(cmd)
                    const active    = globalIdx === cursor
                    return (
                      <div
                        key={cmd.id}
                        onClick={() => run(cmd)}
                        onMouseEnter={() => setCursor(globalIdx)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 16px',
                          cursor: 'pointer',
                          background: active ? 'var(--accent-dim)' : 'transparent',
                          transition: 'background 0.1s',
                        }}
                      >
                        <span style={{
                          fontSize: '13px',
                          color: active ? 'var(--accent)' : 'var(--text-primary)',
                          fontFamily: 'var(--font-sans)',
                        }}>
                          {cmd.label}
                        </span>
                        {cmd.shortcut && (
                          <kbd style={{
                            fontFamily: 'var(--font-mono)', fontSize: '10px',
                            color: 'var(--text-muted)',
                            background: 'var(--bg-hover)',
                            border: '1px solid var(--border)',
                            borderRadius: 4, padding: '2px 6px',
                          }}>
                            {cmd.shortcut}
                          </kbd>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })
          )}
        </div>

        <div style={{
          padding: '8px 16px',
          borderTop: '1px solid var(--border)',
          display: 'flex', gap: 16,
          fontSize: '10px', fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
        }}>
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>ESC close</span>
        </div>
      </div>
    </div>
  )
}
