#!/usr/bin/env bash
set -o pipefail
cd /d/Projects/IronSoul-Anvil/g0-greybox/anvil || exit 1
OUT=/d/Projects/IronSoul-Anvil/g0-greybox/docs/evidence/g0-transcript.txt
mkdir -p "$(dirname "$OUT")"
{
  echo "=== G0 EVIDENCE TRANSCRIPT ==="
  echo "command: pnpm build && pnpm test"
  echo "cwd: $(pwd)"
  echo "date_utc: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "git_head: $(git rev-parse HEAD)"
  echo "git_branch: $(git rev-parse --abbrev-ref HEAD)"
  echo "node: $(node -v)"
  echo "pnpm: $(pnpm -v)"
  echo "=== BEGIN BUILD ==="
  pnpm build
  BUILD_EC=$?
  echo "=== BUILD EXIT: ${BUILD_EC} ==="
  echo "=== BEGIN TEST ==="
  pnpm test
  TEST_EC=$?
  echo "=== TEST EXIT: ${TEST_EC} ==="
  if [ "$BUILD_EC" -ne 0 ] || [ "$TEST_EC" -ne 0 ]; then
    exit 1
  fi
} 2>&1 | tee "$OUT"
exit "${PIPESTATUS[0]}"
