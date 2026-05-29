# Makefile
# Top-level build, test, lint, and deployment commands for Kitten Companion.
# Each target delegates to the relevant service sub-commands.
# See TDD Section 9.2 for deployment documentation.

.PHONY: build-all test-all lint-all deploy-dev deploy-prod \
        build-node build-java help

# Default target
all: help

# ------------------------------------------------------------------
# Build
# ------------------------------------------------------------------

## build-all: Build every service (Node.js + Java)
build-all: build-node build-java
	@echo "[build-all] All services built successfully."

## build-node: Build all Node.js/TypeScript services
build-node:
	@echo "[build-node] Building auth service..."
	cd services/auth && npm ci && npm run build
	@echo "[build-node] Building user service..."
	cd services/user && npm ci && npm run build
	@echo "[build-node] Building notification service..."
	cd services/notification && npm ci && npm run build
	@echo "[build-node] Building frontend..."
	cd frontend && npm ci && npm run build

## build-java: Build all Java/Spring Boot services using Maven
build-java:
	@echo "[build-java] Building pet service..."
	cd services/pet && mvn clean package -DskipTests
	@echo "[build-java] Building checkin service..."
	cd services/checkin && mvn clean package -DskipTests
	@echo "[build-java] Building triage service..."
	cd services/triage && mvn clean package -DskipTests
	@echo "[build-java] Building pattern-detection service..."
	cd services/pattern-detection && mvn clean package -DskipTests
	@echo "[build-java] Building vet-summary service..."
	cd services/vet-summary && mvn clean package -DskipTests

# ------------------------------------------------------------------
# Test
# ------------------------------------------------------------------

## test-all: Run unit and integration tests for every service
test-all:
	@echo "[test-all] Running auth tests..."
	cd services/auth && npm test
	@echo "[test-all] Running user tests..."
	cd services/user && npm test
	@echo "[test-all] Running notification tests..."
	cd services/notification && npm test
	@echo "[test-all] Running pet tests (Java)..."
	cd services/pet && mvn test
	@echo "[test-all] Running checkin tests (Java)..."
	cd services/checkin && mvn test
	@echo "[test-all] Running triage tests (Java)..."
	cd services/triage && mvn test
	@echo "[test-all] Running pattern-detection tests (Java)..."
	cd services/pattern-detection && mvn test
	@echo "[test-all] Running vet-summary tests (Java)..."
	cd services/vet-summary && mvn test
	@echo "[test-all] All tests complete."

# ------------------------------------------------------------------
# Lint
# ------------------------------------------------------------------

## lint-all: Lint all TypeScript and Java source files
lint-all:
	@echo "[lint-all] Linting auth service..."
	cd services/auth && npm run lint
	@echo "[lint-all] Linting user service..."
	cd services/user && npm run lint
	@echo "[lint-all] Linting notification service..."
	cd services/notification && npm run lint
	@echo "[lint-all] Linting frontend..."
	cd frontend && npm run lint
	@echo "[lint-all] Lint complete (Java services rely on Maven checkstyle — run 'mvn checkstyle:check' per service)."

# ------------------------------------------------------------------
# Deploy
# ------------------------------------------------------------------

## deploy-dev: Deploy all services to the dev environment
deploy-dev:
	@echo "[deploy-dev] Deploying to dev environment..."
	# TODO: implement once infrastructure/scripts/deploy.sh exists (TDD Section 9.2)
	bash infrastructure/scripts/deploy.sh dev us-east-1

## deploy-prod: Deploy all services to the production environment
deploy-prod:
	@echo "[deploy-prod] Deploying to production environment..."
	@echo "[deploy-prod] WARNING: This deploys to PRODUCTION. Press Ctrl+C to abort."
	@sleep 5
	# TODO: implement once infrastructure/scripts/deploy.sh exists (TDD Section 9.2)
	bash infrastructure/scripts/deploy.sh prod us-east-1

# ------------------------------------------------------------------
# Help
# ------------------------------------------------------------------

## help: Show available targets
help:
	@echo ""
	@echo "Kitten Companion — Available Make Targets"
	@echo "-----------------------------------------"
	@grep -E '^## ' $(MAKEFILE_LIST) | sed 's/^## /  /'
	@echo ""
