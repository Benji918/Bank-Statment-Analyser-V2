import { ref } from 'vue'
import type { RedactionResult, DetectedEntity } from '@/types/redaction.types'
import { buildCharMap, charOffsetToPdfCoords } from '@/utils/pdfCoordinates'

import * as pdfjsLib from 'pdfjs-dist'
import { PDFDocument, rgb } from 'pdf-lib'

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

    async function redactPdf(file: File): Promise<RedactionResult> {
        isProcessing.value = true
        error.value = null
        progress.value = 0

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

            for (let i = 1; i <= totalPages; i++) {
                const page = await pdf.getPage(i)
                const textContent = await page.getTextContent()
                const viewport = page.getViewport({ scale: 1 })

                const { fullText, charMap } = buildCharMap(textContent as any)

                // Client-side PII detection via @openredaction/openredaction
                let entities: DetectedEntity[] = []
                try {
                    const { OpenRedaction } = await import('@openredaction/openredaction')
                    const detected = await OpenRedaction.detect(fullText)
                    entities = detected.map((e: any) => ({ ...e, page: i }))
                } catch {
                    // openredaction may not be available or may not detect anything
                }

                allEntities.push(...entities)
                pageTextMaps.push({ page: i, fullText, charMap, viewport })

                progress.value = Math.round((i / totalPages) * 60)
            }

            // Draw redaction rectangles using pdf-lib
            const pdfDoc = await PDFDocument.load(arrayBuffer)

            for (const entity of allEntities) {
                const pageData = pageTextMaps[entity.page! - 1]
                if (!pageData) continue
                const bbox = charOffsetToPdfCoords(
                    entity.start,
                    entity.end,
                    pageData.charMap,
                    pageData.viewport
                )
                const pdfPage = pdfDoc.getPage(entity.page! - 1)
                pdfPage.drawRectangle({
                    x: bbox.x,
                    y: bbox.y,
                    width: bbox.width,
                    height: bbox.height,
                    color: rgb(0, 0, 0),
                })
            }

            progress.value = 90
            const redactedBytes = await pdfDoc.save()
            progress.value = 100

            return {
                redactedBlob: new Blob([redactedBytes], { type: 'application/pdf' }),
                entitiesSummary: summariseEntities(allEntities),
            }
        } catch (e: any) {
            error.value = e?.message ?? 'Failed to process PDF'
            throw e
        } finally {
            isProcessing.value = false
        }
    }

    return { redactPdf, isProcessing, progress, error }
}
