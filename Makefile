# Task runner for BeadSnap (豆P).
#
# All targets are thin wrappers around npm scripts. This file exists so the
# repo has one canonical entry point — `make <target>` — regardless of
# whether the underlying command lives in package.json, a Node tool, or a
# shell snippet. CI and Railway native deployment drive these targets too.
#
# Quick reference:
#   make install    — install npm deps
#   make dev        — run the Next.js dev server
#   make build      — production build
#   make start      — run the production server (reads $PORT, defaults 3000)
#   make lint       — ESLint
#   make typecheck  — `tsc --noEmit`
#   make test       — Vitest (single run)
#   make test-watch — Vitest in watch mode
#   make coverage   — Vitest with coverage, gated at 85%
#   make check      — lint + typecheck + test   (run this before pushing)
#   make clean      — remove build artefacts and coverage output

.DEFAULT_GOAL := help
.PHONY: help install dev build start lint typecheck test test-watch coverage check clean ci

help:
	@grep -E '^[a-zA-Z_-]+:.*?##' $(MAKEFILE_LIST) | \
		awk 'BEGIN{FS=":.*?## "}{printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}' || true
	@echo ""
	@echo "Without '##' tags? Run 'make -n <target>' to see the command each one runs."

install: ## Install npm dependencies (uses npm ci when package-lock is clean)
	npm ci || npm install

dev: ## Run the Next.js dev server (hot reload)
	npm run dev

build: ## Production build (./next build)
	npm run build

start: ## Start the production server (default port 3000; override with PORT=8080)
	npx next start --hostname 0.0.0.0 --port $${PORT:-3000}

lint: ## Run ESLint
	npm run lint

typecheck: ## TypeScript type-check (no emit)
	npm run typecheck

test: ## Run Vitest once
	npm test

test-watch: ## Run Vitest in watch mode
	npm run test:watch

coverage: ## Run Vitest with v8 coverage — fails below thresholds in vitest.config.ts
	npm run coverage

check: lint typecheck test ## Lint + typecheck + tests — the pre-push gate

ci: install check coverage ## Full CI pipeline

clean: ## Remove build artefacts and generated coverage reports
	rm -rf .next coverage
