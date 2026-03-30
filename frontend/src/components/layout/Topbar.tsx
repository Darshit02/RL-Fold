'use client'

import { ThemeToggle } from "../ui/ThemeToggle"

interface TopbarProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export default function Topbar({ title, subtitle, actions }: TopbarProps) {
  return (
    <div style={{
      height: 70,
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 28px',
      background: 'var(--bg-surface)',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <div>
        <h1 style={{
          fontSize: '18px',
          fontWeight: 500,
          color: 'var(--text-primary)',
          lineHeight: 1,
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{
            fontSize: '14px',
            color: 'var(--text-muted)',
            marginTop: 3,
            fontFamily: 'var(--font-mono)',
          }}>
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">

        {actions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {actions}
          </div>
        )}
        {/* <ThemeToggle /> */}
      </div>
    </div>
  )
}
