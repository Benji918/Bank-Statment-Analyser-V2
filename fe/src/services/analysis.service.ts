import api from './api'
import type { AnalysisJob } from '@/types/statement.types'

export const analysisService = {
    async run(statementId: string, ollama_model = 'llama3'): Promise<AnalysisJob> {
        const response = await api.post(`/analysis/${statementId}/run`, { ollama_model })
        return response.data
    },

    async getStatus(statementId: string): Promise<AnalysisJob> {
        const response = await api.get(`/analysis/${statementId}/status`)
        return response.data
    },
}
