export interface RecurringTransaction {
    description: string
    amount: number
    frequency: string
}

export interface TopMerchant {
    name: string
    total: number
    count: number
}

export interface UnusualTransaction {
    description: string
    amount: number
    flag: string
}

export interface InsightData {
    total_income: number
    total_expenses: number
    net_balance: number
    currency: string
    spending_by_category: Record<string, number>
    recurring_debits: RecurringTransaction[]
    recurring_credits: RecurringTransaction[]
    top_merchants: TopMerchant[]
    unusual_transactions: UnusualTransaction[]
    actionable_insights: string[]
    savings_rate_percent: number
}

export interface InsightRead {
    id: string
    statement_id: string
    analysis_job_id?: string
    user_id: string
    period?: string
    summary?: string
    data: InsightData
    created_at: string
}

export interface InsightSummary {
    id: string
    statement_id: string
    period?: string
    summary?: string
    created_at: string
}
