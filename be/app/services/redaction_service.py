import logging
from typing import List, Dict, Any, Tuple
from dataclasses import dataclass

logger = logging.getLogger(__name__)

PRESIDIO_ENTITIES = [
    "PERSON", "EMAIL_ADDRESS", "PHONE_NUMBER", "LOCATION",
    "CREDIT_CARD", "IBAN_CODE", "NRP", "US_SSN", "UK_NHS",
    "DATE_TIME", "IN_PAN",
]


@dataclass
class DetectedEntity:
    entity_type: str
    start: int
    end: int
    score: float
    text: str


@dataclass
class RedactionReport:
    entities: List[DetectedEntity]
    redacted_text: str
    pii_found: Dict[str, int]
    confidence_avg: float


def redact_text(text: str) -> RedactionReport:
    """
    Run Microsoft Presidio to detect and anonymise PII in the extracted text.
    Returns a RedactionReport containing detected entities and clean text.
    """
    try:
        from presidio_analyzer import AnalyzerEngine
        from presidio_anonymizer import AnonymizerEngine

        analyzer = AnalyzerEngine()
        anonymizer = AnonymizerEngine()

        results = analyzer.analyze(text=text, entities=PRESIDIO_ENTITIES, language="en")

        entities = [
            DetectedEntity(
                entity_type=r.entity_type,
                start=r.start,
                end=r.end,
                score=r.score,
                text=text[r.start:r.end],
            )
            for r in results
        ]

        anonymized = anonymizer.anonymize(text=text, analyzer_results=results)
        redacted_text = anonymized.text

        pii_found: Dict[str, int] = {}
        total_score = 0.0
        for e in entities:
            pii_found[e.entity_type] = pii_found.get(e.entity_type, 0) + 1
            total_score += e.score
        confidence_avg = total_score / len(entities) if entities else 0.0

        return RedactionReport(
            entities=entities,
            redacted_text=redacted_text,
            pii_found=pii_found,
            confidence_avg=confidence_avg,
        )

    except ImportError:
        logger.error("Presidio not installed. Returning raw text unredacted.")
        return RedactionReport(
            entities=[],
            redacted_text=text,
            pii_found={},
            confidence_avg=0.0,
        )
