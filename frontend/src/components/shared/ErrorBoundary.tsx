'use client'

import { Component, ReactNode } from 'react'
import {Button} from '@/components/ui/button'

interface Props { children: ReactNode }
interface State { hasError: boolean; message: string }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        gap: 16,
      }}>
        <div style={{
          width: 48, height: 48,
          borderRadius: '50%',
          background: 'rgba(255,77,77,0.08)',
          border: '1px solid rgba(255,77,77,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#ff4d4d" strokeWidth="1.5"/>
            <path d="M12 8v4M12 16h.01" stroke="#ff4d4d" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6 }}>
            Something went wrong
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', maxWidth: 400 }}>
            {this.state.message}
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => this.setState({ hasError: false, message: '' })}
        >
          Try again
        </Button>
      </div>
    )
  }
}
