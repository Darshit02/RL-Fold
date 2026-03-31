'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store'
import { authApi } from '@/lib/api'
import Sidebar from './Sidebar'
import Image from 'next/image'
import LOGO from '../../../public/logo/logo.svg'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { token, setUser, logout } = useAppStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (!token) { router.push('/login'); return }
    authApi.me()
      .then(r => setUser(r.data))
      .catch(() => { logout(); router.push('/login') })
  }, [token])

  if (!token) return null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 40,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Sidebar */}
      <div style={{
        position: isMobile ? 'fixed' : 'sticky',
        top: 0,
        left: 0,
        zIndex: isMobile ? 50 : 'auto',
        transform: isMobile
          ? sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'
          : 'none',
        transition: 'transform 0.25s ease',
        height: '100vh',
        flexShrink: 0,
      }}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* Mobile topbar hamburger */}
        {isMobile && (
          <div style={{
            height: 52,
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg-surface)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            gap: 12,
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                background: 'none', border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer', padding: 4, borderRadius: 6,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}

        {children}
      </div>
    </div>
  )
}
