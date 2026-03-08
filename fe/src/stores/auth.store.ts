import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AuthUser, LoginCredentials, RegisterPayload, Token } from '@/types/auth.types'
import { authService } from '@/services/auth.service'

export const useAuthStore = defineStore('auth', () => {
    const user = ref<AuthUser | null>(null)
    const accessToken = ref<string | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    const isAuthenticated = computed(() => !!accessToken.value)

    async function login(credentials: LoginCredentials): Promise<void> {
        isLoading.value = true
        error.value = null
        try {
            const token: Token = await authService.login(credentials)
            accessToken.value = token.access_token
        } catch (e: any) {
            error.value = e?.response?.data?.detail ?? 'Login failed'
            throw e
        } finally {
            isLoading.value = false
        }
    }

    async function register(payload: RegisterPayload): Promise<void> {
        isLoading.value = true
        error.value = null
        try {
            await authService.register(payload)
        } catch (e: any) {
            error.value = e?.response?.data?.detail ?? 'Registration failed'
            throw e
        } finally {
            isLoading.value = false
        }
    }

    function logout(): void {
        user.value = null
        accessToken.value = null
    }

    return { user, accessToken, isAuthenticated, isLoading, error, login, register, logout }
})
