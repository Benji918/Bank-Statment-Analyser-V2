import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1',
    withCredentials: true, // sends httpOnly refresh cookie
})

// Request interceptor: attach Bearer token
api.interceptors.request.use((config) => {
    const authStore = useAuthStore()
    if (authStore.accessToken) {
        config.headers.Authorization = `Bearer ${authStore.accessToken}`
    }
    return config
})

// Response interceptor: handle 401, attempt refresh, retry
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true
            try {
                const refreshResponse = await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'}/auth/refresh`,
                    {},
                    { withCredentials: true }
                )
                const authStore = useAuthStore()
                authStore.accessToken = refreshResponse.data.access_token
                original.headers.Authorization = `Bearer ${authStore.accessToken}`
                return api(original)
            } catch {
                const authStore = useAuthStore()
                authStore.logout()
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

export default api
