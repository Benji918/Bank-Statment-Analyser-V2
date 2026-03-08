export interface Statement {
    id: string
    user_id: string
    filename: string
    file_size_bytes?: number
    bank_name?: string
    statement_month?: string
    status: 'uploaded' | 'redacting' | 'redacted' | 'analysing' | 'done' | 'error'
    tags: string[]
    uploaded_at: string
    updated_at: string
}

export interface StatementUpdate {
    tags?: string[]
    bank_name?: string
    statement_month?: string
}

export interface AnalysisJob {
    id: string
    statement_id: string
    ollama_model: string
    prompt_version?: string
    status: 'pending' | 'running' | 'done' | 'failed'
    started_at?: string
    completed_at?: string
    error_message?: string
}
