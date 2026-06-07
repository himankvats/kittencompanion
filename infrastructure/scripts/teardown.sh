#!/bin/bash
# infrastructure/scripts/teardown.sh
# Tears down a Kitten Companion environment, stack by stack, to stop billing.
# Usage: ./teardown.sh <environment> [region]
# Example: ./teardown.sh prod us-east-1
#
# Unlike the old imperative dev teardown (which used hardcoded resource IDs and
# could NOT delete the VPC/NAT), this is fully stack-based: deleting the
# CloudFormation stacks cleanly removes the VPC, NAT, RDS, Redis, and SQS because
# they are all defined as IaC.
#
# SAFETY:
#   - Requires typed confirmation including the environment name.
#   - RDS is created with DeletionPolicy: Snapshot, so stack deletion takes a
#     FINAL SNAPSHOT automatically (data is recoverable). Dev used
#     --skip-final-snapshot; prod does not.
#   - The Jenkins stack is NOT torn down here (you rarely delete CI with the app).
#     Delete it explicitly: aws cloudformation delete-stack --stack-name kitten-companion-jenkins-<env>

set -e

ENVIRONMENT=${1:?Usage: teardown.sh <environment> [region]}
REGION=${2:-us-east-1}

if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
  echo "ERROR: Invalid environment '$ENVIRONMENT'. Must be dev, staging, or prod."
  exit 1
fi

APP_STACK="kittencompanion-$ENVIRONMENT"
NETWORK_STACK="kitten-companion-network-$ENVIRONMENT"

echo "=========================================="
echo "  Kitten Companion — Teardown"
echo "  Environment : $ENVIRONMENT"
echo "  Region      : $REGION"
echo "  Stacks      : $APP_STACK, $NETWORK_STACK"
echo "=========================================="
echo ""
echo "WARNING: This deletes the application + network stacks for '$ENVIRONMENT',"
echo "including the database (a final RDS snapshot will be taken automatically)."
echo ""
read -r -p "Type 'delete $ENVIRONMENT' to confirm: " CONFIRM
if [[ "$CONFIRM" != "delete $ENVIRONMENT" ]]; then
  echo "Aborted."
  exit 0
fi

delete_stack() {
  local stack=$1
  if aws cloudformation describe-stacks --stack-name "$stack" --region "$REGION" >/dev/null 2>&1; then
    echo "──> Deleting stack: $stack"
    aws cloudformation delete-stack --stack-name "$stack" --region "$REGION"
    echo "    Waiting for deletion to complete (this can take ~15 min for RDS)..."
    aws cloudformation wait stack-delete-complete --stack-name "$stack" --region "$REGION"
    echo "    Deleted: $stack"
  else
    echo "──> Stack not found (skipping): $stack"
  fi
}

# App stack first (Lambdas/API/role depend on nothing in network via CFN, but
# deleting it first avoids ENI/SG-in-use races against the network stack).
delete_stack "$APP_STACK"
# Then the network stack (VPC/NAT/RDS/Redis/SQS).
delete_stack "$NETWORK_STACK"

echo ""
echo "=========================================="
echo "  Teardown complete for '$ENVIRONMENT'."
echo ""
echo "  Note: an RDS final snapshot was created (DeletionPolicy: Snapshot)."
echo "        Delete it manually if you don't need it:"
echo "        aws rds describe-db-snapshots --region $REGION \\"
echo "          --query \"DBSnapshots[?starts_with(DBSnapshotIdentifier, 'kitten-companion-$ENVIRONMENT')].DBSnapshotIdentifier\""
echo ""
echo "  Still present (intentional): Jenkins stack, Secrets Manager entries,"
echo "  SAM artifact S3 bucket. Remove those explicitly if desired."
echo "=========================================="
