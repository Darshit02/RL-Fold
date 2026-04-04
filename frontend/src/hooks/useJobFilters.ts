import { useState, useMemo } from 'react'
import { Job, JobStatus } from '@/types'

export type SortKey = 'created_at' | 'updated_at' | 'plddt_score' | 'rosetta_energy' | 'name'
export type SortDir = 'asc' | 'desc'

export interface Filters {
  search:   string
  status:   JobStatus | 'all'
  sortKey:  SortKey
  sortDir:  SortDir
  minPlddt: number | null
  maxEnergy: number | null
}

const DEFAULT: Filters = {
  search:    '',
  status:    'all',
  sortKey:   'created_at',
  sortDir:   'desc',
  minPlddt:  null,
  maxEnergy: null,
}

export function useJobFilters(jobs: Job[]) {
  const [filters, setFilters] = useState<Filters>(DEFAULT)

  const filtered = useMemo(() => {
    let result = [...jobs]

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      result = result.filter(j =>
        j.name.toLowerCase().includes(q) ||
        j.sequence.toLowerCase().includes(q) ||
        j.id.toLowerCase().includes(q) ||
        (j.target_property ?? '').toLowerCase().includes(q)
      )
    }

    if (filters.status !== 'all') {
      result = result.filter(j => j.status === filters.status)
    }

    if (filters.minPlddt !== null) {
      result = result.filter(j => (j.plddt_score ?? 0) >= filters.minPlddt!)
    }

    if (filters.maxEnergy !== null) {
      result = result.filter(j => (j.rosetta_energy ?? 0) <= filters.maxEnergy!)
    }

    result.sort((a, b) => {
      const av = a[filters.sortKey] ?? ''
      const bv = b[filters.sortKey] ?? ''
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return filters.sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [jobs, filters])

  const update = (patch: Partial<Filters>) =>
    setFilters(f => ({ ...f, ...patch }))

  const reset = () => setFilters(DEFAULT)

  const toggleSort = (key: SortKey) => {
    setFilters(f => ({
      ...f,
      sortKey: key,
      sortDir: f.sortKey === key && f.sortDir === 'desc' ? 'asc' : 'desc',
    }))
  }

  return { filters, filtered, update, reset, toggleSort }
}
