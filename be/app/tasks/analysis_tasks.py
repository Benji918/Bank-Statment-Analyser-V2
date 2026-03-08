import logging
import datetime
from uuid import UUID

from app.tasks.celery_app import celery_app
from app.db.session import AsyncSessionLocal

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, name="analysis_tasks.run_analysis")
def run_analysis(self, statement_id: str, job_id: str, ollama_model: str = None) -> dict:
    """
    Async Celery task: parse redacted PDF text, send to Ollama, and store insights.
    """
    import asyncio

    async def _run():
        async with AsyncSessionLocal() as db:
            from sqlalchemy.future import select
            from app.models.analysis import AnalysisJob
            from app.models.statement import Statement
            from app.services.pdf_parser import parse_pdf
            from app.services.ollama_service import analyse_statement
            from app.services.insight_service import store_insight

            result = await db.execute(select(AnalysisJob).where(AnalysisJob.id == UUID(job_id)))
            job = result.scalars().first()
            if not job:
                return {"status": "failed", "error": "Job not found"}

            job.status = "running"
            job.started_at = datetime.datetime.utcnow()
            await db.commit()

            try:
                stmt_result = await db.execute(
                    select(Statement).where(Statement.id == UUID(statement_id))
                )
                statement = stmt_result.scalars().first()
                if not statement:
                    raise ValueError("Statement not found")

                pdf_path = statement.redacted_path or statement.file_path
                with open(pdf_path, "rb") as f:
                    file_bytes = f.read()

                pages = parse_pdf(file_bytes)
                full_text = " ".join(p.full_text for p in pages)

                insight_data = await analyse_statement(full_text, model_name=ollama_model)

                job.status = "done"
                job.completed_at = datetime.datetime.utcnow()
                job.raw_llm_output = str(insight_data)
                statement.status = "done"
                await db.commit()

                await store_insight(
                    db=db,
                    statement_id=UUID(statement_id),
                    user_id=statement.user_id,
                    data=insight_data,
                    analysis_job_id=UUID(job_id),
                    period=statement.statement_month,
                )

                return {"status": "done"}

            except Exception as exc:
                job.status = "failed"
                job.error_message = str(exc)
                job.completed_at = datetime.datetime.utcnow()
                statement_id_uuid = UUID(statement_id)
                stmt_r = await db.execute(select(Statement).where(Statement.id == statement_id_uuid))
                s = stmt_r.scalars().first()
                if s:
                    s.status = "error"
                await db.commit()
                logger.error(f"Analysis task failed: {exc}")
                return {"status": "failed", "error": str(exc)}

    return asyncio.get_event_loop().run_until_complete(_run())
