@AGENTS.md

## Claude Code 전용

- 진행 상태(다음 할 일·막힘)는 이 파일이 아니라 볼트 `~/dev/data/vault/projects/hyunwoo-dev/현황.md` 에 둔다 — 세션 끝에 `/handoff`.
- FSD 레이어 경계는 `scripts/verify-fsd.mjs` 가 검사한다(`.claude/verify.sh` 가 매 턴 실행). 리뷰는 검사기가 못 보는 것만 본다.
- 커밋 형식·AI 표기 금지는 전역 `~/.claude/rules/git-workflow.md`. 이 레포는 이슈 트래커가 GitHub Issues 다.
