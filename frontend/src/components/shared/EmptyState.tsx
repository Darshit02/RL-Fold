import {Button} from '@/components/ui/button'

interface EmptyStateProps {
  title:       string
  description: string
  action?:     { label: string; onClick: () => void }
  icon?:       React.ReactNode
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '64px 20px',
      gap: 14,
      textAlign: 'center',
    }}>
      {icon && (
        <div style={{
          width: 48, height: 48,
          borderRadius: '50%',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          marginBottom: 4,
        }}>
          {icon}
        </div>
      )}
      <div>
        <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6 }}>
          {title}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: 320, lineHeight: 1.6 }}>
          {description}
        </div>
      </div>
      {action && (
        <Button size="sm" onClick={action.onClick} style={{ marginTop: 4 }}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
