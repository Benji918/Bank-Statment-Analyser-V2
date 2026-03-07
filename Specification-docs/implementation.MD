# Implementation Plan — Bank Statement Analyser

---

## Overview

This document defines the phased build order, task breakdown, and cross-cutting concerns for implementing the Bank Statement Analyser across both the FastAPI backend and Vue 3 frontend. Tasks are ordered to unblock dependencies — backend foundation first, then frontend, then integration, then features.

---

## Development Environment Setup

### Prerequisites
```
Python 3.11+
Node.js 20+
PostgreSQL 15
Redis 7
Docker + Docker Compose
Ollama (cloud-API)
```

### Monorepo Structure
```
bank-analyser/
├── be/         # FastAPI backend
├── fe/         # Vue 3 frontend
└── README.md
```


---

## Phase 1 — Backend Foundation

**Goal:** Runnable API with auth, file upload, and database connected.

### 1.1 Project Scaffold
- [ ] Initialise FastAPI project with `pyproject.toml` / `requirements.txt`
- [ ] Configure `app/config.py` with pydantic-settings and `.env` loading
- [ ] Set up SQLAlchemy async engine + session in `app/db/session.py`
- [ ] Configure Alembic for migrations (`alembic init`)
- [ ] Add Docker Compose with PostgreSQL + Redis services
- [ ] Verify DB connection on startup

### 1.2 User Auth
- [ ] Create `users` table migration
- [ ] Implement `User` ORM model and Pydantic schemas
- [ ] Build `core/security.py`: password hashing (bcrypt), JWT creation and verification
- [ ] Implement `/api/v1/auth/register` and `/api/v1/auth/login` endpoints
- [ ] Add JWT refresh + logout endpoints
- [ ] Add `get_current_user` dependency
- [ ] Write auth tests

### 1.3 Statement Upload
- [ ] Create `statements` table migration
- [ ] Implement `Statement` ORM model and schemas
- [ ] Build `POST /api/v1/statements` — multipart upload
  - PDF magic bytes validation
  - File size enforcement
  - Save to filesystem, record in DB
- [ ] Build `GET /api/v1/statements` with tag/date/status filtering
- [ ] Build `GET /api/v1/statements/{id}` and `DELETE /api/v1/statements/{id}`
- [ ] Build `GET /api/v1/statements/{id}/download` (serve original)
- [ ] Write statement CRUD tests

---

## Phase 2 — PDF Processing Pipeline (Backend)

**Goal:** Fully working redaction and analysis pipeline.

### 2.1 PDF Parser
- [ ] Install and configure `pdfplumber` + `PyMuPDF`
- [ ] Implement `services/pdf_parser.py`
  - Extract text blocks with bounding box coordinates per page
  - Return `List[ParsedPage]` with `text_blocks: [{text, x0, y0, x1, y1}]`
  - Fallback to PyMuPDF for image-heavy PDFs
- [ ] Write parser tests with sample PDFs from multiple banks

### 2.2 Server-Side Redaction (Presidio)
- [ ] Install `presidio-analyzer` + `presidio-anonymizer` + spaCy model (`en_core_web_lg`)
- [ ] Implement `services/redaction_service.py`
  - Accept `List[ParsedPage]`
  - Run Presidio analyzer on each page's text
  - Return detected entities with char offsets and confidence scores
  - Apply anonymizer to produce clean text
- [ ] Create `redaction_jobs` table migration + ORM model
- [ ] Build `POST /api/v1/redaction/{statement_id}/run` endpoint
- [ ] Build `GET /api/v1/redaction/{statement_id}/status` + `/report` endpoints
- [ ] Wire redaction into Celery task (`tasks/redaction_tasks.py`)
- [ ] Write redaction tests (known PII strings in test PDFs)

### 2.3 Ollama Integration
- [ ] Install `ollama` Python SDK
- [ ] Implement `services/ollama_service.py`
  - Build system prompt with strict JSON-only instruction
  - Pass redacted statement text as user message
  - Validate response against `InsightData` Pydantic model
  - Retry up to 3× on malformed JSON
- [ ] Create `analysis_jobs` table migration + ORM model
- [ ] Build `POST /api/v1/analysis/{statement_id}/run` endpoint
- [ ] Build `GET /api/v1/analysis/{statement_id}/status` endpoint
- [ ] Wire analysis into Celery task (`tasks/analysis_tasks.py`)
- [ ] Write Ollama service tests (mock Ollama responses)

### 2.4 Insights Storage
- [ ] Create `insights` table migration + ORM model
- [ ] Implement `services/insight_service.py`
  - Store validated insight JSON in `insights.data` (JSONB)
  - Retrieve and aggregate across multiple statements
- [ ] Build `GET /api/v1/insights/{statement_id}` endpoint
- [ ] Build `GET /api/v1/insights/aggregate` endpoint (date range)
- [ ] Write insight service tests

---

## Phase 3 — Frontend Foundation

**Goal:** Runnable Vue app with auth, routing, and API client wired up.

### 3.1 Project Scaffold
- [ ] Initialise Vue 3 + Vite + TypeScript project
- [ ] Install and configure Tailwind CSS
- [ ] Install and configure PrimeVue 4 with theme
- [ ] Set up Vue Router with route definitions and auth navigation guard
- [ ] Set up Pinia with `auth.store.ts`
- [ ] Create Axios instance (`services/api.ts`) with:
  - Base URL from `VITE_API_BASE_URL`
  - Request interceptor: attach Bearer token
  - Response interceptor: handle 401, attempt refresh, retry

### 3.2 Auth Views
- [ ] Build `LoginView.vue` with vee-validate form
- [ ] Build `RegisterView.vue`
- [ ] Connect to auth store actions → `auth.service.ts` → API
- [ ] Store JWT in Pinia memory; refresh token in httpOnly cookie
- [ ] Navigation guard redirects unauthenticated users to `/login`

### 3.3 Layout Shell
- [ ] Build `AppSidebar.vue` with nav links
- [ ] Build `AppHeader.vue` with user menu + logout
- [ ] Build `AppToast.vue` connected to `ui.store.ts`
- [ ] Wrap protected routes in layout component

---

## Phase 4 — Client-Side Redaction Pipeline (Frontend)

**Goal:** Users can upload a PDF, see it redacted in the browser, and confirm before submission. This is the core trust feature of the app.

### 4.1 Install and Configure PDF Packages
- [ ] Install `pdfjs-dist`, `pdf-lib`, `@openredaction/openredaction`
- [ ] Configure pdfjs worker URL in `vite.config.ts`

### 4.2 `usePdfRedaction.ts` Composable
- [ ] Load PDF file with pdfjs
- [ ] Extract text content + item positions per page
- [ ] Build char-offset-to-bounding-box map (`utils/pdfCoordinates.ts`)
- [ ] Run `openredaction.detect()` on full page text
- [ ] Map detected entity character offsets back to PDF bounding boxes
- [ ] Load original PDF bytes into `pdf-lib`
- [ ] Draw filled black rectangles over each detected entity's bounding box
- [ ] Return `{ redactedBlob, entitiesSummary }` 
- [ ] Write composable unit tests with sample PDFs

### 4.3 Upload Flow UI
- [ ] Build `FileDropZone.vue` — drag-and-drop with file type + size validation
- [ ] Build `RedactionPipeline.vue` — step indicator (Upload → Detecting → Preview → Confirm)
- [ ] Build `PdfRedactionViewer.vue` — render redacted PDF pages on canvas using pdfjs
- [ ] Build `RedactionControls.vue` — allow user to draw additional redaction boxes manually
- [ ] Build `PiiSummaryPanel.vue` — show count of each PII type detected
- [ ] Build `RedactionConfirmModal.vue` — explicit user confirmation with privacy disclaimer
- [ ] Build `UploadProgress.vue` — progress bar during BE upload

### 4.4 Upload to Backend
- [ ] Build `useFileUpload.ts` composable — post redacted blob + metadata to BE
- [ ] Show upload progress via Axios `onUploadProgress`
- [ ] On success: add statement to `statements.store` and navigate to detail view

---

## Phase 5 — Statement Management UI

**Goal:** Users can view, tag, filter, and manage their uploaded statements.

### 5.1 Statements List
- [ ] Build `StatementsListView.vue`
- [ ] Build `StatementCard.vue` — filename, date, bank, status badge, tags
- [ ] Build `StatementStatusBadge.vue`
- [ ] Build `StatementTagBadge.vue` — coloured pill
- [ ] Build `StatementFilterBar.vue` — filter by tag, status, date range
- [ ] Wire to `statements.store.ts` + `statements.service.ts`

### 5.2 Tag Management
- [ ] Create `tags` table migration + model on BE
- [ ] Build tag CRUD endpoints (`/api/v1/tags`)
- [ ] Build tag management UI in `SettingsView.vue`
- [ ] Wire tag assignment to `StatementCard.vue`

### 5.3 Statement Detail View
- [ ] Build `StatementDetailView.vue`
  - Show statement metadata
  - Show redacted PDF preview (download button)
  - Show redaction report (Presidio findings)
  - "Run Analysis" button → triggers analysis job
  - Analysis status polling via `usePolling.ts`
  - Link to insights dashboard once done

---

## Phase 6 — Insights Dashboard

**Goal:** Rich visual dashboard of financial insights from the LLM.

### 6.1 Install ECharts
- [ ] Install `echarts` + `vue-echarts`
- [ ] Create `useInsightCharts.ts` composable to transform `InsightData` → ECharts options

### 6.2 Chart Components
- [ ] Build `InsightsSummaryCard.vue` — three KPI cards (income / expenses / net)
- [ ] Build `SpendingByCategoryChart.vue` — donut chart
- [ ] Build `IncomeVsExpenseChart.vue` — grouped bar chart
- [ ] Build `TopMerchantsChart.vue` — horizontal bar chart
- [ ] Build `RecurringTransactionsList.vue` — PrimeVue DataTable
- [ ] Build `ActionableInsightsList.vue` — styled bullet list
- [ ] Build `UnusualTransactionsAlert.vue` — warning card list

### 6.3 Insights View Assembly
- [ ] Build `InsightsView.vue` assembling all chart components
- [ ] Add loading skeleton states while insights are loading
- [ ] Handle error state (analysis failed)
- [ ] Add `usePolling.ts` for job status while analysis is running

---

## Phase 7 — Export Features

### 7.1 Backend Export Endpoints
- [ ] Install `ReportLab` for PDF generation
- [ ] Install `openpyxl` for Excel generation
- [ ] Implement `services/export_service.py`
  - `generate_pdf_report(insight_data)` → bytes
  - `generate_excel(insight_data)` → bytes (multi-sheet)
  - `generate_json(insight_data)` → JSON string
- [ ] Build export endpoints (`/api/v1/exports/{statement_id}/pdf|excel|json`)

### 7.2 Frontend Export UI
- [ ] Install `file-saver`
- [ ] Build `useExport.ts` composable — call BE export endpoints, trigger download
- [ ] Build `ExportMenu.vue` — dropdown button with PDF / Excel / JSON options
- [ ] Add `ExportMenu` to `InsightsView.vue`

---

## Phase 8 — Integration Testing and Hardening

### 8.1 End-to-End Tests
- [ ] Playwright: full upload → redact → confirm → analyse → view insights flow
- [ ] Playwright: export flow (each format)
- [ ] Playwright: tag management flow
- [ ] Playwright: auth flow (register, login, protected routes)

### 8.2 Backend Hardening
- [ ] Add rate limiting to upload endpoint (slowapi)
- [ ] Add request size limits in FastAPI middleware
- [ ] Ensure original PDFs are never returned via API without auth check
- [ ] Add structured logging (JSON logs with request IDs)
- [ ] Add Celery task failure alerting (dead-letter queue logging)

### 8.3 Frontend Hardening
- [ ] Handle all API error states gracefully in UI (toast messages)
- [ ] Add loading + empty states to all list views
- [ ] Confirm redaction disclaimer is prominent and not skippable
- [ ] Add file type + size validation both client-side and ensure server returns clear error messages

---

## Cross-Cutting Concerns

### Error Handling Convention
- Backend: all errors use `app/core/exceptions.py` custom classes, returned as `{ detail: string, code: string }`
- Frontend: Axios interceptor maps error codes to user-facing toast messages in `ui.store.ts`

### Async Job Pattern
All long-running operations (redaction, analysis) follow the same pattern:
```
POST /resource/{id}/run     → returns { job_id, status: "pending" }
GET  /resource/{id}/status  → returns { status, progress?, error? }
Frontend polls every 2s via usePolling.ts until status === "done" | "error"
```

### Pydantic ↔ TypeScript Type Sync
The `InsightData` Pydantic model on the BE is the source of truth. A matching TypeScript interface in `types/insight.types.ts` must be kept in sync manually. When the schema changes, update both.

### Prompt Versioning
Each Ollama prompt is tagged with a version string stored in `analysis_jobs.prompt_version`. This allows comparison of insight quality across prompt iterations without losing historical data.

---

## Milestone Summary

| Milestone | Phases | Deliverable |
|---|---|---|
| M1 — Working API | 1 | Authenticated upload + statement CRUD |
| M2 — Redaction Pipeline | 2 | Full BE redaction + analysis via Ollama |
| M3 — Frontend Shell | 3 | Logged-in app with nav and API client |
| M4 — Redaction UX | 4 | Client-side redact → preview → confirm flow |
| M5 — Statement Mgmt | 5 | List, tag, filter, detail view |
| M6 — Insights Dashboard | 6 | All charts rendering from real insight data |
| M7 — Exports | 7 | PDF, Excel, JSON download working |
| M8 — Production Ready | 8 | E2E tested, hardened, deployable |


## Notes
- Follow the instructions in the `BE.md` and `FE.md` files for the implementation of the backend and frontend respectively.
- The `implementation.MD` file is the main file for this document.
- Ensure for the styling of the components to be consistent with the instructions in the `branding.json` file.
