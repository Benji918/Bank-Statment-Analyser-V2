# Frontend Documentation — Bank Statement Analyser

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Vue 3 (Composition API) | Core UI framework |
| Build Tool | Vite | Dev server and bundler |
| State Management | Pinia | Global app state |
| Routing | Vue Router 4 | SPA navigation |
| UI Component Library | PrimeVue 4 | Base UI components |
| Styling | Tailwind CSS 3 | Utility-first styling |
| Charts | Apache ECharts (vue-echarts) | Insight data visualisations |
| PDF Rendering | pdfjs-dist | Render PDF in browser canvas |
| PDF Manipulation | pdf-lib | Draw redaction rectangles on PDF |
| PII Detection | @openredaction/openredaction | Client-side PII detection in extracted text |
| HTTP Client | Axios | API communication |
| Form Validation | Vee-Validate + Yup | Form schema validation |
| Date Handling | Day.js | Date formatting and parsing |
| File Export | FileSaver.js | Trigger browser file downloads |
| Testing | Vitest + Vue Test Utils | Unit and component tests |
| E2E Testing | Playwright | End-to-end test flows |

---

## Folder Structure

```
bank-analyser-fe/
│
├── public/
│   └── favicon.ico
│
├── src/
│   ├── main.ts                  # App entry point, plugin registration
│   ├── App.vue                  # Root component, router-view
│   │
│   ├── router/
│   │   └── index.ts             # Route definitions and navigation guards
│   │
│   ├── stores/
│   │   ├── auth.store.ts        # User session, login/logout actions
│   │   ├── statements.store.ts  # Uploaded statements list and metadata
│   │   ├── redaction.store.ts   # Redaction state per statement
│   │   ├── analysis.store.ts    # Analysis job status
│   │   ├── insights.store.ts    # Loaded insights JSON per statement
│   │   └── ui.store.ts          # Global UI state (loading, toasts, modals)
│   │
│   ├── views/
│   │   ├── auth/
│   │   │   ├── LoginView.vue
│   │   │   └── RegisterView.vue
│   │   ├── dashboard/
│   │   │   └── DashboardView.vue        # Overview: recent statements, summary charts
│   │   ├── statements/
│   │   │   ├── StatementsListView.vue   # All uploaded statements with tags + filters
│   │   │   ├── StatementUploadView.vue  # Upload flow + redaction preview
│   │   │   └── StatementDetailView.vue  # Single statement: redaction + insights
│   │   ├── insights/
│   │   │   └── InsightsView.vue         # Full insights dashboard for a statement
│   │   └── settings/
│   │       └── SettingsView.vue         # Profile, preferences, tag management
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppSidebar.vue
│   │   │   ├── AppHeader.vue
│   │   │   └── AppToast.vue
│   │   │
│   │   ├── upload/
│   │   │   ├── FileDropZone.vue         # Drag-and-drop PDF upload area
│   │   │   └── UploadProgress.vue       # Upload progress bar
│   │   │
│   │   ├── redaction/
│   │   │   ├── RedactionPipeline.vue    # Orchestrates the full redaction flow
│   │   │   ├── PdfRedactionViewer.vue   # Renders PDF with redaction overlays on canvas
│   │   │   ├── RedactionControls.vue    # Manual add/remove redaction tools
│   │   │   ├── PiiSummaryPanel.vue      # Shows what PII was detected and redacted
│   │   │   └── RedactionConfirmModal.vue # User confirms before sending to BE
│   │   │
│   │   ├── insights/
│   │   │   ├── InsightsSummaryCard.vue  # Income / expenses / net balance cards
│   │   │   ├── SpendingByCategoryChart.vue   # Donut/bar chart
│   │   │   ├── IncomeVsExpenseChart.vue      # Bar or line chart
│   │   │   ├── RecurringTransactionsList.vue # Table of recurring debits/credits
│   │   │   ├── TopMerchantsChart.vue         # Horizontal bar chart
│   │   │   ├── ActionableInsightsList.vue    # Bullet list of LLM recommendations
│   │   │   └── UnusualTransactionsAlert.vue  # Flagged transactions panel
│   │   │
│   │   ├── statements/
│   │   │   ├── StatementCard.vue        # Card in list view
│   │   │   ├── StatementTagBadge.vue    # Coloured tag pill
│   │   │   ├── StatementFilterBar.vue   # Filter by tag, date, status
│   │   │   └── StatementStatusBadge.vue # uploaded | redacted | done | error
│   │   │
│   │   └── export/
│   │       └── ExportMenu.vue           # Dropdown: Export as PDF / Excel / JSON
│   │
│   ├── composables/
│   │   ├── usePdfRedaction.ts    # Core redaction pipeline logic (pdfjs + openredaction + pdf-lib)
│   │   ├── useFileUpload.ts      # File validation, upload to BE with progress
│   │   ├── usePolling.ts         # Generic polling hook for job status endpoints
│   │   ├── useInsightCharts.ts   # Transform insight JSON into ECharts config objects
│   │   └── useExport.ts          # Trigger BE export downloads via FileSaver
│   │
│   ├── services/
│   │   ├── api.ts               # Axios instance with interceptors (auth headers, error handling)
│   │   ├── auth.service.ts
│   │   ├── statements.service.ts
│   │   ├── redaction.service.ts
│   │   ├── analysis.service.ts
│   │   ├── insights.service.ts
│   │   └── export.service.ts
│   │
│   ├── types/
│   │   ├── statement.types.ts
│   │   ├── insight.types.ts
│   │   ├── redaction.types.ts
│   │   └── auth.types.ts
│   │
│   └── utils/
│       ├── formatters.ts        # Currency, date, percentage formatters
│       └── pdfCoordinates.ts    # Map text char offsets to PDF canvas pixel coords
│
├── tests/
│   ├── unit/
│   └── e2e/
│
├── .env.example
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Key Views and Their Responsibilities

### `StatementUploadView.vue`
This is the most complex view in the app. It orchestrates the multi-step upload flow:

```
Step 1 → User drops/selects PDF
Step 2 → usePdfRedaction runs client-side:
           pdfjs extracts text + positions
           openredaction detects PII
           pdf-lib draws black rectangles over PII positions
Step 3 → PdfRedactionViewer shows the redacted PDF preview
         PiiSummaryPanel shows what was found (e.g. "3 names, 2 phone numbers redacted")
         User can manually add/remove redaction areas
Step 4 → RedactionConfirmModal: user confirms they're happy
Step 5 → Redacted PDF blob + metadata sent to BE
Step 6 → BE runs its own Presidio pass silently
Step 7 → User is navigated to StatementDetailView
```

### `InsightsView.vue`
Loads insight JSON from the store and renders all chart components. Includes the export menu. If insights aren't ready yet, shows a polling status indicator via `usePolling`.

---

## Client-Side Redaction Pipeline (`usePdfRedaction.ts`)

```typescript
// High-level flow inside the composable

async function redactPdf(file: File): Promise<RedactionResult> {
  // 1. Load PDF with pdfjs-dist
  const pdf = await pdfjsLib.getDocument(await file.arrayBuffer()).promise

  const allEntities: DetectedEntity[] = []
  const pageTextMaps: PageTextMap[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()

    // 2. Build full text string + track char→item mapping for coordinate lookback
    const { fullText, charMap } = buildCharMap(textContent)

    // 3. Run openredaction PII detection on extracted text
    const entities = await OpenRedaction.detect(fullText)
    allEntities.push(...entities.map(e => ({ ...e, page: i })))
    pageTextMaps.push({ page: i, fullText, charMap, viewport: page.getViewport({ scale: 1 }) })
  }

  // 4. Use pdf-lib to draw redaction rectangles over detected positions
  const pdfDoc = await PDFDocument.load(await file.arrayBuffer())

  for (const entity of allEntities) {
    const { charMap, viewport } = pageTextMaps[entity.page - 1]
    const bbox = charOffsetToPdfCoords(entity.start, entity.end, charMap, viewport)
    const page = pdfDoc.getPage(entity.page - 1)
    page.drawRectangle({
      x: bbox.x, y: bbox.y,
      width: bbox.width, height: bbox.height,
      color: rgb(0, 0, 0)
    })
  }

  const redactedBytes = await pdfDoc.save()
  return {
    redactedBlob: new Blob([redactedBytes], { type: 'application/pdf' }),
    entitiesSummary: summariseEntities(allEntities)
  }
}
```

---

## State Management (Pinia Stores)

### `statements.store.ts`
```typescript
state: {
  statements: Statement[]
  selectedStatement: Statement | null
  filters: { tags: string[], status: string, dateRange: [string, string] | null }
  isLoading: boolean
}
actions: fetchStatements, uploadStatement, updateTags, deleteStatement
```

### `redaction.store.ts`
```typescript
state: {
  jobsByStatementId: Record<string, RedactionJob>
  previewUrls: Record<string, string>        // object URLs for redacted PDF preview
}
actions: runClientRedaction, confirmAndUpload, fetchServerRedactionStatus
```

### `insights.store.ts`
```typescript
state: {
  insightsByStatementId: Record<string, InsightData>
  analysisJobStatus: Record<string, 'pending' | 'running' | 'done' | 'error'>
}
actions: triggerAnalysis, pollAnalysisStatus, fetchInsights, clearInsights
```

---

## Chart Components (ECharts)

Each chart component accepts a typed `InsightData` prop and converts it into an ECharts `option` object via `useInsightCharts.ts`.

| Component | Chart Type | Data Source |
|---|---|---|
| `SpendingByCategoryChart` | Donut | `spending_by_category` |
| `IncomeVsExpenseChart` | Grouped Bar | `total_income`, `total_expenses` |
| `TopMerchantsChart` | Horizontal Bar | `top_merchants` |
| `RecurringTransactionsList` | Table | `recurring_debits`, `recurring_credits` |
| `ActionableInsightsList` | Text list | `actionable_insights` |
| `UnusualTransactionsAlert` | Alert cards | `unusual_transactions` |

---

## Routing Structure

```typescript
/                         → redirect to /dashboard
/login                    → LoginView
/register                 → RegisterView
/dashboard                → DashboardView           [auth required]
/statements               → StatementsListView      [auth required]
/statements/upload        → StatementUploadView     [auth required]
/statements/:id           → StatementDetailView     [auth required]
/statements/:id/insights  → InsightsView            [auth required]
/settings                 → SettingsView            [auth required]
```

Navigation guard checks for valid JWT in auth store before entering any protected route.

---

## Environment Variables (`.env.example`)

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_MAX_UPLOAD_SIZE_MB=20
VITE_OLLAMA_MODEL_DISPLAY=LLaMA 3
```

---

## Key npm Packages

```json
{
  "dependencies": {
    "vue": "^3.4",
    "vue-router": "^4.3",
    "pinia": "^2.1",
    "primevue": "^4.0",
    "axios": "^1.6",
    "pdfjs-dist": "^4.4",
    "pdf-lib": "^1.17",
    "@openredaction/openredaction": "latest",
    "vue-echarts": "^6.7",
    "echarts": "^5.5",
    "vee-validate": "^4.13",
    "yup": "^1.4",
    "dayjs": "^1.11",
    "file-saver": "^2.0"
  },
  "devDependencies": {
    "vite": "^5.3",
    "vitest": "^1.6",
    "@playwright/test": "^1.45",
    "tailwindcss": "^3.4",
    "@vue/test-utils": "^2.4",
    "typescript": "^5.4"
  }
}
```

---

## Security and Privacy Notes

- The original PDF file **never leaves the browser** until after redaction is complete
- Redacted PDF is rendered as a canvas preview — the raw file is not exposed as a downloadable URL until the user explicitly requests it
- JWT stored in memory (Pinia store) — not in localStorage. Refresh token stored as httpOnly cookie
- All API calls go through the Axios interceptor which attaches the Bearer token and handles 401 refresh flows
- All created components and styling should follow the instructions in the `branding.json` file
- Ensure the entire UI is responsive and works on all devices and the entire UX, components, UI and sutle animations in the website are clean and beautiful and user-friendly and appealing and in line with the  `branding.json` file.