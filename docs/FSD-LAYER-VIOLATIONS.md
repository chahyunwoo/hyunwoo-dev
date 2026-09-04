# FSD 레이어 위반 기록

작성일 2026-08-13. **2026-09-04 기준 아래 4건은 전부 해소됐다** — 아래는 무엇이 왜 위반이었고 어디로 옮겼는지의 기록이다.

| 원래 위치 | 옮긴 곳 | 이유 |
|---|---|---|
| `admin/shared/ui/referrer-pie-chart.tsx` | `admin/entities/analytics/ui/` | analytics 전용 차트였다 |
| `admin/shared/config/referrer-colors.ts` | `admin/entities/analytics/config/` | analytics 카테고리 색상 매핑이었다 |
| `portfolio/shared/hooks/use-skill-orbit-animation.ts` | `portfolio/widgets/skills/` | skills 위젯에서만 쓰는 훅이었다 |
| `portfolio/widgets/pdf-banner/resume-pdf.tsx`의 raw fetch | `entities/portfolio`의 조회 함수 사용 | `getProfile`/`getWorks`/`getSkills`가 이미 있었고 `getEducation`만 없어 추가했다 |

해소 확인 (전부 0이어야 한다):

```bash
grep -rn "from '@/entities" apps/admin/src/shared/       | wc -l   # 0
grep -rn "from '@/entities" apps/portfolio/src/shared/   | wc -l   # 0
grep -rn "@hyunwoo/shared/api" apps/portfolio/src/widgets/ | wc -l # 0
grep -rn "from '@/entities" apps/blog/src/shared/        | wc -l   # 0
```

---

## 원래 기록 (2026-08-13)

재현 명령 (각 항목의 표에 적힌 파일:라인과 대조할 것):

```bash
# admin / portfolio: shared가 entities를 import (단방향 의존 위반)
grep -rn "from '@/entities" apps/admin/src/shared/
grep -rn "from '@/entities" apps/portfolio/src/shared/

# portfolio: widgets가 entities를 우회해 서버 API 직접 호출
grep -rn "@hyunwoo/shared/api" apps/portfolio/src/widgets/
```

2026-09-04 최초 실측 — admin 2건, portfolio 2건(shared→entities 1, widgets 직접호출 1).
문서 작성 시점부터 그때까지 늘지도 줄지도 않았고, 같은 날 전부 해소했다.

이 모노레포(`apps/admin`, `apps/blog`, `apps/portfolio`)에서 발견된 FSD 레이어 위반 사례 채증. 지금 당장 고치지 않지만, 향후 리팩터링 시 참고하려고 기록한다. 기준은 두 가지:
1. **단방향 의존**: 하위 레이어(`shared`, `entities`)는 상위 레이어(`features`, `widgets` 등)를 import해서는 안 된다.
2. **엔드포인트 존재=entities**: 백엔드 API 엔드포인트가 존재하는 도메인 객체는 entities 슬라이스에 있어야 하고, 그 슬라이스가 실제로 API를 호출해야 한다.

## apps/admin

### 단방향 의존 위반 — 2건, 전부 type-only

| 파일:라인 | shared 세그먼트 | import 문 | 대상 |
|---|---|---|---|
| `src/shared/ui/referrer-pie-chart.tsx:2` | ui | `import type { ReferrerCategory, ReferrerSummary } from '@/entities/analytics'` | entities/analytics |
| `src/shared/config/referrer-colors.ts:1` | config | `import type { ReferrerCategory } from '@/entities/analytics'` | entities/analytics |

원인 추정: 차트 컴포넌트와 색상 매핑이 analytics 도메인의 리퍼러 카테고리 타입을 그대로 재사용. 애초에 이 차트가 analytics 전용이라면 `shared`가 아니라 `entities/analytics` 또는 그걸 쓰는 feature에 있었어야 함.

## apps/blog

### 엔드포인트 존재=entities 기준 위반 — 1건

`entities/category` 슬라이스: 백엔드에 `ENDPOINTS.blog.categories`, `ENDPOINTS.blog.tags` 엔드포인트가 명확히 존재하는데, 슬라이스 자체엔 `api/` 폴더가 없고 순수 UI 컴포넌트(`blog-category-navigator.tsx`, `sidebar-tag-cloud.tsx`, `active-link.tsx`)만 있음. 실제 호출(`getCategoriesWithTags`, `getTagCloud`)은 `entities/post/api/post.api.ts`가 대행하고 있음.

원인 추정: category/tag가 post 목록 조회 API 응답에 함께 실려오는 구조라, 별도 엔드포인트 호출을 만들지 않고 post 쪽에 얹은 것으로 보임. 다만 슬라이스 경계상 category 관련 API 로직이 category 슬라이스가 아니라 post 슬라이스에 있는 건 탐색성을 떨어뜨림.

## apps/portfolio

### 단방향 의존 위반 — 1건, type-only

| 파일:라인 | shared 세그먼트 | import 문 | 대상 |
|---|---|---|---|
| `src/shared/hooks/use-skill-orbit-animation.ts:2` | hooks | `import type { SkillItem } from '@/entities/portfolio'` | entities/portfolio |

이 훅은 `widgets/skills/skill-orbit.tsx`에서만 쓰인다 — 범용 훅이 아니라 skills 위젯 전용이라면 애초에 shared가 아니라 widgets나 entities 쪽에 있었어야 함.

### widgets가 entities를 우회해 서버 API 직접 호출 — 1건

`widgets/pdf-banner/resume-pdf.tsx`가 `entities/portfolio/api`를 거치지 않고 `await import('@hyunwoo/shared/api')`로 `ENDPOINTS.portfolio.profile/works/skills/education`을 직접 호출한다. "widgets는 entities/features를 조합만 하고 서버 리소스를 직접 다루지 않는다"는 원칙의 예외.

원인 추정: PDF 생성이라는 특수한 용도(별도 번들/동적 import)라 entities의 일반 쿼리 훅 대신 raw fetch를 직접 쓴 것으로 보임 — 의도적 예외일 가능성이 있으나, 향후 entities/portfolio에 이 데이터를 가져오는 함수를 export해 widgets가 그걸 쓰도록 정리하면 일관성이 생긴다.

## 향후 리팩터링 시 고려사항 (지금 실행하지 않음)

- admin: 차트/색상 매핑을 analytics 전용 위치로 이동 또는 제네릭 타입으로 추상화
- blog: category/tag API를 `entities/category`로 이관하거나, post가 대행하는 구조를 의도적 설계로 문서화
- portfolio: `use-skill-orbit-animation`을 widgets/entities 쪽으로 이동, `resume-pdf.tsx`가 entities의 API 함수를 재사용하도록 정리
