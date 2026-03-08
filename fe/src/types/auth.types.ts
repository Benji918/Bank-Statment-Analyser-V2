export interface AuthUser {
    id: string
    email: string
    full_name?: string
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface LoginCredentials {
    username: string
    password: string
}

export interface RegisterPayload {
    email: string
    password: string
    full_name?: string
}

export interface Token {
    access_token: string
    token_type: string
    refresh_token: string
}
