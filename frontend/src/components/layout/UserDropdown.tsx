'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAppStore } from '@/store'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'

export function UserDropdown() {
  const router = useRouter()
  const { user, logout } = useAppStore()
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)

  function handleLogout() {
    logout()
    router.push('/login')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          padding: '8px 10px',
          borderRadius: 7,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          transition: 'background 0.15s',
          textAlign: 'left',
        }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <Avatar style={{ width: 28, height: 28, flexShrink: 0 }}>
            <AvatarFallback style={{
              background: 'var(--accent-dim)',
              border: '1px solid var(--accent)',
              color: 'var(--accent)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 500,
            }}>
              {user?.username?.[0]?.toUpperCase() ?? 'U'}
            </AvatarFallback>
          </Avatar>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.username ?? 'User'}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>
              {user?.email ?? ''}
            </div>
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="top"
        align="start"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          width: 200,
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
        }}
      >
        <DropdownMenuLabel style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '0.08em' }}>
          ACCOUNT
        </DropdownMenuLabel>
        <DropdownMenuSeparator style={{ background: 'var(--border)' }} />
        <DropdownMenuItem
          onClick={() => router.push('/settings')}
          style={{ color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ marginRight: 8 }}>
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push('/dashboard')}
          style={{ color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ marginRight: 8 }}>
            <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuSeparator style={{ background: 'var(--border)' }} />
        <DropdownMenuItem
          onClick={() => setLogoutConfirmOpen(true)}
          style={{ color: 'var(--red)', cursor: 'pointer', fontSize: '12px' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ marginRight: 8 }}>
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>

      <ConfirmDialog
        open={logoutConfirmOpen}
        onOpenChange={setLogoutConfirmOpen}
        onConfirm={handleLogout}
        title="Sign out"
        description="Are you sure you want to sign out of your account?"
        confirmText="Sign out"
        variant="destructive"
      />
    </DropdownMenu>
  )
}
