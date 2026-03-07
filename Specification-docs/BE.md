# Backend Documentation — Bank Statement Analyser

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | FastAPI (Python 3.11+) | Core API framework |
| Database | PostgreSQL 15 | Primary data store |
| ORM | SQLAlchemy 2.0 + Alembic | DB access and migrations |
| PDF Parsing | pdfplumber + PyMuPDF (fitz) | Text + coordinate extraction from PDFs |
| PII Redaction | Microsoft Presidio (Analyzer + Anonymizer) | Second-pass server-side PII detection |
| LLM Integration | Ollama Python SDK | Cloud LLM communication |
| Task Queue | Celery + Redis | Async PDF processing and analysis jobs |
| File Storage | Local filesystem (or S3-compatible) | Statement PDF storage |
| Auth | JWT (python-jose) + bcrypt | User authentication |
| Validation | Pydantic v2 | Request/response schemas |
| Testing | Pytest + httpx | Unit and integration tests |


---

## Folder Structure

```
bank-analyser-be/
│
├── app/
│   ├── main.py                   # FastAPI app entry point, middleware, router registration
│   ├── config.py                 # Settings via pydantic-settings (.env loading)
│   ├── dependencies.py           # Shared FastAPI dependencies (DB session, current user)
│   │
│   ├── api/
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py           # Login, register, refresh token endpoints
│   │   │   ├── statements.py     # Upload, list, tag, delete statement endpoints
│   │   │   ├── redaction.py      # Trigger/confirm server-side redaction
│   │   │   ├── analysis.py       # Submit for analysis, fetch insights
│   │   │   ├── insights.py       # CRUD on saved insights, export endpoints
│   │   │   └── exports.py        # PDF / Excel / JSON export endpoints
│   │
│   ├── core/
│   │   ├── security.py           # JWT creation, verification, password hashing
│   │   ├── exceptions.py         # Custom HTTP exception classes
│   │   └── logging.py            # Structured logging setup
│   │
│   ├── models/
│   │   ├── user.py               # User ORM model
│   │   ├── statement.py          # Statement ORM model
│   │   ├── redaction.py          # RedactionJob ORM model
│   │   ├── analysis.py           # AnalysisJob ORM model
│   │   └── insight.py            # Insight ORM model
│   │
│   ├── schemas/
│   │   ├── user.py               # UserCreate, UserRead Pydantic schemas
│   │   ├── statement.py          # StatementUpload, StatementRead schemas
│   │   ├── redaction.py          # RedactionResult schema
│   │   ├── analysis.py           # AnalysisRequest, AnalysisResult schemas
│   │   ├── insight.py            # InsightRead, InsightSummary schemas
│   │   └── export.py             # ExportRequest schema
│   │
│   ├── services/
│   │   ├── pdf_parser.py         # Extract text + positions from PDF using pdfplumber/PyMuPDF
│   │   ├── redaction_service.py  # Run Presidio analysis + anonymisation on extracted text
│   │   ├── ollama_service.py     # Build prompts, call Ollama, parse structured responses
│   │   ├── insight_service.py    # Store, retrieve, aggregate insights from DB
│   │   ├── export_service.py     # Generate PDF/Excel/JSON exports from insight data
│   │   └── tag_service.py        # Tag management for statements
│   │
│   ├── tasks/
│   │   ├── celery_app.py         # Celery app instance + Redis broker config
│   │   ├── redaction_tasks.py    # Async task: run server-side redaction pass
│   │   └── analysis_tasks.py     # Async task: send to Ollama, save insights
│   │
│   ├── db/
│   │   ├── session.py            # SQLAlchemy engine + session factory
│   │   └── base.py               # Base declarative model
│   │
│   └── migrations/
│       └── versions/             # Alembic migration files
│
├── tests/
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_statements.py
│   ├── test_redaction.py
│   ├── test_analysis.py
│   └── test_exports.py
│
├── .env.example
├──uv.lock
└── alembic.ini
```

---

## Database Schema

### `users`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
email           VARCHAR(255) UNIQUE NOT NULL
hashed_password VARCHAR(255) NOT NULL
full_name       VARCHAR(255)
created_at      TIMESTAMP DEFAULT now()
updated_at      TIMESTAMP DEFAULT now()
is_active       BOOLEAN DEFAULT TRUE
```

### `statements`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id         UUID REFERENCES users(id) ON DELETE CASCADE
filename        VARCHAR(255) NOT NULL
file_path       TEXT NOT NULL                  -- path to original PDF
redacted_path   TEXT                           -- path to redacted PDF
file_size_bytes INTEGER
bank_name       VARCHAR(100)
statement_month VARCHAR(7)                     -- e.g. "2024-03"
status          VARCHAR(50) DEFAULT 'uploaded' -- uploaded | redacting | redacted | analysing | done | error
tags            TEXT[]                         -- e.g. ['personal', 'savings']
uploaded_at     TIMESTAMP DEFAULT now()
updated_at      TIMESTAMP DEFAULT now()
```

### `redaction_jobs`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
statement_id    UUID REFERENCES statements(id) ON DELETE CASCADE
status          VARCHAR(50) DEFAULT 'pending'  -- pending | running | done | failed
pii_found       JSONB                          -- list of detected PII types + counts
confidence_avg  FLOAT
started_at      TIMESTAMP
completed_at    TIMESTAMP
error_message   TEXT
```

### `analysis_jobs`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
statement_id    UUID REFERENCES statements(id) ON DELETE CASCADE
ollama_model    VARCHAR(100) DEFAULT 'llama3'
prompt_version  VARCHAR(20)
status          VARCHAR(50) DEFAULT 'pending'  -- pending | running | done | failed
started_at      TIMESTAMP
completed_at    TIMESTAMP
error_message   TEXT
raw_llm_output  TEXT                           -- stored for debugging
```

### `insights`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
statement_id    UUID REFERENCES statements(id) ON DELETE CASCADE
analysis_job_id UUID REFERENCES analysis_jobs(id)
user_id         UUID REFERENCES users(id) ON DELETE CASCADE
period          VARCHAR(7)                     -- e.g. "2024-03"
summary         TEXT
data            JSONB NOT NULL                 -- full structured insight payload (see below)
created_at      TIMESTAMP DEFAULT now()
```

### Insight JSONB Shape (`data` column)
```json
{
  "total_income": 4200.00,
  "total_expenses": 3150.00,
  "net_balance": 1050.00,
  "currency": "USD",
  "spending_by_category": {
    "Food & Dining": 420.00,
    "Transport": 180.00,
    "Utilities": 210.00,
    "Entertainment": 95.00
  },
  "recurring_debits": [
    { "description": "Netflix", "amount": 15.99, "frequency": "monthly" },
    { "description": "Rent", "amount": 1200.00, "frequency": "monthly" }
  ],
  "recurring_credits": [
    { "description": "Salary", "amount": 4200.00, "frequency": "monthly" }
  ],
  "top_merchants": [
    { "name": "Supermarket Co", "total": 320.00, "count": 12 }
  ],
  "unusual_transactions": [
    { "description": "Large transfer", "amount": 800.00, "flag": "high_value" }
  ],
  "actionable_insights": [
    "You spent 13% more on dining compared to last month.",
    "Your subscription costs total $95/month — consider reviewing them."
  ],
  "savings_rate_percent": 25.0
}
```

### `tags` (reusable tag registry per user)
```sql
id      UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id UUID REFERENCES users(id) ON DELETE CASCADE
name    VARCHAR(100) NOT NULL
colour  VARCHAR(7)   -- hex colour e.g. #3B82F6
UNIQUE(user_id, name)
```

---

## Core Modules

### `pdf_parser.py`
- Opens PDF with pdfplumber for text extraction with bounding box coordinates
- Falls back to PyMuPDF for image-based/scanned PDFs
- Returns structured `ParsedPage` objects: `{ page_num, text_blocks: [{ text, x0, y0, x1, y1 }] }`

### `redaction_service.py`
- Accepts `ParsedPage` list from parser
- Runs Microsoft Presidio Analyzer to detect PII (names, emails, phone, address, NI/SSN, account numbers)
- Returns detected entities with character offsets and confidence scores
- Applies Presidio Anonymizer to produce clean text
- Maps character offsets back to PDF bounding boxes for frontend visual overlay metadata

### `ollama_service.py`
- Accepts redacted plain text extracted from PDF
- Constructs a structured prompt instructing Ollama to return JSON only
- Calls Ollama API via `ollama` Python SDK
- Validates response against Pydantic `InsightData` schema
- Retries up to 3 times on malformed JSON

### `export_service.py`
- **PDF export**: ReportLab generates a styled report from insight JSON
- **Excel export**: openpyxl builds a multi-sheet workbook (summary, transactions, categories)
- **JSON export**: Direct serialisation of insight data

---

## API Endpoints Summary

### Auth — `/api/v1/auth`
```
POST   /register          Create new user account
POST   /login             Return access + refresh JWT tokens
POST   /refresh           Refresh access token
POST   /logout            Invalidate refresh token
```

### Statements — `/api/v1/statements`
```
POST   /                  Upload PDF statement (multipart/form-data)
GET    /                  List all statements for current user (filterable by tag, date, status)
GET    /{id}              Get single statement metadata
PATCH  /{id}              Update tags, bank_name, statement_month
DELETE /{id}              Delete statement + associated files and insights
GET    /{id}/download     Download original PDF
GET    /{id}/redacted     Download redacted PDF
```

### Redaction — `/api/v1/redaction`
```
POST   /{statement_id}/run       Trigger server-side redaction pass (Presidio)
GET    /{statement_id}/status    Poll redaction job status
GET    /{statement_id}/report    Get PII detection report (types found, confidence)
```

### Analysis — `/api/v1/analysis`
```
POST   /{statement_id}/run       Submit redacted statement to Ollama for analysis
GET    /{statement_id}/status    Poll analysis job status
```

### Insights — `/api/v1/insights`
```
GET    /                         List all insight summaries for user
GET    /{statement_id}           Get full insight JSON for a statement
GET    /aggregate                Aggregate insights across multiple statements (date range)
DELETE /{id}                     Delete an insight record
```

### Exports — `/api/v1/exports`
```
GET    /{statement_id}/pdf       Export insights as PDF report
GET    /{statement_id}/excel     Export insights as Excel workbook
GET    /{statement_id}/json      Export raw insight JSON
```

### Tags — `/api/v1/tags`
```
GET    /                         List all user tags
POST   /                         Create a new tag
DELETE /{id}                     Delete a tag
```

---

## Environment Variables (`.env.example`)

```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/bankanalyser
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
OLLAMA_MODEL=llama3
FILE_STORAGE_PATH=./storage/statements
MAX_UPLOAD_SIZE_MB=20
```

---

## Ollama Prompt Strategy

The LLM is instructed via a strict system prompt to return **only valid JSON** matching the `InsightData` schema. The user message contains the redacted statement text with clear section markers. Example system prompt excerpt:

```
You are a financial analyst. Analyse the bank statement text provided and return ONLY a valid JSON object.
Do not include any explanation, markdown, or extra text.
The JSON must match this schema exactly: { total_income, total_expenses, ... }
```

Prompt versioning is stored in `analysis_jobs.prompt_version` to allow comparison across LLM updates.

---

## Security Notes

- All uploaded files are stored outside the web root
- File type validation enforced server-side (PDF magic bytes check, not just extension)
- Redacted PDFs are the **only** version forwarded to Ollama — originals never leave the storage layer
- Presidio runs in process — no external API calls for PII detection
- JWT tokens are short-lived; refresh tokens stored hashed in Redis. Tokens are stored in cookies with HttpOnly and Secure flags.
- Passwords are hashed with Argon2 and stored in the database.
- The API is protected with a rate limiter.
- The DB connection uses the asyncpg driver.
- uv is used as the package manager for the BE.
