#!/usr/bin/env bash
# dev-start.sh — starts all Kitten Companion services for local development.
# Usage: ./dev-start.sh
# Stop with: ./dev-stop.sh

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
LOG="$ROOT/logs"
mkdir -p "$LOG"

# ── Java 21 (Corretto) ────────────────────────────────────────────────────────
export JAVA_HOME=$(/usr/libexec/java_home -v 21 2>/dev/null)
if [ -z "$JAVA_HOME" ]; then
  echo "ERROR: Java 21 not found. Install Amazon Corretto 21 from https://corretto.aws/"
  exit 1
fi

# ── Shared env ────────────────────────────────────────────────────────────────
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=newcat_dev
export DB_USER=devuser
export DB_PASSWORD=ISbanker@007
export REDIS_HOST=localhost
export REDIS_PORT=6379
export JWT_SECRET=QR9sZT4vA0usfR8dJdpOrslhDZ20TpfcMlbUcQ8f2tv
export JWT_EXPIRY=604800
export ENVIRONMENT=local
export LOG_LEVEL=info
export AWS_REGION=us-east-1

# Triage (concerns) requires Claude. Set your Anthropic key:
# export ANTHROPIC_API_KEY=sk-ant-...
# Without it, POST /concerns returns 500 — all other features still work.

# ── 1. Postgres + Redis ───────────────────────────────────────────────────────
echo ""
echo "▶ Starting Postgres + Redis..."
brew services start postgresql@15 2>/dev/null || true
brew services start redis 2>/dev/null || true
sleep 2

/opt/homebrew/opt/postgresql@15/bin/pg_isready -h localhost -p 5432 -q || {
  echo "ERROR: Postgres not ready."; exit 1
}
redis-cli ping -q >/dev/null || {
  echo "ERROR: Redis not ready."; exit 1
}
echo "  ✓ Postgres and Redis ready"

# ── 2. Auth service (Node.js, port 3001) ─────────────────────────────────────
echo "▶ Starting Auth service (port 3001)..."
cd "$ROOT/services/auth"
npx ts-node --transpile-only src/server.ts > "$LOG/auth.log" 2>&1 &
echo "$!" >> "$ROOT/.dev-pids"

# ── 3. User service (Node.js, port 3002) ─────────────────────────────────────
echo "▶ Starting User service (port 3002)..."
cd "$ROOT/services/user"
npx ts-node --transpile-only src/server.ts > "$LOG/user.log" 2>&1 &
echo "$!" >> "$ROOT/.dev-pids"

# ── 4. Pet service (Spring Boot, port 8080) ───────────────────────────────────
echo "▶ Starting Pet service (port 8080)..."
cd "$ROOT/services/pet"
JWT_SECRET="$JWT_SECRET" \
"$JAVA_HOME/bin/java" -jar target/pet-service-0.1.0-SNAPSHOT.jar \
  --spring.datasource.password="$DB_PASSWORD" \
  > "$LOG/pet.log" 2>&1 &
echo "$!" >> "$ROOT/.dev-pids"

# ── 5. Checkin service (Spring Boot, port 8081) ───────────────────────────────
echo "▶ Starting Checkin service (port 8081)..."
cd "$ROOT/services/checkin"
JWT_SECRET="$JWT_SECRET" \
"$JAVA_HOME/bin/java" -jar target/checkin-service-0.1.0-SNAPSHOT.jar \
  --spring.datasource.password="$DB_PASSWORD" \
  > "$LOG/checkin.log" 2>&1 &
echo "$!" >> "$ROOT/.dev-pids"

# ── 6. Triage service (Spring Boot, port 8082) ────────────────────────────────
echo "▶ Starting Triage service (port 8082)..."
cd "$ROOT/services/triage"
JWT_SECRET="$JWT_SECRET" \
"$JAVA_HOME/bin/java" -jar target/triage-service-0.1.0-SNAPSHOT.jar \
  --spring.datasource.password="$DB_PASSWORD" \
  > "$LOG/triage.log" 2>&1 &
echo "$!" >> "$ROOT/.dev-pids"

# ── 7. Vet-summary service (Spring Boot, port 8083) ───────────────────────────
echo "▶ Starting Vet-Summary service (port 8083)..."
cd "$ROOT/services/vet-summary"
JWT_SECRET="$JWT_SECRET" \
"$JAVA_HOME/bin/java" -jar target/vet-summary-service-0.1.0-SNAPSHOT.jar \
  --spring.datasource.password="$DB_PASSWORD" \
  > "$LOG/vet-summary.log" 2>&1 &
echo "$!" >> "$ROOT/.dev-pids"

# ── 8. Frontend (Next.js, port 3000) ─────────────────────────────────────────
echo "▶ Starting Frontend (port 3000)..."
cd "$ROOT/frontend"
npm run dev > "$LOG/frontend.log" 2>&1 &
echo "$!" >> "$ROOT/.dev-pids"

# ── Wait and health check ─────────────────────────────────────────────────────
echo ""
echo "Waiting for services (30s)..."
sleep 30

check() {
  local name=$1 url=$2
  if curl -sf "$url" >/dev/null 2>&1; then
    echo "  ✓ $name"
  else
    echo "  ✗ $name — NOT ready (check logs/$(echo $name | tr -d ' :').log)"
  fi
}

check "auth     :3001" "http://localhost:3001/health"
check "user     :3002" "http://localhost:3002/health"
check "pet      :8080" "http://localhost:8080/health"
check "checkin  :8081" "http://localhost:8081/health"
check "triage   :8082" "http://localhost:8082/health"
check "vetsumm  :8083" "http://localhost:8083/health"
check "frontend :3000" "http://localhost:3000"

echo ""
echo "═══════════════════════════════════════════════"
echo "  Kitten Companion → http://localhost:3000"
echo ""
echo "  OTP codes appear in logs/auth.log"
echo ""
echo "  NOTE: Concerns (triage) requires ANTHROPIC_API_KEY"
echo "  Set it before starting: export ANTHROPIC_API_KEY=sk-ant-..."
echo ""
echo "  To stop all services: ./dev-stop.sh"
echo "═══════════════════════════════════════════════"

trap 'echo "Stopping all services..."; kill $(cat "$ROOT/.dev-pids" 2>/dev/null | tr "\n" " ") 2>/dev/null; rm -f "$ROOT/.dev-pids"; exit 0' INT TERM
wait
