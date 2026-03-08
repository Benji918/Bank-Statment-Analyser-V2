from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, Any, Dict, List


class RecurringTransaction(BaseModel):
    description: str
    amount: float
    frequency: str


class TopMerchant(BaseModel):
    name: str
    total: float
    count: int


class UnusualTransaction(BaseModel):
    description: str
    amount: float
    flag: str


class InsightData(BaseModel):
    total_income: float
    total_expenses: float
    net_balance: float
    currency: str = "GBP"
    spending_by_category: Dict[str, float]
    recurring_debits: List[RecurringTransaction]
    recurring_credits: List[RecurringTransaction]
    top_merchants: List[TopMerchant]
    unusual_transactions: List[UnusualTransaction]
    actionable_insights: List[str]
    savings_rate_percent: float


class InsightRead(BaseModel):
    id: UUID
    statement_id: UUID
    analysis_job_id: Optional[UUID] = None
    user_id: UUID
    period: Optional[str] = None
    summary: Optional[str] = None
    data: InsightData
    created_at: datetime

    class Config:
        from_attributes = True


class InsightSummary(BaseModel):
    id: UUID
    statement_id: UUID
    period: Optional[str] = None
    summary: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
