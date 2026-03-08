import logging
import datetime
from uuid import UUID

from app.tasks.celery_app import celery_app
from app.db.session import AsyncSessionLocal
from app.models.redaction import RedactionJob
from app.models.statement import Statement
from app.services.pdf_parser import parse_pdf
from app.services.redaction_service import redact_text

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, name="redaction_tasks.run_redaction")
def run_redaction(self, statement_id: str, job_id: str) -> dict:
    """
    Async Celery task: run server-side Presidio redaction on an uploaded statement.
    """
    import asyncio

    async def _run():
        async with AsyncSessionLocal() as db:
            from sqlalchemy.future import select

            # Update job to running
            result = await db.execute(select(RedactionJob).where(RedactionJob.id == UUID(job_id)))
            job = result.scalars().first()
            if not job:
                return {"status": "failed", "error": "Job not found"}

            job.status = "running"
            job.started_at = datetime.datetime.utcnow()
            await db.commit()

            try:
                # Fetch statement and read file
                stmt_result = await db.execute(select(Statement).where(Statement.id == UUID(statement_id)))
                statement = stmt_result.scalars().first()
                if not statement:
                    raise ValueError("Statement not found")

                with open(statement.file_path, "rb") as f:
                    file_bytes = f.read()

                # Parse and redact
                pages = parse_pdf(file_bytes)
                full_text = " ".join(p.full_text for p in pages)
                report = redact_text(full_text)

                # Update job
                job.status = "done"
                job.completed_at = datetime.datetime.utcnow()
                job.pii_found = report.pii_found
                job.confidence_avg = report.confidence_avg

                # Update statement status
                statement.status = "redacted"

                await db.commit()
                return {"status": "done", "pii_found": report.pii_found}

            except Exception as exc:
                job.status = "failed"
                job.error_message = str(exc)
                job.completed_at = datetime.datetime.utcnow()
                await db.commit()
                logger.error(f"Redaction task failed: {exc}")
                return {"status": "failed", "error": str(exc)}

    return asyncio.get_event_loop().run_until_complete(_run())
