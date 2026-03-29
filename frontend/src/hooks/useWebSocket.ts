import { useEffect, useRef, useState } from 'react'
import { WS_BASE_URL } from '@/config'
import { Metric } from '@/types'

export function useJobMetrics(jobId: string | null) {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const ws = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!jobId) return
    ws.current = new WebSocket(`${WS_BASE_URL}/ws/metrics/${jobId}`)
    ws.current.onmessage = (e) => {
      const data: Metric = JSON.parse(e.data)
      setMetrics((prev) => [...prev.slice(-100), data])
    }
    ws.current.onerror = () => ws.current?.close()
    return () => ws.current?.close()
  }, [jobId])

  return metrics
}
