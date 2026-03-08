import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RedactionJob } from '@/types/redaction.types'
import { redactionService } from '@/services/redaction.service'

export const useRedactionStore = defineStore('redaction', () => {
    const jobsByStatementId = ref<Record<string, RedactionJob>>({})
    const previewUrls = ref<Record<string, string>>({})

    async function runClientRedaction(statementId: string, redactedBlob: Blob): Promise<void> {
        const objectUrl = URL.createObjectURL(redactedBlob)
        previewUrls.value[statementId] = objectUrl
    }

    async function confirmAndUpload(statementId: string): Promise<RedactionJob> {
        const job = await redactionService.run(statementId)
        jobsByStatementId.value[statementId] = job
        return job
    }

    async function fetchServerRedactionStatus(statementId: string): Promise<RedactionJob> {
        const job = await redactionService.getStatus(statementId)
        jobsByStatementId.value[statementId] = job
        return job
    }

    function clearPreview(statementId: string): void {
        const url = previewUrls.value[statementId]
        if (url) URL.revokeObjectURL(url)
        delete previewUrls.value[statementId]
    }

    return {
        jobsByStatementId,
        previewUrls,
        runClientRedaction,
        confirmAndUpload,
        fetchServerRedactionStatus,
        clearPreview,
    }
})
