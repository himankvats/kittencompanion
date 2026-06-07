#!/bin/bash
# infrastructure/scripts/migrate.sh
# Runs all pending database migrations against the target environment's PostgreSQL instance.
# Usage: ./migrate.sh <environment> [region]
# Example: ./migrate.sh dev
#          ./migrate.sh prod us-east-1
# See TDD Section 1.1 for database connection details.
#
# Connection sources by environment:
#   dev   — localhost (or .env / .env.dev), password from DB_PASSWORD
#   prod  — credentials from Secrets Manager (kitten-companion/<env>/db-credentials),
#           RDS host resolved from SSM (/kitten-companion/<env>/rds-host).
#
# Migrations run as the master/owner user (kittenapp in prod) because every
# 001-009 migration GRANTs privileges to lambda_user — which requires ownership.
# The lambda_user role itself is created here (inline SQL) BEFORE the *.sql loop,
# because database/migrations/000_create_role.sh is a shell script using
# docker-style POSTGRES_* env vars and is NOT picked up by the *.sql loop below.

set -e

ENVIRONMENT=${1:-dev}
REGION=${2:-us-east-1}
MIGRATIONS_DIR="$(dirname "$0")/../../database/migrations"

if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
  echo "ERROR: Invalid environment '$ENVIRONMENT'. Must be dev, staging, or prod."
  exit 1
fi

echo "Running migrations for environment: $ENVIRONMENT"

# ------------------------------------------------------------------
# Resolve connection details
# ------------------------------------------------------------------
if [[ "$ENVIRONMENT" == "dev" ]]; then
  # Local development — explicit env vars take precedence, then .env / .env.dev,
  # then docker-compose defaults. (Capture caller-set values before sourcing so
  # `DB_NAME=foo ./migrate.sh dev` isn't clobbered by .env.)
  _ENV_DB_HOST="$DB_HOST"; _ENV_DB_PORT="$DB_PORT"; _ENV_DB_USER="$DB_USER"
  _ENV_DB_NAME="$DB_NAME"; _ENV_DB_PASSWORD="$DB_PASSWORD"

  ENV_FILE=".env.${ENVIRONMENT}"
  if [[ -f ".env" ]]; then
    ENV_FILE=".env"
  fi
  if [[ -f "$ENV_FILE" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$ENV_FILE"
    set +a
  fi
  DB_HOST="${_ENV_DB_HOST:-${DB_HOST:-localhost}}"
  DB_PORT="${_ENV_DB_PORT:-${DB_PORT:-5432}}"
  DB_USER="${_ENV_DB_USER:-${DB_USER:-devuser}}"
  DB_NAME="${_ENV_DB_NAME:-${DB_NAME:-newcat_dev}}"
  export PGPASSWORD="${_ENV_DB_PASSWORD:-${DB_PASSWORD:-devpassword}}"
else
  # staging/prod — pull credentials from Secrets Manager, host from SSM.
  # (Host comes from SSM rather than the secret's "host" field because the
  # secret may hold a placeholder until RDS exists.)
  echo "Resolving credentials from Secrets Manager + SSM..."
  SECRET_ID="kitten-companion/${ENVIRONMENT}/db-credentials"
  SECRET_JSON=$(aws secretsmanager get-secret-value \
    --secret-id "$SECRET_ID" \
    --region "$REGION" \
    --query SecretString --output text)

  if [[ -z "$SECRET_JSON" ]]; then
    echo "ERROR: Could not read secret $SECRET_ID in $REGION."
    exit 1
  fi

  _json_get() { python3 -c "import sys,json; print(json.load(sys.stdin).get('$1',''))"; }

  DB_USER=$(echo "$SECRET_JSON" | _json_get username)
  DB_NAME=$(echo "$SECRET_JSON" | _json_get dbname)
  DB_PORT=$(echo "$SECRET_JSON" | _json_get port)
  DB_PORT="${DB_PORT:-5432}"
  export PGPASSWORD=$(echo "$SECRET_JSON" | _json_get password)

  DB_HOST=$(aws ssm get-parameter \
    --name "/kitten-companion/${ENVIRONMENT}/rds-host" \
    --region "$REGION" \
    --query 'Parameter.Value' --output text)

  if [[ -z "$DB_HOST" || "$DB_HOST" == "None" ]]; then
    echo "ERROR: Could not resolve RDS host from SSM (/kitten-companion/${ENVIRONMENT}/rds-host)."
    echo "       Has the network stack been deployed?"
    exit 1
  fi

  echo "  Host: $DB_HOST  DB: $DB_NAME  User: $DB_USER"
fi

PSQL=(psql -v ON_ERROR_STOP=1 -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME")

# ------------------------------------------------------------------
# Create the lambda_user role (idempotent) — must exist before the GRANTs
# in 001-009. Reuses the master password for lambda_user (matches dev).
# This replaces database/migrations/000_create_role.sh, which the *.sql loop
# below cannot run.
# ------------------------------------------------------------------
echo "Ensuring lambda_user role exists..."
"${PSQL[@]}" <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'lambda_user') THEN
    CREATE ROLE lambda_user WITH LOGIN PASSWORD '${PGPASSWORD}';
  END IF;
END
\$\$;
SQL

# ------------------------------------------------------------------
# Migration tracking table
# ------------------------------------------------------------------
echo "Ensuring schema_migrations table exists..."
"${PSQL[@]}" <<'SQL'
CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(50) PRIMARY KEY,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
SQL

# ------------------------------------------------------------------
# Apply each *.sql migration in order, skipping already-applied versions.
# (000_create_role.sh is intentionally excluded — handled inline above.)
# ------------------------------------------------------------------
echo "Applying migrations from $MIGRATIONS_DIR..."
for migration_file in "$MIGRATIONS_DIR"/*.sql; do
  version=$(basename "$migration_file" .sql)
  applied=$("${PSQL[@]}" -tAc \
    "SELECT COUNT(*) FROM schema_migrations WHERE version = '$version'")

  if [[ "$applied" -eq 0 ]]; then
    echo "  Applying: $version"
    "${PSQL[@]}" -f "$migration_file"
    "${PSQL[@]}" -c "INSERT INTO schema_migrations (version) VALUES ('$version')"
    echo "  Done: $version"
  else
    echo "  Skipping (already applied): $version"
  fi
done

echo "Migrations complete."
