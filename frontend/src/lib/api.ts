import axios from 'axios'
import { API_BASE_URL } from '@/config'

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token')
        if (token) config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('token')
            window.location.href = '/login'
        }
        return Promise.reject(err)
    }
)

export const authApi = {
    register: (data: { email: string; username: string; password: string }) =>
        api.post('/auth/register', data),
    login: (data: { email: string; password: string }) =>
        api.post('/auth/login', data),
    me: () => api.get('/auth/me'),
}

export const jobsApi = {
    create: (data: { name: string; sequence: string; target_property?: string }) =>
        api.post('/jobs/', data),
    list: () => api.get('/jobs/'),
    get: (id: string) => api.get(`/jobs/${id}`),
    delete: (id: string) => api.delete(`/jobs/${id}`),
    history: (id: string) => api.get(`/jobs/${id}/history`),
}

export const resultsApi = {
    summary: (id: string) => api.get(`/results/${id}/summary`),
    downloadUrl: (id: string) => `${API_BASE_URL}/results/${id}/download`,
}

export const experimentsApi = {
    create: (data: { name: string; description?: string }) =>
        api.post('/experiments/', data),
    list: () => api.get('/experiments/'),
    get: (id: string) => api.get(`/experiments/${id}`),
}

export default api