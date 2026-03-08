import api from './api'
import type { InsightRead, InsightSummary } from '@/types/insight.types'

export const insightsService = {
    async list(): Promise<InsightSummary[]> {
        const response = await api.get('/insights/')
        return response.data
    },

    async getByStatement(statementId: string): Promise<InsightRead> {
        const response = await api.get(`/insights/${statementId}`)
        return response.data
    },

    async aggregate(startPeriod?: string, endPeriod?: string): Promise<any> {
        const response = await api.get('/insights/aggregate', {
            params: { start_period: startPeriod, end_period: endPeriod },
        })
        return response.data
    },

    async delete(insightId: string): Promise<void> {
        await api.delete(`/insights/${insightId}`)
    },
}
