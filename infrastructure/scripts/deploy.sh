#!/bin/bash
# infrastructure/scripts/deploy.sh
# Builds all services and deploys the Kitten Companion stack to AWS via SAM.
# Usage: ./deploy.sh <environment> <region> [stage]
#   stage: build | deploy | all   (default: all)
# Examples:
#   ./deploy.sh dev  us-east-1            # build everything + deploy (dev)
#   ./deploy.sh prod us-east-1 build      # build only (run before the approval gate)
#   ./deploy.sh prod us-east-1 deploy     # deploy only (run after approval)
# See TDD Section 9.2 for full deployment documentation.
#
# Build/deploy are split so a CI pipeline can build BEFORE a manual approval gate
# and deploy AFTER it.
#
# Parameter resolution:
#   dev  — relies on infrastructure/samconfig.toml defaults (dev VPC/SG/endpoints).
#   prod — resolves subnets/SG/DbHost/RedisHost from SSM (written by network.yaml)
#          and passes them as --parameter-overrides.

set -e

ENVIRONMENT=${1:-dev}
REGION=${2:-us-east-1}
STAGE=${3:-all}

if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
  echo "ERROR: Invalid environment '$ENVIRONMENT'. Must be dev, staging, or prod."
  exit 1
fi
if [[ ! "$STAGE" =~ ^(build|deploy|all)$ ]]; then
  echo "ERROR: Invalid stage '$STAGE'. Must be build, deploy, or all."
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
INFRA_DIR="$ROOT/infrastructure"
STACK_NAME="kittencompanion-$ENVIRONMENT"

NODE_SERVICES=(auth user notification)
JAVA_SERVICES=(pet checkin triage pattern-detection vet-summary)

echo "=========================================="
echo "Kitten Companion deploy"
echo "  Environment : $ENVIRONMENT"
echo "  Region      : $REGION"
echo "  Stage       : $STAGE"
echo "  Stack       : $STACK_NAME"
echo "=========================================="

# ------------------------------------------------------------------
# Portable JAVA_HOME — prefer an already-set value, then macOS java_home,
# else assume `java` on PATH is 21 (the Jenkins agent default).
# ------------------------------------------------------------------
setup_java() {
  if [[ -n "$JAVA_HOME" && -x "$JAVA_HOME/bin/java" ]]; then
    return
  fi
  if command -v /usr/libexec/java_home >/dev/null 2>&1; then
    local jh
    jh=$(/usr/libexec/java_home -v 21 2>/dev/null || true)
    if [[ -n "$jh" ]]; then
      export JAVA_HOME="$jh"
      return
    fi
  fi
  echo "  (Using java from PATH: $(command -v java || echo 'NOT FOUND'))"
}

build_node() {
  for svc in "${NODE_SERVICES[@]}"; do
    echo "──> Building Node.js service: $svc"
    ( cd "$ROOT/services/$svc" && npm ci && npm run build )
  done
}

build_java() {
  setup_java
  for svc in "${JAVA_SERVICES[@]}"; do
    echo "──> Building Java service: $svc"
    ( cd "$ROOT/services/$svc" && mvn clean package -DskipTests -q )
  done
}

sam_build() {
  echo "──> sam build"
  # No --use-container: the agent has native Node 20 + Corretto 21 + Maven.
  sam build --template "$INFRA_DIR/template.yaml"
}

do_build() {
  build_node
  build_java
  sam_build
}

# ------------------------------------------------------------------
# Resolve prod-only parameter overrides from SSM (written by network.yaml).
# Echoes a single "Key=Value Key=Value ..." string.
# ------------------------------------------------------------------
resolve_prod_overrides() {
  local ssm_get
  ssm_get() {
    aws ssm get-parameter --name "$1" --region "$REGION" \
      --query 'Parameter.Value' --output text
  }
  local sg sn1 sn2 dbhost redishost
  sg=$(ssm_get "/kitten-companion/${ENVIRONMENT}/lambda-sg")
  sn1=$(ssm_get "/kitten-companion/${ENVIRONMENT}/private-subnet-1")
  sn2=$(ssm_get "/kitten-companion/${ENVIRONMENT}/private-subnet-2")
  dbhost=$(ssm_get "/kitten-companion/${ENVIRONMENT}/rds-host")
  redishost=$(ssm_get "/kitten-companion/${ENVIRONMENT}/redis-host")

  for v in "$sg" "$sn1" "$sn2" "$dbhost" "$redishost"; do
    if [[ -z "$v" || "$v" == "None" ]]; then
      echo "ERROR: Missing SSM parameter for $ENVIRONMENT — is the network stack deployed?" >&2
      exit 1
    fi
  done

  echo "Environment=${ENVIRONMENT} LambdaSecurityGroupId=${sg} PrivateSubnet1Id=${sn1} PrivateSubnet2Id=${sn2} DbHost=${dbhost} RedisHost=${redishost}"
}

do_deploy() {
  cd "$INFRA_DIR"
  local deploy_args=(
    --stack-name "$STACK_NAME"
    --region "$REGION"
    --capabilities CAPABILITY_NAMED_IAM
    --resolve-s3
    --force-upload
    --no-confirm-changeset
    --no-fail-on-empty-changeset
  )

  if [[ "$ENVIRONMENT" == "dev" ]]; then
    # Dev relies on samconfig.toml's [default] profile (dev VPC/SG/endpoints).
    echo "──> sam deploy (dev — using samconfig defaults)"
    sam deploy "${deploy_args[@]}"
  else
    echo "──> Resolving $ENVIRONMENT parameters from SSM..."
    local overrides
    overrides=$(resolve_prod_overrides)
    echo "──> sam deploy ($ENVIRONMENT)"
    # shellcheck disable=SC2086
    sam deploy "${deploy_args[@]}" --parameter-overrides $overrides
  fi

  echo ""
  echo "──> API endpoint:"
  aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" \
    --output text
}

# ------------------------------------------------------------------
# Run requested stage(s)
# ------------------------------------------------------------------
case "$STAGE" in
  build)  do_build ;;
  deploy) do_deploy ;;
  all)    do_build; do_deploy ;;
esac

echo ""
echo "Done ($STAGE) for $STACK_NAME in $REGION."
