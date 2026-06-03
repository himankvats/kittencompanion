#!/usr/bin/env bash
# dev-stop.sh — kills all local dev services started by dev-start.sh
ROOT="$(cd "$(dirname "$0")" && pwd)"

if [ -f "$ROOT/.dev-pids" ]; then
  PIDS=$(cat "$ROOT/.dev-pids")
  echo "Stopping PIDs: $PIDS"
  kill $PIDS 2>/dev/null || true
  rm "$ROOT/.dev-pids"
  echo "Done."
else
  # Fallback: kill by port
  echo "Killing processes on ports 3000-3002, 8080-8083..."
  for PORT in 3000 3001 3002 8080 8081 8082 8083; do
    lsof -ti tcp:$PORT | xargs kill -9 2>/dev/null || true
  done
  echo "Done."
fi
