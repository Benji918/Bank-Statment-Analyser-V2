import { ref } from 'vue'
import type { RedactionResult, DetectedEntity } from '@/types/redaction.types'
import { buildCharMap } from '@/utils/pdfCoordinates'
import { detectPii } from '@/utils/piiDetector'
import { pdfRestService, type RedactionObject } from '@/services/pdfrest.service'

import * as pdfjsLib from 'pdfjs-dist'

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
).toString()

function summariseEntities(entities: DetectedEntity[]): Record<string, number> {
    const summary: Record<string, number> = {}
    for (const e of entities) {
        summary[e.entity_type] = (summary[e.entity_type] ?? 0) + 1
    }
    return summary
}

export function usePdfRedaction() {
    const isProcessing = ref(false)
    const progress = ref(0)
    const error = ref<string | null>(null)
    const detectedEntities = ref<DetectedEntity[]>([])

    async function redactPdf(file: File): Promise<RedactionResult> {
        isProcessing.value = true
        error.value = null
        progress.value = 0
        detectedEntities.value = []

        try {
            const arrayBuffer = await file.arrayBuffer()
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise
            const totalPages = pdf.numPages

            const allEntities: DetectedEntity[] = []
            const pageTextMaps: Array<{
                page: number
                fullText: string
                charMap: ReturnType<typeof buildCharMap>['charMap']
                viewport: { width: number; height: number }
            }> = []

            // Phase 1: Extract text from all pages and detect PII
            for (let i = 1; i <= totalPages; i++) {
                const page = await pdf.getPage(i)
                const textContent = await page.getTextContent()
                const viewport = page.getViewport({ scale: 1 })

                const { fullText, charMap } = buildCharMap(textContent as any)

                // Run our built-in PII detection engine
                const piiResults = detectPii(fullText)
                const entities: DetectedEntity[] = piiResults.map((e) => ({
                    entity_type: e.entity_type,
                    start: e.start,
                    end: e.end,
                    score: e.score,
                    text: e.text,
                    page: i,
                }))

                allEntities.push(...entities)
                pageTextMaps.push({ page: i, fullText, charMap, viewport })

                progress.value = Math.round((i / totalPages) * 60)
            }

            // Store detected entities for the UI to display
            detectedEntities.value = [...allEntities]

            progress.value = 80;

            // Phase 2: Call PDFrest for preview
            const IGNORED_WORDS = new Set([
                'transfer', 'pos', 'cash', 'cas', 'debit', 'credit', 'merchant', 'merchat', 'airtime', 
                'commission', 'vat', 'tax', 'total', 'amount', 'balance', 'fee', 'charge', 'withdrawal', 'deposit', 'statement'
            ]);
            
            const uniqueTexts = Array.from(new Set(
                allEntities
                    .map(e => e.text.trim())
                    .filter(t => t.length > 2 && !IGNORED_WORDS.has(t.toLowerCase()))
            ));
            
            const redactions: RedactionObject[] = uniqueTexts.map(text => ({
                type: 'literal',
                value: text
            }));

            const previewResponse = await pdfRestService.previewRedact(file, redactions);
            const previewBlob = await pdfRestService.getResourceBlob(previewResponse.outputId);
            
            progress.value = 100;

            return {
                redactedBlob: previewBlob,
                entitiesSummary: summariseEntities(allEntities),
                detectedEntities: allEntities,
                resourceId: previewResponse.outputId
            }
        } catch (e: any) {
            error.value = e?.message ?? 'Failed to process PDF'
            throw e
        } finally {
            isProcessing.value = false
        }
    }

    return { redactPdf, isProcessing, progress, error, detectedEntities }
}
