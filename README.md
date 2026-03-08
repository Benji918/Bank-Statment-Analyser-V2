# Bank Statement Analyser

A full-stack web application that allows users to upload bank statement PDFs, redact PII client-side and server-side, and receive AI-generated financial insights via Ollama (LLaMA 3).

## Project Structure

```
bank-analyser/
├── be/         # FastAPI backend (Python 3.11+)
├── fe/         # Vue 3 frontend (TypeScript)
├── docker-compose.yml
└── README.md
```

## Quick Start

### Prerequisites
- Python 3.11+, Node.js 20+, Docker + Docker Compose
- [Ollama](https://ollama.ai) running locally or accessible as a cloud API

### Backend

```bash
cd be
cp .env.example .env
# Edit .env with your settings
uv venv && source .venv/bin/activate
uv pip install -e .
uvicorn app.main:app --reload
```

### Frontend

```bash
cd fe
cp .env.example .env
npm install
npm run dev
```

### With Docker Compose

```bash
docker-compose up -d
```

## Architecture

- **Backend**: FastAPI + SQLAlchemy async + PostgreSQL + Celery + Redis
- **Frontend**: Vue 3 + Pinia + Vue Router + Tailwind CSS + ECharts
- **AI Analysis**: Ollama (LLaMA 3) via cloud API
- **PII Redaction**: Client-side (openredaction + pdfjs + pdf-lib) + Server-side (Microsoft Presidio)

## API Documentation

Once the backend is running, visit: http://localhost:8000/api/v1/openapi.json
