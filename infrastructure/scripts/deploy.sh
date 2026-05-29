#!/bin/bash
# infrastructure/scripts/deploy.sh
# Builds all services and deploys the Kitten Companion stack to AWS via SAM.
# Usage: ./deploy.sh <environment> <region>
# Example: ./deploy.sh dev us-east-1
# See TDD Section 9.2 for full deployment documentation.

set -e

ENVIRONMENT=${1:-dev}
REGION=${2:-us-east-1}

if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
  echo "ERROR: Invalid environment '$ENVIRONMENT'. Must be dev, staging, or prod."
  exit 1
fi

echo "=========================================="
echo "Deploying Kitten Companion"
echo "  Environment : $ENVIRONMENT"
echo "  Region      : $REGION"
echo "=========================================="

# TODO: Step 1 — Run all tests before deploying (TDD Section 7)
echo "[1/6] Running tests..."
# make test-all

# TODO: Step 2 — Build Node.js services (TDD Section 3.1, 3.2)
echo "[2/6] Building Node.js services..."
# cd "$(dirname "$0")/../../services/auth" && npm ci && npm run build && cd -
# cd "$(dirname "$0")/../../services/user" && npm ci && npm run build && cd -
# cd "$(dirname "$0")/../../services/notification" && npm ci && npm run build && cd -

# TODO: Step 3 — Build Java services (TDD Section 3.3–3.5)
echo "[3/6] Building Java services (Maven)..."
# cd "$(dirname "$0")/../../services/pet" && mvn clean package -DskipTests && cd -
# cd "$(dirname "$0")/../../services/checkin" && mvn clean package -DskipTests && cd -
# cd "$(dirname "$0")/../../services/triage" && mvn clean package -DskipTests && cd -
# cd "$(dirname "$0")/../../services/pattern-detection" && mvn clean package -DskipTests && cd -
# cd "$(dirname "$0")/../../services/vet-summary" && mvn clean package -DskipTests && cd -

# TODO: Step 4 — SAM build (TDD Section 9.1)
echo "[4/6] Running SAM build..."
TEMPLATE_DIR="$(dirname "$0")/.."
# sam build --template "$TEMPLATE_DIR/template.yaml" --use-container

# TODO: Step 5 — SAM deploy (TDD Section 9.1)
echo "[5/6] Deploying with SAM..."
# sam deploy \
#   --template-file .aws-sam/build/template.yaml \
#   --stack-name "kittencompanion-$ENVIRONMENT" \
#   --parameter-overrides Environment="$ENVIRONMENT" \
#   --region "$REGION" \
#   --capabilities CAPABILITY_NAMED_IAM \
#   --no-confirm-changeset

# TODO: Step 6 — Run database migrations after deploy (TDD Section 9.2)
echo "[6/6] Running database migrations..."
# "$(dirname "$0")/migrate.sh" "$ENVIRONMENT"

echo ""
echo "Deployment complete!"
echo "  Stack: kittencompanion-$ENVIRONMENT"
echo "  Region: $REGION"
echo ""
# TODO: Print API Gateway endpoint from CloudFormation outputs
