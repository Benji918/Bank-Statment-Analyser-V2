# Project Definitions — Bank Statement Analyser

---

## Project Overview

**Name:** Bank Statement Analyser  
**Type:** Full-stack web application  
**Purpose:** Allow users to upload personal bank statement PDFs, automatically redact sensitive PII before any processing, receive AI-generated financial insights from a local LLM, and visualise those insights through an interactive dashboard — all without their raw personal data ever leaving their control.

---

## Problem Statement

People want intelligent analysis of their spending habits and financial health, but are understandably reluctant to upload sensitive bank documents to third-party cloud AI services. Existing tools either require full document access (high privacy risk) or provide only basic categorisation with no real insight.

---

## Core Value Proposition

> **Full financial intelligence, zero raw data exposure.**

The app uniquely shows users their redacted document *before* anything is processed, proving their sensitive information is protected. Combined with a cloud LLM (Ollama)

---

## User Personas

### Primary — Privacy-Conscious Professional
- Age 25–45, tech-aware
- Wants spending insights but distrusts cloud services
- Values transparency about what data is used
- Willing to self-host or use a privacy-first hosted version

### Secondary — Small Business Owner
- Wants to track recurring expenses, revenue, and unusual charges
- Needs exportable reports for their accountant
- Manages multiple bank accounts / statements per month

---

## Glossary

| Term | Definition |
|---|---|
| **Statement** | A PDF bank statement uploaded by the user |
| **Redaction** | The process of detecting and obscuring PII from a statement |
| **PII** | Personally Identifiable Information — names, phone numbers, emails, addresses, account numbers, etc. |
| **Client-side redaction** | First-pass PII detection and visual redaction performed entirely in the browser using npm packages |
| **Server-side redaction** | Second-pass PII detection run on the FastAPI backend using Microsoft Presidio as a safety net |
| **Insight** | A structured JSON object containing the financial analysis output for a single statement |
| **Analysis job** | A background task that sends the redacted statement text to Ollama and returns structured insights |
| **Ollama** | Cloud API call |
| **Tag** | A user-defined label applied to a statement for organisation (e.g. "Business", "Personal", "2024") |
| **Export** | Downloading insights in PDF, Excel, or JSON format for offline use |
| **Recurring transaction** | A debit or credit that appears at regular intervals, identified by the LLM |
| **Unusual transaction** | A transaction flagged by the LLM as anomalous based on amount or pattern |

---

## Feature List

### MVP (Phase 1)
- [ ] User registration and authentication (JWT)
- [ ] PDF upload with file size and type validation
- [ ] Client-side PII detection and visual redaction (pdfjs + openredaction + pdf-lib)
- [ ] Redacted PDF preview before submission
- [ ] Server-side redaction safety pass (Presidio)
- [ ] Redacted PDF download
- [ ] Send redacted text to Ollama for analysis
- [ ] Structured insight extraction and storage in PostgreSQL
- [ ] Insight dashboard with charts (spending by category, income vs expenses, top merchants)
- [ ] Recurring transactions list
- [ ] Actionable insights text panel
- [ ] Statement list with uploaded date, status, tags
- [ ] Basic tag management (create, assign, delete)
- [ ] JSON export of insights

### Phase 2
- [ ] Excel export (multi-sheet workbook)
- [ ] PDF report export (styled with ReportLab)
- [ ] Multi-statement aggregate view (month-over-month trends)
- [ ] Unusual transaction alerts
- [ ] Savings rate tracking over time
- [ ] Manual transaction category correction

### Phase 3
- [ ] Multiple bank format detection (auto-detect layout)
- [ ] Scanned PDF support (OCR fallback via Tesseract)
- [ ] Statement comparison view (two periods side-by-side)
- [ ] Budget goal setting against insight categories
- [ ] Email report scheduling

---

## Non-Functional Requirements

| Requirement | Target |
|---|---|
| Client-side redaction speed | < 3 seconds for a standard 12-page statement |
| Analysis job completion | < 60 seconds end-to-end with Llama 3 8B on consumer hardware |
| PDF upload size limit | 20MB max |
| Concurrent users (MVP) | 50 simultaneous (single server) |
| Data at rest | PDFs stored with filesystem permissions; insights in PostgreSQL |
| Authentication | JWT access tokens (30 min expiry) + httpOnly refresh cookie (7 days) |
| Accessibility | WCAG 2.1 AA for all interactive UI components |

---

## Data Flow Diagram

```
USER BROWSER
│
├─ 1. User selects PDF
│
├─ 2. pdfjs-dist extracts text + bounding box coordinates
│
├─ 3. openredaction detects PII in extracted text
│
├─ 4. pdf-lib draws black rectangles on PDF at PII coordinates
│
├─ 5. User sees redacted PDF preview in browser
│   └─ User can manually add/remove redaction zones
│
├─ 6. User confirms → Redacted PDF blob uploaded to FastAPI
│
FASTAPI BACKEND
│
├─ 7. Presidio runs second-pass PII detection on redacted text (safety net)
│
├─ 8. Redacted PDF saved to filesystem
│
├─ 9. Celery task queued: extract text from redacted PDF
│
├─ 10. Redacted text sent to Ollama (cloud API)
│
├─ 11. Ollama returns structured JSON insight payload
│
├─ 12. Insight JSON validated (Pydantic) and saved to PostgreSQL
│
USER BROWSER
│
└─ 13. Frontend uses websockets to show job progress and for job completion
    └─ Loads insight JSON and renders charts/dashboard
```

---

## Security Model

```
┌─────────────────────────────────────────────────┐
│  What stays in the browser only                  │
│  - Original unredacted PDF                       │
│  - Raw PII text before redaction                 │
└─────────────────────────────────────────────────┘
          │ Only redacted PDF crosses this boundary
          ▼
┌─────────────────────────────────────────────────┐
│  What the Backend receives                       │
│  - Redacted PDF (black boxes over PII)           │
│  - Statement metadata (filename, date, tags)     │
└─────────────────────────────────────────────────┘
          │ Only redacted plain text crosses this boundary
          ▼
┌─────────────────────────────────────────────────┐
│  What Ollama receives                            │
│  - Redacted plain text extracted from PDF        │
│  - No names, numbers, account details            │
│  - Calls the Ollama cloud API                         │
└─────────────────────────────────────────────────┘
```

---

## Redaction Coverage

The following PII types are targeted for detection and redaction:

| PII Type | Detection Layer |
|---|---|
| Full names | Client (openredaction) + Server (Presidio) |
| Email addresses | Client + Server |
| Phone numbers | Client + Server |
| Physical addresses | Client + Server |
| Account numbers | Server (Presidio — regex patterns) |
| Sort codes / routing numbers | Server |
| National Insurance / SSN | Client + Server |
| Passport / driving licence numbers | Client + Server |
| Dates of birth | Server |

---

## Project Constraints

- Ollama cloud based API is being used
- The MVP supports single-user accounts on a single deployed instance; multi-tenant isolation is a Phase 2 concern
- The redaction system does not guarantee 100% PII removal — users are informed of this and must confirm before submitting