<div align="center">

# hyunwoo.dev

*"Write code, share stories."*

**Dev. Cha Hyunwoo** | Full-Stack Developer

<br />

[![CI](https://github.com/chahyunwoo/hyunwoo-dev/actions/workflows/ci.yml/badge.svg)](https://github.com/chahyunwoo/hyunwoo-dev/actions/workflows/ci.yml)
[![CodeQL](https://github.com/chahyunwoo/hyunwoo-dev/actions/workflows/codeql.yml/badge.svg)](https://github.com/chahyunwoo/hyunwoo-dev/actions/workflows/codeql.yml)
[![Lighthouse](https://github.com/chahyunwoo/hyunwoo-dev/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/chahyunwoo/hyunwoo-dev/actions/workflows/lighthouse.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](./LICENSE)
![Node](https://img.shields.io/badge/Node-20-339933?style=flat-square&logo=node.js&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-10-F69220?style=flat-square&logo=pnpm&logoColor=white)
![Turborepo](https://img.shields.io/badge/Turborepo-EF4444?style=flat-square&logo=turborepo&logoColor=white)

</div>

<br />

---

<br />

## Overview

Turborepo 기반 모노레포. 블로그, 어드민, 포트폴리오를 하나의 저장소에서 관리합니다.

```
apps/
  blog/              Next.js 16 — 기술 블로그 (chahyunwoo.dev)
  admin/             Vite + React — 어드민 대시보드 (admin.chahyunwoo.dev)
  portfolio/         Next.js 16 — 인터랙티브 포트폴리오 (portfolio.chahyunwoo.dev)
packages/
  shared/            공통 API 클라이언트, 타입, 상수, 유틸
  ui/                shadcn/ui 기반 공통 디자인 시스템
  mdx/               공통 MDX 렌더러 및 컴포넌트
```

<br />

## Apps

| App | Stack | Domain | Status |
|:------|:------|:-------|:-------|
| [Blog](apps/blog) | Next.js 16, Tailwind 4, MDX, shadcn/ui | [chahyunwoo.dev](https://chahyunwoo.dev) | ![Live](https://img.shields.io/badge/Live-00C853?style=flat-square) |
| [Admin](apps/admin) | Vite, React 19, TanStack Router/Query/Form | admin.chahyunwoo.dev | ![Live](https://img.shields.io/badge/Live-00C853?style=flat-square) |
| [Portfolio](apps/portfolio) | Next.js 16, Three.js, Framer Motion, @react-pdf/renderer | portfolio.chahyunwoo.dev | ![Live](https://img.shields.io/badge/Live-00C853?style=flat-square) |

<br />

## Tech Stack

<table>
  <tr>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=nextjs" width="48" height="48" alt="Next.js" />
      <br /><sub>Next.js 16</sub>
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=react" width="48" height="48" alt="React" />
      <br /><sub>React 19</sub>
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=ts" width="48" height="48" alt="TypeScript" />
      <br /><sub>TypeScript</sub>
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=tailwind" width="48" height="48" alt="Tailwind" />
      <br /><sub>Tailwind 4</sub>
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=threejs" width="48" height="48" alt="Three.js" />
      <br /><sub>Three.js</sub>
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=vite" width="48" height="48" alt="Vite" />
      <br /><sub>Vite</sub>
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=vercel" width="48" height="48" alt="Vercel" />
      <br /><sub>Vercel</sub>
    </td>
  </tr>
</table>

| Category | Technologies |
|:---------|:-------------|
| Monorepo | Turborepo, pnpm workspaces |
| Backend | NestJS, PostgreSQL, Cloudflare R2 (separate repo) |
| Lint & Format | Biome, Husky, lint-staged |
| CI/CD | GitHub Actions (CI, CodeQL, Lighthouse), Vercel, Release Please |
| Security | CodeQL (weekly scan), Dependabot (weekly updates) |
| SEO | JSON-LD structured data, OG images, sitemap, robots.txt |

<br />

## Architecture

### FSD (Feature-Sliced Design)

```
src/
  app/               App entry, layouts, global providers
  entities/          Business entities (post, portfolio, auth)
  features/          User-facing features (post-form, search)
  widgets/           Composite UI blocks (header, hero, works)
  shared/
    api/             API client
    config/          Constants, environment
    hooks/           Reusable custom hooks
    lib/             Utility functions
    ui/              Base UI components
```

### Shared Packages

| Package | Exports | Description |
|:--------|:--------|:------------|
| `@hyunwoo/shared/api` | `apiFetch`, `ENDPOINTS` | API client with ISR revalidation |
| `@hyunwoo/shared/config` | `BASE_URL`, `CACHE_TAGS`, `API_URL` | Environment config & constants |
| `@hyunwoo/shared/types` | `Post`, `Profile`, `Locale` | Shared TypeScript types |
| `@hyunwoo/shared/lib` | `cn()`, `formatDate()` | Common utilities |
| `@hyunwoo/ui` | shadcn/ui components | Design system (Button, Dialog, Toast, ...) |
| `@hyunwoo/mdx` | `MdxRenderer`, MDX components | Shared MDX renderer & custom components |

<br />

## Portfolio Highlights

인터랙티브 포트폴리오의 주요 구현:

- **Three.js GLSL Morphing Sphere** - 마우스 반응형 노이즈 변형 + 4코너 색변화
- **Magnetic Letter Effect** - 자기장 반발/끌림 물리 + idle 출렁임 (`useMagneticLetter` hook)
- **Orbital Skill Visualization** - rAF 기반 타원 궤도 애니메이션 (`useSkillOrbitAnimation` hook)
- **3D Arc Carousel** - perspective + sin/cos 기반 원형 캐러셀
- **Multi-locale PDF Resume** - `@react-pdf/renderer`로 실시간 PDF 생성 (ko/en/jp)
- **Scroll-driven Atmosphere** - 밤에서 새벽으로 전환되는 rAF 배경 + Canvas 별

<br />

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+

### Installation

```bash
# Clone
git clone https://github.com/chahyunwoo/hyunwoo-dev.git
cd hyunwoo-dev

# Install dependencies
pnpm install

# Environment setup
cp .env.example .env.local
```

### Development

```bash
# Run all apps
pnpm dev

# Run individual apps
pnpm dev:blog        # localhost:22000
pnpm dev:admin       # localhost:22002
pnpm dev:portfolio   # localhost:22003

# Build
pnpm build

# Lint
pnpm lint

# Test
pnpm test:run
```

<br />

## CI/CD Pipeline

```
PR Created
  |
  +-- Biome Lint + Type Check + Build + Test (CI)
  +-- CodeQL Security Analysis
  +-- Lighthouse Audit (Performance, A11y, SEO)
  +-- Vercel Preview Deployment
  |
PR Merged to main
  |
  +-- Vercel Production Deployment (per-app)
  +-- Release Please (auto changelog + version)
```

### Git Hooks (Husky)

| Hook | Action |
|:-----|:-------|
| `pre-commit` | `lint-staged` - Biome check + format on staged files |

<br />

## Deployment

| Service | Platform | Domain |
|:--------|:---------|:-------|
| Blog | Vercel | [chahyunwoo.dev](https://chahyunwoo.dev) |
| Portfolio | Vercel | portfolio.chahyunwoo.dev |
| Admin | Vercel | admin.chahyunwoo.dev |
| API | Mac Mini (self-hosted) | api.chahyunwoo.dev |
| Assets | Cloudflare R2 | assets.chahyunwoo.dev |

<br />

## Contributing

1. [Issues](https://github.com/chahyunwoo/hyunwoo-dev/issues)에서 버그 리포트 또는 기능 요청
2. Fork 후 `feature/*` 브랜치에서 작업
3. PR 제출 시 CI 자동 실행 (Biome lint, type-check, build, test, Lighthouse)

<br />

## Star

이 프로젝트의 소스코드는 MIT 라이선스로 공개되어 있습니다.

코드를 참고하셨다면 **Star**를 눌러주시면 큰 힘이 됩니다!

[![Star this repo](https://img.shields.io/github/stars/chahyunwoo/hyunwoo-dev?style=social)](https://github.com/chahyunwoo/hyunwoo-dev)

<br />

## License

[MIT License](./LICENSE) &copy; 2025-present [Hyunwoo Cha](https://github.com/chahyunwoo)
