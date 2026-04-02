import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  borderRadius?: number
  style?: React.CSSProperties
}

export function Skeleton({ className, width, height, borderRadius, style }: SkeletonProps) {
  return (
    <div
      className={cn('skeleton', className)}
      style={{
        width: width ?? '100%',
        height: height ?? 16,
        borderRadius: borderRadius ?? 6,
        ...style,
      }}
    />
  )
}

export function StatCardSkeleton() {
  return (
    <div style={{
      padding: '20px 24px',
      borderRadius: 10,
      border: '1px solid var(--border)',
      background: 'var(--bg-surface)',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <Skeleton width="60%" height={11} />
      <Skeleton width="40%" height={26} />
      <Skeleton width="50%" height={11} />
    </div>
  )
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr style={{ borderBottom: '1px solid var(--border)' }}>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '14px 16px' }}>
          <Skeleton
            width={i === 0 ? '80%' : i === cols - 1 ? '40%' : '60%'}
            height={12}
          />
        </td>
      ))}
    </tr>
  )
}

export function JobDetailSkeleton() {
  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Skeleton height={48} borderRadius={10} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
      <Skeleton height={320} style={{ borderRadius: 10 }} />
    </div>
  )
}
