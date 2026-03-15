export interface DetectedEntity {
    entity_type: string
    start: number
    end: number
    score: number
    text: string
    page?: number
}

export interface RedactionJob {
    id: string
    statement_id: string
    status: 'pending' | 'running' | 'done' | 'failed'
    pii_found?: Record<string, number>
    confidence_avg?: number
    started_at?: string
    completed_at?: string
    error_message?: string
}

export interface RedactionResult {
    redactedBlob: Blob
    entitiesSummary: Record<string, number>
    detectedEntities: DetectedEntity[]
    resourceId?: string
}

export interface BoundingBox {
    x: number
    y: number
    width: number
    height: number
    page: number
}
