<div align="center">

# Portfolio | hyunwoo.dev

Interactive portfolio with Three.js, Framer Motion, and custom physics hooks.

[![Live](https://img.shields.io/badge/Live-portfolio.chahyunwoo.dev-000?style=for-the-badge&logo=vercel&logoColor=white)](https://portfolio.chahyunwoo.dev)

</div>

<br />

---

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
      <img src="https://skillicons.dev/icons?i=threejs" width="48" height="48" alt="Three.js" />
      <br /><sub>Three.js</sub>
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=tailwind" width="48" height="48" alt="Tailwind" />
      <br /><sub>Tailwind 4</sub>
    </td>
  </tr>
</table>

| Category | Technologies |
|:---------|:-------------|
| Framework | Next.js 16 (App Router, React Compiler) |
| 3D | Three.js, @react-three/fiber, GLSL shaders |
| Animation | Framer Motion |
| PDF | @react-pdf/renderer (multi-locale ko/en/jp) |
| Styling | Tailwind CSS 4 |
| Shared | @hyunwoo/shared, @hyunwoo/ui, @hyunwoo/mdx |

<br />

## Architecture

FSD (Feature-Sliced Design) 기반 아키텍처.

```
src/
  app/                    App entry, layout, metadata, SEO
  entities/
    portfolio/            API functions, domain types
  shared/
    config/               Constants (locales, cache tags)
    hooks/                Custom interaction hooks
    ui/                   Loading screen, stars canvas, scroll bg
  widgets/
    hero/                 Three.js morphing sphere, magnetic letters
    works/                3D arc carousel, detail panel, MDX viewer
    skills/               Orbital skill visualization
    contact/              Contact form, social links, dawn skyline
    navigation/           Floating glass navbar
    pdf-banner/           PDF resume generator
    posts/                Blog post marquee
```

<br />

## Highlights

### Interactions & Custom Hooks

| Hook | Description |
|:-----|:------------|
| `useMagneticLetter` | 자기장 반발/끌림 물리 시뮬레이션 (rAF + spring) |
| `useSkillOrbitAnimation` | 타원 궤도 애니메이션 + hover pause (rAF + DOM direct) |
| `useScrollVisibility` | rAF 스로틀 스크롤 기반 가시성 |
| `useActiveSection` | IntersectionObserver 활성 섹션 감지 |
| `useClickOutside` | 범용 외부 클릭 감지 |

### Visual Effects

| Feature | Implementation |
|:--------|:---------------|
| Morphing Sphere | GLSL simplex noise + mouse-reactive distortion + 4-corner color mapping |
| Magnetic Letters | Per-letter rAF loop, repel/attract physics, idle floating |
| 3D Arc Carousel | `perspective` + `sin/cos` + `rotateY` transform |
| Scroll Atmosphere | Night-to-dawn gradient transition via rAF |
| Star Field | 120 Canvas particles with scroll-fade + twinkle |

### PDF Resume

`@react-pdf/renderer`로 3개 언어 PDF 실시간 생성 (API fetch + render + download).

- Noto Sans KR/JP CDN 폰트
- 프로필, 경력, 스킬, 학력 섹션
- 다국어 라벨 자동 전환

<br />

## Performance

- Dark mode only (no theme switching overhead)
- `useRef` for high-frequency updates (no React re-renders at 60fps)
- Three.js geometry/material `dispose()` on unmount
- `useMemo` for stable rAF dependencies
- Canvas resize debounce (150ms)
- `cancelAnimationFrame` cleanup on all rAF loops
- `setTimeout` cleanup with `useRef`

<br />

## SEO

- `sitemap.ts`, `robots.ts`
- JSON-LD structured data (WebSite + Person schema)
- Open Graph + Twitter Card with OG image
- Google Search Console verification
- Cache-Control headers (s-maxage=86400)
- DNS prefetch/preconnect

<br />

## Getting Started

```bash
# From monorepo root
pnpm dev:portfolio

# From this directory (port 3001)
pnpm dev
```

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:21801
NEXT_PUBLIC_API_KEY=your-api-key
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-code
```
