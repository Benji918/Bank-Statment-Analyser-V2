from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.core.logging import setup_logging
import logging

setup_logging()
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all API routers
from app.api.v1 import auth, statements, redaction, analysis, insights, exports, tags

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(statements.router, prefix=f"{settings.API_V1_STR}/statements", tags=["statements"])
app.include_router(redaction.router, prefix=f"{settings.API_V1_STR}/redaction", tags=["redaction"])
app.include_router(analysis.router, prefix=f"{settings.API_V1_STR}/analysis", tags=["analysis"])
app.include_router(insights.router, prefix=f"{settings.API_V1_STR}/insights", tags=["insights"])
app.include_router(exports.router, prefix=f"{settings.API_V1_STR}/exports", tags=["exports"])
app.include_router(tags.router, prefix=f"{settings.API_V1_STR}/tags", tags=["tags"])


@app.get("/")
def read_root():
    return {"message": "Welcome to the Bank Statement Analyser API"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
