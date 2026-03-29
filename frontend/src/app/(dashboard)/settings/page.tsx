'use client'

import Topbar from '@/components/layout/Topbar'
import { useAppStore } from '@/store'

export default function SettingsPage() {
  const { user } = useAppStore()

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Topbar title="Settings" subtitle="Account and preferences" />
      <div style={{ padding: '28px', flex: 1 }}>
        <div style={{
          border: '1px solid var(--border)',
          borderRadius: 10,
          background: 'var(--bg-surface)',
          padding: '24px',
          maxWidth: 480,
        }}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 20 }}>
            Account details
          </div>
          {[
            { label: 'Username', value: user?.username },
            { label: 'Email', value: user?.email },
            { label: 'Account ID', value: user?.id },
            { label: 'Status', value: user?.is_active ? 'Active' : 'Inactive' },
          ].map(row => (
            <div key={row.label} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 0',
              borderBottom: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {row.label}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {row.value ?? '—'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
