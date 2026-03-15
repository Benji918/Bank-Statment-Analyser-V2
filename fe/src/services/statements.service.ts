import api from './api'
import type { Statement, StatementUpdate } from '@/types/statement.types'

export const statementsService = {
    async list(params?: { tag?: string; status?: string }): Promise<Statement[]> {
        const response = await api.get('/statements/', { params })
        return response.data
    },

    async get(id: string): Promise<Statement> {
        const response = await api.get(`/statements/${id}`)
        return response.data
    },

    async upload(file: File, metadata?: Partial<StatementUpdate>): Promise<Statement> {
        const formData = new FormData()
        formData.append('file', file)
        if (metadata) {
            // Add metadata to formData if provided
            Object.entries(metadata).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, String(value))
                }
            })
        }
        const response = await api.post('/statements/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        return response.data
    },

    async update(id: string, data: StatementUpdate): Promise<Statement> {
        const response = await api.patch(`/statements/${id}`, data)
        return response.data
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/statements/${id}`)
    },

    downloadUrl(id: string): string {
        return `${import.meta.env.VITE_API_BASE_URL}/statements/${id}/download`
    },

    redactedUrl(id: string): string {
        return `${import.meta.env.VITE_API_BASE_URL}/statements/${id}/redacted`
    },
}
