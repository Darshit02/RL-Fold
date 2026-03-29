import useSWR from 'swr'
import { jobsApi } from '@/lib/api'
import { Job } from '@/types'

const fetcher = (fn: () => Promise<any>) => fn().then(r => r.data)

export function useJobs() {
  const { data, error, mutate, isLoading } = useSWR<Job[]>(
    'jobs',
    () => jobsApi.list().then(r => r.data),
    { refreshInterval: 5000 }
  )
  return { jobs: data || [], error, mutate, isLoading }
}

export function useJob(id: string | null) {
  const { data, error, mutate, isLoading } = useSWR<Job>(
    id ? `job-${id}` : null,
    () => jobsApi.get(id!).then(r => r.data),
    { refreshInterval: 3000 }
  )
  return { job: data, error, mutate, isLoading }
}