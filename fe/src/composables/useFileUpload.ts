import { ref } from 'vue'
import { statementsService } from '@/services/statements.service'
import type { Statement } from '@/types/statement.types'

const MAX_SIZE_MB = Number(import.meta.env.VITE_MAX_UPLOAD_SIZE_MB ?? 20)
const ALLOWED_TYPES = ['application/pdf']

export function useFileUpload() {
    const isUploading = ref(false)
    const uploadProgress = ref(0)
    const uploadError = ref<string | null>(null)

    function validateFile(file: File): string | null {
        if (!ALLOWED_TYPES.includes(file.type)) {
            return 'Only PDF files are allowed.'
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            return `File is too large. Maximum size is ${MAX_SIZE_MB}MB.`
        }
        return null
    }

    async function uploadRedactedFile(
        redactedBlob: Blob,
        originalFilename: string
    ): Promise<Statement> {
        isUploading.value = true
        uploadProgress.value = 0
        uploadError.value = null

        try {
            const file = new File([redactedBlob], originalFilename, { type: 'application/pdf' })
            const statement = await statementsService.upload(file)
            uploadProgress.value = 100
            return statement
        } catch (e: any) {
            uploadError.value = e?.response?.data?.detail ?? 'Upload failed'
            throw e
        } finally {
            isUploading.value = false
        }
    }

    return { isUploading, uploadProgress, uploadError, validateFile, uploadRedactedFile }
}
