'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store'
import { authApi } from '@/lib/api'
import Sidebar from './Sidebar'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { token, setUser, logout } = useAppStore()

  useEffect(() => {
    if (!token) {
      router.push('/login')
      return
    }
    authApi.me()
      .then(r => setUser(r.data))
      .catch(() => {
        logout()
        router.push('/login')
      })
  }, [token])

  if (!token) return null

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--bg-base)',
    }}>
      <Sidebar />
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        overflow: 'hidden',
      }}>
        {children}
      </div>
    </div>
  )
}
