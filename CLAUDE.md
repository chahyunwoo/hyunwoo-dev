# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

전부 루트에서 turbo로 돈다. **npm이 아니라 pnpm이다.**

```bash
pnpm dev              # 전체
pnpm dev:blog         # 개별 (dev:admin, dev:portfolio)
pnpm build
pnpm lint             # biome check --write  (ESLint 아님)
pnpm lint:ci          # biome check
pnpm typecheck        # 전 워크스페이스 tsc --noEmit
pnpm test:run         # vitest
```

OpenAPI 타입 파이프라인:

```bash
pnpm api:sync         # api-server가 커밋한 openapi.json을 packages/shared/로 복사
pnpm api:codegen      # openapi-typescript로 생성 타입 갱신
```

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

과거 위반 사례와 어디로 옮겼는지는 `docs/FSD-LAYER-VIOLATIONS.md`에 있다.

**이 규칙은 지금 도구로 강제되지 않는다**(biome에 import 경계 룰 없음). 리뷰에서 본다.

## 배포

`main` 푸시가 곧 배포다(Vercel). `dev`는 통합 브랜치이고 배포되지 않는다.
`dev → main`은 승인 없이 하지 않는다.

---

## Blog Post Writing Guidelines (블로그 포스팅 가이드)

이 섹션은 블로그 포스팅 작성 시 참고해야 할 스타일 가이드입니다.

### 글쓰기 톤 & 스타일

#### 기본 원칙
- **경험 기반 글쓰기**: 개인 경험과 회사 경험을 자연스럽게 녹여냄
- **친근한 반말 + 경어체 혼합**: "솔직히", "근데" 같은 대화체 사용
- **독자와의 공감대 형성**: "처음에 이거 몰라서 한참 헤맸습니다" 같은 표현
- **AI 티 나지 않게**: 과도한 형식적 표현 지양, 자연스러운 흐름 유지

#### 자주 사용하는 표현
- 오프닝: "에 대해서 알아보도록 하겠습니다", "이번 글에서는"
- 경험: "저의 경우", "회사에서", "현업에서", "직접"
- 감정: "헤맸습니다", "당황했습니다", "생각이 들었습니다"
- 마무리: "정리하면", "좋은 점 / 고려할 점"

#### 문장 스타일
- 짧은 문장과 긴 문장 혼합으로 리듬감 유지
- 한 문단에 2-3개 문장으로 짧게 유지
- 복잡한 정보는 번호 또는 불릿 리스트로 정리

#### 어미 사용 주의사항
- **요체 남발 금지**: "~거예요", "~해볼게요", "~있어요" 같은 요체를 너무 많이 쓰지 않기
- 요체가 많으면 선생이 학생 가르치는 느낌이 남
- 기본은 "~합니다", "~겁니다", "~입니다" 체를 사용
- 가끔 자연스럽게 "~거든요", "~있거든요" 정도는 OK
- 제목은 "~뭔가요?" 보다 "~란", "~하기" 같은 명사형 선호

### 글 구조 (표준 템플릿)

```
1. 도입 - 문제/호기심 제시 + 개인 경험
2. 문제점/불편한 점 (기존 방식의 문제)
3. 솔루션 소개 (정의 + 핵심 특징)
4. 사용 방법 (설치 → 설정 → 코드 예제)
5. 심화 내용 (고급 기능, 실무 팁)
6. 마이그레이션 가이드 (전환 추천 글의 경우)
7. 정리 (좋은 점 / 고려할 점)
8. 참고 자료 (공식 문서 링크)
```

### MDX 스타일링 가이드

#### Callout 사용법
```mdx
<Callout type="tip">유용한 팁이나 조언</Callout>
<Callout type="info">추가 정보나 참고사항</Callout>
<Callout type="warning">주의사항이나 주의할 점</Callout>
```
- 한 섹션에 1-2개만 사용
- 핵심만 간결하게

#### Highlight 사용법
```mdx
<Highlight>주요 개념 강조</Highlight>
<Highlight color="blue">기술 개념</Highlight>
<Highlight color="fuchsia">핵심 키워드</Highlight>
```
- 한 문단에 1-2개만 사용
- 가장 중요한 키워드만 강조

#### 코드 블록
```mdx
\`\`\`typescript title="경로/파일명.ts"
// 코드 예제
\`\`\`
```
- 파일명(title) 명시
- 라인 하이라이팅 지원: `{13-15, 24-25}`

#### 이미지 사용
```mdx
<MdxImage
  src="/thumbnail/파일명.png"
  alt="설명"
  caption="이미지 설명문"
/>
```

### Frontmatter 구조

```yaml
---
title: "한글 제목"
description: "간단한 설명 (25-50자)"
date: "YYYY-MM-DD"
mainTag: "Frontend" | "Programming" | etc
tags: ["태그1", "태그2"]
thumbnail: /thumbnail/포스트-slug.png
published: true
---
```

#### 필드별 가이드
- **title**: 한글, 이모지 미사용, 명사형 또는 질문형
- **description**: 글의 핵심을 한 문장으로 (매우 간결하게)
- **mainTag**: 영어로 작성 (예: "Frontend", "Programming", "Career")
- **tags**: 영어로 작성, 구체적인 도구명/기술명 우선 (예: ["React", "TypeScript", "Storybook"])
- **thumbnail**: `/thumbnail/` 디렉토리에 저장, 포스트 slug 기반 명명

### 썸네일 이미지

- 포스팅마다 어울리는 썸네일 이미지 필수
- 저장 경로: `public/thumbnail/`
- 파일명: 포스트 slug와 연관 (예: `axios-to-ky-migration.png`)
- 형식: PNG 권장
- 웹에서 적절한 이미지 검색 후 다운로드하여 적용

### 품질 체크리스트

- [ ] 개인 경험이 자연스럽게 녹아들어 있는가?
- [ ] AI가 쓴 티가 나지 않는가?
- [ ] 코드 예제가 복사-붙여넣기 가능한가?
- [ ] Callout/Highlight가 과하지 않은가?
- [ ] 썸네일이 적용되었는가?
- [ ] 좋은 점/고려할 점이 정리되어 있는가?