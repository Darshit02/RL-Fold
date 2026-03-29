export type JobStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface Job {
  id: string
  name: string
  sequence: string
  target_property: string | null
  status: JobStatus
  plddt_score: number | null
  rosetta_energy: number | null
  reward_history: number[] | null
  structure_path: string | null
  created_at: string
  updated_at: string
}

export interface Experiment {
  id: string
  name: string
  description: string | null
  config: Record<string, unknown> | null
  best_plddt: number | null
  total_jobs: number
  created_at: string
}

export interface Metric {
  job_id: string
  step: number
  reward: number
  plddt: number
  energy: number
  timestamp: number
}


export interface User {
  id: string
  email: string
  username: string
  is_active: boolean
  created_at: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}