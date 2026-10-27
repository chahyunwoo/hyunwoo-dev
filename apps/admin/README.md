<div align="center">

# Admin | hyunwoo.dev

Blog & portfolio content management dashboard.

</div>

<br />

---

<br />

## Tech Stack

<table>
  <tr>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=vite" width="48" height="48" alt="Vite" />
      <br /><sub>Vite</sub>
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
  </tr>
</table>

| Category | Technologies |
|:---------|:-------------|
| Runtime | Vite + React 19 |
| Routing | TanStack Router (file-based) |
| Server State | TanStack Query |
| Form | TanStack Form |
| Table | TanStack Table |
| UI | shadcn/ui (@hyunwoo/ui) |
| HTTP | ky (with JWT refresh interceptor) |
| Shared | @hyunwoo/shared (API, types, utils) |

<br />

## Architecture

FSD (Feature-Sliced Design) 기반 아키텍처.

```
src/
  app.css                 Global styles
  main.tsx                App entry with QueryClient
  routes/                 TanStack Router file-based routes
    __root.tsx             Root layout with auth guard
    login.tsx              Login page
    index.tsx              Dashboard
    posts/                 Post management routes
    portfolio/             Portfolio management routes
  entities/
    auth/                  JWT auth (login, refresh, session timer)
    analytics/             Dashboard analytics
    category/              Blog categories
    portfolio/             Portfolio CRUD (works, skills, education, profile)
    post/                  Blog post CRUD
  features/
    post/                  Post form with thumbnail upload
  pages/                   Page components
  shared/
    api/                   ky client with 401 refresh interceptor
    config/                Constants, query keys, locale tabs
    lib/                   Icon mapper, error handler
    ui/                    Admin UI components (inputs, file upload, nav)
```

<br />

## Features

| Feature | Description |
|:--------|:------------|
| Auth | JWT access/refresh token rotation, auto session timer |
| Posts | CRUD, thumbnail upload (avif/webp/png/jpg), MDX preview |
| Portfolio Works | CRUD, multi-locale content (ko/en/jp), tech stack, MDX |
| Portfolio Career | Experiences, projects, education (multi-locale) |
| Portfolio Settings | Profile, social links, image/icon upload |
| Skills | Category-based skill management with proficiency |
| Dashboard | Analytics overview |

<br />

## Security

- JWT authentication with automatic refresh
- Session timer with extend capability
- Non-authenticated users see nothing (return null + redirect)
- `robots.txt` Disallow all + `<meta name="robots" content="noindex, nofollow">`
- CORS restricted to allowed origins

<br />

## Getting Started

```bash
# From monorepo root
pnpm dev:admin

# From this directory (port 22002)
pnpm dev
```

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:21801
NEXT_PUBLIC_API_KEY=your-api-key
```
