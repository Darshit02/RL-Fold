import { SortKey, SortDir } from '@/hooks/useJobFilters'

interface Props {
  label:   string
  sortKey: SortKey
  current: SortKey
  dir:     SortDir
  onClick: (k: SortKey) => void
}

export function SortHeader({ label, sortKey, current, dir, onClick }: Props) {
  const active = current === sortKey
  return (
    <th
      onClick={() => onClick(sortKey)}
      style={{
        padding: '9px 14px',
        textAlign: 'left',
        fontSize: '10px',
        fontFamily: 'var(--font-mono)',
        color: active ? 'var(--accent)' : 'var(--text-muted)',
        letterSpacing: '0.06em',
        fontWeight: 400,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'color 0.15s',
      }}
    >
      {label}
      {active && (
        <span style={{ marginLeft: 4, fontSize: '9px' }}>
          {dir === 'desc' ? '↓' : '↑'}
        </span>
      )}
    </th>
  )
}
