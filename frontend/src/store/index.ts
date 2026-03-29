import { create } from 'zustand'
import { User, Job } from '@/types'

interface AppStore {
    user: User | null
    token: string | null
    jobs: Job[]
    setUser: (user: User | null) => void
    setToken: (token: string | null) => void
    setJobs: (jobs: Job[]) => void
    logout: () => void
}


export const useAppStore = create<AppStore>((set) => ({
    user: null,
    token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
    jobs: [],
    setUser: (user) => set({ user }),
    setToken: (token) => {
        if (token) localStorage.setItem('token', token)
        else localStorage.removeItem('token')
        set({ token })
    },
    setJobs: (jobs) => set({ jobs }),
    logout: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null, jobs: [] })
    },
}))