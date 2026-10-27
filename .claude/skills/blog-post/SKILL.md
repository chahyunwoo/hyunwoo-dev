---
name: blog-post
description: chahyunwoo.dev 블로그 글 작성 가이드(톤·구조·MDX 컴포넌트·메타 필드). 블로그 글을 쓰거나 다듬을 때 로드한다.
---

# 블로그 글 작성 가이드

글은 저장소 파일이 아니라 어드민(`apps/admin`)에서 작성해 API 로 저장한다. 본문은 MDX, 렌더는 `packages/mdx`.

## 톤

- 경험 기반. 개인·회사 경험을 자연스럽게 녹인다("저의 경우", "현업에서", "직접").
- 대화체 약간("솔직히", "근데"), 공감 표현("처음에 이거 몰라서 한참 헤맸습니다").
- AI 티 나는 형식적 표현 금지.
- 기본 어미는 "~합니다/~입니다". "~거든요" 정도는 가끔. **요체("~거예요", "~해볼게요") 남발 금지** — 가르치는 느낌이 난다.
- 한 문단 2~3문장. 짧은 문장과 긴 문장을 섞는다. 복잡한 정보는 목록으로.
- 제목은 "~뭔가요?" 보다 "~란", "~하기" 같은 명사형.

## 구조

1. 도입 — 문제/호기심 + 개인 경험
2. 기존 방식의 불편한 점
3. 솔루션 소개 (정의 + 핵심 특징)
4. 사용 방법 (설치 → 설정 → 코드 예제)
5. 심화 (고급 기능, 실무 팁)
6. 마이그레이션 가이드 (전환 추천 글일 때)
7. 정리 (좋은 점 / 고려할 점)
8. 참고 자료 (공식 문서 링크)

## MDX 컴포넌트 (`packages/mdx/src/components`)

```mdx
<Callout type="tip">팁</Callout>          {/* info | success | warning | error | tip | default */}
<Highlight color="blue">기술 개념</Highlight> {/* fuchsia(기본) | blue | green | yellow | red */}
<MdxImage src="https://assets.chahyunwoo.dev/..." alt="설명" caption="설명문" />
```

- Callout 은 섹션당 1~2개, Highlight 는 문단당 1~2개.
- 코드 블록은 `title="경로/파일명.ts"` 를 단다. 라인 하이라이트 `{13-15}` 지원.

## 메타 필드 (어드민 폼 — `apps/admin/src/shared/schemas/post.schema.ts`)

- `title`: 한글, 이모지 없음
- `description`: 핵심 한 문장(25~50자)
- `category`: 영어 (예: Frontend, Programming, Career)
- `tags`: 영어, 구체적 도구·기술명 우선 (React, TypeScript …)
- `thumbnailUrl`: 어드민에서 업로드하면 assets 도메인 URL 이 들어간다. 글마다 필수

썸네일은 웹에서 받아오지 않고 코드로 생성한다(저작권 불명 이미지를 쓰지 않는다).

## 체크리스트

- 개인 경험이 녹아 있는가 / AI 티가 안 나는가
- 코드 예제가 복붙으로 도는가
- Callout·Highlight 가 과하지 않은가
- 썸네일이 있는가 / 좋은 점·고려할 점이 있는가
