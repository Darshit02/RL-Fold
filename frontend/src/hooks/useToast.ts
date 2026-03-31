import { toast } from 'sonner'

export function useToast() {
  return {
    success: (message: string, description?: string) =>
      toast.success(message, {
        description,
        style: {
          background: 'var(--bg-elevated)',
          border: '1px solid rgba(16,185,129,0.3)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
        },
      }),

    error: (message: string, description?: string) =>
      toast.error(message, {
        description,
        style: {
          background: 'var(--bg-elevated)',
          border: '1px solid rgba(255,77,77,0.3)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
        },
      }),

    info: (message: string, description?: string) =>
      toast(message, {
        description,
        style: {
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
        },
      }),

    loading: (message: string) =>
      toast.loading(message, {
        style: {
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
        },
      }),
  }
}
