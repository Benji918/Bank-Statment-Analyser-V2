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


async def analyse_statement(redacted_text: str, model_name: Optional[str] = None) -> InsightData:
    """
    Send redacted statement text to Ollama and parse the structured JSON response.
    Retries up to 3 times on malformed JSON.
    """
    from ollama import AsyncClient
    import httpx

    model = model_name or settings.OLLAMA_MODEL
    last_error: Optional[Exception] = None
    
    headers = {}
    if settings.OLLAMA_API_KEY:
        headers["Authorization"] = f"Bearer {settings.OLLAMA_API_KEY}"
        
    client = AsyncClient(host=settings.OLLAMA_BASE_URL, headers=headers)

    try:
        response = await client.chat(
            model=model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Bank Statement:\n\n{redacted_text}"},
            ],
        )
        print('Ollama is responding.....')
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
        logger.warning(f"Failed to parse Ollama JSON response: {e}")
        last_error = e

    raise ValueError(f"Ollama failed to return valid JSON after 3 attempts: {last_error}")
