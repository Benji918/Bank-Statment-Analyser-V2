import api from './api'
import type { RedactionJob } from '@/types/redaction.types'

export const redactionService = {
    async run(statementId: string): Promise<RedactionJob> {
        const response = await api.post(`/redaction/${statementId}/run`)
        return response.data
    },

    async getStatus(statementId: string): Promise<RedactionJob> {
        const response = await api.get(`/redaction/${statementId}/status`)
        return response.data
    },

    async getReport(statementId: string): Promise<RedactionJob> {
        const response = await api.get(`/redaction/${statementId}/report`)
        return response.data
    },
}
