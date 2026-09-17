#!/bin/bash
# Stop 훅 검증 게이트 — 코드를 고친 턴은 이게 exit 0 이어야 끝난다.
# 사람이 "테스트 돌려봤어?"를 묻지 않아도 되게 하는 장치다. 실패하면 우회하지 말고 고쳐라.
set -uo pipefail
cd "$(git rev-parse --show-toplevel)" || exit 0
pnpm -s typecheck 2>&1 | tail -20 || exit 1
pnpm -s lint:ci 2>&1 | tail -20 || exit 1
pnpm -s test:run 2>&1 | tail -30 || exit 1
