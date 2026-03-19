import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AnalysisJob } from '@/types/statement.types'
import { analysisService } from '@/services/analysis.service'

export const useAnalysisStore = defineStore('analysis', () => {
    const jobsByStatementId = ref<Record<string, AnalysisJob>>({})

    async function triggerAnalysis(statementId: string, model = import.meta.env.VITE_OLLAMA_MODEL_DISPLAY): Promise<AnalysisJob> {
        const job = await analysisService.run(statementId, model)
        jobsByStatementId.value[statementId] = job
        return job
    }

    async function pollAnalysisStatus(statementId: string): Promise<AnalysisJob> {
        const job = await analysisService.getStatus(statementId)
        jobsByStatementId.value[statementId] = job
        return job
    }

    return { jobsByStatementId, triggerAnalysis, pollAnalysisStatus }
})
