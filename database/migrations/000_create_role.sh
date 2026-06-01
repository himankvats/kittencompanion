#!/bin/bash
# Creates the lambda_user role used by all GRANT statements in subsequent migrations.
# Password is read from DB_PASSWORD env var (set in .env.local, passed via docker-compose).
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  DO \$\$
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'lambda_user') THEN
      CREATE ROLE lambda_user WITH LOGIN PASSWORD '${DB_PASSWORD}';
    END IF;
  END
  \$\$;
EOSQL
