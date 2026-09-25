# AGENTS.md — hyunwoo-dev

에이전트 공용 규칙(Claude Code·Codex 공통). Claude 전용 지시는 `CLAUDE.md` 에 있다.

## 이 저장소는 모노레포다

pnpm workspace + turbo. 앱 3개와 공유 패키지 3개로 구성된다.

| 워크스페이스 | 스택 | 비고 |
|---|---|---|
| `apps/blog` | Next.js (App Router) | chahyunwoo.dev |
| `apps/portfolio` | Next.js (App Router) | 포트폴리오, 3D(three/@react-three) |
| `apps/admin` | Vite + React + TanStack Router | 어드민 SPA |
| `packages/shared` | — | API 클라이언트, ENDPOINTS, 생성 타입, 공용 config/lib |
| `packages/ui` | — | Radix 기반 공용 컴포넌트 |
| `packages/mdx` | — | MDX 렌더러와 커스텀 컴포넌트 |

## 명령

pnpm + turbo, 전부 루트에서 돈다(스크립트는 `package.json`). **npm 이 아니다.**
`pnpm lint` 는 biome `--write`(ESLint 아님), CI 는 `pnpm lint:ci`. API 타입은 `pnpm api:sync && pnpm api:codegen`.

## 콘텐츠는 파일이 아니라 API에서 온다

블로그 글은 저장소의 MDX 파일이 아니라 **별도 백엔드(`chahyunwoo-api`, NestJS)** 에서 가져온다.
`packages/shared/src/api`의 `apiFetch`/`ENDPOINTS`를 쓰고, 본문 MDX는 `packages/mdx`가 렌더한다.

백엔드는 이 저장소에 없다. API 스펙은 `packages/shared/openapi.json`에 커밋해 두고
(`pnpm api:sync`로 받아온다) 거기서 타입을 생성한다.

## FSD (Feature-Sliced Design)

각 앱의 `src/`는 FSD 레이어로 나뉜다. 레이어는 **아래에서 위로만** 의존한다:

```
app → pages → widgets → features → entities → shared
```

- `shared`는 어느 도메인도 몰라야 한다. `shared`가 `entities`를 import하면 위반이다.
- `widgets`는 조합만 한다. 서버 리소스를 직접 부르지 말고 `entities`의 조회 함수를 쓴다.
- 슬라이스 밖으로 나가는 것은 `index.ts`(public API)를 통한다.

이 규칙은 `scripts/verify-fsd.mjs` 가 기계로 검사한다(`.claude/verify.sh` 에 포함, #160).
biome 에는 import 경계 룰이 없다. 리뷰는 검사기가 못 보는 것만 본다.

## 블로그 글

글 작성 가이드(톤·구조·MDX 컴포넌트·메타 필드)는 `.claude/skills/blog-post/SKILL.md`. 글을 쓸 때만 읽는다.

## 포트

블록 `22000` (mac) / `22100` (mini). 자리 규약·전체 표는 `~/.claude/reference/포트-배정.md`.
dev: blog 22000 · admin 22002 · portfolio 22003. 로컬 API 는 api-server 블록의 21801.
`next start`·lighthouse(`.github/lighthouse`)는 기본 3000 그대로다 — dev 만 옮겼다.

## 작업 사이클

전역 표준을 따른다 — **이슈 → `feature/{이슈번호}-{설명}` → conventional commits(**제목은 명사형** — `~한다` 서술형 금지) → PR `Closes #N` → 리뷰 → 병합 → `/handoff`**.
(정본: `~/.claude/rules/git-workflow.md`. Codex 는 전역 규칙을 못 읽으므로 이 저장소의 값을 여기 적어 둔다.)

| | |
|---|---|
| 트래커 | GitHub Issues (`chahyunwoo/hyunwoo-dev`) |
| 분기 기준 | `dev` |
| 승격 경로 | `feature/* → dev → main` |
| 병합 위임 | `feature/* → dev` 위임. **`dev → main` 은 사용자 승인** |
| 리뷰어 | 전역 `code-reviewer` (FSD 레이어 역방향 import 를 리뷰 항목에 포함 — 린터가 못 잡는다) |
| 검증 | `.claude/verify.sh` |
| 푸시 = 배포? | 🔴 **예 — `main` 푸시가 곧 Vercel 배포다.** `dev` 는 배포되지 않는다 |

⚠️ 릴리스 노트는 release-please 가 만든다 — 커밋 타입이 그대로 노트가 되니 형식을 지킨다.
