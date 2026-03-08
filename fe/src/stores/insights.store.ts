import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { InsightData } from '@/types/insight.types'
import { insightsService } from '@/services/insights.service'
import { analysisService } from '@/services/analysis.service'

export const useInsightsStore = defineStore('insights', () => {
    const insightsByStatementId = ref<Record<string, InsightData>>({})
    const analysisJobStatus = ref<Record<string, 'pending' | 'running' | 'done' | 'error'>>({})

    async function triggerAnalysis(statementId: string): Promise<void> {
        const job = await analysisService.run(statementId)
        analysisJobStatus.value[statementId] = 'pending'
    }

    async function pollAnalysisStatus(statementId: string): Promise<string> {
        const job = await analysisService.getStatus(statementId)
        analysisJobStatus.value[statementId] = job.status as any
        return job.status
    }

    async function fetchInsights(statementId: string): Promise<InsightData> {
        const insight = await insightsService.getByStatement(statementId)
        insightsByStatementId.value[statementId] = insight.data
        return insight.data
    }

    function clearInsights(statementId: string): void {
        delete insightsByStatementId.value[statementId]
        delete analysisJobStatus.value[statementId]
    }

    return {
        insightsByStatementId,
        analysisJobStatus,
        triggerAnalysis,
        pollAnalysisStatus,
        fetchInsights,
        clearInsights,
    }
})
