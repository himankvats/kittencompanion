#!/bin/bash
# infrastructure/scripts/seed.sh
# Seeds the database with test data for local development and integration testing.
# Usage: ./seed.sh <environment>
# Example: ./seed.sh dev
# WARNING: Only run against dev/staging — never against production.

set -e

ENVIRONMENT=${1:-dev}
SEEDS_DIR="$(dirname "$0")/../../database/seeds"

if [[ "$ENVIRONMENT" == "prod" ]]; then
  echo "ERROR: Seeding is not allowed in production."
  exit 1
fi

if [[ ! "$ENVIRONMENT" =~ ^(dev|staging)$ ]]; then
  echo "ERROR: Invalid environment '$ENVIRONMENT'. Must be dev or staging."
  exit 1
fi

echo "Seeding database for environment: $ENVIRONMENT"

# TODO: Load environment-specific credentials (TDD Section 8.2)
if [[ "$ENVIRONMENT" == "dev" ]]; then
  DB_HOST="${DB_HOST:-localhost}"
  DB_PORT="${DB_PORT:-5432}"
  DB_USER="${DB_USER:-devuser}"
  DB_NAME="${DB_NAME:-newcat_dev}"
  export PGPASSWORD="${DB_PASSWORD:-devpassword}"
else
  # TODO: Load from Secrets Manager for staging (TDD Section 9.1)
  echo "ERROR: Staging seed requires Secrets Manager integration (not yet implemented)."
  exit 1
fi

# TODO: Run the seed file
echo "Running seed file: $SEEDS_DIR/test-data.sql"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SEEDS_DIR/test-data.sql"

echo "Seed complete."
