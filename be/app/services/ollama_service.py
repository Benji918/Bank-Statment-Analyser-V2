import json
import logging
from typing import Optional

from app.schemas.insight import InsightData
from app.config import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a financial analyst. Analyse the bank statement text provided and return ONLY a valid JSON object.
Do not include any explanation, markdown, or extra text.
The JSON must match this schema exactly:
{
  "total_income": float,
  "total_expenses": float,
  "net_balance": float,
  "currency": "GBP",
  "spending_by_category": {"Category": float},
  "recurring_debits": [{"description": str, "amount": float, "frequency": str}],
  "recurring_credits": [{"description": str, "amount": float, "frequency": str}],
  "top_merchants": [{"name": str, "total": float, "count": int}],
  "unusual_transactions": [{"description": str, "amount": float, "flag": str}],
  "actionable_insights": [str],
  "savings_rate_percent": float
}"""


async def analyse_statement(redacted_text: str, model: Optional[str] = None) -> InsightData:
    """
    Send redacted statement text to Ollama and parse the structured JSON response.
    Retries up to 3 times on malformed JSON.
    """
    import ollama

    model = model or settings.OLLAMA_MODEL
    last_error: Optional[Exception] = None

    for attempt in range(1, 4):
        try:
            response = ollama.chat(
                model=model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"Bank Statement:\n\n{redacted_text}"},
                ],
            )
            raw_content: str = response["message"]["content"]
            # Strip markdown code fences if present
            clean = raw_content.strip()
            if clean.startswith("```"):
                clean = clean.split("```")[1]
                if clean.startswith("json"):
                    clean = clean[4:]
            parsed = json.loads(clean)
            return InsightData(**parsed)
        except (json.JSONDecodeError, KeyError, TypeError) as e:
            logger.warning(f"Attempt {attempt}: Failed to parse Ollama JSON response: {e}")
            last_error = e

    raise ValueError(f"Ollama failed to return valid JSON after 3 attempts: {last_error}")
