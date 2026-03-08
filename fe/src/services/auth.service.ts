import api from './api'
import type { AuthUser, LoginCredentials, RegisterPayload, Token } from '@/types/auth.types'

export const authService = {
    async register(payload: RegisterPayload): Promise<AuthUser> {
        const response = await api.post('/auth/register', payload)
        return response.data
    },

    async login(credentials: LoginCredentials): Promise<Token> {
        const formData = new URLSearchParams()
        formData.append('username', credentials.username)
        formData.append('password', credentials.password)
        const response = await api.post('/auth/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
        return response.data
    },

    async refresh(): Promise<Token> {
        const response = await api.post('/auth/refresh')
        return response.data
    },

    async logout(): Promise<void> {
        await api.post('/auth/logout')
    },
}
