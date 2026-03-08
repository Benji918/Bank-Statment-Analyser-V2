# =============================================================================
# Bank Statement Analyser — Makefile
# Usage: make <target>
# =============================================================================

.DEFAULT_GOAL := help
.PHONY: help \
        install install-be install-fe \
        dev dev-be dev-fe \
        build \
        test test-be test-fe \
        lint lint-be lint-fe \
        migrate migrate-make migrate-upgrade migrate-downgrade \
        celery celery-beat \
        docker-up docker-down docker-build docker-logs docker-clean \
        clean clean-be clean-fe

# ─── Colours ──────────────────────────────────────────────────────────────────
CYAN  := \033[36m
BOLD  := \033[1m
RESET := \033[0m

# ─── Paths ────────────────────────────────────────────────────────────────────
BE_DIR := be
FE_DIR := fe

# =============================================================================
# HELP
# =============================================================================
help: ## Show this help message
	@echo ""
	@echo "  $(BOLD)Bank Statement Analyser$(RESET)"
	@echo ""
	@echo "  $(CYAN)Usage:$(RESET)  make $(BOLD)<target>$(RESET)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { \
		printf "  $(CYAN)%-22s$(RESET) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""

# =============================================================================
# INSTALL
# =============================================================================
install: install-be install-fe ## Install ALL dependencies (backend + frontend)

install-be: ## Install backend Python dependencies via uv
	@echo "$(CYAN)→ Installing backend dependencies…$(RESET)"
	cd $(BE_DIR) && uv venv --python python3.11
	cd $(BE_DIR) && uv pip install -e ".[dev]"
	@echo "$(CYAN)→ Downloading spaCy model for Presidio…$(RESET)"
	cd $(BE_DIR) && venv/bin/python -m spacy download en_core_web_lg || true

install-fe: ## Install frontend npm dependencies
	@echo "$(CYAN)→ Installing frontend dependencies…$(RESET)"
	cd $(FE_DIR) && npm install

# =============================================================================
# DEV SERVERS
# =============================================================================
dev: ## Start both backend and frontend dev servers (requires two terminals)
	@echo "$(CYAN)→ Run 'make dev-be' and 'make dev-fe' in separate terminals$(RESET)"

dev-be: ## Start the FastAPI backend (hot-reload)
	@echo "$(CYAN)→ Starting FastAPI backend on http://localhost:8000$(RESET)"
	cd $(BE_DIR) && venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-fe: ## Start the Vite frontend dev server
	@echo "$(CYAN)→ Starting Vue frontend on http://localhost:5173$(RESET)"
	cd $(FE_DIR) && npm run dev

# =============================================================================
# BUILD
# =============================================================================
build: ## Build the frontend for production
	@echo "$(CYAN)→ Building frontend for production…$(RESET)"
	cd $(FE_DIR) && npm run build

# =============================================================================
# TESTING
# =============================================================================
test: test-be test-fe ## Run ALL tests (backend + frontend)

test-be: ## Run backend tests with pytest
	@echo "$(CYAN)→ Running backend tests…$(RESET)"
	cd $(BE_DIR) && venv/bin/pytest tests/ -v --tb=short

test-fe: ## Run frontend tests with Vitest
	@echo "$(CYAN)→ Running frontend tests…$(RESET)"
	cd $(FE_DIR) && npm run test --if-present

test-e2e: ## Run Playwright end-to-end tests
	@echo "$(CYAN)→ Running Playwright e2e tests…$(RESET)"
	cd $(FE_DIR) && npx playwright test

# =============================================================================
# LINTING
# =============================================================================
lint: lint-be lint-fe ## Lint ALL code (backend + frontend)

lint-be: ## Lint backend Python code with ruff
	@echo "$(CYAN)→ Linting backend…$(RESET)"
	cd $(BE_DIR) && venv/bin/ruff check app/ || true
	cd $(BE_DIR) && venv/bin/ruff format --check app/ || true

lint-fe: ## Type-check and lint frontend TypeScript/Vue
	@echo "$(CYAN)→ Type-checking frontend…$(RESET)"
	cd $(FE_DIR) && npm run build 2>&1 | head -40

format-be: ## Auto-format backend Python code with ruff
	@echo "$(CYAN)→ Formatting backend…$(RESET)"
	cd $(BE_DIR) && venv/bin/ruff format app/

# =============================================================================
# DATABASE MIGRATIONS (Alembic)
# =============================================================================
migrate: ## Show current Alembic migration status
	@echo "$(CYAN)→ Alembic current revision:$(RESET)"
	cd $(BE_DIR) && venv/bin/alembic current

migrate-make: ## Generate a new migration (set MSG="your message")
	@echo "$(CYAN)→ Generating migration: $(MSG)$(RESET)"
	cd $(BE_DIR) && venv/bin/alembic revision --autogenerate -m "$(MSG)"

migrate-upgrade: ## Apply all pending migrations (upgrade to head)
	@echo "$(CYAN)→ Applying migrations to head…$(RESET)"
	cd $(BE_DIR) && venv/bin/alembic upgrade head

migrate-downgrade: ## Roll back one migration
	@echo "$(CYAN)→ Rolling back one migration…$(RESET)"
	cd $(BE_DIR) && venv/bin/alembic downgrade -1

migrate-history: ## Show full migration history
	cd $(BE_DIR) && venv/bin/alembic history --verbose

# =============================================================================
# CELERY WORKERS
# =============================================================================
celery: ## Start Celery worker (handles redaction + analysis tasks)
	@echo "$(CYAN)→ Starting Celery worker…$(RESET)"
	cd $(BE_DIR) && venv/bin/celery -A app.tasks.celery_app worker --loglevel=info --concurrency=2

celery-beat: ## Start Celery beat scheduler
	@echo "$(CYAN)→ Starting Celery beat…$(RESET)"
	cd $(BE_DIR) && venv/bin/celery -A app.tasks.celery_app beat --loglevel=info

# =============================================================================
# DOCKER
# =============================================================================
docker-up: ## Start all Docker services (PostgreSQL, Redis, API, Celery)
	@echo "$(CYAN)→ Starting Docker services…$(RESET)"
	docker compose up -d

docker-down: ## Stop all Docker services
	@echo "$(CYAN)→ Stopping Docker services…$(RESET)"
	docker compose down

docker-build: ## Build / rebuild Docker images
	@echo "$(CYAN)→ Building Docker images…$(RESET)"
	docker compose build

docker-logs: ## Tail logs from all Docker services
	docker compose logs -f

docker-logs-api: ## Tail logs from the API service only
	docker compose logs -f api

docker-clean: ## Stop containers and remove volumes (DESTRUCTIVE — wipes DB data)
	@echo "$(CYAN)→ Removing containers and volumes…$(RESET)"
	docker compose down -v --remove-orphans

# =============================================================================
# CLEANUP
# =============================================================================
clean: clean-be clean-fe ## Remove all build artefacts

clean-be: ## Remove backend build artefacts and virtual environment
	@echo "$(CYAN)→ Cleaning backend…$(RESET)"
	rm -rf $(BE_DIR)/venv $(BE_DIR)/__pycache__ $(BE_DIR)/app/**/__pycache__ \
	       $(BE_DIR)/.pytest_cache $(BE_DIR)/.ruff_cache $(BE_DIR)/dist $(BE_DIR)/*.egg-info

clean-fe: ## Remove frontend node_modules and build output
	@echo "$(CYAN)→ Cleaning frontend…$(RESET)"
	rm -rf $(FE_DIR)/node_modules $(FE_DIR)/dist $(FE_DIR)/.vite
