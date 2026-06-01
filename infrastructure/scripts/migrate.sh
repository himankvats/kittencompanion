#!/bin/bash
# infrastructure/scripts/migrate.sh
# Runs all pending database migrations against the target environment's PostgreSQL instance.
# Usage: ./migrate.sh <environment>
# Example: ./migrate.sh dev
# See TDD Section 1.1 for database connection details.

set -e

ENVIRONMENT=${1:-dev}
MIGRATIONS_DIR="$(dirname "$0")/../../database/migrations"

if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
  echo "ERROR: Invalid environment '$ENVIRONMENT'. Must be dev, staging, or prod."
  exit 1
fi

echo "Running migrations for environment: $ENVIRONMENT"

ENV_FILE=".env.${ENVIRONMENT}"
if [[ "$ENVIRONMENT" == "dev" && -f ".env" ]]; then
  ENV_FILE=".env"
fi

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

if [[ "$ENVIRONMENT" == "dev" ]]; then
  DB_HOST="${DB_HOST:-localhost}"
  DB_PORT="${DB_PORT:-5432}"
  DB_USER="${DB_USER:-devuser}"
  DB_NAME="${DB_NAME:-newcat_dev}"
  export PGPASSWORD="${DB_PASSWORD:-devpassword}"
else
  # TODO: Load credentials from AWS Secrets Manager for staging/prod (TDD Section 9.1)
  echo "ERROR: Non-local environments require Secrets Manager integration (TDD Section 9.1). Not yet implemented."
  exit 1
fi

# TODO: Create schema_migrations tracking table if it does not exist
echo "Ensuring schema_migrations table exists..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<'SQL'
CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(50) PRIMARY KEY,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
SQL

# TODO: Apply each migration file in order, skipping already-applied versions
echo "Applying migrations from $MIGRATIONS_DIR..."
for migration_file in "$MIGRATIONS_DIR"/*.sql; do
  version=$(basename "$migration_file" .sql)
  applied=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc \
    "SELECT COUNT(*) FROM schema_migrations WHERE version = '$version'")

  if [[ "$applied" -eq 0 ]]; then
    echo "  Applying: $version"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$migration_file"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c \
      "INSERT INTO schema_migrations (version) VALUES ('$version')"
    echo "  Done: $version"
  else
    echo "  Skipping (already applied): $version"
  fi
done

echo "Migrations complete."
