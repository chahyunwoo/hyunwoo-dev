<div align="center">

<img src="public/images/og-image.png" alt="hyunwoo.dev" width="600" />

<br />
<br />

# 📝 Blog | hyunwoo.dev

*"Write code, share stories."*

[![Live](https://img.shields.io/badge/🔗_Live-chahyunwoo.dev-000?style=for-the-badge&logo=vercel&logoColor=white)](https://chahyunwoo.dev)

</div>

<br />

---

<br />

## ⚡ Tech Stack

<table>
  <tr>
    <td align="center" width="110">
      <img src="https://skillicons.dev/icons?i=nextjs" width="48" height="48" alt="Next.js" />
      <br /><sub>Next.js 16</sub>
    </td>
    <td align="center" width="110">
      <img src="https://skillicons.dev/icons?i=react" width="48" height="48" alt="React" />
      <br /><sub>React 19</sub>
    </td>
    <td align="center" width="110">
      <img src="https://skillicons.dev/icons?i=ts" width="48" height="48" alt="TypeScript" />
      <br /><sub>TypeScript</sub>
    </td>
    <td align="center" width="110">
      <img src="https://skillicons.dev/icons?i=tailwind" width="48" height="48" alt="Tailwind" />
      <br /><sub>Tailwind 4</sub>
    </td>
    <td align="center" width="110">
      <img src="https://skillicons.dev/icons?i=vercel" width="48" height="48" alt="Vercel" />
      <br /><sub>Vercel</sub>
    </td>
  </tr>
</table>

| 분류 | 기술 |
|:---------|:-----|
| 🖥️ Framework | Next.js 16 (App Router, Turbopack) |
| 🗄️ Backend | NestJS (별도 레포, REST API) |
| 📝 Content | MDX via API (next-mdx-remote v6) |
| 🎨 Styling | Tailwind CSS 4, shadcn/ui |
| ✨ Code Highlight | Shiki + rehype-pretty-code |
| 🗂️ State | Zustand |
| 🔍 Search | cmdk (Cmd+K 커맨드 팔레트) |
| 🧪 Testing | Vitest + Testing Library |
| 🔧 Lint & Format | Biome |
| 📦 Package Manager | pnpm |
| 🔍 SEO | sitemap, robots.txt, JSON-LD, Open Graph |
| 🛡️ Security | CodeQL, Dependabot |
| 📊 Quality | Lighthouse CI, release-please |

<br />

## 🏛️ Architecture

FSD (Feature Sliced Design) 기반 아키텍처. 콘텐츠는 NestJS 백엔드 API에서 관리합니다.

```
src/
├── 📂 app/                     # Next.js App Router
│   ├── about/[locale]/         # 다국어 프로필 (ko, en, jp)
│   ├── blog/[slug]/            # 포스트 상세
│   └── api/revalidate/         # On-demand Revalidation
├── 📂 entities/                # 도메인 모델, API, UI
│   ├── post/
│   │   ├── model/              # API 응답 타입
│   │   ├── api/                # 블로그 API 함수
│   │   └── ui/                 # 포스트 카드, TOC, 바디 등
│   ├── about/
│   │   ├── model/              # 포트폴리오 API 타입
│   │   ├── api/                # 포트폴리오 API 함수
│   │   └── ui/                 # 프로필 섹션 컴포넌트
│   └── category/ui/            # 카테고리 네비게이터, 태그 클라우드
├── 📂 features/                # 인터랙티브 기능
│   ├── search/                 # Cmd+K 검색 팔레트
│   ├── navigation/             # 메뉴, 언어 스위치
│   └── theme/                  # 테마 스위치
├── 📂 widgets/                 # 조합 컴포넌트
│   ├── header/                 # 헤더, 푸터
│   └── sidebar/                # 사이드바, 블로그 레이아웃
├── 📂 shared/                  # 블로그 전용 공유 코드
│   ├── config/                 # MENU_ITEMS, THEME_TYPES 등
│   ├── ui/                     # shadcn 컴포넌트
│   │   ├── error/              # 에러/낫파운드 fallback
│   │   └── skeletons/          # 로딩 스켈레톤
│   └── mdx/                    # MDX 커스텀 컴포넌트
├── 📂 stores/                  # Zustand 스토어
└── 📂 providers/               # React 프로바이더
```

> 공통 API, 타입, 유틸은 `@hyunwoo/shared` 패키지에서 제공합니다.

<br />

## ✨ Features

| 기능 | 설명 |
|:------|:-----|
| 📄 MDX Blog | 코드 하이라이팅, GFM, 커스텀 컴포넌트 (Callout, Highlight, MdxImage) |
| 🔍 Search | Cmd+K 커맨드 팔레트, 디바운스, 카테고리별 그룹핑 |
| 🏷️ Categories & Tags | 사이드바 카테고리, 태그 클라우드, 필터링 |
| 📑 Pagination | 포스트 리스트 페이지 단위 탐색 (말줄임 처리) |
| 📖 TOC | PC: 우측 sticky TOC / 모바일: 플로팅 버튼 + 바텀시트 |
| 📊 Reading Progress | 포스트 상단 읽기 진행률 바 |
| 🔗 Related Posts | 태그 기반 연관/추천 포스트 |
| 🌏 Portfolio | 다국어 프로필 (API 기반, ko/en/jp) |
| 🌙 Dark Mode | 시스템 테마 연동 + 수동 전환 (Indigo-Violet 테마) |
| ⚡ Revalidation | 백엔드 CUD 시 캐시 즉시 무효화 (cache tags) |
| 🛡️ Error Handling | 페이지별 error/not-found, 섹션별 에러 표시 |
| 🔍 SEO | sitemap, robots.txt, JSON-LD, Open Graph, canonical URL |
| 📱 Responsive | 모바일 ~ 데스크탑 완벽 대응 |

<br />

## 🔌 API Integration

NestJS 백엔드와 연동. ISR 60초 + cache tags 기반 On-demand Revalidation.

| 분류 | 엔드포인트 |
|:---------|:----------|
| 📝 Blog | posts, posts/:slug, posts/recent, posts/search, posts/:slug/related, categories, tags |
| 💼 Portfolio | profile, experiences, projects, skills, education, locales |
| ⚡ Revalidation | POST /api/revalidate (secret + type + slug) |

<br />

## 🏆 Lighthouse

<div align="center">
  <img src="public/images/lighthouse-score.png" alt="Lighthouse Score" width="600" />
</div>

<br />

| Category | Score |
|:---------|:------|
| 🟢 Performance | **99** |
| 🟢 Accessibility | **95** |
| 🟢 Best Practices | **100** |
| 🟢 SEO | **100** |

<br />

## 🚀 Getting Started

```bash
# 모노레포 루트에서
pnpm dev:blog

# 이 디렉토리에서
pnpm dev
```

### 🔑 Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:21801
NEXT_PUBLIC_API_KEY=your-api-key
REVALIDATE_SECRET=your-revalidate-secret
```

<br />

## 📝 MDX Components

| 컴포넌트 | 용도 |
|:---------|:-----|
| `<Callout>` | 팁, 정보, 경고 박스 (`tip`, `info`, `warning`) |
| `<Highlight>` | 텍스트 강조 (색상 커스텀 지원) |
| `<MdxImage>` | 캡션이 있는 최적화 이미지 |
| `<MdxLink>` | 외부 링크 (새 탭 자동 처리) |
| `<Icon>` | 인라인 아이콘 렌더링 |
| Code Block | 파일명 표시, 라인 하이라이팅 지원 |
